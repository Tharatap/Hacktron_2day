import React, { useState } from 'react';
import { useApp } from '../state/AppContext';

export const LoginScreen: React.FC = () => {
  const { dispatch } = useApp();
  const [showPassword, setShowPassword] = useState(false);

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
            <span className="font-headline-md text-[#0f1f17]">Login</span>
          </div>
          <img
            alt="Mascot"
            className="w-8 h-8 rounded-full border-2 border-white outline outline-2 outline-[#0f1f17] rotate-[-2deg] object-cover"
            src="/assets/Gemini_Generated_Image_prhf8vprhf8vprhf-Photoroom.png"
          />
        </div>
      </header>

      <main className="relative w-full pt-16 bg-[#ebfef1]">
        <div className="flex flex-col w-full px-4 pb-8">
          {/* Header Section with Mascot */}
          <div className="relative w-full pt-6 pb-4 flex flex-col items-start justify-end">
            <div className="absolute right-[-10px] transform rotate-[12deg] z-10 top-[-20px]">
              <img alt="Mascot" className="h-[100px] w-auto object-contain" src="/assets/Gemini_Generated_Image_prhf8vprhf8vprhf-Photoroom.png" />
            </div>
            <div className="mt-8">
              <h1 className="font-headline-lg-mobile text-[#0f1f17] mb-1">ยินดีต้อนรับกลับมา!</h1>
              <p className="font-body-md text-[#3d4a40]">เข้าสู่ระบบเพื่อไปต่อ streak ของคุณ</p>
            </div>
          </div>

          {/* Login Form Container */}
          <div className="flex flex-col gap-6 mt-4">
            {/* Email Input */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-[#0f1f17] ml-4">อีเมลหรือเบอร์โทร</label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-4 text-[#3d4a40]">mail</span>
                <input
                  className="w-full h-[56px] pl-[52px] pr-4 bg-white border-[2px] border-[#0f1f17] rounded-full font-body-md shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] focus:outline-none focus:bg-white transition-colors"
                  placeholder="your@email.com"
                  type="text"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-[#0f1f17] ml-4">รหัสผ่าน</label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-4 text-[#3d4a40]">lock</span>
                <input
                  className="w-full h-[56px] pl-[52px] pr-[52px] bg-white border-[2px] border-[#0f1f17] rounded-full font-body-md shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] focus:outline-none focus:bg-white transition-colors"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[#3d4a40]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button className="font-label-md text-[#3d4a40] hover:text-[#0f1f17]">ลืมรหัสผ่าน?</button>
              </div>
            </div>

            {/* Main CTA — เข้าเดโมตรงๆ ไม่ validate */}
            <button
              onClick={() => dispatch({ type: 'LOGIN' })}
              className="w-full h-[56px] bg-[#006a3a] text-white font-headline-md rounded-full border-[2px] border-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,31,23,1)] transition-all"
            >
              เข้าสู่ระบบ
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="h-[1px] flex-1 bg-[#bccabd]"></div>
              <span className="font-handwritten-sm text-[#3d4a40]">หรือ</span>
              <div className="h-[1px] flex-1 bg-[#bccabd]"></div>
            </div>

            {/* Google Login — ตกแต่งอย่างเดียว ไม่ต้องทำงานจริง */}
            <button className="w-full h-[56px] bg-white text-[#0f1f17] font-body-lg rounded-full border-[2px] border-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,31,23,1)] transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>

          {/* Footer Registration Link */}
          <div className="mt-8 flex justify-center items-center gap-1">
            <span className="font-body-md text-[#3d4a40]">ยังไม่มีบัญชี?</span>
            <button
              onClick={() => dispatch({ type: 'NAV', screen: 'register' })}
              className="font-headline-md text-base text-[#006a3a] hover:underline"
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Decorative Sticker Sparkle */}
          <div className="flex justify-center mt-6">
            <div className="bg-[#ffe07e] p-2 rounded-lg border-[2px] border-[#0f1f17] shadow-[3px_3px_0px_0px_rgba(15,31,23,1)] -rotate-3">
              <span className="material-symbols-outlined text-[#231b00] text-[32px]">bolt</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
