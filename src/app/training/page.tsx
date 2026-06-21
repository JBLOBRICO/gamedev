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
  { id: 0, title: 'Welcome', subtitle: 'Game overview', icon: <BookOpen className="w-5 h-5" />, color: 'text-sky-400' },
  { id: 1, title: 'The Board', subtitle: 'Tiles & movement', icon: <Sparkles className="w-5 h-5" />, color: 'text-indigo-400' },
  { id: 2, title: 'Roll the Dice', subtitle: 'Your turn begins', icon: <Dices className="w-5 h-5" />, color: 'text-amber-400' },
  { id: 3, title: 'Trivia Time', subtitle: 'Answer to advance', icon: <Brain className="w-5 h-5" />, color: 'text-emerald-400' },
  { id: 4, title: 'Tile Effects', subtitle: 'Land & interact', icon: <Zap className="w-5 h-5" />, color: 'text-rose-400' },
  { id: 5, title: 'Item Shop', subtitle: 'Power-ups & strategy', icon: <ShoppingCart className="w-5 h-5" />, color: 'text-purple-400' },
  { id: 6, title: "You're Ready!", subtitle: 'Enter the arena', icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-400' },
];

// ─── Tile Data for Chapter 2 ──────────────────────────────────────────────────
const TILES = [
  { type: 'NORMAL',   name: 'Normal Tile',    icon: <ArrowRight className="w-6 h-6 text-slate-400" />,      bg: 'bg-slate-900 border-slate-700',         desc: 'A standard tile. Land here and move on — nothing special happens.' },
  { type: 'BONUS',    name: 'Bonus Tile',     icon: <Gift className="w-6 h-6 text-yellow-400" />,           bg: 'bg-yellow-950/40 border-yellow-700/60',  desc: 'Land here to collect 5 free coins instantly. Always good news!' },
  { type: 'TRAP',     name: 'Spike Trap',     icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,    bg: 'bg-rose-950/40 border-rose-700/60',      desc: 'Ouch! Lose 10 coins and fall back 3 tiles — unless you have a Shield.' },
  { type: 'TREASURE', name: 'Treasure Chest', icon: <Gift className="w-6 h-6 text-amber-300" fill="currentColor" />, bg: 'bg-amber-950/40 border-amber-700/60', desc: 'Spend 10 coins to open it. Could be a Shield, 25 coins, or a Mimic trap!' },
  { type: 'MYSTERY',  name: 'Mystery Space',  icon: <HelpCircle className="w-6 h-6 text-purple-400" />,    bg: 'bg-purple-950/40 border-purple-700/60',  desc: 'Unpredictable! You might swap positions, teleport forward, or get coins.' },
  { type: 'SHORTCUT', name: 'Shortcut Wind',  icon: <Wind className="w-6 h-6 text-cyan-400" />,            bg: 'bg-cyan-950/40 border-cyan-700/60',      desc: 'A gust of wind carries you +2 extra tiles ahead automatically.' },
  { type: 'RISK',     name: 'Risk Zone',      icon: <Flame className="w-6 h-6 text-orange-400" />,         bg: 'bg-orange-950/40 border-orange-700/60',  desc: 'Gamble your coins! Win and double them, lose and forfeit half. High risk!' },
  { type: 'WILD',     name: 'Wild Tile',      icon: <Sparkles className="w-6 h-6 text-teal-400" />,        bg: 'bg-teal-950/40 border-teal-700/60',      desc: 'A random positive effect triggers — could be extra coins, XP, or movement.' },
];

