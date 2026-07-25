import React, { useState } from 'react';
import { UserProfileData, PastRunHistory } from '../types';
import { MOCK_RUN_HISTORY } from '../data/mockData';

interface ProfileTabProps {
  profile: UserProfileData;
  pastRuns: PastRunHistory[];
  onUpdateHatColor: (hatColor: 'green' | 'pink' | 'yellow' | 'blue') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  pastRuns,
  onUpdateHatColor,
}) => {
  const [selectedHat, setSelectedHat] = useState<'green' | 'pink' | 'yellow' | 'blue'>(profile.hatColor);

  const handleHatSelect = (hat: 'green' | 'pink' | 'yellow' | 'blue') => {
    setSelectedHat(hat);
    onUpdateHatColor(hat);
  };

  const getHatBg = (hat: 'green' | 'pink' | 'yellow' | 'blue') => {
    switch (hat) {
      case 'green': return 'bg-[#80fbac]';
      case 'pink': return 'bg-pink-300';
      case 'yellow': return 'bg-[#FFD84D]';
      case 'blue': return 'bg-[#A3E4FF]';
    }
  };

  const allRuns = [...pastRuns, ...MOCK_RUN_HISTORY];

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Profile Header Sticker Card */}
      <div className="relative bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-6 flex flex-col items-center text-center">
        {/* Mascot Avatar with Ring */}
        <div className="relative mb-3">
          <div className={`p-2 rounded-full border-3 border-[#14241C] hard-shadow ${getHatBg(selectedHat)}`}>
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-white ring-2 ring-[#14241C] rotate-[-2deg]"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#FFD84D] border-2 border-[#14241C] rounded-full px-3 py-0.5 text-xs font-bold font-headline-md hard-shadow">
            Level 12
          </div>
        </div>

        <h2 className="font-headline-md text-2xl text-[#14241C] mb-0.5">{profile.name}</h2>
        <p className="font-handwritten-sm text-sm text-[#006a3a] font-bold mb-4">
          🏆 นักวิ่งบางแสนสายชิล
        </p>

        {/* Mascot Gear Hat Customizer */}
        <div className="bg-[#e5f8eb] border-2 border-[#14241C] p-3 rounded-xl w-full flex flex-col items-center">
          <span className="font-label-md text-xs text-[#3d4a40] mb-2 font-bold">
            🧢 ตกแต่งหมวกน้องหมู Mascot
          </span>
          <div className="flex gap-3">
            {(['green', 'pink', 'yellow', 'blue'] as const).map((hat) => (
              <button
                key={hat}
                onClick={() => handleHatSelect(hat)}
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
            {profile.totalKm} <span className="text-sm font-normal">km</span>
          </p>
        </div>

        <div className="bg-white border-2 border-[#14241C] hard-shadow p-4 rounded-xl rotate-[1.5deg]">
          <span className="text-xs font-label-md text-[#3d4a40] uppercase font-bold">
            TOTAL RUNS
          </span>
          <p className="font-headline-lg text-3xl text-[#14241C] mt-1">
            {profile.totalRuns} <span className="text-sm font-normal">ครั้ง</span>
          </p>
        </div>

        <div className="bg-white border-2 border-[#14241C] hard-shadow p-4 rounded-xl rotate-[1deg]">
          <span className="text-xs font-label-md text-[#3d4a40] uppercase font-bold">
            COIN BALANCE
          </span>
          <p className="font-headline-lg text-3xl text-[#006a3a] mt-1">
            {profile.coins} <span className="text-sm font-normal">🪙</span>
          </p>
        </div>

        <div className="bg-[#FF8A65] text-white border-2 border-[#14241C] hard-shadow p-4 rounded-xl rotate-[-2deg]">
          <span className="text-xs font-label-md uppercase font-bold text-white/90">
            RUN STREAK
          </span>
          <p className="font-headline-lg text-3xl text-white mt-1">
            {profile.streakDays} <span className="text-sm font-normal">วันรวด</span>
          </p>
        </div>
      </div>

      {/* Badges & Sticker Book */}
      <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-5">
        <h3 className="font-headline-md text-lg text-[#14241C] mb-3 flex items-center gap-2">
          <span>🏷️ สมุดสะสมสติ๊กเกอร์ยศนักวิ่ง</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#e5f8eb] border-2 border-[#14241C] p-3 rounded-xl flex items-center gap-2.5">
            <span className="text-2xl">🏖️</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">Beach Runner</p>
              <p className="text-[10px] text-[#3d4a40]">วิ่งเลียบหาดบางแสน</p>
            </div>
          </div>

          <div className="bg-[#FFD84D]/40 border-2 border-[#14241C] p-3 rounded-xl flex items-center gap-2.5">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">5K Finisher</p>
              <p className="text-[10px] text-[#3d4a40]">พิชิตระยะ 5K</p>
            </div>
          </div>

          <div className="bg-[#A3E4FF]/40 border-2 border-[#14241C] p-3 rounded-xl flex items-center gap-2.5">
            <span className="text-2xl">🌙</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">Night Jogger</p>
              <p className="text-[10px] text-[#3d4a40]">วิ่งยามค่ำคืน</p>
            </div>
          </div>

          <div className="bg-gray-100 border-2 border-dashed border-[#14241C] p-3 rounded-xl flex items-center gap-2.5 opacity-60">
            <span className="text-2xl">⛰️</span>
            <div>
              <p className="font-headline-md text-xs text-[#14241C]">Trail Master</p>
              <p className="text-[10px] text-[#3d4a40]">วิ่งเทรลเขาสามมุข (ยังไม่ปลด)</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white border-2 border-[#14241C] hard-shadow rounded-2xl p-5">
        <h3 className="font-headline-md text-lg text-[#14241C] mb-3 flex items-center gap-2">
          <span>📜 ประวัติการวิ่งย้อนหลัง</span>
        </h3>

        <div className="flex flex-col gap-3">
          {allRuns.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between p-3 bg-[#f8faf8] border-2 border-[#14241C] rounded-xl hard-shadow-sm"
            >
              <div className="flex flex-col">
                <span className="font-headline-md text-sm text-[#14241C]">
                  {run.location}
                </span>
                <span className="text-xs text-[#3d4a40]">
                  {run.date} • {run.timeFormatted} • Pace {run.pace}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-headline-md text-base text-[#006a3a]">
                  {run.distanceKm} km
                </span>
                <span className="text-[11px] font-bold text-[#FFD84D] bg-[#14241C] px-1.5 py-0.2 rounded">
                  +{run.coinsEarned} Coins
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
