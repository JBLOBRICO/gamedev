'use client';

import React from 'react';
import { Trophy, Calendar, CheckCircle2, Flame } from 'lucide-react';
import { UserProfile } from '@/hooks/useProfile';
import { getAvatarById } from '@/lib/avatars';

interface ProfileStatsProps {
  profile: UserProfile;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const nextLevelXp = profile.level * 100;
  const progressPercent = Math.min(100, Math.floor((profile.xp / nextLevelXp) * 100));

  // Determine accuracy
  const totalAnswers = profile.correctAnswers + profile.incorrectAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((profile.correctAnswers / totalAnswers) * 100) : 0;

  // Achievements available for future rendering

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Level & Summary */}
      <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-800 glass-panel flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-sky-400/30 overflow-hidden bg-slate-900/60 p-2 shadow-lg shadow-sky-500/10">
            {getAvatarById(profile.avatarId).render("w-full h-full")}
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 bg-sky-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-full border-2 border-slate-950">
            LVL {profile.level}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold" style={{ color: profile.nameColor }}>
            {profile.username}
          </h3>
          <p className="text-xs text-sky-400 font-semibold uppercase tracking-widest mt-1">
            {profile.title}
          </p>
        </div>

        {/* Level XP Progress */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>XP Progress</span>
            <span>{profile.xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Mini stats grid */}
        <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
            <span className="block text-xl font-black text-sky-400">{profile.coins}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Coins Balance</span>
          </div>
          <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
            <span className="block text-xl font-black text-indigo-400">{profile.gamesPlayed}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Matches Played</span>
          </div>
        </div>
      </div>

      {/* Main Stats Summary */}
      <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 glass-panel space-y-6">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Gameplay Statistics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase">Win Rate</span>
            <span className="block text-2xl font-black text-sky-300 mt-1">
              {profile.gamesPlayed > 0 ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) : 0}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{profile.gamesWon} Wins</span>
          </div>

          <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase">Quiz Accuracy</span>
            <span className="block text-2xl font-black text-emerald-300 mt-1">{accuracy}%</span>
            <span className="text-[10px] text-slate-500 font-semibold">{profile.correctAnswers} Correct</span>
          </div>

          <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase">Max Streak</span>
            <span className="block text-2xl font-black text-rose-400 mt-1 flex items-center justify-center gap-1">
              {profile.longestStreak}
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Active: {profile.streak}</span>
          </div>

          <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center">
            <span className="block text-xs font-semibold text-slate-500 uppercase">Top Category</span>
            <span className="block text-sm font-black text-amber-400 mt-2 truncate">
              {profile.favoriteCategory || 'General'}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Favorite</span>
          </div>
        </div>

        {/* Daily Challenges Progress */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              Daily Challenges
            </h4>
            <span className="text-xs font-bold text-sky-400 bg-sky-950/40 border border-sky-900/40 px-2.5 py-0.5 rounded-full">
              Resets Daily
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/30 rounded-xl">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-200">First Victory</span>
                  <span className="text-[10px] text-slate-400">Win 1 match in any mode</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-sky-400">150 XP / 80 Gold</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/30 rounded-xl">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-200">Trivia Lover</span>
                  <span className="text-[10px] text-slate-400">Answer 5 questions correctly</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-sky-400">100 XP / 50 Gold</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
