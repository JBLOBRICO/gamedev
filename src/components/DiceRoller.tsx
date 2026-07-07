'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/sounds';

interface DiceRollerProps {
  onRoll: () => void;
  disabled: boolean;
  luckyDiceActive?: boolean;
}

export default function DiceRoller({ onRoll, disabled, luckyDiceActive = false }: DiceRollerProps) {
  const [rolling, setRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState(1);

  const handleRoll = () => {
    if (disabled || rolling) return;

    setRolling(true);
    sounds.playDiceRoll();

    // Animate dice faces cycling
    let ticks = 0;
    const interval = setInterval(() => {
      setCurrentFace(Math.floor(1 + Math.random() * 6));
      ticks++;
      if (ticks > 8) {
        clearInterval(interval);
        
        // Final roll trigger
        onRoll();
        sounds.playDiceLand();
        setRolling(false);
      }
    }, 100);
  };

  const renderDiceFace = (face: number) => {
    const dotsMap: { [key: number]: number[] } = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };

    const activeDots = dotsMap[face] || [4];

    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-950 border-2 border-amber-600/60 rounded-2xl grid grid-cols-3 p-3.5 gap-2 relative shadow-lg shadow-amber-900/20">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {activeDots.includes(idx) && (
              <motion.div 
                layoutId={`dot_${idx}`}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-500/60" 
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
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

      {/* Dice face */}
      <motion.div
        animate={rolling ? {
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, 180, 360, 540],
          scale: [1, 1.15, 1],
        } : {}}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="cursor-pointer"
        onClick={handleRoll}
      >
        {renderDiceFace(currentFace)}
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
  );
}
