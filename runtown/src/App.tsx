import React from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { MapTab } from './components/MapTab';
import { RunTab } from './components/RunTab';
import { ShopTab } from './components/ShopTab';
import { PlanTab } from './components/PlanTab';
import { ProfileTab } from './components/ProfileTab';

function CurrentScreen() {
  const { state } = useApp();

  switch (state.ui.screen) {
    case 'map':
    case 'zone':
      return <MapTab />;
    case 'run':
    case 'finish':
      return <RunTab />;
    case 'shop':
      return <ShopTab />;
    case 'planner':
      return <PlanTab />;
    case 'profile':
      return <ProfileTab />;
    default:
      return null;
  }
}

function Shell() {
  return (
    <div className="min-h-screen flex flex-col font-body-md text-[#0f1f17] bg-[#F2F7F3] max-w-md mx-auto relative shadow-2xl">
      <Header />
      <main className="flex-1 pt-20 pb-28 bg-[#F2F7F3] px-4">
        <CurrentScreen />
      </main>
      <Navbar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
