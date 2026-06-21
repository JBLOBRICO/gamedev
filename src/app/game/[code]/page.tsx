'use client';

import React, { useEffect, useState, use, useCallback, useRef } from 'react';
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
import { Home, Send, RefreshCw, AlertTriangle, Zap, Clock } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import { getTileByIndex } from '@/lib/boardConfig';
import { sounds } from '@/lib/sounds';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActionError {
  message: string;
  retryable: boolean;
}

export default function GameRoom({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { profile } = useProfile();

  const [room, setRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [actionError, setActionError] = useState<ActionError | null>(null);
  const [actionPending, setActionPending] = useState(false);

  // Track last turn ID to detect turn changes (for sound cues)
  const lastTurnIdRef = useRef<string | null>(null);
  const lastTurnStatusRef = useRef<string | null>(null);

  // ── Fetch room state ────────────────────────────────────────────────────────
  const fetchRoomState = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`, { cache: 'no-store' });
      if (res.status === 404 || res.status === 410) {
        setError('Room not found or has been closed.');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch room');
      const data = await res.json();
      setRoom((prev: any) => {
        // Detect new turn (someone advanced)
        const newTurnId = data.turns?.[0]?.id;
        if (newTurnId && newTurnId !== lastTurnIdRef.current) {
          lastTurnIdRef.current = newTurnId;
          // Only play sound if game is active
          if (data.status === 'ACTIVE' && prev?.status === 'ACTIVE') {
            sounds.playClick();
          }
        }
        return data;
      });
      setError(null);
    } catch (err: any) {
      // Don't show transient network errors while actively playing
      console.error('Poll error:', err);
    } finally {
      setLoading(false);
    }
  }, [code]);

  // ── Heartbeat ───────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRoomState();

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

  // ── Polling (1.5s) ───────────────────────────────────────────────────────────
  useEffect(() => {
    const pollTimer = setInterval(() => fetchRoomState(), 1500);
    return () => clearInterval(pollTimer);
  }, [fetchRoomState]);

  // ── Action executor ──────────────────────────────────────────────────────────
  const executeAction = useCallback(async (action: string, details: any = null): Promise<boolean> => {
    if (!profile) return false;
    if (actionPending) return false;

    setActionPending(true);
    setActionError(null);
    sounds.playClick();

    try {
      const res = await fetch(`/api/rooms/${code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: profile.id, details })
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error || 'Action failed';
        const isRetryable = res.status >= 500;
        setActionError({ message: msg, retryable: isRetryable });
        return false;
      }

      // Immediately refresh room state after successful action
      await fetchRoomState();
      setActionError(null);
      return true;
    } catch (err: any) {
      setActionError({ message: 'Network error — please try again.', retryable: true });
      return false;
    } finally {
      setActionPending(false);
    }
  }, [profile, code, fetchRoomState, actionPending]);

  // ── Game actions ─────────────────────────────────────────────────────────────
  const toggleReady = () => executeAction('LOBBY_READY');
  const startGame = () => executeAction('START_GAME');
  const sendChat = (msg: string) => { if (msg.trim()) executeAction('CHAT', { message: msg }); };
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput('');
  };

  const buyItem = (itemId: string, cost: number) => executeAction('BUY_ITEM', { itemId, cost });
  const rollDice = (category?: string, difficulty?: string) =>
    executeAction('ROLL_DICE', { category, difficulty });
  const submitAnswer = (answer: string) => executeAction('ANSWER_TRIVIA', { answer });
  const interactTile = (choice: string) => executeAction('INTERACT_TILE', { choice });
  const forceAdvance = () => executeAction('FORCE_ADVANCE');
  const leaveRoom = () => { sounds.playClick(); router.push('/'); };

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Connecting to Room…</p>
        </div>
      </div>
    );
  }

  // ── Room error ───────────────────────────────────────────────────────────────
  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800 glass-panel space-y-6 text-center">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <p className="text-rose-400 font-extrabold">{error || 'Room not found.'}</p>
          <button
            onClick={leaveRoom}
            className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs uppercase hover:bg-slate-800 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Lobby screen ─────────────────────────────────────────────────────────────
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

  // ── Finished screen ───────────────────────────────────────────────────────────
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
            sounds.playClick();
            await executeAction('START_GAME', { reset: true });
          }}
          onLeave={leaveRoom}
        />
        <SoundSettings />
      </main>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  ACTIVE MATCH VIEW
  // ════════════════════════════════════════════════════════════════════════════

  const currentTurnRecord = room.turns?.[0] || null;
  const isMyTurn = currentTurnRecord?.activePlayerId === profile?.id;
  const activePlayer = room.players.find((p: any) => p.userId === currentTurnRecord?.activePlayerId);
  const localPlayer = room.players.find((p: any) => p.userId === profile?.id);
  const isHost = localPlayer?.isHost;

  // Detect a stalled turn (COMPLETED but waiting for next turn to appear)
  const isTurnStalled = currentTurnRecord?.status === 'COMPLETED';
  const canForceAdvance = isHost && (isTurnStalled || !currentTurnRecord);

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6 relative pb-24">

      {/* ── Top HUD ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-2xl border border-slate-800 glass-panel gap-4">

        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors" title="Leave room">
            <Home className="w-4 h-4" />
          </Link>
          <div className="text-left">
            <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
              Round {room.round} • Room {room.code}
            </span>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              {!currentTurnRecord ? (
                <span className="text-slate-400">Loading turn…</span>
              ) : isTurnStalled ? (
                <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Advancing turn…</span>
              ) : isMyTurn ? (
                <span className="text-sky-400 animate-pulse">Your Turn! 🌟</span>
              ) : (
                <span>{activePlayer?.user.username || '…'}&apos;s Turn</span>
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
                {getAvatarById(p.user.avatarId).render('w-full h-full')}
              </div>
              <div className="text-left">
                <span className="block text-[10px] leading-tight" style={{ color: p.user.nameColor }}>
                  {p.user.username}{p.isHost ? ' 👑' : ''}{!p.isConnected ? ' (away)' : ''}
                </span>
                <span className="block text-[8px] text-slate-400 leading-none mt-0.5">
                  Tile {p.position} • {p.coins}g
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Host Force Advance */}
        {canForceAdvance && (
          <button
            onClick={forceAdvance}
            disabled={actionPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
            title="Host: Force-advance to the next player's turn"
          >
            <Zap className="w-3.5 h-3.5" /> Force Advance
          </button>
        )}
      </div>

      {/* ── Action error banner ────────────────────────────────────────────── */}
      {actionError && (
        <div className="max-w-6xl mx-auto p-4 rounded-2xl border border-rose-800/50 bg-rose-950/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-rose-400 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {actionError.message}
          </div>
          {actionError.retryable && (
            <button
              onClick={() => setActionError(null)}
              className="text-xs text-rose-300 hover:text-white shrink-0 underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* ── Global Event ──────────────────────────────────────────────────────── */}
      {room.activeEvent && (
        <div className="max-w-6xl mx-auto">
          <DynamicEventPanel eventName={room.activeEvent} roundsLeft={room.eventRoundsLeft} />
        </div>
      )}

      {/* ── Board ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto">
        <GameBoard players={room.players} activePlayerId={activePlayer?.userId || ''} />
      </div>

      {/* ── Controls Grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Turn phase window */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── No turn yet (recovery state) ───────────────────────────────── */}
          {!currentTurnRecord && (
            <div className="p-6 border border-slate-800 glass-panel rounded-2xl text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-slate-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400 font-bold">Waiting for the first turn…</p>
              {isHost && (
                <button
                  onClick={forceAdvance}
                  disabled={actionPending}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                >
                  Force Start Turn
                </button>
              )}
            </div>
          )}

          {/* ── Turn stalled (COMPLETED, auto-advance in-flight) ────────────── */}
          {isTurnStalled && (
            <div className="p-6 border border-amber-900/30 bg-amber-950/10 glass-panel rounded-2xl text-center space-y-3">
              <Clock className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-amber-300 font-bold">Turn completed — advancing to next player…</p>
              <p className="text-xs text-slate-500">This should happen automatically. If it&apos;s stuck, the host can force-advance.</p>
            </div>
          )}

          {currentTurnRecord && currentTurnRecord.status !== 'COMPLETED' && (
            <div className="p-2 space-y-4">

              {/* ── ROLLING phase ──────────────────────────────────────────── */}
              {currentTurnRecord.status === 'ROLLING' && (
                <div className="space-y-4">
                  <DiceRoller
                    onRoll={rollDice}
                    disabled={!isMyTurn || actionPending}
                    luckyDiceActive={localPlayer?.luckyDiceActive}
                  />
                  {!isMyTurn && activePlayer && (
                    <div className="text-center p-4 rounded-2xl border border-slate-800 glass-panel">
                      <p className="text-sm text-slate-400">
                        Waiting for <span className="font-black text-white">{activePlayer.user.username}</span> to roll…
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TRIVIA phase ────────────────────────────────────────────── */}
              {currentTurnRecord.status === 'TRIVIA' && (
                <div className="space-y-4">
                  <TriviaQuiz
                    questionText={currentTurnRecord.questionText || ''}
                    category={currentTurnRecord.questionCategory || 'General'}
                    difficulty={currentTurnRecord.questionDifficulty || 'MEDIUM'}
                    options={JSON.parse(currentTurnRecord.questionOptions || '[]')}
                    correctAnswer={currentTurnRecord.questionCorrectAnswer || ''}
                    timeLimit={currentTurnRecord.timeRemaining || 15}
                    onSubmitAnswer={submitAnswer}
                  />
                  {!isMyTurn && activePlayer && (
                    <div className="text-center p-4 rounded-2xl border border-indigo-900/40 bg-indigo-950/10">
                      <p className="text-sm text-indigo-300 font-bold animate-pulse">
                        ⏳ {activePlayer.user.username} is answering…
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TILE_EFFECT phase ───────────────────────────────────────── */}
              {currentTurnRecord.status === 'TILE_EFFECT' && (
                <div className="space-y-4">
                  <TileInteractPanel
                    tileType={currentTurnRecord.tileType as any}
                    tileName={getTileByIndex(activePlayer?.position || 0).name}
                    tileDescription={getTileByIndex(activePlayer?.position || 0).description}
                    playerCoins={activePlayer?.coins || 0}
                    hasShield={activePlayer?.shieldActive || activePlayer?.trapImmunity || false}
                    onChoice={interactTile}
                    disabled={!isMyTurn || actionPending}
                  />
                  {!isMyTurn && activePlayer && (
                    <div className="text-center p-4 rounded-2xl border border-amber-900/40 bg-amber-950/10">
                      <p className="text-sm text-amber-300 font-bold animate-pulse">
                        🎯 {activePlayer.user.username} is choosing their tile action…
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Item Shop */}
          <ItemShop
            playerCoins={localPlayer?.coins || 0}
            onBuyItem={buyItem}
            disabled={!isMyTurn || currentTurnRecord?.status !== 'ROLLING' || actionPending}
          />

          {/* Action Log / Chat */}
          <div className="p-5 border border-slate-800 glass-panel rounded-2xl h-64 flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-800">
              Game Log
            </h3>

            <div className="flex-1 overflow-y-auto py-2 space-y-1.5 text-left">
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
                maxLength={200}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-[11px]"
                placeholder="Say something…"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl transition-all disabled:opacity-50"
              >
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
