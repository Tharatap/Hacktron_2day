import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { useApp, useActiveRoute } from '../state/AppContext';
import { useRunEngine } from '../state/useRunEngine';
import { formatDuration, formatPace, clamp, myRank } from '../lib/formulas';
import { setRankBeforeFinish } from '../state/finishSnapshot';
import type { Checkpoint, LatLng } from '../types';

/* ------------------------------------------------------------------ */
/* Minimap — Leaflet แทนที่ artwork นามธรรมเดิมของ Stitch                */
/* ------------------------------------------------------------------ */

const positionDivIcon = L.divIcon({
  className: '',
  html: '<div style="width:10px;height:10px;background:#FF6B5A;border:2px solid #14241C;border-radius:50%;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const checkpointDivIconPending = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#FFD84D;border:2px solid #14241C;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;line-height:1;">★</div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const checkpointDivIconCollected = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#12A05C;border:2px solid #14241C;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;line-height:1;color:#fff;">★</div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/** วิ่งอิสระไม่มี zoneCenter ตายตัวให้ยึด — เลื่อนกล้องตามตำแหน่งปัจจุบันแทน (แบบแอพวิ่งทั่วไป) */
function RecenterMap({ position, zoom }: { position: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([position.lat, position.lng], zoom, { animate: true });
  }, [map, position.lat, position.lng, zoom]);
  return null;
}

function RunMinimap({
  zoneCenter,
  path,
  traveledPath,
  checkpoints,
  collectedCheckpointIds,
  followCurrent = false,
}: {
  zoneCenter: LatLng;
  path: LatLng[];
  traveledPath: LatLng[];
  checkpoints: Checkpoint[];
  collectedCheckpointIds: string[];
  /** true = วิ่งอิสระ ให้กล้องเลื่อนตามตำแหน่งปัจจุบันแทนตำแหน่งคงที่ของ zone */
  followCurrent?: boolean;
}) {
  const current = traveledPath[traveledPath.length - 1] ?? zoneCenter;

  return (
    <MapContainer
      center={[zoneCenter.lat, zoneCenter.lng]}
      zoom={15}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      {followCurrent && <RecenterMap position={current} zoom={16} />}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {path.length > 1 && (
        <Polyline
          positions={path.map((p): [number, number] => [p.lat, p.lng])}
          pathOptions={{ color: '#6d7a6f', dashArray: '4 4', weight: 2 }}
        />
      )}
      {traveledPath.length > 1 && (
        <Polyline
          positions={traveledPath.map((p): [number, number] => [p.lat, p.lng])}
          pathOptions={{ color: '#12A05C', weight: 3 }}
        />
      )}
      {checkpoints
        .filter((c) => c.kind !== 'start')
        .map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.position.lat, cp.position.lng]}
            icon={collectedCheckpointIds.includes(cp.id) ? checkpointDivIconCollected : checkpointDivIconPending}
          />
        ))}
      <Marker position={[current.lat, current.lng]} icon={positionDivIcon} />
    </MapContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Active Run Screen                                                   */
/* ------------------------------------------------------------------ */

const CADENCE_GAUGE_MAX = 220;
const CADENCE_GAUGE_CIRCUMFERENCE = 2 * Math.PI * 34;

