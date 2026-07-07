'use client';

import React, { useEffect, useState } from 'react';
import { Crown, RefreshCw, LogOut, Target, Zap, Flame } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';

interface MatchSummaryPlayer {
  username: string;
  avatarId: string;
  coinsEarned: number;
  xpEarned: number;
  correctAnswers: number;
  incorrectAnswers: number;
  longestStreak: number;
  rank: number;
}

interface MatchSummaryProps {
  mode: string;
  winnerUsername: string;
  roundCount: number;
  players: MatchSummaryPlayer[];
  onPlayAgain: () => void;
  onLeave: () => void;
}

const rankLabels = ['👑 Crowned Champion', '🥈 Royal Knight', '🥉 Valiant Scholar', '⚔️ Brave Apprentice'];
const rankColors = ['text-amber-400', 'text-slate-300', 'text-amber-600', 'text-stone-400'];
const rankBg = ['border-amber-700/50 bg-amber-950/25 shadow-lg shadow-amber-900/15', 'border-stone-700/50 bg-stone-900/10', 'border-stone-700/40 bg-stone-900/10', 'border-stone-800/30 bg-stone-950/5'];

export default function MatchSummary({ winnerUsername, roundCount, players, onPlayAgain, onLeave }: MatchSummaryProps) {
  const [revealed, setRevealed] = useState(false);
  const [activeTab, setActiveTab] = useState<'standings' | 'stats'>('standings');

  const sorted = [...players].sort((a, b) => a.rank - b.rank);
  const mvp = [...players].sort((a, b) => (b.coinsEarned + b.correctAnswers * 10) - (a.coinsEarned + a.correctAnswers * 10))[0];
  const totalQuestions = players.reduce((s, p) => s + p.correctAnswers + p.incorrectAnswers, 0);
  const maxCoins = Math.max(...players.map(p => p.coinsEarned), 1);

  useEffect(() => {
    sounds.playVictory();
    const end = Date.now() + 4000;
    const interval = setInterval(() => {
      if (Date.now() > end) { clearInterval(interval); return; }
      confetti({
        startVelocity: 35, spread: 360, ticks: 70,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#c9a84c', '#f5f0e8', '#8b1a1a', '#1e3a6e', '#0d4a2e', '#f5c842', '#fff'],
        shapes: ['circle', 'square'],
      });
    }, 200);
    setTimeout(() => setRevealed(true), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="relative p-6 sm:p-8 border border-amber-700/40 glass-panel rounded-3xl space-y-6 text-center overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-stone-950/30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute top-3 left-4 text-amber-700/40 text-sm">✦</div>
        <div className="absolute top-3 right-4 text-amber-700/40 text-sm">✦</div>

        {/* Victory Header */}
        <div className="relative space-y-4 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            className="relative mx-auto w-20 h-20 flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-900/40 to-stone-950/60 border-2 border-amber-600/50 flex items-center justify-center shadow-2xl shadow-amber-900/30">
              <Crown className="w-10 h-10 text-amber-400 crown-float" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="space-y-2"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-600/70">⚜ The Quest is Complete ⚜</p>
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
              VICTORY!
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-700/50" />
              <p className="text-sm text-stone-300">
                <span className="font-black text-amber-300 text-lg uppercase tracking-wider">{winnerUsername}</span>
                <span className="text-stone-400"> claimed the Crown of Wisdom</span>
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-700/50" />
            </div>
            <p className="text-[10px] text-stone-500 italic">
              &quot;{roundCount} ancient trials faced — the realm shall remember this day.&quot;
            </p>
          </motion.div>
        </div>

        {/* MVP Card */}
        {mvp && revealed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.9 }}
            className="relative z-10 max-w-sm mx-auto p-4 rounded-2xl border border-amber-800/40 bg-amber-950/20 flex items-center gap-4 text-left shadow-[0_0_40px_rgba(217,119,6,0.15)]"
          >
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-stone-950 border-2 border-amber-500/60 p-1 shadow-lg">
                {getAvatarById(mvp.avatarId).render('w-full h-full')}
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-stone-950 text-xs shadow-md animate-bounce">⭐</div>
            </div>
            <div>
              <span className="block text-[8px] font-black text-amber-400 uppercase tracking-[0.2em] bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-full mb-1 inline-block">
                🏅 Match MVP
              </span>
              <h3 className="text-lg font-black text-[#f5f0e8] leading-tight">{mvp.username}</h3>
              <p className="text-xs text-stone-400 mt-0.5">{mvp.coinsEarned}g · {mvp.correctAnswers} correct · {mvp.longestStreak} streak</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="relative z-10 flex gap-2 justify-center">
          {(['standings', 'stats'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-stone-900 border border-stone-800/50 text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab === 'standings' ? '⚔️ Standings' : '📊 Stats'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'standings' && (
            <motion.div
              key="standings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 space-y-2.5 max-w-xl mx-auto text-left"
            >
              {sorted.map((p, idx) => {
                const accuracy = p.correctAnswers + p.incorrectAnswers > 0
                  ? Math.round((p.correctAnswers / (p.correctAnswers + p.incorrectAnswers)) * 100) : 0;
                return (
                  <motion.div
                    key={p.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${rankBg[idx] ?? 'border-stone-800/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-black min-w-6 text-center ${rankColors[idx] ?? 'text-stone-500'}`}>
                        {rankLabels[idx]?.split(' ')[0] ?? `#${idx + 1}`}
                      </div>
                      <div className={`w-11 h-11 rounded-xl bg-stone-950 p-1 border ${idx === 0 ? 'border-amber-600/40' : 'border-stone-800'}`}>
                        {getAvatarById(p.avatarId).render('w-full h-full')}
                      </div>
                      <div>
                        <span className={`block text-xs font-black ${idx === 0 ? 'text-amber-300' : 'text-[#f5f0e8]'}`}>
                          {p.username} {idx === 0 && '👑'}
                        </span>
                        <span className={`block text-[9px] font-bold ${rankColors[idx] ?? 'text-stone-500'}`}>
                          {rankLabels[idx] ?? `Rank #${idx + 1}`}
                        </span>
                        <span className="block text-[9px] text-stone-500">Accuracy: {accuracy}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="block text-sm font-black text-amber-400">+{p.coinsEarned}g</span>
                        <span className="block text-[8px] text-stone-500 font-bold uppercase">Gold</span>
                      </div>
                      <div>
                        <span className="block text-sm font-black text-sky-400">+{p.xpEarned}</span>
                        <span className="block text-[8px] text-stone-500 font-bold uppercase">XP</span>
                      </div>
                      <div>
                        <span className="block text-sm font-black text-emerald-400">{p.correctAnswers}</span>
                        <span className="block text-[8px] text-stone-500 font-bold uppercase">Correct</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 max-w-xl mx-auto space-y-5 text-left"
            >
              {/* Gold bar chart */}
              <div className="p-4 rounded-2xl border border-stone-800/50 bg-stone-900/20 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 flex items-center gap-1.5">
                  <span>🪙</span> Royal Gold Earned
                </h4>
                {sorted.map((p, idx) => (
                  <div key={p.username} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-black text-stone-300 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-stone-950 overflow-hidden border border-stone-800">
                          {getAvatarById(p.avatarId).render('w-full h-full')}
                        </div>
                        {p.username}
                      </span>
                      <span className="font-black text-amber-400">{p.coinsEarned}g</span>
                    </div>
                    <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.coinsEarned / maxCoins) * 100}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                          idx === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-300' :
                          idx === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-600' :
                          'bg-stone-600'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Accuracy + Streak grid */}
              <div className="grid grid-cols-2 gap-3">
                {sorted.map((p) => {
                  const total = p.correctAnswers + p.incorrectAnswers;
                  const acc = total > 0 ? Math.round((p.correctAnswers / total) * 100) : 0;
                  return (
                    <div key={p.username} className="p-3 rounded-xl border border-stone-800/50 bg-stone-900/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-stone-950 overflow-hidden border border-stone-800">
                          {getAvatarById(p.avatarId).render('w-full h-full')}
                        </div>
                        <span className="text-[10px] font-black text-stone-300 truncate">{p.username}</span>
                      </div>
                      <div className="flex gap-3 text-center">
                        <div className="flex-1">
                          <div className="text-base font-black text-emerald-400">{acc}%</div>
                          <div className="text-[8px] text-stone-500 uppercase font-bold flex items-center justify-center gap-0.5"><Target className="w-2.5 h-2.5" /> Accuracy</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-black text-orange-400">{p.longestStreak}</div>
                          <div className="text-[8px] text-stone-500 uppercase font-bold flex items-center justify-center gap-0.5"><Flame className="w-2.5 h-2.5" /> Streak</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-black text-sky-400">+{p.xpEarned}</div>
                          <div className="text-[8px] text-stone-500 uppercase font-bold flex items-center justify-center gap-0.5"><Zap className="w-2.5 h-2.5" /> XP</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Match summary numbers */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl border border-stone-800/40 bg-stone-900/10">
                  <div className="text-lg font-black text-amber-400">{roundCount}</div>
                  <div className="text-[9px] text-stone-500 uppercase font-bold">Rounds</div>
                </div>
                <div className="p-3 rounded-xl border border-stone-800/40 bg-stone-900/10">
                  <div className="text-lg font-black text-purple-400">{totalQuestions}</div>
                  <div className="text-[9px] text-stone-500 uppercase font-bold">Trials</div>
                </div>
                <div className="p-3 rounded-xl border border-stone-800/40 bg-stone-900/10">
                  <div className="text-lg font-black text-emerald-400">
                    {totalQuestions > 0
                      ? Math.round((players.reduce((s, p) => s + p.correctAnswers, 0) / totalQuestions) * 100)
                      : 0}%
                  </div>
                  <div className="text-[9px] text-stone-500 uppercase font-bold">Avg Accuracy</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="relative z-10 text-[10px] text-amber-700/60 italic">
          &quot;May your name be forever written in the Chronicles of Historia.&quot;
        </p>

        {/* Actions */}
        <div className="relative z-10 flex items-center justify-center gap-3 max-w-sm mx-auto">
          <button
            onClick={() => { sounds.playClick(); onLeave(); }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-700/50 text-stone-300 hover:bg-stone-900 font-semibold transition-all active:scale-95 text-xs"
          >
            <LogOut className="w-4 h-4" /> Leave Realm
          </button>
          <button
            onClick={() => { sounds.playClick(); onPlayAgain(); }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase tracking-wider transition-all active:scale-95 text-xs shadow-lg shadow-amber-900/30"
          >
            <RefreshCw className="w-4 h-4" /> New Quest
          </button>
        </div>
      </div>
    </div>
  );
}
