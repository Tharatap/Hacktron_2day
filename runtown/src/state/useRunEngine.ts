/**
 * useRunEngine — กาวเชื่อม sensor เข้ากับ state
 *
 * หน้า Run เรียก hook นี้ตัวเดียว ไม่ต้องยุ่งกับ addEventListener เอง
 *
 * ⚠️ กับดักที่ทำให้ตัวเลขไม่ขยับ: ถ้าเก็บ step ที่นับได้ไว้ใน useState
 * แล้วอ่านค่าใน setInterval callback จะได้ค่าเก่าค้าง (stale closure)
 * ที่นี่จึงใช้ useRef เก็บตัวนับ แล้ว flush เข้า reducer ทุก 1 วินาที
 */

import { createContext, createElement, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useApp } from './AppContext';
import {
  createStepDetector,
  createRunSimulator,
  subscribeMotion,
  requestMotionPermission,
  isMotionSupported,
  type StepDetector,
} from '../lib/stepDetector';

function useRunEngineCore() {
  const { state, dispatch } = useApp();
  const status = state.run.status;
  const mode = state.run.mode;
  const recoveryPrompt = state.ui.recoveryPrompt;

  const detectorRef = useRef<StepDetector | null>(null);
  const simulatorRef = useRef(createRunSimulator(168));
  const pendingStepsRef = useRef(0);
  const lastGpsDispatchRef = useRef(0);
  const gpsIsDemo = state.gps.quality === 'demo';

  if (!detectorRef.current) detectorRef.current = createStepDetector();

  /**
   * ต้องเรียกจาก onClick ของปุ่มโดยตรง (iOS บังคับ)
   * ห้ามห่อด้วย setTimeout หรือเรียกใน useEffect
   */
  const armRun = useCallback(
    async (routeId: string | null, options?: { demo?: boolean }): Promise<boolean> => {
      detectorRef.current?.reset();
      simulatorRef.current.reset();
      pendingStepsRef.current = 0;
      lastGpsDispatchRef.current = 0;

      if (options?.demo) {
        dispatch({ type: 'SENSOR_MODE', mode: 'simulate' });
        dispatch({ type: 'RUN_ARM', routeId });
        const route = state.routes.find((item) => item.id === routeId);
        const initial = route?.path[0]
          ?? state.zones.find((zone) => zone.id === state.user.homeZoneId)?.center
          ?? { lat: 13.286, lng: 100.914 };
        dispatch({ type: 'RUN_GPS_UPDATE', position: initial, accuracyM: 5, timestamp: Date.now() });
        dispatch({ type: 'GPS_STATUS', permission: 'granted', quality: 'demo', accuracyM: 5, message: 'โหมดสาธิต — ใช้เส้นทางจำลอง' });
        return true;
      }

      if (!isMotionSupported()) {
        dispatch({ type: 'SENSOR_PERMISSION', permission: 'unsupported' });
        dispatch({ type: 'SENSOR_MODE', mode: 'simulate' });
      } else {
        const permission = await requestMotionPermission();
        dispatch({ type: 'SENSOR_PERMISSION', permission });
        if (permission !== 'granted') {
          dispatch({ type: 'SENSOR_MODE', mode: 'simulate' });
          dispatch({ type: 'TOAST', text: 'ใช้โหมดจำลองแทน เพราะเข้าถึงเซนเซอร์ไม่ได้', tone: 'warn' });
        }
      }
      if (!('geolocation' in navigator)) {
        dispatch({ type: 'GPS_STATUS', permission: 'unsupported', quality: 'unavailable', accuracyM: null, message: 'อุปกรณ์นี้ไม่รองรับ GPS' });
        return false;
      }

      dispatch({ type: 'GPS_STATUS', quality: 'loading', accuracyM: null, message: 'กำลังรอ GPS ที่แม่นยำไม่เกิน 25 เมตร…' });
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          let best: GeolocationPosition | null = null;
          let lastError: GeolocationPositionError | null = null;
          let settled = false;
          const finish = (result?: GeolocationPosition, error?: unknown) => {
            if (settled) return;
            settled = true;
            navigator.geolocation.clearWatch(watchId);
            window.clearTimeout(timeoutId);
            if (result) resolve(result);
            else reject(error ?? new Error('GPS accuracy is not reliable enough'));
          };
          const watchId = navigator.geolocation.watchPosition(
            (candidate) => {
              if (!best || candidate.coords.accuracy < best.coords.accuracy) best = candidate;
              dispatch({
                type: 'GPS_STATUS', permission: 'granted', quality: candidate.coords.accuracy <= 25 ? 'good' : 'loading',
                accuracyM: candidate.coords.accuracy,
                message: candidate.coords.accuracy <= 25
                  ? 'GPS พร้อมเริ่มวิ่ง'
                  : `กำลังปรับความแม่นยำ GPS (±${Math.round(candidate.coords.accuracy)} ม.)`,
              });
              if (candidate.coords.accuracy <= 25) finish(candidate);
            },
            (error) => {
              lastError = error;
              if (error.code === error.PERMISSION_DENIED) finish(undefined, error);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 12_000 }
          );
          const timeoutId = window.setTimeout(() => {
            if (best && best.coords.accuracy <= 30) finish(best);
            else finish(undefined, lastError ?? new Error('GPS accuracy is above 30 metres'));
          }, 20_000);
        });
        lastGpsDispatchRef.current = position.timestamp || Date.now();
        dispatch({ type: 'RUN_ARM', routeId });
        dispatch({
          type: 'RUN_GPS_UPDATE',
          position: { lat: position.coords.latitude, lng: position.coords.longitude },
          accuracyM: position.coords.accuracy,
          timestamp: position.timestamp || Date.now(),
        });
        return true;
      } catch (error) {
        const geoError = error as GeolocationPositionError;
        const denied = geoError?.code === 1;
        dispatch({
          type: 'GPS_STATUS',
          permission: denied ? 'denied' : 'unknown',
          quality: 'unavailable',
          accuracyM: null,
          message: denied ? 'ปิดการเข้าถึงตำแหน่งอยู่ เปิดสิทธิ์ Location แล้วลองใหม่' : 'ยังหาตำแหน่งไม่ได้ ลองออกไปในที่โล่งแล้วกดอีกครั้ง',
        });
        return false;
      }
    },
    [dispatch, state.routes, state.user.homeZoneId, state.zones]
  );

  // ฟัง devicemotion เฉพาะตอนวิ่งจริงในโหมด sensor
  useEffect(() => {
    if (status !== 'running' || mode !== 'sensor' || recoveryPrompt) return;
    const detector = detectorRef.current!;
    const unsub = subscribeMotion(detector, (sample) => {
      if (sample.step) pendingStepsRef.current += sample.step;
      dispatch({ type: 'SENSOR_SAMPLE', magnitude: sample.magnitude });
    });
    return unsub;
  }, [status, mode, recoveryPrompt, dispatch]);

  // GPS จริง — ทุก session ใช้ตำแหน่งที่กรองแล้วเป็นแหล่งคำนวณระยะหลัก
  useEffect(() => {
    if (!['running', 'paused'].includes(status) || gpsIsDemo || recoveryPrompt) return;
    if (!('geolocation' in navigator)) {
      dispatch({ type: 'GPS_STATUS', permission: 'unsupported', quality: 'unavailable', message: 'อุปกรณ์นี้ไม่รองรับ GPS' });
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const timestamp = pos.timestamp || Date.now();
        if (timestamp - lastGpsDispatchRef.current < 900) return;
        lastGpsDispatchRef.current = timestamp;
        dispatch({
          type: 'RUN_GPS_UPDATE',
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracyM: pos.coords.accuracy,
          timestamp,
        });
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        dispatch({
          type: 'GPS_STATUS',
          permission: denied ? 'denied' : undefined,
          quality: 'unavailable',
          message: denied ? 'สิทธิ์ Location ถูกปิดระหว่างวิ่ง' : 'สัญญาณ GPS หาย — หยุดเพิ่มระยะชั่วคราว',
        });
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [status, gpsIsDemo, recoveryPrompt, dispatch]);

  // Recalculate from timestamps after the browser has throttled timers in the background.
  useEffect(() => {
    const syncTime = () => dispatch({ type: 'RUN_TIME_SYNC', now: Date.now() });
    document.addEventListener('visibilitychange', syncTime);
    window.addEventListener('pageshow', syncTime);
    return () => {
      document.removeEventListener('visibilitychange', syncTime);
      window.removeEventListener('pageshow', syncTime);
    };
  }, [dispatch]);

  // Best effort for the web build: keep the screen awake while actively recording.
  useEffect(() => {
    type WakeLockSentinelLike = { release: () => Promise<void> };
    const wakeLockNavigator = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
    };
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (status !== 'running' || document.visibilityState !== 'visible' || !wakeLockNavigator.wakeLock) return;
      try {
        const lock = await wakeLockNavigator.wakeLock.request('screen');
        if (cancelled) await lock.release();
        else sentinel = lock;
      } catch {
        // Wake Lock is optional and may be blocked by battery-saving policies.
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinel) void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (sentinel) void sentinel.release();
      sentinel = null;
    };
  }, [status]);

  // A watch can go silent without firing an error. Downgrade the status so users know distance is frozen.
  useEffect(() => {
    if (!['running', 'paused'].includes(status) || gpsIsDemo || !state.gps.lastFixAt || state.gps.quality === 'unavailable') return;
    const id = setInterval(() => {
      if (Date.now() - (state.gps.lastFixAt ?? 0) > 15_000) {
        dispatch({ type: 'GPS_STATUS', quality: 'weak', message: 'ไม่ได้รับจุด GPS ใหม่ ระยะจะไม่เพิ่มจนกว่าสัญญาณกลับมา' });
      }
    }, 5_000);
    return () => clearInterval(id);
  }, [dispatch, gpsIsDemo, state.gps.lastFixAt, state.gps.quality, status]);

  // นาฬิกาหลัก — flush ก้าวที่สะสมไว้เข้า reducer ทุก 1 วินาที
  useEffect(() => {
    if (status !== 'running' || recoveryPrompt) return;
    const id = setInterval(() => {
      if (mode === 'simulate') {
        const { newSteps, cadence } = simulatorRef.current.tick(1);
        dispatch({ type: 'RUN_TICK', newSteps, cadence });
      } else {
        const newSteps = pendingStepsRef.current;
        pendingStepsRef.current = 0;
        const cadence = detectorRef.current?.cadence() ?? 0;
        dispatch({ type: 'RUN_TICK', newSteps, cadence });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [status, mode, recoveryPrompt, dispatch]);

  return {
    armRun,
    start: useCallback(() => dispatch({ type: 'RUN_START' }), [dispatch]),
    pause: useCallback(() => dispatch({ type: 'RUN_PAUSE' }), [dispatch]),
    resume: useCallback(() => dispatch({ type: 'RUN_RESUME' }), [dispatch]),
    finish: useCallback(() => dispatch({ type: 'RUN_FINISH_AND_SAVE' }), [dispatch]),
    reset: () => {
      detectorRef.current?.reset();
      simulatorRef.current.reset();
      pendingStepsRef.current = 0;
      dispatch({ type: 'RUN_RESET' });
    },
    switchMode: (m: 'sensor' | 'simulate') => dispatch({ type: 'SENSOR_MODE', mode: m }),
  };
}

type RunEngineApi = ReturnType<typeof useRunEngineCore>;
const RunEngineContext = createContext<RunEngineApi | null>(null);

export function RunEngineProvider({ children }: { children: ReactNode }) {
  const engine = useRunEngineCore();
  return createElement(RunEngineContext.Provider, { value: engine }, children);
}

export function useRunEngine() {
  const context = useContext(RunEngineContext);
  if (!context) throw new Error('useRunEngine must be used inside RunEngineProvider');
  return context;
}
