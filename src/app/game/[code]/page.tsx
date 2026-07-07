'use client';

import React, { useEffect, useState, use, useCallback, useRef, Component, ErrorInfo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import HeroJournal from '@/components/HeroJournal';
import { Home, Send, RefreshCw, AlertTriangle, Zap, Clock, Crown, Scroll, BookOpen, Flame, WifiOff, Flag } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';
import { getTileByIndex } from '@/lib/boardConfig';
import { sounds } from '@/lib/sounds';
import { getRandomFlavorMessage, getHeroByAvatarId } from '@/lib/heroes';

interface ActionError {
  message: string;
  retryable: boolean;
}

// ── Error Boundary ────────────────────────────────────────────────────────────
class GameErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GameErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
          <div className="w-full max-w-md p-8 rounded-2xl border border-rose-900/40 glass-panel space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-rose-400 font-black text-base">A Dark Spell Has Disrupted the Board</p>
            <p className="text-stone-500 text-xs">{this.state.errorMsg}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl bg-amber-600 text-stone-950 font-black text-xs uppercase">
              Reload the Realm
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading lore tips
const LOADING_LORE = [
  'The ancient gates of Historia creak open-',
  'The Royal Librarians prepare the trials-',
  'Castle bells echo across the realm-',
  'Heroes of Historia answer the call-',
  'The Crown of Wisdom awaits the worthy-',
  'Scrolls of forgotten knowledge are unsealed-',
];

const BOARD_SIZE = 46; // tiles 0–45

export default function GameRoom({ params }: { params: Promise<{ code: string }> }) {
  return (
    <GameErrorBoundary>
      <GameRoomInner params={params} />
    </GameErrorBoundary>
  );
}

function GameRoomInner({ params }: { params: Promise<{ code: string }> }) {
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
  const [journalOpen, setJournalOpen] = useState(false);
  const [loadingLore] = useState(() => LOADING_LORE[Math.floor(Math.random() * LOADING_LORE.length)]);
  const [turnTransition, setTurnTransition] = useState<string | null>(null);
  const prevActivePlayerRef = useRef<string | null>(null);
  const [lastRollValue, setLastRollValue] = useState<number | null>(null);
  const [lastLandedTileType, setLastLandedTileType] = useState<string | null>(null);
  const prevTileRef = useRef<Record<string, number>>({});
  // G: XP — fetched from profile, already available via useProfile
  // H: Achievement popups
  const [achievements, setAchievements] = useState<{ id: string; title: string; icon: string; desc: string }[]>([]);
  // J: Mobile tab
  const [mobileTab, setMobileTab] = useState<'board' | 'controls'>('board');
  // K: Floating chat
  const [chatOpen, setChatOpen] = useState(false);

  const lastTurnIdRef = useRef<string | null>(null);

  // Rotate flavor messages during active play
  useEffect(() => {
    setFlavorMsg(getRandomFlavorMessage());
    const iv = setInterval(() => setFlavorMsg(getRandomFlavorMessage()), 12000);
    return () => clearInterval(iv);
  }, []);

  // -- Fetch room state --------------------------------------------------------
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
          // Capture roll value for dice reveal
          const rv = data.turns?.[0]?.rollValue;
          if (rv) setLastRollValue(rv);
        }
        // Detect turn change for transition overlay
        const newActiveId = data.turns?.[0]?.activePlayerId;
        if (newActiveId && newActiveId !== prevActivePlayerRef.current && data.status === 'ACTIVE') {
          const newActivePlayer = data.players?.find((p: any) => p.userId === newActiveId);
          if (newActivePlayer && prevActivePlayerRef.current !== null) {
            setTurnTransition(newActivePlayer.user.username);
            setTimeout(() => setTurnTransition(null), 2500);
          }
          prevActivePlayerRef.current = newActiveId;
          // H: streak achievements
          const me = data.players?.find((p: any) => p.userId === profile?.id);
          if (me?.currentStreak >= 3) {
            setAchievements(prev => {
              const id = 'streak_3';
              if (prev.find(a => a.id === id)) return prev;
              const a = { id, title: 'On Fire!', icon: '🔥', desc: '3 correct answers in a row' };
              setTimeout(() => setAchievements(p => p.filter(x => x.id !== id)), 4000);
              return [...prev, a];
            });
          }
        }
        // Tile landing sounds — fire when a player's position changes
        if (data.status === 'ACTIVE') {
          data.players?.forEach((p: any) => {
            const prevPos = prevTileRef.current[p.userId];
            if (prevPos !== undefined && prevPos !== p.position) {
              const tile = getTileByIndex(p.position);
              switch (tile.type) {
                case 'TRAP':       sounds.playTrap();     break;
                case 'TREASURE':   sounds.playTreasure(); break;
                case 'TELEPORT':   sounds.playTeleport(); break;
                case 'COIN_BONUS':
                case 'BONUS':      sounds.playBonus();    break;
                case 'SKIP_TURN':  sounds.playSkip();     break;
                default:           sounds.playDiceLand(); break;
              }
              setLastLandedTileType(tile.type);
              // H: Achievement triggers
              const triggerAchievement = (id: string, title: string, icon: string, desc: string) => {
                setAchievements(prev => {
                  if (prev.find(a => a.id === id)) return prev;
                  const a = { id, title, icon, desc };
                  setTimeout(() => setAchievements(p => p.filter(x => x.id !== id)), 4000);
                  return [...prev, a];
                });
              };
              if (tile.type === 'TRAP') triggerAchievement('first_trap', 'Cursed!', '💀', 'Landed on your first trap');
              if (tile.type === 'TREASURE') triggerAchievement('treasure_hunter', 'Treasure Hunter', '💰', 'Found a hidden treasury');
              if (tile.type === 'TELEPORT') triggerAchievement('teleporter', 'Through the Void', '⚡', 'Used a teleport tile');
            }
            prevTileRef.current[p.userId] = p.position;
          });
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

  // -- Heartbeat ---------------------------------------------------------------
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

  // -- Polling -----------------------------------------------------------------
  useEffect(() => {
    const pollTimer = setInterval(() => fetchRoomState(), 1500);
    return () => clearInterval(pollTimer);
  }, [fetchRoomState]);

  // -- Action executor ----------------------------------------------------------
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
      setActionError({ message: 'The ancient network wavers - please try again.', retryable: true });
      return false;
    } finally {
      setActionPending(false);
    }
  }, [profile, code, fetchRoomState, actionPending]);

  // -- Game actions -------------------------------------------------------------
  const toggleReady = () => executeAction('LOBBY_READY');
  const startGame = (categories?: string[]) => executeAction('START_GAME', categories ? { categories } : undefined);
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

  // -- Loading screen -----------------------------------------------------------
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

  // -- Room error ---------------------------------------------------------------
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

  // -- Lobby screen -------------------------------------------------------------
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

  // -- Finished screen -----------------------------------------------------------
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

  // ----------------------------------------------------------------------------
  //  ACTIVE MATCH VIEW - The Quest Is Underway
  // ----------------------------------------------------------------------------

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
          <span className="flavor-text text-[9px] text-amber-700/40 tracking-widest">- {flavorMsg} -</span>
        </div>
      )}

      {/* -- Top HUD ----------------------------------------------------------- */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-2xl border border-amber-900/25 glass-panel gap-4 mt-3">

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 bg-stone-900/60 border border-stone-800/50 rounded-xl text-stone-400 hover:text-amber-300 transition-colors"
            title="Return to Kingdom"
          >
            <Home className="w-4 h-4" />
          </Link>
          <button
            onClick={() => { sounds.playClick(); setJournalOpen(true); }}
            className="p-2 bg-amber-900/40 border border-amber-800/50 rounded-xl text-amber-500 hover:text-amber-300 hover:bg-amber-800/50 transition-colors"
            title="Chronicles of Historia"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <div className="text-left">
            <span className="block text-[9px] text-stone-500 font-black uppercase tracking-[0.2em]">
              -- Round {room.round} - Hall {room.code}
            </span>
            <h2 className="text-sm font-black text-[#f5f0e8] flex items-center gap-2 mt-0.5">
              {!currentTurnRecord ? (
                <span className="text-stone-500">Awaiting the first roll-</span>
              ) : isTurnStalled ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Advancing the quest-
                </span>
              ) : isMyTurn ? (
                <span className="text-amber-300 animate-pulse flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Your Turn, Hero! -
                </span>
              ) : (
                <span className="text-stone-300">
                  {activePlayer?.user.username || '-'}&apos;s Turn
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Players Quick HUD - with rank badges */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[...room.players]
            .sort((a: any, b: any) => b.position - a.position)
            .map((p: any, rankIdx: number) => {
            const isActive = p.userId === activePlayer?.userId;
            const rankEmojis = ['🥇','🥈','🥉','4️⃣'];
            const streak = p.currentStreak || 0;
            return (
              <div
                key={p.id}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'border-amber-600/50 bg-amber-950/25 shadow-md shadow-amber-900/15'
                    : 'border-stone-800/50 bg-stone-900/30 opacity-65'
                }`}
              >
                <span className="text-sm leading-none">{rankEmojis[rankIdx] ?? `#${rankIdx+1}`}</span>
                <div className="relative w-6 h-6 rounded-full bg-stone-950 p-0.5 overflow-hidden border border-stone-800/40">
                  {getAvatarById(p.user.avatarId).render('w-full h-full')}
                  {/* G: Level badge */}
                  {p.user.level && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-600 text-stone-950 font-black text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-stone-950 leading-none">
                      {p.user.level}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <span className="block text-[10px] leading-tight font-black" style={{ color: p.user.nameColor }}>
                    {p.user.username}
                    {p.isHost ? ' 👑' : ''}
                    {!p.isConnected ? ' (away)' : ''}
                  </span>
                  <span className="block text-[8px] text-stone-500 leading-none mt-0.5 flex items-center gap-1">
                    Tile {p.position} · {p.coins}g
                    {streak >= 3 && (
                      <span className="text-orange-400 font-black flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />{streak}
                      </span>
                    )}
                  </span>
                  {(() => {
                    const hero = getHeroByAvatarId(p.user.avatarId);
                    return hero ? (
                      <span className="block text-[7px] text-amber-700/60 leading-none mt-0.5 font-bold truncate max-w-[80px]" title={hero.passive.description}>
                        {hero.passive.icon} {hero.passive.name}
                      </span>
                    ) : null;
                  })()}
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

      {/* -- Action error banner ----------------------------------------------- */}
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

      {/* -- Disconnect warning banner ----------------------------------------- */}
      {room.players.some((p: any) => !p.isConnected) && (
        <div className="max-w-6xl mx-auto px-4 py-2.5 rounded-2xl border border-orange-800/40 bg-orange-950/15 flex items-center gap-2 text-xs text-orange-400 font-bold">
          <WifiOff className="w-4 h-4 shrink-0" />
          {room.players.filter((p: any) => !p.isConnected).map((p: any) => p.user.username).join(', ')}
          {' '}{room.players.filter((p: any) => !p.isConnected).length === 1 ? 'has' : 'have'} disconnected. Waiting for reconnect…
        </div>
      )}

      {/* -- Tiles to finish indicator ----------------------------------------- */}
      {localPlayer && (
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-1">
          <div className="flex-1 h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800/50">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full"
              animate={{ width: `${Math.min((localPlayer.position / (BOARD_SIZE - 1)) * 100, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-stone-400 shrink-0">
            <Flag className="w-3 h-3 text-amber-500" />
            <span className={localPlayer.position >= BOARD_SIZE - 6 ? 'text-amber-400 animate-pulse' : ''}>
              {Math.max(0, BOARD_SIZE - 1 - localPlayer.position)} tiles to finish
            </span>
          </div>
        </div>
      )}

      {/* -- Royal Decree (Global Event) --------------------------------------- */}
      {room.activeEvent && (
        <div className="max-w-6xl mx-auto">
          <DynamicEventPanel eventName={room.activeEvent} roundsLeft={room.eventRoundsLeft} />
        </div>
      )}

      {/* -- J: Mobile Tab Switcher -------------------------------------------- */}
      <div className="max-w-6xl mx-auto flex lg:hidden gap-2 px-1">
        <button
          onClick={() => setMobileTab('board')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
            mobileTab === 'board'
              ? 'bg-amber-600 text-stone-950 border-amber-500'
              : 'bg-stone-900/40 text-stone-400 border-stone-800/50'
          }`}
        >
          🗺️ Board
        </button>
        <button
          onClick={() => setMobileTab('controls')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
            mobileTab === 'controls'
              ? 'bg-amber-600 text-stone-950 border-amber-500'
              : 'bg-stone-900/40 text-stone-400 border-stone-800/50'
          }`}
        >
          ⚔️ Controls
        </button>
      </div>

      {/* -- Sacred Board of Historia ------------------------------------------- */}
      <div className={`max-w-6xl mx-auto ${mobileTab === 'controls' ? 'hidden lg:block' : ''}`}>
        {/* L: Pinch-to-zoom wrapper */}
        <div className="touch-manipulation" style={{ touchAction: 'pinch-zoom' }}>
          <GameBoard players={room.players} activePlayerId={activePlayer?.userId || ''} round={room.round} actions={room.actions} lastLandedTileType={lastLandedTileType} />
        </div>
      </div>

      {/* -- Controls Grid ------------------------------------------------------ */}
      <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 items-start ${mobileTab === 'board' ? 'hidden lg:grid' : ''}`}>

        {/* -- Turn phase window ----------------------------------------------- */}
        <div className="lg:col-span-2 space-y-4">

          {/* No turn yet */}
          {!currentTurnRecord && (
            <div className="p-6 border border-stone-800/50 glass-panel rounded-2xl text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-stone-600 animate-spin mx-auto" />
              <p className="text-sm text-stone-400 font-bold italic">Awaiting the first roll of the ancient dice-</p>
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
              <p className="text-sm text-amber-400 font-bold">The herald advances the quest-</p>
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
                    lastRollValue={lastRollValue}
                  />
                  {!isMyTurn && activePlayer && (
                    <div className="text-center p-4 rounded-2xl border border-stone-800/40 glass-panel">
                      <p className="text-sm text-stone-400 italic">
                        Awaiting <span className="font-black text-amber-300">{activePlayer.user.username}</span> to cast the dice-
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
                        -- {activePlayer.user.username} faces the ancient trial-
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
                    otherPlayers={room.players
                      .filter((p: any) => p.userId !== activePlayer?.userId)
                      .map((p: any) => ({ id: p.id, userId: p.userId, username: p.user.username, avatarId: p.user.avatarId, position: p.position }))}
                  />
                  {!isMyTurn && activePlayer && (
                    <div className="text-center p-4 rounded-2xl border border-amber-900/25 bg-amber-950/10">
                      <p className="text-sm text-amber-300 font-bold animate-pulse">
                        -- {activePlayer.user.username} encounters a tile of fate-
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* -- Right sidebar --------------------------------------------------- */}
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

          {/* Chronicles (Action Log + Chat) — hidden on mobile, use floating button instead */}
          <div className="hidden sm:flex p-4 border border-stone-800/40 glass-panel rounded-2xl flex-col h-64">
            <div className="flex items-center gap-1.5 pb-2 border-b border-stone-800/40 mb-1">
              <Scroll className="w-3.5 h-3.5 text-amber-700/50" />
              <h3 className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">
                Chronicles - Quest Log
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto py-1 space-y-1.5 text-left flex flex-col-reverse">
              <AnimatePresence initial={false}>
                {[...room.actions].reverse().map((act: any, idx: number) => {
                  const det = JSON.parse(act.details || '{}');
                  const isSystem = act.playerUsername === 'System';
                  
                  let emoji = '💬';
                  if (isSystem) {
                    emoji = '📜';
                    if (det.message?.toLowerCase().includes('gold')) emoji = '🪙';
                    if (det.message?.toLowerCase().includes('trap')) emoji = '💀';
                    if (det.message?.toLowerCase().includes('shield')) emoji = '🛡️';
                    if (det.message?.toLowerCase().includes('roll')) emoji = '🎲';
                  }

                  return (
                    <motion.div 
                      key={act.id || idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[9px] leading-snug p-1.5 rounded-lg border ${isSystem ? 'bg-stone-900/40 border-stone-800/50' : 'bg-amber-950/20 border-amber-900/30'}`}
                    >
                      <span className="mr-1.5">{emoji}</span>
                      {!isSystem && (
                        <span className="font-black text-amber-500/80 mr-1">{act.playerUsername}:</span>
                      )}
                      <span className={isSystem ? 'text-stone-400 italic' : 'text-[#f5f0e8]'}>
                        {det.message}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-stone-800/40">
              <input
                type="text"
                maxLength={200}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl glass-input text-[10px]"
                placeholder="Speak to your allies-"
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

      <HeroJournal isOpen={journalOpen} onClose={() => setJournalOpen(false)} />
      <SoundSettings />

      {/* ── H: Achievement Popups ── */}
      <div className="fixed bottom-24 right-4 z-[120] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {achievements.map(ach => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, x: 80, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: 'spring', damping: 18 }}
              className="flex items-center gap-3 bg-stone-950/95 border border-amber-700/50 rounded-2xl px-4 py-3 shadow-2xl shadow-amber-900/30 backdrop-blur-md min-w-[220px]"
            >
              <span className="text-2xl">{ach.icon}</span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Achievement Unlocked!</p>
                <p className="text-sm font-black text-[#f5f0e8]">{ach.title}</p>
                <p className="text-[9px] text-stone-400">{ach.desc}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── K: Floating Chat Bubble ── */}
      <div className="fixed bottom-6 right-4 z-[110] flex flex-col items-end gap-2">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-72 bg-stone-950/95 border border-amber-800/40 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden"
            >
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-stone-800/50">
                <Scroll className="w-3.5 h-3.5 text-amber-700/50" />
                <span className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Chronicles · Quest Log</span>
                <button onClick={() => setChatOpen(false)} className="ml-auto text-stone-600 hover:text-stone-300 text-xs">✕</button>
              </div>
              <div className="h-44 overflow-y-auto p-3 space-y-1.5 flex flex-col-reverse">
                <AnimatePresence initial={false}>
                  {[...room.actions].reverse().map((act: any, idx: number) => {
                    const det = JSON.parse(act.details || '{}');
                    const isSystem = act.playerUsername === 'System';
                    return (
                      <motion.div key={act.id || idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        className={`text-[9px] leading-snug p-1.5 rounded-lg border ${isSystem ? 'bg-stone-900/40 border-stone-800/50' : 'bg-amber-950/20 border-amber-900/30'}`}>
                        {!isSystem && <span className="font-black text-amber-500/80 mr-1">{act.playerUsername}:</span>}
                        <span className={isSystem ? 'text-stone-400 italic' : 'text-[#f5f0e8]'}>{det.message}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (!chatInput.trim()) return; sendChat(chatInput.trim()); setChatInput(''); }}
                className="flex gap-2 p-3 border-t border-stone-800/40">
                <input type="text" maxLength={200} value={chatInput} onChange={e => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl glass-input text-[10px]" placeholder="Speak to allies…" />
                <button type="submit" disabled={!chatInput.trim()}
                  className="p-1.5 bg-amber-700 hover:bg-amber-600 text-stone-950 rounded-xl transition-all disabled:opacity-40">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(o => !o)}
          className="relative w-12 h-12 bg-amber-700 hover:bg-amber-600 text-stone-950 rounded-full shadow-lg shadow-amber-900/40 flex items-center justify-center transition-colors"
        >
          <Scroll className="w-5 h-5" />
          {room.actions?.length > 0 && !chatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[8px] font-black flex items-center justify-center border border-stone-950">
              !
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Turn Transition Overlay ── */}
      <AnimatePresence>
        {turnTransition && (
          <motion.div
            key="turn-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260 }}
              className="bg-stone-950/90 border border-amber-700/50 rounded-2xl px-8 py-5 text-center shadow-2xl shadow-amber-900/30 backdrop-blur-md"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600/70 mb-1">⚔️ Next Turn</p>
              <p className="text-2xl font-black text-amber-300">{turnTransition}</p>
              <p className="text-[10px] text-stone-500 mt-1 italic">prepares to roll the dice…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
