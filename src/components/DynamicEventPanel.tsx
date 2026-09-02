'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Flame, Star, Coins, Shuffle, Shield, Zap, X } from 'lucide-react';

interface DynamicEventPanelProps {
  eventName: string;
  roundsLeft: number;
  onDismiss?: () => void;
}

export default function DynamicEventPanel({ eventName, roundsLeft, onDismiss }: DynamicEventPanelProps) {
  const [pulseWarning, setPulseWarning] = useState(false);

  useEffect(() => {
    setPulseWarning(roundsLeft <= 1);
  }, [roundsLeft]);

  const getEventMeta = () => {
    switch (eventName) {
      case 'Treasure Rush':
        return {
          desc: 'Royal Treasury tiles grant double rewards for all heroes!',
          icon: <Coins className="w-5 h-5 text-amber-400 animate-bounce" />,
          border: 'border-amber-800/40 bg-amber-950/20 text-amber-300',
          emoji: '💰',
          barColor: 'bg-amber-400',
          glowColor: 'rgba(251,191,36,0.3)',
        };
      case 'Reverse Movement':
        return {
          desc: 'Ancient winds reverse — dice rolls move heroes backwards this round!',
          icon: <Shuffle className="w-5 h-5 text-rose-400 animate-spin" />,
          border: 'border-rose-800/40 bg-rose-950/20 text-rose-300',
          emoji: '🌀',
          barColor: 'bg-rose-400',
          glowColor: 'rgba(244,63,94,0.3)',
        };
      case 'Lucky Hour':
        return {
          desc: "The King's blessing — +1 bonus movement on all correct answers!",
          icon: <Star className="w-5 h-5 text-yellow-400 animate-pulse" />,
          border: 'border-yellow-800/40 bg-yellow-950/20 text-yellow-300',
          emoji: '⭐',
          barColor: 'bg-yellow-400',
          glowColor: 'rgba(234,179,8,0.3)',
        };
      case 'Chaos Mode':
        return {
          desc: 'The Chaos Rune erupts — dice results are randomized between players!',
          icon: <Shuffle className="w-5 h-5 text-purple-400" />,
          border: 'border-purple-800/40 bg-purple-950/20 text-purple-300',
          emoji: '🌑',
          barColor: 'bg-purple-400',
          glowColor: 'rgba(168,85,247,0.3)',
        };
      case 'Coin Frenzy':
        return {
          desc: 'The Vault of Historia overflows — 3x coin rewards for correct answers!',
          icon: <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />,
          border: 'border-emerald-800/40 bg-emerald-950/20 text-emerald-300',
          emoji: '👑',
          barColor: 'bg-emerald-400',
          glowColor: 'rgba(52,211,153,0.3)',
        };
      case 'Sudden Death':
        return {
          desc: "The Dragon's Curse — wrong answers send you BACK TO TILE 0!",
          icon: <Flame className="w-5 h-5 text-red-500 animate-pulse" />,
          border: 'border-red-800/40 bg-red-950/20 text-red-300',
          emoji: '☠️',
          barColor: 'bg-red-500',
          glowColor: 'rgba(239,68,68,0.4)',
        };
      default:
        return {
          desc: 'A mysterious royal decree alters the board of Historia.',
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          border: 'border-amber-800/40 bg-amber-950/15 text-amber-300',
          emoji: '📜',
          barColor: 'bg-amber-400',
          glowColor: 'rgba(251,191,36,0.2)',
        };
    }
  };

  const meta = getEventMeta();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border rounded-2xl flex flex-col gap-2 ${meta.border} shadow-lg shadow-black/30 relative overflow-hidden`}
    >
      {/* Pulsing glow when event is about to end */}
      {pulseWarning && (
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ boxShadow: `inset 0 0 20px ${meta.glowColor}` }}
        />
      )}

      {/* Dismiss button — hide the decree banner */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss global event"
          className="absolute top-2 right-2 z-20 p-1 rounded-md text-stone-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center justify-between gap-4 relative z-10">
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
          <motion.span
            key={roundsLeft}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={`text-sm font-black tracking-widest ${pulseWarning ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}
          >
            {roundsLeft}
          </motion.span>
        </div>
      </div>

      {/* Event timer bar — visual countdown across rounds */}
      <div className="w-full h-1.5 bg-stone-800/80 rounded-full overflow-hidden relative z-10">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${(roundsLeft / 2) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full transition-colors duration-500 ${meta.barColor} ${
            pulseWarning ? 'animate-pulse' : ''
          }`}
          style={{
            boxShadow: `0 0 8px ${meta.glowColor}`,
          }}
        />
      </div>
    </motion.div>
  );
}
