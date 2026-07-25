/**
 * เก็บ snapshot ของ rank ก่อน RUN_FINISH ไว้ชั่วคราว ข้ามขอบเขต component
 * (ActiveRunScreen capture ตอนกด Stop -> RunTab อ่านตอน mount ตอน screen เปลี่ยนเป็น 'finish'
 * เพื่อโชว์ "อันดับขยับ" ในใบเสร็จ)
 *
 * ไม่ใช่ state ของแอปตาม STATE_DESIGN.md — เป็นแค่ตัวแปรส่งผ่าน UI ระหว่าง component
 * ไม่ผ่าน dispatch เพราะไม่ใช่ business data และ AppContext.tsx ห้ามแก้
 */
let rankBeforeFinish: number | null = null;

export function setRankBeforeFinish(rank: number | null) {
  rankBeforeFinish = rank;
}

/** อ่านครั้งเดียวแล้วเคลียร์ทิ้ง กันค่าเก่าเปื้อนรอบวิ่งถัดไป */
export function consumeRankBeforeFinish(): number | null {
  const value = rankBeforeFinish;
  rankBeforeFinish = null;
  return value;
}
