'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import ProfileEditModal from '@/components/ProfileEditModal';
import ProfileStats from '@/components/ProfileStats';
import SoundSettings from '@/components/SoundSettings';
import { Settings, Plus, Users, ArrowRight, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export default function Home() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile();
  
  const [showEdit, setShowEdit] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<'DUEL' | 'TEAM' | 'FFA'>('DUEL');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!profile) return;
    sounds.playClick();
    setActionLoading(true);
    setActionError(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          userId: profile.id,
          mode: selectedMode,
        }),
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
        body: JSON.stringify({
          action: 'JOIN',
          userId: profile.id,
          code: roomCodeInput.trim().toUpperCase(),
        }),
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Sparkles className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Loading Profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-slate-950 text-white relative bg-grid-pattern space-y-8 pb-20">
      
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 font-black text-slate-950 text-xl tracking-tighter">
            QR
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">
              QuizRealm <span className="text-sky-400">Tactics</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Multiplayer Trivia Board Arena</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <button
              onClick={() => { sounds.playClick(); setShowEdit(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Settings className="w-4 h-4 text-sky-400" />
              Edit Profile
            </button>
          )}
          <Link
            href="/admin"
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition-colors"
            title="Admin Workspace"
          >
            <ShieldAlert className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Create / Join Forms */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Create Room Card */}
          <div className="p-6 rounded-2xl border border-slate-800 glass-panel space-y-4">
            <h2 className="text-base font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" />
              Create Lobby
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {(['DUEL', 'TEAM', 'FFA'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { sounds.playClick(); setSelectedMode(mode); }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider ${
                    selectedMode === mode
                      ? 'border-sky-400 bg-sky-500/10 text-sky-400 shadow-md shadow-sky-500/5'
                      : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {mode === 'DUEL' ? '1v1' : mode === 'TEAM' ? '2v2' : 'FFA'}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 leading-snug">
              {selectedMode === 'DUEL' && '1v1 Duel: Two players compete individually.'}
              {selectedMode === 'TEAM' && '2v2 Team Battle: Four players form two teams sharing pawns.'}
              {selectedMode === 'FFA' && 'Free-for-All: Up to four players compete individually.'}
            </p>

            {actionError && (
              <p className="text-[11px] text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded-xl border border-rose-950/30">
                {actionError}
              </p>
            )}

            <button
              disabled={actionLoading}
              onClick={handleCreateRoom}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-slate-950 font-black uppercase text-xs tracking-wider transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              Create Lobbies
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Join Room Card */}
          <div className="p-6 rounded-2xl border border-slate-800 glass-panel space-y-4">
            <h2 className="text-base font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              Join Lobby
            </h2>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                required
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-center font-bold tracking-widest uppercase"
                placeholder="LOBBY CODE"
              />
              
              <button
                type="submit"
                disabled={actionLoading || !roomCodeInput}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold uppercase text-xs tracking-wider transition-all active:scale-98 disabled:opacity-50"
              >
                Join Lobby Room
              </button>
            </form>
          </div>

          {/* Training Mode Card */}
          <Link
            href="/training"
            onClick={() => sounds.playClick()}
            className="group block p-5 rounded-2xl border border-indigo-900/50 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 hover:border-indigo-700/60 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Training Mode</p>
                  <p className="text-[10px] text-indigo-400/80 font-semibold">Learn all mechanics interactively</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {['Board Tiles', 'Dice Rolls', 'Trivia', 'Shop', 'Strategy'].map((tag) => (
                <span key={tag} className="text-[9px] font-bold uppercase tracking-wider text-indigo-400/70 bg-indigo-950/60 border border-indigo-900/40 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Link>

        </div>

        {/* Right Side: Profile stats & progress */}
        <div className="lg:col-span-2">
          {profile && <ProfileStats profile={profile} />}
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
