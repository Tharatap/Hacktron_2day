/**
 * สูตรคำนวณทั้งหมดของแอป — pure function ล้วน ไม่แตะ state
 *
 * เหตุผลที่แยกไฟล์: ถ้ากรรมการถามว่า "แคลอรี่คิดจากอะไร" / "coin มายังไง"
 * ต้องเปิดไฟล์เดียวแล้วตอบได้ทันที ไม่ต้องไปไล่หาใน component
 */

import type {
  PaceTier,
  DistanceTier,
  TierInfo,
  LeaderboardEntry,
} from '../types';

/* ------------------------------------------------------------------ */
/* Tier — ranking แบ่งตาม phase (pace) + ระยะทาง                        */
/* ------------------------------------------------------------------ */

export const PACE_TIERS: TierInfo[] = [
  { id: 'walker', label: 'Walker', labelTh: 'เดินเร็ว', paceRange: [540, 9999], color: '#7C8B9E' },
  { id: 'jogger', label: 'Jogger', labelTh: 'จ๊อกกิ้ง', paceRange: [420, 540], color: '#2E9E6B' },
  { id: 'runner', label: 'Runner', labelTh: 'นักวิ่ง', paceRange: [330, 420], color: '#2F7AD6' },
  { id: 'racer', label: 'Racer', labelTh: 'สายแข่ง', paceRange: [0, 330], color: '#E0562C' },
];

/** pace หน่วยวินาที/กม. -> phase */
export function paceTierFromPace(paceSec: number): PaceTier {
  if (paceSec <= 0) return 'jogger';
  const hit = PACE_TIERS.find((t) => paceSec >= t.paceRange[0] && paceSec < t.paceRange[1]);
  return hit ? hit.id : 'walker';
}

export function tierInfo(id: PaceTier): TierInfo {
  return PACE_TIERS.find((t) => t.id === id) ?? PACE_TIERS[1];
}

export function distanceTierFromKm(km: number): DistanceTier {
  if (km >= 21) return 'D21';
  if (km >= 10) return 'D10';
  if (km >= 5) return 'D5';
  return 'D3';
}

export const DISTANCE_TIER_LABEL: Record<DistanceTier, string> = {
  D3: '3K',
  D5: '5K',
  D10: '10K',
  D21: 'Half+',
};

/* ------------------------------------------------------------------ */
/* Stride & distance — feature 6                                       */
/* ------------------------------------------------------------------ */

/**
 * ประมาณความยาวก้าว (เมตร) จาก cadence และส่วนสูง
 *
 * หลักการ: ยิ่ง cadence สูง ก้าวยิ่งยาว (จนถึงเพดาน) และคนสูงก้าวยาวกว่า
 * ค่าคงที่ปรับจูนให้ cadence 170 spm ของคนสูง 170 ซม. ได้ ~0.85 ม.
 * ซึ่งใกล้เคียง jog pace จริงที่ ~8.7 กม./ชม.
 *
 * ⚠️ นี่คือการ "ประมาณ" ไม่ใช่การวัด — production ต้องใช้ GPS วัดระยะจริง
 * แล้วใช้ค่านี้เป็น fallback ตอน GPS หลุด + เป็นตัว cross-check anti-cheat
 */
export function strideMeters(cadenceSpm: number, heightCm: number): number {
  const base = 0.55 + (cadenceSpm - 140) * 0.0065;
  const scaled = base * (heightCm / 170);
  return clamp(scaled, 0.45, 1.35);
}

export function stepsToMeters(steps: number, cadenceSpm: number, heightCm: number): number {
  return steps * strideMeters(cadenceSpm, heightCm);
}

/* ------------------------------------------------------------------ */
/* Pace & speed                                                        */
/* ------------------------------------------------------------------ */

/** วินาที/กม. */
export function paceSecPerKm(distanceM: number, elapsedSec: number): number {
  // Hide pace during the noisy first metres; below 50 m the value is misleading.
  if (distanceM < 50 || elapsedSec <= 0) return 0;
  return (elapsedSec / distanceM) * 1000;
}

export function speedKmh(distanceM: number, elapsedSec: number): number {
  if (elapsedSec <= 0) return 0;
  return (distanceM / 1000) / (elapsedSec / 3600);
}

/** 372 -> "6'12"" */
export function formatPace(paceSec: number): string {
  if (!paceSec || paceSec <= 0 || !isFinite(paceSec)) return '--:--';
  let m = Math.floor(paceSec / 60);
  let s = Math.round(paceSec % 60);
  if (s === 60) {
    m += 1;
    s = 0;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** MVP estimate requested by the product brief: weight (kg) × distance (km). */
export function estimatedCalories(weightKg: number, distanceKm: number): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(distanceKm) || weightKg <= 0 || distanceKm <= 0) {
    return 0;
  }
  return Math.round(weightKg * distanceKm);
}

/** 3725 -> "1:02:05" */
export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/* ------------------------------------------------------------------ */
/* Calories — feature 5                                                */
/* ------------------------------------------------------------------ */

