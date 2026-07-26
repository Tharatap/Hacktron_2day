import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import type { RunnerAvatarId } from '../types';

/** เรียงซ้าย->ขวาตามดีไซน์: male / female / pig — female เป็นตัวกลางที่พรีเซ็ตไว้แล้วใน mockData */
const AVATAR_OPTIONS: { id: RunnerAvatarId; alt: string; src: string }[] = [
  { id: 'male', alt: 'นักวิ่งชาย', src: '/assets/male-runner-10-frame-running.gif' },
  { id: 'female', alt: 'นักวิ่งหญิง', src: '/assets/female-runner-10-frame-running.gif' },
  { id: 'pig', alt: 'นักวิ่งหมูมาสคอต', src: '/assets/pig-runner-10-frame-running.gif' },
];

export const RegisterScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const selectedAvatar = state.user.runnerAvatarId;

  return (
    <div className="bg-[#ebfef1] font-body-md text-[#0f1f17] min-h-screen">
      {/* Header เฉพาะหน้านี้ — ไม่ใช่ Header ของแอปหลัก */}
      <header className="absolute top-0 inset-x-0 z-50 bg-[#ebfef1]/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'NAV', screen: 'welcome' })}
              className="w-11 h-11 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[#0f1f17]">arrow_back</span>
            </button>
            <span className="font-headline-md text-[#0f1f17]">Signup</span>
          </div>
          <img
            alt="Mascot"
            className="w-8 h-8 rounded-full border-2 border-white outline outline-2 outline-[#0f1f17] rotate-[-2deg] object-cover"
            src="/assets/mascot-pig-wave.png"
          />
        </div>
      </header>

      <main className="relative w-full pt-16 bg-[#ebfef1]">
        <div className="flex flex-col w-full px-4 pb-8">
          {/* Header Section */}
          <div className="mt-2 mb-6">
            <h1 className="font-headline-lg-mobile text-[#0f1f17] mb-1">มาร่วมทีมวิ่งกันเถอะ!</h1>
            <p className="font-body-md text-[#3d4a40]">ใช้เวลาแค่แป๊บเดียว</p>
          </div>

          {/* Avatar Picker */}
          <div className="flex flex-col gap-2 mb-6">
            <span className="font-label-md text-[#0f1f17] ml-1">เลือกตัวละครของคุณ</span>
            <div className="flex items-center justify-around py-2 bg-[#e5f8eb] rounded-xl outline outline-2 outline-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)]">
              {AVATAR_OPTIONS.map((avatar, i) => {
                const isSelected = selectedAvatar === avatar.id;
                const rotation = i === 0 ? 'rotate-[-6deg]' : i === 1 ? 'rotate-[4deg]' : 'rotate-[-3deg]';
                return (
                  <button
                    key={avatar.id}
                    onClick={() => dispatch({ type: 'SELECT_AVATAR', avatarId: avatar.id })}
                    className="relative transition-transform active:scale-95"
                  >
                    <div
                      className={`rounded-full bg-white outline outline-2 outline-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] overflow-hidden ${rotation} border-4 border-white relative ${
                        isSelected ? 'w-20 h-20 z-10 bg-[#ffe07e] outline-[3px]' : 'w-16 h-16'
                      }`}
                    >
                      <img className="w-full h-full object-cover" alt={avatar.alt} src={avatar.src} />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 z-20 bg-[#ba1a1a] w-7 h-7 rounded-full outline outline-2 outline-[#0f1f17] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,31,23,1)]">
                        <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'wght' 700" }}>
                          check
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registration Form */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#3d4a40]">person</span>
              <input
                className="w-full h-14 pl-12 pr-4 rounded-full bg-white outline outline-2 outline-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] font-body-md text-[#0f1f17] focus:outline-[#006a3a] transition-all"
                placeholder="ชื่อ"
                type="text"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#3d4a40]">mail</span>
              <input
                className="w-full h-14 pl-12 pr-4 rounded-full bg-white outline outline-2 outline-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] font-body-md text-[#0f1f17] focus:outline-[#006a3a] transition-all"
                placeholder="อีเมลหรือเบอร์โทร"
                type="text"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#3d4a40]">lock</span>
              <input
                className="w-full h-14 pl-12 pr-12 rounded-full bg-white outline outline-2 outline-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] font-body-md text-[#0f1f17] focus:outline-[#006a3a] transition-all"
                placeholder="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#3d4a40]"
              >
                {showPassword ? 'visibility_off' : 'visibility'}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#3d4a40]">lock_reset</span>
              <input
                className="w-full h-14 pl-12 pr-4 rounded-full bg-white outline outline-2 outline-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] font-body-md text-[#0f1f17] focus:outline-[#006a3a] transition-all"
                placeholder="ยืนยันรหัสผ่าน"
                type="password"
              />
            </div>
          </div>

          {/* Terms Checkbox — peer-checked ล้วนๆ ไม่ต้องใช้ state */}
          <div className="flex items-start gap-2 mt-6 px-1">
            <label className="relative flex items-center cursor-pointer">
              <input className="sr-only peer" type="checkbox" />
              <div className="w-6 h-6 bg-white outline outline-2 outline-[#0f1f17] rounded-md shadow-[2px_2px_0px_0px_rgba(15,31,23,1)] peer-checked:bg-[#006a3a] transition-colors flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-white text-sm hidden peer-checked:block"
                  style={{ fontVariationSettings: "'wght' 700" }}
                >
                  check
                </span>
              </div>
            </label>
            <span className="font-body-md text-[#3d4a40] text-[14px] leading-tight">
              ฉันยอมรับ<span className="text-[#006a3a] font-bold">ข้อกำหนด</span>และ
              <span className="text-[#006a3a] font-bold">นโยบายความเป็นส่วนตัว</span>
            </span>
          </div>

          {/* Main Action — เข้าเดโมตรงๆ ไม่ validate */}
          <div className="mt-8">
            <button
              onClick={() => dispatch({ type: 'LOGIN' })}
              className="w-full h-16 bg-[#006a3a] text-white font-headline-md rounded-full outline outline-2 outline-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
            >
              สร้างบัญชี
              <span className="material-symbols-outlined">rocket_launch</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="font-body-md text-[#0f1f17]">
              มีบัญชีอยู่แล้ว?{' '}
              <button
                onClick={() => dispatch({ type: 'NAV', screen: 'login' })}
                className="text-[#006a3a] font-headline-md ml-1 underline decoration-2 underline-offset-4"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
