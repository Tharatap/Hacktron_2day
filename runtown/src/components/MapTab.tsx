import React, { useState } from 'react';
import { useApp, useSelectedZone, useLiveRunnerTotal } from '../state/AppContext';
import { useRunEngine } from '../state/useRunEngine';
import { filterLeaderboard, formatPace, tierInfo } from '../lib/formulas';

const RUNTOWN_LOGO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCRfpyyB8zJmtGuKPtHVXiPgEYhQVpQahwuefrQOeCP50CFh2TTvqEAy4rXYI_3C0KIvOD0OKo2I8pluFuceUiLuvW_SENMeBNGupaTQf5EaUU9Df46QILrOSI-6VJnpshVXRm2PfqlhLuREeSd0lu-egwmFVDq8XgstE6vlfkuP2urZ-BfrnMdznh2Bc15eBxGww8Bguq9U2imo39_WwvdACQEYEOnpQL2P4LDQYL_9JqRxSWN9JEdG7BuOAY31h6chasSKPx9tKE';

/**
 * artwork ของ Stitch สำหรับ sticker map — Leaflet ยังไม่เข้ามาแทน (ดู TODO ใน STATE_DESIGN.md)
 * ผูกกับ zone.id เป็น presentation-only เท่านั้น ไม่ใช่ข้อมูลธุรกิจ ห้ามอ่าน field พวกนี้จาก useApp()
 */
const ZONE_ART: Record<
  string,
  { image: string; cardImage: string; topNote?: string; position: { top: string; left: string; rotation: string } }
