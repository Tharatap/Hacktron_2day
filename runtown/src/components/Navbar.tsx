import React from 'react';
import { useApp } from '../state/AppContext';
import type { Screen } from '../types';

const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'planner', label: 'Plan', icon: 'calendar_month' },
  { id: 'run', label: 'Run', icon: 'directions_run' },
  { id: 'ranking', label: 'Ranking', icon: 'leaderboard' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

/** 'zone' เป็น sub-state ของ map, 'finish' เป็น sub-state ของ run — ใช้ไฮไลต์แท็บแม่ */
function navTabFor(screen: Screen): Screen {
  if (screen === 'map' || screen === 'zone' || screen === 'shop') return 'home';
  if (screen === 'finish') return 'run';
  return screen;
}

export const Navbar: React.FC = () => {
  const { state, dispatch } = useApp();
  const activeTab = navTabFor(state.ui.screen);

  return (
    <nav className="absolute bottom-0 inset-x-0 z-50 bg-white border-t-2 border-ink pb-safe" aria-label="เมนูหลัก">
      <div className="grid grid-cols-5 items-end h-[84px] px-1 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isRun = tab.id === 'run';
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'NAV', screen: tab.id === 'run' && state.run.status === 'finished' ? 'finish' : tab.id })}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
              className={`justify-self-center flex flex-col items-center justify-center transition-transform text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral ${isRun ? `w-[66px] h-[66px] -translate-y-3 rounded-full border-2 border-ink hard-shadow-lg ${isActive ? 'bg-coral text-ink' : 'bg-grass text-white'}` : `w-[60px] sm:w-[68px] h-14 rounded-xl ${isActive ? 'bg-lemon border-2 border-ink hard-shadow-sm -translate-y-1' : ''}`}`}
            >
              <span className={`material-symbols-outlined ${isRun ? 'text-[30px]' : 'text-2xl'}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined} aria-hidden="true">{tab.icon}</span>
              <span className="font-label-md text-xs font-bold leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
