import React, { useState } from 'react';
import { useApp, clearDemoData } from '../state/AppContext';
import { formatDuration, formatPace, tierInfo } from '../lib/formulas';

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
function formatThaiDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

type HatColor = 'green' | 'pink' | 'yellow' | 'blue';

export const ProfileTab: React.FC = () => {
  const { state } = useApp();
  const { user } = state;

  // ตกแต่ง mascot ล้วนๆ ไม่มี field รองรับใน User type (ไม่ใช่ business data ตาม STATE_DESIGN) เก็บ local เฉยๆ ไม่ persist
  const [selectedHat, setSelectedHat] = useState<HatColor>('green');

  const getHatBg = (hat: HatColor) => {
    switch (hat) {
      case 'green': return 'bg-[#80fbac]';
      case 'pink': return 'bg-pink-300';
      case 'yellow': return 'bg-[#FFD84D]';
      case 'blue': return 'bg-[#A3E4FF]';
    }
  };

  const homeZone = state.zones.find((z) => z.id === user.homeZoneId);
  const levelTitle = homeZone
    ? `นักวิ่ง${homeZone.name}สาย${tierInfo(user.paceTier).labelTh}`
    : `นักวิ่งสาย${tierInfo(user.paceTier).labelTh}`;

  const handleResetDemo = () => {
    if (!window.confirm('รีเซ็ตข้อมูลเดโมทั้งหมด (coin, ประวัติวิ่ง, คูปอง) แน่ใจนะ?')) return;
    clearDemoData();
    window.location.reload();
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Profile Header Sticker Card */}
      <div className="relative bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-6 flex flex-col items-center text-center">
        {/* Mascot Avatar with Ring */}
        <div className="relative mb-3">
          <div className={`p-2 rounded-full border-3 border-[#14241C] hard-shadow ${getHatBg(selectedHat)}`}>
            <div className="w-24 h-24 rounded-full border-2 border-white ring-2 ring-[#14241C] rotate-[-2deg] bg-[#e5f8eb] flex items-center justify-center text-5xl">
              {user.avatar}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#FFD84D] border-2 border-[#14241C] rounded-full px-3 py-0.5 text-xs font-bold font-headline-md hard-shadow">
            Level 12
          </div>
        </div>

        <h2 className="font-headline-md text-2xl text-[#14241C] mb-0.5">{user.name}</h2>
        <p className="font-handwritten-sm text-sm text-grass font-bold mb-4">
          🏆 {levelTitle}
        </p>

        {/* Mascot Gear Hat Customizer */}
        <div className="bg-[#e5f8eb] border-2 border-[#14241C] p-3 rounded-xl w-full flex flex-col items-center">
          <span className="font-label-md text-xs text-ink-soft mb-2 font-bold">
            🧢 ตกแต่งหมวกน้องหมู Mascot
          </span>
          <div className="flex gap-3">
            {(['green', 'pink', 'yellow', 'blue'] as const).map((hat) => (
              <button
                key={hat}
                onClick={() => setSelectedHat(hat)}
                className={`w-9 h-9 rounded-full border-2 border-[#14241C] flex items-center justify-center transition-transform ${getHatBg(
                  hat
                )} ${selectedHat === hat ? 'scale-110 ring-2 ring-[#14241C] hard-shadow' : 'opacity-70 hover:opacity-100'}`}
              >
                {selectedHat === hat && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lifetime Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#FFD84D] border-2 border-[#14241C] hard-shadow p-4 rounded-xl rotate-[-1deg]">
          <span className="text-xs font-label-md text-[#14241C] uppercase font-bold">
            TOTAL DISTANCE
          </span>
          <p className="font-headline-lg text-3xl text-[#14241C] mt-1">
            {user.totalDistanceKm} <span className="text-sm font-normal">km</span>
          </p>
        </div>

        <div className="bg-white border-2 border-[#14241C] hard-shadow p-4 rounded-xl rotate-[1.5deg]">
          <span className="text-xs font-label-md text-ink-soft uppercase font-bold">
            TOTAL RUNS
          </span>
          <p className="font-headline-lg text-3xl text-[#14241C] mt-1">
            {state.history.length} <span className="text-sm font-normal">ครั้ง</span>
          </p>
        </div>

        <div className="bg-white border-2 border-[#14241C] hard-shadow p-4 rounded-xl rotate-[1deg]">
          <span className="text-xs font-label-md text-ink-soft uppercase font-bold">
            COIN BALANCE
          </span>
          <p className="font-headline-lg text-3xl text-grass mt-1">
            {user.coins} <span className="text-sm font-normal">🪙</span>
          </p>
        </div>

        <div className="bg-coral text-ink border-2 border-ink hard-shadow p-4 rounded-xl rotate-[-2deg]">
          <span className="text-xs font-label-md uppercase font-bold">
            RUN STREAK
          </span>
          <p className="font-headline-lg text-3xl text-ink mt-1">
            {user.streakDays} <span className="text-sm font-normal">วันรวด</span>
          </p>
        </div>
      </div>

      {/* Badges & Sticker Book — ไม่มีระบบ achievement ใน state contract ยังคงเป็น decorative แบบเดิม */}
      <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-5">
        <h3 className="font-headline-md text-lg text-[#14241C] mb-3 flex items-center gap-2">
          <span>🏷️ สมุดสะสมสติ๊กเกอร์ยศนักวิ่ง</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#e5f8eb] border-2 border-[#14241C] p-3 rounded-xl flex items-center gap-2.5">
            <span className="text-2xl">🏖️</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">Beach Runner</p>
              <p className="text-xs text-ink-soft">วิ่งเลียบหาดบางแสน</p>
            </div>
          </div>

          <div className="bg-[#FFD84D]/40 border-2 border-[#14241C] p-3 rounded-xl flex items-center gap-2.5">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">5K Finisher</p>
              <p className="text-xs text-ink-soft">พิชิตระยะ 5K</p>
            </div>
          </div>

          <div className="bg-[#A3E4FF]/40 border-2 border-[#14241C] p-3 rounded-xl flex items-center gap-2.5">
            <span className="text-2xl">🌙</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">Night Jogger</p>
              <p className="text-xs text-ink-soft">วิ่งยามค่ำคืน</p>
            </div>
          </div>

          <div className="bg-gray-100 border-2 border-dashed border-[#14241C] p-3 rounded-xl flex items-center gap-2.5 opacity-60">
            <span className="text-2xl">⛰️</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">Trail Master</p>
              <p className="text-xs text-ink-soft">วิ่งเทรลเขาสามมุข (ยังไม่ปลด)</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-5">
        <h3 className="font-headline-md text-lg text-[#14241C] mb-3 flex items-center gap-2">
          <span>📜 ประวัติการวิ่งย้อนหลัง</span>
        </h3>

        {state.history.length === 0 ? (
          <p className="text-sm text-ink-soft text-center py-4">ยังไม่มีประวัติการวิ่ง กด Run ตรงกลางเมนูเพื่อเริ่มได้เลย</p>
        ) : (
          <div className="flex flex-col gap-3">
            {state.history.map((run) => {
              const zone = state.zones.find((z) => z.id === run.zoneId);
              const route = state.routes.find((r) => r.id === run.routeId);
              return (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 bg-[#f8faf8] border-2 border-[#14241C] rounded-xl hard-shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-headline-md text-sm text-[#14241C]">
                      {zone?.name ?? route?.name ?? 'วิ่งอิสระ'}
                      {run.mode === 'simulate' ? ' (SIMULATED)' : ''}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {formatThaiDate(run.finishedAt)} • {formatDuration(run.durationSec)} • Pace {formatPace(run.paceSec)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-headline-md text-base text-grass">
                      {run.distanceKm} km
                    </span>
                    <span className="text-xs font-bold text-lemon bg-ink px-1.5 py-0.5 rounded">
                      +{run.coinsEarned} Coins
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* รีเซ็ตเดโม — STATE_DESIGN.md บังคับให้มี ไม่งั้นซ้อมรอบสองเริ่มใหม่ไม่ได้ */}
      <button
        onClick={handleResetDemo}
        className="w-full bg-white text-[#93000a] border-2 border-[#93000a] hard-shadow py-3 rounded-full font-headline-md text-sm flex items-center justify-center gap-2 hover:bg-[#ffdad6] active:translate-y-[2px] transition-all"
      >
        <span className="material-symbols-outlined text-base">restart_alt</span>
        <span>รีเซ็ตเดโม</span>
      </button>
    </div>
  );
};