> = {
  'z-bangsaen': {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDD1DvQzRMJBhwqmiaqtugQOqJxRG4qHZrl1kaPI7FKHB62QpDTdWphs5c1QYA0KPiAHmDN7VEfUsPCW-IhrX2ByM4YTJ_KWwvBdszZHVlcKxleyHk95anOnAArPf-GGsrw3kdpDuJYgYRVn1Z0e5K6RTeUxhZoZ-1hRWh4X3FuDlEg-TcGo3-4N9JOuZNXL8FcfbKdCO1Qlt2P6NatJPCXGXQOx_PN6Y6-wJRbWEBgiZOVTyLw4PsI5VPaVpMy43jvIynHUxWUcE0',
    cardImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCTNNqa38QtnSu5PdO34Z1YyLuXX8fC6hMdBws2_S1iea1nqCdULPo2Eu8wTasM-2xPr8Xldn5VF0nKuG6Zs7O7j52x_JSdAsxjVLF8j0n5M2ui8vPV7GSoFosh7xNgENciKZo4Y_A6Nuxyy9LaUHZfbernAomj9H7SaFeeVH_kUdnNzBnIJTTfg1PajWQItY5A2hV9rLjRwOG3tqF36s8ztbjciZa7CqdoWe9laVRx8wW8B8l2xCJ0tKnPfsa7iYJIxZQnuDw3JzA',
    topNote: 'คนเยอะสุดตอนนี้',
    position: { top: '40%', left: '30%', rotation: 'rotate-[-4deg]' },
  },
  'z-ku-sriracha': {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDN29bbI3A9j5IYRN0RoQuUJKXNqjbLyQOsVfYI-bOjgFu1eA631WLb1HxPeGryn0lrCTtBhXsvQweqIjtP7ZXpj6ag-b3WuGXRhwezkmMgfrn_AA-UNXP-QJLKQYivQY-g5q5aNDkJulkjgcyAHJsHz8EvQzTf7UsfdOzusYz9sTA45nounsQnU5eHEhb16f9v5jK9iH0-aryutmLLNsfkeuN4K0qD04vcpEFvwWyCdQPDB7DJq5ogldrkPUKCO70sTbXd31ROL4I',
    cardImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDN29bbI3A9j5IYRN0RoQuUJKXNqjbLyQOsVfYI-bOjgFu1eA631WLb1HxPeGryn0lrCTtBhXsvQweqIjtP7ZXpj6ag-b3WuGXRhwezkmMgfrn_AA-UNXP-QJLKQYivQY-g5q5aNDkJulkjgcyAHJsHz8EvQzTf7UsfdOzusYz9sTA45nounsQnU5eHEhb16f9v5jK9iH0-aryutmLLNsfkeuN4K0qD04vcpEFvwWyCdQPDB7DJq5ogldrkPUKCO70sTbXd31ROL4I',
    position: { top: '20%', left: '70%', rotation: 'rotate-[3deg]' },
  },
  'z-laemchabang': {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRQ2DQFrXR8QgJpSNTh6dJuwqejJJIm3rn1DM1ikxSOteMPAIaECgYFbqV3H27dqbEFXjpLdmKsyG35ex4-VzJW9JNApXtdLzZ1loxYK_NUC7qAVKEVwU6R4ThLdqIo89f-uL3E5PdL6VG8zXa7KTMj5BzsCojLKY5NxBOFmRyeKscSYrBvNbce0K4opf62IqjGqK-DQ_8tAekiuyN5ETTd1FxdXJss-o4jVljNElCCxmaxw85-J6ancyJ33drSYFRSmq4x1khhLo',
    cardImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRQ2DQFrXR8QgJpSNTh6dJuwqejJJIm3rn1DM1ikxSOteMPAIaECgYFbqV3H27dqbEFXjpLdmKsyG35ex4-VzJW9JNApXtdLzZ1loxYK_NUC7qAVKEVwU6R4ThLdqIo89f-uL3E5PdL6VG8zXa7KTMj5BzsCojLKY5NxBOFmRyeKscSYrBvNbce0K4opf62IqjGqK-DQ_8tAekiuyN5ETTd1FxdXJss-o4jVljNElCCxmaxw85-J6ancyJ33drSYFRSmq4x1khhLo',
    position: { top: '60%', left: '75%', rotation: 'rotate-[-2deg]' },
  },
  'z-bangphra': {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB62ZrizFgrV7EnXHlx_yrrAi011s15c_wTb6ODK5bX6gnrMxaiDR5BkcL03BT7QbjkwmyyUcBEL8-Zf7Ay3XqwBfT8zFtg0NZelRjueeLPLSgDRzqc-WcLGJvU5gUIh9213J2OI8mlhcVcTZ7DgRZLlhYFGy88hatxmZt0O8LSsbMU2OAicMlayK2o4CAYyl3j_z1GuehBHkPfgTm0pgo66DZJbWY3HHrgFG93P0HxwA90zplZEAGlJUgKGAGEKUPaMHrC5C8dzDw',
    cardImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB62ZrizFgrV7EnXHlx_yrrAi011s15c_wTb6ODK5bX6gnrMxaiDR5BkcL03BT7QbjkwmyyUcBEL8-Zf7Ay3XqwBfT8zFtg0NZelRjueeLPLSgDRzqc-WcLGJvU5gUIh9213J2OI8mlhcVcTZ7DgRZLlhYFGy88hatxmZt0O8LSsbMU2OAicMlayK2o4CAYyl3j_z1GuehBHkPfgTm0pgo66DZJbWY3HHrgFG93P0HxwA90zplZEAGlJUgKGAGEKUPaMHrC5C8dzDw',
    position: { top: '12%', left: '20%', rotation: 'rotate-[5deg]' },
  },
  'z-kohloy': {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLwXgBu3NEIZRgrfx_psRrk07ud90K3Gclu8_u1-3BtDgs57JvfGaRlr6t0xk3cvSpcPh-MeNeWAej66Vkz7XbhgmGeHBkRrM1NP2jAQZGGNSSkMJhVmVc53LimX7cOaBTm8MqDwuVA-dcAOYby7lCqTrFC4j07RT5Y0xOocMiPIJsUqoM3dOlu0UlZFEdBpqYk86higdLVkdjFdy99o7K6QQow8iCnalFoIOcnKC_WXXBp5kzpOxvP55-AQj1tOC0dPNRsPV0iKc',
    cardImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLwXgBu3NEIZRgrfx_psRrk07ud90K3Gclu8_u1-3BtDgs57JvfGaRlr6t0xk3cvSpcPh-MeNeWAej66Vkz7XbhgmGeHBkRrM1NP2jAQZGGNSSkMJhVmVc53LimX7cOaBTm8MqDwuVA-dcAOYby7lCqTrFC4j07RT5Y0xOocMiPIJsUqoM3dOlu0UlZFEdBpqYk86higdLVkdjFdy99o7K6QQow8iCnalFoIOcnKC_WXXBp5kzpOxvP55-AQj1tOC0dPNRsPV0iKc',
    position: { top: '72%', left: '18%', rotation: 'rotate-[2deg]' },
  },
  'z-samuk': {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgb_zG6E6RCutz39JzX8k5ngOF9gqkPuH_iksvaFRCXTh6hSLwXS3pvDQnwEgah5u5MapNfEfrKjKxfuQXQxYx-OstdF84f4IXiM60-RzQN7jJKq_s38uGGtKftcc5tDT0EK7mmUXXyLklNSK-VKVQXHpn2v5FkLQBENxAF-OEoywRMK8HzOOY1IGut4aYRFnPcFlGjNbe9r6TmOsrgc5gcU6yzVB8fVWzR_4g3caoDuDrn3MRAPFUgYJf1wVAYQq-VPjWVqXGr_M',
    cardImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgb_zG6E6RCutz39JzX8k5ngOF9gqkPuH_iksvaFRCXTh6hSLwXS3pvDQnwEgah5u5MapNfEfrKjKxfuQXQxYx-OstdF84f4IXiM60-RzQN7jJKq_s38uGGtKftcc5tDT0EK7mmUXXyLklNSK-VKVQXHpn2v5FkLQBENxAF-OEoywRMK8HzOOY1IGut4aYRFnPcFlGjNbe9r6TmOsrgc5gcU6yzVB8fVWzR_4g3caoDuDrn3MRAPFUgYJf1wVAYQq-VPjWVqXGr_M',
    position: { top: '45%', left: '52%', rotation: 'rotate-[-6deg]' },
  },
};

