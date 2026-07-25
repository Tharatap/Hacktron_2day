# RunTown — State Design (handoff)

ไฟล์นี้คือ contract กลาง ให้แนบไปกับ Claude Code ตอนสั่งงานทุกครั้ง
UI ที่ได้จาก Stitch / AI Studio ให้เอามา **เสียบเข้ากับ state นี้** ไม่ใช่เขียน state ใหม่

---

## โครงไฟล์

```
src/
├─ types.ts                 ← type ทั้งหมด (แหล่งความจริงเดียว)
├─ lib/
│  ├─ formulas.ts           ← สูตร: stride, calories, coin, tier, geo
│  └─ stepDetector.ts       ← จับก้าวจาก accelerometer + simulator สำรอง
├─ data/
│  └─ mockData.ts           ← ชลบุรี 6 โซน, 7 เส้นทาง, 6 ร้าน, 8 คูปอง
└─ state/
   ├─ AppContext.tsx        ← reducer + provider + selectors
   └─ useRunEngine.ts       ← กาวเชื่อม sensor → state
```

---

## กติกา 3 ข้อ (ห้ามผิด ไม่งั้นเย็บไม่ติดตอนตี 2)

1. **ห้ามเก็บข้อมูลธุรกิจใน `useState` ของ component** — coin, ระยะทาง, rank, คูปอง ทั้งหมดอยู่ใน `useApp()`
   `useState` ใช้ได้เฉพาะ UI ล้วน เช่น modal เปิด/ปิด, tab ที่เลือกอยู่
2. **ค่าที่คำนวณได้ห้ามเก็บซ้ำ** — pace, kcal, rank คำนวณจาก `formulas.ts` ทุกครั้ง
3. **เปลี่ยน state ผ่าน `dispatch` เท่านั้น**

---

## Flow หลัก — วงกลมที่ต้องเดินครบตอนพรีเซนต์

```
[Map] เลือกโซน
   ↓ SELECT_ZONE
[Zone] ดู leaderboard / รีวิว / แชท → เลือกเส้นทาง
   ↓ armRun(routeId)   ← ขอ permission ที่นี่ (iOS บังคับ user gesture)
[Run] RUN_START → RUN_TICK ทุก 1 วิ → เก็บ checkpoint อัตโนมัติ
   ↓ RUN_FINISH        ← คิด coin, อัปเดต leaderboard, เขียน lastResult
[Finish] โชว์ ระยะ/pace/kcal/coin breakdown/อันดับที่ขยับ
   ↓ NAV 'shop'
[Shop] REDEEM → หักcoin → ได้โค้ดคูปอง
   ↓ NAV 'planner'
[Planner] PLAN_LOADING → เรียก Gemini → PLAN_READY
```

**จุดที่ต้องโชว์บนเวที:** coin ที่ได้จากหน้า Run ต้องไปโผล่ในหน้า Shop จริง
นี่คือสิ่งเดียวที่พิสูจน์ว่า "เศรษฐกิจในแอปนี้ทำงาน" ไม่ใช่แค่ 5 หน้าที่สวยแยกกัน

---

## Ranking — จุดต่างจาก Strava

`filterLeaderboard(entries, paceTier, distanceTier)`

แบ่งเป็น 4 phase ตาม pace: `walker / jogger / runner / racer`
คูณกับ 4 ระดับระยะ: `3K / 5K / 10K / Half+`

มือใหม่ที่ pace 8 นาที/กม. แข่งกับมือใหม่ด้วยกัน ไม่ต้องไปเทียบกับคนที่ pace 4 นาที
**บนเวทีต้องกดสลับ filter ให้กรรมการเห็นว่าอันดับเปลี่ยนจริง** ไม่ใช่แค่พูด

---

## Feature 6 — sensor

- `createStepDetector()` — peak detection บน magnitude ของ accelerometer
- ตัวแปรที่ต้อง tune หน้างานคือ **`threshold` ตัวเดียว** (default 2.2)
  แกว่งแรงแล้วนับเกิน → เพิ่มเป็น 3.0 / แกว่งเบาแล้วไม่นับ → ลดเป็น 1.5
- ระยะทาง = ก้าว × stride ที่ผันตาม cadence (ไม่ใช่ค่าคงที่)
- `createRunSimulator()` = ปุ่มสำรอง ต้องมีป้าย **SIMULATED** บนจอเสมอ

**ต้องทำก่อนอย่างอื่น:** deploy ขึ้น Vercel ให้ได้ HTTPS
`DeviceMotionEvent` ไม่ทำงานบน http:// — เปิดจากมือถือผ่าน IP ในวง LAN จะเงียบสนิท

---

## สูตรที่ตรวจแล้ว (ตัวเลขจริงจากการรัน)

วิ่ง 30 นาที cadence 168 spm สูง 168 ซม. หนัก 58 กก.:

| ค่า | ผลลัพธ์ |
|---|---|
| stride | 0.72 ม. |
| ระยะทาง | 3.65 กม. |
| ความเร็ว | 7.3 กม./ชม. (MET 7.4) |
| pace | 8'14" |
| แคลอรี่ | 226 kcal |

สมเหตุสมผลสำหรับ jogger — ถ้ากรรมการถาม เปิด `formulas.ts` ตอบได้ทันที
แคลอรี่ใช้สูตรมาตรฐาน `MET × 3.5 × น้ำหนัก ÷ 200 × นาที`

---

## Coin economy

```
coin = floor(กม. × 10) + checkpoint(15/จุด, เส้นชัย 25) + streak(วันละ 2, สูงสุด 7 วัน)
เพดานวันละ 300 coin  ← กันคนแกว่งมือถือทั้งวัน
```

หน้า Finish ต้องโชว์ **breakdown เป็นบรรทัดๆ** ไม่ใช่ตัวเลขก้อนเดียว
`commissionBaht(valueBaht, rate)` ใช้ตอนเล่าโมเดลรายได้:
คูปอง 300 บาท × commission 12% = แอปได้ 36 บาท ต่อคนที่เดินเข้าร้านจริง

---

## สิ่งที่ยังไม่มีในไฟล์นี้ (ต้องทำต่อ)

- [ ] หน้า UI ทั้ง 5 หน้า
- [ ] Leaflet map + วาด zone/polyline/marker
- [ ] `callGemini()` — ต้องคืน JSON ตรงกับ type `TrainingPlan`
- [ ] `.ics` export แทน Google Calendar OAuth
- [ ] ปุ่ม "รีเซ็ตเดโม" ที่หน้า profile → เรียก `clearDemoData()` **อันนี้ห้ามลืม ไม่งั้นซ้อมรอบสองเริ่มใหม่ไม่ได้**

## สิ่งที่ต้องเช็คด้วยตาก่อนเดโม

พิกัดใน `mockData.ts` เป็นค่าประมาณ **เปิดแผนที่เลื่อนหมุดให้ตรงก่อน**
ถ้าหมุดบางแสนไปลงกลางทะเล กรรมการเห็นทันทีในวินาทีแรก — ใช้เวลา 10 นาที คุ้มที่สุดในโปรเจกต์นี้
