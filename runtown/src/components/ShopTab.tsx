import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { COIN_PER_KM } from '../lib/formulas';
import type { MerchantCategory, Reward } from '../types';

const CATEGORY_LABEL: Record<MerchantCategory, string> = {
  gear: 'อุปกรณ์',
  food: 'อาหาร',
  health: 'สุขภาพ',
  event: 'งานวิ่ง',
};

const CATEGORIES: (MerchantCategory | 'ทั้งหมด')[] = ['ทั้งหมด', 'gear', 'food', 'health', 'event'];

/**
 * รูปสินค้า/ร้านของ Stitch ผูกกับ merchant.id — presentation-only เหมือน ZONE_ART ใน MapTab.tsx
 * Merchant/Reward ไม่มี field รูปภาพเลย ของเดิม Stitch มีรูปจริงแค่ 4 ร้าน (จาก 6 ร้านในข้อมูลใหม่)
 * m-health-01 กับ m-event-02 เลยยืมรูปร้านหมวดใกล้เคียงมาใช้แทนไปก่อน (decorative เท่านั้น ไม่กระทบข้อมูลจริง)
 */
const MERCHANT_ART: Record<string, string> = {
  'm-gear-01':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAIZ_x0ZCTim0Fv_PyGeJrKXHJtBTTVU3zmToT1ksg1KR3JWsBduv5uQrQ6Qr4KY45EI3YRIwRG5lm6RhxGy58PDa4RKiO3gn0MztCrGRRTDiPyYb9-GQcLnyWY5F3MqNprgbDc0hlqfcCmB6okPRLAaI-_BmQv5CIvYk9A-jK9Ji_OKYJGE_ND97oSZoynJEJLczQqlRwvSMU85A-eRsgWZC2v0gOAg_7NeFe70cJ2zOoLiQi_S-rMDD-Qys0u_LFaZaEBGt8SXGE',
  'm-food-01':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC_0J-xx766HQcUdgrhHX44l-Vy4Sw5Mgwk6Ky3pPtuv2MeCm7wU3M3fee_zsEbxp_7Ph1wkafJ7Ops8cvaTNW3LsvasyEio3LOUdVwfg0tujr1d7J4s13Htic91D9utrzfU3ekOqAR1eJxZiVWpGvC67RyN4Ug-g_aTJpEFH0sv7F1kdniXJAu344k9XZwFjGgxUk01uWKkKVWCgUiwtnHmbgYFL4HrULBDTGg1BCL6BhGp3g44kAtCatNk3nwJNb37Q58Sz4-jqo',
  'm-gear-02':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDzJ5VJlFO5Q_Y0jXZsGfH3pxEaz-Ur9RBR0kPOidmmd4TpkfPbIvnL-hcbbJWActVGUQcKzwr9j5yvPy2T5vC6jo6mOxk53KYBKcKhivdQOXdDbVqrAFw6hE1NacIri8TjgOB45_Mb-NOOErp1cwCaj3F5siCHG5_HD1afqvj3KUiak7J_lk-SV_1Vblg9pNNEEnVsqGJKQjPK0yIsrcxX06edZqDFfS-4aUhzwch9ICC792l7Wnt-s55y40mm34z8fuUzYV4rHJE',
  'm-event-01':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDzZq_DsJQD_ghyWfhuh-qqY4rkMSllT14tEbr1bTN5woAcbbo9ZXEx1R2tlTqjl7BuzJAqw1SuD7uFiEUbAbNUZCQJI3DsrYop8XAOtCEiTeHXLLx_0NjMO3FmN2yMfqKVA00nsniDnGzMOnPeophx0qDF7yDga2ddPLER61OLyF9OvOVKhBuaCN9PU7Ldyc1RkWADgt8wOtp54aJNlhKm86O_Pdu1-YkiCs_RVNhsXLi0z1m4FTRsq5GgLHv1n2hSG8rC204Lik8',
  'm-health-01':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAIZ_x0ZCTim0Fv_PyGeJrKXHJtBTTVU3zmToT1ksg1KR3JWsBduv5uQrQ6Qr4KY45EI3YRIwRG5lm6RhxGy58PDa4RKiO3gn0MztCrGRRTDiPyYb9-GQcLnyWY5F3MqNprgbDc0hlqfcCmB6okPRLAaI-_BmQv5CIvYk9A-jK9Ji_OKYJGE_ND97oSZoynJEJLczQqlRwvSMU85A-eRsgWZC2v0gOAg_7NeFe70cJ2zOoLiQi_S-rMDD-Qys0u_LFaZaEBGt8SXGE',
  'm-event-02':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDzZq_DsJQD_ghyWfhuh-qqY4rkMSllT14tEbr1bTN5woAcbbo9ZXEx1R2tlTqjl7BuzJAqw1SuD7uFiEUbAbNUZCQJI3DsrYop8XAOtCEiTeHXLLx_0NjMO3FmN2yMfqKVA00nsniDnGzMOnPeophx0qDF7yDga2ddPLER61OLyF9OvOVKhBuaCN9PU7Ldyc1RkWADgt8wOtp54aJNlhKm86O_Pdu1-YkiCs_RVNhsXLi0z1m4FTRsq5GgLHv1n2hSG8rC204Lik8',
};

