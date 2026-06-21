'use client';

import React from 'react';
import { Shield, Sparkles, Flame, AlertOctagon, HelpCircle, Wind, Trophy } from 'lucide-react';
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
      case 'TRAP': return { icon: <AlertOctagon className="w-8 h-8 text-rose-500 animate-bounce" />, border: 'border-rose-900/40 bg-rose-950/20' };
      case 'TREASURE': return { icon: <Trophy className="w-8 h-8 text-amber-400" />, border: 'border-amber-900/40 bg-amber-950/20' };
      case 'MYSTERY': return { icon: <HelpCircle className="w-8 h-8 text-purple-400" />, border: 'border-purple-900/40 bg-purple-950/20' };
      case 'SHORTCUT': return { icon: <Wind className="w-8 h-8 text-cyan-400" />, border: 'border-cyan-900/40 bg-cyan-950/20' };
      case 'RISK': return { icon: <Flame className="w-8 h-8 text-orange-500" />, border: 'border-orange-900/40 bg-orange-950/20' };
      default: return { icon: <Sparkles className="w-8 h-8 text-sky-400" />, border: 'border-slate-800 bg-slate-900/40' };
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

      {/* Trap Details */}
      {tileType === 'TRAP' && (
        <div className="py-2">
          {hasShield ? (
            <p className="text-xs text-sky-400 font-bold flex items-center justify-center gap-1">
              <Shield className="w-4 h-4 fill-sky-500/10" />
              You have an active Shield! It will block this trap.
            </p>
          ) : (
            <p className="text-xs text-rose-400 font-semibold">
              Warning: You will lose 10 coins and move back 3 tiles.
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

      {/* Treasure Chest Choice */}
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

      {/* Shortcut choice */}
      {tileType === 'SHORTCUT' && (
        <div className="pt-2">
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black uppercase text-xs"
          >
            Ride the Wind (+2 tiles)
          </button>
        </div>
      )}

      {/* Mystery choice */}
      {tileType === 'MYSTERY' && (
        <div className="pt-2">
          <button
            disabled={disabled}
            onClick={() => handleAction('CONTINUE')}
            className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black uppercase text-xs"
          >
            Trigger Mystery Event
          </button>
        </div>
      )}

      {/* Risk choice */}
      {tileType === 'RISK' && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] text-slate-400">
            Double your coins if you succeed, or lose half your coins if you fail!
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

      {/* Normal / Wild / event / finish tiles default continuation */}
      {['START', 'NORMAL', 'WILD', 'EVENT', 'BONUS'].includes(tileType) && (
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
