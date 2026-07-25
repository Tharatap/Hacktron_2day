# งานต่อ: เชื่อม state contract เข้ากับ UI ที่เหลือ (RunTown)

## บริบทโปรเจกต์

repo นี้มี state contract กลางอยู่ที่ `runtown/src/` (มาจาก `files/*.ts` เดิม ย้ายเข้ามาแล้ว) และ UI จาก Stitch อยู่ใน `runtown/src/components/*.tsx`

**อ่านไฟล์นี้ก่อนแก้อะไรทั้งหมด:** `files/STATE_DESIGN.md` — เป็น contract กลาง มีกติกา 3 ข้อที่ห้ามผิด:
1. ห้ามเก็บข้อมูลธุรกิจ (coin, ระยะทาง, rank, คูปอง) ใน `useState` ของ component — ต้องอยู่ใน `useApp()` เท่านั้น. `useState` ใช้ได้เฉพาะ UI ล้วน (modal เปิด/ปิด, tab ที่เลือก)
2. ค่าที่คำนวณได้ (pace, kcal, rank, coin breakdown) ห้ามเก็บซ้ำ — คำนวณจาก `lib/formulas.ts` ทุกครั้ง
3. เปลี่ยน state ผ่าน `dispatch` เท่านั้น

โครงไฟล์ปัจจุบัน (ทำเสร็จแล้ว ห้ามย้าย/แก้ซ้ำ):
```
runtown/src/
├─ types.ts                 ← type contract เดียว ของจริง
├─ App.tsx                  ← เขียนใหม่แล้ว: wrap ด้วย <AppProvider>, route ตาม state.ui.screen
├─ lib/
│  ├─ formulas.ts           ← สูตรทั้งหมด (stride, calories, coin, tier, geo) — ห้ามคำนวณซ้ำนอกไฟล์นี้
│  └─ stepDetector.ts       ← sensor
├─ data/
│  └─ mockData.ts           ← ข้อมูลจริงทั้งหมด (ZONES, ROUTES, MERCHANTS, REWARDS, LEADERBOARDS, ...)
├─ state/
│  ├─ AppContext.tsx        ← reducer + provider + selectors — **ห้ามแก้ไฟล์นี้เด็ดขาด** เป็น source of truth
│  └─ useRunEngine.ts       ← กาวเชื่อม sensor → state — **ห้ามแก้ไฟล์นี้เด็ดขาด**
└─ components/
   ├─ Header.tsx    ✅ แปลงแล้ว, tsc ผ่าน
   ├─ Navbar.tsx    ✅ แปลงแล้ว, tsc ผ่าน
   ├─ MapTab.tsx    ✅ แปลงแล้ว, tsc ผ่าน
   ├─ RunTab.tsx    ✅ แปลงแล้ว, tsc ผ่าน
   ├─ ShopTab.tsx   ❌ ยังไม่แปลง — ทำต่อจากตรงนี้
   ├─ PlanTab.tsx   ❌ ยังไม่แปลง
   └─ ProfileTab.tsx❌ ยังไม่แปลง
```

## งาน

แปลง `ShopTab.tsx` → `PlanTab.tsx` → `ProfileTab.tsx` ตามลำดับนี้ ให้อ่าน/เขียนข้อมูลผ่าน `useApp()` (จาก `state/AppContext.tsx`) แทนของเดิมทั้งหมด (props, `useState` สำหรับข้อมูลธุรกิจ, import จาก `../types`/`../data/mockData` ที่ไม่มีอยู่จริงแล้ว)

