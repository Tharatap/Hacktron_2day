import { LocationSpot, LeaderboardUser, ShopReward, TrainingDay, PastRunHistory } from '../types';

export const PIG_MASCOT_AVATAR = "https://lh3.googleusercontent.com/aida/AP1WRLt2ml1Lj0uKRvEOcazCm6wcN-LuGCsPFJ_qeZN8MTVtGhOipQoWZmDtcpouHOI482K_Fo9CPVTIaKBVpx9fpzqSTjd3xv_uwfEkawganxlxgApJ_koXwAXmls80RzfmmUO2hOxp_xL6TEUrl-Wnmr84Iy27qXSTpTcPeQYBGWFVNymC_WmqI21VVwS58JAG5XrnWEkuRF4l65neFdj48Ovphyyy1uyj_jH8Bu1kCq9GczzqVSLiKpdRpG-r22TzHohUe0aY-duV-A";

export const RUNTOWN_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuCRfpyyB8zJmtGuKPtHVXiPgEYhQVpQahwuefrQOeCP50CFh2TTvqEAy4rXYI_3C0KIvOD0OKo2I8pluFuceUiLuvW_SENMeBNGupaTQf5EaUU9Df46QILrOSI-6VJnpshVXRm2PfqlhLuREeSd0lu-egwmFVDq8XgstE6vlfkuP2urZ-BfrnMdznh2Bc15eBxGww8Bguq9U2imo39_WwvdACQEYEOnpQL2P4LDQYL_9JqRxSWN9JEdG7BuOAY31h6chasSKPx9tKE";

