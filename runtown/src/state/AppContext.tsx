/**
 * State กลางของทั้งแอป
 *
 * กติกา:
 * - ทุกหน้าอ่าน state จาก useApp() เท่านั้น ห้ามมี useState เก็บข้อมูลธุรกิจในหน้าใดหน้าหนึ่ง
 *   (useState ใช้ได้กับ UI ล้วน เช่น modal เปิด/ปิด, tab ที่เลือก)
 * - ทุกการเปลี่ยนแปลงผ่าน dispatch เท่านั้น
 * - ค่าที่คำนวณได้ (pace, rank, coin) เป็น derived — อย่าเก็บซ้ำใน state
 *
 * เหตุผล: หน้า Run -> Finish -> Shop ต้องส่ง coin/ระยะทางต่อกันได้
 * ถ้าแต่ละหน้าเก็บ state ของตัวเอง จะเย็บไม่ติดตอนตี 2
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type { AppState, Action, RunRecord, RedeemedReward, LatLng } from '../types';
import {
  ZONES, ROUTES, MERCHANTS, REWARDS, REVIEWS, CHAT, LEADERBOARDS, DEFAULT_USER,
} from '../data/mockData';
import {
  strideMeters, paceSecPerKm, coinsForRun, estimatedCalories,
  paceTierFromPace, distanceTierFromKm, pointAlongPath, distanceM as geoDistanceM,
  metersToLatLngOffset,
} from '../lib/formulas';

/* ------------------------------------------------------------------ */
/* Initial state                                                       */
/* ------------------------------------------------------------------ */

/** วิ่งอิสระ (ไม่มี route) — เก็บ "tower เสมือน" ทุกๆ ระยะนี้ ให้ reward เท่ากับ tower ปกติของ route */
export const FREE_RUN_TOWER_INTERVAL_KM = 1;
export const FREE_RUN_TOWER_REWARD = 15;

const emptyRun: AppState['run'] = {
  status: 'idle',
  routeId: null,
  startedAt: null,
  elapsedSec: 0,
  steps: 0,
  distanceM: 0,
  currentPaceSec: 0,
  caloriesKcal: 0,
  collectedCheckpointIds: [],
  traveledPath: [],
  mode: 'sensor',
};

