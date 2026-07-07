'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Shield, Hourglass, Dices, Coins, Package } from 'lucide-react';
import { sounds } from '@/lib/sounds';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  activeKey?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'shield',     name: '🛡️ Iron Shield',       description: 'Blocks the next Cursed Rune or negative tile effect.',               cost: 20, icon: <Shield  className="w-5 h-5 text-sky-400" />,    activeKey: 'shieldActive' },
  { id: 'extra_time', name: '⏳ Hourglass Relic',    description: 'Grants +15 seconds on your next ancient trial.',                     cost: 10, icon: <Hourglass className="w-5 h-5 text-cyan-400" />, activeKey: 'extraTimeActive' },
  { id: 'lucky_dice', name: '🎲 Blessed Dice',       description: 'Guarantees your next roll yields a 5 or 6.',                         cost: 20, icon: <Dices    className="w-5 h-5 text-amber-400" />,  activeKey: 'luckyDiceActive' },
  { id: 'trap_immunity', name: '🌑 Shadow Cloak',    description: 'Passively absorbs the next Cursed Rune you land on.',                cost: 18, icon: <Shield  className="w-5 h-5 text-indigo-400" />, activeKey: 'trapImmunity' },
  { id: 'multiplier', name: '💰 Royal Multiplier',   description: 'Doubles all Royal Gold on your next correct trial answer.',          cost: 15, icon: <Coins   className="w-5 h-5 text-yellow-400" />, activeKey: 'doubleCoinsActive' },
];

interface ItemShopProps {
  playerCoins: number;
  playerAvatarId?: string;
  onBuyItem: (itemId: string, cost: number) => void;
  disabled?: boolean;
  activeItems?: {
    shieldActive?: boolean;
    extraTimeActive?: boolean;
    luckyDiceActive?: boolean;
    trapImmunity?: boolean;
    doubleCoinsActive?: boolean;
  };
}

export default function ItemShop({ playerCoins, playerAvatarId, onBuyItem, disabled = false, activeItems = {} }: ItemShopProps) {
  const [justBought, setJustBought] = useState<string | null>(null);
  const [coinParticles, setCoinParticles] = useState<{ id: string; itemId: string }[]>([]);

  const handleBuy = (item: ShopItem, finalCost: number) => {
    if (disabled || playerCoins < finalCost) return;
    sounds.playCoin();
    onBuyItem(item.id, finalCost);

    // Flash animation
    setJustBought(item.id);
    setTimeout(() => setJustBought(null), 700);

    // Spawn coin particles
    const particles = Array.from({ length: 5 }, () => ({
      id: Math.random().toString(36).substring(2, 9),
      itemId: item.id,
    }));
    setCoinParticles(prev => [...prev, ...particles]);
    setTimeout(() => setCoinParticles(prev => prev.filter(cp => !particles.find(p => p.id === cp.id))), 900);
  };

  return (
    <div className="w-full p-5 border border-slate-800 glass-panel rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-stone-800/50 pb-3">
        <h3 className="text-xs font-black text-stone-300 flex items-center gap-1.5 uppercase tracking-wider">
          <ShoppingCart className="w-4 h-4 text-amber-600/60" />
          Merchant&apos;s Caravan
        </h3>
        <motion.span
          key={playerCoins}
          initial={{ scale: 1.3, color: '#fbbf24' }}
          animate={{ scale: 1, color: '#fbbf24' }}
          transition={{ duration: 0.3 }}
          className="text-xs font-black text-amber-400 flex items-center gap-1 bg-amber-950/30 border border-amber-900/35 px-3 py-1 rounded-xl"
        >
          <Coins className="w-3.5 h-3.5" /> {playerCoins} Gold
        </motion.span>
      </div>

      <p className="text-[9px] text-stone-600 italic -mt-1">
        &quot;Relics available at any time — they take effect on your next turn.&quot;
      </p>

      <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
        {SHOP_ITEMS.map((item) => {
          let finalCost = item.cost;
          if (playerAvatarId === 'avatar_6') finalCost = Math.ceil(item.cost * 0.9);

          const canAfford = playerCoins >= finalCost;
          const isActive = item.activeKey ? !!(activeItems as Record<string, boolean>)[item.activeKey] : false;
          const wasBought = justBought === item.id;

          return (
            <motion.div
              key={item.id}
              animate={wasBought ? { scale: [1, 1.04, 1], backgroundColor: ['rgba(0,0,0,0)', 'rgba(251,191,36,0.12)', 'rgba(0,0,0,0)'] } : {}}
              transition={{ duration: 0.5 }}
              className={`relative flex items-center justify-between p-3 rounded-xl border transition-all gap-3 overflow-hidden ${
                isActive
                  ? 'border-emerald-700/40 bg-emerald-950/15'
                  : 'border-stone-800/60 bg-stone-900/10 hover:border-stone-700/50'
              }`}
            >
              {/* Coin burst particles on buy */}
              <AnimatePresence>
                {coinParticles.filter(cp => cp.itemId === item.id).map(cp => (
                  <motion.div
                    key={cp.id}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: (Math.random() - 0.5) * 60,
                      y: -30 - Math.random() * 20,
                      scale: 0.5,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute right-10 top-1/2 text-amber-400 text-xs pointer-events-none z-10 font-black"
                  >
                    🪙
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-stone-950 border border-stone-800/50 rounded-lg shrink-0">
                  {item.icon}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-[#f5f0e8] leading-tight">{item.name}</span>
                    {isActive && (
                      <span className="text-[8px] font-black uppercase bg-emerald-900/50 border border-emerald-700/35 text-emerald-400 px-1.5 py-0.5 rounded-full leading-none">
                        ✓ Active
                      </span>
                    )}
                  </div>
                  <span className="block text-[9px] text-stone-500 leading-snug mt-0.5">{item.description}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={disabled || !canAfford}
                onClick={() => handleBuy(item, finalCost)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  canAfford && !disabled
                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md hover:shadow-amber-600/40'
                    : 'bg-stone-800 text-stone-500 border border-stone-800/30 cursor-not-allowed'
                }`}
              >
                {finalCost}g
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
