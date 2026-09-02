'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarById } from '@/lib/avatars';

interface RecapPlayer {
  userId: string;
  username: string;
  avatarId: string;
  nameColor: string;
  position: number;
  coins: number;
  positionDelta: number; // tiles moved this round
  coinsDelta: number;    // coins gained this round
}

interface RoundRecapProps {
  round: number;
  players: RecapPlayer[];
  onDismiss: () => void;
}

export default function RoundRecap({ round, players, onDismiss }: RoundRecapProps) {
  const sorted = [...players].sort((a, b) => b.position - a.position);
  const mvp = [...players].sort((a, b) => b.positionDelta - a.positionDelta)[0];
  const coinWinner = [...players].sort((a, b) => b.coinsDelta - a.coinsDelta)[0];
  const nextRound = (round + 1) * 4;

  return (
    <AnimatePresence>
      <motion.div
        key={`recap-${round}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] flex items-center justify-center pointer-events-auto"
        onClick={onDismiss}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 18 }}
          className="relative z-10 w-full max-w-sm mx-4 bg-stone-950/95 border border-amber-700/40 rounded-3xl p-6 space-y-4 shadow-2xl shadow-amber-900/30"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600/70">⚜ End of Round {round} ⚜</p>
            <h2 className="text-xl font-black text-[#f5f0e8]">Round Summary</h2>
          </div>

          {/* Player standings */}
          <div className="space-y-2">
            {sorted.map((p, i) => {
              const rankEmoji = ['🥇','🥈','🥉','4️⃣'][i] ?? `#${i+1}`;
              return (
                <motion.div
                  key={p.userId}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-800/40 bg-stone-900/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base w-6 text-center">{rankEmoji}</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-700">
                      {getAvatarById(p.avatarId).render('w-full h-full object-cover')}
                    </div>
                    <div>
                      <p className="text-xs font-black leading-tight" style={{ color: p.nameColor }}>{p.username}</p>
                      <p className="text-[9px] text-stone-500">Tile {p.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    {p.positionDelta > 0 && (
                      <span className="text-[10px] font-black text-emerald-400">+{p.positionDelta} tiles</span>
                    )}
                    {p.coinsDelta > 0 && (
                      <span className="text-[10px] font-black text-amber-400">+{p.coinsDelta}g</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* MVP highlight — who advanced most */}
          {mvp && mvp.positionDelta > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/30 border border-amber-800/30">
              <span className="text-lg">🚀</span>
              <p className="text-[10px] text-amber-300 font-black">
                Most Advanced: <span style={{ color: mvp.nameColor }}>{mvp.username}</span>
                <span className="text-stone-400 font-normal"> — moved {mvp.positionDelta} tiles</span>
              </p>
            </div>
          )}

          {/* Coin winner highlight — who won most coins */}
          {coinWinner && coinWinner.coinsDelta > 0 && (!mvp || coinWinner.userId !== mvp.userId) && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-800/30">
              <span className="text-lg">💰</span>
              <p className="text-[10px] text-emerald-300 font-black">
                Richest Haul: <span style={{ color: coinWinner.nameColor }}>{coinWinner.username}</span>
                <span className="text-stone-400 font-normal"> — earned +{coinWinner.coinsDelta}g</span>
              </p>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black uppercase text-xs tracking-widest transition-all active:scale-95"
          >
            Continue the Quest →
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
