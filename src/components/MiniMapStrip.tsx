'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { BOARD_TILES } from '@/lib/boardConfig';
import { getAvatarById } from '@/lib/avatars';

interface MiniPlayer {
  id: string;
  userId: string;
  position: number;
  user: { username: string; avatarId: string; nameColor: string; };
}

interface MiniMapStripProps {
  players: MiniPlayer[];
  activePlayerId: string;
  onExpand: () => void;
}

const ICON_BY_SIMPLE: Record<string, string> = {
  START: '🏰', FINISH: '👑', TRAP: '💀', TREASURE: '💰', TELEPORT: '🌀',
  EVENT: '⚡', MYSTERY: '❓', WILD: '🎲', BONUS: '✨', RISK: '🎰',
  SHORTCUT: '💨', CHALLENGE: '⚔️', ITEM_REWARD: '🎁', MOVE_FORWARD: '➡️',
  MOVE_BACK: '⬅️', SKIP_TURN: '⏸️', DICE_AGAIN: '🎲', SWAP: '🔀',
  COIN_BONUS: '🪙', COIN_DRAIN: '🧾', NORMAL: '·',
};

export default function MiniMapStrip({ players, activePlayerId, onExpand }: MiniMapStripProps) {
  // Pawns per tile (a tile may hold multiple players)
  const pawnsByTile = new Map<number, MiniPlayer[]>();
  players.forEach(p => {
    const list = pawnsByTile.get(p.position) || [];
    list.push(p);
    pawnsByTile.set(p.position, list);
  });

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-1 pb-1.5">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/90">
          🗺️ Map
        </span>
        <button
          onClick={onExpand}
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-stone-400 hover:text-[#f5f0e8] transition-colors px-2 py-1 rounded-lg border border-stone-800/60 bg-stone-900/40"
        >
          <Maximize2 className="w-3 h-3" /> Full Map
        </button>
      </div>

      {/* Horizontally scrollable single-row strip of all tiles */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1" style={{ touchAction: 'pan-x' }}>
        <div className="flex gap-[3px] w-max">
          {BOARD_TILES.map((tile) => {
            const onTile = pawnsByTile.get(tile.index) || [];
            const isFinish = tile.type === 'FINISH';
            const trap = tile.type === 'TRAP';
            return (
              <div
                key={tile.index}
                className={`relative flex items-center justify-center rounded-md shrink-0 transition-colors ${
                  isFinish
                    ? 'w-8 h-8 bg-amber-900/80 border border-amber-500/60'
                    : trap
                    ? 'w-8 h-8 bg-rose-950/70 border border-rose-700/50'
                    : 'w-8 h-8 bg-stone-900/80 border border-stone-800/70'
                }`}
                style={{ backgroundColor: isFinish ? undefined : `${tile.color}1f` }}
                title={tile.name}
              >
                <span className="text-[11px] leading-none select-none">
                  {ICON_BY_SIMPLE[tile.type] ?? '·'}
                </span>

                {/* Pawns on this tile */}
                {onTile.length > 0 && (
                  <div className="absolute -bottom-1 flex gap-px">
                    {onTile.map((p) => {
                      const avatar = getAvatarById(p.user.avatarId);
                      const isActive = p.userId === activePlayerId;
                      return (
                        <motion.div
                          key={p.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileTap={{ scale: 0.85 }}
                          className={`relative w-4 h-4 rounded-full overflow-hidden border ${
                            isActive
                              ? 'border-amber-300 ring-2 ring-amber-400/60 z-10'
                              : 'border-stone-500/70'
                          }`}
                          style={{ backgroundColor: '#111' }}
                          title={p.user.username}
                        >
                          {avatar.render('w-full h-full object-cover object-top')}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
