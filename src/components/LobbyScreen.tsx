'use client';

import React, { useState } from 'react';
import { Copy, Share2, Play, CheckCircle, Clock, ArrowLeftRight, MessageSquare, Send, Users } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import { sounds } from '@/lib/sounds';

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

  // Switch team inside lobby if team battle
  const handleSwitchTeam = async () => {
    if (mode !== 'TEAM') return;
    sounds.playClick();
    
    // Find next team
    const currentTeam = localPlayer?.teamId;
    const otherTeam = teams.find(t => t.id !== currentTeam);
    if (!otherTeam) return;

    try {
      await fetch(`/api/rooms/${roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BUY_ITEM', // We overload BUY_ITEM for switching teams, or action directly
          userId: currentUserId,
          details: { itemId: 'switch_team', cost: 0 } // handled custom or let's call action
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
      
      {/* Left Columns - Players List & Room Info */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Room Header Info */}
        <div className="p-6 rounded-2xl border border-slate-800 glass-panel flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest bg-sky-950/40 border border-sky-900/40 px-2.5 py-0.5 rounded-full">
              Lobby Mode: {mode === 'DUEL' ? '1v1 Duel' : mode === 'TEAM' ? '2v2 Team Battle' : 'Free-for-All'}
            </span>
            <h1 className="text-3xl font-black text-white mt-1.5 tracking-tight">
              Lobby Room
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between gap-3 min-w-44">
              <div>
                <span className="block text-[9px] text-slate-500 font-black uppercase">Room Code</span>
                <span className="text-lg font-black text-sky-400 tracking-wider uppercase">{roomCode}</span>
              </div>
              <button 
                onClick={copyCode} 
                className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Copy Room Code"
              >
                {copied ? <span className="text-xs text-emerald-400 font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <button
              onClick={copyCode}
              className="p-3 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all active:scale-95"
              title="Share Room Link"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Players Grid */}
        <div className="p-6 rounded-2xl border border-slate-800 glass-panel space-y-6">
          <h2 className="text-lg font-black text-slate-300 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Connected Players ({players.length} / {mode === 'DUEL' ? 2 : 4})
          </h2>

          {mode === 'TEAM' ? (
            /* 2v2 Teams View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => {
                const teamPlayers = players.filter(p => p.teamId === team.id);
                return (
                  <div key={team.id} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                      <span className="text-sm font-black flex items-center gap-1.5" style={{ color: team.color }}>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                        {team.name}
                      </span>
                      {localPlayer?.teamId === team.id ? (
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded">Your Team</span>
                      ) : (
                        <button
                          onClick={handleSwitchTeam}
                          className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-bold uppercase transition-colors"
                        >
                          Switch <ArrowLeftRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {teamPlayers.length === 0 ? (
                        <p className="text-xs text-slate-600 italic py-2">Empty team slot...</p>
                      ) : (
                        teamPlayers.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-950 p-1 overflow-hidden border border-slate-800">
                                {getAvatarById(p.user.avatarId).render("w-full h-full")}
                              </div>
                              <div className="text-left">
                                <span className="block text-xs font-bold" style={{ color: p.user.nameColor }}>
                                  {p.user.username} {p.isHost && '👑'}
                                </span>
                                <span className="block text-[9px] text-slate-500 font-semibold uppercase">{p.user.title}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {p.isReady ? (
                                <span className="text-emerald-400 bg-emerald-950/25 border border-emerald-900/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Ready</span>
                              ) : (
                                <span className="text-amber-400 bg-amber-950/25 border border-amber-900/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Waiting</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 1v1 / FFA Players List */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/20">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 p-1 overflow-hidden border border-slate-800">
                      {getAvatarById(p.user.avatarId).render("w-full h-full")}
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black flex items-center gap-1.5" style={{ color: p.user.nameColor }}>
                        {p.user.username}
                        {p.isHost && <span className="text-xs" title="Lobby Host">👑</span>}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide">{p.user.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.isReady ? (
                      <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-400 bg-amber-950/40 border border-amber-900/40 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Waiting
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lobby Controller Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={() => { sounds.playClick(); onLeaveRoom(); }}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-900 transition-all font-semibold active:scale-95 text-xs sm:text-sm"
            >
              Leave Lobby
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onToggleReady}
                className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 text-xs sm:text-sm ${
                  isReady 
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {isReady ? 'Unready' : 'Ready Up'}
              </button>

              {isHost && (
                <button
                  onClick={onStartGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black uppercase tracking-wider transition-all active:scale-95 text-xs sm:text-sm"
                >
                  Start Match <Play className="w-4 h-4 fill-current" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Right Column - Lobby Chat */}
      <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-800 glass-panel flex flex-col h-[500px]">
        <h3 className="text-lg font-black text-slate-300 flex items-center gap-2 pb-4 border-b border-slate-800/80">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          Lobby Chat
        </h3>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 p-1">
          {chatMessages.length === 0 ? (
            <p className="text-xs text-slate-600 italic text-center pt-8">No messages yet. Say hello!</p>
          ) : (
            [...chatMessages].reverse().map((msg: any, index: number) => {
              const detailsObj = JSON.parse(msg.details || '{}');
              const isSystem = msg.playerUsername === 'System';
              return (
                <div key={index} className={`text-xs ${isSystem ? 'text-slate-400 text-center italic my-1 bg-slate-900/30 p-1.5 rounded-lg border border-slate-950/20' : 'text-left'}`}>
                  {!isSystem && (
                    <span className="font-extrabold text-sky-400 block mb-0.5">
                      {msg.playerUsername}
                    </span>
                  )}
                  <span className={isSystem ? 'text-[11px] text-slate-500' : 'text-slate-200'}>
                    {detailsObj.message || ''}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendChat} className="flex gap-2 pt-4 border-t border-slate-800/80">
          <input
            type="text"
            required
            maxLength={100}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
            placeholder="Type message..."
          />
          <button
            type="submit"
            className="p-2 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
