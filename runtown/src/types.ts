/**
 * RunTown — Type contract กลางของทั้งแอป
 *
 * ทุกหน้า UI ต้อง import type จากไฟล์นี้เท่านั้น ห้ามประกาศ shape ซ้ำในหน้าใดหน้าหนึ่ง
 * ถ้าจะเพิ่ม field ให้เพิ่มที่นี่ที่เดียว
 */

/* ------------------------------------------------------------------ */
/* Geo                                                                 */
/* ------------------------------------------------------------------ */

export interface LatLng {
  lat: number;
  lng: number;
}

/* ------------------------------------------------------------------ */
/* Ranking — จุดขายหลัก: แบ่ง ranking ตาม "phase (pace)" + "ระยะทาง"    */
/* ทำให้มือใหม่ไม่ต้องไปแข่งกับนักวิ่งอาชีพ = inclusive                  */
/* ------------------------------------------------------------------ */

/** phase การวิ่ง แบ่งตาม pace (วินาที/กม.) */
export type PaceTier = 'walker' | 'jogger' | 'runner' | 'racer';

/** ระดับระยะทางที่ลงแข่ง */
export type DistanceTier = 'D3' | 'D5' | 'D10' | 'D21';

export interface TierInfo {
  id: PaceTier;
  label: string;
  labelTh: string;
  /** ช่วง pace เป็นวินาที/กม. [min, max] */
  paceRange: [number, number];
  color: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  distanceKm: number;
  /** pace เฉลี่ย หน่วยวินาที/กม. */
  paceSec: number;
  paceTier: PaceTier;
  distanceTier: DistanceTier;
  runsThisWeek: number;
  isMe?: boolean;
}

/* ------------------------------------------------------------------ */
/* Zone — พื้นที่วิ่งที่แนะนำ (scope: ชลบุรี)                            */
/* ------------------------------------------------------------------ */

export type Surface = 'road' | 'trail' | 'track' | 'beach' | 'mixed';

export interface Zone {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  center: LatLng;
  /** รัศมีของโซนเป็นเมตร ใช้วาดวงบนแผนที่ */
  radiusM: number;
  surface: Surface;
  /** 1 = ง่ายมาก, 5 = โหด */
  difficulty: 1 | 2 | 3 | 4 | 5;
  loopDistanceKm: number;
  /** คนที่กำลังวิ่งอยู่ตอนนี้ — ตัวเลขนี้คือหัวใจของ "ความมีชีวิต" ของแผนที่ */
  liveRunners: number;
  weeklyRunners: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  bestTime: string;
  hasLighting: boolean;
  hasWater: boolean;
  hasToilet: boolean;
  routeIds: string[];
}

/* ------------------------------------------------------------------ */
/* Route + Checkpoint                                                  */
/* ------------------------------------------------------------------ */

export type CheckpointKind = 'start' | 'tower' | 'coin' | 'chest' | 'finish';

export interface Checkpoint {
  id: string;
  name: string;
  kind: CheckpointKind;
  position: LatLng;
  /** ปลดล็อกเมื่อวิ่งครบกี่ กม. — ใช้แทน GPS geofence ในเดโม */
  atKm: number;
  coinReward: number;
}

export interface RunRoute {
  id: string;
  zoneId: string;
  name: string;
  distanceKm: number;
  elevationM: number;
  /** polyline สำหรับวาดบนแผนที่ */
  path: LatLng[];
  checkpoints: Checkpoint[];
  createdBy: string;
  /** true = ผู้ใช้คนอื่นสร้างแล้วแชร์ (feature 9 — โชว์ได้แม้ยังสร้างเองไม่ได้) */
  isCommunity: boolean;
  timesRun: number;
}

/* ------------------------------------------------------------------ */
/* Community                                                           */
/* ------------------------------------------------------------------ */

export interface Review {
  id: string;
  zoneId: string;
  userId: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  zoneId: string;
  userId: string;
  name: string;
  avatar: string;
  text: string;
  createdAt: number;
  isMe?: boolean;
}

/* ------------------------------------------------------------------ */
/* Merchant + Reward — ฝั่งรายได้                                       */
/* ------------------------------------------------------------------ */

export type MerchantCategory = 'gear' | 'food' | 'health' | 'event';

export interface Merchant {
  id: string;
  name: string;
  category: MerchantCategory;
  district: string;
  location: LatLng;
  /** commission ที่แอปเก็บต่อคูปองที่ถูกแลกจริง — ใส่ไว้เพื่อโชว์ในสไลด์ธุรกิจ */
  commissionRate: number;
  blurb: string;
}

