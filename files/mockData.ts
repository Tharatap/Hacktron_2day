/**
 * Mock data ทั้งหมด — scope: ชลบุรี
 *
 * ⚠️ พิกัดเป็นค่าประมาณจากความจำ ต้องเปิดแผนที่เช็คตาก่อนเดโม
 * ถ้าหมุดไปลงกลางทะเลกรรมการจับได้ทันที ใช้เวลา 10 นาทีเลื่อนหมุดคุ้มมาก
 *
 * ชื่อร้านค้าเป็นชื่อสมมติทั้งหมด ไม่ใช่ธุรกิจจริง
 */

import type {
  Zone,
  RunRoute,
  Merchant,
  Reward,
  Review,
  ChatMessage,
  LeaderboardEntry,
  User,
  LatLng,
  Checkpoint,
} from '../types';
import { metersToLatLngOffset, paceTierFromPace, distanceTierFromKm } from '../lib/formulas';

/* ------------------------------------------------------------------ */
/* Path generator                                                      */
/* ------------------------------------------------------------------ */

/**
 * สร้าง polyline เป็นวงรอบจุดศูนย์กลาง
 * ใช้แทน GPX จริงในเดโม — ถ้ามีเวลาเหลือค่อยเอา path จริงมาแทน
 */
function makeLoop(center: LatLng, radiusM: number, points = 28, wobble = 0.12): LatLng[] {
  const path: LatLng[] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radiusM * (1 + Math.sin(angle * 3) * wobble);
    const { dLat, dLng } = metersToLatLngOffset(
      center.lat,
      Math.cos(angle) * r,
      Math.sin(angle) * r
    );
    path.push({ lat: center.lat + dLat, lng: center.lng + dLng });
  }
  return path;
}

/** วาง checkpoint กระจายตามระยะ */
function makeCheckpoints(
  routeId: string,
  path: LatLng[],
  distanceKm: number,
  towerNames: string[]
): Checkpoint[] {
  const cps: Checkpoint[] = [
    { id: `${routeId}-start`, name: 'จุดเริ่ม', kind: 'start', position: path[0], atKm: 0, coinReward: 0 },
  ];
  towerNames.forEach((name, i) => {
    const frac = (i + 1) / (towerNames.length + 1);
    const idx = Math.floor(frac * (path.length - 1));
    cps.push({
      id: `${routeId}-t${i + 1}`,
      name,
      kind: 'tower',
      position: path[idx],
      atKm: +(distanceKm * frac).toFixed(2),
      coinReward: 15,
    });
  });
  cps.push({
    id: `${routeId}-finish`,
    name: 'เส้นชัย',
    kind: 'finish',
    position: path[path.length - 1],
    atKm: distanceKm,
    coinReward: 25,
  });
  return cps;
}

/* ------------------------------------------------------------------ */
/* Zones                                                               */
/* ------------------------------------------------------------------ */

