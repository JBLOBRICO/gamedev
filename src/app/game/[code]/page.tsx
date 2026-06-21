'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import GameBoard from '@/components/GameBoard';
import DiceRoller from '@/components/DiceRoller';
import TriviaQuiz from '@/components/TriviaQuiz';
import ItemShop from '@/components/ItemShop';
import TileInteractPanel from '@/components/TileInteractPanel';
import DynamicEventPanel from '@/components/DynamicEventPanel';
import MatchSummary from '@/components/MatchSummary';
import LobbyScreen from '@/components/LobbyScreen';
import SoundSettings from '@/components/SoundSettings';
import { Home, Send, RefreshCw } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import { getTileByIndex } from '@/lib/boardConfig';
import { sounds } from '@/lib/sounds';


export default function GameRoom({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { profile } = useProfile();
  
  const [room, setRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Local turn states for active player optimization
  const [pollingActive, setPollingActive] = useState(true);

  const fetchRoomState = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) {
        throw new Error('Room not found or cleaned up');
      }
      const data = await res.json();
      setRoom(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sync game state');
    } finally {
      setLoading(false);
    }
  }, [code]);

  // Heartbeat / Active Sync loop
  useEffect(() => {
    fetchRoomState();
    
    // Heartbeat reporting
    const heartbeatTimer = setInterval(() => {
      if (!profile) return;
      fetch(`/api/rooms/${code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'HEARTBEAT', userId: profile.id })
      }).catch(() => {});
    }, 4000);

    return () => clearInterval(heartbeatTimer);
  }, [code, profile, fetchRoomState]);

  // Game state polling (every 1.5 seconds)
  useEffect(() => {
    if (!pollingActive) return;

    const pollTimer = setInterval(() => {
      fetchRoomState();
    }, 1500);

    return () => clearInterval(pollTimer);
  }, [code, pollingActive, fetchRoomState]);

  // Custom action triggers
  const executeAction = async (action: string, details: any = null) => {
    if (!profile) return;
    sounds.playClick();
    
    try {
      const res = await fetch(`/api/rooms/${code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId: profile.id,
          details
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Action failed');
      }

      await fetchRoomState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Switch team helper for lobby
  const toggleReady = () => executeAction('LOBBY_READY');
  const startGame = () => executeAction('START_GAME');
  
  const sendChat = (msg: string) => {
    executeAction('CHAT', { message: msg });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput('');
  };

  const buyItem = (itemId: string, cost: number) => {
    executeAction('BUY_ITEM', { itemId, cost });
  };

  const rollDice = () => {
    setPollingActive(false); // Pause poll to animate roll
    executeAction('ROLL_DICE').finally(() => setPollingActive(true));
  };

  const submitAnswer = (answer: string) => {
    setPollingActive(false); // Pause poll to animate answer result
    executeAction('ANSWER_TRIVIA', { answer }).finally(() => setPollingActive(true));
  };

  const interactTile = (choice: string) => {
    executeAction('INTERACT_TILE', { choice });
  };

  const endTurn = () => {
    executeAction('END_TURN');
  };

  const leaveRoom = () => {
    sounds.playClick();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Syncing Room State...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800 glass-panel space-y-6 text-center">
          <p className="text-rose-400 font-extrabold">{error || 'Room not found.'}</p>
          <button 
            onClick={leaveRoom}
            className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs uppercase"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Pre-game lobby screen render
  if (room.status === 'LOBBY') {
    return (
      <main className="min-h-screen py-10 bg-slate-950 text-white relative">
        <LobbyScreen
          roomCode={room.code}
          mode={room.mode}
          players={room.players}
          teams={room.teams}
          currentUserId={profile?.id || ''}
          chatMessages={room.actions}
          onToggleReady={toggleReady}
          onStartGame={startGame}
          onSendChat={sendChat}
          onLeaveRoom={leaveRoom}
        />
        <SoundSettings />
      </main>
    );
  }

  // Finished Match view
  if (room.status === 'FINISHED') {
    const winner = room.players.find((p: any) => p.userId === room.winnerId);
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white relative">
        <MatchSummary
          mode={room.mode}
          winnerUsername={winner?.user.username || 'Someone'}
          roundCount={room.round}
          players={room.players.map((p: any) => ({
            username: p.user.username,
            avatarId: p.user.avatarId,
            coinsEarned: p.coins,
            xpEarned: p.coins * 5 + 50,
            correctAnswers: p.user.correctAnswers,
            incorrectAnswers: p.user.incorrectAnswers,
            longestStreak: p.user.longestStreak,
            rank: p.userId === room.winnerId ? 1 : 2
          }))}
          onPlayAgain={async () => {
            // Reset lobby back to lobby state
            sounds.playClick();
            try {
              await fetch(`/api/rooms/${code}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'START_GAME', userId: profile?.id, details: { reset: true } })
              });
            } catch {}
          }}
          onLeave={leaveRoom}
        />
        <SoundSettings />
      </main>
    );
  }

  // ACTIVE MATCH VIEW
  const currentTurnRecord = room.turns[0];
  const isMyTurn = currentTurnRecord?.activePlayerId === profile?.id;
  const activePlayer = room.players.find((p: any) => p.userId === currentTurnRecord?.activePlayerId);
  const localPlayer = room.players.find((p: any) => p.userId === profile?.id);

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6 relative pb-24">
      
      {/* Top HUD */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-2xl border border-slate-800 glass-panel gap-4">
        
        {/* Turn Indicator */}
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <div className="text-left">
            <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
              Round {room.round}
            </span>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              {isMyTurn ? (
                <span className="text-sky-400 animate-pulse">Your Turn! 🌟</span>
              ) : (
                <span>{activePlayer?.user.username}&apos;s Turn</span>
              )}
            </h2>
          </div>
        </div>

        {/* Players Quick HUD */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {room.players.map((p: any) => (
            <div
              key={p.id}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                p.userId === activePlayer?.userId 
                  ? 'border-sky-400 bg-sky-500/10 shadow-md shadow-sky-500/10' 
                  : 'border-slate-800 bg-slate-900/40 opacity-70'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-950 p-0.5 overflow-hidden">
                {getAvatarById(p.user.avatarId).render("w-full h-full")}
              </div>
              <div className="text-left">
                <span className="block text-[10px] leading-tight" style={{ color: p.user.nameColor }}>
                  {p.user.username}
                </span>
                <span className="block text-[8px] text-slate-400 leading-none mt-0.5">
                  Tile {p.position} • {p.coins}g
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Event Display */}
      {room.activeEvent && (
        <div className="max-w-6xl mx-auto">
          <DynamicEventPanel eventName={room.activeEvent} roundsLeft={room.eventRoundsLeft} />
        </div>
      )}

      {/* Main Board Arena */}
      <div className="max-w-6xl mx-auto">
        <GameBoard players={room.players} activePlayerId={activePlayer?.userId || ''} />
      </div>

      {/* Controls & Details Split */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Turn phase window */}
        <div className="lg:col-span-2 space-y-6">
          {currentTurnRecord && (
            <div className="p-2">
              {/* Rolling phase */}
              {currentTurnRecord.status === 'ROLLING' && (
                <DiceRoller
                  onRoll={rollDice}
                  disabled={!isMyTurn}
                  luckyDiceActive={localPlayer?.luckyDiceActive}
                />
              )}

              {/* Trivia phase */}
              {currentTurnRecord.status === 'TRIVIA' && (
                <TriviaQuiz
                  questionText={currentTurnRecord.questionText || ''}
                  category={currentTurnRecord.questionCategory || 'General'}
                  difficulty={currentTurnRecord.questionDifficulty || 'MEDIUM'}
                  options={JSON.parse(currentTurnRecord.questionOptions || '[]')}
                  correctAnswer={currentTurnRecord.questionCorrectAnswer || ''}
                  timeLimit={currentTurnRecord.timeRemaining || 15}
                  onSubmitAnswer={submitAnswer}
                />
              )}

              {/* Tile Effect selection phase */}
              {currentTurnRecord.status === 'TILE_EFFECT' && (
                <TileInteractPanel
                  tileType={currentTurnRecord.tileType as any}
                  tileName={getTileByIndex(activePlayer?.position || 0).name}
                  tileDescription={getTileByIndex(activePlayer?.position || 0).description}
                  playerCoins={activePlayer?.coins || 0}
                  hasShield={activePlayer?.shieldActive || activePlayer?.trapImmunity || false}
                  onChoice={interactTile}
                  disabled={!isMyTurn}
                />
              )}

              {/* Completed Turn (End Turn wait) */}
              {currentTurnRecord.status === 'COMPLETED' && (
                <div className="text-center p-6 border border-slate-800 glass-panel rounded-2xl space-y-4 max-w-sm mx-auto">
                  <p className="text-xs text-slate-400 font-bold">
                    Turn completed! Let&apos;s advance.
                  </p>
                  <button
                    disabled={!isMyTurn}
                    onClick={endTurn}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black uppercase text-xs transition-all active:scale-95"
                  >
                    Advance Turn
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shop power-up purchases */}
        <div className="lg:col-span-1 space-y-6">
          <ItemShop
            playerCoins={localPlayer?.coins || 0}
            onBuyItem={buyItem}
            disabled={!isMyTurn || currentTurnRecord?.status !== 'ROLLING'}
          />

          {/* Connected Chats & Logs */}
          <div className="p-5 border border-slate-800 glass-panel rounded-2xl h-64 flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-800">
              Lobby Action Logs
            </h3>
            
            <div className="flex-1 overflow-y-auto py-2 space-y-2 text-left">
              {room.actions.map((act: any, idx: number) => {
                const det = JSON.parse(act.details || '{}');
                return (
                  <div key={idx} className="text-[10px] leading-tight">
                    {act.playerUsername && act.playerUsername !== 'System' && (
                      <span className="font-extrabold text-sky-400 mr-1">{act.playerUsername}:</span>
                    )}
                    <span className={act.playerUsername === 'System' ? 'text-slate-500 italic' : 'text-slate-300'}>
                      {det.message}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800/60">
              <input
                type="text"
                required
                maxLength={100}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-[11px]"
                placeholder="Say something..."
              />
              <button type="submit" className="p-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl transition-all">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>

      <SoundSettings />
    </main>
  );
}
