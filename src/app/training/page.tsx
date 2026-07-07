'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ChevronRight, ChevronLeft, BookOpen, Dices,
  Brain, Sparkles, ShoppingCart, Trophy, CheckCircle,
  AlertTriangle, Gift, Zap, HelpCircle, Wind, Flame,
  Shield, Hourglass, ArrowRight, RotateCcw, Coins
} from 'lucide-react';
import { sounds } from '@/lib/sounds';
import confetti from 'canvas-confetti';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

// ─── Chapter Definitions ─────────────────────────────────────────────────────
const CHAPTERS: Chapter[] = [
  { id: 0, title: 'The Kingdom', subtitle: 'Historia overview', icon: <BookOpen className="w-5 h-5" />, color: 'text-amber-400' },
  { id: 1, title: 'Sacred Board', subtitle: 'Tiles & movement', icon: <Sparkles className="w-5 h-5" />, color: 'text-indigo-400' },
  { id: 2, title: 'Cast the Dice', subtitle: 'Your turn begins', icon: <Dices className="w-5 h-5" />, color: 'text-amber-400' },
  { id: 3, title: 'Ancient Trials', subtitle: 'Answer to advance', icon: <Brain className="w-5 h-5" />, color: 'text-emerald-400' },
  { id: 4, title: 'Tile Fates', subtitle: 'Land & interact', icon: <Zap className="w-5 h-5" />, color: 'text-rose-400' },
  { id: 5, title: "Merchant's Caravan", subtitle: 'Relics & strategy', icon: <ShoppingCart className="w-5 h-5" />, color: 'text-purple-400' },
  { id: 6, title: 'Ready for the Quest!', subtitle: 'Enter the realm', icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-400' },
];

// ─── Tile Data ────────────────────────────────────────────────────────────────
const TILES = [
  { type: 'NORMAL',   name: 'Stone Path',         icon: <ArrowRight className="w-6 h-6 text-slate-400" />,   bg: 'bg-slate-900 border-slate-700',         desc: 'A cobblestone path through the kingdom. Land here and move on — nothing special happens.' },
  { type: 'BONUS',    name: 'Blessing Shrine',     icon: <Gift className="w-6 h-6 text-yellow-400" />,        bg: 'bg-yellow-950/40 border-yellow-700/60',  desc: 'A sacred shrine blesses you — collect 5 free Royal Gold instantly!' },
  { type: 'TRAP',     name: 'Cursed Rune',         icon: <AlertTriangle className="w-6 h-6 text-rose-400" />, bg: 'bg-rose-950/40 border-rose-700/60',      desc: 'An ancient curse! Lose 10 Royal Gold and fall back 3 tiles — unless shielded.' },
  { type: 'TREASURE', name: 'Royal Treasury',      icon: <Gift className="w-6 h-6 text-amber-300" fill="currentColor" />, bg: 'bg-amber-950/40 border-amber-700/60', desc: 'Spend 10 Gold to open the vault. Could be a Shield, 25 coins, or a Mimic trap!' },
  { type: 'MYSTERY',  name: 'Ancient Relic',       icon: <HelpCircle className="w-6 h-6 text-purple-400" />, bg: 'bg-purple-950/40 border-purple-700/60',  desc: 'A forgotten relic awakens! You might swap positions, teleport forward, or gain gold.' },
  { type: 'SHORTCUT', name: 'Secret Passage',      icon: <Wind className="w-6 h-6 text-cyan-400" />,         bg: 'bg-cyan-950/40 border-cyan-700/60',      desc: 'A hidden tunnel carries you +2 extra tiles ahead automatically.' },
  { type: 'RISK',     name: 'Gambler\'s Flame',    icon: <Flame className="w-6 h-6 text-orange-400" />,      bg: 'bg-orange-950/40 border-orange-700/60',  desc: 'Risk your Royal Gold! Win and double it, lose and forfeit half. High stakes!' },
  { type: 'WILD',     name: 'Fate Scroll',         icon: <Sparkles className="w-6 h-6 text-teal-400" />,     bg: 'bg-teal-950/40 border-teal-700/60',      desc: 'A royal scroll reveals a random blessing — extra gold, XP, or bonus movement.' },
];

// ─── Shop Items for Chapter 5 ─────────────────────────────────────────────────
const SHOP_ITEMS = [
  { id: 'shield',      name: '🛡️ Iron Shield',       cost: 20, icon: <Shield className="w-6 h-6 text-sky-400" />,     desc: 'Blocks the next Cursed Rune or negative tile effect completely.' },
  { id: 'extra_time',  name: '⏳ Hourglass Relic',    cost: 10, icon: <Hourglass className="w-6 h-6 text-cyan-400" />, desc: 'Grants +15 seconds to answer your next ancient trial.' },
  { id: 'lucky_dice',  name: '🎲 Blessed Dice',       cost: 20, icon: <Dices className="w-6 h-6 text-amber-400" />,   desc: 'Guarantees your next roll yields a 5 or 6. Never waste a turn!' },
  { id: 'multiplier',  name: '💰 Royal Multiplier',   cost: 15, icon: <Coins className="w-6 h-6 text-yellow-400" />,  desc: 'Doubles all Royal Gold earned on your next correct trial answer.' },
  { id: 'trap_immune', name: '🌑 Shadow Cloak',       cost: 18, icon: <Shield className="w-6 h-6 text-indigo-400" />, desc: 'Passively absorbs the next Cursed Rune you land upon.' },
];

// ─── Mock Trivia Questions ────────────────────────────────────────────────────
const MOCK_QUESTIONS = [
  {
    question: "What is the capital city of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correct: "Paris",
    difficulty: "EASY",
    category: "Geography",
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: "6",
    difficulty: "EASY",
    category: "Mathematics",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Saturn", "Mars"],
    correct: "Mars",
    difficulty: "MEDIUM",
    category: "Science",
  },
];

// ─── Chapter 0: Welcome to Historia ──────────────────────────────────────────
function ChapterWelcome() {
  return (
    <div className="space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-700 to-stone-900 border border-amber-600/50 flex items-center justify-center shadow-2xl shadow-amber-900/40"
      >
        <span className="text-4xl crown-float">👑</span>
      </motion.div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/60">⚜ Scholar's Training Grounds ⚜</p>
        <h2 className="text-3xl font-black text-[#f5f0e8]">
          Welcome to<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
            Historia Legends
          </span>
        </h2>
        <p className="text-stone-400 max-w-lg mx-auto leading-relaxed text-sm">
          In the Kingdom of Historia, brave heroes compete across ancient castles, enchanted forests, and forgotten ruins.
          Roll the dice, answer the ancient trials, and race to claim the legendary Crown of Wisdom!
        </p>
        <p className="text-amber-700/50 italic text-xs">"The realm's greatest scholars left these trials — only the wisest shall prevail."</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
        {[
          { icon: '🎲', title: 'Cast the Dice', desc: 'Roll an ancient die, then face a trial to earn movement across the board.' },
          { icon: '📜', title: 'Face the Trials', desc: '16 categories, 3 difficulty levels. Harder trials yield more Royal Gold and XP!' },
          { icon: '👑', title: 'Claim the Crown', desc: 'First hero to reach the Finish Line wins the Crown of Wisdom and earns the title of Crowned Champion!' },
        ].map((item) => (
          <div key={item.title} className="p-4 rounded-2xl border border-amber-900/25 bg-amber-950/10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-bold text-[#f5f0e8]">{item.title}</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
        {['⚔️ Royal Duel (1v1)', '🛡️ Band of Heroes (2v2)', '👑 Grand Melee (4P)'].map((mode) => (
          <span key={mode} className="px-4 py-1.5 rounded-full border border-amber-800/40 bg-amber-950/20 text-amber-500/80">
            {mode}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Chapter 1: The Board ─────────────────────────────────────────────────────
function ChapterBoard() {
  const [selected, setSelected] = useState(TILES[0]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[#f5f0e8]">The <span className="text-indigo-400">Sacred Board</span></h2>
        <p className="text-stone-400 text-sm">The board has 46 tiles (0–45) across the Kingdom of Historia. Tap each tile type to learn what it does.</p>
      </div>

      {/* Tile selector grid */}
      <div className="grid grid-cols-4 gap-2">
        {TILES.map((tile) => (
          <button
            key={tile.type}
            onClick={() => { sounds.playClick(); setSelected(tile); }}
            className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
              selected.type === tile.type
                ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/10 scale-105'
                : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
            }`}
          >
            {tile.icon}
            <span className="text-[10px] font-bold text-slate-300 text-center leading-tight">{tile.name}</span>
          </button>
        ))}
      </div>

      {/* Selected tile detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.type}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className={`p-5 rounded-2xl border-2 ${selected.bg} flex items-start gap-4`}
        >
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 shrink-0">
            {selected.icon}
          </div>
          <div>
            <h3 className="text-base font-black text-white mb-1">{selected.name}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{selected.desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>

        <div className="p-4 rounded-xl bg-stone-950/40 border border-stone-800/40 text-xs text-stone-400 leading-relaxed">
        <span className="text-amber-500/70 font-bold">⚜ Royal Lore:</span> The sacred board follows a serpentine path. Start at tile 0 (The Kingdom Gate) and race toward tile 45 (Finish Line). Roll first, then answer a trial to determine your advance.
      </div>
    </div>
  );
}

// ─── Chapter 2: Roll the Dice ─────────────────────────────────────────────────
function ChapterDice() {
  const [face, setFace] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [rolled, setRolled] = useState(false);
  const [category, setCategory] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState('MEDIUM');

  const CATEGORIES = ['General Knowledge', 'Science', 'History', 'Geography', 'Technology', 'Gaming'];
  const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

  const handleRoll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setRolled(false);
    sounds.playDiceRoll();

    let ticks = 0;
    const interval = setInterval(() => {
      setFace(Math.floor(1 + Math.random() * 6));
      ticks++;
      if (ticks > 10) {
        clearInterval(interval);
        const finalFace = Math.floor(1 + Math.random() * 6);
        setFace(finalFace);
        sounds.playDiceLand();
        setRolling(false);
        setRolled(true);
      }
    }, 100);
  }, [rolling]);

  const dotsMap: Record<number, number[]> = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[#f5f0e8]">Cast the <span className="text-amber-400">Ancient Dice</span></h2>
        <p className="text-stone-400 text-sm">Each turn begins with a roll. Choose your preferred trial category and difficulty, then cast the dice!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category selector */}
        <div className="p-4 rounded-2xl border border-stone-800/50 glass-panel space-y-3">
          <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Trial Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { sounds.playClick(); setCategory(c); }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                  category === c ? 'border-amber-500/60 bg-amber-950/30 text-amber-400' : 'border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="p-4 rounded-2xl border border-stone-800/50 glass-panel space-y-3">
          <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Trial Difficulty</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => {
              const colors = { EASY: 'border-emerald-500 bg-emerald-950/30 text-emerald-400', MEDIUM: 'border-amber-500 bg-amber-950/30 text-amber-400', HARD: 'border-rose-500 bg-rose-950/30 text-rose-400' };
              const inactive = 'border-slate-800 text-slate-400 hover:border-slate-700';
              return (
                <button
                  key={d}
                  onClick={() => { sounds.playClick(); setDifficulty(d); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border uppercase tracking-wider transition-all ${difficulty === d ? colors[d as keyof typeof colors] : inactive}`}
                >
                  {d === 'EASY' ? '⭐ Easy' : d === 'MEDIUM' ? '⭐⭐ Med' : '⭐⭐⭐ Hard'}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500">
            {difficulty === 'EASY' && '+5 coins, +20 XP, move = roll result'}
            {difficulty === 'MEDIUM' && '+10 coins, +40 XP, move = roll + 1'}
            {difficulty === 'HARD' && '+20 coins, +80 XP, move = roll + 2'}
          </p>
        </div>
      </div>

      {/* Dice display */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={rolling ? { rotateX: [0, 360, 720], rotateY: [0, 180, 360], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.8 }}
          onClick={handleRoll}
          className="cursor-pointer"
        >
          <div className="w-24 h-24 bg-stone-950 border-2 border-amber-600/60 rounded-3xl grid grid-cols-3 p-4 gap-2 shadow-xl shadow-amber-900/20">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                {(dotsMap[face] || [4]).includes(i) && (
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <button
          onClick={handleRoll}
          disabled={rolling}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase tracking-wider text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20"
        >
          <Dices className="w-5 h-5" />
          {rolling ? 'Rolling…' : '⚔️ Cast the Dice!'}
        </button>

        <AnimatePresence>
          {rolled && !rolling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-4 rounded-2xl border border-amber-800/40 bg-amber-950/15 space-y-1"
            >
              <p className="text-amber-400 font-black text-lg">⚔️ You rolled a {face}!</p>
              <p className="text-stone-400 text-xs">
                If you answer a {difficulty} trial correctly, you&apos;ll advance {difficulty === 'EASY' ? face : difficulty === 'MEDIUM' ? face + 1 : face + 2} tile{(difficulty === 'EASY' ? face : difficulty === 'MEDIUM' ? face + 1 : face + 2) !== 1 ? 's' : ''} forward across the Kingdom.
              </p>
              <p className="text-amber-500/70 text-xs font-bold mt-1 italic">→ A &quot;{category}&quot; trial from the Royal Librarians awaits!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Chapter 3: Trivia Quiz ────────────────────────────────────────────────────
function ChapterTrivia() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const q = MOCK_QUESTIONS[qIdx];

  const handleAnswer = (opt: string) => {
    if (submitted) return;
    sounds.playClick();
    setSelected(opt);
    setSubmitted(true);
    if (opt === q.correct) {
      sounds.playCorrect();
      setScore(s => s + 1);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } else {
      sounds.playIncorrect();
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (qIdx < MOCK_QUESTIONS.length - 1) {
      setQIdx(i => i + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleReset = () => {
    sounds.playClick();
    setQIdx(0);
    setSelected(null);
    setSubmitted(false);
    setScore(0);
  };

  const diffColors: Record<string, string> = {
    EASY: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30',
    MEDIUM: 'text-amber-400 bg-amber-950/40 border-amber-900/30',
    HARD: 'text-rose-400 bg-rose-950/40 border-rose-900/30',
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[#f5f0e8]">Face the <span className="text-emerald-400">Ancient Trials</span></h2>
        <p className="text-stone-400 text-sm">Try these practice trials. Answer correctly to advance your hero across the Kingdom of Historia!</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Question {qIdx + 1} of {MOCK_QUESTIONS.length}</span>
        <span className="text-emerald-400">✓ {score} correct</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((qIdx) / MOCK_QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${diffColors[q.difficulty]}`}>
              {q.difficulty}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{q.category}</span>
          </div>

          {/* Question */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
            <Brain className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-pulse" />
            <p className="text-base font-bold text-slate-100 leading-snug">{q.question}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-2">
            {q.options.map((opt) => {
              const isCorrect = opt === q.correct;
              const isChosen = opt === selected;
              let cls = 'border-slate-800 bg-slate-900/30 hover:border-slate-700 text-slate-200';
              let icon = null;
              if (submitted) {
                if (isCorrect) { cls = 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow shadow-emerald-500/10'; icon = <CheckCircle className="w-4 h-4 text-emerald-400" />; }
                else if (isChosen) { cls = 'border-rose-500 bg-rose-950/20 text-rose-300'; icon = <AlertTriangle className="w-4 h-4 text-rose-400" />; }
                else { cls = 'border-slate-900 bg-slate-950/20 opacity-40'; }
              }
              return (
                <button
                  key={opt}
                  disabled={submitted}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full px-4 py-3 rounded-xl border-2 flex items-center justify-between text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:hover:scale-100 ${cls}`}
                >
                  <span>{opt}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border text-sm font-bold text-center ${
                  selected === q.correct
                    ? 'border-emerald-900/40 bg-emerald-950/20 text-emerald-400'
                    : 'border-rose-900/40 bg-rose-950/20 text-rose-400'
                }`}
              >
                {selected === q.correct
                  ? `✓ Correct! In your quest you'd earn Royal Gold and advance forward.`
                  : `✗ The correct answer was "${q.correct}". You would remain in place this turn.`}
              </motion.div>
            )}
          </AnimatePresence>

          {submitted && (
            <div className="flex gap-3">
              {qIdx < MOCK_QUESTIONS.length - 1 ? (
                <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95">
                  Next Trial <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex-1 space-y-2">
                  <div className="text-center p-3 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-400 font-black text-sm">
                    🎉 Practice complete! {score}/{MOCK_QUESTIONS.length} correct.
                  </div>
                  <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-700/50 text-stone-300 hover:bg-stone-900 font-bold text-xs uppercase tracking-wider transition-all active:scale-95">
                    <RotateCcw className="w-3.5 h-3.5" /> Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Chapter 4: Tile Effects (Interactive) ────────────────────────────────────
function ChapterTileEffects() {
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [coins, setCoins] = useState(50);

  const interactions: Record<string, { label: string; action: () => void; color: string }[]> = {
    TRAP: [{ label: '⚔️ Accept the Curse', color: 'bg-rose-700 text-white', action: () => { sounds.playIncorrect(); setResult('💥 The Cursed Rune strikes! Lost 10 Royal Gold and fell back 3 tiles!'); setCoins(c => Math.max(0, c - 10)); } }],
    TREASURE: [
      { label: '🏛️ Open the Royal Treasury (10g)', color: 'bg-amber-600 text-stone-950', action: () => {
        if (coins < 10) { setResult('❌ Not enough Royal Gold!'); return; }
        sounds.playCoin();
        const r = Math.random();
        setCoins(c => c - 10);
        if (r < 0.4) setResult('🛡️ An Iron Shield was hidden inside!');
        else if (r < 0.8) { setResult('💰 Found 25 Royal Gold!'); setCoins(c => c + 25); }
        else setResult('🪤 A MIMIC lurks within! Fell back 3 tiles.');
      }},
      { label: 'Leave the Chest', color: 'bg-stone-800 text-stone-300', action: () => { sounds.playClick(); setResult('You left the Royal Treasury sealed.'); } }
    ],
    MYSTERY: [{ label: '🔮 Invoke the Ancient Relic', color: 'bg-purple-700 text-white', action: () => {
      const r = Math.random();
      sounds.playCorrect();
      if (r < 0.33) setResult('🔄 The relic swaps your position with another hero!');
      else if (r < 0.66) { setResult('⚡ Teleported +4 tiles forward through the realm!'); }
      else { setResult('✨ The relic bestows 15 Royal Gold!'); setCoins(c => c + 15); }
    }}],
    SHORTCUT: [{ label: '🗺️ Take the Secret Passage', color: 'bg-cyan-600 text-stone-950', action: () => { sounds.playCorrect(); setResult('💨 A hidden tunnel carries you +2 tiles ahead!'); } }],
    BONUS: [{ label: '✨ Collect the Blessing', color: 'bg-yellow-600 text-stone-950', action: () => { sounds.playCoin(); setResult('🙏 The Blessing Shrine rewards you with 5 Royal Gold!'); setCoins(c => c + 5); } }],
    RISK: [
      { label: "🎲 Risk Your Fortune!", color: 'bg-orange-600 text-stone-950', action: () => {
        const win = Math.random() > 0.4;
        if (win) { sounds.playVictory(); setResult(`💸 Fortune smiles upon you! Royal Gold doubled!`); setCoins(c => c * 2); }
        else { sounds.playIncorrect(); setResult('😬 The gamble fails! Half your Royal Gold is lost!'); setCoins(c => Math.floor(c / 2)); }
      }},
      { label: 'Decline Wisely', color: 'bg-stone-800 text-stone-300', action: () => { sounds.playClick(); setResult('A wise hero knows when not to gamble.'); } }
    ],
  };

  const tileButtons = TILES.filter(t => interactions[t.type]);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[#f5f0e8]">Tile <span className="text-rose-400">Fates</span></h2>
        <p className="text-stone-400 text-sm">Tap a tile to simulate landing on it within the Kingdom of Historia and see its effect.</p>
      </div>

      {/* Coin counter */}
      <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-lg">
        <Coins className="w-5 h-5" />
        {coins} Royal Gold
        <button onClick={() => { setCoins(50); setResult(null); setActiveTile(null); sounds.playClick(); }} className="text-xs text-stone-500 hover:text-stone-300 font-normal ml-2 border border-stone-800 px-2 py-0.5 rounded-lg transition-colors">Reset</button>
      </div>

      {/* Tile picker */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tileButtons.map(tile => (
          <button
            key={tile.type}
            onClick={() => { sounds.playClick(); setActiveTile(tile.type); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
              activeTile === tile.type ? 'border-amber-500/60 bg-amber-950/30 text-amber-300' : 'border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            {tile.icon} {tile.name}
          </button>
        ))}
      </div>

      {/* Interaction zone */}
      <AnimatePresence mode="wait">
        {activeTile && (
          <motion.div
            key={activeTile}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-3"
          >
            {/* Tile info */}
            {(() => {
              const t = TILES.find(x => x.type === activeTile)!;
              return (
                <div className={`p-4 rounded-2xl border-2 ${t.bg} flex items-start gap-3`}>
                  <div className="p-2.5 bg-stone-950/60 rounded-xl border border-stone-800 shrink-0">{t.icon}</div>
                  <div>
                    <p className="font-bold text-[#f5f0e8] text-sm">{t.name}</p>
                    <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              );
            })()}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {interactions[activeTile]?.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => { btn.action(); }}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${btn.color}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl border border-stone-700/50 bg-stone-900/50 text-sm font-bold text-[#f5f0e8] text-center"
                >
                  {result}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeTile && (
        <div className="text-center py-8 text-stone-600 text-sm italic">
          ☝️ Select a tile above to witness its fate in Historia
        </div>
      )}
    </div>
  );
}

// ─── Chapter 5: Item Shop ─────────────────────────────────────────────────────
function ChapterShop() {
  const [coins, setCoins] = useState(60);
  const [owned, setOwned] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (coins < item.cost) { setMsg('❌ Not enough coins!'); return; }
    if (owned.includes(item.id)) { setMsg('✅ Already owned!'); return; }
    sounds.playCoin();
    setCoins(c => c - item.cost);
    setOwned(o => [...o, item.id]);
    setMsg(`🛒 Bought "${item.name}" for ${item.cost} coins!`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-[#f5f0e8]">The <span className="text-purple-400">Merchant's Caravan</span></h2>
        <p className="text-stone-400 text-sm">Spend Royal Gold on Relics during your quest. Strategic purchases determine the victor!</p>
      </div>

      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-amber-400 flex items-center gap-1.5"><Coins className="w-4 h-4" />{coins} Royal Gold</span>
        <button onClick={() => { setCoins(60); setOwned([]); setMsg(null); sounds.playClick(); }} className="text-xs text-stone-500 hover:text-stone-300 border border-stone-800 px-3 py-1 rounded-lg transition-colors">Reset</button>
      </div>

      <div className="space-y-2">
        {SHOP_ITEMS.map((item) => {
          const isOwned = owned.includes(item.id);
          const canAfford = coins >= item.cost;
          return (
            <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isOwned ? 'border-emerald-800/40 bg-emerald-950/10' : 'border-stone-800/60 bg-stone-900/15'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl shrink-0">{item.icon}</div>
                <div>
                  <p className="text-sm font-bold text-[#f5f0e8] flex items-center gap-1.5">
                    {item.name}
                    {isOwned && <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/35 px-1.5 py-0.5 rounded">✓ ACTIVE</span>}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleBuy(item)}
                disabled={isOwned}
                className={`shrink-0 ml-3 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                  isOwned ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : canAfford ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 hover:scale-105'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                {isOwned ? 'Owned' : `${item.cost}g`}
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl border border-stone-700/50 bg-stone-900/50 text-sm font-bold text-[#f5f0e8] text-center"
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-xl bg-stone-950/40 border border-stone-800/40 text-xs text-stone-400 leading-relaxed italic">
        <span className="text-purple-400 font-bold not-italic">⚜ Merchant's Wisdom:</span> Buy an Iron Shield before a trap-heavy section. Use Blessed Dice when you need a high roll. Save the Royal Multiplier for Hard trials for maximum gold.
      </div>
    </div>
  );
}

// ─── Chapter 6: Complete ─────────────────────────────────────────────────────
function ChapterComplete() {
  useEffect(() => {
    sounds.playVictory();
    const end = Date.now() + 2500;
    const iv = setInterval(() => {
      if (Date.now() > end) { clearInterval(iv); return; }
      confetti({ startVelocity: 25, spread: 360, ticks: 50, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 200);
    return () => clearInterval(iv);
  }, []);

  const tips = [
    { icon: '⚔️', text: 'Hard trials yield more Royal Gold AND extra movement (+2). High stakes, high honour!' },
    { icon: '🛡️', text: "Leading the quest? Buy the Iron Shield. Cursed Runes can undo your progress fast." },
    { icon: '🎲', text: "Save the Blessed Dice for when you're 5–6 tiles from the Finish Line." },
    { icon: '💰', text: 'Royal Treasury vaults are worth opening early — while you can absorb a bad result.' },
    { icon: '⚜️', text: 'In Band of Heroes mode, your pawn moves together. Coordinate Relic purchases with your ally!' },
    { icon: '🔥', text: 'Royal Multiplier + Hard trial = a huge gold burst. Stack it wisely before a difficult question.' },
  ];

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/30"
        >
          <Trophy className="w-12 h-12 text-slate-950" />
        </motion.div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400">
          Ready for the Quest!
        </h2>
        <p className="text-stone-400 max-w-md mx-auto text-sm">
          You have mastered the ways of Historia. Here are final strategies from the Royal Librarians before you enter the realm:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-2xl border border-stone-800/50 bg-stone-900/25 flex items-start gap-3"
          >
            <span className="text-xl shrink-0">{tip.icon}</span>
            <p className="text-xs text-stone-400 leading-relaxed">{tip.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase tracking-wider text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-900/30"
        >
          👑 Enter the Kingdom!
        </Link>
        <Link
          href="/training"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-700/50 text-stone-300 hover:bg-stone-900 font-bold text-sm transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Replay Training
        </Link>
      </div>
    </div>
  );
}

// ─── Main Training Page ───────────────────────────────────────────────────────
const CHAPTER_COMPONENTS = [
  ChapterWelcome,
  ChapterBoard,
  ChapterDice,
  ChapterTrivia,
  ChapterTileEffects,
  ChapterShop,
  ChapterComplete,
];

export default function TrainingPage() {
  const [chapter, setChapter] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (chapter < CHAPTERS.length - 1) {
      sounds.playClick();
      setDirection(1);
      setChapter(c => c + 1);
    }
  };

  const goPrev = () => {
    if (chapter > 0) {
      sounds.playClick();
      setDirection(-1);
      setChapter(c => c - 1);
    }
  };

  const goTo = (idx: number) => {
    sounds.playClick();
    setDirection(idx > chapter ? 1 : -1);
    setChapter(idx);
  };

  const ChapterContent = CHAPTER_COMPONENTS[chapter];
  const isLast = chapter === CHAPTERS.length - 1;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#f5f0e8] bg-grid-pattern">
      {/* Header */}
      <div className="border-b border-amber-900/25 bg-[#080608]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-stone-400 hover:text-amber-300 transition-colors text-sm font-bold">
            <Home className="w-4 h-4" /> Kingdom
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500/60" />
            <span className="text-sm font-black text-[#f5f0e8]">Scholar's Training Grounds</span>
          </div>
          <span className="text-xs text-stone-600 font-bold">{chapter + 1} / {CHAPTERS.length}</span>
        </div>
        {/* Decorative amber line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
      </div>

      {/* Chapter Progress Stepper */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {CHAPTERS.map((ch, i) => (
            <React.Fragment key={ch.id}>
              <button
                onClick={() => goTo(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                  i === chapter
                    ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-900/30'
                    : i < chapter
                    ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-400'
                    : 'bg-stone-900/40 border border-stone-800 text-stone-500 hover:text-stone-300'
                }`}
              >
                {i < chapter ? <CheckCircle className="w-3 h-3" /> : ch.icon}
                <span className="hidden sm:inline">{ch.title}</span>
              </button>
              {i < CHAPTERS.length - 1 && (
                <div className={`h-px w-4 shrink-0 ${i < chapter ? 'bg-emerald-700' : 'bg-stone-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Chapter Panel */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Chapter label */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${CHAPTERS[chapter].color} bg-stone-900/60 border border-stone-800/50 px-3 py-1.5 rounded-full`}>
            {CHAPTERS[chapter].icon}
            Chapter {chapter + 1}: {CHAPTERS[chapter].title}
          </div>
        </div>

        {/* Chapter content with slide animation */}
        <div className="min-h-[480px] relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={chapter}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-6 sm:p-8 rounded-3xl border border-stone-800/50 glass-panel"
            >
              <ChapterContent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {!isLast && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goPrev}
              disabled={chapter === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-stone-700/50 text-stone-300 hover:bg-stone-900 font-bold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {CHAPTERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all ${
                    i === chapter ? 'w-6 h-2.5 bg-amber-500' : i < chapter ? 'w-2.5 h-2.5 bg-emerald-500' : 'w-2.5 h-2.5 bg-stone-700 hover:bg-stone-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-amber-900/25"
            >
              {chapter === CHAPTERS.length - 2 ? 'Finish!' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
