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
          desc: 'All chest tiles grant double rewards!',
          icon: <Coins className="w-5 h-5 text-amber-400 animate-bounce" />,
          border: 'border-amber-900/40 bg-amber-950/20 text-amber-300'
        };
      case 'Reverse Movement':
        return {
          desc: 'Dice rolls move players backwards for 1 round!',
          icon: <Shuffle className="w-5 h-5 text-rose-400 animate-spin" />,
          border: 'border-rose-900/40 bg-rose-950/20 text-rose-300'
        };
      case 'Lucky Hour':
        return {
          desc: 'Trivia questions are easier and yield more coins!',
          icon: <Star className="w-5 h-5 text-yellow-400 animate-pulse" />,
          border: 'border-yellow-900/40 bg-yellow-950/20 text-yellow-300'
        };
      case 'Chaos Mode':
        return {
          desc: 'All board tiles have randomized outcomes!',
          icon: <Shuffle className="w-5 h-5 text-purple-400" />,
          border: 'border-purple-900/40 bg-purple-950/20 text-purple-300'
        };
      case 'Coin Frenzy':
        return {
          desc: 'Get 5 coins for every correct answer, even out of turn!',
          icon: <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />,
          border: 'border-emerald-900/40 bg-emerald-950/20 text-emerald-300'
        };
      case 'Sudden Death':
        return {
          desc: 'Trap tiles do double damage and penalties!',
          icon: <Flame className="w-5 h-5 text-red-500 animate-pulse" />,
          border: 'border-red-900/40 bg-red-950/20 text-red-300'
        };
      default:
        return {
          desc: 'A mysterious event is altering the board path.',
          icon: <AlertCircle className="w-5 h-5 text-sky-400" />,
          border: 'border-sky-900/40 bg-sky-950/20 text-sky-300'
        };
    }
  };

  const meta = getEventMeta();

  return (
    <div className={`p-4 border rounded-2xl flex items-center justify-between gap-4 ${meta.border} shadow-lg shadow-black/30`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 shrink-0">
          {meta.icon}
        </div>
        <div className="text-left">
          <span className="block text-xs font-black uppercase tracking-wider">
            Active Event: {eventName}
          </span>
          <span className="block text-[10px] text-slate-400 leading-tight mt-0.5">
            {meta.desc}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Rounds Left</span>
        <span className="text-sm font-black tracking-widest">{roundsLeft}</span>
      </div>
    </div>
  );
}
