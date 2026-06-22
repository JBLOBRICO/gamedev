'use client';

import React from 'react';
import { ShoppingCart, Shield, Hourglass, Dices, Coins, Zap } from 'lucide-react';
import { sounds } from '@/lib/sounds';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  activeKey?: string; // player field that shows if already active
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shield',
    name: 'Shield',
    description: 'Blocks the next trap or negative tile effect.',
    cost: 20,
    icon: <Shield className="w-5 h-5 text-sky-400" />,
    activeKey: 'shieldActive',
  },
  {
    id: 'extra_time',
    name: 'Extra Time',
    description: 'Adds +15 seconds to answer your next trivia question.',
    cost: 10,
    icon: <Hourglass className="w-5 h-5 text-cyan-400" />,
    activeKey: 'extraTimeActive',
  },
  {
    id: 'lucky_dice',
    name: 'Lucky Dice',
    description: 'Guarantees your next dice roll is a 5 or 6.',
    cost: 20,
    icon: <Dices className="w-5 h-5 text-amber-400" />,
    activeKey: 'luckyDiceActive',
  },
  {
    id: 'trap_immunity',
    name: 'Trap Immunity',
    description: 'Passively blocks the next trap tile you land on.',
    cost: 18,
    icon: <Shield className="w-5 h-5 text-indigo-400" />,
    activeKey: 'trapImmunity',
  },
  {
    id: 'multiplier',
    name: 'Coin Multiplier',
    description: 'Doubles all coins rewarded on your next correct answer.',
    cost: 15,
    icon: <Coins className="w-5 h-5 text-yellow-400" />,
    activeKey: 'doubleCoinsActive',
  },
];

interface ItemShopProps {
  playerCoins: number;
  onBuyItem: (itemId: string, cost: number) => void;
  /** disabled is used only to show a loading state; shop is open anytime */
  disabled?: boolean;
  /** Active item flags from the player object */
  activeItems?: {
    shieldActive?: boolean;
    extraTimeActive?: boolean;
    luckyDiceActive?: boolean;
    trapImmunity?: boolean;
    doubleCoinsActive?: boolean;
  };
}

export default function ItemShop({
  playerCoins,
  onBuyItem,
  disabled = false,
  activeItems = {},
}: ItemShopProps) {

  const handleBuy = (item: ShopItem) => {
    if (disabled || playerCoins < item.cost) return;
    sounds.playCoin();
    onBuyItem(item.id, item.cost);
  };

  return (
    <div className="w-full p-5 border border-slate-800 glass-panel rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <ShoppingCart className="w-4 h-4 text-sky-400" />
          Item Shop
        </h3>
        <span className="text-xs font-black text-yellow-400 flex items-center gap-1 bg-yellow-950/40 border border-yellow-900/40 px-3 py-1 rounded-xl">
          <Coins className="w-3.5 h-3.5" /> {playerCoins}g
        </span>
      </div>

      <p className="text-[10px] text-slate-500 -mt-1">
        Shop is open anytime — items apply on your next turn.
      </p>

      <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
        {SHOP_ITEMS.map((item) => {
          const canAfford = playerCoins >= item.cost;
          const isActive = item.activeKey
            ? !!(activeItems as Record<string, boolean>)[item.activeKey]
            : false;

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all gap-3 ${
                isActive
                  ? 'border-emerald-700/50 bg-emerald-950/20'
                  : 'border-slate-800/80 bg-slate-900/10 hover:border-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
                  {item.icon}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-slate-200 leading-tight">
                      {item.name}
                    </span>
                    {isActive && (
                      <span className="text-[8px] font-black uppercase bg-emerald-900/60 border border-emerald-700/40 text-emerald-400 px-1.5 py-0.5 rounded-full leading-none">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="block text-[10px] text-slate-500 leading-snug mt-0.5">
                    {item.description}
                  </span>
                </div>
              </div>

              <button
                disabled={disabled || !canAfford}
                onClick={() => handleBuy(item)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                  canAfford && !disabled
                    ? 'bg-sky-500 hover:bg-sky-600 text-slate-950'
                    : 'bg-slate-800 text-slate-500 border border-slate-800/40 cursor-not-allowed'
                }`}
              >
                {item.cost}g
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
