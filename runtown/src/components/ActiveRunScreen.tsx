import React, { memo, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useActiveRoute, useApp } from '../state/AppContext';
import { useRunEngine } from '../state/useRunEngine';
import { formatDuration, formatPace, myRank } from '../lib/formulas';
import { setRankBeforeFinish } from '../state/finishSnapshot';
import type { Checkpoint, LatLng } from '../types';
import runnerMascotUrl from '../assets/runtown-runner-mascot-cute.png';

const runnerIcon = L.divIcon({
  className: '',
  html: `<div class="runner-map-avatar" role="img" aria-label="ตำแหน่งปัจจุบันของคุณ"><span class="runner-map-avatar-pulse"></span><span class="runner-map-avatar-crop"><img src="${runnerMascotUrl}" alt="" /></span></div>`,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

const rewardIcons = {
  coin: L.divIcon({ className: '', html: '<div class="route-reward-marker is-coin" aria-label="เหรียญบนเส้นทาง"><span class="material-symbols-outlined">paid</span></div>', iconSize: [38, 42], iconAnchor: [19, 38] }),
  chest: L.divIcon({ className: '', html: '<div class="route-reward-marker is-chest" aria-label="กล่องสุ่มบนเส้นทาง"><span class="material-symbols-outlined">inventory_2</span></div>', iconSize: [42, 46], iconAnchor: [21, 42] }),
  tower: L.divIcon({ className: '', html: '<div class="route-reward-marker is-chest" aria-label="จุดรับรางวัล"><span class="material-symbols-outlined">redeem</span></div>', iconSize: [42, 46], iconAnchor: [21, 42] }),
};

function FollowRunner({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    const target = L.latLng(position.lat, position.lng);
    // Keep the map steady for small GPS corrections; only recenter after a meaningful move.
    if (map.distance(map.getCenter(), target) > 18) {
      map.panTo(target, { animate: true, duration: 0.6 });
    }
  }, [map, position.lat, position.lng]);
  return null;
}

const TrackingMap = memo(function TrackingMap({ center, traveledPath, plannedPath, checkpoints, collectedIds }: { center: LatLng; traveledPath: LatLng[]; plannedPath: LatLng[]; checkpoints: Checkpoint[]; collectedIds: string[] }) {
  const current = traveledPath[traveledPath.length - 1] ?? center;
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={16} zoomControl={false} attributionControl={false} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FollowRunner position={current} />
      {plannedPath.length > 1 && <Polyline smoothFactor={1.5} positions={plannedPath.map((point) => [point.lat, point.lng] as [number, number])} pathOptions={{ color: '#44584C', weight: 4, dashArray: '7 8', opacity: 0.7 }} />}
      {checkpoints.filter((point) => point.coinReward > 0 && !collectedIds.includes(point.id)).map((point) => (
        <Marker key={point.id} position={point.position} icon={rewardIcons[point.kind === 'coin' ? 'coin' : point.kind === 'chest' ? 'chest' : 'tower']} interactive={false} />
      ))}
      {traveledPath.length > 1 && <Polyline smoothFactor={1.8} positions={traveledPath.map((point) => [point.lat, point.lng] as [number, number])} pathOptions={{ color: '#0B8F55', weight: 7, lineCap: 'round', lineJoin: 'round' }} />}
      <Marker position={[current.lat, current.lng]} icon={runnerIcon} interactive={false} />
    </MapContainer>
  );
});

const gpsLabel = {
  idle: 'GPS รอเริ่ม', loading: 'กำลังหา GPS', good: 'GPS ดี', weak: 'GPS อ่อน',
  unavailable: 'GPS หาย', demo: 'GPS สาธิต',
} as const;

