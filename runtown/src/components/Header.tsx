import React from 'react';
import { useApp } from '../state/AppContext';
import type { Screen } from '../types';

function titleFor(screen: Screen): string {
  switch (screen) {
    case 'map': return 'EXPLORE';
    case 'zone': return 'ZONE';
    case 'run': return 'RUN';
    case 'finish': return 'FINISH';
    case 'ranking': return 'RANKING';
    case 'shop': return 'REWARDS';
    case 'planner': return 'PLAN';
    case 'profile': return 'PROFILE';
    default: return 'RUNTOWN';
  }
}

export const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const { user } = state;

  return (
    <header className="absolute top-0 inset-x-0 z-50 bg-paper/95 backdrop-blur-xl pt-safe border-b border-ink/15">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-2xl text-ink uppercase tracking-[0.035em]">
            {titleFor(state.ui.screen)}
          </span>
        </div>

        <button
          onClick={() => dispatch({ type: 'NAV', screen: 'profile' })}
          className="relative transition-transform hover:scale-105 active:scale-95"
          title="ดูโปรไฟล์"
          aria-label="ดูโปรไฟล์"
        >
          <div className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-ink rotate-[-2deg] hard-shadow bg-white flex items-center justify-center text-xl">
            {user.avatar}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-lemon border border-ink rounded-full text-xs leading-none px-1 py-0.5 font-bold">
            L12
          </div>
        </button>
      </div>
    </header>
  );
};
