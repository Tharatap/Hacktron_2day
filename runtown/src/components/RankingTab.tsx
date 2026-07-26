import React, { useMemo, useState } from 'react';
import { useApp } from '../state/AppContext';
import { DISTANCE_TIER_LABEL, filterLeaderboard, formatPace, tierInfo } from '../lib/formulas';
import type { DistanceTier, PaceTier } from '../types';

export const RankingTab: React.FC = () => {
  const { state } = useApp();
  const [zoneId, setZoneId] = useState(state.user.homeZoneId);
  const [pace, setPace] = useState<PaceTier | 'all'>('all');
  const [distance, setDistance] = useState<DistanceTier | 'all'>('all');
  const zone = state.zones.find((item) => item.id === zoneId) ?? state.zones[0];
  const rows = useMemo(
    () => filterLeaderboard(state.leaderboards[zone.id] ?? [], pace, distance),
    [distance, pace, state.leaderboards, zone.id]
  );
  const meIndex = rows.findIndex((item) => item.userId === state.user.id);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <section className="bg-[#FFD84D] border-2 border-[#14241C] hard-shadow-lg rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -right-5 -bottom-7 text-7xl rotate-[-8deg]" aria-hidden="true">🏆</div>
        <p className="font-handwritten-sm">วิ่งกับคนที่เพซใกล้กัน</p>
        <h1 className="font-headline-lg-mobile mt-1">อันดับนักวิ่ง<br />ประจำพื้นที่</h1>
        <p className="mt-2 text-sm max-w-[260px]">อันดับแบ่งตามโซน ระยะ และระดับเพซ จึงสนุกได้ทุกสปีด</p>
      </section>

      <label className="font-label-md">
        พื้นที่ / อำเภอ
        <select value={zone.id} onChange={(event) => setZoneId(event.target.value)} className="mt-2 w-full min-h-12 bg-white border-2 border-[#14241C] hard-shadow rounded-xl px-3 font-body-md">
          {state.zones.map((item) => <option key={item.id} value={item.id}>{item.name} • {item.district}</option>)}
        </select>
      </label>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" aria-label="กรองตามระดับเพซ">
        {(['all', 'walker', 'jogger', 'runner', 'racer'] as const).map((item) => (
          <button key={item} onClick={() => setPace(item)} aria-pressed={pace === item} className={`whitespace-nowrap px-3 py-2 border-2 border-ink rounded-full font-label-md text-xs ${pace === item ? 'bg-coral hard-shadow-sm' : 'bg-white'}`}>
            {item === 'all' ? 'ทุกเพซ' : tierInfo(item).label}
          </button>
        ))}
      </div>
      <div className="flex gap-2" aria-label="กรองตามระยะ">
        {(['all', 'D3', 'D5', 'D10', 'D21'] as const).map((item) => (
          <button key={item} onClick={() => setDistance(item)} aria-pressed={distance === item} className={`flex-1 py-2 border-2 border-[#14241C] rounded-lg font-label-md text-xs ${distance === item ? 'bg-[#A9E5C0] hard-shadow-sm' : 'bg-white'}`}>
            {item === 'all' ? 'ทั้งหมด' : DISTANCE_TIER_LABEL[item]}
          </button>
        ))}
      </div>

      {meIndex >= 0 && (
        <div className="bg-[#0B6E45] text-white border-2 border-[#14241C] hard-shadow rounded-xl px-4 py-3 flex justify-between items-center">
          <span><strong className="font-headline-md text-lg">อันดับของคุณ #{meIndex + 1}</strong><span className="block text-xs text-white">ในตัวกรองนี้</span></span>
          <span className="text-2xl" aria-hidden="true">📍</span>
        </div>
      )}

      <ol className="flex flex-col gap-3" aria-label={`อันดับนักวิ่ง ${zone.name}`}>
        {rows.map((entry, index) => (
          <li key={entry.userId} className={`border-2 border-[#14241C] hard-shadow rounded-xl p-3 flex items-center gap-3 ${entry.isMe ? 'bg-[#FFF2B8]' : 'bg-white'}`}>
            <span className={`w-9 h-9 border-2 border-[#14241C] rounded-full flex items-center justify-center font-headline-md ${index < 3 ? 'bg-[#FFD84D]' : 'bg-[#EEF7F0]'}`}>{index + 1}</span>
            <span className="text-2xl" aria-hidden="true">{entry.avatar}</span>
            <span className="min-w-0 flex-1"><strong className="block truncate">{entry.name}{entry.isMe ? ' (คุณ)' : ''}</strong><span className="text-xs text-ink-soft">{formatPace(entry.paceSec)} min/km • {entry.runsThisWeek} ครั้ง</span></span>
            <strong className="text-grass">{entry.distanceKm.toFixed(1)}<span className="block text-xs text-right text-ink-soft">km</span></strong>
          </li>
        ))}
      </ol>
      {rows.length === 0 && <div className="border-2 border-dashed border-[#14241C] rounded-xl p-6 text-center"><p className="font-headline-md text-base">ยังไม่มีนักวิ่งในกลุ่มนี้</p><p className="text-sm mt-1">ลองเปลี่ยนตัวกรองระยะหรือเพซ</p></div>}
    </div>
  );
};
