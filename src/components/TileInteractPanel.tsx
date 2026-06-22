'use client';

import React from 'react';
import {
  Shield, Sparkles, Flame, AlertOctagon, HelpCircle, Wind, Trophy,
  RotateCw, Shuffle, ArrowDown, ArrowUp, Clock, Package, Coins, Zap
} from 'lucide-react';
import { TileType } from '@/lib/boardConfig';
import { sounds } from '@/lib/sounds';

interface TileInteractPanelProps {
  tileType: TileType;
  tileName: string;
  tileDescription: string;
  playerCoins: number;
  hasShield: boolean;
  onChoice: (choice: string) => void;
  disabled: boolean;
}

export default function TileInteractPanel({
  tileType,
  tileName,
  tileDescription,
  playerCoins,
  hasShield,
  onChoice,
  disabled,
}: TileInteractPanelProps) {

  const handleAction = (choice: string) => {
    if (disabled) return;
    sounds.playClick();
    onChoice(choice);
  };

  const getTileTheme = () => {
    switch (tileType) {
      case 'TRAP':         return { icon: <AlertOctagon className="w-8 h-8 text-rose-500 animate-bounce" />,      border: 'border-rose-900/40 bg-rose-950/20' };
      case 'TREASURE':     return { icon: <Trophy className="w-8 h-8 text-amber-400" />,                          border: 'border-amber-900/40 bg-amber-950/20' };
      case 'MYSTERY':      return { icon: <HelpCircle className="w-8 h-8 text-purple-400" />,                     border: 'border-purple-900/40 bg-purple-950/20' };
      case 'SHORTCUT':
      case 'MOVE_FORWARD': return { icon: <Wind className="w-8 h-8 text-cyan-400" />,                             border: 'border-cyan-900/40 bg-cyan-950/20' };
      case 'MOVE_BACK':    return { icon: <ArrowDown className="w-8 h-8 text-stone-400" />,                       border: 'border-stone-800/60 bg-stone-950/20' };
      case 'RISK':         return { icon: <Flame className="w-8 h-8 text-orange-500" />,                          border: 'border-orange-900/40 bg-orange-950/20' };
      case 'CHALLENGE':    return { icon: <Trophy className="w-8 h-8 text-blue-400 animate-pulse" />,             border: 'border-blue-900/40 bg-blue-950/20' };
      case 'WILD':         return { icon: <Sparkles className="w-8 h-8 text-teal-400" />,                         border: 'border-teal-900/40 bg-teal-950/20' };
      case 'EVENT':        return { icon: <Sparkles className="w-8 h-8 text-pink-400 animate-spin" />,            border: 'border-pink-900/40 bg-pink-950/20' };
      case 'TELEPORT':     return { icon: <ArrowUp className="w-8 h-8 text-violet-400 animate-pulse" />,          border: 'border-violet-900/40 bg-violet-950/20' };
      case 'ITEM_REWARD':  return { icon: <Package className="w-8 h-8 text-lime-400" />,                          border: 'border-lime-900/40 bg-lime-950/20' };
      case 'SKIP_TURN':    return { icon: <Clock className="w-8 h-8 text-sky-300 animate-pulse" />,               border: 'border-sky-900/40 bg-sky-950/20' };
      case 'DICE_AGAIN':   return { icon: <RotateCw className="w-8 h-8 text-amber-300 animate-spin" />,           border: 'border-amber-900/40 bg-amber-950/20' };
      case 'SWAP':         return { icon: <Shuffle className="w-8 h-8 text-rose-400" />,                          border: 'border-rose-900/40 bg-rose-950/20' };
      case 'COIN_BONUS':   return { icon: <Coins className="w-8 h-8 text-yellow-400" />,                          border: 'border-yellow-900/40 bg-yellow-950/20' };
      case 'COIN_DRAIN':   return { icon: <Coins className="w-8 h-8 text-orange-400" />,                          border: 'border-orange-900/40 bg-orange-950/20' };
      case 'BONUS':        return { icon: <Sparkles className="w-8 h-8 text-yellow-400" />,                       border: 'border-yellow-900/40 bg-yellow-950/20' };
      default:             return { icon: <Sparkles className="w-8 h-8 text-sky-400" />,                          border: 'border-slate-800 bg-slate-900/40' };
    }
  };

  const theme = getTileTheme();

  return (
    <div className={`w-full p-6 border rounded-3xl space-y-4 max-w-md mx-auto text-center ${theme.border}`}>
      <div className="flex justify-center mb-2">
        {theme.icon}
      </div>

      <div>
        <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">
          Landed on: {tileName}
        </h3>
        <p className="text-xs text-slate-400 mt-1 px-4 leading-relaxed">
          {tileDescription}
        </p>
      </div>

      {/* ── TRAP ────────────────────────────────────────────────────────────── */}
      {tileType === 'TRAP' && (
        <div className="py-2">
          {hasShield ? (
            <p className="text-xs text-sky-400 font-bold flex items-center justify-center gap-1">
              <Shield className="w-4 h-4 fill-sky-500/10" />
              Your Shield blocks this trap!
            </p>
          ) : (
            <p className="text-xs text-rose-400 font-semibold">
              You lose coins and move back unless you are protected.
            </p>
          )}
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold uppercase text-xs"
          >
            {hasShield ? 'Use Shield & Continue' : 'Accept Penalty'}
          </button>
        </div>
      )}

      {/* ── TREASURE ────────────────────────────────────────────────────────── */}
      {tileType === 'TREASURE' && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] text-slate-400">
            Spend 10 coins to open this chest. You could find a Shield, 25 coins, or a mimic trap!
          </p>
          <div className="flex gap-2">
            <button
              disabled={disabled || playerCoins < 10}
              onClick={() => handleAction('OPEN')}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs disabled:opacity-40"
            >
              Open Chest (10g)
            </button>
            <button
              disabled={disabled}
              onClick={() => handleAction('SKIP')}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Leave It
            </button>
          </div>
        </div>
      )}

      {/* ── SHORTCUT / MOVE_FORWARD ─────────────────────────────────────────── */}
      {(tileType === 'SHORTCUT' || tileType === 'MOVE_FORWARD') && (
        <div className="pt-2">
          <p className="text-xs text-cyan-400 font-bold mb-3">
            🌬️ You get a free boost forward!
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black uppercase text-xs"
          >
            Ride the Wind!
          </button>
        </div>
      )}

      {/* ── MOVE_BACK ────────────────────────────────────────────────────────── */}
      {tileType === 'MOVE_BACK' && (
        <div className="pt-2">
          <p className="text-xs text-stone-400 font-bold mb-3">
            ⬇️ The ground shifts and you fall back several tiles.
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold uppercase text-xs"
          >
            Accept & Continue
          </button>
        </div>
      )}

      {/* ── MYSTERY ──────────────────────────────────────────────────────────── */}
      {tileType === 'MYSTERY' && (
        <div className="pt-2">
          <p className="text-xs text-purple-300 font-bold mb-3">
            🌀 Who knows what fate has in store?
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black uppercase text-xs"
          >
            Trigger Mystery Event
          </button>
        </div>
      )}

      {/* ── RISK ─────────────────────────────────────────────────────────────── */}
      {tileType === 'RISK' && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] text-slate-400">
            Double your coins if you win, or lose half if you fail! Feeling lucky?
          </p>
          <div className="flex gap-2">
            <button
              disabled={disabled}
              onClick={() => handleAction('GAMBLE')}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black uppercase text-xs"
            >
              Gamble Coins!
            </button>
            <button
              disabled={disabled}
              onClick={() => handleAction('SKIP')}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* ── CHALLENGE ────────────────────────────────────────────────────────── */}
      {tileType === 'CHALLENGE' && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] text-blue-300 font-bold">
            ⚡ Hard Bonus Question! Answer correctly for double coin rewards.
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black uppercase text-xs"
          >
            Accept the Challenge!
          </button>
        </div>
      )}

      {/* ── WILD ─────────────────────────────────────────────────────────────── */}
      {tileType === 'WILD' && (
        <div className="pt-2">
          <p className="text-[11px] text-teal-300 font-bold mb-3">
            🌟 Wild tile! A random positive bonus will be applied.
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-black uppercase text-xs"
          >
            Claim Wild Bonus
          </button>
        </div>
      )}

      {/* ── EVENT ────────────────────────────────────────────────────────────── */}
      {tileType === 'EVENT' && (
        <div className="pt-2">
          <p className="text-[11px] text-pink-300 font-bold mb-3">
            🎉 A new global event will affect all players for 2 rounds!
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black uppercase text-xs"
          >
            Trigger Event
          </button>
        </div>
      )}

      {/* ── TELEPORT ─────────────────────────────────────────────────────────── */}
      {tileType === 'TELEPORT' && (
        <div className="pt-2">
          <p className="text-[11px] text-violet-300 font-bold mb-3">
            ⚡ You will be teleported to a random tile on the board!
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-black uppercase text-xs"
          >
            Teleport!
          </button>
        </div>
      )}

      {/* ── ITEM_REWARD ──────────────────────────────────────────────────────── */}
      {tileType === 'ITEM_REWARD' && (
        <div className="pt-2">
          <p className="text-[11px] text-lime-300 font-bold mb-3">
            🎁 A free item is waiting for you inside!
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-lime-500 hover:bg-lime-600 text-slate-950 font-black uppercase text-xs"
          >
            Claim Free Item!
          </button>
        </div>
      )}

      {/* ── SKIP_TURN ────────────────────────────────────────────────────────── */}
      {tileType === 'SKIP_TURN' && (
        <div className="pt-2">
          <p className="text-[11px] text-sky-300 font-bold mb-3">
            ❄️ You are frozen in time and will skip upcoming turns.
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-sky-800 hover:bg-sky-700 border border-sky-600 text-sky-200 font-bold uppercase text-xs"
          >
            Accept Freeze
          </button>
        </div>
      )}

      {/* ── DICE_AGAIN ───────────────────────────────────────────────────────── */}
      {tileType === 'DICE_AGAIN' && (
        <div className="pt-2">
          <p className="text-[11px] text-amber-300 font-bold mb-3">
            🎲 Bonus roll! You will answer another trivia question and move again.
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs"
          >
            Roll Again!
          </button>
        </div>
      )}

      {/* ── SWAP ─────────────────────────────────────────────────────────────── */}
      {tileType === 'SWAP' && (
        <div className="pt-2">
          <p className="text-[11px] text-rose-300 font-bold mb-3">
            🔄 You will swap positions with another player on the board!
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-xs"
          >
            Swap Places!
          </button>
        </div>
      )}

      {/* ── COIN_BONUS ───────────────────────────────────────────────────────── */}
      {tileType === 'COIN_BONUS' && (
        <div className="pt-2">
          <p className="text-[11px] text-yellow-300 font-bold mb-3">
            💰 Free coins are yours for the taking!
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black uppercase text-xs"
          >
            Collect Coins!
          </button>
        </div>
      )}

      {/* ── COIN_DRAIN ───────────────────────────────────────────────────────── */}
      {tileType === 'COIN_DRAIN' && (
        <div className="pt-2">
          <p className="text-[11px] text-orange-400 font-semibold mb-3">
            💸 Something is draining your wallet…
          </p>
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-orange-900 hover:bg-orange-800 border border-orange-700 text-orange-200 font-bold uppercase text-xs"
          >
            Accept & Continue
          </button>
        </div>
      )}

      {/* ── BONUS (legacy) / START / NORMAL / FINISH ────────────────────────── */}
      {['START', 'NORMAL', 'BONUS', 'FINISH'].includes(tileType) && (
        <div className="pt-2">
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black uppercase text-xs"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
