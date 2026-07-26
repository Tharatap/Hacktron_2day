import React from 'react';
import { useApp } from '../state/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { dispatch } = useApp();

  return (
    <div className="bg-[#ebfef1] min-h-screen flex flex-col pt-safe pb-safe">
      <main className="flex-1 flex flex-col relative w-full bg-[#ebfef1]">
        <div className="flex flex-col w-full px-4 pb-8">
          {/* Header Logo */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="bg-[#006a3a] px-6 py-2 rounded-full flex items-center gap-1 shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] border-[2px] border-[#14241C]">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                directions_run
              </span>
              <span className="font-headline-md text-white uppercase tracking-wider">RunTown</span>
            </div>
          </div>

          {/* Hero Section with Mascot */}
          <div className="relative flex flex-col items-center justify-center py-8 mt-6">
            {/* Doodles */}
            <div className="absolute top-4 left-1/4 -rotate-12 text-[#006a3a] opacity-80">
              <span className="material-symbols-outlined text-4xl">auto_awesome</span>
            </div>
            <div className="absolute bottom-8 right-1/4 rotate-12 text-[#725c00]">
              <span className="material-symbols-outlined text-3xl">favorite</span>
            </div>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 flex flex-col gap-1">
              <div className="w-8 h-1 bg-[#14241C] rounded-full opacity-20"></div>
              <div className="w-6 h-1 bg-[#14241C] rounded-full opacity-20 ml-2"></div>
            </div>

            {/* Mascot Sticker */}
            <div className="relative z-10 -rotate-2">
              <div className="p-1 bg-white rounded-2xl border-[2px] border-[#14241C] shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] overflow-hidden">
                <img
                  alt="Friendly waving pig mascot"
                  className="h-[220px] w-auto object-contain"
                  src="/assets/mascot-pig-wave.png"
                />
              </div>
            </div>

            {/* Speech Bubble */}
            <div className="absolute -top-4 right-4 z-20 rotate-6">
              <div className="bg-white px-4 py-2 rounded-2xl border-[2px] border-[#14241C] shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] relative">
                <p className="font-headline-md text-[14px] text-[#14241C] whitespace-nowrap">พร้อมวิ่งยัง ชลบุรี?</p>
                <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b-[2px] border-r-[2px] border-[#14241C] rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center px-6 mt-4">
            <h2 className="font-headline-lg-mobile text-[#14241C] leading-tight mb-1">
              วิ่ง เก็บ coin
              <br />
              เจอเพื่อนบ้านคุณ
            </h2>
            <p className="font-body-md text-[#6d7a6f]">Track your run. Earn coins. Meet your city.</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4 mt-8 px-4">
            {/* Primary Button */}
            <button
              onClick={() => dispatch({ type: 'NAV', screen: 'login' })}
              className="w-full bg-[#12A05C] py-4 rounded-full border-[2px] border-[#14241C] shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <span className="font-headline-md text-white">เข้าสู่ระบบ</span>
            </button>

            {/* Secondary Button */}
            <button
              onClick={() => dispatch({ type: 'NAV', screen: 'register' })}
              className="w-full bg-white py-4 rounded-full border-[2px] border-[#14241C] shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <span className="font-headline-md text-[#14241C]">สมัครสมาชิก</span>
            </button>

            {/* Guest Link — ทางเข้าเดโม ต้องทำงานจริง 100% */}
            <button
              onClick={() => dispatch({ type: 'GUEST_ENTER' })}
              className="flex items-center justify-center gap-1 py-2"
            >
              <span className="font-label-md text-[#14241C]">เข้าใช้งานแบบแขก</span>
              <span className="material-symbols-outlined text-[#14241C] font-bold">trending_flat</span>
            </button>
          </div>

          {/* Footer Decoration */}
          <div className="mt-auto pt-8 flex justify-center items-center gap-6">
            <div className="w-12 h-12 bg-[#daede0] rounded-xl border-[2px] border-[#14241C] shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] flex items-center justify-center -rotate-6">
              <span className="material-symbols-outlined text-[#12A05C]">skateboarding</span>
            </div>
            <div className="w-12 h-12 bg-[#ffe07e] rounded-xl border-[2px] border-[#14241C] shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] flex items-center justify-center rotate-3">
              <span className="material-symbols-outlined text-[#725C00]">database</span>
            </div>
            <div className="w-12 h-12 bg-[#b4f0cf] rounded-xl border-[2px] border-[#14241C] shadow-[3px_3px_0px_0px_rgba(20,36,28,1)] flex items-center justify-center rotate-12">
              <span className="material-symbols-outlined text-[#306950]">location_on</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