export const initialState: AppState = {
  user: DEFAULT_USER,
  zones: ZONES,
  routes: ROUTES,
  merchants: MERCHANTS,
  rewards: REWARDS,
  redeemed: [],
  reviews: REVIEWS,
  chat: CHAT,
  leaderboards: LEADERBOARDS,
  run: emptyRun,
  sensor: { permission: 'unknown', mode: 'sensor', magnitude: 0, cadence: 0, stepCount: 0 },
  planner: { status: 'idle', error: null, plan: null },
  history: [],
  ui: { screen: 'home', selectedZoneId: null, selectedRouteId: null, toasts: [] },
  lastResult: null,
  lastResultSaved: false,
  gps: {
    permission: 'unknown', quality: 'idle', accuracyM: null,
    lastFixAt: null, rejectedPoints: 0, message: 'ยังไม่ได้ตรวจสอบ GPS',
    lastPosition: null,
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let toastSeq = 0;
function pushToast(state: AppState, text: string, tone: 'info' | 'success' | 'warn' = 'info'): AppState {
  const toast = { id: `t${++toastSeq}`, text, tone };
  return { ...state, ui: { ...state.ui, toasts: [...state.ui.toasts, toast] } };
}

function couponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `RT-${out}`;
}

/* ------------------------------------------------------------------ */
/* Reducer                                                             */
/* ------------------------------------------------------------------ */

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    /* ---------------- navigation ---------------- */
    case 'NAV':
      return { ...state, ui: { ...state.ui, screen: action.screen } };

    case 'USER_WEIGHT_SET':
      if (!Number.isFinite(action.weightKg) || action.weightKg <= 0 || action.weightKg > 350) return state;
      return { ...state, user: { ...state.user, weightKg: action.weightKg } };

    case 'SELECT_ZONE':
      return { ...state, ui: { ...state.ui, selectedZoneId: action.zoneId, screen: 'zone' } };

    case 'SELECT_ROUTE':
      return { ...state, ui: { ...state.ui, selectedRouteId: action.routeId } };

    /* ---------------- sensor ---------------- */
    case 'SENSOR_PERMISSION':
      return { ...state, sensor: { ...state.sensor, permission: action.permission } };

    case 'SENSOR_MODE':
      return {
        ...state,
        sensor: { ...state.sensor, mode: action.mode },
        run: { ...state.run, mode: action.mode },
      };

    case 'SENSOR_SAMPLE':
      return { ...state, sensor: { ...state.sensor, magnitude: action.magnitude } };

    /* ---------------- run lifecycle ---------------- */
    case 'RUN_ARM': {
      const route = state.routes.find((r) => r.id === action.routeId);
      return {
        ...state,
        run: {
          ...emptyRun,
          routeId: action.routeId,
          status: 'countdown',
          mode: state.sensor.mode,
          traveledPath: [],
        },
        sensor: { ...state.sensor, stepCount: 0, cadence: 0 },
        ui: { ...state.ui, screen: 'run', selectedRouteId: action.routeId },
      };
    }

    case 'RUN_START':
      return {
        ...state,
        run: { ...state.run, status: 'running', startedAt: Date.now() },
      };

    case 'RUN_PAUSE':
      return { ...state, run: { ...state.run, status: 'paused' } };

    case 'RUN_RESUME':
      return { ...state, run: { ...state.run, status: 'running' } };

    /**
     * หัวใจของ feature 6 — เรียกทุก 1 วินาที
     *
     * ระยะทางสะสมทีละช่วง: newSteps × stride(cadence ณ ตอนนั้น)
     * ไม่ใช่ totalSteps × stride คงที่ เพราะช่วงต้นเดินช้า ช่วงหลังวิ่งเร็ว
     * stride ไม่เท่ากัน ถ้าคูณทีเดียวตอนจบจะเพี้ยน
     */
    case 'RUN_TICK': {
      if (state.run.status !== 'running') return state;

      const { newSteps, cadence } = action;
      const route = state.routes.find((r) => r.id === state.run.routeId);

      // Real sessions use filtered GPS distance. Step distance is only a clearly labelled demo fallback.
      const addedM = state.gps.quality === 'demo'
        ? strideMeters(cadence || 150, state.user.heightCm) * newSteps
        : 0;
      const distanceM = state.run.distanceM + addedM;
      const elapsedSec = state.run.elapsedSec + 1;
      const steps = state.run.steps + newSteps;

      const kcal = estimatedCalories(state.user.weightKg, distanceM / 1000);
      const pace = paceSecPerKm(distanceM, elapsedSec);

      // ปลดล็อก checkpoint ตามระยะที่ผ่านมา (แทน GPS geofence ในเดโม)
      const km = distanceM / 1000;
      let collected = state.run.collectedCheckpointIds;
      let newlyHit: string | null = null;
      if (route) {
        for (const cp of route.checkpoints) {
          if (cp.kind === 'start') continue;
          if (km >= cp.atKm && !collected.includes(cp.id)) {
            collected = [...collected, cp.id];
            newlyHit = cp.name;
          }
        }
      } else {
        // วิ่งอิสระ ไม่มี route ให้ปลดล็อก tower เสมือนทุกๆ FREE_RUN_TOWER_INTERVAL_KM แทน
        const towerCount = Math.floor(km / FREE_RUN_TOWER_INTERVAL_KM);
        for (let i = 1; i <= towerCount; i++) {
          const id = `free-tower-${i}`;
          if (!collected.includes(id)) {
            collected = [...collected, id];
            newlyHit = `หอคอยที่ ${i}`;
          }
        }
      }

      // ขยับ marker ตาม progress บน polyline
      let traveledPath: LatLng[] = state.run.traveledPath;
      if (state.gps.quality === 'demo' && route && route.distanceKm > 0) {
        const progress = Math.min(km / route.distanceKm, 1);
        const pt = pointAlongPath(route.path, progress);
        traveledPath = [...traveledPath, pt];
      } else if (state.gps.quality === 'demo' && !route && addedM > 0) {
        const previous = traveledPath[traveledPath.length - 1]
          ?? state.zones.find((z) => z.id === state.user.homeZoneId)?.center
          ?? { lat: 13.286, lng: 100.914 };
        const { dLat, dLng } = metersToLatLngOffset(previous.lat, addedM * 0.82, addedM * 0.18);
        traveledPath = [...traveledPath, { lat: previous.lat + dLat, lng: previous.lng + dLng }];
      }

      let next: AppState = {
        ...state,
        run: {
          ...state.run,
          steps,
          distanceM,
          elapsedSec,
          currentPaceSec: pace,
          caloriesKcal: kcal,
          collectedCheckpointIds: collected,
          traveledPath,
        },
        sensor: { ...state.sensor, cadence, stepCount: steps },
      };

      if (newlyHit) next = pushToast(next, `เก็บจุด ${newlyHit} แล้ว +15 coin`, 'success');
      return next;
    }

    case 'RUN_FINISH': {
      const route = state.routes.find((r) => r.id === state.run.routeId);
      const distanceKm = state.run.distanceM / 1000;
      const paceSec = paceSecPerKm(state.run.distanceM, state.run.elapsedSec);

      const checkpointCoins = route
        ? route.checkpoints
            .filter((c) => state.run.collectedCheckpointIds.includes(c.id))
            .reduce((s, c) => s + c.coinReward, 0)
        : state.run.collectedCheckpointIds.length * FREE_RUN_TOWER_REWARD;

      const breakdown = coinsForRun(distanceKm, checkpointCoins, state.user.streakDays);

      const record: RunRecord = {
        id: `run-${Date.now()}`,
        routeId: state.run.routeId ?? '',
        zoneId: route?.zoneId ?? '',
        startedAt: state.run.startedAt ?? Date.now() - state.run.elapsedSec * 1000,
        finishedAt: Date.now(),
        distanceKm: +distanceKm.toFixed(2),
        durationSec: state.run.elapsedSec,
        paceSec,
        caloriesKcal: Math.round(state.run.caloriesKcal),
        coinsEarned: breakdown.total,
        checkpointsCollected: state.run.collectedCheckpointIds.filter((id) => !id.endsWith('-start')).length,
        mode: state.run.mode,
        traveledPath: state.run.traveledPath,
      };

      return {
        ...state,
        run: { ...state.run, status: 'finished' },
        lastResult: record,
        lastResultSaved: false,
        ui: { ...state.ui, screen: 'finish' },
      };
    }

    case 'RUN_SAVE': {
      const record = state.lastResult;
      if (!record || state.lastResultSaved || state.history.some((item) => item.id === record.id)) return state;
      const route = state.routes.find((item) => item.id === record.routeId);
      const weeklyDistanceKm = +(state.user.weeklyDistanceKm + record.distanceKm).toFixed(1);
      const leaderboards = { ...state.leaderboards };
      if (route) {
        const rows = (leaderboards[route.zoneId] ?? []).map((entry) =>
          entry.userId === state.user.id
            ? {
                ...entry,
                distanceKm: weeklyDistanceKm,
                paceSec: record.paceSec || entry.paceSec,
                paceTier: paceTierFromPace(record.paceSec || entry.paceSec),
                distanceTier: distanceTierFromKm(weeklyDistanceKm),
                runsThisWeek: entry.runsThisWeek + 1,
              }
            : entry
        );
        leaderboards[route.zoneId] = rows.sort((a, b) => b.distanceKm - a.distanceKm);
      }
      return pushToast({
        ...state,
        history: [record, ...state.history],
        lastResultSaved: true,
        leaderboards,
        user: {
          ...state.user,
          coins: state.user.coins + record.coinsEarned,
          totalDistanceKm: +(state.user.totalDistanceKm + record.distanceKm).toFixed(1),
          weeklyDistanceKm,
          paceTier: record.paceSec ? paceTierFromPace(record.paceSec) : state.user.paceTier,
          distanceTier: distanceTierFromKm(weeklyDistanceKm),
        },
      }, 'บันทึกกิจกรรมแล้ว เพิ่มลงในประวัติเรียบร้อย', 'success');
    }

    case 'RUN_RESET':
      return {
        ...state,
        run: emptyRun,
        lastResult: null,
        lastResultSaved: false,
        gps: { ...state.gps, quality: 'idle', accuracyM: null, lastFixAt: null, rejectedPoints: 0, message: 'พร้อมตรวจสอบ GPS', lastPosition: null },
        sensor: { ...state.sensor, stepCount: 0, cadence: 0, magnitude: 0 },
      };

    case 'GPS_STATUS':
      return {
        ...state,
        gps: {
          ...state.gps,
          permission: action.permission ?? state.gps.permission,
          quality: action.quality,
          accuracyM: action.accuracyM === undefined ? state.gps.accuracyM : action.accuracyM,
          message: action.message,
        },
      };

    case 'RUN_GPS_UPDATE': {
      if (!['running', 'countdown', 'paused'].includes(state.run.status)) return state;
      const weak = action.accuracyM > 25;
      if (!Number.isFinite(action.accuracyM) || action.accuracyM > 60) {
        return {
          ...state,
          gps: {
            ...state.gps, permission: 'granted', quality: 'weak', accuracyM: action.accuracyM,
            rejectedPoints: state.gps.rejectedPoints + 1,
            message: 'สัญญาณอ่อน กำลังรอจุดที่แม่นยำกว่า',
          },
        };
      }

      const previous = state.gps.lastPosition;
      let addedM = 0;
      if (previous) {
        const segmentM = geoDistanceM(previous, action.position);
        const dtSec = Math.max(0.5, (action.timestamp - (state.gps.lastFixAt ?? action.timestamp - 1000)) / 1000);
        const implausibleJump = segmentM / dtSec > 8.5 || segmentM > Math.max(120, action.accuracyM * 4);
        if (implausibleJump) {
          return {
            ...state,
            gps: {
              ...state.gps, permission: 'granted', quality: 'weak', accuracyM: action.accuracyM,
              rejectedPoints: state.gps.rejectedPoints + 1,
              message: 'ตัดจุด GPS ที่กระโดดผิดปกติออกแล้ว',
            },
          };
        }
        // Ignore sub-metre jitter without preventing the accepted fix from refreshing GPS status.
        addedM = segmentM >= 1 ? segmentM : 0;
      }

      const distanceM = state.run.distanceM + (state.run.status === 'running' ? addedM : 0);
      const traveledPath = state.run.status === 'paused'
        ? state.run.traveledPath
        : [...state.run.traveledPath, action.position].slice(-1000);
      return {
        ...state,
        gps: {
          ...state.gps, permission: 'granted', quality: weak ? 'weak' : 'good',
          accuracyM: action.accuracyM, lastFixAt: action.timestamp,
          message: weak ? 'GPS ใช้งานได้ แต่ความแม่นยำยังต่ำ' : 'GPS พร้อมติดตามเส้นทาง',
          lastPosition: action.position,
        },
        run: {
          ...state.run,
          distanceM,
          traveledPath,
          currentPaceSec: paceSecPerKm(distanceM, state.run.elapsedSec),
          caloriesKcal: estimatedCalories(state.user.weightKg, distanceM / 1000),
        },
      };
    }

    /* ---------------- shop ---------------- */
    case 'REDEEM': {
      const reward = state.rewards.find((r) => r.id === action.rewardId);
      if (!reward) return state;
      if (state.user.coins < reward.coinCost) return pushToast(state, 'coin ไม่พอ วิ่งอีกนิดนะ', 'warn');
      if (reward.stock <= 0) return pushToast(state, 'คูปองหมดแล้ว', 'warn');

      const item: RedeemedReward = {
        id: `rd-${Date.now()}`,
        rewardId: reward.id,
        code: couponCode(),
        redeemedAt: Date.now(),
        used: false,
      };

      return pushToast(
        {
          ...state,
          user: { ...state.user, coins: state.user.coins - reward.coinCost },
          rewards: state.rewards.map((r) => (r.id === reward.id ? { ...r, stock: r.stock - 1 } : r)),
          redeemed: [item, ...state.redeemed],
        },
        `แลกสำเร็จ โค้ด ${item.code}`,
        'success'
      );
    }

    /* ---------------- planner ---------------- */
    case 'PLAN_LOADING':
      return { ...state, planner: { status: 'loading', error: null, plan: null } };

    case 'PLAN_READY':
      return { ...state, planner: { status: 'ready', error: null, plan: action.plan } };

    case 'PLAN_ERROR':
      return { ...state, planner: { status: 'error', error: action.error, plan: null } };

    /* ---------------- community ---------------- */
    case 'POST_REVIEW': {
      const list = state.reviews[action.zoneId] ?? [];
      const review = {
        id: `rv-${Date.now()}`,
        zoneId: action.zoneId,
        userId: state.user.id,
        name: state.user.name,
        avatar: state.user.avatar,
        rating: action.rating,
        text: action.text,
        createdAt: Date.now(),
      };
      return { ...state, reviews: { ...state.reviews, [action.zoneId]: [review, ...list] } };
    }

    case 'POST_CHAT': {
      const list = state.chat[action.zoneId] ?? [];
      const msg = {
        id: `c-${Date.now()}`,
        zoneId: action.zoneId,
        userId: state.user.id,
        name: state.user.name,
        avatar: state.user.avatar,
        text: action.text,
        createdAt: Date.now(),
        isMe: true,
      };
      return { ...state, chat: { ...state.chat, [action.zoneId]: [...list, msg] } };
    }

    /* ---------------- toast ---------------- */
    case 'TOAST':
      return pushToast(state, action.text, action.tone ?? 'info');

    case 'TOAST_DISMISS':
      return { ...state, ui: { ...state.ui, toasts: state.ui.toasts.filter((t) => t.id !== action.id) } };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'runtown.v1';

/** เก็บเฉพาะสิ่งที่ผู้ใช้ "ได้มา" — ไม่เก็บ mock data และไม่เก็บ run ที่ค้างอยู่ */
function persist(state: AppState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: state.user,
        redeemed: state.redeemed,
        history: state.history,
        rewards: state.rewards,
      })
    );
  } catch { /* โหมด private / เต็ม — ปล่อยผ่าน */ }
}