const rankBadge = (rank: number): string | null => (rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null);

export const MapTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const { armRun } = useRunEngine();
  const liveRunnerTotal = useLiveRunnerTotal();
  const selectedZoneFromState = useSelectedZone();
  const selectedZone = selectedZoneFromState ?? state.zones[0];

  const [activeFilter, setActiveFilter] = useState<string>('ทั้งหมด');
  const [subTab, setSubTab] = useState<'Ranking' | 'Routes' | 'Community'>('Ranking');

  const filters = ['ทั้งหมด', ...Array.from(new Set(state.zones.flatMap((z) => z.tags)))];

  const filteredZones = state.zones.filter((zone) => {
    if (activeFilter === 'ทั้งหมด') return true;
    return zone.tags.includes(activeFilter);
  });

  const leaderboard = filterLeaderboard(state.leaderboards[selectedZone.id] ?? [], 'all', 'all');
  const zoneRoutes = state.routes.filter((r) => r.zoneId === selectedZone.id);
  const primaryRoute = zoneRoutes[0];
  const towerCount = primaryRoute ? primaryRoute.checkpoints.filter((c) => c.kind === 'tower').length : 0;

  const art = ZONE_ART[selectedZone.id];

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
          <span className="font-headline-md text-[18px] text-[#14241C]">{state.user.coins}</span>
        </div>
      </div>

      {/* Live Banner */}
      <div className="w-full bg-coral text-ink border-2 border-ink rounded-xl p-2 mb-4 hard-shadow flex items-center justify-center gap-2 overflow-hidden">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-40"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-ink"></span>
        </div>
        <span className="font-label-md text-ink text-base font-semibold">
          ตอนนี้มีคนวิ่งในชลบุรี {liveRunnerTotal} คน
        </span>
      </div>

      {/* Free Run — เริ่มวิ่งได้เลยโดยไม่ต้องเลือกโซน วัดระยะ/เวลาจากจุดเริ่มถึงจุดที่กด Stop เอง */}
      <button
        onClick={() => armRun(null)}
        className="w-full bg-white text-[#14241C] border-2 border-[#14241C] rounded-xl p-2.5 mb-4 hard-shadow flex items-center justify-center gap-2 font-label-md font-semibold hover:bg-[#FFD84D]/20 active:translate-y-[1px] transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">directions_run</span>
        เริ่มวิ่งอิสระ (ไม่ต้องเลือกโซน)
      </button>

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
            backgroundSize: '40px 40px',
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
        {filteredZones.map((zone) => {
          const zoneArt = ZONE_ART[zone.id];
          if (!zoneArt) return null;
          const isSelected = selectedZone.id === zone.id;
          return (
            <div
              key={zone.id}
              onClick={() => dispatch({ type: 'SELECT_ZONE', zoneId: zone.id })}
              style={{ top: zoneArt.position.top, left: zoneArt.position.left }}
              className={`absolute cursor-pointer transition-transform duration-200 z-20 ${
                zoneArt.position.rotation
              } ${isSelected ? 'scale-110 z-30' : 'hover:scale-105'}`}
            >
              <div className="relative">
                {zoneArt.topNote && (
                  <div className="absolute -top-10 -right-16 w-32 pointer-events-none z-10">
                    <span className="font-handwritten-sm text-[#14241C] font-semibold bg-[#FFD84D]/90 px-1.5 py-0.5 rounded border border-[#14241C] text-xs block mb-1">
                      {zoneArt.topNote}
                    </span>
                    <svg className="rotate-[120deg]" fill="none" height="20" viewBox="0 0 40 20" width="40">
                      <path d="M1 1C5 15 25 18 38 5" stroke="#14241C" strokeLinecap="round" strokeWidth="2" />
                      <path d="M35 12L38 5L31 3" stroke="#14241C" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </div>
                )}

                <div className={`bg-white border-[3px] border-[#14241C] p-1 hard-shadow ${
                  isSelected ? 'ring-4 ring-[#FFD84D]' : ''
                } ${zone.id === 'z-bangsaen' ? 'w-16 h-16' : 'w-12 h-12'}`}>
                  <img
                    alt={zone.name}
                    src={zoneArt.image}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute -top-3 -right-3 bg-lemon border-2 border-ink rounded-full px-2 py-0.5 text-xs font-headline-md hard-shadow">
                    {zone.liveRunners}
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
              alt={selectedZone.name}
              src={art?.cardImage ?? art?.image}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h2 className="font-headline-md text-xl text-[#14241C] truncate">{selectedZone.name}</h2>
              <div className="flex items-center gap-1 bg-[#FFD84D] px-2 py-0.5 rounded-full border-2 border-[#14241C]">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label-md text-[12px]">{selectedZone.rating}</span>
              </div>
            </div>

            <p className="font-body-md text-sm text-ink-soft mb-1">
              📍 {selectedZone.district} • {selectedZone.loopDistanceKm} km loop
            </p>

            <div className="flex items-center justify-between">
              <span className="font-label-md text-[#FF6B5A] text-sm font-semibold">
                🔥 {selectedZone.liveRunners} คนกำลังวิ่ง
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {selectedZone.tags.map((tag) => (
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
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub Tab Content */}
        {subTab === 'Ranking' && (
          <div className="flex flex-col gap-2.5 mb-5">
            {leaderboard.map((entry, i) => {
              const rank = i + 1;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 border-[#14241C] hard-shadow transition-transform hover:scale-[1.01] ${
                    entry.isMe ? 'bg-[#FFD84D]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-headline-md text-lg w-6 text-center">
                      {rankBadge(rank) ?? rank}
                    </span>

                    <div className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-[#14241C] bg-[#e5f8eb] flex items-center justify-center text-lg">
                      {entry.avatar}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-headline-md text-sm text-[#14241C] flex items-center gap-1">
                        {entry.name}
                        {entry.isMe && (
                          <span className="bg-ink text-white text-xs px-1.5 py-0.5 rounded">นี่คุณ!</span>
                        )}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {tierInfo(entry.paceTier).labelTh} • {formatPace(entry.paceSec)}
                      </span>
                    </div>
                  </div>

                  <div className="font-headline-md text-base text-[#14241C]">
                    {entry.distanceKm} <span className="text-xs font-normal">km</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {subTab === 'Routes' && (
          <div className="p-3 bg-[#e5f8eb] rounded-xl border-2 border-[#14241C] mb-5 text-sm">
            <p className="font-semibold mb-1">🏃‍♂️ เส้นทางวิ่งรอบ{selectedZone.name}</p>
            <p className="text-xs text-ink-soft mb-2">{selectedZone.description}</p>
            <div className="flex gap-2">
              <span className="bg-white border border-[#14241C] px-2 py-1 rounded text-xs font-bold">จุดเช็คพอยท์: {towerCount} จุด</span>
              <span className="bg-white border border-[#14241C] px-2 py-1 rounded text-xs font-bold">ห้องน้ำ: {selectedZone.hasToilet ? 'มีบริการ' : 'ไม่มี'}</span>
            </div>
          </div>
        )}

        {subTab === 'Community' && (
          <div className="p-3 bg-white rounded-xl border-2 border-[#14241C] mb-5 text-sm">
            <p className="font-semibold mb-2">📸 รูปภาพสติ๊กเกอร์จากเพื่อนๆ</p>
            <div className="grid grid-cols-3 gap-2">
              {state.zones.slice(0, 3).map((z) => (
                <img
                  key={z.id}
                  src={ZONE_ART[z.id]?.image}
                  alt="community"
                  className="w-full h-20 object-cover rounded border-2 border-[#14241C] hard-shadow rotate-[2deg]"
                />
              ))}
            </div>
          </div>
        )}

        {/* Start Run Action Button */}
        <button
          onClick={() => {
            if (!primaryRoute) return;
            armRun(primaryRoute.id);
          }}
          disabled={!primaryRoute}
          className="w-full bg-[#006a3a] text-white py-3.5 px-6 rounded-full border-2 border-[#14241C] hard-shadow flex items-center justify-center gap-2 font-headline-md text-lg hover:bg-[#00864b] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-2xl">play_circle</span>
          <span>เริ่มวิ่งที่นี่ ({selectedZone.name})</span>
        </button>
      </div>
    </div>
  );
};
