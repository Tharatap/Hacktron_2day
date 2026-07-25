import React, { useState } from 'react';
import { useApp, useActiveRoute, FREE_RUN_TOWER_REWARD } from '../state/AppContext';
import { useRunEngine } from '../state/useRunEngine';
import { formatPace, formatDuration, coinsForRun, myRank } from '../lib/formulas';
import { consumeRankBeforeFinish } from '../state/finishSnapshot';

/**
 * เหลือแค่ใบเสร็จจบวิ่ง (screen 'finish') — ฉาก active-run ย้ายไปอยู่ที่
 * ActiveRunScreen.tsx ทั้งหมดแล้ว (รวมปุ่ม pause/stop/lock, waveform, checkpoint strip)
 */
export const RunTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const { reset } = useRunEngine();
  const activeRoute = useActiveRoute();
  const { run, user, lastResult } = state;

  // อ่านครั้งเดียวตอน mount — ActiveRunScreen เป็นคน capture ค่านี้ไว้ตอนกด Stop ก่อน dispatch finish()
  const [rankBeforeFinish] = useState<number | null>(() => consumeRankBeforeFinish());

  const locationName = activeRoute?.name ?? 'วิ่งอิสระ';

  const handleDone = () => {
    reset();
    dispatch({ type: 'NAV', screen: 'map' });
  };

  if (!lastResult) {
    // กันไว้เฉยๆ เผื่อ dispatch แปลกๆ พาเข้ามาโดยไม่มีผลวิ่งจริง (ปกติไม่ควรเกิดขึ้น)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-body-md text-[#3d4a40]">ไม่พบผลการวิ่งล่าสุด</p>
        <button
          onClick={() => dispatch({ type: 'NAV', screen: 'map' })}
          className="bg-[#006a3a] text-white px-6 py-3 rounded-full border-2 border-[#14241C] hard-shadow font-headline-md"
        >
          ไปที่แผนที่
        </button>
      </div>
    );
  }

  const zoneCheckpoints = activeRoute ? activeRoute.checkpoints.filter((c) => c.kind !== 'start') : [];
  // วิ่งอิสระไม่มี route.checkpoints ให้รวม coinReward — ใช้สูตรเดียวกับ RUN_FINISH ใน AppContext.tsx
  // (จำนวน tower ที่เก็บได้ x 15) ไม่งั้น breakdown แถวนี้จะโชว์ 0 ทั้งที่ TOTAL จริงรวม tower coin ไปแล้ว
  const checkpointCoins = activeRoute
    ? activeRoute.checkpoints
        .filter((c) => run.collectedCheckpointIds.includes(c.id))
        .reduce((s, c) => s + c.coinReward, 0)
    : run.collectedCheckpointIds.length * FREE_RUN_TOWER_REWARD;
  // ใช้ run.distanceM ดิบ (ไม่ปัดทศนิยม) แทน lastResult.distanceKm ที่ปัดแล้ว
  // เพื่อให้ตรงกับตัวเลขที่ reducer ใช้คำนวณ coinsEarned จริงเป๊ะๆ กัน breakdown บวกแล้วไม่เท่า TOTAL
  const breakdown = coinsForRun(run.distanceM / 1000, checkpointCoins, user.streakDays);

  const board = activeRoute ? state.leaderboards[activeRoute.zoneId] ?? [] : [];
  const rankAfter = myRank(board, user.id);
  const rankDelta = rankBeforeFinish != null ? rankBeforeFinish - rankAfter : 0;

  return (
    <div className="flex flex-col w-full gap-6 relative overflow-hidden -mt-2 pb-12">
      {/* Confetti Animation Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg height="100%" width="100%" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
          <rect className="confetti" fill="#FFD84D" height="12" width="12" x="10%" y="-20" style={{ animationDelay: '0.2s' }} />
          <rect className="confetti" fill="#FF8A65" height="8" width="8" x="30%" y="-20" style={{ animationDelay: '1.5s' }} />
          <rect className="confetti" fill="#006a3a" height="10" width="10" x="60%" y="-20" style={{ animationDelay: '0.8s' }} />
          <rect className="confetti" fill="#14241C" height="14" width="14" x="85%" y="-20" style={{ animationDelay: '2.2s' }} />
          <rect className="confetti" fill="#FFD84D" height="10" width="10" x="45%" y="-20" style={{ animationDelay: '3s' }} />
          <rect className="confetti" fill="#006a3a" height="9" width="9" x="15%" y="-20" style={{ animationDelay: '4.5s' }} />
        </svg>
      </div>

      {/* Title Section */}
      <div className="flex flex-col items-center justify-center pt-2 z-10">
        <h1 className="font-headline-lg-mobile text-3xl text-[#14241C] uppercase text-center font-bold">
          วิ่งจบแล้ว!
        </h1>

        {/* Reward Coin Sticker */}
        <div className="relative mt-6 transition-transform hover:scale-105 duration-300 cursor-pointer">
          <div className="w-32 h-32 bg-[#FFD84D] border-2 border-[#14241C] rounded-full flex flex-col items-center justify-center hard-shadow rotate-[-6deg] ring-[6px] ring-white">
            <span className="font-headline-lg text-[48px] leading-none text-[#14241C]">+{lastResult.coinsEarned}</span>
            <span className="font-label-md text-sm text-[#14241C] uppercase mt-1">coin ที่ได้</span>
          </div>
          <div className="absolute -top-3 -right-3 bg-[#FF8A65] border-2 border-[#14241C] text-white px-3 py-1 rounded-full hard-shadow rotate-[12deg] font-label-md text-xs font-bold">
            {breakdown.capped ? 'DAILY CAP!' : 'NEW RECORD!'}
          </div>
        </div>
      </div>

      {/* Signature Receipt Card */}
      <div className="relative z-10 px-1">
        <div className="bg-white border-2 border-[#14241C] hard-shadow p-6 flex flex-col gap-4 relative">
          {/* Receipt Top Decorative Holes */}
          <div className="absolute -top-1 left-0 right-0 flex justify-around px-4">
            <div className="w-3 h-3 bg-[#F2F7F3] rounded-full border-b-2 border-[#14241C]"></div>
            <div className="w-3 h-3 bg-[#F2F7F3] rounded-full border-b-2 border-[#14241C]"></div>
            <div className="w-3 h-3 bg-[#F2F7F3] rounded-full border-b-2 border-[#14241C]"></div>
            <div className="w-3 h-3 bg-[#F2F7F3] rounded-full border-b-2 border-[#14241C]"></div>
          </div>

          <div className="flex justify-between items-baseline font-body-md text-[#14241C]">
            <span className="font-label-md">Distance {lastResult.distanceKm} km</span>
            <div className="flex-1 border-b-2 border-dotted border-[#bccabd] mx-2 mb-1"></div>
            <span className="font-headline-md text-base">+{breakdown.fromDistance}</span>
          </div>

          <div className="flex justify-between items-baseline font-body-md text-[#14241C]">
            <span className="font-label-md">
              {activeRoute
                ? `Checkpoints ${lastResult.checkpointsCollected}/${zoneCheckpoints.length}`
                : `Checkpoints เก็บได้ ${lastResult.checkpointsCollected} จุด`}
            </span>
            <div className="flex-1 border-b-2 border-dotted border-[#bccabd] mx-2 mb-1"></div>
            <span className="font-headline-md text-base">+{breakdown.fromCheckpoints}</span>
          </div>

          <div className="flex justify-between items-baseline font-body-md text-[#14241C]">
            <span className="font-label-md">Streak {user.streakDays} days</span>
            <div className="flex-1 border-b-2 border-dotted border-[#bccabd] mx-2 mb-1"></div>
            <span className="font-headline-md text-base">+{breakdown.fromStreak}</span>
          </div>

          <div className="flex justify-between items-baseline font-body-md text-[#3d4a40]/60">
            <span className="font-label-md italic">Daily cap</span>
            <div className="flex-1 border-b-2 border-dotted border-[#bccabd]/40 mx-2 mb-1"></div>
            <span className="font-label-md">300</span>
          </div>

          <div className="mt-2 pt-4 border-t-2 border-[#14241C] flex justify-between items-center">
            <span className="font-headline-md text-xl uppercase">TOTAL</span>
            <span className="font-headline-lg text-3xl text-[#14241C]">{lastResult.coinsEarned}</span>
          </div>

          {/* Torn Zigzag Edge */}
          <div className="absolute -bottom-3 left-0 right-0 h-3 overflow-hidden flex">
            {Array.from({ length: 25 }).map((_, idx) => (
              <div key={idx} className="w-4 h-4 bg-white border-r-2 border-b-2 border-[#14241C] rotate-45 -translate-y-2 translate-x-[-2px] flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Sticker Grid */}
      <div className="grid grid-cols-2 gap-3 px-1 mt-2 z-10">
        <div className="bg-white border-2 border-[#14241C] hard-shadow p-3 rounded-xl rotate-[-2deg] flex flex-col">
          <span className="text-[10px] font-label-md text-[#3d4a40] uppercase">Distance</span>
          <span className="font-headline-md text-xl text-[#14241C]">{lastResult.distanceKm} <span className="text-xs">km</span></span>
        </div>

        <div className="bg-white border-2 border-[#14241C] hard-shadow p-3 rounded-xl rotate-[3deg] flex flex-col">
          <span className="text-[10px] font-label-md text-[#3d4a40] uppercase">Time</span>
          <span className="font-headline-md text-xl text-[#14241C]">{formatDuration(lastResult.durationSec)}</span>
        </div>

        <div className="bg-white border-2 border-[#14241C] hard-shadow p-3 rounded-xl rotate-[1deg] flex flex-col">
          <span className="text-[10px] font-label-md text-[#3d4a40] uppercase">Avg Pace</span>
          <span className="font-headline-md text-xl text-[#14241C]">{formatPace(lastResult.paceSec)}</span>
        </div>

        <div className="bg-white border-2 border-[#14241C] hard-shadow p-3 rounded-xl rotate-[-3deg] flex flex-col">
          <span className="text-[10px] font-label-md text-[#3d4a40] uppercase">Calories</span>
          <span className="font-headline-md text-xl text-[#14241C]">{lastResult.caloriesKcal} <span className="text-xs">kcal</span></span>
        </div>
      </div>

      {/* Rank Improvement Card — วิ่งอิสระไม่มีโซน ไม่มี leaderboard ให้เทียบ ซ่อนไปเลย */}
      {activeRoute && (
        <div className="bg-[#006a3a] border-2 border-[#14241C] hard-shadow rounded-2xl p-4 flex items-center justify-between mx-1 z-10">
          <div className="flex flex-col">
            <span className="font-handwritten-sm text-white/90">{locationName}</span>
            <span className="font-headline-md text-white uppercase text-lg leading-tight">
              {rankDelta > 0 ? 'Rank Improved!' : 'Rank'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {rankBeforeFinish != null && rankBeforeFinish !== rankAfter && (
              <span className="font-headline-md text-white/50 line-through text-lg">#{rankBeforeFinish}</span>
            )}
            <div className="relative">
              <div className="bg-[#FFD84D] border-2 border-[#14241C] px-3 py-1 rounded-xl hard-shadow rotate-[-4deg]">
                <span className="font-headline-lg text-2xl text-[#14241C]">#{rankAfter}</span>
              </div>
              {rankDelta > 0 && (
                <div className="absolute -top-3 -right-3 bg-[#FF8A65] border-2 border-[#14241C] rounded-full px-2 py-0.5 text-white font-label-md text-xs hard-shadow">
                  +{rankDelta}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sensor Verification Note */}
      <div className="flex items-center justify-center gap-2 px-4 py-1">
        <span className="material-symbols-outlined text-[#3d4a40] text-sm">verified_user</span>
        <span className="text-[12px] font-body-md text-[#3d4a40]">
          ตรวจสอบด้วยเซนเซอร์การเคลื่อนไหว + GPS{lastResult.mode === 'simulate' ? ' (โหมดจำลอง — SIMULATED)' : ''}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 px-1 z-10">
        <button
          onClick={() => dispatch({ type: 'NAV', screen: 'shop' })}
          className="w-full bg-[#006a3a] hover:bg-[#00864b] py-3.5 rounded-full border-2 border-[#14241C] hard-shadow flex items-center justify-center gap-2 active:translate-y-[2px] transition-all"
        >
          <span className="material-symbols-outlined text-white">shopping_bag</span>
          <span className="font-headline-md text-white uppercase text-base">ใช้ coin (ไปร้านค้า)</span>
        </button>

        <button
          onClick={handleDone}
          className="w-full bg-white hover:bg-[#ebfef1] py-3.5 rounded-full border-2 border-[#14241C] hard-shadow flex items-center justify-center gap-2 active:translate-y-[2px] transition-all"
        >
          <span className="font-headline-md text-[#14241C] uppercase text-base">เสร็จสิ้น</span>
        </button>
      </div>
    </div>
  );
};