**กติการะหว่างแปลง (สำคัญมาก อย่าข้าม):**
- เก็บ JSX, className, layout, สี จาก Stitch ไว้เหมือนเดิมทุกอย่าง — เปลี่ยนเฉพาะแหล่งข้อมูล
- ห้ามเพิ่มฟีเจอร์ใหม่ที่ไม่มีใน JSX เดิม (เช่น ห้ามเพิ่มปุ่ม filter ใหม่ที่ไม่มีเดิม) ยกเว้นกรณีที่ STATE_DESIGN.md สั่งไว้ตรงๆ ว่าต้องมี (ดูหัวข้อ ProfileTab ด้านล่าง มีปุ่มนึงที่ต้องเพิ่ม)
- **ถ้า component ต้องการ field ที่ไม่มีใน `types.ts` ให้หยุดถามก่อน ห้ามเพิ่ม field เองใน types.ts** (ไฟล์นั้นเป็น source of truth ห้ามแก้)
- แปลงเสร็จแต่ละไฟล์ ให้รัน `cd runtown && npx tsc --noEmit` เช็คว่าไฟล์นั้น "ไม่มี error ของตัวเองเหลือ" ก่อนไปไฟล์ถัดไป (error ในไฟล์อื่นที่ยังไม่แปลงเป็นเรื่องปกติ ข้ามไปได้)
- ห้ามแตะ `state/AppContext.tsx`, `state/useRunEngine.ts`, `types.ts`, `lib/formulas.ts`, `data/mockData.ts`

## Pattern ที่ทำไว้แล้วใน MapTab.tsx / RunTab.tsx ให้ทำตามแบบเดียวกัน

1. **Asset ตกแต่งที่ไม่มีใน types.ts (รูปภาพ, ตำแหน่ง pixel)** → เก็บเป็น presentation-only table แยกต่างหากในไฟล์ component เอง (ดูตัวอย่าง `ZONE_ART` ใน `MapTab.tsx`) ผูกกับ id จริงจาก state ไม่ใช่เก็บใน types.ts/AppContext
2. **ค่าที่ derive ได้แต่ AppContext ไม่ได้เก็บ** (เช่น coin breakdown ตอนจบวิ่ง) → คำนวณสดใน component ด้วยฟังก์ชันจาก `lib/formulas.ts` โดยใช้ข้อมูลที่ยังอยู่ใน state (ดู `coinsForRun()` ใน `RunTab.tsx` — คำนวณ breakdown ใหม่จาก `lastResult` + `run.collectedCheckpointIds` แทนที่จะเก็บ breakdown ไว้ใน state)
3. **ค่าที่ต้อง snapshot ไว้ก่อน dispatch เพราะ dispatch แล้วข้อมูลเก่าหาย** (เช่น rank ก่อน/หลังจบวิ่ง) → เก็บใน local `useState` ชั่วคราว (ถือเป็น UI-only ตามกติกาข้อ 1 เพราะไม่ใช่ business data ถาวร) ดูตัวอย่าง `rankBeforeFinish` ใน `RunTab.tsx`
4. **guard กัน state แปลกๆ ที่ Stitch ไม่เคยคิดเผื่อ** (เช่น user กด tab "Run" ตรงๆ จาก Navbar โดยยังไม่ได้ arm run) → เพิ่ม guard เล็กๆ ถ้าปล่อยไว้จะกลายเป็นบั๊กจริง ไม่ใช่แค่ UI แปลก (ดู idle-state guard ใน `RunTab.tsx`)
5. Screen routing ใน `App.tsx`: `'zone'` → render `MapTab`, `'finish'` → render `RunTab` (เพราะ component ทั้งสองมี detail-view ในตัวอยู่แล้ว ไม่มี component แยกสำหรับ 2 screen นี้)

## รายละเอียดเฉพาะไฟล์ — จุดที่ต้องระวัง

### ShopTab.tsx (ทำก่อน — mapping ปกติ ไม่มี blocker ใหญ่)

- Props เดิม `coins`, `onRedeemReward` → ตัด, ใช้ `state.user.coins` และ `dispatch({ type: 'REDEEM', rewardId })`
- Type เดิม `ShopReward` (title, description, image, category ไทย, location) **ไม่มีอยู่แล้ว** ต้องประกอบจาก 2 type ใหม่:
  - `Reward` (types.ts): id, merchantId, title, valueBaht, coinCost, stock, expiresInDays
  - `Merchant` (types.ts): id, name, category (`'gear'|'food'|'health'|'event'` — เป็นอังกฤษ ไม่ใช่ไทยเหมือนเดิม), district, location, commissionRate, blurb
  - หา merchant ของแต่ละ reward ด้วย `state.merchants.find(m => m.id === reward.merchantId)`
  - `description` → ใช้ `merchant.blurb`, `location` → ใช้ `merchant.district`
  - category filter chip เดิมเป็นภาษาไทย (`'อุปกรณ์','อาหาร','สุขภาพ','งานวิ่ง'`) ต้องทำ mapping table เอง เช่น `{ gear: 'อุปกรณ์', food: 'อาหาร', health: 'สุขภาพ', event: 'งานวิ่ง' }`
  - `image` **ไม่มีใน Reward/Merchant เลย** → ทำ presentation table แยก (เหมือน `ZONE_ART`) เก็บ URL รูปเดิมจาก git history (`git show HEAD~10:runtown/src/data/mockData.ts` หรือดูใน `git log` ของ SHOP_REWARDS เดิม ถ้าหาไม่เจอให้ถามผู้ใช้)
  - `annotation` (ป้าย signature สีแดง เช่น "ลดวันนี้เท่านั้น") ไม่มีข้อมูลจริงรองรับ → ตัดออก หรือเก็บเป็น decorative ใน presentation table เดียวกัน (ไม่ใช่ business data)
