import React, { useEffect } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { RunEngineProvider } from './state/useRunEngine';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { MapTab } from './components/MapTab';
import { ActiveRunScreen } from './components/ActiveRunScreen';
import { RunTab } from './components/RunTab';
import { ShopTab } from './components/ShopTab';
import { PlanTab } from './components/PlanTab';
import { ProfileTab } from './components/ProfileTab';
import { RankingTab } from './components/RankingTab';
import { RunStartScreen } from './components/RunStartScreen';

const TOAST_TONE_CLASS: Record<'info' | 'success' | 'warn', string> = {
  info: 'bg-[#14241C] text-white',
  success: 'bg-[#006a3a] text-white',
  warn: 'bg-[#FF6B5A] text-white',
};

/**
 * state.ui.toasts มีอยู่แล้วใน AppContext.tsx (reducer push เข้ามาตอน redeem ไม่ผ่าน,
 * เก็บ checkpoint, ฯลฯ) แต่ไม่มีที่ไหน render ออกมาให้เห็นเลย — เพิ่มจุดกลางจุดเดียวที่นี่
 */
function ToastStack() {
  const { state, dispatch } = useApp();
  const { toasts } = state.ui;

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch({ type: 'TOAST_DISMISS', id: t.id }), 2500)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center px-4 w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded-full border-2 border-[#14241C] hard-shadow font-label-md text-sm text-center ${TOAST_TONE_CLASS[t.tone]}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

function CurrentScreen() {
  const { state } = useApp();

  switch (state.ui.screen) {
    case 'map':
    case 'zone':
      return <MapTab />;
    case 'run':
      if (state.run.status === 'idle') return <RunStartScreen />;
      if (state.run.status === 'finished') return <RunTab />;
      return <ActiveRunScreen />;
    case 'finish':
      return <RunTab />;
    case 'shop':
      return <ShopTab />;
    case 'planner':
      return <PlanTab />;
    case 'ranking':
      return <RankingTab />;
    case 'profile':
      return <ProfileTab />;
    default:
      return null;
  }
}

function RunRecoveryDialog() {
  const { state, dispatch } = useApp();
  const continueRef = React.useRef<HTMLButtonElement>(null);
  const { run } = state;

  useEffect(() => {
    if (state.ui.recoveryPrompt) continueRef.current?.focus();
  }, [state.ui.recoveryPrompt]);

  if (!state.ui.recoveryPrompt) return null;

  return (
    <div className="absolute inset-0 z-[1200] grid place-items-center bg-[#14241C]/65 p-5" role="dialog" aria-modal="true" aria-labelledby="recovery-title" aria-describedby="recovery-description">
      <div className="w-full rounded-2xl border-2 border-ink bg-paper p-5 hard-shadow-lg">
        <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-lemon hard-shadow-sm" aria-hidden="true">
          <span className="material-symbols-outlined">history</span>
        </div>
        <h2 id="recovery-title" className="mt-4 font-headline-md text-2xl">พบการวิ่งที่ยังไม่จบ</h2>
        <p id="recovery-description" className="mt-2 text-sm text-ink-soft">ข้อมูลล่าสุดยังอยู่ครบ เลือกวิ่งต่อ หรือจบกิจกรรมจากจุดที่บันทึกไว้</p>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border-2 border-ink bg-white p-3 text-center">
          <div><span className="block text-xs text-ink-soft">เวลา</span><strong className="font-headline-md tabular-nums">{Math.floor(run.elapsedSec / 60)}:{String(run.elapsedSec % 60).padStart(2, '0')}</strong></div>
          <div><span className="block text-xs text-ink-soft">ระยะทาง</span><strong className="font-headline-md tabular-nums">{(run.distanceM / 1000).toFixed(2)} km</strong></div>
        </div>
        <button ref={continueRef} onClick={() => dispatch({ type: 'RUN_RECOVERY_CONTINUE' })} className="mt-5 min-h-14 w-full rounded-full border-2 border-ink bg-grass text-white hard-shadow font-headline-md">วิ่งต่อ</button>
        <button onClick={() => dispatch({ type: 'RUN_RECOVERY_FINISH' })} className="mt-3 min-h-12 w-full rounded-full border-2 border-ink bg-lemon hard-shadow font-label-md">จบและบันทึกผล</button>
        <button onClick={() => dispatch({ type: 'RUN_RECOVERY_DISCARD' })} className="mt-3 min-h-11 w-full rounded-full border-2 border-[#9C2D25] bg-white text-[#8A211A] font-label-md">ลบกิจกรรมนี้</button>
      </div>
    </div>
  );
}

function Shell() {
  const { state } = useApp();
  const isRunScreen = state.ui.screen === 'run' && ['countdown', 'running', 'paused'].includes(state.run.status);

  return (
    // กรอบแอปตัวจริง — ตัวเดียวที่ fixed ต่อ viewport (ตรงกลาง, กว้างเท่าจอมือถือ)
    // Header/Navbar/ToastStack/modal ทั้งหมดข้างในเปลี่ยนเป็น absolute แล้วอิงกรอบนี้แทน
    // ไม่งั้นบน desktop browser (viewport กว้างกว่าการ์ด) fixed เดิมจะไปอิง viewport เต็มจอ
    // ทำให้ nav ล่างเลื่อนหลุดไปคนละตำแหน่งกับตัวการ์ด
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md flex flex-col font-body-md text-ink bg-paper shadow-2xl overflow-hidden">
      {!isRunScreen && <Header />}
      <ToastStack />
      <main
        className={
          isRunScreen
            ? 'flex-1 relative overflow-hidden'
            : 'flex-1 overflow-y-auto pt-20 pb-28 bg-paper px-4'
        }
      >
        <CurrentScreen />
      </main>
      {!isRunScreen && <Navbar />}
      <RunRecoveryDialog />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RunEngineProvider>
        <Shell />
      </RunEngineProvider>
    </AppProvider>
  );
}
