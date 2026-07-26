import React, { useMemo, useRef, useState } from 'react';
import type { LatLng, RunRecord, User } from '../types';
import { formatDuration, formatPace } from '../lib/formulas';
import mascotUrl from '../assets/runtown-runner-mascot-cute.png';

type Format = 'story' | 'square';

interface ShareTemplate {
  layout: 'sticker' | 'real-route';
  name: string;
  note: string;
  background: string | null;
  ink: string;
  accent: string;
  mint: string;
  cream: string;
  frame: string;
}

const TEMPLATES: ShareTemplate[] = [
  { layout: 'sticker', name: 'Mint sticker', note: 'พื้นโปร่งใส', background: null, ink: '#075C35', accent: '#36B85A', mint: '#BCEBC8', cream: '#FFFBEF', frame: '#FFFFFF' },
  { layout: 'sticker', name: 'Cream club', note: 'ครีมนุ่ม', background: '#FFF7DF', ink: '#075C35', accent: '#39A95A', mint: '#CDEECB', cream: '#FFFFFF', frame: '#FFFFFF' },
  { layout: 'sticker', name: 'Peach dash', note: 'พีชสดใส', background: '#FFDCCF', ink: '#134A32', accent: '#29A65B', mint: '#BDEAC8', cream: '#FFFDF4', frame: '#FFFFFF' },
  { layout: 'real-route', name: 'เส้นจริง', note: 'GPS จริง + หัวหมู', background: null, ink: '#FFFFFF', accent: '#28BC53', mint: '#C9F04A', cream: '#FFFDF4', frame: 'transparent' },
];

function formatFriendlyDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.max(0, Math.round(seconds % 60));
  return `${minutes}m ${rest}s`;
}

function privateRoute(path: LatLng[]): LatLng[] {
  if (path.length < 6) return [];
  const trim = Math.max(1, Math.floor(path.length * 0.12));
  return path.slice(trim, path.length - trim);
}

