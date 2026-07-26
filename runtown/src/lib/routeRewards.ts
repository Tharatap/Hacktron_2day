import type { Checkpoint, LatLng, RunRoute } from '../types';
import { distanceM, pointAlongPath } from './formulas';

export function pathDistanceM(path: LatLng[]): number {
  let total = 0;
  for (let index = 1; index < path.length; index += 1) {
    total += distanceM(path[index - 1], path[index]);
  }
  return total;
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function randomFrom<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

export function createPinnedRoute(args: {
  id: string;
  name: string;
  zoneId: string;
  ownerId: string;
  path: LatLng[];
  seed?: number;
}): RunRoute {
  const totalM = pathDistanceM(args.path);
  const distanceKm = +(totalM / 1000).toFixed(2);
  const random = seededRandom(args.seed ?? Date.now());
  const checkpoints: Checkpoint[] = [{
    id: `${args.id}-start`, name: 'จุดเริ่ม', kind: 'start', position: args.path[0], atKm: 0, coinReward: 0,
  }];

  // Keep rewards away from the start and finish. Short routes still get one pickup.
  const marginM = Math.min(120, totalM * 0.22);
  let atM = totalM < 320 ? totalM / 2 : marginM + 80 + random() * 70;
  let index = 1;
  while (atM < totalM - marginM && index <= 14) {
    const isChest = random() < 0.3;
    const coinReward = isChest
      ? randomFrom([10, 15, 20, 25] as const, random)
      : randomFrom([3, 4, 5, 6, 7, 8] as const, random);
    checkpoints.push({
      id: `${args.id}-${isChest ? 'chest' : 'coin'}-${index}`,
      name: isChest ? `กล่องสุ่มใบที่ ${index}` : `เหรียญจุดที่ ${index}`,
      kind: isChest ? 'chest' : 'coin',
      position: pointAlongPath(args.path, totalM === 0 ? 0 : atM / totalM),
      atKm: +(atM / 1000).toFixed(3),
      coinReward,
    });
    index += 1;
    atM += 230 + random() * 220;
  }

  // A medium/long route should always contain at least one mystery box,
  // while its position and value still vary for each newly created route.
  const rewardIndexes = checkpoints
    .map((checkpoint, checkpointIndex) => checkpoint.coinReward > 0 ? checkpointIndex : -1)
    .filter((checkpointIndex) => checkpointIndex >= 0);
  if (totalM >= 400 && rewardIndexes.length > 0 && !checkpoints.some((checkpoint) => checkpoint.kind === 'chest')) {
    const checkpointIndex = randomFrom(rewardIndexes, random);
    checkpoints[checkpointIndex] = {
      ...checkpoints[checkpointIndex],
      kind: 'chest',
      name: `กล่องสุ่มใบที่ ${checkpointIndex}`,
      coinReward: randomFrom([10, 15, 20, 25] as const, random),
    };
  }

  checkpoints.push({
    id: `${args.id}-finish`, name: 'เส้นชัย', kind: 'finish',
    position: args.path[args.path.length - 1], atKm: distanceKm, coinReward: 0,
  });

  return {
    id: args.id,
    zoneId: args.zoneId,
    name: args.name.trim() || 'เส้นทางของฉัน',
    distanceKm,
    elevationM: 0,
    path: args.path,
    checkpoints,
    createdBy: args.ownerId,
    isCommunity: false,
    timesRun: 0,
  };
}
