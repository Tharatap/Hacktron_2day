import React, { useState } from 'react';
import { LocationSpot, LeaderboardUser } from '../types';
import { LOCATION_SPOTS, LEADERBOARD_USERS, RUNTOWN_LOGO } from '../data/mockData';

interface MapTabProps {
  coins: number;
  onStartRun: (location: LocationSpot) => void;
}

export const MapTab: React.FC<MapTabProps> = ({ coins, onStartRun }) => {
  const [selectedSpot, setSelectedSpot] = useState<LocationSpot>(LOCATION_SPOTS[0]);
  const [activeFilter, setActiveFilter] = useState<string>('ทั้งหมด');
  const [subTab, setSubTab] = useState<'Ranking' | 'Routes' | 'Community'>('Ranking');

  const filters = ['ทั้งหมด', 'ริมทะเล', 'เทรล', 'ลู่ยาง', 'มีไฟกลางคืน'];

  const filteredSpots = LOCATION_SPOTS.filter((spot) => {
    if (activeFilter === 'ทั้งหมด') return true;
    return spot.tags.includes(activeFilter);
  });

  return (
    <div className="flex flex-col w-full">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img 
            alt="RunTown Logo" 
            src={RUNTOWN_LOGO} 
            className="h-10 object-contain drop-shadow" 
          />
        </div>
        <div className="flex items-center gap-1 bg-[#FFD84D] border-2 border-[#14241C] px-3 py-1 rounded-full hard-shadow">
          <span className="material-symbols-outlined text-[#14241C] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            monetization_on
          </span>
          <span className="font-headline-md text-[18px] text-[#14241C]">{coins}</span>
        </div>
      </div>

      {/* Live Banner */}
      <div className="w-full bg-[#FF6B5A] border-2 border-[#14241C] rounded-xl p-2 mb-4 hard-shadow flex items-center justify-center gap-2 overflow-hidden">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </div>
        <span className="font-label-md text-white text-base font-semibold">
          ตอนนี้มีคนวิ่งในชลบุรี 111 คน
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full border-2 border-[#14241C] font-label-md text-sm transition-all ${
                isActive
                  ? 'bg-[#FFD84D] text-[#14241C] hard-shadow'
                  : 'bg-white text-[#14241C] hover:bg-[#FFD84D]/50'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Map Interactive Area */}
      <div className="relative w-full aspect-[4/5] bg-[#B3E5FC] rounded-[32px] border-2 border-[#14241C] hard-shadow overflow-hidden mb-6">
        {/* Subtle Map Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 20% 30%, #FFF 2px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }} 
        />

        {/* Animated Sea Waves SVG */}
        <svg className="absolute bottom-0 w-full h-24 text-white/30" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path 
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" 
            fill="currentColor" 
          />
        </svg>

        {/* Location Sticker Markers */}
        {filteredSpots.map((spot) => {
          const isSelected = selectedSpot.id === spot.id;
          return (
            <div
              key={spot.id}
              onClick={() => setSelectedSpot(spot)}
              style={{ top: spot.position.top, left: spot.position.left }}
              className={`absolute cursor-pointer transition-transform duration-200 z-20 ${
                spot.position.rotation
              } ${isSelected ? 'scale-110 z-30' : 'hover:scale-105'}`}
            >
              <div className="relative">
                {spot.topNote && (
                  <div className="absolute -top-10 -right-16 w-32 pointer-events-none z-10">
                    <span className="font-handwritten-sm text-[#14241C] font-semibold bg-[#FFD84D]/90 px-1.5 py-0.5 rounded border border-[#14241C] text-xs block mb-1">
                      {spot.topNote}
                    </span>
                    <svg className="rotate-[120deg]" fill="none" height="20" viewBox="0 0 40 20" width="40">
                      <path d="M1 1C5 15 25 18 38 5" stroke="#14241C" strokeLinecap="round" strokeWidth="2" />
                      <path d="M35 12L38 5L31 3" stroke="#14241C" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </div>
                )}
                
                <div className={`bg-white border-[3px] border-[#14241C] p-1 hard-shadow ${
                  isSelected ? 'ring-4 ring-[#FFD84D]' : ''
                } ${spot.id === 'bangsaen' ? 'w-16 h-16' : 'w-12 h-12'}`}>
                  <img 
                    alt={spot.name} 
                    src={spot.image} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute -top-3 -right-3 bg-[#FFD84D] border-2 border-[#14241C] rounded-full px-2 py-0.5 text-[11px] font-headline-md hard-shadow">
                    {spot.runnersCount}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Location Card & Details */}
      <div className="relative bg-white border-2 border-[#14241C] rounded-[24px] p-4 hard-shadow mb-6">
        <div className="flex gap-4 items-center mb-4">
          <div className="w-20 h-20 flex-shrink-0 rotate-[-3deg] border-[3px] border-white ring-2 ring-[#14241C] hard-shadow overflow-hidden rounded-lg">
            <img 
              alt={selectedSpot.name} 
              src={selectedSpot.cardImage || selectedSpot.image} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h2 className="font-headline-md text-xl text-[#14241C] truncate">{selectedSpot.name}</h2>
              <div className="flex items-center gap-1 bg-[#FFD84D] px-2 py-0.5 rounded-full border-2 border-[#14241C]">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label-md text-[12px]">{selectedSpot.rating}</span>
              </div>
            </div>
            
            <p className="font-body-md text-sm text-[#3d4a40] mb-1">
              📍 {selectedSpot.subLocation} • {selectedSpot.loopKm} km loop
            </p>
            
            <div className="flex items-center justify-between">
              <span className="font-label-md text-[#FF6B5A] text-sm font-semibold">
                🔥 {selectedSpot.runnersCount} คนกำลังวิ่ง
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {selectedSpot.tags.map((tag) => (
            <span key={tag} className="bg-[#e5f8eb] border border-[#14241C] text-[#006a3a] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Sub Navigation (Ranking / Routes / Community) */}
        <div className="flex border-b-2 border-[#14241C] mb-4 gap-4">
          {(['Ranking', 'Routes', 'Community'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`pb-2 font-headline-md text-base transition-colors ${
                subTab === tab
                  ? 'border-b-4 border-[#FFD84D] text-[#14241C]'
                  : 'text-[#6d7a6f] hover:text-[#14241C]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub Tab Content */}
        {subTab === 'Ranking' && (
          <div className="flex flex-col gap-2.5 mb-5">
            {LEADERBOARD_USERS.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-3 rounded-xl border-2 border-[#14241C] hard-shadow transition-transform hover:scale-[1.01] ${
                  user.isUser ? 'bg-[#FFD84D]' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-headline-md text-lg w-6 text-center">
                    {user.rankBadge || user.rank}
                  </span>
                  
                  <img 
                    alt={user.name} 
                    src={user.avatar} 
                    className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-[#14241C] object-cover" 
                  />
                  
                  <div className="flex flex-col">
                    <span className="font-headline-md text-sm text-[#14241C] flex items-center gap-1">
                      {user.name}
                      {user.isUser && (
                        <span className="bg-[#14241C] text-white text-[10px] px-1.5 py-0.2 rounded">นี่คุณ!</span>
                      )}
                    </span>
                    {user.pace && (
                      <span className="text-[11px] text-[#3d4a40]">
                        {user.activityType} • {user.pace}
                      </span>
                    )}
                  </div>
                </div>

                <div className="font-headline-md text-base text-[#14241C]">
                  {user.distanceKm} <span className="text-xs font-normal">km</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'Routes' && (
          <div className="p-3 bg-[#e5f8eb] rounded-xl border-2 border-[#14241C] mb-5 text-sm">
            <p className="font-semibold mb-1">🏃‍♂️ เส้นทางวิ่งรอบ{selectedSpot.name}</p>
            <p className="text-xs text-[#3d4a40] mb-2">รอบละ {selectedSpot.loopKm} กม. พื้นเรียบวิ่งง่าย เหมาะสำหรับซ้อมวิ่งระยะ 5K - 10K</p>
            <div className="flex gap-2">
              <span className="bg-white border border-[#14241C] px-2 py-1 rounded text-xs font-bold">จุดจุดให้น้ำ: 3 จุด</span>
              <span className="bg-white border border-[#14241C] px-2 py-1 rounded text-xs font-bold">ห้องน้ำ: มีบริการ</span>
            </div>
          </div>
        )}

        {subTab === 'Community' && (
          <div className="p-3 bg-white rounded-xl border-2 border-[#14241C] mb-5 text-sm">
            <p className="font-semibold mb-2">📸 รูปภาพสติ๊กเกอร์จากเพื่อนๆ</p>
            <div className="grid grid-cols-3 gap-2">
              {LOCATION_SPOTS.slice(0, 3).map((s, i) => (
                <img 
                  key={i} 
                  src={s.image} 
                  alt="community" 
                  className="w-full h-20 object-cover rounded border-2 border-[#14241C] hard-shadow rotate-[2deg]" 
                />
              ))}
            </div>
          </div>
        )}

        {/* Start Run Action Button */}
        <button
          onClick={() => onStartRun(selectedSpot)}
          className="w-full bg-[#006a3a] text-white py-3.5 px-6 rounded-full border-2 border-[#14241C] hard-shadow flex items-center justify-center gap-2 font-headline-md text-lg hover:bg-[#00864b] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <span className="material-symbols-outlined text-2xl">play_circle</span>
          <span>เริ่มวิ่งที่นี่ ({selectedSpot.name})</span>
        </button>
      </div>
    </div>
  );
};