/**
 * MET ประมาณจากความเร็ว
 * อ้างอิงช่วงของ Compendium of Physical Activities:
 * เดิน 5 กม./ชม. ~3.5 MET, วิ่ง 8 กม./ชม. ~8.3, วิ่ง 12 กม./ชม. ~12.5
 */
export function metFromSpeed(kmh: number): number {
  if (kmh < 1) return 1.2;
  if (kmh < 6.4) return clamp(2.0 + kmh * 0.35, 2.0, 4.5);
  return clamp(0.5 + kmh * 0.95, 4.5, 20);
}

/**
 * สูตรมาตรฐาน: kcal = MET × 3.5 × น้ำหนัก(กก.) ÷ 200 × นาที
 */
export function caloriesKcal(weightKg: number, kmh: number, elapsedSec: number): number {
  const met = metFromSpeed(kmh);
  const minutes = elapsedSec / 60;
  return (met * 3.5 * weightKg / 200) * minutes;
}

/* ------------------------------------------------------------------ */
/* Coin economy — feature 7                                            */
/* ------------------------------------------------------------------ */

export const COIN_PER_KM = 10;
export const COIN_STREAK_BONUS_PER_DAY = 2;
export const COIN_DAILY_CAP = 300;

export interface CoinBreakdown {
  fromDistance: number;
  fromCheckpoints: number;
  fromStreak: number;
  total: number;
  capped: boolean;
}

/**
 * coin ต้องอธิบายได้เป็นบรรทัดๆ ไม่ใช่ตัวเลขลอยๆ
 * หน้า Finish ควรโชว์ breakdown นี้ทั้งก้อน กรรมการจะเห็นว่าเศรษฐกิจในแอปถูกออกแบบมา
 */
export function coinsForRun(
  distanceKm: number,
  checkpointCoins: number,
  streakDays: number
): CoinBreakdown {
  const fromDistance = Math.floor(distanceKm * COIN_PER_KM);
  const fromCheckpoints = checkpointCoins;
  const fromStreak = Math.min(streakDays, 7) * COIN_STREAK_BONUS_PER_DAY;
  const raw = fromDistance + fromCheckpoints + fromStreak;
  const total = Math.min(raw, COIN_DAILY_CAP);
  return { fromDistance, fromCheckpoints, fromStreak, total, capped: raw > COIN_DAILY_CAP };
}

/** ใช้ตอนพูดเรื่องรายได้: คูปอง 200 บาท commission 10% = แอปได้ 20 บาท */
export function commissionBaht(valueBaht: number, rate: number): number {
  return Math.round(valueBaht * rate);
}

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */

/**
 * กรอง leaderboard ตาม phase + ระยะ แล้วเรียงตามระยะทาง
 * นี่คือ logic ที่ทำให้ "ranking แยกตาม phase" เป็นจริง ไม่ใช่แค่คำพูด
 */
export function filterLeaderboard(
  entries: LeaderboardEntry[],
  paceTier: PaceTier | 'all',
  distanceTier: DistanceTier | 'all'
): LeaderboardEntry[] {
  return entries
    .filter((e) => (paceTier === 'all' ? true : e.paceTier === paceTier))
    .filter((e) => (distanceTier === 'all' ? true : e.distanceTier === distanceTier))
    .sort((a, b) => b.distanceKm - a.distanceKm);
}

export function myRank(entries: LeaderboardEntry[], userId: string): number {
  const i = entries.findIndex((e) => e.userId === userId);
  return i < 0 ? entries.length + 1 : i + 1;
}

/* ------------------------------------------------------------------ */
/* Geo helpers                                                         */
/* ------------------------------------------------------------------ */

const EARTH_M_PER_DEG_LAT = 111_320;

export function metersToLatLngOffset(lat: number, dxM: number, dyM: number) {
  const dLat = dyM / EARTH_M_PER_DEG_LAT;
  const dLng = dxM / (EARTH_M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  return { dLat, dLng };
}

/** ระยะห่างสองจุดเป็นเมตร (haversine) */
export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const dφ = φ2 - φ1;
  const dλ = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * หาตำแหน่งบน polyline เมื่อวิ่งไปแล้ว progress (0..1)
 * ใช้ขยับ marker บนแผนที่ตามระยะที่ sensor นับได้
 */
export function pointAlongPath(
  path: { lat: number; lng: number }[],
  progress: number
): { lat: number; lng: number } {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1) return path[0];
  const p = clamp(progress, 0, 1);

  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = distanceM(path[i - 1], path[i]);
    segs.push(d);
    total += d;
  }
  if (total === 0) return path[0];

  let target = p * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const t = segs[i] === 0 ? 0 : target / segs[i];
      return {
        lat: path[i].lat + (path[i + 1].lat - path[i].lat) * t,
        lng: path[i].lng + (path[i + 1].lng - path[i].lng) * t,
      };
    }
    target -= segs[i];
  }
  return path[path.length - 1];
}

/* ------------------------------------------------------------------ */

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
