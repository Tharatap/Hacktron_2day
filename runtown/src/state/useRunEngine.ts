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

  if (!detectorRef.current) detectorRef.current = createStepDetector();

  /**
   * ต้องเรียกจาก onClick ของปุ่มโดยตรง (iOS บังคับ)
   * ห้ามห่อด้วย setTimeout หรือเรียกใน useEffect
   */
  const armRun = useCallback(
    async (routeId: string) => {
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
      detectorRef.current?.reset();
      simulatorRef.current.reset();
      pendingStepsRef.current = 0;
      dispatch({ type: 'RUN_ARM', routeId });
    },
    [dispatch]
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