export const LOCATION_SPOTS: LocationSpot[] = [
  {
    id: 'bangsaen',
    name: 'หาดบางแสน',
    subLocation: 'เมืองชลบุรี',
    runnersCount: 38,
    rating: 4.7,
    loopKm: 4.2,
    tags: ['ริมทะเล', 'พื้นเรียบ', 'มีไฟกลางคืน'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD1DvQzRMJBhwqmiaqtugQOqJxRG4qHZrl1kaPI7FKHB62QpDTdWphs5c1QYA0KPiAHmDN7VEfUsPCW-IhrX2ByM4YTJ_KWwvBdszZHVlcKxleyHk95anOnAArPf-GGsrw3kdpDuJYgYRVn1Z0e5K6RTeUxhZoZ-1hRWh4X3FuDlEg-TcGo3-4N9JOuZNXL8FcfbKdCO1Qlt2P6NatJPCXGXQOx_PN6Y6-wJRbWEBgiZOVTyLw4PsI5VPaVpMy43jvIynHUxWUcE0',
    cardImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTNNqa38QtnSu5PdO34Z1YyLuXX8fC6hMdBws2_S1iea1nqCdULPo2Eu8wTasM-2xPr8Xldn5VF0nKuG6Zs7O7j52x_JSdAsxjVLF8j0n5M2ui8vPV7GSoFosh7xNgENciKZo4Y_A6Nuxyy9LaUHZfbernAomj9H7SaFeeVH_kUdnNzBnIJTTfg1PajWQItY5A2hV9rLjRwOG3tqF36s8ztbjciZa7CqdoWe9laVRx8wW8B8l2xCJ0tKnPfsa7iYJIxZQnuDw3JzA',
    topNote: 'คนเยอะสุดตอนนี้',
    position: {
      top: '40%',
      left: '30%',
      rotation: 'rotate-[-4deg]'
    }
  },
  {
    id: 'ku-sriracha',
    name: 'สนามลู่วิ่ง ม.เกษตร ศรีราชา',
    subLocation: 'ศรีราชา ชลบุรี',
    runnersCount: 22,
    rating: 4.8,
    loopKm: 0.4,
    tags: ['ลู่ยาง', 'ไฟสว่าง', 'ที่จอดรถสะดวก'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN29bbI3A9j5IYRN0RoQuUJKXNqjbLyQOsVfYI-bOjgFu1eA631WLb1HxPeGryn0lrCTtBhXsvQweqIjtP7ZXpj6ag-b3WuGXRhwezkmMgfrn_AA-UNXP-QJLKQYivQY-g5q5aNDkJulkjgcyAHJsHz8EvQzTf7UsfdOzusYz9sTA45nounsQnU5eHEhb16f9v5jK9iH0-aryutmLLNsfkeuN4K0qD04vcpEFvwWyCdQPDB7DJq5ogldrkPUKCO70sTbXd31ROL4I',
    cardImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN29bbI3A9j5IYRN0RoQuUJKXNqjbLyQOsVfYI-bOjgFu1eA631WLb1HxPeGryn0lrCTtBhXsvQweqIjtP7ZXpj6ag-b3WuGXRhwezkmMgfrn_AA-UNXP-QJLKQYivQY-g5q5aNDkJulkjgcyAHJsHz8EvQzTf7UsfdOzusYz9sTA45nounsQnU5eHEhb16f9v5jK9iH0-aryutmLLNsfkeuN4K0qD04vcpEFvwWyCdQPDB7DJq5ogldrkPUKCO70sTbXd31ROL4I',
    position: {
      top: '20%',
      left: '70%',
      rotation: 'rotate-[3deg]'
    }
  },
  {
    id: 'laem-chabang',
    name: 'สวนสุขภาพแหลมฉบัง',
    subLocation: 'แหลมฉบัง',
    runnersCount: 17,
    rating: 4.5,
    loopKm: 2.1,
    tags: ['สวนสาธารณะ', 'มีลมทะเล', 'ลานแอโรบิก'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRQ2DQFrXR8QgJpSNTh6dJuwqejJJIm3rn1DM1ikxSOteMPAIaECgYFbqV3H27dqbEFXjpLdmKsyG35ex4-VzJW9JNApXtdLzZ1loxYK_NUC7qAVKEVwU6R4ThLdqIo89f-uL3E5PdL6VG8zXa7KTMj5BzsCojLKY5NxBOFmRyeKscSYrBvNbce0K4opf62IqjGqK-DQ_8tAekiuyN5ETTd1FxdXJss-o4jVljNElCCxmaxw85-J6ancyJ33drSYFRSmq4x1khhLo',
    cardImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRQ2DQFrXR8QgJpSNTh6dJuwqejJJIm3rn1DM1ikxSOteMPAIaECgYFbqV3H27dqbEFXjpLdmKsyG35ex4-VzJW9JNApXtdLzZ1loxYK_NUC7qAVKEVwU6R4ThLdqIo89f-uL3E5PdL6VG8zXa7KTMj5BzsCojLKY5NxBOFmRyeKscSYrBvNbce0K4opf62IqjGqK-DQ_8tAekiuyN5ETTd1FxdXJss-o4jVljNElCCxmaxw85-J6ancyJ33drSYFRSmq4x1khhLo',
    position: {
      top: '60%',
      left: '75%',
      rotation: 'rotate-[-2deg]'
    }
  },
  {
    id: 'bang-phra',
    name: 'อ่างเก็บน้ำบางพระ',
    subLocation: 'ศรีราชา',
    runnersCount: 14,
    rating: 4.9,
    loopKm: 8.5,
    tags: ['เทรล', 'วิวภูเขา', 'อากาศดีมาก'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB62ZrizFgrV7EnXHlx_yrrAi011s15c_wTb6ODK5bX6gnrMxaiDR5BkcL03BT7QbjkwmyyUcBEL8-Zf7Ay3XqwBfT8zFtg0NZelRjueeLPLSgDRzqc-WcLGJvU5gUIh9213J2OI8mlhcVcTZ7DgRZLlhYFGy88hatxmZt0O8LSsbMU2OAicMlayK2o4CAYyl3j_z1GuehBHkPfgTm0pgo66DZJbWY3HHrgFG93P0HxwA90zplZEAGlJUgKGAGEKUPaMHrC5C8dzDw',
    cardImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB62ZrizFgrV7EnXHlx_yrrAi011s15c_wTb6ODK5bX6gnrMxaiDR5BkcL03BT7QbjkwmyyUcBEL8-Zf7Ay3XqwBfT8zFtg0NZelRjueeLPLSgDRzqc-WcLGJvU5gUIh9213J2OI8mlhcVcTZ7DgRZLlhYFGy88hatxmZt0O8LSsbMU2OAicMlayK2o4CAYyl3j_z1GuehBHkPfgTm0pgo66DZJbWY3HHrgFG93P0HxwA90zplZEAGlJUgKGAGEKUPaMHrC5C8dzDw',
    position: {
      top: '12%',
      left: '20%',
      rotation: 'rotate-[5deg]'
    }
  },
  {
    id: 'koh-loy',
    name: 'เกาะลอย ศรีราชา',
    subLocation: 'ศรีราชา',
    runnersCount: 11,
    rating: 4.6,
    loopKm: 1.8,
    tags: ['ริมทะเล', 'สะพานข้ามทะเล', 'รับลมเย็น'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLwXgBu3NEIZRgrfx_psRrk07ud90K3Gclu8_u1-3BtDgs57JvfGaRlr6t0xk3cvSpcPh-MeNeWAej66Vkz7XbhgmGeHBkRrM1NP2jAQZGGNSSkMJhVmVc53LimX7cOaBTm8MqDwuVA-dcAOYby7lCqTrFC4j07RT5Y0xOocMiPIJsUqoM3dOlu0UlZFEdBpqYk86higdLVkdjFdy99o7K6QQow8iCnalFoIOcnKC_WXXBp5kzpOxvP55-AQj1tOC0dPNRsPV0iKc',
    cardImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLwXgBu3NEIZRgrfx_psRrk07ud90K3Gclu8_u1-3BtDgs57JvfGaRlr6t0xk3cvSpcPh-MeNeWAej66Vkz7XbhgmGeHBkRrM1NP2jAQZGGNSSkMJhVmVc53LimX7cOaBTm8MqDwuVA-dcAOYby7lCqTrFC4j07RT5Y0xOocMiPIJsUqoM3dOlu0UlZFEdBpqYk86higdLVkdjFdy99o7K6QQow8iCnalFoIOcnKC_WXXBp5kzpOxvP55-AQj1tOC0dPNRsPV0iKc',
    position: {
      top: '72%',
      left: '18%',
      rotation: 'rotate-[2deg]'
    }
  },
  {
    id: 'khao-sam-muk',
    name: 'เขาสามมุข',
    subLocation: 'บางแสน',
    runnersCount: 9,
    rating: 4.4,
    loopKm: 3.5,
    tags: ['เนินชัน', 'เทรลชัน', 'วิวพาโนรามา'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgb_zG6E6RCutz39JzX8k5ngOF9gqkPuH_iksvaFRCXTh6hSLwXS3pvDQnwEgah5u5MapNfEfrKjKxfuQXQxYx-OstdF84f4IXiM60-RzQN7jJKq_s38uGGtKftcc5tDT0EK7mmUXXyLklNSK-VKVQXHpn2v5FkLQBENxAF-OEoywRMK8HzOOY1IGut4aYRFnPcFlGjNbe9r6TmOsrgc5gcU6yzVB8fVWzR_4g3caoDuDrn3MRAPFUgYJf1wVAYQq-VPjWVqXGr_M',
    cardImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgb_zG6E6RCutz39JzX8k5ngOF9gqkPuH_iksvaFRCXTh6hSLwXS3pvDQnwEgah5u5MapNfEfrKjKxfuQXQxYx-OstdF84f4IXiM60-RzQN7jJKq_s38uGGtKftcc5tDT0EK7mmUXXyLklNSK-VKVQXHpn2v5FkLQBENxAF-OEoywRMK8HzOOY1IGut4aYRFnPcFlGjNbe9r6TmOsrgc5gcU6yzVB8fVWzR_4g3caoDuDrn3MRAPFUgYJf1wVAYQq-VPjWVqXGr_M',
    position: {
      top: '45%',
      left: '52%',
      rotation: 'rotate-[-6deg]'
    }
  }
];

export const LEADERBOARD_USERS: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'ฟ้าใส_RunHard',
    distanceKm: 32.4,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rankBadge: '👑'
  },
  {
    rank: 2,
    name: 'กอล์ฟ_PaceMaker',
    distanceKm: 28.1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rankBadge: '🥈'
  },
  {
    rank: 3,
    name: 'น้ำหวาน_Runner',
    distanceKm: 26.5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    rankBadge: '🥉'
  },
  {
    rank: 4,
    name: 'น้องหมูวิ่งฉิว (คุณ)',
    distanceKm: 24.6,
    avatar: PIG_MASCOT_AVATAR,
    isUser: true
  },
  {
    rank: 5,
    name: 'RunWithMe',
    distanceKm: 21.0,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    activityType: 'จ๊อกกิ้ง',
    pace: "8'10\"/km"
  },
  {
    rank: 6,
    name: 'Tuk_Tuk',
    distanceKm: 19.5,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    activityType: 'จ๊อกกิ้ง',
    pace: "8'28\"/km"
  }
];

export const SHOP_REWARDS: ShopReward[] = [
  {
    id: 'bangsaen-run-lab',
    title: 'Bangsaen Run Lab',
    location: 'Bangsaen',
    description: '300 THB off running shoes',
    coinsCost: 600,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIZ_x0ZCTim0Fv_PyGeJrKXHJtBTTVU3zmToT1ksg1KR3JWsBduv5uQrQ6Qr4KY45EI3YRIwRG5lm6RhxGy58PDa4RKiO3gn0MztCrGRRTDiPyYb9-GQcLnyWY5F3MqNprgbDc0hlqfcCmB6okPRLAaI-_BmQv5CIvYk9A-jK9Ji_OKYJGE_ND97oSZoynJEJLczQqlRwvSMU85A-eRsgWZC2v0gOAg_7NeFe70cJ2zOoLiQi_S-rMDD-Qys0u_LFaZaEBGt8SXGE',
    annotation: 'วิ่งอีก 1.6 กม.',
    category: 'อุปกรณ์',
    distanceToUnlockKm: 1.6
  },
  {
    id: 'refuel-cafe',
    title: 'Refuel Cafe',
    location: 'หาดบางแสน',
    description: '50% off a post-run protein shake',
    coinsCost: 150,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_0J-xx766HQcUdgrhHX44l-Vy4Sw5Mgwk6Ky3pPtuv2MeCm7wU3M3fee_zsEbxp_7Ph1wkafJ7Ops8cvaTNW3LsvasyEio3LOUdVwfg0tujr1d7J4s13Htic91D9utrzfU3ekOqAR1eJxZiVWpGvC67RyN4Ug-g_aTJpEFH0sv7F1kdniXJAu344k9XZwFjGgxUk01uWKkKVWCgUiwtnHmbgYFL4HrULBDTGg1BCL6BhGp3g44kAtCatNk3nwJNb37Q58Sz4-jqo',
    category: 'อาหาร'
  },
  {
    id: 'sriracha-sports-house',
    title: 'Sriracha Sports House',
    location: 'ศรีราชา',
    description: 'Running socks, buy 1 get 1',
    coinsCost: 400,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzJ5VJlFO5Q_Y0jXZsGfH3pxEaz-Ur9RBR0kPOidmmd4TpkfPbIvnL-hcbbJWActVGUQcKzwr9j5yvPy2T5vC6jo6mOxk53KYBKcKhivdQOXdDbVqrAFw6hE1NacIri8TjgOB45_Mb-NOOErp1cwCaj3F5siCHG5_HD1afqvj3KUiak7J_lk-SV_1Vblg9pNNEEnVsqGJKQjPK0yIsrcxX06edZqDFfS-4aUhzwch9ICC792l7Wnt-s55y40mm34z8fuUzYV4rHJE',
    category: 'อุปกรณ์'
  },
  {
    id: 'chonburi-marathon-2026',
    title: 'Chonburi Marathon 2026',
    location: 'เมืองชลบุรี',
    description: '200 THB off a 10K race entry',
    coinsCost: 400,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzZq_DsJQD_ghyWfhuh-qqY4rkMSllT14tEbr1bTN5woAcbbo9ZXEx1R2tlTqjl7BuzJAqw1SuD7uFiEUbAbNUZCQJI3DsrYop8XAOtCEiTeHXLLx_0NjMO3FmN2yMfqKVA00nsniDnGzMOnPeophx0qDF7yDga2ddPLER61OLyF9OvOVKhBuaCN9PU7Ldyc1RkWADgt8wOtp54aJNlhKm86O_Pdu1-YkiCs_RVNhsXLi0z1m4FTRsq5GgLHv1n2hSG8rC204Lik8',
    category: 'งานวิ่ง'
  }
];

export const DEFAULT_TRAINING_DAYS: TrainingDay[] = [
  {
    id: 'mon-27',
    day: 'MON',
    dateNum: '27',
    type: 'EASY',
    typeColorBg: 'bg-[#A3E4FF]',
    distanceKm: 6,
    locationNotes: 'Bangsaen Beach, flat and lit',
    timeRange: '18:00 - 19:00',
    isCompleted: true
  },
  {
    id: 'tue-28',
    day: 'TUE',
    dateNum: '28',
    type: 'REST',
    typeColorBg: 'bg-emerald-100',
    distanceKm: 0,
    locationNotes: 'Class until 5pm, take recovery',
    isCompleted: false
  },
  {
    id: 'wed-29',
    day: 'WED',
    dateNum: '29',
    type: 'TEMPO',
    typeColorBg: 'bg-[#FFD84D]',
    distanceKm: 8,
    locationNotes: 'KU Sriracha track, intervals',
    timeRange: '17:30 - 18:30',
    isCompleted: false
  },
  {
    id: 'thu-30',
    day: 'THU',
    dateNum: '30',
    type: 'EASY',
    typeColorBg: 'bg-[#A3E4FF]',
    distanceKm: 5,
    locationNotes: 'Koh Loy, short loop',
    timeRange: '18:30 - 19:15',
    isCompleted: false
  },
  {
    id: 'sat-01',
    day: 'SAT',
    dateNum: '01',
    type: 'LONG',
    typeColorBg: 'bg-[#80fbac]',
    distanceKm: 15,
    locationNotes: 'Bang Phra Reservoir, water!',
    timeRange: '05:30 - 07:30',
    isCompleted: false
  }
];

export const MOCK_RUN_HISTORY: PastRunHistory[] = [
  {
    id: 'run-01',
    date: '25 ก.ค. 2026',
    location: 'หาดบางแสน จ๊อกกิ้ง 5K',
    distanceKm: 3.65,
    timeFormatted: '30:00',
    pace: "8'14\"",
    coinsEarned: 78
  },
  {
    id: 'run-02',
    date: '23 ก.ค. 2026',
    location: 'อ่างเก็บน้ำบางพระ',
    distanceKm: 8.20,
    timeFormatted: '58:12',
    pace: "7'05\"",
    coinsEarned: 130
  },
  {
    id: 'run-03',
    date: '21 ก.ค. 2026',
    location: 'สนาม ม.เกษตร ศรีราชา',
    distanceKm: 5.00,
    timeFormatted: '35:20',
    pace: "7'04\"",
    coinsEarned: 85
  }
];
