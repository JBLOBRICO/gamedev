'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';

interface EventPopupProps {
  eventName: string | null;
  onDismiss: () => void;
}

const EVENT_META: Record<string, {
  emoji: string;
  color: string;
  border: string;
  glow: string;
  flash: string;
  effect: string;
  particles: string[];
}> = {
  'Treasure Rush': {
    emoji: '💰',
    color: 'text-amber-300',
    border: 'border-amber-500/60',
    glow: 'shadow-[0_0_80px_rgba(251,191,36,0.5)]',
    flash: 'bg-amber-400/30',
    effect: 'All coin tiles grant DOUBLE rewards for 2 rounds!',
    particles: ['🪙', '💰', '✨', '⭐'],
  },
  'Reverse Movement': {
    emoji: '🌀',
    color: 'text-rose-300',
    border: 'border-rose-500/60',
    glow: 'shadow-[0_0_80px_rgba(244,63,94,0.5)]',
    flash: 'bg-rose-400/30',
    effect: 'Dice rolls move heroes BACKWARDS! The winds have turned!',
    particles: ['🌪️', '💨', '↩️', '🌀'],
  },
  'Lucky Hour': {
    emoji: '⭐',
    color: 'text-yellow-300',
    border: 'border-yellow-500/60',
    glow: 'shadow-[0_0_80px_rgba(234,179,8,0.5)]',
    flash: 'bg-yellow-400/30',
    effect: '+1 bonus movement on correct answers! Fortune smiles!',
    particles: ['⭐', '🌟', '✨', '💫'],
  },
  'Chaos Mode': {
    emoji: '🌑',
    color: 'text-purple-300',
    border: 'border-purple-500/60',
    glow: 'shadow-[0_0_80px_rgba(168,85,247,0.5)]',
    flash: 'bg-purple-400/30',
    effect: 'Dice results are randomized! Nothing is certain!',
    particles: ['🎲', '🔮', '🌀', '💀'],
  },
  'Coin Frenzy': {
    emoji: '👑',
    color: 'text-emerald-300',
    border: 'border-emerald-500/60',
    glow: 'shadow-[0_0_80px_rgba(52,211,153,0.5)]',
    flash: 'bg-emerald-400/30',
    effect: '3x coin rewards for correct answers! The vault overflows!',
    particles: ['👑', '💰', '🪙', '💎'],
  },
  'Sudden Death': {
    emoji: '☠️',
    color: 'text-red-300',
    border: 'border-red-500/60',
    glow: 'shadow-[0_0_80px_rgba(239,68,68,0.6)]',
    flash: 'bg-red-400/30',
    effect: 'Wrong answer = back to tile 0! One mistake and it\'s over!',
    particles: ['☠️', '💀', '🔥', '⚡'],
  },
};

function FloatingParticle({ emoji, delay, startX }: { emoji: string; delay: number; startX: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, x: startX, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [-20, -80, -140, -200],
        scale: [0, 1.2, 1, 0.5],
        rotate: [0, 45, -45, 90],
      }}
      transition={{ duration: 2.5, delay, ease: 'easeOut' }}
      className="absolute text-2xl pointer-events-none z-20"
      style={{ left: `${startX}%` }}
    >
      {emoji}
    </motion.div>
  );
}

export default function EventPopup({ eventName, onDismiss }: EventPopupProps) {
  const meta = eventName ? EVENT_META[eventName] : null;
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (!eventName) return;
    setShowFlash(true);
    sounds.playTeleport();
    setTimeout(() => setShowFlash(false), 400);
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [eventName, onDismiss]);

  return (
    <AnimatePresence>
      {eventName && meta && (
        <motion.div
          key={eventName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
        >
          {/* Screen flash on event trigger */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`absolute inset-0 z-[160] ${meta.flash}`}
              />
            )}
          </AnimatePresence>

          {/* Dark backdrop with pulse */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.7, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Floating particles */}
          <div className="absolute inset-0 z-[155] overflow-hidden pointer-events-none">
            {meta.particles.map((emoji, i) => (
              <React.Fragment key={i}>
                <FloatingParticle emoji={emoji} delay={0.3 + i * 0.15} startX={15 + i * 20} />
                <FloatingParticle emoji={emoji} delay={0.8 + i * 0.1} startX={25 + i * 15} />
                <FloatingParticle emoji={emoji} delay={1.2 + i * 0.12} startX={10 + i * 22} />
              </React.Fragment>
            ))}
          </div>

          {/* Event card */}
          <motion.div
            initial={{ scale: 0.3, rotate: -12, opacity: 0, y: 40 }}
            animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0, y: -30 }}
            transition={{ type: 'spring', damping: 12, stiffness: 180 }}
            className={`relative z-[156] flex flex-col items-center gap-4 p-8 rounded-3xl border-2 bg-stone-950/95 backdrop-blur-xl text-center max-w-sm mx-4 ${meta.border} ${meta.glow}`}
          >
            {/* Triple pulse rings */}
            <div className={`absolute inset-0 rounded-3xl border-2 ${meta.border} animate-ping opacity-20`} />
            <div className={`absolute inset-[-8px] rounded-3xl border ${meta.border} animate-ping opacity-10`} style={{ animationDelay: '0.3s' }} />

            {/* Icon with dramatic animation */}
            <motion.div
              animate={{
                scale: [1, 1.4, 0.9, 1.2, 1],
                rotate: [0, -15, 15, -8, 0],
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl leading-none drop-shadow-2xl"
            >
              {meta.emoji}
            </motion.div>

            {/* Labels */}
            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500"
              >
                ⚜ Royal Decree ⚜
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                className={`text-3xl font-black uppercase tracking-wide ${meta.color}`}
              >
                {eventName}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-sm text-stone-300 font-bold leading-snug"
              >
                {meta.effect}
              </motion.p>
            </div>

            {/* Countdown bar */}
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4.5, ease: 'linear' }}
                className={`h-full rounded-full ${
                  meta.color.includes('amber') ? 'bg-gradient-to-r from-amber-500 to-amber-300' :
                  meta.color.includes('rose') ? 'bg-gradient-to-r from-rose-500 to-rose-300' :
                  meta.color.includes('yellow') ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' :
                  meta.color.includes('purple') ? 'bg-gradient-to-r from-purple-500 to-purple-300' :
                  meta.color.includes('emerald') ? 'bg-gradient-to-r from-emerald-500 to-emerald-300' :
                  'bg-gradient-to-r from-red-600 to-red-400'
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
