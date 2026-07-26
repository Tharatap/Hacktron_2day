import type { LatLng } from '../types';
import { distanceM } from './formulas';

const VALHALLA_ROUTE_URL = 'https://valhalla1.openstreetmap.de/route';

export function decodePolyline6(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  const decodeValue = () => {
    let result = 0;
    let shift = 0;
    let byte = 0;
    do {
      if (index >= encoded.length) throw new Error('Invalid route geometry');
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return (result & 1) ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    latitude += decodeValue();
    longitude += decodeValue();
    points.push({ lat: latitude / 1_000_000, lng: longitude / 1_000_000 });
  }
  return points;
}

interface ValhallaResponse {
  trip?: {
    status?: number;
    status_message?: string;
    legs?: Array<{ shape?: string }>;
  };
  error?: string;
  error_code?: number;
}

export async function fetchPedestrianRoute(pins: LatLng[], signal?: AbortSignal): Promise<LatLng[]> {
  if (pins.length < 2) throw new Error('ต้องมีอย่างน้อย 2 หมุด');
  const payload = {
    locations: pins.map((point, index) => ({
      lat: point.lat,
      lon: point.lng,
      type: index === 0 || index === pins.length - 1 ? 'break' : 'through',
      radius: 35,
    })),
    costing: 'pedestrian',
    costing_options: {
      pedestrian: {
        walking_speed: 8,
        walkway_factor: 0.8,
        alley_factor: 2.5,
        driveway_factor: 5,
        max_hiking_difficulty: 1,
      },
    },
    directions_options: { units: 'kilometers', narrative: false },
  };
  const response = await fetch(`${VALHALLA_ROUTE_URL}?json=${encodeURIComponent(JSON.stringify(payload))}`, {
    signal,
    headers: { 'X-Client-Id': 'runtown-hackathon' },
  });
  const data = await response.json() as ValhallaResponse;
  if (!response.ok || data.trip?.status !== 0) {
    throw new Error(data.error || data.trip?.status_message || 'ไม่พบเส้นทางที่เดินได้');
  }
  const path = (data.trip.legs ?? []).flatMap((leg, index) => {
    if (!leg.shape) return [];
    const decoded = decodePolyline6(leg.shape);
    return index === 0 ? decoded : decoded.slice(1);
  });
  if (path.length < 2) throw new Error('บริการไม่ส่งเส้นทางกลับมา');
  const distantPin = pins.findIndex((pin) => Math.min(...path.map((point) => distanceM(pin, point))) > 80);
  if (distantPin >= 0) {
    throw new Error(`หมุดที่ ${distantPin + 1} อยู่ห่างจากทางเดินมากเกินไป กรุณาปักใกล้ถนน`);
  }
  return path;
}