export interface Reward {
  id: string;
  merchantId: string;
  title: string;
  /** มูลค่าส่วนลดจริงเป็นบาท ใช้คำนวณ commission ให้กรรมการเห็น */
  valueBaht: number;
  coinCost: number;
  stock: number;
  expiresInDays: number;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  code: string;
  redeemedAt: number;
  used: boolean;
}

/* ------------------------------------------------------------------ */
/* User                                                                */
/* ------------------------------------------------------------------ */

/** ตัวละครวิ่งที่เลือกตอนสมัคร ใช้โชว์ sprite วิ่งจริงในหน้า Active Run */
export type RunnerAvatarId = 'male' | 'female' | 'pig';

export interface User {
  id: string;
  name: string;
  avatar: string;
  runnerAvatarId: RunnerAvatarId;
  /** true = เข้าใช้งานแบบแขก (ยังไม่ login/สมัคร) — คุมแค่การแสดงผลในหน้า Profile ไม่ได้ล็อกฟีเจอร์ */
  isGuest: boolean;
  /** ใช้คำนวณแคลอรี่ */
  weightKg: number;
  /** ใช้ประมาณ stride length จากจำนวนก้าว */
  heightCm: number;
  homeZoneId: string;
  coins: number;
  totalDistanceKm: number;
  weeklyDistanceKm: number;
  streakDays: number;
  paceTier: PaceTier;
  distanceTier: DistanceTier;
}

/* ------------------------------------------------------------------ */
/* Sensor — feature 6 (จับการแกว่งมือถือ)                               */
/* ------------------------------------------------------------------ */

export type SensorPermission = 'unknown' | 'granted' | 'denied' | 'unsupported';

/** sensor = ใช้ accelerometer จริง, simulate = ปุ่มสำรองตอนเดโมพัง */
export type TrackingMode = 'sensor' | 'simulate';

export interface SensorState {
  permission: SensorPermission;
  mode: TrackingMode;
  /** ความแรงล่าสุด ใช้วาด waveform ให้เห็นว่า sensor ทำงาน */
  magnitude: number;
  /** ก้าว/นาที */
  cadence: number;
  stepCount: number;
}

/* ------------------------------------------------------------------ */
/* Run session                                                         */
/* ------------------------------------------------------------------ */

export type RunStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'finished';

export type GpsPermission = 'unknown' | 'granted' | 'denied' | 'unsupported';
export type GpsQuality = 'idle' | 'loading' | 'good' | 'weak' | 'unavailable' | 'demo';

export interface GpsState {
  permission: GpsPermission;
  quality: GpsQuality;
  accuracyM: number | null;
  lastFixAt: number | null;
  rejectedPoints: number;
  message: string;
  lastPosition: LatLng | null;
}

export interface RunSession {
  sessionId: string | null;
  status: RunStatus;
  routeId: string | null;
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
  lastUpdatedAt: number | null;
  elapsedSec: number;
  steps: number;
  /** สะสมทีละช่วง เพราะ stride ผันตาม cadence — ไม่ใช่ steps × ค่าคงที่ */
  distanceM: number;
  /** pace ปัจจุบัน วินาที/กม. (0 = ยังคำนวณไม่ได้) */
  currentPaceSec: number;
  caloriesKcal: number;
  collectedCheckpointIds: string[];
  /** เส้นทางที่วิ่งไปแล้ว ใช้วาดเส้นตามหลัง marker */
  traveledPath: LatLng[];
  mode: TrackingMode;
}

export interface RunRecord {
  id: string;
  routeId: string;
  zoneId: string;
  startedAt: number;
  finishedAt: number;
  distanceKm: number;
  durationSec: number;
  paceSec: number;
  caloriesKcal: number;
  coinsEarned: number;
  checkpointsCollected: number;
  mode: TrackingMode;
  traveledPath: LatLng[];
}

/* ------------------------------------------------------------------ */
/* AI Planner (Gemini)                                                 */
/* ------------------------------------------------------------------ */

export type PlanDayType = 'easy' | 'tempo' | 'long' | 'rest';

export interface PlanDay {
  /** ISO date เช่น 2026-07-26 */
  date: string;
  targetKm: number;
  type: PlanDayType;
  /** ช่วงเวลาที่แนะนำ เช่น "06:00–07:00" */
  timeSlot: string;
  note: string;
  suggestedZoneId: string | null;
}