export const ShopTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<MerchantCategory | 'ทั้งหมด'>('ทั้งหมด');
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  const merchantOf = (reward: Reward) => state.merchants.find((m) => m.id === reward.merchantId) ?? null;

  const filteredRewards = state.rewards.filter((reward) => {
    if (selectedCategory === 'ทั้งหมด') return true;
    return merchantOf(reward)?.category === selectedCategory;
  });

  const selectedReward = selectedRewardId ? state.rewards.find((r) => r.id === selectedRewardId) ?? null : null;
  // โค้ดคูปองมาจาก reducer โดยตรง (couponCode() ใน AppContext.tsx) — ห้ามสุ่มเองซ้ำในนี้
  const redeemedCode = selectedRewardId
    ? state.redeemed.find((r) => r.rewardId === selectedRewardId)?.code ?? null
    : null;

  const closeModal = () => setSelectedRewardId(null);

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Reward Points Banner */}
      <div className="relative bg-[#006a3a] p-6 rounded-2xl border-2 border-[#14241C] hard-shadow overflow-hidden">
        {/* Background Token Watermark */}
        <div className="absolute top-[-10%] right-[-10%] opacity-20 transform rotate-12 pointer-events-none">
          <span className="material-symbols-outlined text-[130px] text-white">token</span>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-lg text-4xl text-[#FFD84D] drop-shadow-[2px_2px_0px_#14241C]">
                {state.user.coins}
              </span>
              <div className="bg-[#FFD84D] border-2 border-[#14241C] px-2.5 py-0.5 rounded-full rotate-[-4deg] hard-shadow">
                <span className="font-label-md text-xs text-[#14241C] uppercase font-bold">Coins</span>
              </div>
            </div>
            <p className="font-handwritten-sm text-white mt-1 text-sm font-semibold">
              coin ของคุณ
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 p-2.5 rounded-xl max-w-[140px]">
            <p className="font-label-md text-xs text-white leading-tight">
              วิ่ง 1 กม. ได้<br />
              <span className="text-[#FFD84D] font-bold text-sm">{COIN_PER_KM} coin</span>
            </p>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const label = cat === 'ทั้งหมด' ? 'ทั้งหมด' : CATEGORY_LABEL[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-none border-2 border-[#14241C] px-4 py-2 rounded-full font-label-md text-sm transition-all ${
                isActive
                  ? 'bg-[#FFD84D] text-[#14241C] hard-shadow font-bold'
                  : 'bg-white text-[#14241C] hover:bg-[#FFD84D]/40'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Rewards Cards List */}
      <div className="flex flex-col gap-4">
        {filteredRewards.map((reward) => {
          const merchant = merchantOf(reward);
          const canAfford = state.user.coins >= reward.coinCost;
          const lowStock = reward.stock > 0 && reward.stock <= 10;

          return (
            <div
              key={reward.id}
              className="relative bg-white border-2 border-[#14241C] rounded-2xl p-4 hard-shadow flex gap-4 transition-transform hover:scale-[1.01]"
            >
              {/* Product Image Sticker */}
              <div className="relative flex-none w-24 h-24">
                <img
                  alt={reward.title}
                  src={MERCHANT_ART[reward.merchantId]}
                  className="w-full h-full object-cover rounded-lg border-[4px] border-white ring-2 ring-[#14241C] rotate-[-2deg]"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <h3 className="font-headline-md text-lg text-[#14241C] truncate font-bold">
                    {reward.title}
                  </h3>
                  {merchant && (
              <p className="font-label-md text-xs text-ink-soft">📍 {merchant.district}</p>
                  )}
                  <p className="font-body-md text-sm text-[#14241C] mt-1 line-clamp-2">
                    {merchant?.blurb}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#FFD84D] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      token
                    </span>
                    <span className="font-headline-md text-base text-[#14241C] font-bold">
                      {reward.coinCost}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedRewardId(reward.id)}
                    disabled={!canAfford}
                    className={`px-4 py-1.5 rounded-full border-2 border-[#14241C] font-label-md text-sm font-bold transition-all ${
                      canAfford
                        ? 'bg-[#006a3a] text-white hard-shadow active:translate-y-[2px] active:shadow-none hover:bg-[#00864b]'
                        : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'แลก' : 'Coin ไม่พอ'}
                  </button>
                </div>
              </div>

              {/* Handwritten Signature Annotation Badge — โชว์เฉพาะของใกล้หมดจริง (stock จาก state) */}
              {lowStock && (
                <div className="absolute top-[-10px] right-3 flex flex-col items-center pointer-events-none">
                  <span className="font-handwritten-sm text-[#ba1a1a] bg-white px-2 py-0.5 rotate-[5deg] border-2 border-[#ba1a1a] rounded text-xs font-bold hard-shadow-sm">
                    เหลือ {reward.stock} ชิ้น!
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Redeem Modal Dialog */}
      {selectedReward && (
        <div className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#14241C] hard-shadow-lg rounded-2xl p-6 w-full max-w-sm relative animate-in fade-in zoom-in-95">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-[#14241C] bg-[#FFD84D] flex items-center justify-center font-bold"
            >
              ✕
            </button>

            {!redeemedCode ? (
              <div className="flex flex-col items-center text-center">
                <img
                  src={MERCHANT_ART[selectedReward.merchantId]}
                  alt={selectedReward.title}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-[#14241C] hard-shadow mb-3 rotate-[-2deg]"
                />
                <h3 className="font-headline-md text-xl text-[#14241C] mb-1">
                  {selectedReward.title}
                </h3>
                <p className="font-body-md text-sm text-ink-soft mb-4">
                  {merchantOf(selectedReward)?.blurb}
                </p>

                <div className="flex items-center gap-2 bg-[#FFD84D] border-2 border-[#14241C] px-4 py-2 rounded-full mb-6 hard-shadow">
                  <span className="font-label-md text-sm">ใช้ {selectedReward.coinCost} Coins</span>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-full border-2 border-[#14241C] font-headline-md text-sm bg-white hover:bg-gray-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'REDEEM', rewardId: selectedReward.id })}
                    className="flex-1 py-2.5 rounded-full border-2 border-[#14241C] font-headline-md text-sm bg-[#006a3a] text-white hard-shadow hover:bg-[#00864b]"
                  >
                    ยืนยันแลก
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#80fbac] border-2 border-[#14241C] flex items-center justify-center mb-3 hard-shadow text-3xl">
                  🎉
                </div>
                <h3 className="font-headline-md text-xl text-[#14241C] mb-1">แลกรับสำเร็จแล้ว!</h3>
                <p className="font-body-md text-xs text-ink-soft mb-4">
                  แสดงรหัสคูปองนี้ให้พนักงานหน้าร้าน {selectedReward.title}
                </p>

                <div className="bg-[#FFD84D] border-2 border-[#14241C] p-4 rounded-xl w-full mb-4 hard-shadow">
                  <span className="font-mono text-2xl font-bold tracking-widest text-[#14241C]">
                    {redeemedCode}
                  </span>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full py-3 rounded-full border-2 border-[#14241C] bg-[#006a3a] text-white font-headline-md text-base hard-shadow"
                >
                  เรียบร้อย
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