export const ActiveRunScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const { start, pause, resume, finish } = useRunEngine();
  const activeRoute = useActiveRoute();
  const { run, sensor, user } = state;

  const [isLocked, setIsLocked] = useState(false);

  // Stitch UI ไม่มีหน้า countdown แยก — เข้า RUN_START ทันทีที่ arm เสร็จ (ย้ายมาจาก RunTab.tsx เดิม)
  useEffect(() => {
    if (run.status === 'countdown') start();
  }, [run.status, start]);

  const isPaused = run.status === 'paused';
  const animState: React.CSSProperties = { animationPlayState: isPaused ? 'paused' : 'running' };

  const handleStop = () => {
    if (activeRoute) {
      const board = state.leaderboards[activeRoute.zoneId] ?? [];
      setRankBeforeFinish(myRank(board, user.id));
    } else {
      setRankBeforeFinish(null);
    }
    finish();
  };

  // เข้ามาที่หน้า Run ตรงๆ จาก Navbar โดยยังไม่ได้ armRun จาก Map/Zone — ไม่มี route ให้วิ่ง
  if (run.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full text-center px-4">
        <span className="material-symbols-outlined text-5xl text-[#3d4a40]">directions_run</span>
        <p className="font-body-md text-[#3d4a40]">ยังไม่มีการวิ่งที่กำลังทำงาน ไปที่แผนที่เพื่อเลือกโซนแล้วเริ่มวิ่ง</p>
        <button
          onClick={() => dispatch({ type: 'NAV', screen: 'map' })}
          className="bg-[#006a3a] text-white px-6 py-3 rounded-full border-2 border-[#14241C] hard-shadow font-headline-md"
        >
          ไปที่แผนที่
        </button>
      </div>
    );
  }

  const zone = activeRoute ? state.zones.find((z) => z.id === activeRoute.zoneId) : undefined;
  const routeCheckpoints = activeRoute ? activeRoute.checkpoints.filter((c) => c.kind !== 'start') : [];
  const nextCheckpointId = routeCheckpoints.find((c) => !run.collectedCheckpointIds.includes(c.id))?.id ?? null;

  const cadenceRatio = clamp(sensor.cadence / CADENCE_GAUGE_MAX, 0, 1);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Game Scene Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#BFE6F2]">
        {/* PARALLAX LAYER 1: FAR (Clouds) */}
        <div className="absolute inset-0 flex flex-col items-start pt-20">
          <div className="flex animate-scroll-v-slow gap-24" style={animState}>
            {/* Pill Cloud Cluster 1 */}
            <div className="relative w-32 h-10 bg-white border-2 border-[#14241C] rounded-full">
              <div className="absolute -top-4 left-6 w-16 h-10 bg-white border-2 border-[#14241C] rounded-full"></div>
            </div>
            {/* Pill Cloud Cluster 2 */}
            <div className="relative w-40 h-12 bg-white border-2 border-[#14241C] rounded-full mt-12 ml-20">
              <div className="absolute -top-6 left-10 w-20 h-14 bg-white border-2 border-[#14241C] rounded-full"></div>
            </div>
            {/* Pill Cloud Cluster 3 */}
            <div className="relative w-24 h-8 bg-white border-2 border-[#14241C] rounded-full mt-4 ml-32">
              <div className="absolute -top-3 left-4 w-12 h-8 bg-white border-2 border-[#14241C] rounded-full"></div>
            </div>
            {/* Duplicated set for seamless scroll */}
            <div className="relative w-32 h-10 bg-white border-2 border-[#14241C] rounded-full ml-10">
              <div className="absolute -top-4 left-6 w-16 h-10 bg-white border-2 border-[#14241C] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* PARALLAX LAYER 2: MID (Hills) */}
        <div className="absolute bottom-[30%] w-full h-64 overflow-hidden pointer-events-none">
          {/* Deep Green Hills (Back) */}
          <div className="absolute bottom-0 w-[200%] flex items-end animate-scroll-slow" style={animState}>
            <svg className="w-full h-48" preserveAspectRatio="none" viewBox="0 0 1000 100">
              <path d="M0 100 Q 150 20 300 80 T 600 50 T 1000 100 V 100 H 0 Z" fill="#0B4A33" />
            </svg>
          </div>
          {/* Grass Green Hills (Front) */}
          <div
            className="absolute bottom-0 w-[200%] flex items-end animate-scroll-mid"
            style={{ ...animState, animationDelay: '-5s' }}
          >
            <svg className="w-full h-32" preserveAspectRatio="none" viewBox="0 0 1000 100">
              <path d="M0 100 Q 200 40 400 90 T 750 60 T 1000 100 V 100 H 0 Z" fill="#12A05C" />
            </svg>
          </div>
        </div>

        {/* PARALLAX LAYER 3: NEAR (Tiled Road) */}
        <div className="absolute bottom-0 w-full h-[50%] bg-[#12A05C] border-t-4 border-[#14241C] overflow-hidden">
          {/* Tiled Block Pattern */}
          <div
            className="absolute inset-0 w-[200%] animate-scroll-fast"
            style={{
              ...animState,
              backgroundImage:
                'linear-gradient(to right, #14241C 2px, transparent 2px), linear-gradient(to bottom, #14241C 2px, #0B4A33 2px, #0B4A33 12px, transparent 12px)',
              backgroundSize: '80px 100%, 100% 80px',
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent, transparent 78px, #14241C 78px, #14241C 80px)',
              }}
            />
          </div>

          {/* Spinning Decorative Coins */}
          <div className="absolute left-[15%] top-[10%] animate-spin-y" style={animState}>
            <div className="w-6 h-6 bg-[#FFD84D] border-2 border-[#14241C] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border border-[#14241C]/40 rounded-full"></div>
            </div>
          </div>
          <div className="absolute left-[40%] top-[25%] animate-spin-y" style={{ ...animState, animationDelay: '0.4s' }}>
            <div className="w-6 h-6 bg-[#FFD84D] border-2 border-[#14241C] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border border-[#14241C]/40 rounded-full"></div>
            </div>
          </div>
          <div className="absolute left-[70%] top-[15%] animate-spin-y" style={{ ...animState, animationDelay: '0.8s' }}>
            <div className="w-6 h-6 bg-[#FFD84D] border-2 border-[#14241C] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border border-[#14241C]/40 rounded-full"></div>
            </div>
          </div>

          {/* Reward Blocks — ตกแต่งฉากล้วนๆ ไม่ผูกกับ checkpoint จริง (ของจริงอยู่ใน minimap ด้านล่าง) */}
          <div className="absolute left-[85%] top-[15%] animate-bounce" style={animState}>
            <div className="w-10 h-10 bg-[#FFD84D] border-2 border-[#14241C] rounded-lg flex items-center justify-center hard-shadow">
              <span className="material-symbols-outlined text-[#14241C] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
          <div className="absolute left-[60%] top-[40%] animate-bounce" style={{ ...animState, animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-[#FFD84D] border-2 border-[#14241C] rounded-lg flex items-center justify-center hard-shadow">
              <span className="material-symbols-outlined text-[#14241C] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
          <div className="absolute left-[45%] top-[65%]">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-[#FF6B5A]/30 rounded-full animate-ping" style={animState}></div>
              <div className="w-14 h-14 bg-[#FFD84D] border-2 border-[#14241C] rounded-lg flex items-center justify-center hard-shadow animate-bounce" style={animState}>
                <span className="material-symbols-outlined text-[#14241C] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>
          </div>

          {/* Character Placeholder — ของ Stitch เองยังเป็น placeholder รอ sprite จริง */}
          <div className="absolute left-[25%] top-[45%]">
            <div className="w-[140px] h-[140px] border-2 border-dashed border-[#14241C] flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <span className="font-handwritten-sm text-[#14241C] text-center px-4 uppercase leading-tight">Character Sprite</span>
            </div>
          </div>
        </div>
      </div>

      {/* HUD OVERLAY */}
      <div className="relative z-10 p-4 flex flex-col gap-4 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Top Left Stats */}
          <div className="bg-white border-2 border-[#14241C] p-2 rounded-lg hard-shadow pointer-events-auto">
            <div className="flex flex-col">
              <span className="font-headline-lg-mobile text-[#14241C]">
                {(run.distanceM / 1000).toFixed(2)} <span className="text-sm font-label-md">KM</span>
              </span>
              <div className="flex gap-2 items-center opacity-80">
                <span className="font-label-md text-[#14241C]">{formatDuration(run.elapsedSec)}</span>
                <div className="w-1 h-1 bg-[#14241C] rounded-full"></div>
                <span className="font-label-md text-[#14241C]">{formatPace(run.currentPaceSec)} /km</span>
              </div>
            </div>
          </div>

          {/* Top Center Progress — วิ่งอิสระไม่มี route ให้อ้างจำนวน checkpoint ทั้งหมด เลยเปลี่ยนเป็นเคาน์เตอร์สะสม tower แทนจุดไข่ปลา */}
          <div className="flex flex-col items-center gap-1">
            {activeRoute ? (
              <div className="bg-white border-2 border-[#14241C] px-4 py-1 rounded-full hard-shadow flex gap-1.5 items-center">
                {routeCheckpoints.map((cp) => {
                  const collected = run.collectedCheckpointIds.includes(cp.id);
                  const isNext = cp.id === nextCheckpointId;
                  return (
                    <div
                      key={cp.id}
                      className={`w-2.5 h-2.5 rounded-full border border-[#14241C] ${
                        collected ? 'bg-[#12A05C]' : isNext ? 'bg-[#FFD84D] animate-pulse' : ''
                      }`}
                      style={isNext ? animState : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border-2 border-[#14241C] px-3 py-1 rounded-full hard-shadow flex items-center gap-1">
                <span className="material-symbols-outlined text-[#FFD84D] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-headline-md text-sm text-[#14241C] leading-none">
                  x{run.collectedCheckpointIds.length}
                </span>
              </div>
            )}
          </div>

          {/* Top Right Gauge */}
          <div className="flex flex-col items-end gap-2">
            <div className="relative w-20 h-20 bg-white border-2 border-[#14241C] rounded-lg hard-shadow flex items-center justify-center pointer-events-auto">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="40" cy="40" fill="none" r="34" stroke="#d4e7da" strokeWidth={6} />
                <circle
                  cx="40"
                  cy="40"
                  fill="none"
                  r="34"
                  stroke="#FFD84D"
                  strokeDasharray={`${cadenceRatio * CADENCE_GAUGE_CIRCUMFERENCE} ${CADENCE_GAUGE_CIRCUMFERENCE}`}
                  strokeWidth={6}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-headline-md text-[18px] text-[#14241C] leading-none">{sensor.cadence}</span>
                <span className="text-[8px] font-label-md uppercase text-[#14241C]/60">spm</span>
              </div>
            </div>
            <div className="bg-white border-2 border-[#14241C] px-2 py-0.5 rounded-lg flex items-center gap-1.5 hard-shadow">
              <div className="w-2 h-2 bg-[#FF6B5A] rounded-full animate-pulse" style={animState}></div>
              <span className="text-[10px] font-label-md text-[#14241C] uppercase tracking-wider">
                {run.mode === 'simulate' ? 'SIMULATED' : 'Sensor On'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MINIMAP — โหมดเลือกโซนใช้ route.path จริง, วิ่งอิสระใช้พิกัด GPS สดจาก run.traveledPath แทน */}
      <div className="absolute bottom-[80px] left-[20px] z-20 flex flex-col gap-1 pointer-events-none">
        <span className="font-label-md text-[10px] text-[#14241C] uppercase ml-1">เส้นทาง</span>
        <div className="w-[130px] h-[100px] bg-[#D1D9D4] border-2 border-[#14241C] rounded-lg hard-shadow relative overflow-hidden">
          {activeRoute && zone ? (
            <RunMinimap
              zoneCenter={zone.center}
              path={activeRoute.path}
              traveledPath={run.traveledPath}
              checkpoints={activeRoute.checkpoints}
              collectedCheckpointIds={run.collectedCheckpointIds}
            />
          ) : run.traveledPath.length > 0 ? (
            <RunMinimap
              zoneCenter={run.traveledPath[0]}
              path={[]}
              traveledPath={run.traveledPath}
              checkpoints={[]}
              collectedCheckpointIds={[]}
              followCurrent
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center px-2">
              <span className="font-label-md text-[10px] text-[#3d4a40]">กำลังหาตำแหน่ง GPS...</span>
            </div>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-8 right-4 left-4 flex items-center justify-end gap-4 z-20 pb-safe">
        {/* Secondary Controls */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`w-12 h-12 border-2 border-[#14241C] rounded-full hard-shadow flex items-center justify-center active:translate-y-1 active:translate-x-1 active:shadow-none transition-all ${
              isLocked ? 'bg-[#FFD84D]' : 'bg-white'
            }`}
          >
            <span className="material-symbols-outlined text-[#14241C]">{isLocked ? 'lock' : 'lock_open'}</span>
          </button>
          <button
            onClick={handleStop}
            className="w-12 h-12 bg-white border-2 border-[#14241C] rounded-full hard-shadow flex items-center justify-center active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[#ba1a1a]">stop</span>
          </button>
        </div>
        {/* Main Pause Button */}
        <button
          onClick={() => (isPaused ? resume() : pause())}
          className="w-16 h-16 bg-[#FFD84D] border-2 border-[#14241C] rounded-full hard-shadow flex items-center justify-center active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
        >
          <span className="material-symbols-outlined text-[#14241C] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPaused ? 'play_arrow' : 'pause'}
          </span>
        </button>
      </div>
    </div>
  );
};