- **จุดสำคัญที่ต้องแก้ logic จริง ไม่ใช่แค่ swap prop:** เดิม component สุ่ม coupon code เองในเครื่อง (`RT-${Math.random()...}`) แต่ reducer's `REDEEM` action สร้างโค้ดให้อยู่แล้ว (`couponCode()` ใน AppContext.tsx) และเก็บลง `state.redeemed` (array, ล่าสุดอยู่ index 0) — **ห้ามสุ่มโค้ดเองอีก** ให้ dispatch REDEEM แล้วอ่านโค้ดจาก `state.redeemed[0].code` มาโชว์ใน modal แทน
- reducer เองมี guard "coin ไม่พอ"/"ของหมด" อยู่แล้ว (push toast แล้ว return state เดิม ไม่ redeem) — component แค่ disable ปุ่มไว้เป็น UX เฉยๆ พอ ไม่ต้อง validate ซ้ำ

### PlanTab.tsx (⚠️ หยุดถามผู้ใช้ก่อนลงมือ — อย่าทำเองอัตโนมัติ)

Component เดิมทั้งหมดเป็น local fake state (goal, schedule, AI insight) ไม่ผูกกับ contract อะไรเลย ส่วน contract ฝั่ง state มี `state.planner: { status, error, plan }` และ actions `PLAN_LOADING` / `PLAN_READY` / `PLAN_ERROR` รออยู่ **แต่ไม่มีฟังก์ชัน `callGemini()` อยู่ที่ไหนในโค้ดเลย** — และ `STATE_DESIGN.md` เองก็ระบุไว้ในหัวข้อ "สิ่งที่ยังไม่มีในไฟล์นี้" ว่า `callGemini()` ยังไม่ได้ทำ ต้องคืน JSON ตรงกับ type `TrainingPlan`

นี่ไม่ใช่แค่ field mapping — เป็นฟีเจอร์ที่ยังไม่มีอยู่จริง (เรียก Gemini API, ต้องมี API key/env var) **ห้ามเดาทำเองแบบไม่ถาม** เพราะเกี่ยวกับ external API call + secret management ให้หยุดแล้วถามผู้ใช้ว่า:
1. จะ implement `callGemini()` จริงตอนนี้เลยไหม (ต้องมี API key จากไหน เก็บใน env var ชื่ออะไร)
2. หรือแปลง UI ให้ผูกกับ `state.planner` โครงสร้างไว้ก่อน (loading/ready/error state ใช้งานได้) แต่ปุ่ม "สร้างแผนซ้อมด้วย AI" ยัง dispatch `PLAN_LOADING` เฉยๆ โดยยังไม่มี logic เรียก AI จริง (แสดง error state ไปพลางๆ) รอ implement `callGemini()` เป็นงานแยก

อย่าลงมือแก้ก่อนได้คำตอบจากผู้ใช้ในข้อนี้

### ProfileTab.tsx

