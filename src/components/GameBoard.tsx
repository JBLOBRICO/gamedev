'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Gift, Sparkles, Zap, Flame, Compass, HelpCircle,
  RotateCw, Shuffle, ArrowUp, ArrowDown, Clock, Package, Coins
} from 'lucide-react';
import { BOARD_TILES } from '@/lib/boardConfig';
import { getAvatarById } from '@/lib/avatars';
import { getHeroByAvatarId } from '@/lib/heroes';

interface BoardPlayer {
  id: string;
  userId: string;
  position: number;
  coins: number;
  user: {
    username: string;
    avatarId: string;
    nameColor: string;
  };
  team?: {
    name: string;
    color: string;
  } | null;
}

interface GameBoardProps {
  players: BoardPlayer[];
  activePlayerId: string;
  round: number;
  actions?: any[];
}

export default function GameBoard({ players, activePlayerId, round, actions = [] }: GameBoardProps) {
  // Animate pawns tile by tile
  const [animatedPositions, setAnimatedPositions] = useState<{ [playerId: string]: number }>({});
  const [cameraShake, setCameraShake] = useState(false);
  const [floaters, setFloaters] = useState<{ id: string; playerId: string; text: string; color: string }[]>([]);
  const [dustRings, setDustRings] = useState<{ id: string; tileIndex: number }[]>([]);
  
  const prevCoinsRef = useRef<Record<string, number>>({});
  const lastActionIdRef = useRef<string | null>(null);

  useEffect(() => {
    players.forEach((player) => {
      const currentPos = player.position;
      const animPos = animatedPositions[player.id];

      if (animPos === undefined) {
        setAnimatedPositions(prev => ({ ...prev, [player.id]: currentPos }));
      } else if (animPos !== currentPos) {
        const diff = currentPos - animPos;
        const direction = diff > 0 ? 1 : -1;
        const timer = setTimeout(() => {
          const nextPos = animPos + direction;
          setAnimatedPositions(prev => ({
            ...prev,
            [player.id]: nextPos
          }));
          
          // Spawn dust ring at the new tile
          const dustId = Math.random().toString(36).substring(2, 9);
          setDustRings(prev => [...prev, { id: dustId, tileIndex: nextPos }]);
          setTimeout(() => setDustRings(prev => prev.filter(d => d.id !== dustId)), 600);

          // Trigger shake if they hit a trap
          if (nextPos === currentPos) {
             const finalTile = BOARD_TILES[currentPos];
             if (finalTile?.type === 'TRAP') {
                setCameraShake(true);
                setTimeout(() => setCameraShake(false), 500);
             }
          }
        }, 320);
        return () => clearTimeout(timer);
      }
    });
  }, [players, animatedPositions]);

  // Watch for coin changes to spawn floating text
  useEffect(() => {
    players.forEach(p => {
      const prevCoins = prevCoinsRef.current[p.id];
      if (prevCoins !== undefined && prevCoins !== p.coins) {
        const diff = p.coins - prevCoins;
        const text = diff > 0 ? `+${diff} Gold` : `${diff} Gold`;
        const color = diff > 0 ? 'text-amber-300 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]' : 'text-rose-400 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]';
        const id = Math.random().toString(36).substring(2, 9);
        setFloaters(f => [...f, { id, playerId: p.id, text, color }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 2000);
      }
      prevCoinsRef.current[p.id] = p.coins;
    });
  }, [players]);

  // Monitor chat actions for emotes
  useEffect(() => {
    if (actions.length === 0) return;
    
    // Process new actions
    const newActions = lastActionIdRef.current 
      ? actions.filter(a => a.id > lastActionIdRef.current!) 
      : actions.slice(-1); // Only process the very latest if first load
      
    if (newActions.length > 0) {
      newActions.forEach(act => {
        if (act.type === 'CHAT' && act.playerUsername !== 'System') {
          const det = JSON.parse(act.details || '{}');
          const msg = (det.message || '').trim();
          
          // If message is short (like an emoji or "gg")
          if (msg.length > 0 && msg.length <= 4) {
            // Find player ID by username
            const player = players.find(p => p.user.username === act.playerUsername);
            if (player) {
              const floaterId = Math.random().toString(36).substring(2, 9);
              setFloaters(f => [...f, { id: floaterId, playerId: player.id, text: msg, color: 'text-white text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' }]);
              setTimeout(() => setFloaters(f => f.filter(x => x.id !== floaterId)), 2500);
            }
          }
        }
      });
      lastActionIdRef.current = actions[actions.length - 1].id;
    }
  }, [actions, players]);

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'START':        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'FINISH':       return <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />;
      case 'BONUS':
      case 'COIN_BONUS':   return <Gift className="w-4 h-4 text-yellow-300" />;
      case 'TRAP':         return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'MYSTERY':      return <HelpCircle className="w-4 h-4 text-purple-400" />;
      case 'SHORTCUT':
      case 'MOVE_FORWARD': return <Zap className="w-4 h-4 text-cyan-300" />;
      case 'MOVE_BACK':    return <ArrowDown className="w-4 h-4 text-stone-400" />;
      case 'CHALLENGE':    return <Flame className="w-4 h-4 text-blue-400" />;
      case 'RISK':         return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'EVENT':        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'WILD':         return <Sparkles className="w-4 h-4 text-teal-400" />;
      case 'TREASURE':     return <Gift className="w-4 h-4 text-amber-300" fill="currentColor" />;
      case 'TELEPORT':     return <ArrowUp className="w-4 h-4 text-violet-400" />;
      case 'ITEM_REWARD':  return <Package className="w-4 h-4 text-lime-400" />;
      case 'SKIP_TURN':    return <Clock className="w-4 h-4 text-sky-300" />;
      case 'DICE_AGAIN':   return <RotateCw className="w-4 h-4 text-amber-300" />;
      case 'SWAP':         return <Shuffle className="w-4 h-4 text-rose-400" />;
      case 'COIN_DRAIN':   return <Coins className="w-4 h-4 text-orange-400" />;
      default:             return null;
    }
  };

  // Day/Night Cycle logic based on round
  let ambientClass = 'bg-gradient-to-br from-amber-950/10 via-transparent to-stone-950/20';
  let isNight = false;
  const cycle = round % 9;
  if (cycle >= 1 && cycle <= 3) {
    ambientClass = 'bg-gradient-to-br from-amber-900/10 via-transparent to-blue-900/10'; // Morning
  } else if (cycle >= 4 && cycle <= 6) {
    ambientClass = 'bg-gradient-to-br from-orange-950/20 via-rose-950/10 to-stone-950/20'; // Sunset
  } else {
    ambientClass = 'bg-gradient-to-br from-indigo-950/30 via-slate-900/20 to-black/40'; // Night
    isNight = true;
  }

  return (
    <div className={`w-full p-3 sm:p-5 rounded-3xl border border-amber-900/30 glass-panel relative overflow-hidden bg-grid-pattern h-[600px] flex items-center justify-center transition-colors duration-1000`}>
      {/* Castle wall atmospheric overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${ambientClass}`} />
      
      {/* Drifting Clouds Shadows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 mix-blend-overlay">
         <motion.div
           animate={{ x: ['-50%', '150%'] }}
           transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
           className="w-[150%] h-[150%] rounded-[100%] bg-stone-950/80 blur-3xl -translate-y-1/4"
         />
      </div>

      {/* Night fireflies */}
      {isNight && (
        <div className="absolute inset-0 bg-transparent sparkle-float pointer-events-none opacity-30 z-10" />
      )}
      
      {/* Top decorative banner line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />

      {/* Board label */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-center gap-2 opacity-50 z-20">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-800/40" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-700">⚜ Kingdom of Historia · Sacred Board ⚜</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-800/40" />
      </div>

      <div className={`board-viewport ${cameraShake ? 'camera-shake' : ''}`}>
        <motion.div 
           className="iso-board-container w-full max-w-4xl mx-auto h-[400px] mt-10"
           layout
        >
          {/*
            Board: 10 columns × 5 rows serpentine layout
            Mobile: 5 columns (tiles wrap naturally, grid auto-places via gridRowStart/gridColumnStart)
            Desktop: 10 columns
          */}
          <div
            className="grid gap-3 sm:gap-4 select-none relative z-10 w-full h-full"
            style={{
              gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(5, auto)',
            }}
          >
            {BOARD_TILES.map((tile) => {
              const playersOnTile = players.filter(
                (p) => (animatedPositions[p.id] ?? p.position) === tile.index
              );

              return (
                <div
                  key={tile.index}
                  className={`iso-tile relative aspect-square group`}
                  style={{
                    gridRowStart: tile.gridY + 1,
                    gridColumnStart: tile.gridX + 1,
                  }}
                >
                  <div className={`iso-face iso-face-bottom ${
                    tile.type === 'TRAP' ? 'bg-rose-950/80 shadow-[0_0_30px_rgba(225,29,72,0.6)]' :
                    tile.type === 'START' || tile.type === 'FINISH' ? 'bg-amber-900/80 shadow-[0_0_30px_rgba(251,191,36,0.5)]' :
                    'bg-stone-900 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
                  }`}></div>
                  
                  <div className={`iso-face iso-face-top flex flex-col items-center justify-between p-1 sm:p-1.5 transition-all duration-500 ${tile.bgClass} border-2 border-stone-800/80 shadow-inner group-hover:border-amber-400/60 group-hover:shadow-[inset_0_0_20px_rgba(251,191,36,0.3)]`}>
                    
                    {/* Night Mode Dark Overlay (instead of CSS filter which breaks 3D) */}
                    {isNight && <div className="absolute inset-0 bg-black/30 rounded-lg pointer-events-none z-0" />}
                    
                    {/* Environmental Textures Container (replaces overflow-hidden on parent) */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                      {/* Environmental Textures */}
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40 mix-blend-overlay" />
                      
                      {/* Moss/Grass overlay on certain tiles */}
                      {(tile.index % 3 === 0 && tile.type !== 'TRAP' && tile.type !== 'TELEPORT') && (
                         <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-emerald-900/40 to-transparent mix-blend-multiply" />
                      )}

                      {/* Glowing effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-transparent via-amber-500/10 to-amber-500/30 transition-opacity duration-300" />
                      
                      {/* Magical Ambient Particles on special tiles */}
                      {(tile.type === 'TELEPORT' || tile.type === 'MYSTERY' || tile.type === 'START') && (
                         <div className="absolute inset-0 bg-transparent sparkle-float" />
                      )}
                    </div>

                    {/* Tile index + icon */}
                    <div className="w-full flex justify-between items-center text-[7px] sm:text-[9px] opacity-70 font-black leading-none z-10 drop-shadow-md text-stone-300">
                      <span>{tile.index === 0 ? '▶' : tile.index === 45 ? '🏁' : tile.index}</span>
                      <span className="shrink-0 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{getTileIcon(tile.type)}</span>
                    </div>

                    {/* Tile Name */}
                    <span className="text-[6px] sm:text-[8px] font-black uppercase text-center tracking-tight leading-none px-0.5 select-none line-clamp-2 z-10">
                      {tile.name}
                    </span>
                  </div>

                  {/* Pawns slot — outside iso-face-top, counter-rotated to stand upright like chess pieces */}
                  <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none pawn-upright pb-1">
                    <div className="flex flex-wrap items-end justify-center gap-1 pointer-events-auto">
                      <AnimatePresence>
                        {playersOnTile.map((p) => {
                          const avatar = getAvatarById(p.user.avatarId);
                          const heroData = getHeroByAvatarId(p.user.avatarId);
                          const isActive = p.userId === activePlayerId;
                          
                          // Hero Animation
                          const animClass = isActive ? heroData?.walkingAnim || 'anim-walk-brisk' : heroData?.idleAnim || 'anim-idle-look-around';
                          
                          return (
                            <motion.div
                              key={p.id}
                              layoutId={`pawn_${p.id}`}
                              initial={{ scale: 0.6, y: -20, opacity: 0 }}
                              animate={{ scale: 1, y: 0, opacity: 1 }}
                              exit={{ scale: 0.6, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                              className="relative z-20 cursor-help group flex flex-col items-center"
                              style={{ width: '44px' }}
                              title={heroData?.fullName || p.user.username}
                            >
                              {/* ── Chess Piece Body (hops on move) ── */}
                              <motion.div
                                className="chess-piece-pedestal"
                                animate={{ y: [0, -14, 0] }}
                                transition={{ duration: 0.35, ease: 'easeOut', repeat: 0 }}
                                key={animatedPositions[p.id]}
                              >
                                {/* Avatar Portrait — rounded top, like a chess piece head */}
                                <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105 group-hover:-translate-y-0.5'}`}>
                                  {/* Glowing halo ring for active player */}
                                  {isActive && (
                                    <div className="absolute -inset-1 rounded-full bg-yellow-400/30 blur-sm animate-pulse z-0" />
                                  )}
                                  {/* Portrait frame */}
                                  <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-[3px] bg-slate-900 z-10 ${
                                    isActive
                                      ? 'border-yellow-400 shadow-[0_0_0_2px_rgba(250,204,21,0.6),0_6px_18px_rgba(250,204,21,0.5)]'
                                      : 'border-stone-300 shadow-[0_0_0_2px_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.8)]'
                                  }`}>
                                    {p.team && (
                                      <span
                                        className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl border-b border-l border-white/40 z-40"
                                        style={{ backgroundColor: p.team.color }}
                                      />
                                    )}
                                    {avatar.render('w-full h-full object-cover object-top')}
                                  </div>
                                  {/* Small name tag below portrait */}
                                  <div
                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-black px-1 py-0.5 rounded bg-black/80 z-20 leading-none"
                                    style={{ color: p.user.nameColor || '#f5f0e8' }}
                                  >
                                    {p.user.username}
                                  </div>
                                </div>
                              </motion.div>

                              {/* ── Pedestal base shadow / glow ── */}
                              <div className={`chess-piece-base ${isActive ? 'chess-piece-base-active' : ''}`} />

                              {/* Floating Combat Text */}
                              <AnimatePresence>
                                {floaters.filter(f => f.playerId === p.id).map(f => (
                                  <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, y: -30, scale: 1.2 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    className={`absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black z-50 pointer-events-none ${f.color}`}
                                  >
                                    {f.text}
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Dust rings when pawns land */}
                    <AnimatePresence>
                      {dustRings.filter(d => d.tileIndex === tile.index).map(d => (
                        <motion.div
                          key={d.id}
                          initial={{ scale: 0.2, opacity: 0.8, borderWidth: 4 }}
                          animate={{ scale: 2.5, opacity: 0, borderWidth: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-amber-200 pointer-events-none z-10"
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