export const ZONES: Zone[] = [
  {
    id: 'z-bangsaen',
    name: 'หาดบางแสน',
    nameEn: 'Bangsaen Beach',
    district: 'เมืองชลบุรี',
    center: { lat: 13.2843, lng: 100.911 },
    radiusM: 900,
    surface: 'road',
    difficulty: 1,
    loopDistanceKm: 4.2,
    liveRunners: 38,
    weeklyRunners: 1420,
    rating: 4.7,
    reviewCount: 216,
    tags: ['ริมทะเล', 'พื้นเรียบ', 'มีไฟกลางคืน'],
    description:
      'เส้นเลียบหาดยาว พื้นเรียบตลอด ลมทะเลช่วยได้เยอะช่วงเย็น จุดวิ่งที่คนหนาแน่นที่สุดในชลบุรี',
    bestTime: '05:30–07:00 และ 17:00–19:00',
    hasLighting: true,
    hasWater: true,
    hasToilet: true,
    routeIds: ['r-bangsaen-4k', 'r-bangsaen-2k'],
  },
  {
    id: 'z-samuk',
    name: 'เขาสามมุก',
    nameEn: 'Khao Sam Muk',
    district: 'เมืองชลบุรี',
    center: { lat: 13.2717, lng: 100.9047 },
    radiusM: 500,
    surface: 'road',
    difficulty: 4,
    loopDistanceKm: 2.6,
    liveRunners: 9,
    weeklyRunners: 310,
    rating: 4.4,
    reviewCount: 88,
    tags: ['ทางชัน', 'วิวสวย', 'มีลิง'],
    description: 'ทางขึ้นเขาชันจริง เหมาะกับซ้อม hill repeat ระวังลิงแย่งของ',
    bestTime: '06:00–08:00',
    hasLighting: false,
    hasWater: false,
    hasToilet: true,
    routeIds: ['r-samuk-hill'],
  },
  {
    id: 'z-bangphra',
    name: 'อ่างเก็บน้ำบางพระ',
    nameEn: 'Bang Phra Reservoir',
    district: 'ศรีราชา',
    center: { lat: 13.2167, lng: 101.0167 },
    radiusM: 1600,
    surface: 'mixed',
    difficulty: 3,
    loopDistanceKm: 10.5,
    liveRunners: 14,
    weeklyRunners: 520,
    rating: 4.8,
    reviewCount: 134,
    tags: ['ระยะยาว', 'ธรรมชาติ', 'รถน้อย'],
    description: 'เส้นรอบอ่างยาวพอสำหรับซ้อม long run รถน้อย อากาศดี แต่ไม่มีไฟตอนกลางคืน',
    bestTime: '05:30–08:00',
    hasLighting: false,
    hasWater: true,
    hasToilet: true,
    routeIds: ['r-bangphra-10k'],
  },
  {
    id: 'z-ku-sriracha',
    name: 'ม.เกษตรศาสตร์ ศรีราชา',
    nameEn: 'KU Sriracha Campus',
    district: 'ศรีราชา',
    center: { lat: 13.114, lng: 100.927 },
    radiusM: 600,
    surface: 'track',
    difficulty: 2,
    loopDistanceKm: 3.1,
    liveRunners: 22,
    weeklyRunners: 680,
    rating: 4.5,
    reviewCount: 97,
    tags: ['ในมหาวิทยาลัย', 'ปลอดภัย', 'มีลู่ยาง'],
    description: 'สนามในมหาลัย ปลอดภัย มีลู่ยางให้ซ้อม interval กลุ่มนักศึกษาเยอะช่วงเย็น',
    bestTime: '17:00–20:00',
    hasLighting: true,
    hasWater: true,
    hasToilet: true,
    routeIds: ['r-ku-3k'],
  },
  {
    id: 'z-kohloy',
    name: 'เกาะลอยศรีราชา',
    nameEn: 'Koh Loy Sriracha',
    district: 'ศรีราชา',
    center: { lat: 13.1727, lng: 100.9203 },
    radiusM: 450,
    surface: 'road',
    difficulty: 1,
    loopDistanceKm: 2.4,
    liveRunners: 11,
    weeklyRunners: 390,
    rating: 4.3,
    reviewCount: 64,
    tags: ['ริมทะเล', 'ระยะสั้น', 'มีร้านอาหาร'],
    description: 'วนรอบเกาะลอยได้ วิวทะเล เหมาะกับวิ่งเบาๆ หลังเลิกงาน',
    bestTime: '17:30–19:30',
    hasLighting: true,
    hasWater: true,
    hasToilet: true,
    routeIds: ['r-kohloy-2k'],
  },
  {
    id: 'z-laemchabang',
    name: 'สวนสาธารณะแหลมฉบัง',
    nameEn: 'Laem Chabang Park',
    district: 'ศรีราชา',
    center: { lat: 13.0827, lng: 100.8836 },
    radiusM: 550,
    surface: 'road',
    difficulty: 2,
    loopDistanceKm: 3.6,
    liveRunners: 17,
    weeklyRunners: 470,
    rating: 4.2,
    reviewCount: 71,
    tags: ['ในเมือง', 'มีไฟกลางคืน', 'ที่จอดรถสะดวก'],
    description: 'สวนกลางชุมชน วิ่งได้ถึงค่ำ มีเครื่องออกกำลังกายกลางแจ้งด้วย',
    bestTime: '18:00–20:30',
    hasLighting: true,
    hasWater: true,
    hasToilet: true,
    routeIds: ['r-laemchabang-3k'],
  },
];

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