function routePoints(path: LatLng[], width: number, height: number, pad: number): Array<[number, number]> {
  if (path.length < 2) return [];
  const lats = path.map((point) => point.lat);
  const lngs = path.map((point) => point.lng);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  return path.map((point) => [
    pad + ((point.lng - minLng) / lngRange) * (width - pad * 2),
    pad + (1 - (point.lat - minLat) / latRange) * (height - pad * 2),
  ]);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function Sparkle({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute z-[2] block rotate-45 bg-[#FFF7C7] border-2 border-white rounded-[2px] shadow-[0_0_10px_rgba(255,247,199,0.65)] ${className}`} />;
}

function StatPill({ label }: { label: string }) {
  return <span className="inline-flex min-h-7 items-center rounded-full bg-[#FFFDF4] border-2 border-white px-4 font-headline-md text-xs text-[#075C35] shadow-[0_2px_0_rgba(7,92,53,0.25)]">{label}</span>;
}

function RouteSticker({ points, template, compact }: { points: string; template: ShareTemplate; compact: boolean }) {
  return (
    <svg viewBox="0 0 230 150" className="h-full w-full overflow-visible" aria-hidden="true">
      {points ? (
        <>
          <polyline points={points} fill="none" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={points} fill="none" stroke={template.mint} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={points} fill="none" stroke={template.accent} strokeWidth="5" strokeDasharray={compact ? '10 8' : '13 10'} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M18 126 C58 88 42 48 100 64 S170 110 212 24" fill="none" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" />
          <path d="M18 126 C58 88 42 48 100 64 S170 110 212 24" fill="none" stroke={template.mint} strokeWidth="15" strokeLinecap="round" />
          <path d="M18 126 C58 88 42 48 100 64 S170 110 212 24" fill="none" stroke={template.accent} strokeWidth="5" strokeDasharray={compact ? '10 8' : '13 10'} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PigHeadMarker({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`share-route-pig-head ${className}`}><img src={mascotUrl} alt="" /></span>;
}

function RealRoutePreview({ template, record, format, route, showRoute }: {
  template: ShareTemplate;
  record: RunRecord;
  format: Format;
  route: LatLng[];
  showRoute: boolean;
}) {
  const story = format === 'story';
  const path = routePoints(route, 230, 150, 24);
  const points = path.map(([x, y]) => `${x},${y}`).join(' ');
  const end = path.at(-1);
  return (
    <div className="relative h-full w-full overflow-hidden share-transparent-grid text-center" style={{ color: template.ink }}>
      <div className={`relative z-10 flex flex-col items-center ${story ? 'pt-6' : 'pt-4'}`}>
        <p className="font-headline-md text-sm">Distance</p>
        <p className={`font-headline-md tabular-nums leading-none ${story ? 'mt-1 text-[39px]' : 'mt-0.5 text-[34px]'}`}>{record.distanceKm.toFixed(2)} km</p>
        {story ? (
          <>
            <p className="mt-7 font-headline-md text-sm">Pace</p><p className="mt-1 font-headline-md text-[31px] leading-none tabular-nums">{formatPace(record.paceSec)} /km</p>
            <p className="mt-7 font-headline-md text-sm">Time</p><p className="mt-1 font-headline-md text-[31px] leading-none tabular-nums">{formatFriendlyDuration(record.durationSec)}</p>
          </>
        ) : (
          <div className="mt-4 grid w-[82%] grid-cols-2 gap-4"><div><p className="font-headline-md text-sm">Pace</p><p className="mt-1 font-headline-md text-lg tabular-nums">{formatPace(record.paceSec)} /km</p></div><div><p className="font-headline-md text-sm">Time</p><p className="mt-1 font-headline-md text-lg tabular-nums">{formatFriendlyDuration(record.durationSec)}</p></div></div>
        )}
      </div>

      {showRoute && (
        <div className={`absolute ${story ? 'left-5 right-5 top-[50%] h-[36%]' : 'left-5 right-5 top-[45%] h-[40%]'}`}>
          {points ? (
            <>
              <svg viewBox="0 0 230 150" className="h-full w-full overflow-visible" aria-hidden="true">
                <polyline points={points} fill="none" stroke="#0A5B2C" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={points} fill="none" stroke={template.mint} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={points} fill="none" stroke={template.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={points} fill="none" stroke="#E9FF8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {end && <span className="absolute" style={{ left: `${(end[0] / 230) * 100}%`, top: `${(end[1] / 150) * 100}%` }}><PigHeadMarker className="-translate-x-1/2 -translate-y-1/2" /></span>}
            </>
          ) : <p className="pt-12 text-xs text-[#49504B]">เส้น GPS จริงจะแสดงหลังจบการวิ่ง</p>}
        </div>
      )}
      <p className={`absolute inset-x-0 font-headline-md tracking-[0.12em] ${story ? 'bottom-[7%] text-2xl' : 'bottom-[5%] text-xl'}`}>RUNTOWN</p>
    </div>
  );
}

function ShareCardPreview({ template, record, format, route, showRoute, showCalories }: {
  template: ShareTemplate;
  record: RunRecord;
  format: Format;
  route: LatLng[];
  showRoute: boolean;
  showCalories: boolean;
}) {
  if (template.layout === 'real-route') return <RealRoutePreview template={template} record={record} format={format} route={route} showRoute={showRoute} />;
  const story = format === 'story';
  const points = routePoints(route, 230, 150, 18).map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-[30px] border-[3px] share-sticker-card ${template.background ? 'share-paper-texture' : ''}`}
      style={{ backgroundColor: template.background ?? 'transparent', borderColor: template.frame, color: template.ink }}
    >
      <Sparkle className={story ? 'left-7 top-[42%] h-4 w-4' : 'left-5 top-[49%] h-3.5 w-3.5'} />
      <Sparkle className={story ? 'right-7 top-[36%] h-3 w-3' : 'right-6 top-[43%] h-3 w-3'} />

      {story ? (
        <div className="relative z-10 flex flex-col items-center pt-5 text-center">
          <StatPill label="Distance" />
          <p className="share-sticker-number mt-1 font-headline-md text-[39px] leading-none tabular-nums" style={{ color: template.ink }}>{record.distanceKm.toFixed(2)}<span className="ml-1 text-base">km</span></p>
          <div className="mt-4 h-0.5 w-28 bg-white/90" />
          <StatPill label="Pace" />
          <p className="share-sticker-number mt-1 font-headline-md text-[29px] leading-none tabular-nums" style={{ color: template.ink }}>{formatPace(record.paceSec)} /km</p>
          <div className="mt-4 h-0.5 w-28 bg-white/90" />
          <StatPill label="Time" />
          <p className="share-sticker-number mt-1 font-headline-md text-[29px] leading-none tabular-nums" style={{ color: template.ink }}>{formatDuration(record.durationSec)}</p>
        </div>
      ) : (
        <div className="relative z-10 pt-3 text-center">
          <StatPill label="Distance" />
          <p className="share-sticker-number mt-0.5 font-headline-md text-[34px] leading-none tabular-nums" style={{ color: template.ink }}>{record.distanceKm.toFixed(2)}<span className="ml-1 text-sm">km</span></p>
          <div className="mx-auto mt-2 grid w-[78%] grid-cols-2 gap-2">
            <div><StatPill label="Pace" /><p className="share-sticker-number mt-1 font-headline-md text-base tabular-nums" style={{ color: template.ink }}>{formatPace(record.paceSec)}</p></div>
            <div><StatPill label="Time" /><p className="share-sticker-number mt-1 font-headline-md text-base tabular-nums" style={{ color: template.ink }}>{formatDuration(record.durationSec)}</p></div>
          </div>
        </div>
      )}

      {showRoute && <div className={`absolute z-[1] ${story ? 'inset-x-5 top-[49%] h-[38%]' : 'left-3 right-[37%] top-[49%] h-[35%]'}`}><RouteSticker points={points} template={template} compact={!story} /></div>}
      {showCalories && <span className={`absolute z-[4] rounded-full border-2 border-white bg-[#FFFDF4] px-2 py-1 font-label-md text-xs ${story ? 'left-5 bottom-[20%]' : 'left-4 bottom-[18%]'}`} style={{ color: template.ink }}>{record.caloriesKcal} kcal</span>}
      <img src={mascotUrl} alt="" className={`absolute z-[3] object-contain pointer-events-none ${story ? 'right-0 bottom-0 w-[62%]' : 'right-0 bottom-[3%] w-[48%]'}`} />
      <div className={`absolute z-[5] left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-[#FFFDF4] px-5 py-1 font-headline-md text-sm tracking-[0.14em] shadow-[0_3px_0_rgba(7,92,53,0.25)] ${story ? 'bottom-3' : 'bottom-2'}`} style={{ color: template.ink }}>RUNTOWN</div>
    </div>
  );
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius);
}

function drawPill(ctx: CanvasRenderingContext2D, label: string, centerX: number, y: number, width: number, template: ShareTemplate) {
  ctx.fillStyle = template.cream; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 10;
  roundedRect(ctx, centerX - width / 2, y, width, 72, 36); ctx.fill(); ctx.stroke();
  ctx.fillStyle = template.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 34px Mitr, sans-serif';
  ctx.fillText(label, centerX, y + 38);
}

function drawStickerText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, template: ShareTemplate) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; ctx.font = `700 ${size}px Mitr, sans-serif`;
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(13, size * 0.13); ctx.strokeText(text, x, y);
  ctx.fillStyle = template.ink; ctx.fillText(text, x, y);
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#FFF1A8'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, -radius); ctx.quadraticCurveTo(radius * 0.23, -radius * 0.23, radius, 0); ctx.quadraticCurveTo(radius * 0.23, radius * 0.23, 0, radius); ctx.quadraticCurveTo(-radius * 0.23, radius * 0.23, -radius, 0); ctx.quadraticCurveTo(-radius * 0.23, -radius * 0.23, 0, -radius); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, template: ShareTemplate) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = template.accent; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(0, -15, 33, Math.PI * 0.15, Math.PI * 0.85, true); ctx.quadraticCurveTo(0, 48, -29, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = template.cream; ctx.beginPath(); ctx.arc(0, -15, 11, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawPigHead(ctx: CanvasRenderingContext2D, mascot: HTMLImageElement, x: number, y: number, radius: number) {
  ctx.save();
  ctx.fillStyle = '#BCEBC8'; ctx.strokeStyle = '#FFFDF4'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#075C35'; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, radius - 8, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(mascot, 225, 250, 575, 575, x - radius + 8, y - radius + 8, (radius - 8) * 2, (radius - 8) * 2);
  ctx.restore();
}

function drawRealRouteExport(ctx: CanvasRenderingContext2D, record: RunRecord, format: Format, path: LatLng[], mascot: HTMLImageElement, template: ShareTemplate, showRoute: boolean) {
  const width = ctx.canvas.width; const height = ctx.canvas.height; const center = width / 2;
  const stat = (label: string, value: string, labelY: number, valueY: number, valueSize: number, x = center) => {
    ctx.fillStyle = template.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = '600 50px Mitr, sans-serif'; ctx.fillText(label, x, labelY);
    ctx.font = `700 ${valueSize}px Mitr, sans-serif`; ctx.fillText(value, x, valueY);
  };

  if (format === 'story') {
    stat('Distance', `${record.distanceKm.toFixed(2)} km`, 150, 285, 105);
    stat('Pace', `${formatPace(record.paceSec)} /km`, 465, 600, 94);
    stat('Time', formatFriendlyDuration(record.durationSec), 775, 910, 94);
  } else {
    stat('Distance', `${record.distanceKm.toFixed(2)} km`, 100, 225, 96);
    stat('Pace', `${formatPace(record.paceSec)} /km`, 335, 435, 62, 300);
    stat('Time', formatFriendlyDuration(record.durationSec), 335, 435, 62, 780);
  }

  if (showRoute) {
    const routeX = format === 'story' ? 150 : 120; const routeY = format === 'story' ? 990 : 510;
    const routeW = format === 'story' ? 780 : 840; const routeH = format === 'story' ? 570 : 390;
    const points = routePoints(path, routeW, routeH, 75);
    if (points.length > 1) {
      const stroke = (color: string, lineWidth: number) => {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x + routeX, y + routeY) : ctx.lineTo(x + routeX, y + routeY)); ctx.stroke();
      };
      stroke('#075C35', 38); stroke(template.mint, 28); stroke(template.accent, 14); stroke('#E9FF8A', 4);
      const end = points[points.length - 1]; drawPigHead(ctx, mascot, end[0] + routeX, end[1] + routeY, format === 'story' ? 72 : 60);
    }
  }

  ctx.fillStyle = template.ink; ctx.textAlign = 'center'; ctx.font = `700 ${format === 'story' ? 68 : 52}px Mitr, sans-serif`; ctx.letterSpacing = '8px';
  ctx.fillText('RUNTOWN', center, height - (format === 'story' ? 175 : 80)); ctx.letterSpacing = '0px';
}

export function ShareResultSheet({ record, user, onClose }: { record: RunRecord; user: User; onClose: () => void }) {
  const [format, setFormat] = useState<Format>('story');
  const [templateIndex, setTemplateIndex] = useState(0);
  const [showRoute, setShowRoute] = useState(true);
  const [showCalories, setShowCalories] = useState(true);
  const [message, setMessage] = useState('ทุกก้าวเล็ก ๆ น่าจำเสมอ');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const safePath = useMemo(() => privateRoute(record.traveledPath ?? []), [record.traveledPath]);

  const chooseTemplate = (index: number) => {
    setTemplateIndex(index);
    if (TEMPLATES[index].layout === 'real-route') setShowRoute(true);
    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const createImage = async (): Promise<Blob> => {
    await document.fonts.ready;
    const width = 1080; const height = format === 'story' ? 1920 : 1080;
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('อุปกรณ์นี้สร้างรูปไม่ได้');
    const template = TEMPLATES[templateIndex]; const mascot = await loadImage(mascotUrl);
    ctx.clearRect(0, 0, width, height);
    if (template.background) { ctx.fillStyle = template.background; ctx.fillRect(0, 0, width, height); }

    if (template.layout === 'real-route') {
      drawRealRouteExport(ctx, record, format, safePath, mascot, template, showRoute);
      return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('สร้างรูปไม่สำเร็จ')), 'image/png'));
    }

    const inset = format === 'story' ? 58 : 45;
    ctx.strokeStyle = template.frame; ctx.lineWidth = 18; roundedRect(ctx, inset, inset, width - inset * 2, height - inset * 2, 90); ctx.stroke();
    const center = width / 2;

    if (format === 'story') {
      drawPill(ctx, 'Distance', center, 125, 330, template); drawStickerText(ctx, `${record.distanceKm.toFixed(2)} km`, center, 330, 116, template);
      drawPill(ctx, 'Pace', center, 410, 270, template); drawStickerText(ctx, `${formatPace(record.paceSec)} /km`, center, 615, 96, template);
      drawPill(ctx, 'Time', center, 690, 270, template); drawStickerText(ctx, formatDuration(record.durationSec), center, 895, 96, template);
    } else {
      drawPill(ctx, 'Distance', center, 75, 300, template); drawStickerText(ctx, `${record.distanceKm.toFixed(2)} km`, center, 270, 106, template);
      drawPill(ctx, 'Pace', 300, 320, 220, template); drawStickerText(ctx, formatPace(record.paceSec), 300, 485, 69, template);
      drawPill(ctx, 'Time', 780, 320, 220, template); drawStickerText(ctx, formatDuration(record.durationSec), 780, 485, 69, template);
    }

    if (showRoute) {
      const routeX = format === 'story' ? 135 : 85; const routeY = format === 'story' ? 930 : 525;
      const routeW = format === 'story' ? 810 : 600; const routeH = format === 'story' ? 500 : 340;
      const points = routePoints(safePath, routeW, routeH, 40);
      const path = points.length > 1 ? points : [[40, routeH - 50], [150, routeH - 130], [230, routeH - 250], [390, routeH - 160], [routeW - 40, 50]];
      const strokeRoute = (color: string, lineWidth: number, dash: number[] = []) => {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash);
        path.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x + routeX, y + routeY) : ctx.lineTo(x + routeX, y + routeY)); ctx.stroke(); ctx.setLineDash([]);
      };
      strokeRoute('#FFFFFF', 48); strokeRoute(template.mint, 33); strokeRoute(template.accent, 12, [28, 22]);
      const end = path[path.length - 1]; drawPin(ctx, end[0] + routeX, end[1] + routeY, template);
    }

    drawSparkle(ctx, format === 'story' ? 170 : 110, format === 'story' ? 1120 : 610, 34);
    drawSparkle(ctx, format === 'story' ? 900 : 925, format === 'story' ? 1030 : 565, 25);
    drawSparkle(ctx, format === 'story' ? 230 : 190, format === 'story' ? 1430 : 810, 22);

    const mascotHeight = format === 'story' ? 730 : 500; const mascotWidth = mascot.width * (mascotHeight / mascot.height);
    ctx.drawImage(mascot, width - mascotWidth - (format === 'story' ? 70 : 22), height - mascotHeight - (format === 'story' ? 120 : 42), mascotWidth, mascotHeight);

    if (showCalories) {
      ctx.fillStyle = template.cream; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 9;
      roundedRect(ctx, format === 'story' ? 105 : 70, height - (format === 'story' ? 430 : 235), 250, 66, 33); ctx.fill(); ctx.stroke();
      ctx.fillStyle = template.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 29px Mitr, sans-serif';
      ctx.fillText(`${record.caloriesKcal} kcal`, format === 'story' ? 230 : 195, height - (format === 'story' ? 397 : 202));
    }

    const messageY = height - (format === 'story' ? 195 : 185);
    ctx.fillStyle = template.cream; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 9; roundedRect(ctx, 250, messageY - 52, 580, 82, 41); ctx.fill(); ctx.stroke();
    ctx.fillStyle = template.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 27px Mali, cursive'; ctx.fillText(message, center, messageY - 10, 520);
    ctx.fillStyle = template.cream; ctx.strokeStyle = '#FFFFFF'; roundedRect(ctx, 315, height - 110, 450, 74, 37); ctx.fill(); ctx.stroke();
    ctx.fillStyle = template.ink; ctx.font = '700 36px Mitr, sans-serif'; ctx.fillText('RUNTOWN', center, height - 73);

    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('สร้างรูปไม่สำเร็จ')), 'image/png'));
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `runtown-${record.id}-${format}.png`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const saveImage = async () => {
    try { setBusyAction('save'); setStatus(null); downloadBlob(await createImage()); setStatus('บันทึกรูปแล้ว'); }
    catch { setStatus('สร้างรูปไม่สำเร็จ ลองอีกครั้ง'); } finally { setBusyAction(null); }
  };

  const shareImage = async (target: 'story' | 'more') => {
    try {
      setBusyAction(target); setStatus(null); const blob = await createImage(); const file = new File([blob], `runtown-${format}.png`, { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) await navigator.share({ title: 'RunTown run result', text: `${user.name} วิ่งได้ ${record.distanceKm.toFixed(2)} km วันนี้`, files: [file] });
      else { downloadBlob(blob); setStatus('อุปกรณ์นี้ไม่รองรับ Share Sheet จึงบันทึกรูปให้แทน'); }
    } catch (error) { if ((error as DOMException)?.name !== 'AbortError') setStatus('แชร์ไม่สำเร็จ ลองบันทึกรูปแทน'); }
    finally { setBusyAction(null); }
  };

  const copyImage = async () => {
    try {
      setBusyAction('copy'); setStatus(null); const blob = await createImage();
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('unsupported');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); setStatus('คัดลอกรูปแล้ว');
    } catch { setStatus('เบราว์เซอร์นี้คัดลอกรูปไม่ได้ ลองกดบันทึก'); } finally { setBusyAction(null); }
  };

  const cardWidth = format === 'story' ? 260 : 286;
  const isRealRouteTemplate = TEMPLATES[templateIndex].layout === 'real-route';
  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[900] bg-[#101712] text-[#FFFBEF] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <header className="sticky top-0 z-20 h-16 bg-[#142019]/95 backdrop-blur border-b border-white/10 flex items-center justify-center px-4 pt-safe">
        <button onClick={onClose} className="absolute left-4 min-h-11 px-1 text-sm font-semibold">ปิด</button><h2 id="share-title" className="font-headline-md text-lg">แชร์กิจกรรม</h2>
      </header>
      <div className="pt-7">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3" style={{ paddingInline: `calc((100% - ${cardWidth}px) / 2)` }}>
          {TEMPLATES.map((template, index) => <button ref={(node) => { cardRefs.current[index] = node; }} key={template.name} onClick={() => chooseTemplate(index)} aria-label={`เลือกแบบ ${template.name}`} aria-pressed={templateIndex === index} className={`shrink-0 snap-center transition-all duration-300 ${templateIndex === index ? 'opacity-100 scale-100' : 'opacity-35 scale-[0.94]'}`} style={{ width: cardWidth, aspectRatio: format === 'story' ? '9 / 16' : '1 / 1' }}><ShareCardPreview template={template} record={record} format={format} route={safePath} showRoute={showRoute} showCalories={showCalories} /></button>)}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3" aria-label="แบบการ์ดที่เลือก">{TEMPLATES.map((template, index) => <button key={template.name} onClick={() => chooseTemplate(index)} aria-label={template.name} className={`w-2.5 h-2.5 rounded-full ${templateIndex === index ? 'bg-[#FFFBEF]' : 'bg-[#59675E]'}`} />)}</div>
        <p className="text-center text-xs text-[#BFD0C3] mt-2">{TEMPLATES[templateIndex].name} · {TEMPLATES[templateIndex].note}</p>
      </div>
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between gap-3"><h3 className="font-headline-md text-base">ปรับก่อนแชร์</h3><div className="flex bg-[#26342B] rounded-full p-1"><button onClick={() => setFormat('story')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${format === 'story' ? 'bg-[#FFFBEF] text-[#123B2A]' : 'text-[#BFD0C3]'}`}>9:16</button><button onClick={() => setFormat('square')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${format === 'square' ? 'bg-[#FFFBEF] text-[#123B2A]' : 'text-[#BFD0C3]'}`}>1:1</button></div></div>
        {isRealRouteTemplate ? (
          <div className="mt-3 min-h-12 bg-[#1A261E] border border-white/15 rounded-xl px-3 flex items-center gap-3 text-sm"><span className="w-3 h-3 rounded-full bg-[#C9F04A] ring-2 ring-[#28BC53]" aria-hidden="true" /><span><strong className="block">ใช้เส้น GPS จริง</strong><span className="text-xs text-[#9EB0A2]">หัวหมูอยู่ที่ปลายเส้น และไฟล์เป็นพื้นโปร่งใส</span></span></div>
        ) : (
          <>
            <label className="block mt-3"><span className="sr-only">ข้อความบนการ์ด</span><select value={message} onChange={(event) => setMessage(event.target.value)} className="w-full min-h-12 bg-[#1A261E] border border-white/15 rounded-xl px-3 text-sm text-[#FFFBEF]"><option>ทุกก้าวเล็ก ๆ น่าจำเสมอ</option><option>วันนี้เก่งขึ้นอีกนิดแล้ว</option><option>วิ่งด้วยกัน ไปได้ไกลกว่า</option></select></label>
            <div className="grid grid-cols-2 gap-2 mt-2"><label className="min-h-11 bg-[#1A261E] border border-white/15 rounded-xl px-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={showRoute} onChange={(event) => setShowRoute(event.target.checked)} className="accent-[#36B85A]" /> เส้นทาง</label><label className="min-h-11 bg-[#1A261E] border border-white/15 rounded-xl px-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={showCalories} onChange={(event) => setShowCalories(event.target.checked)} className="accent-[#36B85A]" /> แคลอรี่</label></div>
          </>
        )}
        <p className="mt-2 text-xs leading-relaxed text-[#9EB0A2]">ช่วงเริ่มและจบของเส้นทางถูกตัดออก 12% ก่อนสร้างรูป เพื่อไม่เผยตำแหน่งบ้าน</p>
      </section>
      <section className="mt-7 border-t border-white/10 bg-[#142019] px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <h3 className="font-headline-md text-lg">แชร์ไปที่</h3><div className="grid grid-cols-4 gap-2 mt-4">
          <button onClick={() => shareImage('story')} disabled={busyAction !== null} className="flex flex-col items-center gap-2 text-center text-xs"><span className="w-14 h-14 rounded-full bg-[#53D270] text-[#123B2A] grid place-items-center"><span className="material-symbols-outlined text-2xl">photo_camera</span></span><span>Story</span></button>
          <button onClick={saveImage} disabled={busyAction !== null} className="flex flex-col items-center gap-2 text-center text-xs"><span className="w-14 h-14 rounded-full bg-[#304037] grid place-items-center"><span className="material-symbols-outlined text-2xl">download</span></span><span>บันทึก</span></button>
          <button onClick={copyImage} disabled={busyAction !== null} className="flex flex-col items-center gap-2 text-center text-xs"><span className="w-14 h-14 rounded-full bg-[#304037] grid place-items-center"><span className="material-symbols-outlined text-2xl">content_copy</span></span><span>คัดลอกรูป</span></button>
          <button onClick={() => shareImage('more')} disabled={busyAction !== null} className="flex flex-col items-center gap-2 text-center text-xs"><span className="w-14 h-14 rounded-full bg-[#304037] grid place-items-center"><span className="material-symbols-outlined text-2xl">ios_share</span></span><span>เพิ่มเติม</span></button>
        </div><div className="h-6 mt-3 text-center text-xs text-[#D8E3DA]" role="status" aria-live="polite">{busyAction ? 'กำลังสร้างรูป…' : status}</div>
      </section>
    </div>
  );
}
