'use client';

import React from 'react';
import { Crown, Scroll, Flame, Star, BookOpen } from 'lucide-react';
import { UserProfile } from '@/hooks/useProfile';
import { getAvatarById } from '@/lib/avatars';
import { getHeroByAvatarId } from '@/lib/heroes';

interface ProfileStatsProps {
  profile: UserProfile;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const nextLevelXp = profile.level * 100;
  const progressPercent = Math.min(100, Math.floor((profile.xp / nextLevelXp) * 100));

  const totalAnswers = profile.correctAnswers + profile.incorrectAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((profile.correctAnswers / totalAnswers) * 100) : 0;

  const hero = getHeroByAvatarId(profile.avatarId);

  const rankTitle = profile.level >= 20 ? 'Legendary Champion' :
    profile.level >= 10 ? 'Royal Knight' :
    profile.level >= 5 ? 'Seasoned Scholar' :
    profile.level >= 3 ? 'Aspiring Hero' : 'Apprentice';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ── Hero Card ────────────────────────────────────────────────────── */}
      <div className={`lg:col-span-1 p-6 rounded-2xl border glass-panel flex flex-col items-center text-center space-y-4 relative overflow-hidden ${
        hero ? hero.borderClass : 'border-amber-900/35'
      }`}>

        {/* Background gradient for hero */}
        {hero && (
          <div className={`absolute inset-0 bg-gradient-to-b ${hero.bgGradient} pointer-events-none`} />
        )}

        {/* Rarity badge */}
        {hero && (
          <div className={`absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
            hero.rarity === 'Legendary' ? 'text-amber-400 border-amber-600/50 bg-amber-950/40' :
            hero.rarity === 'Epic' ? 'text-purple-400 border-purple-600/50 bg-purple-950/40' :
            hero.rarity === 'Rare' ? 'text-sky-400 border-sky-600/50 bg-sky-950/40' :
            'text-stone-400 border-stone-600/50 bg-stone-950/40'
          }`}>
            {hero.rarity}
          </div>
        )}

        <div className="relative z-10">
          {/* Avatar + level */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-2xl overflow-hidden bg-stone-950/60 p-2 shadow-xl border-2 ${
              hero ? hero.borderClass : 'border-amber-700/40'
            }`}>
              {getAvatarById(profile.avatarId).render('w-full h-full')}
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-600 text-stone-950 font-black text-[10px] px-2.5 py-1 rounded-full border-2 border-stone-950">
              LVL {profile.level}
            </span>
            {hero && (
              <span className="absolute -top-2 -left-2 text-lg">{hero.crest}</span>
            )}
          </div>
        </div>

        {/* Name & title */}
        <div className="relative z-10 space-y-1">
          <h3 className="text-lg font-black" style={{ color: profile.nameColor }}>
            {profile.username}
          </h3>
          {hero ? (
            <>
              <p className={`text-[10px] font-black uppercase tracking-widest ${hero.colorAccent}`}>
                {hero.title}
              </p>
              <p className="text-[9px] text-stone-500 italic">"{hero.quote.replace(/"/g, '').substring(0, 60)}…"</p>
            </>
          ) : (
            <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest">{profile.title}</p>
          )}
          <div className="inline-flex items-center gap-1 bg-stone-950/40 border border-stone-800/40 px-2.5 py-0.5 rounded-full">
            <Crown className="w-2.5 h-2.5 text-amber-600/60" />
            <span className="text-[9px] text-stone-400 font-bold">{rankTitle}</span>
          </div>
        </div>

        {/* XP bar */}
        <div className="w-full space-y-1.5 relative z-10">
          <div className="flex justify-between text-[9px] font-bold text-stone-500">
            <span>⚗ Wisdom Progress</span>
            <span>{profile.xp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800/60">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 transition-all duration-700 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Hero passive ability */}
        {hero && (
          <div className="w-full relative z-10 p-3 rounded-xl border border-stone-800/40 bg-stone-950/30">
            <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-amber-600/60" /> Passive Ability
            </p>
            <p className="text-[10px] font-black text-amber-400/80">{hero.passive.icon} {hero.passive.name}</p>
            <p className="text-[9px] text-stone-500 leading-snug mt-0.5">{hero.passive.description}</p>
          </div>
        )}

        {/* Mini stats */}
        <div className="w-full grid grid-cols-2 gap-2 relative z-10 pt-3 border-t border-stone-800/40">
          <div className="p-2.5 bg-stone-950/40 border border-stone-800/30 rounded-xl text-center">
            <span className="block text-lg font-black text-amber-400">{profile.coins}</span>
            <span className="text-[8px] text-stone-500 font-bold uppercase">Royal Gold</span>
          </div>
          <div className="p-2.5 bg-stone-950/40 border border-stone-800/30 rounded-xl text-center">
            <span className="block text-lg font-black text-sky-400">{profile.gamesPlayed}</span>
            <span className="text-[8px] text-stone-500 font-bold uppercase">Quests</span>
          </div>
        </div>
      </div>

      {/* ── Battle Chronicles ────────────────────────────────────────────── */}
      <div className="lg:col-span-2 p-6 rounded-2xl border border-stone-800/50 glass-panel space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-800/40">
          <Scroll className="w-5 h-5 text-amber-600/60" />
          <h3 className="text-base font-black text-[#f5f0e8]">Battle Chronicles</h3>
          <span className="text-[9px] text-stone-600 italic ml-auto">Hall of Legends record</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Victory Rate',
              value: `${profile.gamesPlayed > 0 ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) : 0}%`,
              sub: `${profile.gamesWon} Victories`,
              color: 'text-amber-400',
              icon: '⚜️',
            },
            {
              label: 'Trial Accuracy',
              value: `${accuracy}%`,
              sub: `${profile.correctAnswers} Correct`,
              color: 'text-emerald-400',
              icon: '📜',
            },
            {
              label: 'Longest Streak',
              value: `${profile.longestStreak}`,
              sub: `Active: ${profile.streak}`,
              color: 'text-rose-400',
              icon: '🔥',
            },
            {
              label: 'Favourite Realm',
              value: profile.favoriteCategory || 'None',
              sub: 'Best Category',
              color: 'text-sky-400',
              icon: '🏰',
            },
          ].map(stat => (
            <div key={stat.label} className="p-4 bg-stone-950/30 border border-stone-800/30 rounded-xl text-center space-y-1">
              <span className="block text-base">{stat.icon}</span>
              <span className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider">{stat.label}</span>
              <span className={`block text-xl font-black ${stat.color} leading-none truncate`}>{stat.value}</span>
              <span className="block text-[9px] text-stone-600">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* Daily Quests */}
        <div className="pt-3 border-t border-stone-800/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-stone-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600/60" />
              Royal Edicts · Daily Quests
            </h4>
            <span className="text-[8px] font-bold text-amber-600/70 bg-amber-950/20 border border-amber-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Resets at Dawn
            </span>
          </div>

          <div className="space-y-2">
            {[
              { title: 'First Victory of the Day', sub: 'Win one quest in any battle mode', reward: '150 XP + 80 Royal Gold', icon: '⚔️' },
              { title: 'Keeper of Wisdom', sub: 'Answer 5 ancient trials correctly', reward: '100 XP + 50 Royal Gold', icon: '📚' },
            ].map(quest => (
              <div key={quest.title} className="flex items-center justify-between p-3 bg-stone-950/35 border border-stone-800/25 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{quest.icon}</span>
                  <div>
                    <span className="block text-xs font-bold text-[#f5f0e8]">{quest.title}</span>
                    <span className="text-[9px] text-stone-500">{quest.sub}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-amber-500/80 text-right whitespace-nowrap ml-2">{quest.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lore flavor */}
        <div className="p-3 rounded-xl bg-amber-950/10 border border-amber-900/15">
          <p className="text-[9px] text-amber-700/50 italic text-center">
            "The scrolls of Historia record every trial answered, every relic claimed, and every quest completed by the heroes of the realm."
          </p>
        </div>
      </div>
    </div>
  );
}
