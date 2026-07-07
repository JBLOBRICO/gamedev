'use client';

import React from 'react';
import { AlertCircle, Flame, Star, Coins, Shuffle } from 'lucide-react';

interface DynamicEventPanelProps {
  eventName: string;
  roundsLeft: number;
}

export default function DynamicEventPanel({ eventName, roundsLeft }: DynamicEventPanelProps) {
  
  const getEventMeta = () => {
    switch (eventName) {
      case 'Treasure Rush':
        return {
          desc: 'Royal Treasury tiles grant double rewards for all heroes!',
          icon: <Coins className="w-5 h-5 text-amber-400 animate-bounce" />,
          border: 'border-amber-800/40 bg-amber-950/20 text-amber-300',
          emoji: '💰',
        };
      case 'Reverse Movement':
        return {
          desc: 'Ancient winds reverse — dice rolls move heroes backwards this round!',
          icon: <Shuffle className="w-5 h-5 text-rose-400 animate-spin" />,
          border: 'border-rose-800/40 bg-rose-950/20 text-rose-300',
          emoji: '🌀',
        };
      case 'Lucky Hour':
        return {
          desc: "The King's blessing falls upon Historia — trials grow easier and yield more gold!",
          icon: <Star className="w-5 h-5 text-yellow-400 animate-pulse" />,
          border: 'border-yellow-800/40 bg-yellow-950/20 text-yellow-300',
          emoji: '⭐',
        };
      case 'Chaos Mode':
        return {
          desc: 'The Chaos Rune erupts — all board tiles have randomised outcomes!',
          icon: <Shuffle className="w-5 h-5 text-purple-400" />,
          border: 'border-purple-800/40 bg-purple-950/20 text-purple-300',
          emoji: '🌑',
        };
      case 'Coin Frenzy':
        return {
          desc: 'The Vault of Historia overflows — earn 5 extra Royal Gold for every correct answer!',
          icon: <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />,
          border: 'border-emerald-800/40 bg-emerald-950/20 text-emerald-300',
          emoji: '👑',
        };
      case 'Sudden Death':
        return {
          desc: "The Dragon's Curse descends — Cursed Runes deal double penalties!",
          icon: <Flame className="w-5 h-5 text-red-500 animate-pulse" />,
          border: 'border-red-800/40 bg-red-950/20 text-red-300',
          emoji: '🔥',
        };
      default:
        return {
          desc: 'A mysterious royal decree alters the board of Historia.',
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          border: 'border-amber-800/40 bg-amber-950/15 text-amber-300',
          emoji: '📜',
        };
    }
  };

  const meta = getEventMeta();

  return (
    <div className={`p-4 border rounded-2xl flex items-center justify-between gap-4 ${meta.border} shadow-lg shadow-black/30`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800/50 shrink-0 relative">
          {meta.icon}
          <span className="absolute -top-1 -right-1 text-sm">{meta.emoji}</span>
        </div>
        <div className="text-left">
          <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/70 mb-0.5">
            ⚜ Royal Decree Active
          </span>
          <span className="block text-xs font-black uppercase tracking-wide">
            {eventName}
          </span>
          <span className="block text-[9px] text-stone-400 leading-tight mt-0.5">
            {meta.desc}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="block text-[8px] text-stone-500 font-black uppercase tracking-wider">Rounds Left</span>
        <span className="text-sm font-black tracking-widest text-amber-400">{roundsLeft}</span>
      </div>
    </div>
  );
}
