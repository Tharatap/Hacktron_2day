import React, { useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useApp } from '../state/AppContext';
import { distanceM } from '../lib/formulas';
import { createPinnedRoute, pathDistanceM } from '../lib/routeRewards';
import { fetchPedestrianRoute } from '../lib/pedestrianRouting';
import type { LatLng } from '../types';

function pinIcon(index: number, total: number) {
  const label = index === 0 ? 'S' : index === total - 1 ? 'F' : String(index + 1);
  return L.divIcon({
    className: '',
    html: `<div class="route-builder-pin${index === 0 ? ' is-start' : index === total - 1 ? ' is-finish' : ''}">${label}</div>`,
    iconSize: [38, 44], iconAnchor: [19, 42],
  });
}

function MapEvents({ onPin, onCenter }: { onPin: (point: LatLng) => void; onCenter: (point: LatLng) => void }) {
  useMapEvents({
    click: (event) => onPin({ lat: event.latlng.lat, lng: event.latlng.lng }),
    moveend: (event) => {
      const center = event.target.getCenter();
      onCenter({ lat: center.lat, lng: center.lng });
    },
  });
  return null;
}

function Recenter({ position }: { position: LatLng }) {
  const map = useMap();
  React.useEffect(() => { map.flyTo(position, 16, { animate: true, duration: 0.5 }); }, [map, position]);
  return null;
}

