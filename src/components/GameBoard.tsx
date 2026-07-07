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
}

export default function GameBoard({ players, activePlayerId }: GameBoardProps) {
  // Animate pawns tile by tile
  const [animatedPositions, setAnimatedPositions] = useState<{ [playerId: string]: number }>({});
  const [cameraShake, setCameraShake] = useState(false);

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
          setAnimatedPositions(prev => ({
            ...prev,
            [player.id]: animPos + direction
          }));
          
          // Trigger shake if they hit a trap
          if (animPos + direction === currentPos) {
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

  return (
    <div className="w-full p-3 sm:p-5 rounded-3xl border border-amber-900/30 glass-panel relative overflow-hidden bg-grid-pattern h-[600px] flex items-center justify-center">
      {/* Castle wall atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-transparent to-stone-950/20 pointer-events-none" />
      {/* Top decorative banner line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />

      {/* Board label */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-center gap-2 opacity-50 z-20">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-800/40" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-700">⚜ Kingdom of Historia · Sacred Board ⚜</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-800/40" />
      </div>

      <div className="board-viewport">
        <motion.div 
           className={`iso-board-container w-full max-w-4xl mx-auto h-[400px] mt-10 ${cameraShake ? 'camera-shake' : ''}`}
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
                  
                  <div className={`iso-face iso-face-top flex flex-col items-center justify-between p-1 sm:p-1.5 transition-all duration-500 ${tile.bgClass} border-2 border-stone-800/80 shadow-inner overflow-hidden group-hover:border-amber-400/60 group-hover:shadow-[inset_0_0_20px_rgba(251,191,36,0.3)]`}>
                    
                    {/* Environmental Textures */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40 mix-blend-overlay pointer-events-none" />
                    
                    {/* Moss/Grass overlay on certain tiles */}
                    {(tile.index % 3 === 0 && tile.type !== 'TRAP' && tile.type !== 'TELEPORT') && (
                       <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-emerald-900/40 to-transparent pointer-events-none mix-blend-multiply rounded-br-lg" />
                    )}

                    {/* Glowing effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-transparent via-amber-500/10 to-amber-500/30 pointer-events-none transition-opacity duration-300" />
                    
                    {/* Magical Ambient Particles on special tiles */}
                    {(tile.type === 'TELEPORT' || tile.type === 'MYSTERY' || tile.type === 'START') && (
                       <div className="absolute inset-0 bg-transparent sparkle-float pointer-events-none" />
                    )}

                    {/* Tile index + icon */}
                    <div className="w-full flex justify-between items-center text-[7px] sm:text-[9px] opacity-70 font-black leading-none z-10 drop-shadow-md text-stone-300">
                      <span>{tile.index === 0 ? '▶' : tile.index === 45 ? '🏁' : tile.index}</span>
                      <span className="shrink-0 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{getTileIcon(tile.type)}</span>
                    </div>

                    {/* Tile Name */}
                    <span className="text-[6px] sm:text-[8px] font-black uppercase text-center tracking-tight leading-none px-0.5 select-none line-clamp-2 z-10">
                      {tile.name}
                    </span>

                    {/* Pawns slot */}
                    <div className="h-5 sm:h-7 flex flex-wrap items-center justify-center gap-0.5 mt-0.5 z-20 pawn-upright">
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
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-950 p-0.5 shadow-2xl flex items-center justify-center relative cursor-help ${animClass} ${
                                isActive
                                  ? 'border-2 border-yellow-400 ring-2 ring-yellow-400/50 scale-125 z-30'
                                  : 'border-2 border-slate-400/60 z-20'
                              }`}
                              title={heroData?.fullName || p.user.username}
                            >
                              {p.team && (
                                <span
                                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950 z-40"
                                  style={{ backgroundColor: p.team.color }}
                                />
                              )}
                              {avatar.render('w-full h-full')}
                              
                              {/* Hero Shadow */}
                              <div className="absolute -bottom-2 w-4 h-1 bg-black/40 rounded-full blur-[2px] -z-10" />
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
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
