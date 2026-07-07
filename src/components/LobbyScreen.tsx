'use client';

import React, { useState } from 'react';
import { Copy, Share2, Play, CheckCircle, Clock, ArrowLeftRight, MessageSquare, Send, Users, Crown, BookOpen } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import { sounds } from '@/lib/sounds';
import HeroJournal from '@/components/HeroJournal';

interface LobbyPlayer {
  id: string;
  userId: string;
  isHost: boolean;
  isReady: boolean;
  teamId: string | null;
  user: {
    username: string;
    avatarId: string;
    nameColor: string;
    title: string;
  };
}

interface LobbyTeam {
  id: string;
  name: string;
  color: string;
}

interface LobbyScreenProps {
  roomCode: string;
  mode: string;
  players: LobbyPlayer[];
  teams: LobbyTeam[];
  currentUserId: string;
  chatMessages: Array<{ playerUsername: string | null; details: string; createdAt: string }>;
  onToggleReady: () => void;
  onStartGame: () => void;
  onSendChat: (msg: string) => void;
  onLeaveRoom: () => void;
}

export default function LobbyScreen({
  roomCode,
  mode,
  players,
  teams,
  currentUserId,
  chatMessages,
  onToggleReady,
  onStartGame,
  onSendChat,
  onLeaveRoom,
}: LobbyScreenProps) {
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);

  const localPlayer = players.find(p => p.userId === currentUserId);
  const isHost = localPlayer?.isHost || false;
  const isReady = localPlayer?.isReady || false;

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sounds.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  };

  const handleSwitchTeam = async () => {
    if (mode !== 'TEAM') return;
    sounds.playClick();
    const currentTeam = localPlayer?.teamId;
    const otherTeam = teams.find(t => t.id !== currentTeam);
    if (!otherTeam) return;
    try {
      await fetch(`/api/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BUY_ITEM',
          userId: currentUserId,
          details: { itemId: 'switch_team', cost: 0 }
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const modeName = mode === 'DUEL' ? 'Royal Duel (1v1)' : mode === 'TEAM' ? 'Band of Heroes (2v2)' : 'Grand Melee (Free-for-All)';
  const modeIcon = mode === 'DUEL' ? '⚔️' : mode === 'TEAM' ? '🛡️' : '👑';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-6 duration-300 relative">

      {/* Ambient Fireplace Effect */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/10 via-rose-900/5 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      {/* ── Left: Great Hall & Heroes ─────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Great Hall Header */}
        <div className="p-6 rounded-2xl stone-panel golden-border medieval-frame scroll-texture">
          {/* Torch decorations */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-700/40 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="block text-[9px] text-amber-600/70 font-black uppercase tracking-[0.2em] mb-0.5">
                  {modeIcon} {modeName}
                </span>
                <h1 className="text-2xl font-black text-[#f5f0e8] tracking-tight leading-none">
                  The Great Hall
                </h1>
                <p className="text-[10px] text-stone-500 mt-0.5 italic">
                  "Heroes gather before the Quest begins…"
                </p>
              </div>
            </div>

            {/* Room Code */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-stone-950/60 border border-amber-800/40 rounded-xl px-4 py-2.5 flex items-center gap-3 min-w-44">
                <div>
                  <span className="block text-[8px] text-stone-500 font-black uppercase tracking-wider">Hall Seal</span>
                  <span className="text-xl font-black text-amber-400 tracking-[0.2em] uppercase">{roomCode}</span>
                </div>
                <button
                  onClick={copyCode}
                  className="p-1.5 bg-stone-900 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-amber-300 transition-colors btn-press"
                >
                  {copied ? <span className="text-[10px] text-emerald-400 font-black">✓</span> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={() => { sounds.playClick(); setJournalOpen(true); }}
                className="p-2.5 bg-amber-900/20 border border-amber-800/50 text-amber-500 hover:text-amber-300 rounded-xl transition-all active:scale-95 btn-press"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ornamental divider */}
          <div className="ornament-divider mb-4">
            <span>⚜ Heroes of Historia ⚜</span>
          </div>

          {/* Players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600/60" />
                Assembled Heroes ({players.length} / {mode === 'DUEL' ? 2 : 4})
              </h2>
            </div>

            {mode === 'TEAM' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => {
                  const teamPlayers = players.filter(p => p.teamId === team.id);
                  const isRedTeam = team.name === 'Red Team';
                  return (
                    <div key={team.id} className="p-4 rounded-xl border bg-stone-950/30 space-y-2.5"
                      style={{ borderColor: team.color + '40' }}>
                      <div className="flex justify-between items-center pb-2 border-b border-stone-800/40">
                        <span className="text-sm font-black flex items-center gap-1.5" style={{ color: team.color }}>
                          <span className="text-base">{isRedTeam ? '🔴' : '🔵'}</span>
                          {isRedTeam ? 'Crimson Banner' : 'Azure Banner'}
                        </span>
                        {localPlayer?.teamId === team.id ? (
                          <span className="text-[9px] text-stone-400 font-bold bg-stone-900 px-2 py-0.5 rounded">Your Banner</span>
                        ) : (
                          <button onClick={handleSwitchTeam} className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase transition-colors">
                            Switch <ArrowLeftRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {teamPlayers.length === 0 ? (
                          <p className="text-[10px] text-stone-600 italic py-2">Awaiting a hero…</p>
                        ) : teamPlayers.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-900/40 border border-stone-800/30">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-stone-950 p-0.5 overflow-hidden border border-stone-800">
                                {getAvatarById(p.user.avatarId).render('w-full h-full')}
                              </div>
                              <div>
                                <span className="block text-xs font-bold" style={{ color: p.user.nameColor }}>
                                  {p.user.username} {p.isHost && '👑'}
                                </span>
                                <span className="block text-[9px] text-stone-500 font-semibold">{p.user.title}</span>
                              </div>
                            </div>
                            {p.isReady ? (
                              <span className="text-emerald-400 bg-emerald-950/25 border border-emerald-900/30 px-2 py-0.5 rounded text-[9px] font-black uppercase">Ready ⚔️</span>
                            ) : (
                              <span className="text-amber-500 bg-amber-950/25 border border-amber-900/30 px-2 py-0.5 rounded text-[9px] font-black uppercase">Preparing…</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {players.map((p, idx) => (
                  <div key={p.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${
                    p.userId === currentUserId
                      ? 'border-amber-700/40 bg-amber-950/15'
                      : 'border-stone-800/60 bg-stone-900/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {/* Knight rank badge */}
                      <span className="text-xs font-black text-stone-600 min-w-5 text-center">
                        {idx === 0 ? '👑' : `#${idx + 1}`}
                      </span>
                      <div className="w-11 h-11 rounded-xl bg-stone-950 p-1 overflow-hidden border border-stone-800">
                        {getAvatarById(p.user.avatarId).render('w-full h-full')}
                      </div>
                      <div>
                        <span className="block text-xs font-black flex items-center gap-1" style={{ color: p.user.nameColor }}>
                          {p.user.username}
                          {p.isHost && <span className="text-amber-400" title="Room Host">👑</span>}
                          {p.userId === currentUserId && <span className="text-[8px] text-stone-500 font-bold">(you)</span>}
                        </span>
                        <span className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider">{p.user.title}</span>
                      </div>
                    </div>
                    <div>
                      {p.isReady ? (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/35 border border-emerald-900/35 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Ready ⚔️
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 bg-amber-950/25 border border-amber-900/30 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                          <Clock className="w-3 h-3" /> Arming…
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, (mode === 'DUEL' ? 2 : 4) - players.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-stone-800/40 bg-stone-950/10">
                    <div className="w-11 h-11 rounded-xl border border-dashed border-stone-800/40 bg-stone-950/20 flex items-center justify-center">
                      <span className="text-stone-700 text-base">⚔️</span>
                    </div>
                    <span className="text-[10px] text-stone-700 italic">Awaiting a hero…</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lobby Actions */}
          <div className="flex items-center justify-between pt-5 mt-2 border-t border-stone-800/40">
            <button
              onClick={() => { sounds.playClick(); onLeaveRoom(); }}
              className="px-5 py-2.5 rounded-xl border border-stone-700/50 text-stone-400 hover:text-[#f5f0e8] hover:bg-stone-900 transition-all font-semibold active:scale-95 text-xs btn-press"
            >
              Abandon Quest
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onToggleReady}
                className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 text-xs border btn-press ${
                  isReady
                    ? 'bg-stone-800 text-emerald-400 border-emerald-600/30'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-stone-950 border-emerald-500/50'
                }`}
              >
                {isReady ? '✓ Battle-Ready' : "Answer the King's Call"}
              </button>
              {isHost && (
                <button
                  onClick={onStartGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase tracking-wider transition-all active:scale-95 text-xs shadow-lg shadow-amber-900/30 btn-press"
                >
                  The Quest Begins <Play className="w-4 h-4 fill-current" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Scroll of Whispers (Chat) ──────────────────────────────── */}
      <div className="lg:col-span-1 p-5 rounded-2xl stone-panel golden-border scroll-texture flex flex-col h-[520px]">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-800/50">
          <MessageSquare className="w-4 h-4 text-amber-600/60" />
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">
            Scroll of Whispers
          </h3>
        </div>
        <p className="text-[9px] text-stone-600 italic mt-1.5 mb-2">"Words exchanged in the Great Hall before battle…"</p>

        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          {chatMessages.length === 0 ? (
            <p className="text-[10px] text-stone-600 italic text-center pt-8">
              📜 The scroll is empty. Speak, hero!
            </p>
          ) : (
            [...chatMessages].reverse().map((msg: any, index: number) => {
              const det = JSON.parse(msg.details || '{}');
              const isSystem = msg.playerUsername === 'System';
              return (
                <div key={index} className={`text-[10px] ${isSystem ? 'text-center italic my-1' : 'text-left'}`}>
                  {isSystem ? (
                    <span className="text-amber-700/60 bg-amber-950/10 px-2 py-0.5 rounded border border-amber-900/20 text-[9px]">
                      ✦ {det.message || ''}
                    </span>
                  ) : (
                    <>
                      <span className="font-extrabold text-amber-500/80 block mb-0.5">{msg.playerUsername}:</span>
                      <span className="text-stone-300">{det.message || ''}</span>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-stone-800/50">
          <input
            type="text"
            required
            maxLength={100}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
            placeholder="Speak to your allies…"
          />
          <button type="submit" className="p-2 bg-amber-700 hover:bg-amber-600 text-stone-950 rounded-xl transition-all active:scale-95">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <HeroJournal isOpen={journalOpen} onClose={() => setJournalOpen(false)} />
    </div>
  );
}
