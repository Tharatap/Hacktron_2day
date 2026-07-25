import type { TrainingPlan } from '../types';

/**
 * เรียกผ่าน /api/generate-plan (Vercel serverless function) เท่านั้น
 * ห้ามเรียก Gemini ตรงจากฝั่ง browser เพราะจะทำให้ API key หลุดไปอยู่ใน network tab
 */
export interface GeneratePlanParams {
  goalKm: number;
  days: number;
  constraints: string;
  paceTier: string;
  zones: { id: string; name: string; district: string }[];
}

export async function callGemini(params: GeneratePlanParams): Promise<TrainingPlan> {
  const res = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : null;
    throw new Error(message ?? `เรียก AI ไม่สำเร็จ (HTTP ${res.status})`);
  }

  return data as TrainingPlan;
}