function hydrate(base: AppState): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    return {
      ...base,
      user: { ...base.user, ...saved.user },
      redeemed: saved.redeemed ?? [],
      history: saved.history ?? [],
      rewards: saved.rewards ?? base.rewards,
    };
  } catch {
    return base;
  }
}

/** เรียกจากหน้า profile: ปุ่ม "รีเซ็ตเดโม" — ต้องมี ไม่งั้นซ้อมรอบสองเริ่มใหม่ไม่ได้ */
export function clearDemoData() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, hydrate);

  useEffect(() => { persist(state); }, [state.user, state.redeemed, state.history, state.rewards]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp ต้องอยู่ภายใน <AppProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Selectors — derived value อ่านที่นี่ อย่าคำนวณซ้ำใน component        */
/* ------------------------------------------------------------------ */

export function useSelectedZone() {
  const { state } = useApp();
  return state.zones.find((z) => z.id === state.ui.selectedZoneId) ?? null;
}

export function useActiveRoute() {
  const { state } = useApp();
  const id = state.run.routeId ?? state.ui.selectedRouteId;
  return state.routes.find((r) => r.id === id) ?? null;
}

export function useZoneRoutes(zoneId: string | null) {
  const { state } = useApp();
  return zoneId ? state.routes.filter((r) => r.zoneId === zoneId) : [];
}

export function useMerchant(merchantId: string) {
  const { state } = useApp();
  return state.merchants.find((m) => m.id === merchantId) ?? null;
}

/** ยอดคนวิ่งทั้งจังหวัดตอนนี้ — ใช้เป็นตัวเลขพาดหัวบนหน้าแผนที่ */
export function useLiveRunnerTotal() {
  const { state } = useApp();
  return state.zones.reduce((s, z) => s + z.liveRunners, 0);
}
