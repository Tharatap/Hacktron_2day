import React, { useState, useEffect } from 'react';
import { LocationSpot, PastRunHistory } from '../types';

interface RunTabProps {
  currentLocation?: LocationSpot | null;
  onFinishRun: (earnedCoins: number, runRecord: PastRunHistory) => void;
  onGoToShop: () => void;
}

export const RunTab: React.FC<RunTabProps> = ({ currentLocation, onFinishRun, onGoToShop }) => {
  // Run states
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(1122); // Default ~18m 42s
  const [distanceKm, setDistanceKm] = useState<number>(2.34);
  const [calories, setCalories] = useState<number>(164);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Active run timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isFinished && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        setDistanceKm((prev) => Number((prev + 0.002).toFixed(2)));
        setCalories((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFinished, isPaused]);

  // Format seconds to MM:SS
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate Pace (minutes per km)
  const getPace = () => {
    if (distanceKm <= 0) return "0'00\"";
    const totalMinutes = seconds / 60;
    const paceVal = totalMinutes / distanceKm;
    const paceMin = Math.floor(paceVal);
    const paceSec = Math.floor((paceVal - paceMin) * 60);
    return `${paceMin}'${paceSec.toString().padStart(2, '0')}"`;
  };

  const handleStop = () => {
    setIsFinished(true);
  };

  const handleCompleteRun = () => {
    const earnedCoins = 78;
    const newRecord: PastRunHistory = {
      id: `run-${Date.now()}`,
      date: 'วันนี้',
      location: currentLocation ? `${currentLocation.name} จ๊อกกิ้ง 5K` : 'หาดบางแสน จ๊อกกิ้ง 5K',
      distanceKm: distanceKm > 0 ? distanceKm : 3.65,
      timeFormatted: formatTime(seconds),
      pace: getPace(),
      coinsEarned: earnedCoins
    };
    onFinishRun(earnedCoins, newRecord);
  };

  const locationName = currentLocation ? currentLocation.name : 'เลียบหาดบางแสน 4.2K';

  // Waveform heights for Cadence
  const waveformHeights = [14, 22, 18, 26, 20, 18, 15, 24, 12, 16, 28, 22, 19, 10, 24, 25, 21, 28, 14, 18, 22, 16, 24, 18, 22, 14, 20, 12, 18, 10];

  if (isFinished) {
    // ---------------- POST-RUN RECEIPT SUMMARY VIEW ----------------
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
              <span className="font-headline-lg text-[48px] leading-none text-[#14241C]">+78</span>
              <span className="font-label-md text-sm text-[#14241C] uppercase mt-1">coin ที่ได้</span>
            </div>
            <div className="absolute -top-3 -right-3 bg-[#FF8A65] border-2 border-[#14241C] text-white px-3 py-1 rounded-full hard-shadow rotate-[12deg] font-label-md text-xs font-bold">
              NEW RECORD!
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
              <span className="font-label-md">Distance 3.65 km</span>
              <div className="flex-1 border-b-2 border-dotted border-[#bccabd] mx-2 mb-1"></div>
              <span className="font-headline-md text-base">+54</span>
            </div>

            <div className="flex justify-between items-baseline font-body-md text-[#14241C]">
              <span className="font-label-md">Checkpoints 3/4</span>
              <div className="flex-1 border-b-2 border-dotted border-[#bccabd] mx-2 mb-1"></div>
              <span className="font-headline-md text-base">+16</span>
            </div>

            <div className="flex justify-between items-baseline font-body-md text-[#14241C]">
              <span className="font-label-md">Streak 4 days</span>
              <div className="flex-1 border-b-2 border-dotted border-[#bccabd] mx-2 mb-1"></div>
              <span className="font-headline-md text-base">+8</span>
            </div>

            <div className="flex justify-between items-baseline font-body-md text-[#3d4a40]/60">
              <span className="font-label-md italic">Daily cap</span>
              <div className="flex-1 border-b-2 border-dotted border-[#bccabd]/40 mx-2 mb-1"></div>
              <span className="font-label-md">300</span>
            </div>

            <div className="mt-2 pt-4 border-t-2 border-[#14241C] flex justify-between items-center">
              <span className="font-headline-md text-xl uppercase">TOTAL</span>
              <span className="font-headline-lg text-3xl text-[#14241C]">78</span>
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
            <span className="font-headline-md text-xl text-[#14241C]">3.65 <span className="text-xs">km</span></span>
          </div>

          <div className="bg-white border-2 border-[#14241C] hard-shadow p-3 rounded-xl rotate-[3deg] flex flex-col">
            <span className="text-[10px] font-label-md text-[#3d4a40] uppercase">Time</span>
            <span className="font-headline-md text-xl text-[#14241C]">30:00</span>
          </div>

          <div className="bg-white border-2 border-[#14241C] hard-shadow p-3 rounded-xl rotate-[1deg] flex flex-col">
            <span className="text-[10px] font-label-md text-[#3d4a40] uppercase">Avg Pace</span>
            <span className="font-headline-md text-xl text-[#14241C]">8'14"</span>
          </div>

          <div className="bg-white border-2 border-[#14241C] hard-shadow p-3 rounded-xl rotate-[-3deg] flex flex-col">
            <span className="text-[10px] font-label-md text-[#3d4a40] uppercase">Calories</span>
            <span className="font-headline-md text-xl text-[#14241C]">226 <span className="text-xs">kcal</span></span>
          </div>
        </div>

        {/* Rank Improvement Card */}
        <div className="bg-[#006a3a] border-2 border-[#14241C] hard-shadow rounded-2xl p-4 flex items-center justify-between mx-1 z-10">
          <div className="flex flex-col">
            <span className="font-handwritten-sm text-white/90">{locationName}</span>
            <span className="font-headline-md text-white uppercase text-lg leading-tight">Rank Improved!</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-headline-md text-white/50 line-through text-lg">#7</span>
            <div className="relative">
              <div className="bg-[#FFD84D] border-2 border-[#14241C] px-3 py-1 rounded-xl hard-shadow rotate-[-4deg]">
                <span className="font-headline-lg text-2xl text-[#14241C]">#4</span>
              </div>
              <div className="absolute -top-3 -right-3 bg-[#FF8A65] border-2 border-[#14241C] rounded-full px-2 py-0.5 text-white font-label-md text-xs hard-shadow">
                +3
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Verification Note */}
        <div className="flex items-center justify-center gap-2 px-4 py-1">
          <span className="material-symbols-outlined text-[#3d4a40] text-sm">verified_user</span>
          <span className="text-[12px] font-body-md text-[#3d4a40]">ตรวจสอบด้วยเซนเซอร์การเคลื่อนไหว + GPS</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 px-1 z-10">
          <button
            onClick={() => {
              handleCompleteRun();
              onGoToShop();
            }}
            className="w-full bg-[#006a3a] hover:bg-[#00864b] py-3.5 rounded-full border-2 border-[#14241C] hard-shadow flex items-center justify-center gap-2 active:translate-y-[2px] transition-all"
          >
            <span className="material-symbols-outlined text-white">shopping_bag</span>
            <span className="font-headline-md text-white uppercase text-base">ใช้ coin (ไปร้านค้า)</span>
          </button>

          <button
            onClick={handleCompleteRun}
            className="w-full bg-white hover:bg-[#ebfef1] py-3.5 rounded-full border-2 border-[#14241C] hard-shadow flex items-center justify-center gap-2 active:translate-y-[2px] transition-all"
          >
            <span className="font-headline-md text-[#14241C] uppercase text-base">เสร็จสิ้น</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------- ACTIVE LIVE RUNNING MODE VIEW ----------------
  return (
    <div className="flex flex-col w-full -mt-2">
      {/* Top Bar: Status */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <div className="flex flex-col">
          <span className="font-handwritten-sm text-[#3d4a40]">Running at</span>
          <span className="font-headline-md text-lg text-[#14241C]">{locationName}</span>
        </div>

        <div className="bg-[#FFD84D] border-2 border-[#14241C] hard-shadow px-3 py-1 rounded-full flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-[#FF6B6B] rounded-full animate-pulse"></div>
          <span className="font-label-md text-xs text-[#14241C] uppercase font-bold">Sensor On</span>
        </div>
      </div>

      {/* Hero Metric: Distance */}
      <div className="flex flex-col items-center justify-center py-8 bg-[#0B4A33] rounded-3xl relative overflow-hidden mb-4 border-2 border-[#14241C] hard-shadow">
        {/* Decorative Grid SVG Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg height="100%" width="100%">
            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect fill="url(#grid)" height="100%" width="100%" />
          </svg>
        </div>

        <span className="font-label-md text-xs text-white/80 tracking-widest uppercase mb-1">
          DISTANCE
        </span>

        <div className="flex items-baseline gap-1 relative">
          <span className="font-display-lg text-[80px] leading-none text-[#FFD84D] drop-shadow-[4px_4px_0px_#14241C]">
            {distanceKm.toFixed(2)}
          </span>
          <span className="font-headline-md text-2xl text-white">km</span>
        </div>
      </div>

      {/* Metric Row: Time, Pace, Kcal */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Time */}
        <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-xl p-2.5 flex flex-col items-center rotate-[-2deg]">
          <span className="font-label-md text-[10px] text-[#3d4a40] uppercase">Time</span>
          <span className="font-headline-md text-lg text-[#14241C]">{formatTime(seconds)}</span>
        </div>

        {/* Pace */}
        <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-xl p-2.5 flex flex-col items-center rotate-[1deg]">
          <span className="font-label-md text-[10px] text-[#3d4a40] uppercase">Pace</span>
          <span className="font-headline-md text-lg text-[#14241C]">{getPace()}</span>
        </div>

        {/* Kcal */}
        <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-xl p-2.5 flex flex-col items-center rotate-[-1deg]">
          <span className="font-label-md text-[10px] text-[#3d4a40] uppercase">Kcal</span>
          <span className="font-headline-md text-lg text-[#14241C]">{calories}</span>
        </div>
      </div>

      {/* Cadence Panel */}
      <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-xl p-4 mb-4 relative">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-[#3d4a40] uppercase">Cadence</span>
            <span className="font-headline-md text-xl text-[#14241C]">
              168 <span className="text-sm font-normal">spm</span>
            </span>
          </div>
          <span className="font-handwritten-sm text-[#006a3a] rotate-[-5deg] mb-1 font-bold">
            Feeling fast! ⚡
          </span>
        </div>

        {/* Simulated Waveform Bar Chart */}
        <div className="flex items-end justify-between h-12 gap-[2px]">
          {waveformHeights.map((h, idx) => (
            <div
              key={idx}
              className="flex-1 bg-[#006a3a] border-[1.5px] border-[#14241C] transition-all duration-300"
              style={{
                height: `${isPaused ? h * 0.5 : Math.max(8, (h + Math.sin(seconds + idx) * 6))}` + 'px'
              }}
            />
          ))}
        </div>
      </div>

      {/* Checkpoint Strip */}
      <div className="bg-white rounded-xl p-4 mb-4 border-2 border-[#14241C] hard-shadow">
        <div className="relative h-12 flex items-center justify-between px-3">
          <div className="absolute left-0 right-0 h-1 bg-[#14241C] top-1/2 -translate-y-1/2"></div>
          
          {/* Completed Checkpoints */}
          <div className="relative w-8 h-8 rounded-full bg-[#006a3a] border-2 border-[#14241C] flex items-center justify-center z-10 hard-shadow">
            <span className="material-symbols-outlined text-white text-sm">check</span>
          </div>

          <div className="relative w-8 h-8 rounded-full bg-[#006a3a] border-2 border-[#14241C] flex items-center justify-center z-10 hard-shadow">
            <span className="material-symbols-outlined text-white text-sm">check</span>
          </div>

          {/* Current/Next Checkpoint */}
          <div className="relative z-10">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FFD84D] px-2 py-0.5 border-2 border-[#14241C] hard-shadow rotate-[-3deg]">
              <span className="font-handwritten-sm text-xs font-bold text-[#14241C]">จุดต่อไป!</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FFD84D] border-2 border-[#14241C] flex items-center justify-center hard-shadow">
              <span className="material-symbols-outlined text-[#14241C] text-lg">location_on</span>
            </div>
          </div>

          {/* Upcoming */}
          <div className="w-8 h-8 rounded-full bg-white border-2 border-[#14241C] z-10"></div>
          <div className="w-8 h-8 rounded-full bg-white border-2 border-[#14241C] z-10"></div>
        </div>

        <p className="text-center font-body-md text-sm text-[#14241C] mt-2">
          จุดถัดไป: <span className="font-bold text-[#006a3a]">ลานปูดำ</span> — อีก 0.8 กม.
        </p>
      </div>

      {/* Mini Route Map View */}
      <div className="relative h-[150px] bg-white border-2 border-[#14241C] hard-shadow rounded-xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-[#e5f8eb] opacity-80" />
        <div className="absolute inset-0 p-4 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 300 150">
            <path d="M0,50 Q150,70 300,40" fill="none" opacity="0.3" stroke="#14241C" strokeDasharray="8 4" strokeWidth="4" />
            <path d="M20,130 Q100,120 150,80" fill="none" stroke="#12A05C" strokeLinecap="round" strokeWidth="6" />
            <path d="M150,80 Q200,40 280,20" fill="none" stroke="#14241C" strokeDasharray="6 6" strokeWidth="3" />
            <circle cx="150" cy="80" fill="#FF6B6B" r="8" stroke="#14241C" strokeWidth="2" />
            <circle className="animate-ping" cx="150" cy="80" fill="#FF6B6B" opacity="0.3" r="14" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-0.5 rounded border-2 border-[#14241C] text-[10px] font-label-md">
          LIVE MAP VIEW
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-around px-6 pb-6">
        {/* Stop Button */}
        <button
          onClick={handleStop}
          className="w-14 h-14 rounded-full bg-white border-2 border-[#14241C] hard-shadow flex items-center justify-center active:translate-y-[2px] transition-transform"
          title="หยุดการวิ่ง"
        >
          <span className="material-symbols-outlined text-[#14241C] text-3xl">stop</span>
        </button>

        {/* Pause/Resume Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-20 h-20 rounded-full bg-[#FFD84D] border-2 border-[#14241C] hard-shadow flex items-center justify-center active:translate-y-[2px] transition-transform scale-110"
          title={isPaused ? "วิ่งต่อ" : "พิกวิ่ง"}
        >
          <span className="material-symbols-outlined text-[#14241C] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPaused ? 'play_arrow' : 'pause'}
          </span>
        </button>

        {/* Lock Button */}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`w-14 h-14 rounded-full border-2 border-[#14241C] hard-shadow flex items-center justify-center active:translate-y-[2px] transition-transform ${
            isLocked ? 'bg-[#FFD84D]' : 'bg-white'
          }`}
          title="ล็อคหน้าจอ"
        >
          <span className="material-symbols-outlined text-[#14241C] text-3xl">
            {isLocked ? 'lock' : 'lock_open'}
          </span>
        </button>
      </div>
    </div>
  );
};