function buildRoute(
  id: string,
  zoneId: string,
  name: string,
  distanceKm: number,
  elevationM: number,
  radiusM: number,
  towerNames: string[],
  createdBy: string,
  isCommunity: boolean,
  timesRun: number
): RunRoute {
  const zone = ZONES.find((z) => z.id === zoneId)!;
  const path = makeLoop(zone.center, radiusM);
  return {
    id,
    zoneId,
    name,
    distanceKm,
    elevationM,
    path,
    checkpoints: makeCheckpoints(id, path, distanceKm, towerNames),
    createdBy,
    isCommunity,
    timesRun,
  };
}

export const ROUTES: RunRoute[] = [
  buildRoute('r-bangsaen-4k', 'z-bangsaen', 'เลียบหาดบางแสน 4.2K', 4.2, 8, 620,
    ['ศาลาริมหาด', 'ลานปูดำ', 'แยกวงเวียน'], 'RunTown', false, 8420),
  buildRoute('r-bangsaen-2k', 'z-bangsaen', 'บางแสนสั้น 2K', 2.0, 4, 300,
    ['ศาลาริมหาด'], 'ploy_runs', true, 1240),
  buildRoute('r-samuk-hill', 'z-samuk', 'เขาสามมุก Hill 2.6K', 2.6, 96, 380,
    ['โค้งแรก', 'จุดชมวิว'], 'RunTown', false, 2110),
  buildRoute('r-bangphra-10k', 'z-bangphra', 'รอบอ่างบางพระ 10.5K', 10.5, 62, 1500,
    ['สันเขื่อน', 'ศาลากลางน้ำ', 'ป่ายาง', 'จุดชมนก'], 'RunTown', false, 3380),
  buildRoute('r-ku-3k', 'z-ku-sriracha', 'รอบมอ KU 3.1K', 3.1, 12, 440,
    ['หน้าหอสมุด', 'สนามฟุตบอล'], 'consider_team', true, 960),
  buildRoute('r-kohloy-2k', 'z-kohloy', 'วนเกาะลอย 2.4K', 2.4, 6, 340,
    ['สะพานปลา', 'ศาลเจ้า'], 'RunTown', false, 1580),
  buildRoute('r-laemchabang-3k', 'z-laemchabang', 'สวนแหลมฉบัง 3.6K', 3.6, 10, 420,
    ['ลานออกกำลังกาย', 'สระน้ำ'], 'nut_lcb', true, 720),
];

/* ------------------------------------------------------------------ */
/* Merchants + Rewards                                                 */
/* ------------------------------------------------------------------ */

export const MERCHANTS: Merchant[] = [
  {
    id: 'm-gear-01', name: 'Bangsaen Run Lab', category: 'gear', district: 'บางแสน',
    location: { lat: 13.2861, lng: 100.9142 }, commissionRate: 0.12,
    blurb: 'ร้านรองเท้าวิ่งเฉพาะทาง มีบริการวัดรูปเท้าฟรี',
  },
  {
    id: 'm-gear-02', name: 'Sriracha Sports House', category: 'gear', district: 'ศรีราชา',
    location: { lat: 13.1745, lng: 100.9258 }, commissionRate: 0.1,
    blurb: 'อุปกรณ์กีฬาครบวงจร เสื้อวิ่ง นาฬิกา สายรัดข้อมือ',
  },
  {
    id: 'm-food-01', name: 'Refuel Café บางแสน', category: 'food', district: 'บางแสน',
    location: { lat: 13.2822, lng: 100.9133 }, commissionRate: 0.15,
    blurb: 'คาเฟ่โปรตีนเชค เปิด 05:30 ทันนักวิ่งเช้า',
  },
  {
    id: 'm-health-01', name: 'Chonburi Physio Clinic', category: 'health', district: 'เมืองชลบุรี',
    location: { lat: 13.3612, lng: 100.9847 }, commissionRate: 0.08,
    blurb: 'กายภาพบำบัดนักกีฬา แก้อาการเจ็บเข่า เอ็นร้อยหวาย',
  },
  {
    id: 'm-event-01', name: 'Chonburi Marathon 2026', category: 'event', district: 'เมืองชลบุรี',
    location: { lat: 13.3611, lng: 100.9847 }, commissionRate: 0.07,
    blurb: 'งานวิ่งประจำจังหวัด มิ.ย. 2026 — ระยะ 5K / 10K / Half',
  },
  {
    id: 'm-event-02', name: 'Laem Chabang Night Run', category: 'event', district: 'แหลมฉบัง',
    location: { lat: 13.0831, lng: 100.8841 }, commissionRate: 0.07,
    blurb: 'วิ่งกลางคืนริมท่าเรือ ระยะ 5K มือใหม่ลงได้',
  },
];

