import React from 'react';
import { useApp } from '../state/AppContext';
import type { Screen } from '../types';

const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'run', label: 'Run', icon: 'directions_run' },
  { id: 'shop', label: 'Shop', icon: 'shopping_bag' },
  { id: 'planner', label: 'Plan', icon: 'calendar_month' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

/** 'zone' เป็น sub-state ของ map, 'finish' เป็น sub-state ของ run — ใช้ไฮไลต์แท็บแม่ */
function navTabFor(screen: Screen): Screen {
  if (screen === 'zone') return 'map';
  if (screen === 'finish') return 'run';
  return screen;
}

export const Navbar: React.FC = () => {
  const { state, dispatch } = useApp();
  const activeTab = navTabFor(state.ui.screen);

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white border-t-2 border-[#14241C] pb-safe">
      <div className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'NAV', screen: tab.id })}
              className={`flex flex-col items-center justify-center transition-all h-12 w-16 text-[#14241C] ${
                isActive
                  ? 'bg-[#FFD84D] border-2 border-[#14241C] hard-shadow rounded-full px-4 py-1'
                  : 'hover:opacity-80'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{tab.icon}</span>
              <span className="text-[10px] font-label-md font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
