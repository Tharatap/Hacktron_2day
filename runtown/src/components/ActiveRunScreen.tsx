import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useActiveRoute, useApp } from '../state/AppContext';
import { useRunEngine } from '../state/useRunEngine';
import { formatDuration, formatPace, myRank } from '../lib/formulas';
import { setRankBeforeFinish } from '../state/finishSnapshot';
import type { LatLng } from '../types';
import runnerMascotUrl from '../assets/runtown-runner-mascot-cute.png';

const runnerIcon = L.divIcon({
  className: '',
  html: `<div class="runner-map-avatar" role="img" aria-label="ตำแหน่งปัจจุบันของคุณ"><span class="runner-map-avatar-pulse"></span><span class="runner-map-avatar-crop"><img src="${runnerMascotUrl}" alt="" /></span></div>`,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

function FollowRunner({ position }: { position: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 16), { animate: true, duration: 0.5 });
  }, [map, position.lat, position.lng]);
  return null;
}

function TrackingMap({ center, traveledPath, plannedPath }: { center: LatLng; traveledPath: LatLng[]; plannedPath: LatLng[] }) {
  const current = traveledPath[traveledPath.length - 1] ?? center;
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={16} zoomControl={false} attributionControl={false} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FollowRunner position={current} />
      {plannedPath.length > 1 && <Polyline positions={plannedPath.map((point) => [point.lat, point.lng] as [number, number])} pathOptions={{ color: '#44584C', weight: 4, dashArray: '7 8', opacity: 0.7 }} />}
      {traveledPath.length > 1 && <Polyline positions={traveledPath.map((point) => [point.lat, point.lng] as [number, number])} pathOptions={{ color: '#FF5D50', weight: 7, lineCap: 'round', lineJoin: 'round' }} />}
      <Marker position={[current.lat, current.lng]} icon={runnerIcon} interactive={false} />
    </MapContainer>
  );
}

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
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
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
    return <div className="h-full grid place-items-center p-6 text-center"><button onClick={() => dispatch({ type: 'NAV', screen: 'run' })} className="border-2 border-[#14241C] hard-shadow rounded-full px-5 py-3 bg-[#0B8F55] text-white">เตรียมเริ่มวิ่ง</button></div>;
  }

  const fallbackCenter = run.traveledPath[0]
    ?? activeRoute?.path[0]
    ?? state.zones.find((zone) => zone.id === user.homeZoneId)?.center
    ?? { lat: 13.286, lng: 100.914 };
  const isPaused = run.status === 'paused';
  const gpsIsWarning = ['weak', 'unavailable'].includes(gps.quality);

  return (
    <div className="relative h-full bg-[#DDEBE2] overflow-hidden">
      <div className="absolute inset-0">
        <TrackingMap center={fallbackCenter} traveledPath={run.traveledPath} plannedPath={activeRoute?.path ?? []} />
      </div>
      <div className="absolute inset-0 pointer-events-none run-map-vignette" />

      <div className="absolute top-0 inset-x-0 z-[500] p-4 pt-safe pointer-events-none">
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-col gap-2 items-start">
            <div className={`pointer-events-auto inline-flex items-center gap-2 border-2 border-[#14241C] hard-shadow-sm rounded-full px-3 py-2 ${gpsIsWarning ? 'bg-[#FFD84D]' : gps.quality === 'demo' ? 'bg-[#FFF2B8]' : 'bg-white'}`} role="status" aria-live="polite">
              <span className={`w-2.5 h-2.5 rounded-full border border-[#14241C] ${gpsIsWarning ? 'bg-[#FF6B5A]' : 'bg-[#0B8F55]'} ${gps.quality === 'loading' ? 'animate-pulse' : ''}`} />
              <span className="font-label-md text-xs">{gpsLabel[gps.quality]}{gps.accuracyM ? ` ±${Math.round(gps.accuracyM)}m` : ''}</span>
            </div>
            {!online && <div className="pointer-events-auto bg-[#FFD84D] border-2 border-[#14241C] hard-shadow-sm rounded-lg px-3 py-1.5 text-xs font-label-md">ออฟไลน์ • GPS ยังบันทึกต่อ</div>}
          </div>
          <div className={`pointer-events-auto border-2 border-ink hard-shadow rounded-xl px-3 py-2 text-center ${isPaused ? 'bg-coral text-ink' : 'bg-white'}`}>
            <span className="block text-xs font-label-md uppercase tracking-wide">{isPaused ? 'Paused' : 'Run time'}</span>
            <strong className="font-headline-md text-2xl tabular-nums">{formatDuration(run.elapsedSec)}</strong>
          </div>
        </div>
      </div>

      {run.traveledPath.length === 0 && (
        <div className="absolute z-[450] top-1/3 left-1/2 -translate-x-1/2 w-[78%] bg-white border-2 border-[#14241C] hard-shadow rounded-xl p-4 text-center">
          <span className="material-symbols-outlined text-3xl animate-pulse" aria-hidden="true">location_searching</span>
          <p className="font-headline-md text-base mt-1">กำลังล็อกตำแหน่ง</p>
          <p className="text-xs text-ink-soft mt-1">อยู่ในที่โล่งสักครู่ ระยะจะเริ่มเพิ่มเมื่อ GPS แม่นยำพอ</p>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 z-[440] bg-[#14241C]/25 grid place-items-center pointer-events-none">
          <div className="bg-coral text-ink border-2 border-ink hard-shadow-lg rounded-2xl px-7 py-4 rotate-[-2deg] text-center"><span className="font-handwritten-sm">พักก่อนก็ได้</span><strong className="font-headline-lg-mobile block">หยุดชั่วคราว</strong></div>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 z-[500] bg-[#F2F7F3] border-t-2 border-[#14241C] rounded-t-[28px] p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] hard-shadow-up">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-white border-2 border-[#14241C] rounded-xl p-3 hard-shadow-sm">
            <span className="text-xs uppercase font-label-md text-ink-soft tracking-wide">ระยะทาง</span>
            <p className="font-display-lg text-[44px] leading-none tabular-nums">{(run.distanceM / 1000).toFixed(2)} <span className="text-base">km</span></p>
          </div>
          <div className="bg-[#FFD84D] border-2 border-[#14241C] rounded-xl p-3 hard-shadow-sm">
            <span className="text-xs uppercase font-label-md tracking-wide">แคลอรี่*</span>
            <p className="font-headline-md text-2xl tabular-nums">{Math.round(run.caloriesKcal)}</p>
            <span className="text-xs text-ink-soft">ค่าประมาณ</span>
          </div>
          <div className="bg-white border-2 border-[#14241C] rounded-xl p-3 text-center">
            <span className="text-xs uppercase font-label-md text-ink-soft tracking-wide">เพซปัจจุบัน</span>
            <p className="font-headline-md text-xl tabular-nums">{formatPace(run.currentPaceSec)}</p>
            <span className="text-xs text-ink-soft">min/km</span>
          </div>
          <button onClick={() => isPaused ? resume() : pause()} className={`col-span-2 min-h-16 border-2 border-ink hard-shadow-lg rounded-full font-headline-md text-xl flex items-center justify-center gap-2 active:translate-x-1 active:translate-y-1 active:shadow-none ${isPaused ? 'bg-grass text-white' : 'bg-lemon text-ink'}`}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">{isPaused ? 'play_arrow' : 'pause'}</span>
            {isPaused ? 'วิ่งต่อ' : 'หยุดชั่วคราว'}
          </button>
        </div>
        <button onClick={() => setConfirmFinish(true)} className="mt-3 w-full min-h-12 bg-coral border-2 border-ink hard-shadow rounded-full font-headline-md text-base text-ink flex items-center justify-center gap-2 active:translate-y-0.5 active:shadow-none">
          <span className="material-symbols-outlined" aria-hidden="true">stop_circle</span>จบการวิ่ง
        </button>
      </div>

      {confirmFinish && (
        <div className="absolute inset-0 z-[1000] bg-[#14241C]/60 p-5 grid place-items-center" role="dialog" aria-modal="true" aria-labelledby="finish-title">
          <div className="w-full bg-[#F2F7F3] border-2 border-[#14241C] hard-shadow-lg rounded-2xl p-5">
            <div className="w-14 h-14 bg-[#FF6B5A] border-2 border-[#14241C] hard-shadow rounded-full grid place-items-center text-2xl" aria-hidden="true">🏁</div>
            <h2 id="finish-title" className="font-headline-md text-2xl mt-4">จบการวิ่งตอนนี้?</h2>
            <p className="text-sm text-ink-soft mt-2">ระยะ { (run.distanceM / 1000).toFixed(2) } km และเวลา {formatDuration(run.elapsedSec)} จะถูกสรุป คุณยังต้องกดบันทึกในหน้าถัดไป</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button ref={cancelRef} onClick={() => setConfirmFinish(false)} className="min-h-12 bg-white border-2 border-[#14241C] hard-shadow rounded-full font-label-md">วิ่งต่อ</button>
              <button onClick={finishRun} className="min-h-12 bg-coral text-ink border-2 border-ink hard-shadow rounded-full font-label-md">จบการวิ่ง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