export const REWARDS: Reward[] = [
  { id: 'rw-01', merchantId: 'm-gear-01', title: 'ส่วนลดรองเท้าวิ่ง 300 บาท', valueBaht: 300, coinCost: 800, stock: 25, expiresInDays: 30 },
  { id: 'rw-02', merchantId: 'm-gear-01', title: 'วัดรูปเท้า + วิเคราะห์การลงเท้า ฟรี', valueBaht: 500, coinCost: 600, stock: 15, expiresInDays: 45 },
  { id: 'rw-03', merchantId: 'm-gear-02', title: 'ถุงเท้าวิ่ง ซื้อ 1 แถม 1', valueBaht: 250, coinCost: 400, stock: 40, expiresInDays: 30 },
  { id: 'rw-04', merchantId: 'm-food-01', title: 'โปรตีนเชคหลังวิ่ง ลด 50%', valueBaht: 90, coinCost: 150, stock: 100, expiresInDays: 14 },
  { id: 'rw-05', merchantId: 'm-food-01', title: 'กาแฟดำฟรี 1 แก้ว (วิ่งครบ 5 กม.)', valueBaht: 60, coinCost: 100, stock: 200, expiresInDays: 7 },
  { id: 'rw-06', merchantId: 'm-health-01', title: 'ตรวจประเมินท่าวิ่ง ลด 400 บาท', valueBaht: 400, coinCost: 1000, stock: 10, expiresInDays: 60 },
  { id: 'rw-07', merchantId: 'm-event-01', title: 'บัตรวิ่ง 10K ลด 200 บาท', valueBaht: 200, coinCost: 700, stock: 50, expiresInDays: 90 },
  { id: 'rw-08', merchantId: 'm-event-02', title: 'สมัคร Night Run 5K ลด 30%', valueBaht: 150, coinCost: 500, stock: 60, expiresInDays: 60 },
];

/* ------------------------------------------------------------------ */
/* User                                                                */
/* ------------------------------------------------------------------ */

export const DEFAULT_USER: User = {
  id: 'u-me',
  name: 'Aom',
  avatar: '🏃',
  weightKg: 58,
  heightCm: 168,
  homeZoneId: 'z-ku-sriracha',
  coins: 640,
  totalDistanceKm: 182.4,
  weeklyDistanceKm: 18.2,
  streakDays: 4,
  paceTier: 'jogger',
  distanceTier: 'D5',
};

/* ------------------------------------------------------------------ */
/* Leaderboards                                                        */
/* ------------------------------------------------------------------ */

const NAMES = [
  ['พีท', '🐯'], ['มายด์', '🦊'], ['ต้นน้ำ', '🐬'], ['บีม', '🦅'], ['ฟ้า', '🐧'],
  ['กร', '🐺'], ['นุ่น', '🦋'], ['เจได', '🐉'], ['ปอนด์', '🐢'], ['แนน', '🦜'],
  ['อาร์ม', '🦁'], ['จูน', '🐨'], ['เต้', '🦈'], ['ปิ่น', '🐝'], ['วิน', '🐆'],
];

function seeded(n: number) {
  const x = Math.sin(n * 9973) * 10000;
  return x - Math.floor(x);
}

function buildLeaderboard(zoneId: string, salt: number): LeaderboardEntry[] {
  const rows: LeaderboardEntry[] = NAMES.map(([name, avatar], i) => {
    const r1 = seeded(salt + i * 3);
    const r2 = seeded(salt + i * 7 + 1);
    const distanceKm = +(3 + r1 * 42).toFixed(1);
    const paceSec = Math.round(280 + r2 * 320);
    return {
      userId: `u-${zoneId}-${i}`,
      name,
      avatar,
      distanceKm,
      paceSec,
      paceTier: paceTierFromPace(paceSec),
      distanceTier: distanceTierFromKm(distanceKm),
      runsThisWeek: 1 + Math.floor(r1 * 6),
      };
  });

  rows.push({
    userId: DEFAULT_USER.id,
    name: DEFAULT_USER.name,
    avatar: DEFAULT_USER.avatar,
    distanceKm: DEFAULT_USER.weeklyDistanceKm,
    paceSec: 468,
    paceTier: 'jogger',
    distanceTier: 'D5',
    runsThisWeek: 4,
    isMe: true,
  });

  return rows.sort((a, b) => b.distanceKm - a.distanceKm);
}

