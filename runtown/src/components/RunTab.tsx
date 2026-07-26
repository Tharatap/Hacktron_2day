import React, { useState } from 'react';
import L from 'leaflet';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';
import { useActiveRoute, useApp } from '../state/AppContext';
import { useRunEngine } from '../state/useRunEngine';
import { formatDuration, formatPace } from '../lib/formulas';
import { ShareResultSheet } from './ShareResultSheet';
import type { LatLng } from '../types';

function SummaryMap({ path, fallback }: { path: LatLng[]; fallback: LatLng }) {
  const center = path[Math.floor(path.length / 2)] ?? fallback;
  const bounds = path.length > 1 ? L.latLngBounds(path.map((point) => [point.lat, point.lng] as [number, number])) : undefined;
  return (
    <MapContainer center={[center.lat, center.lng]} bounds={bounds} boundsOptions={{ padding: [24, 24] }} zoom={15} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} zoomControl={false} attributionControl={false} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {path.length > 1 && <Polyline positions={path.map((point) => [point.lat, point.lng] as [number, number])} pathOptions={{ color: '#FF5D50', weight: 6 }} />}
    </MapContainer>
  );
}

function dateTime(ts: number) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
}

export const RunTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const { reset } = useRunEngine();
  const activeRoute = useActiveRoute();
  const [showShare, setShowShare] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const result = state.lastResult;

  if (!result) {
    return <div className="py-20 text-center"><p className="font-headline-md">ไม่พบผลการวิ่งล่าสุด</p><button onClick={() => dispatch({ type: 'NAV', screen: 'run' })} className="mt-4 bg-[#0B8F55] text-white border-2 border-[#14241C] hard-shadow rounded-full px-5 py-3">เริ่มวิ่งใหม่</button></div>;
  }

  const homeCenter = state.zones.find((zone) => zone.id === state.user.homeZoneId)?.center ?? { lat: 13.286, lng: 100.914 };
  const achievement = result.distanceKm >= 10 ? '10K Hero' : result.distanceKm >= 5 ? '5K Finisher' : result.distanceKm >= 1 ? 'First Kilometer' : 'Fresh Start';

  const save = () => {
    try {
      const key = 'runtown.save-check';
      localStorage.setItem(key, '1'); localStorage.removeItem(key);
      dispatch({ type: 'RUN_SAVE' });
      setSaveError(null);
    } catch {
      setSaveError('บันทึกไม่สำเร็จ พื้นที่จัดเก็บของเบราว์เซอร์อาจถูกปิด ผลวิ่งยังอยู่หน้านี้ ลองอีกครั้งได้');
    }
  };

  const goHome = (discard = false) => {
    if (!state.lastResultSaved && !discard) { setConfirmLeave(true); return; }
    reset(); dispatch({ type: 'NAV', screen: 'map' });
  };

  return (
    <div className="flex flex-col gap-5 pb-8 relative">
      <section className="text-center">
        <div className="inline-grid place-items-center w-20 h-20 bg-[#FFD84D] border-2 border-[#14241C] hard-shadow-lg rounded-full text-4xl rotate-[-5deg]" aria-hidden="true">🏁</div>
        <h1 className="font-headline-lg-mobile mt-4">วิ่งจบแล้ว!</h1>
        <p className="font-handwritten-sm text-grass mt-1">Every step is progress.</p>
        {!state.lastResultSaved && <span className="inline-flex mt-3 bg-[#FFF2B8] border-2 border-[#14241C] rounded-full px-3 py-1 text-xs font-label-md">ยังไม่บันทึก</span>}
        {state.lastResultSaved && <span className="inline-flex mt-3 bg-[#DFF7E7] border-2 border-[#14241C] rounded-full px-3 py-1 text-xs font-label-md">✓ บันทึกในประวัติแล้ว</span>}
      </section>

      <section className="bg-white border-2 border-[#14241C] hard-shadow-lg rounded-2xl overflow-hidden" aria-label="แผนที่เส้นทางที่วิ่ง">
        <div className="h-52 relative"><SummaryMap path={result.traveledPath ?? []} fallback={homeCenter} /><div className="absolute top-3 left-3 z-[400] bg-white border-2 border-[#14241C] hard-shadow-sm rounded-full px-3 py-1 text-xs font-label-md">{activeRoute?.name ?? 'วิ่งอิสระ'}</div></div>
        <div className="grid grid-cols-2 gap-px bg-[#14241C] border-t-2 border-[#14241C]">
          <div className="bg-white p-4"><span className="text-xs font-label-md text-ink-soft uppercase tracking-wide">ระยะทาง</span><p className="font-headline-md text-2xl">{result.distanceKm.toFixed(2)} km</p></div>
          <div className="bg-white p-4"><span className="text-xs font-label-md text-ink-soft uppercase tracking-wide">เวลารวม</span><p className="font-headline-md text-2xl">{formatDuration(result.durationSec)}</p></div>
          <div className="bg-white p-4"><span className="text-xs font-label-md text-ink-soft uppercase tracking-wide">เพซเฉลี่ย</span><p className="font-headline-md text-2xl">{formatPace(result.paceSec)} <span className="text-xs">min/km</span></p></div>
          <div className="bg-lemon p-4"><span className="text-xs font-label-md uppercase tracking-wide">แคลอรี่โดยประมาณ*</span><p className="font-headline-md text-2xl">{result.caloriesKcal} kcal</p></div>
        </div>
      </section>

      <section className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4">
        <h2 className="font-headline-md text-lg">รายละเอียดกิจกรรม</h2>
        <dl className="mt-3 text-sm divide-y divide-dashed divide-[#AAB8AF]">
          <div className="flex justify-between py-2 gap-3"><dt className="text-ink-soft">เริ่ม</dt><dd className="text-right font-semibold">{dateTime(result.startedAt)}</dd></div>
          <div className="flex justify-between py-2 gap-3"><dt className="text-ink-soft">สิ้นสุด</dt><dd className="text-right font-semibold">{dateTime(result.finishedAt)}</dd></div>
          <div className="flex justify-between py-2 gap-3"><dt className="text-ink-soft">กิจกรรมวันที่</dt><dd className="text-right font-semibold">{new Date(result.finishedAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}</dd></div>
          <div className="flex justify-between py-2 gap-3"><dt className="text-ink-soft">รางวัลระหว่างทาง</dt><dd className="text-right font-semibold">เก็บได้ {result.checkpointsCollected} จุด</dd></div>
          <div className="flex justify-between py-2 gap-3"><dt className="text-ink-soft">GPS</dt><dd className="text-right font-semibold">ตัดจุดผิดปกติ {state.gps.rejectedPoints} จุด</dd></div>
        </dl>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#FF9B8E] border-2 border-[#14241C] hard-shadow rounded-xl p-4 rotate-[-1deg]"><span className="text-xs font-label-md">ACHIEVEMENT</span><p className="font-headline-md text-lg mt-1">🏅 {achievement}</p></div>
        <div className="bg-lemon border-2 border-ink hard-shadow rounded-xl p-4 rotate-[1deg]"><span className="text-xs font-label-md">REWARD</span><p className="font-headline-md text-lg mt-1">+{result.coinsEarned} coins</p><p className="text-xs text-ink-soft">จากระยะและจุดสุ่ม · ได้รับเมื่อบันทึก</p></div>
      </div>

      <p className="text-xs leading-relaxed text-ink-soft px-2">*แคลอรี่เป็นค่าประมาณจากน้ำหนัก × ระยะทาง ไม่ใช่ค่าทางการแพทย์ ผลจริงแตกต่างตามความเร็ว ความชัน อายุ องค์ประกอบร่างกาย และสมรรถภาพ</p>

      {saveError && <div role="alert" className="bg-[#FFD7D2] border-2 border-[#14241C] hard-shadow-sm rounded-xl p-3 text-sm">{saveError}</div>}
      <div className="flex flex-col gap-3">
        <button onClick={save} disabled={state.lastResultSaved} className="min-h-14 bg-grass disabled:bg-grass-soft text-white disabled:text-ink border-2 border-ink hard-shadow rounded-full font-headline-md text-base flex justify-center items-center gap-2 active:translate-y-0.5 active:shadow-none"><span className="material-symbols-outlined" aria-hidden="true">save</span>{state.lastResultSaved ? 'บันทึกกิจกรรมแล้ว' : 'บันทึกกิจกรรม'}</button>
        <button onClick={() => setShowShare(true)} className="min-h-14 bg-[#FFD84D] border-2 border-[#14241C] hard-shadow rounded-full font-headline-md text-base flex justify-center items-center gap-2 active:translate-y-0.5 active:shadow-none"><span className="material-symbols-outlined" aria-hidden="true">ios_share</span>แชร์ผลวิ่ง</button>
        <button onClick={() => goHome()} className="min-h-12 bg-white border-2 border-[#14241C] hard-shadow rounded-full font-label-md active:translate-y-0.5 active:shadow-none">กลับหน้าหลัก</button>
      </div>

      {showShare && <ShareResultSheet record={result} user={state.user} onClose={() => setShowShare(false)} />}
      {confirmLeave && <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[850] bg-ink/60 p-4 grid place-items-center" role="dialog" aria-modal="true" aria-labelledby="unsaved-title"><div className="bg-paper border-2 border-ink hard-shadow-lg rounded-2xl p-5"><div className="text-4xl">📝</div><h2 id="unsaved-title" className="font-headline-md text-xl mt-3">กิจกรรมยังไม่บันทึก</h2><p className="text-sm mt-2 text-ink-soft">ถ้ากลับตอนนี้ กิจกรรมนี้จะไม่ถูกเพิ่มในประวัติและจะไม่ได้รับ coins</p><div className="grid grid-cols-2 gap-3 mt-5"><button onClick={() => setConfirmLeave(false)} className="min-h-12 bg-white border-2 border-ink rounded-full font-label-md">อยู่หน้านี้</button><button onClick={() => goHome(true)} className="min-h-12 bg-coral text-ink border-2 border-ink rounded-full font-label-md">ทิ้งกิจกรรม</button></div></div></div>}
    </div>
  );
};
