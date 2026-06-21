'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Gift, Sparkles, Zap, Flame, Compass, HelpCircle } from 'lucide-react';
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
    // Initialize or update positions tile-by-tile
    players.forEach((player) => {
      const currentPos = player.position;
      const animPos = animatedPositions[player.id];

      if (animPos === undefined) {
        // Init directly
        setAnimatedPositions(prev => ({ ...prev, [player.id]: currentPos }));
      } else if (animPos !== currentPos) {
        // Step towards currentPos
        const diff = currentPos - animPos;
        const direction = diff > 0 ? 1 : -1;
        const timer = setTimeout(() => {
          setAnimatedPositions(prev => ({
            ...prev,
            [player.id]: animPos + direction
          }));
        }, 350); // Speed of tile-by-tile walk animation
        return () => clearTimeout(timer);
      }
    });
  }, [players, animatedPositions]);

  const getTileIcon = (type: string) => {
    switch (type) {
      case 'START': return <Compass className="w-5 h-5" />;
      case 'FINISH': return <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />;
      case 'BONUS': return <Gift className="w-5 h-5 text-yellow-300" />;
      case 'TRAP': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'MYSTERY': return <HelpCircle className="w-5 h-5 text-purple-400" />;
      case 'SHORTCUT': return <Zap className="w-5 h-5 text-cyan-300" />;
      case 'CHALLENGE': return <Flame className="w-5 h-5 text-blue-400" />;
      case 'RISK': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'EVENT': return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'WILD': return <Sparkles className="w-5 h-5 text-teal-400" />;
      case 'TREASURE': return <Gift className="w-5 h-5 text-amber-300" fill="currentColor" />;
      default: return null;
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 rounded-3xl border border-slate-800 glass-panel relative overflow-hidden bg-grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/10 via-transparent to-purple-950/10 pointer-events-none" />

      {/* 2D Board Serpentine Grid (8 Columns x 4 Rows) */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 select-none relative z-10">
        {BOARD_TILES.map((tile) => {
          // Find if any animated player is on this tile
          const playersOnTile = players.filter(
            (p) => (animatedPositions[p.id] ?? p.position) === tile.index
          );

          return (
            <div
              key={tile.index}
              className={`relative aspect-square sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-between p-2 transition-all duration-300 ${tile.bgClass} shadow-md`}
              style={{
                // Serpentine layout order coordinates
                gridRowStart: tile.gridY + 1,
                gridColumnStart: tile.gridX + 1,
              }}
            >
              {/* Tile label / index */}
              <div className="w-full flex justify-between items-center text-[10px] opacity-60 font-black">
                <span>{tile.index === 0 ? 'START' : tile.index === 31 ? 'END' : tile.index}</span>
                <span>{getTileIcon(tile.type)}</span>
              </div>

              {/* Tile Name */}
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-center tracking-tight leading-none mt-1 select-none">
                {tile.name}
              </span>

              {/* Pawns slot */}
              <div className="h-6 sm:h-8 flex flex-wrap items-center justify-center gap-1 mt-1">
                <AnimatePresence>
                  {playersOnTile.map((p) => {
                    const avatar = getAvatarById(p.user.avatarId);
                    const isActive = p.userId === activePlayerId;
                    return (
                      <motion.div
                        key={p.id}
                        layoutId={`pawn_${p.id}`}
                        initial={{ scale: 0.6, y: -10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-950 p-0.5 border-2 shadow-lg shadow-black/80 flex items-center justify-center relative cursor-help ${
                          isActive 
                            ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-110 z-20' 
                            : 'border-slate-300'
                        }`}
                        title={p.user.username}
                      >
                        {/* If team mode, color indicator border */}
                        {p.team && (
                          <span 
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950" 
                            style={{ backgroundColor: p.team.color }}
                          />
                        )}
                        {avatar.render("w-full h-full")}
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
