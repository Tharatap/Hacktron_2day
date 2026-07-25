export type NavTab = 'map' | 'run' | 'shop' | 'plan' | 'profile';

export interface LocationSpot {
  id: string;
  name: string;
  subLocation: string;
  runnersCount: number;
  rating: number;
  loopKm: number;
  tags: string[];
  image: string;
  topNote?: string;
  position: {
    top: string;
    left: string;
    rotation: string;
  };
  cardImage?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  distanceKm: number;
  avatar: string;
  isUser?: boolean;
  pace?: string;
  activityType?: string;
  rankBadge?: string;
}

export interface ShopReward {
  id: string;
  title: string;
  location?: string;
  description: string;
  coinsCost: number;
  image: string;
  annotation?: string;
  category: 'ทั้งหมด' | 'อุปกรณ์' | 'อาหาร' | 'สุขภาพ' | 'งานวิ่ง';
  distanceToUnlockKm?: number;
}

export interface TrainingDay {
  id: string;
  day: string;
  dateNum: string;
  type: 'EASY' | 'REST' | 'TEMPO' | 'LONG';
  typeColorBg: string;
  distanceKm: number;
  locationNotes: string;
  timeRange?: string;
  isCompleted: boolean;
}

export interface UserProfileData {
  name: string;
  levelTitle: string;
  coins: number;
  totalKm: number;
  totalRuns: number;
  streakDays: number;
  hatColor: 'green' | 'pink' | 'yellow' | 'blue';
  avatarUrl: string;
}

export interface PastRunHistory {
  id: string;
  date: string;
  location: string;
  distanceKm: number;
  timeFormatted: string;
  pace: string;
  coinsEarned: number;
}
