import { GoogleGenAI, Type } from '@google/genai';

/**
 * Vercel serverless function — เก็บ GEMINI_API_KEY ไว้ฝั่งเซิร์ฟเวอร์เท่านั้น
 * ห้ามเรียก Gemini ตรงจาก browser เด็ดขาด เพราะ key จะหลุดไปอยู่ใน network tab
 * ของทุกคนที่เปิดเว็บ (env var นี้ไม่ได้ตั้งชื่อ VITE_* จึงไม่ถูกฝังเข้า client bundle อยู่แล้ว)
 */

type PlanDayType = 'easy' | 'tempo' | 'long' | 'rest';

interface RequestBody {
  goalKm?: number;
  days?: number;
  constraints?: string;
  paceTier?: string;
  zones?: { id: string; name: string; district: string }[];
}

interface VercelReq {
  method?: string;
  body?: unknown;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
}

const VALID_TYPES: PlanDayType[] = ['easy', 'tempo', 'long', 'rest'];

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์ (Vercel Project Settings -> Environment Variables)' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as RequestBody;

  const goalKm = Number(body.goalKm) > 0 ? Number(body.goalKm) : 100;
  const days = Math.min(14, Math.max(1, Math.round(Number(body.days)) || 5));
  const constraints = String(body.constraints ?? '').slice(0, 300);
  const paceTier = String(body.paceTier ?? 'jogger');
  const zones = Array.isArray(body.zones) ? body.zones.slice(0, 10) : [];

  const zoneList =
    zones.map((z) => `${z.id}: ${z.name} (${z.district})`).join('\n') || 'ไม่มีข้อมูลโซนให้เลือก';

  const prompt = `คุณเป็นโค้ชวิ่งมืออาชีพ ช่วยออกแบบตารางซ้อมวิ่งให้นักวิ่งระดับ "${paceTier}"
เป้าหมายรวม ${goalKm} กม. ภายใน ${days} วัน
ข้อจำกัดของผู้ใช้: ${constraints || 'ไม่มี'}

โซนวิ่งที่มีให้เลือก (ใช้ id ตรงนี้เท่านั้นสำหรับ suggestedZoneId ถ้าไม่แน่ใจให้ใส่ null อย่าเดา id เอง):
${zoneList}

สร้างตารางซ้อม ${days} วัน เริ่มจากวันพรุ่งนี้ (${new Date(Date.now() + 86400000).toISOString().slice(0, 10)})
ผสมผสานประเภท easy/tempo/long/rest ให้สมเหตุสมผลตามหลักการซ้อมวิ่งจริง (ไม่ซ้อมหนักติดกันเกิน 2 วัน มีวันพักคั่น)
ผลรวม targetKm ของวันที่ไม่ใช่ rest ควรใกล้เคียง ${goalKm} กม.
ระบุช่วงเวลาซ้อม (timeSlot เช่น "06:00-07:00") และหมายเหตุสถานที่/เคล็ดลับสั้นๆ (note) เป็นภาษาไทย
พร้อมสรุปภาพรวมแผนทั้งหมด (summary) เป็นประโยคเดียวภาษาไทย`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: 'ISO date เช่น 2026-07-27' },
                  targetKm: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: VALID_TYPES },
                  timeSlot: { type: Type.STRING },
                  note: { type: Type.STRING },
                  suggestedZoneId: { type: Type.STRING, nullable: true },
                },
                required: ['date', 'targetKm', 'type', 'timeSlot', 'note'],
              },
            },
          },
          required: ['summary', 'schedule'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Gemini ไม่ตอบข้อมูลกลับมา');

    const parsed = JSON.parse(text) as {
      summary?: string;
      schedule?: Array<{
        date?: string;
        targetKm?: number;
        type?: string;
        timeSlot?: string;
        note?: string;
        suggestedZoneId?: string | null;
      }>;
    };

    if (!Array.isArray(parsed.schedule) || parsed.schedule.length === 0) {
      throw new Error('รูปแบบผลลัพธ์จาก AI ไม่ถูกต้อง (ไม่มี schedule)');
    }

    const validZoneIds = new Set(zones.map((z) => z.id));
    const schedule = parsed.schedule.map((day) => ({
      date: typeof day.date === 'string' ? day.date : new Date().toISOString().slice(0, 10),
      targetKm: Number(day.targetKm) || 0,
      type: (VALID_TYPES as string[]).includes(day.type ?? '') ? (day.type as PlanDayType) : 'easy',
      timeSlot: typeof day.timeSlot === 'string' ? day.timeSlot : '',
      note: typeof day.note === 'string' ? day.note : '',
      suggestedZoneId: day.suggestedZoneId && validZoneIds.has(day.suggestedZoneId) ? day.suggestedZoneId : null,
    }));

    res.status(200).json({
      goalKm,
      days,
      constraints,
      generatedAt: Date.now(),
      schedule,
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'เรียก Gemini ไม่สำเร็จ' });
  }
}