export const ActiveRunScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const { start, pause, resume, finish } = useRunEngine();
  const activeRoute = useActiveRoute();
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { run, gps, user } = state;

  useEffect(() => {
    if (run.status === 'countdown') start();
  }, [run.status, start]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (confirmFinish) cancelRef.current?.focus();
  }, [confirmFinish]);

  const finishRun = () => {
    if (activeRoute) setRankBeforeFinish(myRank(state.leaderboards[activeRoute.zoneId] ?? [], user.id));
    else setRankBeforeFinish(null);
    setConfirmFinish(false);
    finish();
  };

  if (run.status === 'idle') {
    return <div className="grid h-full place-items-center p-6 text-center"><button onClick={() => dispatch({ type: 'NAV', screen: 'run' })} className="rounded-full border-2 border-ink bg-grass px-5 py-3 text-white hard-shadow">เตรียมเริ่มวิ่ง</button></div>;
  }

  const fallbackCenter = run.traveledPath[0]
    ?? activeRoute?.path[0]
    ?? state.zones.find((zone) => zone.id === user.homeZoneId)?.center
    ?? { lat: 13.286, lng: 100.914 };
  const isPaused = run.status === 'paused';
  const gpsIsWarning = ['weak', 'unavailable'].includes(gps.quality);
  const shortRun = run.distanceM < 50 || run.elapsedSec < 60;
  const collectedCoins = activeRoute?.checkpoints
    .filter((point) => run.collectedCheckpointIds.includes(point.id))
    .reduce((sum, point) => sum + point.coinReward, 0) ?? run.collectedCheckpointIds.length * 15;

  return (
    <div className="relative h-full overflow-hidden bg-[#DDEBE2]">
      <div className="absolute inset-0">
        <TrackingMap center={fallbackCenter} traveledPath={run.traveledPath} plannedPath={activeRoute?.path ?? []} checkpoints={activeRoute?.checkpoints ?? []} collectedIds={run.collectedCheckpointIds} />
      </div>
      <div className="run-map-vignette pointer-events-none absolute inset-0" />

      <header className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-[500] p-3">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => dispatch({ type: 'NAV', screen: 'map' })} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-white hard-shadow-sm" aria-label="กลับหน้าแผนที่ โดยบันทึกการวิ่งต่อ">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>
          <div className="flex flex-col items-end gap-2">
            <div className={`pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-3 hard-shadow-sm ${gpsIsWarning ? 'bg-lemon' : gps.quality === 'demo' ? 'bg-[#FFF2B8]' : 'bg-white'}`} role="status" aria-live="polite">
              <span className={`h-2.5 w-2.5 rounded-full border border-ink ${gpsIsWarning ? 'bg-coral' : 'bg-grass'} ${gps.quality === 'loading' ? 'animate-pulse' : ''}`} />
              <span className="font-label-md text-xs">{gpsLabel[gps.quality]}{gps.accuracyM ? ` ±${Math.round(gps.accuracyM)}m` : ''}</span>
            </div>
            {!online && <div className="pointer-events-auto rounded-full border-2 border-ink bg-lemon px-3 py-1.5 text-xs font-label-md hard-shadow-sm">ออฟไลน์ · ยังบันทึก GPS</div>}
          </div>
        </div>
      </header>

      {run.traveledPath.length === 0 && (
        <div className="absolute left-1/2 top-[34%] z-[450] w-[76%] -translate-x-1/2 rounded-xl border-2 border-ink bg-white p-4 text-center hard-shadow">
          <span className="material-symbols-outlined animate-pulse text-3xl" aria-hidden="true">location_searching</span>
          <p className="mt-1 font-headline-md text-base">กำลังล็อกตำแหน่ง</p>
          <p className="mt-1 text-xs text-ink-soft">ระยะจะเพิ่มเมื่อ GPS แม่นยำพอ</p>
        </div>
      )}

      {isPaused && (
        <div className="pointer-events-none absolute left-1/2 top-[28%] z-[460] -translate-x-1/2 rounded-full border-2 border-ink bg-coral px-5 py-2 text-center hard-shadow">
          <strong className="font-headline-md">หยุดชั่วคราว</strong>
        </div>
      )}

      <section className="absolute inset-x-0 bottom-0 z-[500] h-[clamp(196px,26dvh,220px)] rounded-t-[26px] border-t-2 border-ink bg-paper px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] hard-shadow-up" aria-label="ข้อมูลการวิ่งและปุ่มควบคุม">
        <div className="grid grid-cols-2 divide-x-2 divide-ink border-b-2 border-ink pb-2 text-center">
          <div className="pr-3"><span className="block text-[11px] font-label-md uppercase tracking-wide text-ink-soft">เวลา</span><strong className="font-headline-md text-[30px] leading-none tabular-nums">{formatDuration(run.elapsedSec)}</strong></div>
          <div className="pl-3"><span className="block text-[11px] font-label-md uppercase tracking-wide text-ink-soft">ระยะทาง</span><strong className="font-headline-md text-[30px] leading-none tabular-nums">{(run.distanceM / 1000).toFixed(2)} <small className="text-sm">km</small></strong></div>
        </div>
        <div className="grid grid-cols-3 py-2 text-center">
          <div><span className="text-[11px] text-ink-soft">เพซ</span><strong className="ml-2 font-headline-md text-lg tabular-nums">{formatPace(run.currentPaceSec)} <small className="text-[10px]">/km</small></strong></div>
          <div><span className="block text-[10px] text-ink-soft">แคลอรี่*</span><strong className="font-headline-md text-base tabular-nums">{Math.round(run.caloriesKcal)} <small className="text-[9px]">kcal</small></strong></div>
          <div><span className="block text-[10px] text-ink-soft">เก็บแล้ว</span><strong className="font-headline-md text-base tabular-nums text-grass">{collectedCoins} <small className="text-[9px]">coins</small></strong></div>
        </div>
        <div className="grid grid-cols-[1fr_58px] gap-3">
          <button onClick={() => isPaused ? resume() : pause()} className={`min-h-[54px] rounded-full border-2 border-ink font-headline-md text-lg hard-shadow active:translate-y-0.5 active:shadow-none ${isPaused ? 'bg-grass text-white' : 'bg-lemon text-ink'}`}>
            <span className="material-symbols-outlined mr-2 align-middle" aria-hidden="true">{isPaused ? 'play_arrow' : 'pause'}</span>{isPaused ? 'วิ่งต่อ' : 'หยุดชั่วคราว'}
          </button>
          <button onClick={() => setConfirmFinish(true)} className="grid min-h-[54px] place-items-center rounded-2xl border-2 border-ink bg-coral hard-shadow active:translate-y-0.5 active:shadow-none" aria-label="จบการวิ่ง">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">stop</span>
          </button>
        </div>
      </section>

      {confirmFinish && (
        <div className="absolute inset-0 z-[1000] grid place-items-center bg-ink/65 p-5" role="dialog" aria-modal="true" aria-labelledby="finish-title" aria-describedby="finish-description">
          <div className="w-full rounded-2xl border-2 border-ink bg-paper p-5 hard-shadow-lg">
            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-coral hard-shadow-sm" aria-hidden="true"><span className="material-symbols-outlined">stop_circle</span></div>
            <h2 id="finish-title" className="mt-4 font-headline-md text-2xl">จบการวิ่งตอนนี้?</h2>
            <p id="finish-description" className="mt-2 text-sm text-ink-soft">ระยะ {(run.distanceM / 1000).toFixed(2)} km · เวลา {formatDuration(run.elapsedSec)} ระบบจะบันทึกผลให้อัตโนมัติ</p>
            {shortRun && <p role="alert" className="mt-3 rounded-xl border-2 border-ink bg-lemon p-3 text-sm font-label-md">กิจกรรมนี้สั้นกว่า 1 นาที หรือยังไม่ถึง 50 เมตร โปรดตรวจสอบก่อนบันทึก</p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button ref={cancelRef} onClick={() => setConfirmFinish(false)} className="min-h-12 rounded-full border-2 border-ink bg-white font-label-md hard-shadow-sm">วิ่งต่อ</button>
              <button onClick={finishRun} className="min-h-12 rounded-full border-2 border-ink bg-coral font-label-md hard-shadow">จบและบันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
