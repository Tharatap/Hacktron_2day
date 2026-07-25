import React, { useState } from 'react';
import { NavTab, LocationSpot, UserProfileData, PastRunHistory, ShopReward } from './types';
import { PIG_MASCOT_AVATAR, LOCATION_SPOTS } from './data/mockData';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { MapTab } from './components/MapTab';
import { RunTab } from './components/RunTab';
import { ShopTab } from './components/ShopTab';
import { PlanTab } from './components/PlanTab';
import { ProfileTab } from './components/ProfileTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('map');
  const [selectedRunLocation, setSelectedRunLocation] = useState<LocationSpot | null>(LOCATION_SPOTS[0]);

  // Global user state
  const [profile, setProfile] = useState<UserProfileData>({
    name: 'น้องหมูวิ่งฉิว',
    levelTitle: 'นักวิ่งบางแสนสายชิล',
    coins: 640,
    totalKm: 24.6,
    totalRuns: 14,
    streakDays: 4,
    hatColor: 'green',
    avatarUrl: PIG_MASCOT_AVATAR
  });

  const [pastRuns, setPastRuns] = useState<PastRunHistory[]>([]);

  // Start a run from MapTab
  const handleStartRun = (location: LocationSpot) => {
    setSelectedRunLocation(location);
    setActiveTab('run');
  };

  // Finish a run
  const handleFinishRun = (earnedCoins: number, runRecord: PastRunHistory) => {
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + earnedCoins,
      totalKm: Number((prev.totalKm + runRecord.distanceKm).toFixed(2)),
      totalRuns: prev.totalRuns + 1,
      streakDays: prev.streakDays + 1
    }));
    setPastRuns((prev) => [runRecord, ...prev]);
  };

  // Redeem a reward in ShopTab
  const handleRedeemReward = (reward: ShopReward) => {
    setProfile((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - reward.coinsCost)
    }));
  };

  // Custom Mascot Hat Update
  const handleUpdateHatColor = (hatColor: 'green' | 'pink' | 'yellow' | 'blue') => {
    setProfile((prev) => ({ ...prev, hatColor }));
  };

  return (
    <div className="min-h-screen flex flex-col font-body-md text-[#0f1f17] bg-[#F2F7F3] max-w-md mx-auto relative shadow-2xl">
      {/* Header */}
      <Header
        activeTab={activeTab}
        profile={profile}
        onProfileClick={() => setActiveTab('profile')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pt-20 pb-28 bg-[#F2F7F3] px-4">
        {activeTab === 'map' && (
          <MapTab
            coins={profile.coins}
            onStartRun={handleStartRun}
          />
        )}

        {activeTab === 'run' && (
          <RunTab
            currentLocation={selectedRunLocation}
            onFinishRun={handleFinishRun}
            onGoToShop={() => setActiveTab('shop')}
          />
        )}

        {activeTab === 'shop' && (
          <ShopTab
            coins={profile.coins}
            onRedeemReward={handleRedeemReward}
          />
        )}

        {activeTab === 'plan' && <PlanTab />}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            pastRuns={pastRuns}
            onUpdateHatColor={handleUpdateHatColor}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
