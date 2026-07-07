'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import ProfileEditModal from '@/components/ProfileEditModal';
import ProfileStats from '@/components/ProfileStats';
import SoundSettings from '@/components/SoundSettings';
import { Settings, Plus, Users, ArrowRight, ShieldAlert, Sparkles, BookOpen, Crown, Sword, Castle, ScrollText } from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { getRandomFlavorMessage } from '@/lib/heroes';

export default function Home() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile();

  const [showEdit, setShowEdit] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<'DUEL' | 'TEAM' | 'FFA'>('DUEL');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [flavorMsg, setFlavorMsg] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; dur: number }>>([]);

  useEffect(() => {
    setFlavorMsg(getRandomFlavorMessage());
    const iv = setInterval(() => setFlavorMsg(getRandomFlavorMessage()), 8000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        dur: 3 + Math.random() * 4,
      }))
    );
  }, []);

  const handleCreateRoom = async () => {
    if (!profile) return;
    sounds.playClick();
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', userId: profile.id, mode: selectedMode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create room');
      }
      const room = await res.json();
      sounds.playLevelUp();
      router.push(`/game/${room.code}`);
    } catch (err: any) {
      setActionError(err.message);
      setActionLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !roomCodeInput) return;
    sounds.playClick();
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'JOIN', userId: profile.id, code: roomCodeInput.trim().toUpperCase() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to join room');
      }
      const room = await res.json();
      sounds.playLevelUp();
      router.push(`/game/${room.code}`);
    } catch (err: any) {
      setActionError(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-5">
          <div className="relative mx-auto w-20 h-20">
            <Crown className="w-20 h-20 text-amber-500/30 mx-auto" />
            <Crown className="w-10 h-10 text-amber-400 absolute inset-0 m-auto animate-pulse crown-float" />
          </div>
          <p className="text-sm text-amber-700 font-bold uppercase tracking-widest">Entering the Kingdom…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#f5f0e8] relative overflow-hidden bg-grid-pattern">

      {/* ── Ambient particles ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-400/30"
            style={{
              left: `${p.x}%`,
              animation: `particleRise ${p.dur}s ${p.delay}s infinite ease-in-out`,
            }}
          />
        ))}
        {/* Torch glows */}
        <div className="absolute top-0 left-8 w-3 h-6 bg-amber-500/15 rounded-full blur-sm torch-flicker" />
        <div className="absolute top-0 right-8 w-3 h-6 bg-amber-500/15 rounded-full blur-sm torch-flicker" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* ── Castle Banner Header ───────────────────────────────────────────── */}
      <div className="relative z-10 border-b border-amber-900/30 bg-[#080608]/70 backdrop-blur-sm">

        {/* Flavor text ticker */}
        {flavorMsg && (
          <div className="text-center py-1.5 bg-amber-950/20 border-b border-amber-900/20">
            <p className="flavor-text text-amber-600/70 text-[10px] tracking-widest italic">
              ✦ {flavorMsg} ✦
            </p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-900/40 to-stone-900/60 border border-amber-700/40" />
              <Crown className="w-7 h-7 text-amber-400 relative z-10 crown-float" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#f5f0e8] uppercase leading-none">
                Historia <span className="text-amber-400">Legends</span>
              </h1>
              <p className="text-[9px] text-amber-700/70 font-bold tracking-[0.2em] uppercase">
                Crown of Wisdom · Kingdom Quest
              </p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2">
            {profile && (
              <button
                onClick={() => { sounds.playClick(); setShowEdit(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-900/40 bg-amber-950/20 hover:bg-amber-950/40 text-xs font-bold transition-all hover:scale-105 active:scale-95 text-amber-300"
              >
                <Settings className="w-4 h-4" />
                Hero Profile
              </button>
            )}
            <Link
              href="/admin"
              className="p-2.5 rounded-xl border border-stone-800/60 bg-stone-900/30 text-stone-400 hover:text-amber-300 transition-colors"
              title="Royal Sanctum (Admin)"
            >
              <ShieldAlert className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative crown banner row */}
        <div className="max-w-7xl mx-auto px-4 pb-2 flex items-center justify-center gap-3 opacity-30">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-700/60" />
          <span className="text-amber-600 text-xs">⚜</span>
          <span className="text-amber-600 text-[9px] font-bold uppercase tracking-widest">Kingdom of Historia</span>
          <span className="text-amber-600 text-xs">⚜</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-700/60" />
        </div>
      </div>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 space-y-10">

        {/* Page Hero Banner */}
        <div className="text-center space-y-4 py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-700/40 bg-amber-950/20 text-xs font-bold text-amber-500 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Multiplayer Trivia Board Arena
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-[#f5f0e8] leading-tight">
            Seek the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Crown of Wisdom</span>
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto text-sm leading-relaxed">
            Brave heroes of Historia compete across ancient castles, enchanted forests, and forgotten ruins.
            Answer the trials of the realm's greatest scholars to claim your legendary destiny.
          </p>
          {/* Kingdom lore tags */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {[
              { icon: '⚔️', label: 'Royal Duels' },
              { icon: '🏰', label: 'Castle Arena' },
              { icon: '📜', label: 'Ancient Trials' },
              { icon: '👑', label: 'Legendary Relics' },
              { icon: '🌿', label: 'Enchanted Realm' },
            ].map(tag => (
              <span key={tag.label} className="flex items-center gap-1 px-3 py-1 rounded-full border border-amber-900/30 bg-amber-950/15 text-amber-600/80 text-[10px] font-bold uppercase tracking-wider">
                {tag.icon} {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: Create / Join ────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Create Room — "Summon the Great Hall" */}
            <div className="p-6 rounded-2xl border border-amber-900/35 glass-panel space-y-4 medieval-frame">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-900/25">
                <Castle className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-black text-[#f5f0e8] uppercase tracking-wider">
                  Summon the Great Hall
                </h2>
              </div>

              {/* Mode selector */}
              <div>
                <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-2">Choose Battle Mode</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { mode: 'DUEL', label: 'Royal Duel', sub: '1v1', icon: '⚔️' },
                    { mode: 'TEAM', label: 'Band of Heroes', sub: '2v2', icon: '🛡️' },
                    { mode: 'FFA', label: 'Grand Melee', sub: '4P', icon: '👑' },
                  ] as const).map(({ mode, label, sub, icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { sounds.playClick(); setSelectedMode(mode); }}
                      className={`py-2.5 px-2 rounded-xl text-[10px] font-bold transition-all border flex flex-col items-center gap-1 ${
                        selectedMode === mode
                          ? 'border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-md shadow-amber-900/20'
                          : 'border-stone-800/50 bg-stone-900/20 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-base">{icon}</span>
                      <span className="uppercase tracking-wider leading-none">{sub}</span>
                      <span className="text-[8px] opacity-70 leading-none">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-stone-500 mt-2 leading-snug">
                  {selectedMode === 'DUEL' && '⚔️ Two heroes face off in a test of wisdom.'}
                  {selectedMode === 'TEAM' && '🛡️ Four heroes form two bands sharing a banner.'}
                  {selectedMode === 'FFA' && '👑 Up to four heroes battle for the crown.'}
                </p>
              </div>

              {actionError && (
                <p className="text-[11px] text-red-400 font-bold bg-red-950/20 p-2.5 rounded-xl border border-red-900/30">
                  {actionError}
                </p>
              )}

              <button
                disabled={actionLoading}
                onClick={handleCreateRoom}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase text-xs tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-amber-900/30"
              >
                <Castle className="w-4 h-4" />
                Open the Great Hall
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Join Room — "Answer the King's Call" */}
            <div className="p-6 rounded-2xl border border-stone-800/50 glass-panel space-y-4 medieval-frame">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-800/40">
                <Users className="w-5 h-5 text-sky-400" />
                <h2 className="text-sm font-black text-[#f5f0e8] uppercase tracking-wider">
                  Answer the King's Call
                </h2>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-3">
                <div>
                  <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-1.5">Hall Seal (Room Code)</p>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-center font-black tracking-[0.35em] uppercase text-amber-300 text-base"
                    placeholder="· · · · · ·"
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading || !roomCodeInput}
                  className="w-full py-3 rounded-xl border border-stone-700/50 bg-stone-900/40 hover:bg-stone-800/50 text-[#f5f0e8] font-bold uppercase text-xs tracking-wider transition-all active:scale-98 disabled:opacity-50"
                >
                  Enter the Great Hall
                </button>
              </form>
            </div>

            {/* Training Mode */}
            <Link
              href="/training"
              onClick={() => sounds.playClick()}
              className="group block p-5 rounded-2xl border border-indigo-900/40 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 hover:border-indigo-700/50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-950/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#f5f0e8]">Scholar's Training Grounds</p>
                    <p className="text-[10px] text-indigo-400/70 font-semibold">Master the trials before your quest</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {['Board Tiles', 'Ancient Trials', 'Relics', 'Combat Strategy', 'Wisdom Path'].map((tag) => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-wider text-indigo-400/60 bg-indigo-950/50 border border-indigo-900/30 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>

            {/* Kingdom modes info card */}
            <div className="p-4 rounded-xl border border-amber-900/20 bg-amber-950/10 space-y-2">
              <p className="text-[9px] font-black text-amber-600/70 uppercase tracking-widest flex items-center gap-1.5">
                <ScrollText className="w-3 h-3" /> The Kingdom's Chronicle
              </p>
              <p className="text-[10px] text-stone-500 leading-relaxed italic">
                "In the Kingdom of Historia, only those who answer the ancient trials of the Royal Librarians may advance across the sacred board. 
                Reach the Crown of Wisdom to become a Crowned Champion of the realm."
              </p>
            </div>
          </div>

          {/* ── Right: Profile Stats ───────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {profile && <ProfileStats profile={profile} />}
          </div>
        </div>
      </div>

      {/* ── Bottom Castle Banner ────────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-amber-900/20 bg-[#080608]/50 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-stone-600">
          <span className="flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-amber-700/40" />
            Kingdom of Historia · Historia Legends
          </span>
          <div className="flex items-center gap-3">
            <span>⚔️ Royal Duels</span>
            <span>🏰 Castle Arena</span>
            <span>📜 Ancient Trials</span>
            <span>👑 Crown of Wisdom</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && profile && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSave={updateProfile}
        />
      )}

      <SoundSettings />
    </main>
  );
}
