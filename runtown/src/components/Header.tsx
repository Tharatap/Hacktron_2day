import React from 'react';
import { NavTab, UserProfileData } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  profile: UserProfileData;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, profile, onProfileClick }) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'map': return 'MAP';
      case 'run': return 'RUN';
      case 'shop': return 'SHOP';
      case 'plan': return 'PLAN';
      case 'profile': return 'PROFILE';
      default: return 'RUNTOWN';
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#ebfef1]/80 backdrop-blur-xl pt-safe border-b border-[#14241C]/10">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-2xl text-[#14241C] uppercase tracking-wide">
            {getTabTitle()}
          </span>
        </div>
        
        <button 
          onClick={onProfileClick}
          className="relative transition-transform hover:scale-105 active:scale-95"
          title="ดูโปรไฟล์"
        >
          <img 
            alt={profile.name}
            src={profile.avatarUrl} 
            className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-[#14241C] rotate-[-2deg] object-cover hard-shadow"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#FFD84D] border border-[#14241C] rounded-full text-[10px] px-1 font-bold">
            L12
          </div>
        </button>
      </div>
    </header>
  );
};