- Props เดิม `profile`, `pastRuns`, `onUpdateHatColor` → ตัดหมด ใช้ `state.user`, `state.history`
- Mapping ปกติ: `profile.coins`→`user.coins`, `profile.totalKm`→`user.totalDistanceKm`, `profile.streakDays`→`user.streakDays`, `profile.avatarUrl`→`user.avatar` (เป็น emoji string ไม่ใช่ URL แล้ว ต้อง render เป็น text เหมือนที่ทำใน `Header.tsx` ไม่ใช่ `<img>`)
- `profile.totalRuns` ไม่มีใน User type ตรงๆ → ใช้ `state.history.length` แทน (จำนวนรอบวิ่งที่บันทึกจริง)
- ประวัติการวิ่ง (`pastRuns`/`MOCK_RUN_HISTORY` เดิม) → ใช้ `state.history: RunRecord[]` (ข้อมูลจริง ถูกเติมทุกครั้งที่ RUN_FINISH) แปลงฟิลด์แสดงผล:
  - `date` ← format จาก `finishedAt` (timestamp) เอง ไม่มีฟังก์ชันสำเร็จรูปใน formulas.ts อาจเขียน formatter สั้นๆ ในคอมโพเนนต์เอง (แค่ format วันที่ ไม่ใช่ business logic ไม่ผิดกติกา)
  - `location` ← หา zone จาก `state.zones.find(z => z.id === run.zoneId)?.name`
  - `timeFormatted` ← `formatDuration(run.durationSec)` จาก formulas.ts
  - `pace` ← `formatPace(run.paceSec)` จาก formulas.ts
- **⚠️ ต้องเพิ่ม (STATE_DESIGN.md บังคับ ไม่ใช่ทางเลือก):** ปุ่ม "รีเซ็ตเดโม" ที่หน้านี้ (ของเดิม Stitch ไม่มีปุ่มนี้เลย ต้องเพิ่มเข้าไปใหม่) เรียกฟังก์ชัน `clearDemoData()` ที่ export อยู่แล้วจาก `state/AppContext.tsx` — STATE_DESIGN.md เขียนไว้ตรงๆ ว่า "ห้ามลืม ไม่งั้นซ้อมรอบสองเริ่มใหม่ไม่ได้" กดแล้วควร reload หน้าเว็บด้วย (`window.location.reload()`) เพื่อให้ state กลับไปเป็น initialState ใหม่จริงๆ
- `hatColor` (ตกแต่งหมวก mascot) — **ไม่มีข้อมูลรองรับใน User type เลย** (ไม่ใช่ business data ตาม STATE_DESIGN, เป็นแค่ cosmetic) แนะนำ: เก็บเป็น local `useState` ล้วนๆ ในคอมโพเนนต์ (ไม่ persist ไม่ dispatch ไม่ผูกกับ user) ถือว่าเข้าเงื่อนไข "UI ล้วน" ตามกติกาข้อ 1 — ไม่ต้องหยุดถาม ทำแบบนี้ได้เลย แต่บอกผู้ใช้ในสรุปว่าเลือกทางนี้
- Badge/สติ๊กเกอร์สะสม (Beach Runner, 5K Finisher ฯลฯ) — ไม่มีระบบ achievement ใน type ไหนเลย ไม่ต้องผูกข้อมูลจริง เก็บเป็น decorative content แบบเดิมได้ (เหมือนที่ Community tab ใน MapTab.tsx ปล่อยเป็น decorative)

## หลังแปลงครบ 3 ไฟล์

1. `cd runtown && npx tsc --noEmit` ต้องไม่มี error เหลือเลยทั้งโปรเจกต์
2. เดิน flow เต็ม (ตามที่ STATE_DESIGN.md เขียนไว้): เปิดแอป → เลือกโซนใน Map → กด "เริ่มวิ่งที่นี่" (ต้องขอ permission จริงถ้าเป็น mobile browser) → ดูตัวเลขขยับใน Run tab (หรือ SIMULATED badge ถ้า permission โดนปฏิเสธ) → กด Stop → เห็นใบเสร็จพร้อม coin breakdown → กด "ใช้ coin (ไปร้านค้า)" → **ต้องเห็น coin ที่เพิ่งได้จริงในหน้า Shop** (จุดนี้คือจุดที่ STATE_DESIGN.md บอกว่าสำคัญที่สุด "พิสูจน์ว่าเศรษฐกิจในแอปทำงานจริง")
3. รายงานกลับว่าไฟล์ไหนแปลงแล้วบ้าง, ตัดสินใจอะไรไปเองบ้าง (โดยเฉพาะจุดที่ทำเครื่องหมาย ⚠️ ด้านบน), และ tsc ผ่านหรือไม่
