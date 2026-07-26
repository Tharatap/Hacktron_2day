/**
 * useRunEngine — กาวเชื่อม sensor เข้ากับ state
 *
 * หน้า Run เรียก hook นี้ตัวเดียว ไม่ต้องยุ่งกับ addEventListener เอง
 *
 * ⚠️ กับดักที่ทำให้ตัวเลขไม่ขยับ: ถ้าเก็บ step ที่นับได้ไว้ใน useState
 * แล้วอ่านค่าใน setInterval callback จะได้ค่าเก่าค้าง (stale closure)
 * ที่นี่จึงใช้ useRef เก็บตัวนับ แล้ว flush เข้า reducer ทุก 1 วินาที
 */

import { useEffect, useRef, useCallback } from 'react';
import { useApp } from './AppContext';
import {
  createStepDetector,
  createRunSimulator,
  subscribeMotion,
  requestMotionPermission,
  isMotionSupported,
  type StepDetector,
} from '../lib/stepDetector';

export function useRunEngine() {
  const { state, dispatch } = useApp();
  const status = state.run.status;
  const mode = state.run.mode;

  const detectorRef = useRef<StepDetector | null>(null);
  const simulatorRef = useRef(createRunSimulator(168));
  const pendingStepsRef = useRef(0);
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

      dispatch({ type: 'GPS_STATUS', quality: 'loading', accuracyM: null, message: 'กำลังขอตำแหน่งปัจจุบัน…' });
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000,
          });
        });
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
    if (status !== 'running' || mode !== 'sensor') return;
    const detector = detectorRef.current!;
    const unsub = subscribeMotion(detector, (sample) => {
      if (sample.step) pendingStepsRef.current += sample.step;
      dispatch({ type: 'SENSOR_SAMPLE', magnitude: sample.magnitude });
    });
    return unsub;
  }, [status, mode, dispatch]);

  // GPS จริง — ทุก session ใช้ตำแหน่งที่กรองแล้วเป็นแหล่งคำนวณระยะหลัก
  useEffect(() => {
    if (!['running', 'paused'].includes(status) || gpsIsDemo) return;
    if (!('geolocation' in navigator)) {
      dispatch({ type: 'GPS_STATUS', permission: 'unsupported', quality: 'unavailable', message: 'อุปกรณ์นี้ไม่รองรับ GPS' });
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        dispatch({
          type: 'RUN_GPS_UPDATE',
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracyM: pos.coords.accuracy,
          timestamp: pos.timestamp || Date.now(),
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
  }, [status, gpsIsDemo, dispatch]);

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
    if (status !== 'running') return;
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
  }, [status, mode, dispatch]);

  return {
    armRun,
    start: () => dispatch({ type: 'RUN_START' }),
    pause: () => dispatch({ type: 'RUN_PAUSE' }),
    resume: () => dispatch({ type: 'RUN_RESUME' }),
    finish: () => dispatch({ type: 'RUN_FINISH' }),
    reset: () => {
      detectorRef.current?.reset();
      simulatorRef.current.reset();
      pendingStepsRef.current = 0;
      dispatch({ type: 'RUN_RESET' });
    },
    switchMode: (m: 'sensor' | 'simulate') => dispatch({ type: 'SENSOR_MODE', mode: m }),
  };
}
