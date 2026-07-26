import React, { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { useRunEngine } from '../state/useRunEngine';
import { RoutePinPlanner } from './RoutePinPlanner';

export const RunStartScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const { armRun } = useRunEngine();
  const [weight, setWeight] = useState(String(state.user.weightKg));
  const [routeId, setRouteId] = useState<string>(state.ui.selectedRouteId ?? 'free');
  const [starting, setStarting] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [showRouteBuilder, setShowRouteBuilder] = useState(false);
  const parsedWeight = Number(weight);
  const weightValid = Number.isFinite(parsedWeight) && parsedWeight >= 25 && parsedWeight <= 350;

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  const begin = async (demo = false) => {
    if (!weightValid || starting) return;
    setStarting(true);
    dispatch({ type: 'USER_WEIGHT_SET', weightKg: parsedWeight });
    const ok = await armRun(routeId === 'free' ? null : routeId, { demo });
    if (!ok) setStarting(false);
  };

  const gpsTone = state.gps.quality === 'good' || state.gps.quality === 'demo'
    ? 'bg-[#DFF7E7]'
    : state.gps.quality === 'loading'
      ? 'bg-[#FFF2B8]'
      : state.gps.quality === 'unavailable' || state.gps.permission === 'denied'
        ? 'bg-[#FFD7D2]'
        : 'bg-white';

  return (
    <div className="flex flex-col gap-5 pb-6">
      {!online && <div role="status" className="bg-[#FFD7D2] border-2 border-ink rounded-xl p-3 hard-shadow-sm text-sm"><strong>ไม่มีอินเทอร์เน็ต</strong><br />ยังบันทึกการวิ่งด้วย GPS ได้ แต่แผนที่พื้นหลังอาจไม่โหลด</div>}

      <section className="bg-[#FF9B8E] border-2 border-[#14241C] hard-shadow-lg rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-3 -bottom-4 text-7xl" aria-hidden="true">🏃</div>
        <p className="font-handwritten-sm">พร้อมเมื่อคุณพร้อม</p>
        <h1 className="font-headline-lg-mobile mt-1">เริ่มวิ่งจริง</h1>
        <p className="text-sm mt-2 max-w-[265px]">เปิด GPS แล้วออกไปเก็บเส้นทาง เวลา เพซ และรางวัลแบบสดๆ</p>
      </section>

      <section className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4">
        <label htmlFor="run-weight" className="font-label-md">น้ำหนักสำหรับคำนวณแคลอรี่โดยประมาณ</label>
        <div className="flex items-center gap-2 mt-2">
          <input id="run-weight" type="number" min="25" max="350" step="0.1" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} aria-invalid={!weightValid} aria-describedby="weight-help" className="min-w-0 flex-1 min-h-12 border-2 border-[#14241C] rounded-xl px-3 font-headline-md text-xl" />
          <span className="font-label-md">kg</span>
        </div>
        <p id="weight-help" className={`text-xs mt-2 ${weightValid ? 'text-ink-soft' : 'text-[#A3271C] font-semibold'}`}>{weightValid ? 'ดึงจากโปรไฟล์แล้ว แก้ไขได้ก่อนเริ่ม' : 'กรอกน้ำหนักตั้งแต่ 25–350 กก.'}</p>
      </section>

      <section className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4">
        <label htmlFor="run-route" className="font-label-md">รูปแบบการวิ่ง</label>
        <select id="run-route" value={routeId} onChange={(event) => setRouteId(event.target.value)} className="mt-2 w-full min-h-12 border-2 border-[#14241C] rounded-xl px-3 bg-white font-body-md">
          <option value="free">วิ่งอิสระ — ติดตามเส้นทางจริง</option>
          {state.routes.map((route) => {
            const zone = state.zones.find((item) => item.id === route.zoneId);
            const mine = route.id.startsWith('custom-') ? 'ของฉัน • ' : '';
            return <option key={route.id} value={route.id}>{mine}{route.name} • {zone?.name ?? ''} • {route.distanceKm} km</option>;
          })}
        </select>
        <button type="button" onClick={() => setShowRouteBuilder(true)} className="mt-3 min-h-12 w-full rounded-full border-2 border-ink bg-lemon font-label-md hard-shadow-sm">
          <span className="material-symbols-outlined mr-2 align-middle" aria-hidden="true">add_location_alt</span>
          ปักหมุดสร้างเส้นทางล่ารางวัล
        </button>
      </section>

      <div className={`border-2 border-[#14241C] rounded-xl p-3 hard-shadow-sm flex items-start gap-3 ${gpsTone}`} role="status" aria-live="polite">
        <span className="material-symbols-outlined mt-0.5" aria-hidden="true">{state.gps.quality === 'loading' ? 'location_searching' : state.gps.permission === 'denied' ? 'location_off' : 'my_location'}</span>
        <div><strong className="font-label-md">สถานะตำแหน่ง</strong><p className="text-sm mt-0.5 text-ink-soft">{state.gps.message}</p>{state.gps.permission === 'denied' && <p className="text-xs mt-1 text-ink-soft">เปิด Location ในการตั้งค่าเบราว์เซอร์หรือโทรศัพท์ แล้วกดเริ่มอีกครั้ง</p>}</div>
      </div>

      <button onClick={() => begin(false)} disabled={!weightValid || starting} className="min-h-16 bg-grass disabled:bg-[#A9B8AE] disabled:text-ink-soft text-white border-2 border-ink hard-shadow-lg rounded-full font-headline-md text-xl flex items-center justify-center gap-2 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:shadow-none">
        <span className={`material-symbols-outlined text-3xl ${starting ? 'animate-pulse' : ''}`} aria-hidden="true">{starting ? 'location_searching' : 'play_arrow'}</span>
        {starting ? 'กำลังขอตำแหน่ง…' : 'เริ่มวิ่ง'}
      </button>

      {(state.gps.quality === 'unavailable' || state.gps.permission === 'denied' || !('geolocation' in navigator)) && (
        <button onClick={() => begin(true)} disabled={!weightValid || starting} className="min-h-12 bg-[#FFD84D] border-2 border-[#14241C] hard-shadow rounded-full font-label-md active:translate-y-0.5 active:shadow-none">เปิดโหมดสาธิตแทน</button>
      )}

      <p className="text-xs leading-relaxed text-ink-soft text-center px-3">แคลอรี่เป็นค่าประมาณจาก น้ำหนัก × ระยะทาง เท่านั้น ผลจริงแตกต่างตามความเร็ว ความชัน อายุ องค์ประกอบร่างกาย และปัจจัยเฉพาะบุคคล</p>

      {showRouteBuilder && <RoutePinPlanner onClose={() => setShowRouteBuilder(false)} onCreated={(id) => { setRouteId(id); setShowRouteBuilder(false); }} />}
    </div>
  );
};