export const LEADERBOARDS: Record<string, LeaderboardEntry[]> = Object.fromEntries(
  ZONES.map((z, i) => [z.id, buildLeaderboard(z.id, i + 1)])
);

/* ------------------------------------------------------------------ */
/* Reviews + Chat                                                      */
/* ------------------------------------------------------------------ */

const now = Date.now();
const min = 60_000;

export const REVIEWS: Record<string, Review[]> = {
  'z-bangsaen': [
    { id: 'rv1', zoneId: 'z-bangsaen', userId: 'u1', name: 'พีท', avatar: '🐯', rating: 5, text: 'พื้นเรียบดีมาก วิ่งยาวได้ไม่มีสะดุด ช่วงเย็นลมดี', createdAt: now - 180 * min },
    { id: 'rv2', zoneId: 'z-bangsaen', userId: 'u2', name: 'มายด์', avatar: '🦊', rating: 4, text: 'เสาร์อาทิตย์คนเยอะมาก ต้องหลบนักท่องเที่ยวบ่อย แนะนำวันธรรมดา', createdAt: now - 420 * min },
    { id: 'rv3', zoneId: 'z-bangsaen', userId: 'u3', name: 'ฟ้า', avatar: '🐧', rating: 5, text: 'มีน้ำดื่มกับห้องน้ำตลอดเส้น สะดวกสุดในชลบุรีแล้ว', createdAt: now - 900 * min },
  ],
  'z-samuk': [
    { id: 'rv4', zoneId: 'z-samuk', userId: 'u4', name: 'กร', avatar: '🐺', rating: 5, text: 'ชันจริง ซ้อมขึ้นเขา 5 รอบขาสั่นเลย คุ้มมาก', createdAt: now - 240 * min },
    { id: 'rv5', zoneId: 'z-samuk', userId: 'u5', name: 'นุ่น', avatar: '🦋', rating: 3, text: 'ลิงเยอะจริง อย่าถือถุงอะไรไปนะ โดนแย่งมาแล้ว', createdAt: now - 1200 * min },
  ],
  'z-ku-sriracha': [
    { id: 'rv6', zoneId: 'z-ku-sriracha', userId: 'u6', name: 'บีม', avatar: '🦅', rating: 5, text: 'ลู่ยางสภาพดี เหมาะซ้อม interval มีไฟถึงสามทุ่ม', createdAt: now - 60 * min },
  ],
  'z-bangphra': [
    { id: 'rv7', zoneId: 'z-bangphra', userId: 'u7', name: 'เจได', avatar: '🐉', rating: 5, text: 'long run ที่ดีที่สุดในชลบุรี รถน้อยมาก แต่ต้องพกน้ำไปเอง', createdAt: now - 300 * min },
  ],
};

export const CHAT: Record<string, ChatMessage[]> = {
  'z-bangsaen': [
    { id: 'c1', zoneId: 'z-bangsaen', userId: 'u1', name: 'พีท', avatar: '🐯', text: 'พรุ่งนี้เช้า 6 โมง ใครไปบ้าง', createdAt: now - 42 * min },
    { id: 'c2', zoneId: 'z-bangsaen', userId: 'u2', name: 'มายด์', avatar: '🦊', text: 'ไปด้วยคน วิ่ง 5K เบาๆ', createdAt: now - 38 * min },
    { id: 'c3', zoneId: 'z-bangsaen', userId: 'u5', name: 'นุ่น', avatar: '🦋', text: 'ตอนนี้ฝนตกนะ ใครจะมาเย็นนี้เช็คก่อน', createdAt: now - 12 * min },
  ],
  'z-ku-sriracha': [
    { id: 'c4', zoneId: 'z-ku-sriracha', userId: 'u6', name: 'บีม', avatar: '🦅', text: 'สนามเปิดปกติ ลู่ว่างมาก', createdAt: now - 25 * min },
  ],
};
