import React from 'react';
import { useApp } from '../state/AppContext';
import { formatDuration, formatPace } from '../lib/formulas';

export const HomeTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const latest = state.history[0];
  const weeklyGoal = state.planner.plan?.goalKm ?? 25;
  const progress = Math.min(100, (state.user.weeklyDistanceKm / weeklyGoal) * 100);
  const today = new Date().toISOString().slice(0, 10);
  const todayPlan = state.planner.plan?.schedule.find((item) => item.date === today);

  return (
    <div className="flex flex-col gap-5 pb-6">
      <section className="relative overflow-hidden bg-[#A9E5C0] border-2 border-[#14241C] hard-shadow-lg rounded-2xl p-5">
        <div className="absolute -right-4 -top-5 w-24 h-24 bg-[#FFD84D] border-2 border-[#14241C] rounded-full" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="font-handwritten-sm font-semibold text-grass">สวัสดี {state.user.name} 👋</p>
            <h1 className="font-headline-lg-mobile mt-1 max-w-[230px]">วันนี้ออกไปเก็บระยะกัน!</h1>
            <p className="mt-2 text-sm text-ink-soft">ทุกกิโลคือสติ๊กเกอร์อีกดวงในสมุดของเรา</p>
          </div>
          <div className="relative z-10 mt-6 text-5xl rotate-[8deg]" aria-label="มาสคอตนักวิ่ง">🐷</div>
        </div>
        <button
          onClick={() => dispatch({ type: 'NAV', screen: 'run' })}
          className="mt-5 min-h-12 w-full bg-grass text-white border-2 border-ink hard-shadow rounded-full font-headline-md text-base flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <span className="material-symbols-outlined" aria-hidden="true">directions_run</span>
          เริ่มวิ่ง
        </button>
      </section>

      <section aria-labelledby="weekly-title" className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-handwritten-sm text-grass">ภารกิจประจำสัปดาห์</p>
            <h2 id="weekly-title" className="font-headline-md text-xl">{state.user.weeklyDistanceKm.toFixed(1)} / {weeklyGoal} km</h2>
          </div>
          <span className="bg-[#FFD84D] border-2 border-[#14241C] rounded-full px-3 py-1 font-label-md hard-shadow-sm">🔥 {state.user.streakDays} วัน</span>
        </div>
        <div className="mt-4 h-5 rounded-full border-2 border-[#14241C] bg-[#E7EFE9] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={weeklyGoal} aria-valuenow={state.user.weeklyDistanceKm}>
          <div className="h-full bg-[#FF6B5A] border-r-2 border-[#14241C] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-soft">เหลืออีก {Math.max(0, weeklyGoal - state.user.weeklyDistanceKm).toFixed(1)} km เพื่อรับตราสัปดาห์นี้</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => dispatch({ type: 'NAV', screen: 'planner' })} className="text-left bg-[#FFD84D] border-2 border-[#14241C] hard-shadow rounded-xl p-4 min-h-28 active:translate-y-0.5 active:shadow-none">
          <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
          <span className="block font-headline-md text-base mt-2">แผนวันนี้</span>
          <span className="block text-xs mt-1">{todayPlan ? `${todayPlan.type} • ${todayPlan.targetKm} km` : 'สร้างแผนที่เข้ากับตารางของคุณ'}</span>
        </button>
        <button onClick={() => dispatch({ type: 'NAV', screen: 'ranking' })} className="text-left bg-[#FF9B8E] border-2 border-[#14241C] hard-shadow rounded-xl p-4 min-h-28 active:translate-y-0.5 active:shadow-none">
          <span className="material-symbols-outlined" aria-hidden="true">leaderboard</span>
          <span className="block font-headline-md text-base mt-2">อันดับพื้นที่</span>
          <span className="block text-xs mt-1">ดูว่าแก๊งนักวิ่งชลบุรีไปถึงไหนแล้ว</span>
        </button>
      </div>

      <section aria-labelledby="recent-title">
        <div className="flex items-center justify-between mb-3">
          <h2 id="recent-title" className="font-headline-md text-xl">กิจกรรมล่าสุด</h2>
          <button onClick={() => dispatch({ type: 'NAV', screen: 'profile' })} className="font-label-md text-sm underline underline-offset-4">ดูประวัติ</button>
        </div>
        {latest ? (
          <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div><p className="font-headline-md text-2xl">{latest.distanceKm.toFixed(2)} km</p><p className="text-xs text-ink-soft">บันทึกแล้ว • {new Date(latest.finishedAt).toLocaleDateString('th-TH')}</p></div>
              <div className="text-4xl" aria-hidden="true">🏅</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-[#EEF7F0] border border-ink rounded-lg p-2"><span className="block text-xs text-ink-soft">เวลา</span><strong className="text-sm">{formatDuration(latest.durationSec)}</strong></div>
              <div className="bg-[#EEF7F0] border border-ink rounded-lg p-2"><span className="block text-xs text-ink-soft">เพซ</span><strong className="text-sm">{formatPace(latest.paceSec)}</strong></div>
              <div className="bg-[#FFF2B8] border border-ink rounded-lg p-2"><span className="block text-xs text-ink-soft">ประมาณ</span><strong className="text-sm">{latest.caloriesKcal} kcal</strong></div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#14241C] rounded-2xl p-5 text-center">
            <div className="text-4xl" aria-hidden="true">👟</div>
            <p className="font-headline-md text-base mt-2">ยังไม่มีรอยเท้าในสมุด</p>
            <p className="text-sm text-ink-soft mt-1">บันทึกการวิ่งครั้งแรก แล้วกิจกรรมจะมาอยู่ตรงนี้</p>
          </div>
        )}
      </section>

      <button onClick={() => dispatch({ type: 'NAV', screen: 'map' })} className="min-h-12 bg-white border-2 border-[#14241C] hard-shadow rounded-full font-label-md flex items-center justify-center gap-2 active:translate-y-0.5 active:shadow-none">
        <span className="material-symbols-outlined" aria-hidden="true">map</span>
        สำรวจเส้นทางและโซนวิ่ง
      </button>
    </div>
  );
};
