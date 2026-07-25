import React, { useState } from 'react';
import { ShopReward } from '../types';
import { SHOP_REWARDS } from '../data/mockData';

interface ShopTabProps {
  coins: number;
  onRedeemReward: (reward: ShopReward) => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({ coins, onRedeemReward }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<ShopReward | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  const categories = ['ทั้งหมด', 'อุปกรณ์', 'อาหาร', 'สุขภาพ', 'งานวิ่ง'];

  const filteredRewards = SHOP_REWARDS.filter((reward) => {
    if (selectedCategory === 'ทั้งหมด') return true;
    return reward.category === selectedCategory;
  });

  const handleConfirmRedeem = (reward: ShopReward) => {
    if (coins < reward.coinsCost) return;
    const code = `RT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRedeemedCode(code);
    onRedeemReward(reward);
  };

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
                {coins}
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
              <span className="text-[#FFD84D] font-bold text-sm">15 coin</span>
            </p>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
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
              {cat}
            </button>
          );
        })}
      </div>

      {/* Rewards Cards List */}
      <div className="flex flex-col gap-4">
        {filteredRewards.map((reward) => {
          const canAfford = coins >= reward.coinsCost;

          return (
            <div
              key={reward.id}
              className="relative bg-white border-2 border-[#14241C] rounded-2xl p-4 hard-shadow flex gap-4 transition-transform hover:scale-[1.01]"
            >
              {/* Product Image Sticker */}
              <div className="relative flex-none w-24 h-24">
                <img
                  alt={reward.title}
                  src={reward.image}
                  className="w-full h-full object-cover rounded-lg border-[4px] border-white ring-2 ring-[#14241C] rotate-[-2deg]"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <h3 className="font-headline-md text-lg text-[#14241C] truncate font-bold">
                    {reward.title}
                  </h3>
                  {reward.location && (
                    <p className="font-label-md text-xs text-[#3d4a40]">📍 {reward.location}</p>
                  )}
                  <p className="font-body-md text-sm text-[#14241C] mt-1 line-clamp-2">
                    {reward.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#FFD84D] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      token
                    </span>
                    <span className="font-headline-md text-base text-[#14241C] font-bold">
                      {reward.coinsCost}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedRewardToRedeem(reward)}
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

              {/* Handwritten Signature Annotation Badge */}
              {reward.annotation && (
                <div className="absolute top-[-10px] right-3 flex flex-col items-center pointer-events-none">
                  <span className="font-handwritten-sm text-[#ba1a1a] bg-white px-2 py-0.5 rotate-[5deg] border-2 border-[#ba1a1a] rounded text-xs font-bold hard-shadow-sm">
                    {reward.annotation}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Redeem Modal Dialog */}
      {selectedRewardToRedeem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#14241C] hard-shadow-lg rounded-2xl p-6 w-full max-w-sm relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setSelectedRewardToRedeem(null);
                setRedeemedCode(null);
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-[#14241C] bg-[#FFD84D] flex items-center justify-center font-bold"
            >
              ✕
            </button>

            {!redeemedCode ? (
              <div className="flex flex-col items-center text-center">
                <img
                  src={selectedRewardToRedeem.image}
                  alt={selectedRewardToRedeem.title}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-[#14241C] hard-shadow mb-3 rotate-[-2deg]"
                />
                <h3 className="font-headline-md text-xl text-[#14241C] mb-1">
                  {selectedRewardToRedeem.title}
                </h3>
                <p className="font-body-md text-sm text-[#3d4a40] mb-4">
                  {selectedRewardToRedeem.description}
                </p>

                <div className="flex items-center gap-2 bg-[#FFD84D] border-2 border-[#14241C] px-4 py-2 rounded-full mb-6 hard-shadow">
                  <span className="font-label-md text-sm">ใช้ {selectedRewardToRedeem.coinsCost} Coins</span>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setSelectedRewardToRedeem(null)}
                    className="flex-1 py-2.5 rounded-full border-2 border-[#14241C] font-headline-md text-sm bg-white hover:bg-gray-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => handleConfirmRedeem(selectedRewardToRedeem)}
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
                <p className="font-body-md text-xs text-[#3d4a40] mb-4">
                  แสดงรหัสคูปองนี้ให้พนักงานหน้าร้าน {selectedRewardToRedeem.title}
                </p>

                <div className="bg-[#FFD84D] border-2 border-[#14241C] p-4 rounded-xl w-full mb-4 hard-shadow">
                  <span className="font-mono text-2xl font-bold tracking-widest text-[#14241C]">
                    {redeemedCode}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedRewardToRedeem(null);
                    setRedeemedCode(null);
                  }}
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
