'use client';

import React, { useEffect } from 'react';
import { Crown, RefreshCw, LogOut, Star, Scroll, Shield } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import confetti from 'canvas-confetti';
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

export default function MatchSummary({
  winnerUsername,
  roundCount,
  players,
  onPlayAgain,
  onLeave,
}: MatchSummaryProps) {

  useEffect(() => {
    sounds.playVictory();

    // Golden confetti burst — royal celebration
    const end = Date.now() + 4000;
    const interval = setInterval(() => {
      if (Date.now() > end) { clearInterval(interval); return; }
      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#c9a84c', '#f5f0e8', '#8b1a1a', '#1e3a6e', '#0d4a2e', '#f5c842', '#fff'],
        shapes: ['circle', 'square'],
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const mvp = [...players].sort((a, b) => (b.coinsEarned + b.correctAnswers) - (a.coinsEarned + a.correctAnswers))[0];

  const rankLabels = ['👑 Crowned Champion', '🥈 Royal Knight', '🥉 Valiant Scholar', '⚔️ Brave Apprentice'];
  const rankColors = ['text-amber-400', 'text-slate-300', 'text-amber-600', 'text-stone-400'];

  return (
    <div className="w-full max-w-4xl mx-auto relative">

      {/* Outer royal frame */}
      <div className="relative p-8 border border-amber-700/40 glass-panel rounded-3xl space-y-8 text-center overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-stone-950/30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Corner ornaments */}
        <div className="absolute top-3 left-4 text-amber-700/40 text-sm">✦</div>
        <div className="absolute top-3 right-4 text-amber-700/40 text-sm">✦</div>
        <div className="absolute bottom-3 left-4 text-amber-700/40 text-sm">✦</div>
        <div className="absolute bottom-3 right-4 text-amber-700/40 text-sm">✦</div>

        {/* Victory Announcement */}
        <div className="relative space-y-4 z-10">
          {/* Crown animation */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-900/40 to-stone-950/60 border-2 border-amber-600/50 flex items-center justify-center shadow-2xl shadow-amber-900/30">
              <Crown className="w-12 h-12 text-amber-400 crown-float" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-600/70">
              ⚜ The Quest is Complete ⚜
            </p>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300">
              CROWNED CHAMPION!
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-700/50" />
              <p className="text-sm text-stone-300">
                <span className="font-black text-amber-300 text-base">{winnerUsername}</span>
                <span className="text-stone-400"> has claimed the Crown of Wisdom</span>
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-700/50" />
            </div>
            <p className="text-[10px] text-stone-500 italic mt-1">
              "{roundCount} ancient trials faced — the realm shall remember this day."
            </p>
          </div>
        </div>

        {/* MVP / Most Valuable Hero */}
        {mvp && (
          <div className="relative z-10 max-w-md mx-auto p-4 rounded-2xl border border-amber-800/40 bg-amber-950/20 flex items-center gap-4 text-left">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-xl bg-stone-950 border border-amber-700/40 p-1">
                {getAvatarById(mvp.avatarId).render('w-full h-full')}
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border border-stone-950 text-xs">
                ⭐
              </div>
            </div>
            <div>
              <span className="block text-[8px] font-black text-amber-400 uppercase tracking-[0.2em] bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-full mb-1">
                🏅 Match MVP · Most Honoured Hero
              </span>
              <h3 className="text-base font-black text-[#f5f0e8] leading-tight">{mvp.username}</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Accumulated {mvp.coinsEarned} Royal Gold & answered {mvp.correctAnswers} trials correctly
              </p>
            </div>
          </div>
        )}

        {/* Ornamental divider */}
        <div className="relative z-10 ornament-divider">
          <span>⚜ Hall of Chronicles · Final Standings ⚜</span>
        </div>

        {/* Rankings */}
        <div className="relative z-10 space-y-2.5 max-w-xl mx-auto text-left">
          {players.map((p, idx) => {
            const accuracy = p.correctAnswers + p.incorrectAnswers > 0
              ? Math.round((p.correctAnswers / (p.correctAnswers + p.incorrectAnswers)) * 100)
              : 0;
            const isWinner = idx === 0;
            return (
              <div
                key={p.username}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isWinner
                    ? 'border-amber-700/50 bg-amber-950/25 shadow-lg shadow-amber-900/15'
                    : 'border-stone-800/60 bg-stone-900/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div className={`text-xs font-black min-w-6 text-center ${rankColors[idx] || 'text-stone-500'}`}>
                    {idx < rankLabels.length ? rankLabels[idx].split(' ')[0] : `#${idx + 1}`}
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-stone-950 p-1 border ${isWinner ? 'border-amber-600/40' : 'border-stone-800'}`}>
                    {getAvatarById(p.avatarId).render('w-full h-full')}
                  </div>
                  <div>
                    <span className={`block text-xs font-black ${isWinner ? 'text-amber-300' : 'text-[#f5f0e8]'}`}>
                      {p.username}
                      {isWinner && <span className="ml-1 text-amber-400">👑</span>}
                    </span>
                    <span className={`block text-[9px] font-bold ${rankColors[idx] || 'text-stone-500'}`}>
                      {rankLabels[idx] || `Rank #${idx + 1}`}
                    </span>
                    <span className="block text-[9px] text-stone-500">Accuracy: {accuracy}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-right">
                  <div>
                    <span className="block text-xs font-black text-amber-400">+{p.coinsEarned}g</span>
                    <span className="block text-[8px] text-stone-500 font-bold uppercase">Royal Gold</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-sky-400">+{p.xpEarned} XP</span>
                    <span className="block text-[8px] text-stone-500 font-bold uppercase">Experience</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-rose-400">{p.correctAnswers}</span>
                    <span className="block text-[8px] text-stone-500 font-bold uppercase">Trials Won</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Flavor quote */}
        <p className="relative z-10 text-[10px] text-amber-700/60 italic">
          "May your name be forever written in the Chronicles of Historia."
        </p>

        {/* Actions */}
        <div className="relative z-10 flex items-center justify-center gap-3 max-w-sm mx-auto">
          <button
            onClick={() => { sounds.playClick(); onLeave(); }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-700/50 text-stone-300 hover:bg-stone-900 font-semibold transition-all active:scale-95 text-xs"
          >
            <LogOut className="w-4 h-4" />
            Leave Realm
          </button>
          <button
            onClick={() => { sounds.playClick(); onPlayAgain(); }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase tracking-wider transition-all active:scale-95 text-xs shadow-lg shadow-amber-900/30"
          >
            <RefreshCw className="w-4 h-4" />
            New Quest
          </button>
        </div>
      </div>
    </div>
  );
}
