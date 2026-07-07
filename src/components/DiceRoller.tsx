'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/sounds';

interface DiceRollerProps {
  onRoll: () => void;
  disabled: boolean;
  luckyDiceActive?: boolean;
  lastRollValue?: number | null;
}

const DOTS_MAP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const ROLL_FLAVOR: Record<number, string> = {
  1: 'The dice mocks you…',
  2: 'A stumble forward.',
  3: 'Steady progress.',
  4: 'A worthy advance!',
  5: 'Fortune smiles upon you!',
  6: '⚡ LEGENDARY ROLL! ⚡',
};

function DiceFace({ face, size = 'md' }: { face: number; size?: 'sm' | 'md' | 'lg' }) {
  const activeDots = DOTS_MAP[face] || [4];
  const sizeClass = size === 'lg'
    ? 'w-24 h-24 p-4 gap-2.5'
    : size === 'sm'
    ? 'w-12 h-12 p-2.5 gap-1.5'
    : 'w-16 h-16 sm:w-20 sm:h-20 p-3.5 gap-2';
  const dotClass = size === 'lg'
    ? 'w-4 h-4'
    : size === 'sm'
    ? 'w-2 h-2'
    : 'w-2.5 h-2.5 sm:w-3 sm:h-3';

  return (
    <div className={`bg-stone-950 border-2 border-amber-600/60 rounded-2xl grid grid-cols-3 relative shadow-lg shadow-amber-900/20 ${sizeClass}`}>
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {activeDots.includes(idx) && (
            <div className={`rounded-full bg-amber-400 shadow-sm shadow-amber-500/60 ${dotClass}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DiceRoller({ onRoll, disabled, luckyDiceActive = false, lastRollValue }: DiceRollerProps) {
  const [rolling, setRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState(1);
  const [showReveal, setShowReveal] = useState(false);
  const [revealValue, setRevealValue] = useState<number | null>(null);

  const handleRoll = () => {
    if (disabled || rolling) return;
    setRolling(true);
    setShowReveal(false);
    sounds.playDiceRoll();

    let ticks = 0;
    const interval = setInterval(() => {
      setCurrentFace(Math.floor(1 + Math.random() * 6));
      ticks++;
      if (ticks > 8) {
        clearInterval(interval);
        onRoll();
        sounds.playDiceLand();
        setRolling(false);
      }
    }, 100);
  };

  // When the server comes back with a roll value, show the big reveal
  React.useEffect(() => {
    if (lastRollValue != null && lastRollValue > 0) {
      setRevealValue(lastRollValue);
      setShowReveal(true);
      sounds.playDiceReveal(lastRollValue);
      const t = setTimeout(() => setShowReveal(false), 2200);
      return () => clearTimeout(t);
    }
  }, [lastRollValue]);

  return (
    <>
      {/* ── Big Dice Reveal Overlay ── */}
      <AnimatePresence>
        {showReveal && revealValue != null && (
          <motion.div
            key="dice-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 220 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Glow ring */}
              <div className={`absolute rounded-full blur-2xl opacity-60 w-40 h-40 ${
                revealValue === 6 ? 'bg-amber-400' : revealValue >= 4 ? 'bg-emerald-500' : 'bg-stone-600'
              }`} />
              <DiceFace face={revealValue} size="lg" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className={`text-4xl font-black drop-shadow-lg ${
                  revealValue === 6 ? 'text-amber-300' : revealValue >= 4 ? 'text-emerald-300' : 'text-stone-300'
                }`}>
                  {revealValue}
                </div>
                <div className="text-sm font-bold text-stone-400 mt-1 italic">
                  {ROLL_FLAVOR[revealValue]}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dice Roller UI ── */}
      <div className="flex flex-col items-center justify-center p-6 border border-amber-900/30 glass-panel rounded-2xl space-y-4 max-w-xs mx-auto bg-gradient-to-b from-stone-950/40 to-transparent">
        <div className="flex items-center justify-between w-full">
          <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">
            ⚔️ Roll the Ancient Dice
          </span>
          {luckyDiceActive && (
            <span className="flex items-center gap-1 text-[9px] text-amber-400 font-black uppercase bg-amber-950/35 border border-amber-800/40 px-2 py-0.5 rounded-full animate-bounce">
              <Sparkles className="w-3 h-3" /> Blessed Dice
            </span>
          )}
        </div>

        {/* Animated dice */}
        <motion.div
          animate={rolling ? {
            y: [0, -40, 0, -20, 0, -10, 0],
            rotateX: [0, 360, 720, 1080],
            rotateY: [0, 180, 360, 540],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="cursor-pointer"
          onClick={handleRoll}
        >
          <DiceFace face={currentFace} />
        </motion.div>

        <button
          disabled={disabled || rolling}
          onClick={handleRoll}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-lg shadow-amber-900/30"
        >
          <Dices className="w-5 h-5" />
          {rolling ? 'Rolling…' : 'Cast the Dice!'}
        </button>
      </div>
    </>
  );
}
