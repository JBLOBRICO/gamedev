'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Gift, Sparkles, Zap, Flame, Compass, HelpCircle,
  RotateCw, Shuffle, ArrowUp, ArrowDown, Clock, Package, Coins
} from 'lucide-react';
import { BOARD_TILES } from '@/lib/boardConfig';
import { getAvatarById } from '@/lib/avatars';

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
        }, 320);
        return () => clearTimeout(timer);
      }
    });
  }, [players, animatedPositions]);

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'START':        return <Compass className="w-4 h-4" />;
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
    <div className="w-full p-3 sm:p-5 rounded-3xl border border-slate-800 glass-panel relative overflow-hidden bg-grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/10 via-transparent to-purple-950/10 pointer-events-none" />

      {/*
        Board: 10 columns × 5 rows serpentine layout
        Mobile: 5 columns (tiles wrap naturally, grid auto-places via gridRowStart/gridColumnStart)
        Desktop: 10 columns
      */}
      <div
        className="grid gap-1.5 sm:gap-2 select-none relative z-10"
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
              className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-between p-1 sm:p-1.5 transition-all duration-300 ${tile.bgClass} shadow-sm`}
              style={{
                gridRowStart: tile.gridY + 1,
                gridColumnStart: tile.gridX + 1,
                minWidth: 0,
              }}
            >
              {/* Tile index + icon */}
              <div className="w-full flex justify-between items-center text-[7px] sm:text-[9px] opacity-60 font-black leading-none">
                <span>{tile.index === 0 ? '▶' : tile.index === 45 ? '🏁' : tile.index}</span>
                <span className="shrink-0">{getTileIcon(tile.type)}</span>
              </div>

              {/* Tile Name */}
              <span className="text-[6px] sm:text-[8px] font-black uppercase text-center tracking-tight leading-none px-0.5 select-none line-clamp-2">
                {tile.name}
              </span>

              {/* Pawns slot */}
              <div className="h-5 sm:h-7 flex flex-wrap items-center justify-center gap-0.5 mt-0.5">
                <AnimatePresence>
                  {playersOnTile.map((p) => {
                    const avatar = getAvatarById(p.user.avatarId);
                    const isActive = p.userId === activePlayerId;
                    return (
                      <motion.div
                        key={p.id}
                        layoutId={`pawn_${p.id}`}
                        initial={{ scale: 0.6, y: -8 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.6 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-950 p-0.5 border-2 shadow-lg shadow-black/80 flex items-center justify-center relative cursor-help ${
                          isActive
                            ? 'border-yellow-400 ring-1 ring-yellow-400/50 scale-110 z-20'
                            : 'border-slate-300'
                        }`}
                        title={p.user.username}
                      >
                        {p.team && (
                          <span
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950"
                            style={{ backgroundColor: p.team.color }}
                          />
                        )}
                        {avatar.render('w-full h-full')}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
