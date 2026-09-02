'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { HEROES } from '@/lib/heroes';
import { getAvatarById } from '@/lib/avatars';
import { sounds } from '@/lib/sounds';

interface HeroJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeroJournal({ isOpen, onClose }: HeroJournalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const hero = HEROES[currentIndex];
  const avatar = getAvatarById(hero.avatarId);

  const nextHero = () => {
    sounds.playClick();
    setCurrentIndex((prev) => (prev + 1) % HEROES.length);
  };

  const prevHero = () => {
    sounds.playClick();
    setCurrentIndex((prev) => (prev - 1 + HEROES.length) % HEROES.length);
  };

  // Two-page layout on md+, single scrollable page on mobile
  const portrait = (
    <div className="flex flex-col items-center">
      <motion.div
        key={`portrait-${hero.avatarId}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full border-4 border-amber-900/80 p-2 shadow-2xl shadow-amber-950/40 relative mb-6 bg-stone-900 shrink-0"
      >
        {avatar.render('w-full h-full')}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-950 border border-amber-700/50 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-md">
          {hero.heroClass}
        </div>
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-black text-amber-950 text-center uppercase drop-shadow-sm mb-1">
        {hero.name}
      </h2>
      <h3 className="text-xs md:text-sm font-black text-amber-800/80 text-center uppercase tracking-widest mb-5">
        "{hero.title}"
      </h3>

      <div className="w-full space-y-4 text-amber-950/90 text-sm">
        <div className="bg-amber-900/5 p-4 rounded-xl border border-amber-900/10 shadow-inner">
          <p className="font-black text-amber-900 uppercase text-[10px] mb-1">Origin</p>
          <p className="font-semibold italic">{hero.kingdomOrigin}</p>
        </div>

        <div className="bg-amber-900/5 p-4 rounded-xl border border-amber-900/10 shadow-inner flex gap-3">
          <div className="text-3xl">{hero.passive.icon}</div>
          <div>
            <p className="font-black text-amber-900 uppercase text-[10px] mb-0.5">Passive: {hero.passive.name}</p>
            <p className="font-semibold text-xs">{hero.passive.description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const lore = (
    <div className="flex-1 overflow-y-auto pr-3 md:pr-4 scrollbar-thin scrollbar-thumb-amber-900/20 scrollbar-track-transparent space-y-6">
      <div>
        <h4 className="text-lg md:text-xl font-black text-amber-950 uppercase mb-2 border-b border-amber-900/20 pb-2">Biography</h4>
        <p className="text-amber-950/80 text-sm leading-relaxed font-medium text-justify">
          <span className="text-3xl font-black float-left mr-2 mt-[-6px] text-amber-900">{hero.biography.charAt(0)}</span>
          {hero.biography.substring(1)}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-black text-amber-950 uppercase mb-2">Personality</h4>
        <p className="text-amber-950/80 text-sm italic">
          {hero.personality}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-amber-900/5 p-3 rounded-lg border border-emerald-900/20">
          <h4 className="text-[10px] font-black text-emerald-800 uppercase mb-1">Strengths</h4>
          <p className="text-emerald-950/80 text-xs font-semibold">{hero.strengths}</p>
        </div>
        <div className="bg-amber-900/5 p-3 rounded-lg border border-rose-900/20">
          <h4 className="text-[10px] font-black text-rose-800 uppercase mb-1">Weaknesses</h4>
          <p className="text-rose-950/80 text-xs font-semibold">{hero.weaknesses}</p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-amber-900/20 text-center">
        <p className="font-black text-amber-950/60 uppercase text-[10px] tracking-widest mb-2">Renowned Quote</p>
        <p className="text-lg font-bold text-amber-900 italic font-serif">
          {hero.quote}
        </p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl h-[90vh] max-h-[90vh] min-h-0 flex shadow-2xl rounded-sm"
        >
          {/* Close button */}
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-9 h-9 sm:w-10 sm:h-10 bg-amber-950 border-2 border-amber-600/50 rounded-full flex items-center justify-center text-amber-500 hover:text-amber-300 hover:bg-amber-900 z-50 transition-all shadow-lg shadow-black"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* The Book Container */}
          <div className="flex-1 flex flex-col md:flex-row bg-[#e8dbb5] rounded-sm relative shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">

            {/* Book binding center fold — only on md+ two-page layout */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/20 to-transparent shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] z-10 pointer-events-none" />
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-black/30 -translate-x-1/2 z-10 pointer-events-none" />

            {/* MOBILE: Single scrollable page (stacked) */}
            <div className="md:hidden flex-1 overflow-y-auto relative flex flex-col">
              <div className="flex-1 p-5 pt-6 relative flex flex-col items-center">
                <div className="absolute top-4 left-4 text-amber-900/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-900/60 mb-4 text-center border-b border-amber-900/20 pb-2 w-full">
                  Chronicles of Historia
                </p>
                {portrait}
                <div className="w-full mt-6 border-t border-amber-900/20 pt-6">
                  {lore}
                </div>
              </div>
            </div>

            {/* DESKTOP/TABLET: Left Page (Portrait & Stats) */}
            <div className="hidden md:flex flex-1 p-8 lg:p-12 relative border-r border-amber-900/10 flex flex-col items-center overflow-y-auto">
              <div className="absolute top-4 left-4 text-amber-900/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-900/60 mb-6 text-center border-b border-amber-900/20 pb-2 w-full">
                Chronicles of Historia
              </p>
              {portrait}
            </div>

            {/* DESKTOP/TABLET: Right Page (Lore) */}
            <div className="hidden md:flex flex-1 p-8 lg:p-12 relative flex flex-col">
              {lore}

              {/* Navigation Right */}
              <button
                onClick={nextHero}
                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 rounded-full flex items-center justify-center transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="absolute bottom-4 right-4 text-amber-900/40 text-xs font-black">
                Page {currentIndex + 1} of {HEROES.length}
              </div>
            </div>

            {/* Mobile navigation */}
            <div className="md:hidden absolute bottom-3 left-0 right-0 flex items-center justify-between px-3 z-20">
              <button
                onClick={prevHero}
                className="w-11 h-11 bg-amber-900/15 hover:bg-amber-900/25 text-amber-950 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-amber-900/50 text-xs font-black">Page {currentIndex + 1} of {HEROES.length}</span>
              <button
                onClick={nextHero}
                className="w-11 h-11 bg-amber-900/15 hover:bg-amber-900/25 text-amber-950 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
