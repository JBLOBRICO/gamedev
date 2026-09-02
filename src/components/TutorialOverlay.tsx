'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: '👑',
    title: 'Welcome to Historia Legends!',
    body: 'Race across the sacred 50-tile board and be the first to reach the Crown of Wisdom to win. Along the way you will answer trivia, earn Royal Gold, and dodge traps.',
    accent: '#fbbf24',
  },
  {
    icon: '🛖',
    title: 'The Sacred Board',
    body: 'Each tile has its own effect — Traps steal your gold, Treasure tiles give rewards, Teleporters whisk you away, and Event tiles shake up the whole realm. Hover any tile to see its effect.',
    accent: '#fbbf24',
  },
  {
    icon: '🚩',
    title: 'Start & Finish',
    body: 'You begin at tile 0 (the green flag) and move in a snaking path. The crowned tile at position 49 is the Finish Line — reach it to claim victory!',
    accent: '#34d399',
  },
  {
    icon: '🎲',
    title: 'Your Turn',
    body: 'When the golden halo is on your chip and it says "Your Turn", press Roll the Dice. You must then answer a trivia question to move your full roll.',
    accent: '#fbbf24',
  },
  {
    icon: '⚔️',
    title: 'Trivia Trials',
    body: 'Answer correctly to advance the full distance. Wrong answers move you fewer tiles. Harder questions give bigger coin and XP rewards, plus a streak bonus.',
    accent: '#60a5fa',
  },
  {
    icon: '🎒',
    title: 'Items & Allies',
    body: 'Unlock the Item Shop and Hero Journal from the top bar. Items can shield you from traps, and your Hero has a unique passive that changes how you play.',
    accent: '#a3e635',
  },
  {
    icon: '🏆',
    title: 'Claim the Crown',
    body: 'First player to reach the Finish Line wins! Good luck, brave Hero — may the Crown of Wisdom be yours.',
    accent: '#fbbf24',
  },
];

function formatBody(body: string): React.ReactNode {
  return body;
}

export default function TutorialOverlay({ open, onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const total = STEPS.length;

  if (!open) return null;

  const s = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          className="w-full max-w-md rounded-3xl border border-amber-800/40 bg-gradient-to-b from-[#1a150c] to-[#0d0a05] p-6 shadow-2xl shadow-black/60 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(80% 50% at 50% 0%, rgba(251,191,36,0.35), transparent)' }} />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
            aria-label="Close tutorial"
          >
            <X className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="text-center mb-5">
                <div
                  className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: `${s.accent}1a`, border: `1px solid ${s.accent}55`, boxShadow: `0 0 20px ${s.accent}33` }}
                >
                  {s.icon}
                </div>
                <h3 className="text-xl font-black text-amber-200">{s.title}</h3>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed text-center">{formatBody(s.body)}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-amber-400' : 'w-1.5 bg-stone-700 hover:bg-stone-500'}`}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-5 gap-3">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-stone-300 bg-white/5 border border-stone-700/60 disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            {step < total - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black text-stone-950 bg-gradient-to-b from-amber-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-900/40 transition-all active:scale-95"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black text-stone-950 bg-gradient-to-b from-emerald-300 to-emerald-500 hover:brightness-110 shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" /> Begin Quest
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
