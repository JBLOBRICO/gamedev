'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll } from 'lucide-react';

interface LiveReactionFeedProps {
  actions: any[];
}

type Reaction = {
  id: string;
  type: 'event' | 'answer' | 'tile' | 'system' | 'shop';
  message: string;
  emoji: string;
  color: string;
};

const EMOJI_MAP: Record<string, string> = {
  event: '⚡',
  answer: '📜',
  tile: '🏰',
  system: '📯',
  shop: '🛒',
};

const COLOR_MAP: Record<string, string> = {
  event: 'border-pink-500/60 bg-pink-950/40 text-pink-200',
  answer: 'border-amber-600/60 bg-amber-950/30 text-amber-200',
  tile: 'border-emerald-600/60 bg-emerald-950/30 text-emerald-200',
  system: 'border-stone-600/60 bg-stone-900/50 text-stone-300',
  shop: 'border-yellow-600/60 bg-yellow-950/30 text-yellow-200',
};

export default function LiveReactionFeed({ actions }: LiveReactionFeedProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const lastActionIdRef = useRef<string | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (actions.length === 0) return;

    const newActions = lastActionIdRef.current
      ? actions.filter(a => a.id > lastActionIdRef.current!)
      : actions.slice(-1);

    newActions.forEach(act => {
      if (seenRef.current.has(act.id)) return;
      seenRef.current.add(act.id);

      const det = JSON.parse(act.details || '{}');
      const message = det.message || '';
      if (!message) return;

      let type: Reaction['type'] = 'system';
      const isSystem = act.playerUsername === 'System';

      if (act.type === 'EVENT' && isSystem) type = 'event';
      else if (act.type === 'ANSWER') type = 'answer';
      else if (act.type === 'TILE') type = 'tile';
      else if (act.type === 'SHOP') type = 'shop';

      // Skip chat messages and ready toggles
      if (act.type === 'CHAT') return;

      const react: Reaction = {
        id: act.id,
        type,
        message,
        emoji: EMOJI_MAP[type],
        color: COLOR_MAP[type],
      };
      setReactions(prev => [...prev.slice(-4), react]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== react.id));
      }, 6000);
    });

    if (newActions.length > 0) {
      lastActionIdRef.current = actions[actions.length - 1].id;
    }
  }, [actions]);

  return (
    <div className="fixed bottom-6 left-3 sm:left-4 z-[120] flex flex-col-reverse gap-1.5 pointer-events-none w-[min(20rem,calc(100vw-6rem))]">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className={`flex items-start gap-2 px-3 py-2 rounded-xl border backdrop-blur-md bg-stone-950/80 shadow-lg overflow-hidden ${r.color}`}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="shrink-0 text-base leading-none mt-0.5"
            >
              {r.emoji}
            </motion.span>
            <p className="text-[10px] font-bold leading-snug line-clamp-2">
              {r.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
