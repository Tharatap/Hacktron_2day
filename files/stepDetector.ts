/**
 * Step detection จากการแกว่งมือถือ (feature 6)
 *
 * ⚠️ สองเรื่องที่ทำให้เดโมพังบ่อยที่สุด อ่านก่อนเขียน UI:
 *
 * 1. DeviceMotionEvent ทำงานบน HTTPS เท่านั้น
 *    localhost ผ่าน แต่เปิดจากมือถือผ่าน IP ในวง LAN จะไม่ทำงาน
 *    -> deploy ขึ้น Vercel ตั้งแต่ชั่วโมงแรก หรือใช้ ngrok
 *
 * 2. iOS (Safari 13+) ต้องขอ permission ผ่าน user gesture เท่านั้น
 *    เรียกจาก useEffect ไม่ได้ ต้องอยู่ใน onClick ของปุ่มที่ผู้ใช้กดจริง
 *    -> ปุ่ม "เริ่มวิ่ง" ต้องเป็นตัวขอ permission
 */

import type { SensorPermission } from '../types';

/* ------------------------------------------------------------------ */
/* Permission                                                          */
/* ------------------------------------------------------------------ */

interface DeviceMotionEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export function isMotionSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
}

export function needsPermissionPrompt(): boolean {
  if (!isMotionSupported()) return false;
  const D = window.DeviceMotionEvent as unknown as DeviceMotionEventStatic;
  return typeof D.requestPermission === 'function';
}

/**
 * ต้องเรียกจากภายใน onClick เท่านั้น (iOS requirement)
 */
export async function requestMotionPermission(): Promise<SensorPermission> {
  if (!isMotionSupported()) return 'unsupported';
  const D = window.DeviceMotionEvent as unknown as DeviceMotionEventStatic;

  if (typeof D.requestPermission !== 'function') {
    // Android / Chrome — ไม่ต้องขอ ใช้ได้เลย
    return 'granted';
  }
  try {
    const res = await D.requestPermission();
    return res === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/* ------------------------------------------------------------------ */
/* Step detector                                                       */
/* ------------------------------------------------------------------ */

export interface StepDetectorOptions {
  /** ระยะห่างขั้นต่ำระหว่างก้าว (ms) — 250ms = เพดาน 240 spm */
  minStepIntervalMs?: number;
  /** ความแรงที่ต้องเกิน baseline ถึงจะนับเป็นก้าว (m/s²) */
  threshold?: number;
  /** ค่าถ่วง low-pass filter 0..1 ยิ่งสูงยิ่งนิ่ง */
  smoothing?: number;
}

export interface StepSample {
  /** ความแรงรวมหลังหักแรงโน้มถ่วง — ใช้วาด waveform */
  magnitude: number;
  /** ก้าวที่เพิ่งตรวจได้ในตัวอย่างนี้ (0 หรือ 1) */
  step: number;
}

/**
 * อัลกอริทึม: peak detection บนขนาดของ acceleration
 *
 * 1. รวม x,y,z เป็น magnitude เดียว (ไม่สนว่าถือมือถือท่าไหน)
 * 2. low-pass filter หา baseline (แรงโน้มถ่วง + ค่าเฉลี่ยการเคลื่อนไหว)
 * 3. นับก้าวเมื่อ magnitude พุ่งเหนือ baseline+threshold แล้วตกกลับลงมา
 * 4. refractory period กันการนับซ้ำจากการสั่นความถี่สูง
 *
 * ที่ต้อง tune จริงหน้างาน: threshold ตัวเดียว
 * แกว่งมือแรง -> เพิ่ม (3.0), แกว่งเบา -> ลด (1.5)
 */
export function createStepDetector(opts: StepDetectorOptions = {}) {
  const minStepIntervalMs = opts.minStepIntervalMs ?? 250;
  const threshold = opts.threshold ?? 2.2;
  const smoothing = opts.smoothing ?? 0.85;

  let baseline = 9.81;
  let armed = false;
  let lastStepAt = 0;
  let totalSteps = 0;
  const recentStepTimes: number[] = [];

  return {
    /** เรียกทุกครั้งที่ได้ event จาก devicemotion */
    push(x: number, y: number, z: number, now = Date.now()): StepSample {
      const raw = Math.sqrt(x * x + y * y + z * z);
      baseline = baseline * smoothing + raw * (1 - smoothing);
      const delta = raw - baseline;

      let step = 0;
      if (!armed && delta > threshold) {
        // ขาขึ้นข้ามเส้น
        if (now - lastStepAt >= minStepIntervalMs) {
          step = 1;
          totalSteps += 1;
          lastStepAt = now;
          recentStepTimes.push(now);
          if (recentStepTimes.length > 12) recentStepTimes.shift();
        }
        armed = true;
      } else if (armed && delta < threshold * 0.4) {
        // ตกกลับลงมา พร้อมนับก้าวถัดไป
        armed = false;
      }

      return { magnitude: Math.abs(delta), step };
    },

    /** ก้าว/นาที คำนวณจากช่วงห่างของ 12 ก้าวล่าสุด */
    cadence(now = Date.now()): number {
      const fresh = recentStepTimes.filter((t) => now - t < 8000);
      if (fresh.length < 3) return 0;
      const span = (fresh[fresh.length - 1] - fresh[0]) / 1000;
      if (span <= 0) return 0;
      return Math.round(((fresh.length - 1) / span) * 60);
    },

    get steps() {
      return totalSteps;
    },

    reset() {
      baseline = 9.81;
      armed = false;
      lastStepAt = 0;
      totalSteps = 0;
      recentStepTimes.length = 0;
    },
  };
}

export type StepDetector = ReturnType<typeof createStepDetector>;

/* ------------------------------------------------------------------ */
/* Listener                                                            */
/* ------------------------------------------------------------------ */

/**
 * ผูก listener แล้วคืน unsubscribe
 * ใช้ accelerationIncludingGravity เพราะ Android หลายรุ่นไม่ส่ง acceleration เปล่า
 */
export function subscribeMotion(
  detector: StepDetector,
  onSample: (s: StepSample) => void
): () => void {
  const handler = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity ?? e.acceleration;
    if (!a || a.x == null || a.y == null || a.z == null) return;
    onSample(detector.push(a.x, a.y, a.z));
  };
  window.addEventListener('devicemotion', handler);
  return () => window.removeEventListener('devicemotion', handler);
}

/* ------------------------------------------------------------------ */
/* Simulator — ปุ่มสำรองตอนเดโมพัง                                      */
/* ------------------------------------------------------------------ */

/**
 * ปั่นก้าวปลอมด้วย cadence คงที่ + noise
 * ต้องมีเสมอ: ถ้า sensor ไม่ทำงานบนเครื่องกรรมการ ยังเดโมต่อได้
 * และต้องโชว์ป้าย "SIMULATED" บนหน้าจอ — ห้ามแอบ
 */
export function createRunSimulator(cadenceSpm = 168) {
  let carry = 0;
  return {
    /** คืนจำนวนก้าวใน dt วินาที */
    tick(dtSec = 1): { newSteps: number; cadence: number } {
      const jitter = 1 + (Math.random() - 0.5) * 0.08;
      carry += (cadenceSpm / 60) * dtSec * jitter;
      const newSteps = Math.floor(carry);
      carry -= newSteps;
      return { newSteps, cadence: Math.round(cadenceSpm * jitter) };
    },
    reset() {
      carry = 0;
    },
  };
}