export interface TrainingPlan {
  goalKm: number;
  days: number;
  /** ข้อจำกัดที่ผู้ใช้พิมพ์เข้าไป เช่น "อังคารเรียนถึง 5 โมงเย็น" */
  constraints: string;
  generatedAt: number;
  schedule: PlanDay[];
  summary: string;
}

export interface PlannerState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  plan: TrainingPlan | null;
}

/* ------------------------------------------------------------------ */
/* UI / navigation                                                     */
/* ------------------------------------------------------------------ */

export type Screen =
  | 'welcome'
  | 'login'
  | 'register'
  | 'map'
  | 'zone'
  | 'ranking'
  | 'run'
  | 'finish'
  | 'shop'
  | 'planner'
  | 'profile';

export interface Toast {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warn';
}

export interface UIState {
  screen: Screen;
  selectedZoneId: string | null;
  selectedRouteId: string | null;
  recoveryPrompt: boolean;
  toasts: Toast[];
}

/* ------------------------------------------------------------------ */
/* Root state                                                          */
/* ------------------------------------------------------------------ */

export interface AppState {
  user: User;
  zones: Zone[];
  routes: RunRoute[];
  merchants: Merchant[];
  rewards: Reward[];
  redeemed: RedeemedReward[];
  reviews: Record<string, Review[]>;
  chat: Record<string, ChatMessage[]>;
  leaderboards: Record<string, LeaderboardEntry[]>;
  run: RunSession;
  gps: GpsState;
  sensor: SensorState;
  planner: PlannerState;
  history: RunRecord[];
  ui: UIState;
  /** ผลลัพธ์ของรอบวิ่งล่าสุด ใช้ส่งข้ามหน้า Run -> Finish */
  lastResult: RunRecord | null;
  /** ประวัติจะเพิ่มเมื่อผู้ใช้กดบันทึกสำเร็จเท่านั้น */
  lastResultSaved: boolean;
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export type Action =
  // navigation
  | { type: 'NAV'; screen: Screen }
  | { type: 'USER_WEIGHT_SET'; weightKg: number }
  | { type: 'SELECT_ZONE'; zoneId: string }
  | { type: 'SELECT_ROUTE'; routeId: string }
  | { type: 'ADD_CUSTOM_ROUTE'; route: RunRoute }
  // profile
  | { type: 'SELECT_AVATAR'; avatarId: RunnerAvatarId }
  // auth — จำลองเฉยๆ ไม่มี backend จริง แค่คุม isGuest + เปลี่ยนหน้า
  | { type: 'LOGIN' }
  | { type: 'GUEST_ENTER' }
  | { type: 'LOGOUT' }
  // sensor
  | { type: 'SENSOR_PERMISSION'; permission: SensorPermission }
  | { type: 'SENSOR_MODE'; mode: TrackingMode }
  | { type: 'SENSOR_SAMPLE'; magnitude: number }
  // run lifecycle
  /** routeId เป็น null = วิ่งอิสระ ไม่ผูกกับ route/zone ใดๆ */
  | { type: 'RUN_ARM'; routeId: string | null }
  | { type: 'RUN_START' }
  | { type: 'RUN_PAUSE' }
  | { type: 'RUN_RESUME' }
  | { type: 'RUN_TIME_SYNC'; now: number }
  | { type: 'RUN_FINISH_AND_SAVE' }
  | { type: 'RUN_RECOVERY_CONTINUE' }
  | { type: 'RUN_RECOVERY_FINISH' }
  | { type: 'RUN_RECOVERY_DISCARD' }
  /** เรียกทุก 1 วินาทีจาก useRunEngine — newSteps คือก้าวที่ตรวจได้ในวินาทีนั้น */
  | { type: 'RUN_TICK'; newSteps: number; cadence: number }
  | { type: 'RUN_FINISH' }
  | { type: 'RUN_SAVE' }
  | { type: 'RUN_RESET' }
  | { type: 'GPS_STATUS'; permission?: GpsPermission; quality: GpsQuality; accuracyM?: number | null; message: string }
  | { type: 'RUN_GPS_UPDATE'; position: LatLng; accuracyM: number; timestamp: number }
  // shop
  | { type: 'REDEEM'; rewardId: string }
  // planner
  | { type: 'PLAN_LOADING' }
  | { type: 'PLAN_READY'; plan: TrainingPlan }
  | { type: 'PLAN_ERROR'; error: string }
  // community
  | { type: 'POST_REVIEW'; zoneId: string; rating: number; text: string }
  | { type: 'POST_CHAT'; zoneId: string; text: string }
  // toast
  | { type: 'TOAST'; text: string; tone?: Toast['tone'] }
  | { type: 'TOAST_DISMISS'; id: string };