// ─── Shop Items for Chapter 6 ─────────────────────────────────────────────────
const SHOP_ITEMS = [
  { id: 'shield',      name: 'Shield Protector',  cost: 20, icon: <Shield className="w-6 h-6 text-sky-400" />,     desc: 'Blocks the next trap or negative tile effect completely.' },
  { id: 'extra_time',  name: 'Extra Time',         cost: 10, icon: <Hourglass className="w-6 h-6 text-cyan-400" />, desc: 'Adds +15 seconds to answer your next trivia question.' },
  { id: 'lucky_dice',  name: 'Lucky Dice',         cost: 20, icon: <Dices className="w-6 h-6 text-amber-400" />,   desc: 'Guarantees your next roll is a 5 or 6. Never waste a turn!' },
  { id: 'multiplier',  name: 'Coin Multiplier',    cost: 15, icon: <Coins className="w-6 h-6 text-yellow-400" />,  desc: 'Doubles all coins earned on your next correct trivia answer.' },
  { id: 'trap_immune', name: 'Trap Immunity',       cost: 18, icon: <Shield className="w-6 h-6 text-indigo-400" />, desc: 'Passively absorbs the next trap tile you land on. Very handy!' },
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

// ─── Chapter 0: Welcome ───────────────────────────────────────────────────────
function ChapterWelcome() {
  return (
    <div className="space-y-8 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-2xl shadow-sky-500/30"
      >
        <span className="text-3xl font-black text-slate-950">QR</span>
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-3xl font-black text-white">Welcome to<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">QuizRealm Tactics</span></h2>
        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
          A multiplayer trivia board game where knowledge moves your pawn.
          Roll dice, answer questions, land on special tiles, and race to the finish line!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
        {[
          { icon: <Dices className="w-5 h-5 text-amber-400" />, title: 'Roll & Move', desc: 'Roll a die, answer trivia to earn movement.' },
          { icon: <Brain className="w-5 h-5 text-emerald-400" />, title: 'Answer Trivia', desc: '10 categories, 3 difficulty levels. More XP for harder questions!' },
          { icon: <Trophy className="w-5 h-5 text-yellow-400" />, title: 'Race to Win', desc: 'First to tile 31 wins the match. Use power-ups wisely!' },
        ].map((item) => (
          <div key={item.title} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-sm font-bold text-slate-200">{item.title}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
        {['1v1 Duel', '2v2 Team Battle', 'Free-for-All (4 players)'].map((mode) => (
          <span key={mode} className="px-4 py-1.5 rounded-full border border-sky-900/60 bg-sky-950/30 text-sky-400">
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
        <h2 className="text-2xl font-black text-white">The <span className="text-indigo-400">Game Board</span></h2>
        <p className="text-slate-400 text-sm">The board has 32 tiles (0–31). Tap each tile type to learn what it does.</p>
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

      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <span className="text-sky-400 font-bold">💡 Tip:</span> The board follows a serpentine path. You start at tile 0 (Start) and race toward tile 31 (Finish). Each turn you roll first, then answer trivia to determine how far you move.
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
        <h2 className="text-2xl font-black text-white">Roll the <span className="text-amber-400">Dice</span></h2>
        <p className="text-slate-400 text-sm">Each turn starts with a dice roll. Choose your preferred trivia category and difficulty, then roll!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category selector */}
        <div className="p-4 rounded-2xl border border-slate-800 glass-panel space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { sounds.playClick(); setCategory(c); }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                  category === c ? 'border-sky-400 bg-sky-950/40 text-sky-400' : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="p-4 rounded-2xl border border-slate-800 glass-panel space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Difficulty</p>
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
          <div className="w-24 h-24 bg-slate-900 border-2 border-sky-400 rounded-3xl grid grid-cols-3 p-4 gap-2 shadow-xl shadow-sky-500/10">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                {(dotsMap[face] || [4]).includes(i) && (
                  <div className="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <button
          onClick={handleRoll}
          disabled={rolling}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black uppercase tracking-wider text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
        >
          <Dices className="w-5 h-5" />
          {rolling ? 'Rolling…' : 'Roll Dice!'}
        </button>

        <AnimatePresence>
          {rolled && !rolling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-4 rounded-2xl border border-amber-900/40 bg-amber-950/20 space-y-1"
            >
              <p className="text-amber-400 font-black text-lg">You rolled a {face}!</p>
              <p className="text-slate-400 text-xs">
                If you answer correctly on {difficulty}, you&apos;ll move {difficulty === 'EASY' ? face : difficulty === 'MEDIUM' ? face + 1 : face + 2} tile{(difficulty === 'EASY' ? face : difficulty === 'MEDIUM' ? face + 1 : face + 2) !== 1 ? 's' : ''} forward.
              </p>
              <p className="text-sky-400 text-xs font-bold mt-1">&#10145; Next: A &quot;{category}&quot; trivia question appears!</p>
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
        <h2 className="text-2xl font-black text-white">Answer <span className="text-emerald-400">Trivia</span></h2>
        <p className="text-slate-400 text-sm">Try these practice questions. Answer correctly to move your pawn in the real game!</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Question {qIdx + 1} of {MOCK_QUESTIONS.length}</span>
        <span className="text-emerald-400">✓ {score} correct</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full"
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
                  ? `✓ Correct! In-game you'd earn coins & move forward.`
                  : `✗ The correct answer was "${q.correct}". You'd stay put this turn.`}
              </motion.div>
            )}
          </AnimatePresence>

          {submitted && (
            <div className="flex gap-3">
              {qIdx < MOCK_QUESTIONS.length - 1 ? (
                <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95">
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex-1 space-y-2">
                  <div className="text-center p-3 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-400 font-black text-sm">
                    🎉 Practice complete! {score}/{MOCK_QUESTIONS.length} correct.
                  </div>
                  <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 font-bold text-xs uppercase tracking-wider transition-all active:scale-95">
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
    TRAP: [{ label: 'Accept Penalty', color: 'bg-rose-600 text-white', action: () => { sounds.playIncorrect(); setResult('💥 Lost 10 coins and moved back 3 tiles!'); setCoins(c => Math.max(0, c - 10)); } }],
    TREASURE: [
      { label: 'Open Chest (10g)', color: 'bg-amber-500 text-slate-950', action: () => {
        if (coins < 10) { setResult('❌ Not enough coins!'); return; }
        sounds.playCoin();
        const r = Math.random();
        setCoins(c => c - 10);
        if (r < 0.4) setResult('🛡 Found a Shield inside!');
        else if (r < 0.8) { setResult('💰 Found 25 coins!'); setCoins(c => c + 25); }
        else setResult('🪤 It was a MIMIC! Moved back 3 tiles.');
      }},
      { label: 'Leave It', color: 'bg-slate-800 text-slate-300', action: () => { sounds.playClick(); setResult('You walked away from the chest.'); } }
    ],
    MYSTERY: [{ label: 'Trigger Event', color: 'bg-purple-600 text-white', action: () => {
      const r = Math.random();
      sounds.playCorrect();
      if (r < 0.33) setResult('🔄 Position swap with another player!');
      else if (r < 0.66) { setResult('⚡ Teleported +4 tiles forward!'); }
      else { setResult('✨ Received 15 mystery coins!'); setCoins(c => c + 15); }
    }}],
    SHORTCUT: [{ label: 'Ride the Wind', color: 'bg-cyan-500 text-slate-950', action: () => { sounds.playCorrect(); setResult('💨 Zipped ahead +2 tiles on the shortcut wind!'); } }],
    BONUS: [{ label: 'Collect Bonus', color: 'bg-yellow-500 text-slate-950', action: () => { sounds.playCoin(); setResult('🎁 Collected 5 free bonus coins!'); setCoins(c => c + 5); } }],
    RISK: [
      { label: '🎲 Gamble Coins!', color: 'bg-orange-500 text-slate-950', action: () => {
        const win = Math.random() > 0.4;
        if (win) { sounds.playVictory(); setResult(`💸 You WON! Doubled your coins!`); setCoins(c => c * 2); }
        else { sounds.playIncorrect(); setResult('😬 You LOST half your coins!'); setCoins(c => Math.floor(c / 2)); }
      }},
      { label: 'Skip', color: 'bg-slate-800 text-slate-300', action: () => { sounds.playClick(); setResult('You played it safe and skipped the gamble.'); } }
    ],
  };

  const tileButtons = TILES.filter(t => interactions[t.type]);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white">Tile <span className="text-rose-400">Effects</span></h2>
        <p className="text-slate-400 text-sm">Tap a tile to simulate landing on it and interacting with its effect.</p>
      </div>

      {/* Coin counter */}
      <div className="flex items-center justify-center gap-2 text-yellow-400 font-black text-lg">
        <Coins className="w-5 h-5" />
        {coins} coins
        <button onClick={() => { setCoins(50); setResult(null); setActiveTile(null); sounds.playClick(); }} className="text-xs text-slate-500 hover:text-slate-300 font-normal ml-2 border border-slate-800 px-2 py-0.5 rounded-lg transition-colors">Reset</button>
      </div>

      {/* Tile picker */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tileButtons.map(tile => (
          <button
            key={tile.type}
            onClick={() => { sounds.playClick(); setActiveTile(tile.type); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
              activeTile === tile.type ? 'border-sky-400 bg-sky-950/40 text-sky-300' : 'border-slate-800 text-slate-400 hover:border-slate-700'
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
                  <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 shrink-0">{t.icon}</div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{t.desc}</p>
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
                  className="p-4 rounded-xl border border-slate-700 bg-slate-900/60 text-sm font-bold text-slate-200 text-center"
                >
                  {result}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeTile && (
        <div className="text-center py-8 text-slate-600 text-sm">
          ☝️ Select a tile above to simulate its effect
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
        <h2 className="text-2xl font-black text-white">The <span className="text-purple-400">Item Shop</span></h2>
        <p className="text-slate-400 text-sm">Spend coins on power-ups during your turn. Strategic purchases win games!</p>
      </div>

      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-yellow-400 flex items-center gap-1.5"><Coins className="w-4 h-4" />{coins} coins</span>
        <button onClick={() => { setCoins(60); setOwned([]); setMsg(null); sounds.playClick(); }} className="text-xs text-slate-500 hover:text-slate-300 border border-slate-800 px-3 py-1 rounded-lg transition-colors">Reset</button>
      </div>

      <div className="space-y-2">
        {SHOP_ITEMS.map((item) => {
          const isOwned = owned.includes(item.id);
          const canAfford = coins >= item.cost;
          return (
            <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isOwned ? 'border-emerald-800/40 bg-emerald-950/10' : 'border-slate-800 bg-slate-900/20'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl shrink-0">{item.icon}</div>
                <div>
                  <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    {item.name}
                    {isOwned && <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded">OWNED</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleBuy(item)}
                disabled={isOwned}
                className={`shrink-0 ml-3 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                  isOwned ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : canAfford ? 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
            className="p-3 rounded-xl border border-slate-700 bg-slate-900/60 text-sm font-bold text-slate-200 text-center"
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <span className="text-purple-400 font-bold">💡 Strategy:</span> Buy a Shield before entering a long trap-heavy section. Use Lucky Dice when you need exactly the right number. Save Coin Multiplier for Hard trivia questions for maximum payout.
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
    { icon: '🎯', text: 'Hard trivia gives more coins AND extra movement (+2). High risk, high reward!' },
    { icon: '🛡', text: "If you're leading, buy a Shield. Traps can erase your lead fast." },
    { icon: '🎲', text: "Lucky Dice is best saved for when you're 5-6 tiles from the finish line." },
    { icon: '💰', text: 'Treasure chests are worth opening early — when you can afford to absorb a bad result.' },
    { icon: '⚡', text: 'In Team mode, your pawn moves together. Coordinate purchases with your partner!' },
    { icon: '🔥', text: 'Coin Multiplier + Hard question = huge coin burst. Stack it wisely.' },
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
          Training Complete!
        </h2>
        <p className="text-slate-400 max-w-md mx-auto">
          You&apos;ve mastered the core mechanics of QuizRealm Tactics. Here are some expert tips before you enter the arena:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
        {tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-start gap-3"
          >
            <span className="text-xl shrink-0">{tip.icon}</span>
            <p className="text-xs text-slate-400 leading-relaxed">{tip.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 font-black uppercase tracking-wider text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
        >
          <Home className="w-5 h-5" /> Go Play Now!
        </Link>
        <Link
          href="/training"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-900 font-bold text-sm transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Replay Tutorial
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
    <main className="min-h-screen bg-slate-950 text-white bg-grid-pattern">
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
            <Home className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-black text-white">Training Mode</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">{chapter + 1} / {CHAPTERS.length}</span>
        </div>
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
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : i < chapter
                    ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-400'
                    : 'bg-slate-900/40 border border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {i < chapter ? <CheckCircle className="w-3 h-3" /> : ch.icon}
                <span className="hidden sm:inline">{ch.title}</span>
              </button>
              {i < CHAPTERS.length - 1 && (
                <div className={`h-px w-4 shrink-0 ${i < chapter ? 'bg-emerald-700' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Chapter Panel */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Chapter label */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${CHAPTERS[chapter].color} bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full`}>
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
              className="p-6 sm:p-8 rounded-3xl border border-slate-800 glass-panel"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-900 font-bold text-sm transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
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
                    i === chapter ? 'w-6 h-2.5 bg-sky-400' : i < chapter ? 'w-2.5 h-2.5 bg-emerald-500' : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-sky-500/20"
            >
              {chapter === CHAPTERS.length - 2 ? 'Finish!' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
