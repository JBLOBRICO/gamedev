'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export default function SoundSettings() {
  const [enabled, setEnabled] = useState(sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setEnabled(sounds.enabled);
    if (sounds.enabled) {
      sounds.playCoin();
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center p-3 rounded-full border border-amber-900/40 glass-panel text-stone-400 hover:text-amber-400 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-black/50"
      title={enabled ? 'Mute Kingdom Sounds' : 'Unmute Kingdom Sounds'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5 text-amber-500/70 animate-pulse" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
      <span className="sr-only">Toggle Sound</span>
    </button>
  );
}
