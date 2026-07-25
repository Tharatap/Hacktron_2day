import React, { useState } from 'react';
import { TrainingDay } from '../types';
import { DEFAULT_TRAINING_DAYS } from '../data/mockData';

export const PlanTab: React.FC = () => {
  const [goalKm, setGoalKm] = useState<number>(100);
  const [goalNotes, setGoalNotes] = useState<string>('Window: 5 days • Notes: เรียนถึง 5 โมงเย็น อังคารกับพฤหัส');
  const [aiInsight, setAiInsight] = useState<string>('“ซ้อมหนัก 2 วัน ลงยาววันเสาร์ และพักก่อนหนึ่งวัน”');
  const [schedule, setSchedule] = useState<TrainingDay[]>(DEFAULT_TRAINING_DAYS);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for custom AI plan recalculation
  const [customDistance, setCustomDistance] = useState<number>(100);
  const [customDays, setCustomDays] = useState<number>(5);
  const [customNotes, setCustomNotes] = useState<string>('เรียนถึง 5 โมงเย็น อังคารกับพฤหัส');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const totalDoneKm = schedule.reduce((sum, d) => (d.isCompleted ? sum + d.distanceKm : sum), 12.2);

  const toggleDayComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGoalKm(customDistance);
      setGoalNotes(`Window: ${customDays} days • Notes: ${customNotes}`);
      setAiInsight(`“จัดแผนวิ่ง ${customDays} วัน เน้นโซน 2 เพื่อเพิ่มความฟิตโดยไม่ล้าเกินไป”`);
      
      // Dynamic schedule updates
      setSchedule([
        {
          id: 'day-1',
          day: 'MON',
          dateNum: '27',
          type: 'EASY',
          typeColorBg: 'bg-[#A3E4FF]',
          distanceKm: Math.round(customDistance * 0.1),
          locationNotes: 'หาดบางแสน จ๊อกกิ้งเบาๆ',
          timeRange: '18:00 - 18:45',
          isCompleted: true
        },
        {
          id: 'day-2',
          day: 'TUE',
          dateNum: '28',
          type: 'REST',
          typeColorBg: 'bg-[#e5f8eb]',
          distanceKm: 0,
          locationNotes: 'พักผ่อน ยืดเหยียดกล้ามเนื้อ',
          isCompleted: false
        },
        {
          id: 'day-3',
          day: 'WED',
          dateNum: '29',
          type: 'TEMPO',
          typeColorBg: 'bg-[#FFD84D]',
          distanceKm: Math.round(customDistance * 0.15),
          locationNotes: 'สนาม ม.เกษตร ศรีราชา (Interval)',
          timeRange: '17:30 - 18:30',
          isCompleted: false
        },
        {
          id: 'day-4',
          day: 'THU',
          dateNum: '30',
          type: 'EASY',
          typeColorBg: 'bg-[#A3E4FF]',
          distanceKm: Math.round(customDistance * 0.12),
          locationNotes: 'เกาะลอย ศรีราชา รับลมเย็น',
          timeRange: '18:30 - 19:15',
          isCompleted: false
        },
        {
          id: 'day-5',
          day: 'SAT',
          dateNum: '01',
          type: 'LONG',
          typeColorBg: 'bg-[#80fbac]',
          distanceKm: Math.round(customDistance * 0.25),
          locationNotes: 'อ่างเก็บน้ำบางพระ (Long Run)',
          timeRange: '05:30 - 07:30',
          isCompleted: false
        }
      ]);

      setIsGenerating(false);
      setShowEditModal(false);
      triggerToast('✨ AI สร้างแผนซ้อมใหม่เรียบร้อยแล้ว!');
    }, 1000);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#006a3a] text-white px-5 py-2.5 rounded-full border-2 border-[#14241C] hard-shadow font-headline-md text-sm animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Goal Summary Header Card */}
      <div className="bg-[#FFD84D] border-2 border-[#14241C] hard-shadow rounded-2xl p-4 flex items-start justify-between relative overflow-hidden">
        <div className="flex flex-col gap-1 pr-12">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#14241C] text-[20px]">target</span>
            <span className="font-headline-md text-lg uppercase text-[#14241C]">
              MY GOAL: {goalKm} KM
            </span>
          </div>
          <p className="font-handwritten-sm text-sm text-[#231b00] opacity-90 leading-tight">
            {goalNotes}
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
      <div className="flex items-center gap-3 px-1">
        <div className="bg-[#006a3a] p-1.5 rounded-full border-2 border-[#14241C] animate-bounce flex-shrink-0">
          <span className="material-symbols-outlined text-white text-[20px]">auto_awesome</span>
        </div>
        <p className="font-body-md text-sm italic text-[#14241C] font-semibold">
          {aiInsight}
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-[#3d4a40] uppercase opacity-70">
              PROGRESS
            </span>
            <span className="font-headline-md text-2xl text-[#14241C]">
              {totalDoneKm.toFixed(1)}{' '}
              <span className="text-sm font-normal text-[#3d4a40]">/ {goalKm} km</span>
            </span>
          </div>

          <div className="text-right">
            <span className="bg-[#ffdad6] text-[#93000a] font-label-md text-xs px-3 py-1 rounded-full border-2 border-[#14241C] font-bold">
              เหลืออีก 4 วัน
            </span>
          </div>
        </div>

        {/* Progress Bar with Runner Marker */}
        <div className="relative h-6 bg-[#dff3e5] border-2 border-[#14241C] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#006a3a] transition-all duration-500"
            style={{ width: `${Math.min(100, (totalDoneKm / goalKm) * 100)}%` }}
          />

          <div
            className="absolute top-0 flex items-center justify-center h-full transition-all duration-500"
            style={{
              left: `${Math.min(92, Math.max(8, (totalDoneKm / goalKm) * 100))}%`,
              transform: 'translateX(-50%)'
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
        {schedule.map((item, index) => {
          const isEven = index % 2 === 0;
          const rotation = isEven ? 'rotate-[-1deg]' : 'rotate-[1.5deg]';

          return (
            <div
              key={item.id}
              onClick={() => toggleDayComplete(item.id)}
              className={`bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-4 flex items-center gap-4 ${rotation} hover:rotate-0 transition-transform cursor-pointer ${
                item.isCompleted ? 'opacity-80' : ''
              }`}
            >
              <div className="flex flex-col items-center min-w-[50px]">
                <span className="font-label-md text-xs text-[#3d4a40] font-bold">{item.day}</span>
                <span className="font-headline-md text-2xl font-bold">{item.dateNum}</span>
              </div>

              <div className="h-10 w-[2px] bg-[#bccabd]" />

              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`${item.typeColorBg} px-2.5 py-0.5 border-2 border-[#14241C] rounded-full font-label-md text-[10px] font-bold uppercase`}>
                    {item.type}
                  </span>
                  <span className="font-headline-md text-base font-bold">
                    {item.distanceKm} km
                  </span>
                </div>

                <p className="font-body-md text-xs text-[#3d4a40] truncate">
                  {item.locationNotes}
                </p>

                {item.timeRange && (
                  <span className="font-label-md text-[10px] text-[#3d4a40]/80">
                    ⏰ {item.timeRange}
                  </span>
                )}
              </div>

              <div
                className={`w-8 h-8 rounded-full border-2 border-[#14241C] flex items-center justify-center transition-all ${
                  item.isCompleted ? 'bg-[#006a3a]' : 'bg-white'
                }`}
              >
                {item.isCompleted && (
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
          onClick={() => triggerToast('📅 บันทึกแผนการซ้อมลง Google Calendar เรียบร้อยแล้ว!')}
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

      {/* Goal Edit & Regenerate Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
