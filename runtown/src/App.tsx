import React, { useEffect } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { MapTab } from './components/MapTab';
import { ActiveRunScreen } from './components/ActiveRunScreen';
import { RunTab } from './components/RunTab';
import { ShopTab } from './components/ShopTab';
import { PlanTab } from './components/PlanTab';
import { ProfileTab } from './components/ProfileTab';

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
      return <ActiveRunScreen />;
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
  const { state } = useApp();
  // หน้า 'run' เป็นฉากเกมเต็มจอ ไม่มี bottom nav ในดีไซน์ต้นฉบับ (มีปุ่ม pause/stop/lock ของตัวเองแทน)
  const isRunScreen = state.ui.screen === 'run';

  return (
    // กรอบแอปตัวจริง — ตัวเดียวที่ fixed ต่อ viewport (ตรงกลาง, กว้างเท่าจอมือถือ)
    // Header/Navbar/ToastStack/modal ทั้งหมดข้างในเปลี่ยนเป็น absolute แล้วอิงกรอบนี้แทน
    // ไม่งั้นบน desktop browser (viewport กว้างกว่าการ์ด) fixed เดิมจะไปอิง viewport เต็มจอ
    // ทำให้ nav ล่างเลื่อนหลุดไปคนละตำแหน่งกับตัวการ์ด
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md flex flex-col font-body-md text-[#0f1f17] bg-[#F2F7F3] shadow-2xl overflow-hidden">
      <Header />
      <ToastStack />
      <main
        className={
          isRunScreen
            ? 'flex-1 relative overflow-hidden pt-16'
            : 'flex-1 overflow-y-auto pt-20 pb-28 bg-[#F2F7F3] px-4'
        }
      >
        <CurrentScreen />
      </main>
      {!isRunScreen && <Navbar />}
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
