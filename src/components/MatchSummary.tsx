'use client';

import React, { useEffect } from 'react';
import { Trophy, RefreshCw, LogOut } from 'lucide-react';
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
    // Burst confetti multiple times
    const end = Date.now() + 3000;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Determine MVP (highest coins earned + correct answers)
  const mvp = [...players].sort((a, b) => (b.coinsEarned + b.correctAnswers) - (a.coinsEarned + a.correctAnswers))[0];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border border-slate-800 glass-panel rounded-3xl space-y-8 animate-in fade-in zoom-in-95 duration-300 relative text-center">
      
      {/* Victory Announcement */}
      <div className="space-y-3">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400">
          CONGRATULATIONS!
        </h1>
        <p className="text-sm text-slate-400">
          <span className="font-extrabold text-white text-base">{winnerUsername}</span> reached the finish line and claimed victory in <span className="font-extrabold text-sky-400">{roundCount} rounds</span>!
        </p>
      </div>

      {/* MVP Card */}
      {mvp && (
        <div className="max-w-md mx-auto p-4 rounded-2xl border border-sky-900/40 bg-sky-950/20 flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 p-1 shrink-0">
            {getAvatarById(mvp.avatarId).render("w-full h-full")}
          </div>
          <div>
            <span className="text-[9px] font-black text-sky-400 bg-sky-950/60 border border-sky-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Match MVP
            </span>
            <h3 className="text-base font-extrabold text-white mt-1 leading-tight">{mvp.username}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Accumulated {mvp.coinsEarned} coins & answered {mvp.correctAnswers} correctly!
            </p>
          </div>
        </div>
      )}

      {/* Final rankings list */}
      <div className="space-y-3 text-left max-w-xl mx-auto">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">
          Rankings & Stats Summary
        </h3>

        <div className="space-y-2">
          {players.map((p, idx) => (
            <div
              key={p.username}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-500 min-w-4 text-center">#{idx + 1}</span>
                <div className="w-10 h-10 rounded-lg bg-slate-950 p-1 border border-slate-800">
                  {getAvatarById(p.avatarId).render("w-full h-full")}
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-white">{p.username}</span>
                  <span className="block text-[9px] text-slate-400">Accuracy: {p.correctAnswers + p.incorrectAnswers > 0 ? Math.round((p.correctAnswers / (p.correctAnswers + p.incorrectAnswers)) * 100) : 0}%</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <span className="block text-xs font-extrabold text-yellow-400">+{p.coinsEarned}g</span>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase">Coins</span>
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-sky-400">+{p.xpEarned} XP</span>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase">XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lobby resetting actions */}
      <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800/60 max-w-sm mx-auto">
        <button
          onClick={() => { sounds.playClick(); onLeave(); }}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 font-semibold transition-all active:scale-95 text-xs"
        >
          <LogOut className="w-4 h-4" />
          Leave Match
        </button>
        
        <button
          onClick={() => { sounds.playClick(); onPlayAgain(); }}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black uppercase tracking-wider transition-all active:scale-95 text-xs shadow-md shadow-sky-500/10"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
          Play Again
        </button>
      </div>

    </div>
  );
}
