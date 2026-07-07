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
import { Home, Send, RefreshCw, AlertTriangle, Zap, Clock, Crown, Scroll } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import { getTileByIndex } from '@/lib/boardConfig';
import { sounds } from '@/lib/sounds';
import { getRandomFlavorMessage } from '@/lib/heroes';

interface ActionError {
  message: string;
  retryable: boolean;
}

// Loading lore tips shown while connecting
const LOADING_LORE = [
  'The ancient gates of Historia creak open…',
  'The Royal Librarians prepare the trials…',
  'Castle bells echo across the realm…',
  'Heroes of Historia answer the call…',
  'The Crown of Wisdom awaits the worthy…',
  'Scrolls of forgotten knowledge are unsealed…',
];

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
  const [flavorMsg, setFlavorMsg] = useState('');
  const [loadingLore] = useState(() => LOADING_LORE[Math.floor(Math.random() * LOADING_LORE.length)]);

  const lastTurnIdRef = useRef<string | null>(null);

  // Rotate flavor messages during active play
  useEffect(() => {
    setFlavorMsg(getRandomFlavorMessage());
    const iv = setInterval(() => setFlavorMsg(getRandomFlavorMessage()), 12000);
    return () => clearInterval(iv);
  }, []);

  // ── Fetch room state ────────────────────────────────────────────────────────
  const fetchRoomState = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`, { cache: 'no-store' });
      if (res.status === 404 || res.status === 410) {
        setError('This Hall has been sealed or does not exist.');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch room');
      const data = await res.json();
      setRoom((prev: any) => {
        const newTurnId = data.turns?.[0]?.id;
        if (newTurnId && newTurnId !== lastTurnIdRef.current) {
          lastTurnIdRef.current = newTurnId;
          if (data.status === 'ACTIVE' && prev?.status === 'ACTIVE') {
            sounds.playClick();
          }
        }
        return data;
      });
      setError(null);
    } catch (err: any) {
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

  // ── Polling ─────────────────────────────────────────────────────────────────
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
        setActionError({ message: msg, retryable: res.status >= 500 });
        return false;
      }
      await fetchRoomState();
      setActionError(null);
      return true;
    } catch (err: any) {
      setActionError({ message: 'The ancient network wavers — please try again.', retryable: true });
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
  const rollDice = (category?: string, difficulty?: string) => executeAction('ROLL_DICE', { category, difficulty });
  const submitAnswer = (answer: string) => executeAction('ANSWER_TRIVIA', { answer });
  const interactTile = (choice: string) => executeAction('INTERACT_TILE', { choice });
  const forceAdvance = () => executeAction('FORCE_ADVANCE');
  const leaveRoom = () => { sounds.playClick(); router.push('/'); };

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-5 p-8">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-amber-900/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="w-20 h-20 rounded-full bg-stone-950 border border-amber-800/40 flex items-center justify-center">
              <Crown className="w-10 h-10 text-amber-500/60 crown-float" />
            </div>
          </div>
          <div className="space-y-2">
            <RefreshCw className="w-5 h-5 text-amber-700/40 animate-spin mx-auto" />
            <p className="text-xs text-amber-700/60 font-bold uppercase tracking-[0.25em]">{loadingLore}</p>
          </div>
          <div className="ornament-divider max-w-48 mx-auto">
            <span>Historia</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Room error ───────────────────────────────────────────────────────────────
  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <div className="w-full max-w-md p-8 rounded-2xl border border-rose-900/40 glass-panel space-y-6 text-center">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <div>
            <p className="text-rose-400 font-black text-base">The Hall Cannot Be Found</p>
            <p className="text-stone-500 text-xs mt-1">{error || 'This great hall does not exist or has been sealed.'}</p>
          </div>
          <button
            onClick={leaveRoom}
            className="px-6 py-2.5 rounded-xl bg-stone-900 border border-stone-800/60 text-[#f5f0e8] font-bold text-xs uppercase hover:bg-stone-800 transition-all"
          >
            Return to Kingdom
          </button>
        </div>
      </div>
    );
  }

  // ── Lobby screen ─────────────────────────────────────────────────────────────
  if (room.status === 'LOBBY') {
    return (
      <main className="min-h-screen py-10 bg-[#0a0a0f] text-[#f5f0e8] relative bg-grid-pattern">
        {/* Ambient top border */}
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent z-50" />
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
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] text-[#f5f0e8] relative bg-grid-pattern">
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent z-50" />
        <MatchSummary
          mode={room.mode}
          winnerUsername={winner?.user.username || 'A Brave Hero'}
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
  //  ACTIVE MATCH VIEW — The Quest Is Underway
  // ════════════════════════════════════════════════════════════════════════════

  const currentTurnRecord = room.turns?.[0] || null;
  const isMyTurn = currentTurnRecord?.activePlayerId === profile?.id;
  const activePlayer = room.players.find((p: any) => p.userId === currentTurnRecord?.activePlayerId);
  const localPlayer = room.players.find((p: any) => p.userId === profile?.id);
  const isHost = localPlayer?.isHost;
  const isTurnStalled = currentTurnRecord?.status === 'COMPLETED';
  const canForceAdvance = isHost && (isTurnStalled || !currentTurnRecord);

  return (
    <main className="min-h-screen p-3 sm:p-5 bg-[#0a0a0f] text-[#f5f0e8] space-y-5 relative pb-24 bg-grid-pattern">

      {/* Ambient top border */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/35 to-transparent z-50 pointer-events-none" />

      {/* Flavor text ticker */}
      {flavorMsg && (
        <div className="fixed top-0.5 left-0 right-0 text-center pointer-events-none z-40">
          <span className="flavor-text text-[9px] text-amber-700/40 tracking-widest">✦ {flavorMsg} ✦</span>
        </div>
      )}

      {/* ── Top HUD ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-2xl border border-amber-900/25 glass-panel gap-4 mt-3">

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 bg-stone-900/60 border border-stone-800/50 rounded-xl text-stone-400 hover:text-amber-300 transition-colors"
            title="Return to Kingdom"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="text-left">
            <span className="block text-[9px] text-stone-500 font-black uppercase tracking-[0.2em]">
              ⚔️ Round {room.round} · Hall {room.code}
            </span>
            <h2 className="text-sm font-black text-[#f5f0e8] flex items-center gap-2 mt-0.5">
              {!currentTurnRecord ? (
                <span className="text-stone-500">Awaiting the first roll…</span>
              ) : isTurnStalled ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Advancing the quest…
                </span>
              ) : isMyTurn ? (
                <span className="text-amber-300 animate-pulse flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Your Turn, Hero! ⚜
                </span>
              ) : (
                <span className="text-stone-300">
                  {activePlayer?.user.username || '…'}&apos;s Turn
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Players Quick HUD — "Heroes of the Quest" */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {room.players.map((p: any) => {
            const isActive = p.userId === activePlayer?.userId;
            return (
              <div
                key={p.id}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'border-amber-600/50 bg-amber-950/25 shadow-md shadow-amber-900/15'
                    : 'border-stone-800/50 bg-stone-900/30 opacity-65'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-stone-950 p-0.5 overflow-hidden border border-stone-800/40">
                  {getAvatarById(p.user.avatarId).render('w-full h-full')}
                </div>
                <div className="text-left">
                  <span
                    className="block text-[10px] leading-tight font-black"
                    style={{ color: p.user.nameColor }}
                  >
                    {p.user.username}
                    {p.isHost ? ' 👑' : ''}
                    {!p.isConnected ? ' (away)' : ''}
                  </span>
                  <span className="block text-[8px] text-stone-500 leading-none mt-0.5">
                    Tile {p.position} · {p.coins}g
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Host Force Advance */}
        {canForceAdvance && (
          <button
            onClick={forceAdvance}
            disabled={actionPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-700/40 bg-amber-950/25 text-amber-400 hover:bg-amber-950/50 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 shrink-0"
            title="Host: Force-advance the turn"
          >
            <Zap className="w-3.5 h-3.5" /> Force Advance
          </button>
        )}
      </div>

      {/* ── Action error banner ─────────────────────────────────────────────── */}
      {actionError && (
        <div className="max-w-6xl mx-auto p-4 rounded-2xl border border-rose-800/40 bg-rose-950/15 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-rose-400 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {actionError.message}
          </div>
          {actionError.retryable && (
            <button
              onClick={() => setActionError(null)}
              className="text-xs text-rose-300 hover:text-[#f5f0e8] shrink-0 underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* ── Royal Decree (Global Event) ─────────────────────────────────────── */}
      {room.activeEvent && (
        <div className="max-w-6xl mx-auto">
          <DynamicEventPanel eventName={room.activeEvent} roundsLeft={room.eventRoundsLeft} />
        </div>
      )}

      {/* ── Sacred Board of Historia ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto">
        <GameBoard players={room.players} activePlayerId={activePlayer?.userId || ''} />
      </div>

      {/* ── Controls Grid ────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Turn phase window ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* No turn yet */}
          {!currentTurnRecord && (
            <div className="p-6 border border-stone-800/50 glass-panel rounded-2xl text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-stone-600 animate-spin mx-auto" />
              <p className="text-sm text-stone-400 font-bold italic">Awaiting the first roll of the ancient dice…</p>
              {isHost && (
                <button
                  onClick={forceAdvance}
                  disabled={actionPending}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                >
                  Begin the Quest
                </button>
              )}
            </div>
          )}

          {/* Turn stalled */}
          {isTurnStalled && (
            <div className="p-6 border border-amber-900/25 bg-amber-950/10 glass-panel rounded-2xl text-center space-y-2">
              <Clock className="w-6 h-6 text-amber-500/60 animate-spin mx-auto" />
              <p className="text-sm text-amber-400 font-bold">The herald advances the quest…</p>
              <p className="text-[10px] text-stone-600 italic">
                "This advances automatically. If stuck, the host may use Force Advance."
              </p>
            </div>
          )}

          {currentTurnRecord && currentTurnRecord.status !== 'COMPLETED' && (
            <div className="space-y-4">

              {/* ROLLING */}
              {currentTurnRecord.status === 'ROLLING' && (
                <div className="space-y-4">
                  <DiceRoller
                    onRoll={rollDice}
                    disabled={!isMyTurn || actionPending}
                    luckyDiceActive={localPlayer?.luckyDiceActive}
                  />
                  {!isMyTurn && activePlayer && (
                    <div className="text-center p-4 rounded-2xl border border-stone-800/40 glass-panel">
                      <p className="text-sm text-stone-400 italic">
                        Awaiting <span className="font-black text-amber-300">{activePlayer.user.username}</span> to cast the dice…
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TRIVIA */}
              {currentTurnRecord.status === 'TRIVIA' && (
                <div className="space-y-4">
                  <TriviaQuiz
                    questionText={currentTurnRecord.questionText || ''}
                    category={currentTurnRecord.questionCategory || 'General Knowledge'}
                    difficulty={currentTurnRecord.questionDifficulty || 'MEDIUM'}
                    options={JSON.parse(currentTurnRecord.questionOptions || '[]')}
                    correctAnswer={currentTurnRecord.questionCorrectAnswer || ''}
                    funFact={currentTurnRecord.questionFunFact}
                    timeLimit={currentTurnRecord.timeRemaining || 15}
                    rollValue={currentTurnRecord.rollValue || 1}
                    onSubmitAnswer={submitAnswer}
                  />
                  {!isMyTurn && activePlayer && (
                    <div className="text-center p-4 rounded-2xl border border-amber-900/25 bg-amber-950/10">
                      <p className="text-sm text-amber-300 font-bold animate-pulse">
                        📜 {activePlayer.user.username} faces the ancient trial…
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TILE_EFFECT */}
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
                    <div className="text-center p-4 rounded-2xl border border-amber-900/25 bg-amber-950/10">
                      <p className="text-sm text-amber-300 font-bold animate-pulse">
                        ⚔️ {activePlayer.user.username} encounters a tile of fate…
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Merchant's Caravan (Item Shop) */}
          <ItemShop
            playerCoins={localPlayer?.coins || 0}
            playerAvatarId={localPlayer?.user.avatarId}
            onBuyItem={buyItem}
            disabled={actionPending}
            activeItems={{
              shieldActive: localPlayer?.shieldActive,
              extraTimeActive: localPlayer?.extraTimeActive,
              luckyDiceActive: localPlayer?.luckyDiceActive,
              trapImmunity: localPlayer?.trapImmunity,
              doubleCoinsActive: localPlayer?.doubleCoinsActive,
            }}
          />

          {/* Chronicles (Action Log + Chat) */}
          <div className="p-4 border border-stone-800/40 glass-panel rounded-2xl flex flex-col h-64">
            <div className="flex items-center gap-1.5 pb-2 border-b border-stone-800/40 mb-1">
              <Scroll className="w-3.5 h-3.5 text-amber-700/50" />
              <h3 className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">
                Chronicles · Quest Log
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto py-1 space-y-1.5 text-left">
              {[...room.actions].reverse().map((act: any, idx: number) => {
                const det = JSON.parse(act.details || '{}');
                const isSystem = act.playerUsername === 'System';
                return (
                  <div key={idx} className="text-[9px] leading-snug">
                    {!isSystem && (
                      <span className="font-black text-amber-500/70 mr-1">{act.playerUsername}:</span>
                    )}
                    <span className={isSystem ? 'text-stone-600 italic' : 'text-stone-300'}>
                      {det.message}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-stone-800/40">
              <input
                type="text"
                maxLength={200}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-[10px]"
                placeholder="Speak to your allies…"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-1.5 bg-amber-700 hover:bg-amber-600 text-stone-950 rounded-xl transition-all disabled:opacity-40"
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