export function RoutePinPlanner({ onClose, onCreated }: { onClose: () => void; onCreated: (routeId: string) => void }) {
  const { state, dispatch } = useApp();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const homeCenter = state.zones.find((zone) => zone.id === state.user.homeZoneId)?.center ?? { lat: 13.286, lng: 100.914 };
  const initialCenter = state.gps.lastPosition ?? homeCenter;
  const [pins, setPins] = useState<LatLng[]>([]);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [focusPoint, setFocusPoint] = useState(initialCenter);
  const [name, setName] = useState('เส้นทางล่ารางวัลของฉัน');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [routedPath, setRoutedPath] = useState<LatLng[]>([]);
  const [routeStatus, setRouteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [routeError, setRouteError] = useState('');
  const [routeRevision, setRouteRevision] = useState(0);
  const displayPath = routedPath.length > 1 ? routedPath : pins;
  const totalM = pathDistanceM(routedPath);
  const valid = routeStatus === 'ready' && totalM >= 100;

  React.useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  React.useEffect(() => {
    if (pins.length < 2) {
      setRoutedPath([]);
      setRouteStatus('idle');
      setRouteError('');
      return;
    }
    const controller = new AbortController();
    setRoutedPath([]);
    setRouteStatus('loading');
    setRouteError('');
    let requestTimeout = 0;
    const timer = window.setTimeout(() => {
      requestTimeout = window.setTimeout(() => {
        setRouteStatus('error');
        setRouteError('บริการหาเส้นทางใช้เวลานานเกินไป ลองใหม่อีกครั้ง');
        controller.abort();
      }, 15_000);
      void fetchPedestrianRoute(pins, controller.signal)
        .then((path) => {
          window.clearTimeout(requestTimeout);
          setRoutedPath(path);
          setRouteStatus('ready');
        })
        .catch((error: unknown) => {
          window.clearTimeout(requestTimeout);
          if (controller.signal.aborted) return;
          setRoutedPath([]);
          setRouteStatus('error');
          setRouteError(error instanceof Error ? error.message : 'หาเส้นทางที่เดินได้ไม่สำเร็จ');
        });
    }, 650);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(requestTimeout);
      controller.abort();
    };
  }, [pins, routeRevision]);

  const preview = useMemo(() => {
    if (!valid) return null;
    return createPinnedRoute({ id: 'preview', name, zoneId: state.user.homeZoneId, ownerId: state.user.id, path: routedPath, seed: 42 });
  }, [name, routedPath, state.user.homeZoneId, state.user.id, valid]);

  const addPin = (point: LatLng) => {
    setPins((current) => current.length >= 10 ? current : [...current, point]);
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('อุปกรณ์นี้ไม่รองรับตำแหน่ง');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition((position) => {
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      setFocusPoint(point);
      setMapCenter(point);
      setPins((current) => current.length === 0 ? [point] : current);
      setLocating(false);
    }, () => {
      setLocationError('ยังอ่านตำแหน่งไม่ได้ เปิด Location แล้วลองอีกครั้ง');
      setLocating(false);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 12_000 });
  };

  const save = () => {
    if (!valid) return;
    const first = routedPath[0];
    const nearestZone = [...state.zones].sort((a, b) => distanceM(first, a.center) - distanceM(first, b.center))[0];
    const id = `custom-${Date.now()}`;
    const route = createPinnedRoute({ id, name, zoneId: nearestZone?.id ?? state.user.homeZoneId, ownerId: state.user.id, path: routedPath });
    dispatch({ type: 'ADD_CUSTOM_ROUTE', route });
    onCreated(route.id);
  };

  const rewardCount = preview?.checkpoints.filter((point) => point.kind === 'coin').length ?? 0;
  const chestCount = preview?.checkpoints.filter((point) => point.kind === 'chest').length ?? 0;

  return (
    <div ref={dialogRef} className="fixed inset-y-0 left-1/2 z-[900] flex w-full max-w-md -translate-x-1/2 flex-col bg-paper" role="dialog" aria-modal="true" aria-labelledby="route-builder-title">
      <header className="pt-safe flex items-center gap-3 border-b-2 border-ink bg-paper p-3">
        <button ref={closeRef} onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-white" aria-label="ปิดหน้าสร้างเส้นทาง"><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
        <div><h2 id="route-builder-title" className="font-headline-md text-xl">ปักหมุดเส้นทาง</h2><p className="text-xs text-ink-soft">แตะแผนที่เรียงจากจุดเริ่มไปจุดหมาย</p></div>
      </header>

      <div className="relative min-h-0 flex-1 border-b-2 border-ink">
        <MapContainer center={initialCenter} zoom={15} zoomControl={false} attributionControl={false} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents onPin={addPin} onCenter={setMapCenter} />
          <Recenter position={focusPoint} />
          {displayPath.length > 1 && <Polyline smoothFactor={1.2} positions={displayPath.map((point) => [point.lat, point.lng] as [number, number])} pathOptions={{ color: routeStatus === 'ready' ? '#087A49' : '#5C6F63', weight: routeStatus === 'ready' ? 7 : 4, dashArray: routeStatus === 'ready' ? undefined : '7 8', lineCap: 'round', lineJoin: 'round' }} />}
          {pins.map((point, index) => <Marker key={`${point.lat}-${point.lng}-${index}`} position={point} icon={pinIcon(index, pins.length)} />)}
        </MapContainer>
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-1/2 text-3xl text-ink/55" aria-hidden="true">+</div>
        <div className="absolute inset-x-3 bottom-3 z-[500] grid grid-cols-2 gap-2">
          <button onClick={useMyLocation} disabled={locating} className="min-h-11 rounded-full border-2 border-ink bg-white px-3 font-label-md hard-shadow-sm"><span className="material-symbols-outlined mr-1 align-middle text-lg" aria-hidden="true">my_location</span>{locating ? 'กำลังหา…' : 'ตำแหน่งฉัน'}</button>
          <button onClick={() => addPin(mapCenter)} disabled={pins.length >= 10} className="min-h-11 rounded-full border-2 border-ink bg-lemon px-3 font-label-md hard-shadow-sm"><span className="material-symbols-outlined mr-1 align-middle text-lg" aria-hidden="true">add_location</span>ปักกลางแผนที่</button>
        </div>
      </div>

      <section className="space-y-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]" aria-label="รายละเอียดเส้นทาง">
        <div className="flex items-center justify-between text-sm"><strong>{pins.length} หมุด · {(totalM / 1000).toFixed(2)} กม.</strong><span className="text-ink-soft">เหรียญ {rewardCount} · กล่อง {chestCount}</span></div>
        <div className={`flex min-h-9 items-center gap-2 rounded-lg border-2 border-ink px-3 text-xs font-label-md ${routeStatus === 'ready' ? 'bg-[#DFF7E7]' : routeStatus === 'error' ? 'bg-[#FFD7D2]' : 'bg-[#FFF2B8]'}`} role="status" aria-live="polite">
          <span className={`material-symbols-outlined text-lg ${routeStatus === 'loading' ? 'animate-pulse' : ''}`} aria-hidden="true">{routeStatus === 'ready' ? 'route' : routeStatus === 'error' ? 'wrong_location' : 'conversion_path'}</span>
          <span className="flex-1">{routeStatus === 'ready' ? 'เส้นทางเดินจริงพร้อมแล้ว' : routeStatus === 'loading' ? 'กำลังหาเส้นทางที่เดินได้…' : routeStatus === 'error' ? routeError : 'ปักอย่างน้อย 2 จุดเพื่อหาเส้นทาง'}</span>
          {routeStatus === 'error' && <button onClick={() => setRouteRevision((value) => value + 1)} className="underline underline-offset-2">ลองใหม่</button>}
        </div>
        <label htmlFor="custom-route-name" className="sr-only">ชื่อเส้นทาง</label>
        <input id="custom-route-name" value={name} maxLength={45} onChange={(event) => setName(event.target.value)} className="min-h-11 w-full rounded-xl border-2 border-ink bg-white px-3" placeholder="ชื่อเส้นทาง" />
        {(locationError || (!valid && pins.length >= 2)) && <p role="status" className="text-xs font-label-md text-[#8A211A]">{locationError || 'เส้นทางต้องยาวอย่างน้อย 100 เมตร'}</p>}
        <div className="grid grid-cols-[44px_44px_1fr] gap-2">
          <button onClick={() => setPins((current) => current.slice(0, -1))} disabled={pins.length === 0 || routeStatus === 'loading'} className="grid min-h-11 place-items-center rounded-xl border-2 border-ink bg-white disabled:opacity-40" aria-label="ย้อนกลับหนึ่งหมุด"><span className="material-symbols-outlined" aria-hidden="true">undo</span></button>
          <button onClick={() => setPins([])} disabled={pins.length === 0 || routeStatus === 'loading'} className="grid min-h-11 place-items-center rounded-xl border-2 border-ink bg-white disabled:opacity-40" aria-label="ล้างหมุดทั้งหมด"><span className="material-symbols-outlined" aria-hidden="true">delete_sweep</span></button>
          <button onClick={save} disabled={!valid} className="min-h-12 rounded-full border-2 border-ink bg-grass text-white hard-shadow disabled:bg-[#A9B8AE] disabled:shadow-none font-headline-md text-base">สร้างเส้นทางและสุ่มรางวัล</button>
        </div>
        <p className="text-[11px] leading-relaxed text-ink-soft">ระบบหาเส้นทางคนเดินจากข้อมูล OpenStreetMap และวางรางวัลบนทางที่คำนวณแล้ว กล่องจะสุ่มเผยจำนวนเหรียญเมื่อคุณเข้าใกล้</p>
      </section>
    </div>
  );
}
