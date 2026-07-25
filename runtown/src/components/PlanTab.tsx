import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { callGemini } from '../lib/gemini';
import type { PlanDay, PlanDayType } from '../types';

const TYPE_LABEL: Record<PlanDayType, string> = {
  easy: 'EASY',
  tempo: 'TEMPO',
  long: 'LONG',
  rest: 'REST',
};

const TYPE_COLOR: Record<PlanDayType, string> = {
  easy: 'bg-[#A3E4FF]',
  tempo: 'bg-[#FFD84D]',
  long: 'bg-[#80fbac]',
  rest: 'bg-[#e5f8eb]',
};

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

function dateNum(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, '0');
}

export const PlanTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const { planner } = state;

  const [showEditModal, setShowEditModal] = useState(false);
  // ฟอร์มกรอกก่อนสร้างแผน — เป็น UI input ล้วนๆ ยังไม่ใช่ business data จนกว่าจะกด generate
  const [customDistance, setCustomDistance] = useState(100);
  const [customDays, setCustomDays] = useState(5);
  const [customNotes, setCustomNotes] = useState('เรียนถึง 5 โมงเย็น อังคารกับพฤหัส');
  // ไม่มี action สำหรับ toggle วันที่ทำเสร็จใน AppContext.tsx (ไม่ใช่ business data ตาม contract) เก็บ local เฉยๆ
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());

  const plan = planner.plan;
  const isGenerating = planner.status === 'loading';

  const toggleDayComplete = (date: string) => {
    setCompletedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const handleGeneratePlan = () => {
    dispatch({ type: 'PLAN_LOADING' });
    setShowEditModal(false);
    callGemini({
      goalKm: customDistance,
      days: customDays,
      constraints: customNotes,
      paceTier: state.user.paceTier,
      zones: state.zones.map((z) => ({ id: z.id, name: z.name, district: z.district })),
    })
      .then((plan) => dispatch({ type: 'PLAN_READY', plan }))
      .catch((err) =>
        dispatch({ type: 'PLAN_ERROR', error: err instanceof Error ? err.message : 'เรียก AI ไม่สำเร็จ' })
      );
  };

  const totalDoneKm = plan
    ? plan.schedule.filter((d) => completedDates.has(d.date)).reduce((sum, d) => sum + d.targetKm, 0)
    : 0;

  const daysLeft = plan
    ? plan.schedule.filter((d) => new Date(d.date) >= new Date(new Date().toDateString())).length
    : 0;

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {planner.status === 'error' && planner.error && (
        <div className="bg-[#ffdad6] border-2 border-[#93000a] text-[#93000a] rounded-xl p-3 text-sm font-body-md">
          ⚠️ {planner.error}
        </div>
      )}

      {!plan ? (
        // ยังไม่มีแผนซ้อม (state.planner.plan เป็น null) — ไม่มี mock data ให้โชว์เหมือนหน้าอื่น
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-[#3d4a40]">calendar_month</span>
          <p className="font-body-md text-[#3d4a40]">
            {isGenerating ? 'กำลังคำนวณแผน... ⏳' : 'ยังไม่มีแผนซ้อม กดสร้างแผนด้วย AI เพื่อเริ่มต้น'}
          </p>
          <button
            onClick={() => setShowEditModal(true)}
            disabled={isGenerating}
            className="bg-[#006a3a] text-white px-6 py-3 rounded-full border-2 border-[#14241C] hard-shadow font-headline-md disabled:opacity-50"
          >
            {isGenerating ? 'กำลังสร้าง...' : '🤖 สร้างแผนซ้อมด้วย AI'}
          </button>
        </div>
      ) : (
        <>
          {/* Goal Summary Header Card */}
          <div className="bg-[#FFD84D] border-2 border-[#14241C] hard-shadow rounded-2xl p-4 flex items-start justify-between relative overflow-hidden">
            <div className="flex flex-col gap-1 pr-12">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#14241C] text-[20px]">target</span>
                <span className="font-headline-md text-lg uppercase text-[#14241C]">
                  MY GOAL: {plan.goalKm} KM
                </span>
              </div>
              <p className="font-handwritten-sm text-sm text-[#231b00] opacity-90 leading-tight">
                Window: {plan.days} days • Notes: {plan.constraints}
              </p>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white border-2 border-[#14241C] px-3 py-1 rounded-full hard-shadow flex items-center gap-1 active:translate-y-[2px] transition-transform hover:bg-gray-50"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span className="font-label-md text-xs font-bold">Edit</span>
            </button>
          </div>

          {/* AI Insight Message */}
          {plan.summary && (
            <div className="flex items-center gap-3 px-1">
              <div className="bg-[#006a3a] p-1.5 rounded-full border-2 border-[#14241C] animate-bounce flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[20px]">auto_awesome</span>
              </div>
              <p className="font-body-md text-sm italic text-[#14241C] font-semibold">
                “{plan.summary}”
              </p>
            </div>
          )}

          {/* Progress Tracker */}
          <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="font-label-md text-xs text-[#3d4a40] uppercase opacity-70">
                  PROGRESS
                </span>
                <span className="font-headline-md text-2xl text-[#14241C]">
                  {totalDoneKm.toFixed(1)}{' '}
                  <span className="text-sm font-normal text-[#3d4a40]">/ {plan.goalKm} km</span>
                </span>
              </div>

              <div className="text-right">
                <span className="bg-[#ffdad6] text-[#93000a] font-label-md text-xs px-3 py-1 rounded-full border-2 border-[#14241C] font-bold">
                  เหลืออีก {daysLeft} วัน
                </span>
              </div>
            </div>

            {/* Progress Bar with Runner Marker */}
            <div className="relative h-6 bg-[#dff3e5] border-2 border-[#14241C] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006a3a] transition-all duration-500"
                style={{ width: `${Math.min(100, (totalDoneKm / plan.goalKm) * 100)}%` }}
              />

              <div
                className="absolute top-0 flex items-center justify-center h-full transition-all duration-500"
                style={{
                  left: `${Math.min(92, Math.max(8, (totalDoneKm / plan.goalKm) * 100))}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="w-10 h-10 bg-white border-2 border-[#14241C] rounded-full hard-shadow rotate-[12deg] flex items-center justify-center -mt-1">
                  <span className="material-symbols-outlined text-[#006a3a] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    directions_run
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Training Schedule Cards */}
          <div className="flex flex-col gap-3">
            {plan.schedule.map((item: PlanDay, index: number) => {
              const isEven = index % 2 === 0;
              const rotation = isEven ? 'rotate-[-1deg]' : 'rotate-[1.5deg]';
              const isCompleted = completedDates.has(item.date);
              const zone = state.zones.find((z) => z.id === item.suggestedZoneId);

              return (
                <div
                  key={item.date}
                  onClick={() => toggleDayComplete(item.date)}
                  className={`bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4 flex items-center gap-4 ${rotation} hover:rotate-0 transition-transform cursor-pointer ${
                    isCompleted ? 'opacity-80' : ''
                  }`}
                >
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="font-label-md text-xs text-[#3d4a40] font-bold">{dayLabel(item.date)}</span>
                    <span className="font-headline-md text-2xl font-bold">{dateNum(item.date)}</span>
                  </div>

                  <div className="h-10 w-[2px] bg-[#bccabd]" />

                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`${TYPE_COLOR[item.type]} px-2.5 py-0.5 border-2 border-[#14241C] rounded-full font-label-md text-[10px] font-bold uppercase`}>
                        {TYPE_LABEL[item.type]}
                      </span>
                      <span className="font-headline-md text-base font-bold">
                        {item.targetKm} km
                      </span>
                    </div>

                    <p className="font-body-md text-xs text-[#3d4a40] truncate">
                      {zone ? `${zone.name} — ${item.note}` : item.note}
                    </p>

                    {item.timeSlot && (
                      <span className="font-label-md text-[10px] text-[#3d4a40]/80">
                        ⏰ {item.timeSlot}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full border-2 border-[#14241C] flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-[#006a3a]' : 'bg-white'
                    }`}
                  >
                    {isCompleted && (
                      <span className="material-symbols-outlined text-white text-lg">check</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() =>
                dispatch({
                  type: 'TOAST',
                  text: '📅 ยังไม่รองรับการเพิ่มลงปฏิทิน (.ics export รอ implement)',
                  tone: 'info',
                })
              }
              className="w-full bg-[#006a3a] text-white border-2 border-[#14241C] hard-shadow py-3.5 rounded-full font-headline-md text-lg flex items-center justify-center gap-2 hover:bg-[#00864b] active:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined">event_available</span>
              <span>เพิ่มลงปฏิทิน</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="w-full bg-white text-[#14241C] border-2 border-[#14241C] hard-shadow py-3.5 rounded-full font-headline-md text-lg flex items-center justify-center gap-2 hover:bg-[#FFD84D]/30 active:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span>สร้างใหม่ (AI Plan Generator)</span>
            </button>
          </div>
        </>
      )}

      {/* Goal Edit & Regenerate Modal */}
      {showEditModal && (
        <div className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#14241C] hard-shadow-lg rounded-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-[#14241C] bg-[#FFD84D] flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <h3 className="font-headline-md text-xl text-[#14241C] mb-4 text-center">
              🤖 ปรับแต่งแผนการซ้อม AI
            </h3>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="font-label-md text-xs text-[#3d4a40] mb-1 block font-bold">
                  เป้าหมายระยะทางรวม (กม.)
                </label>
                <input
                  type="number"
                  value={customDistance}
                  onChange={(e) => setCustomDistance(Number(e.target.value))}
                  className="w-full border-2 border-[#14241C] rounded-xl px-3 py-2 font-headline-md text-base"
                />
              </div>

              <div>
                <label className="font-label-md text-xs text-[#3d4a40] mb-1 block font-bold">
                  จำนวนวันในแผนซ้อม
                </label>
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-full border-2 border-[#14241C] rounded-xl px-3 py-2 font-headline-md text-base"
                />
              </div>

              <div>
                <label className="font-label-md text-xs text-[#3d4a40] mb-1 block font-bold">
                  เงื่อนไขเวลา / ข้อจำกัดของคุณ
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={2}
                  className="w-full border-2 border-[#14241C] rounded-xl px-3 py-2 font-body-md text-sm"
                  placeholder="เช่น ติดเรียนอังคารกับพฤหัส, ว่างซ้อมเช้าวันเสาร์..."
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-full border-2 border-[#14241C] bg-[#006a3a] text-white font-headline-md text-base hard-shadow flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <span>กำลังคำนวณแผน... ⏳</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>สร้างแผนซ้อมด้วย AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
