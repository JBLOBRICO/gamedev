'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle2, XCircle, Star, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/sounds';

interface TriviaQuizProps {
  questionText: string;
  category: string;
  difficulty: string;
  options: string[]; // parsed array
  correctAnswer: string;
  funFact?: string | null;
  timeLimit: number;
  rollValue: number;
  onSubmitAnswer: (answer: string) => void;
}

export default function TriviaQuiz({
  questionText,
  category,
  difficulty,
  options,
  correctAnswer,
  funFact,
  timeLimit,
  rollValue,
  onSubmitAnswer,
}: TriviaQuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [submitted, setSubmitted] = useState(false);
  const [isShake, setIsShake] = useState(false);

  const handleSubmit = useCallback((answer: string) => {
    if (submitted) return;
    setSelected(answer);
    setSubmitted(true);

    const isCorrect = answer === correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FBBF24', '#F59E0B', '#D97706'] // Golden confetti
      });
    } else {
      sounds.playIncorrect();
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    }
  }, [submitted, correctAnswer]);

  // Trigger confetti if the player rolled a perfect 6
  useEffect(() => {
    if (rollValue === 6 && !submitted) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#FBBF24', '#F59E0B', '#D97706'] // Golden confetti
        });
      }, 500); // Small delay to let the modal slide in first
    }
  }, [rollValue, submitted]);

  // Countdown timer
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(""); // Auto submit empty on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, handleSubmit]);


  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
      case 'MEDIUM': return 'text-amber-400 bg-amber-950/40 border-amber-900/30';
      case 'HARD': return 'text-rose-400 bg-rose-950/40 border-rose-900/30';
      default: return 'text-slate-400 bg-slate-900';
    }
  };

  const timePercentage = (secondsLeft / timeLimit) * 100;
  const barColor = timePercentage > 50 ? 'bg-amber-400' : timePercentage > 25 ? 'bg-orange-500' : 'bg-rose-500';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={isShake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: isShake ? 0.4 : 0.5, type: 'spring' }}
      className={`w-full max-w-xl mx-auto p-6 border ${isShake ? 'border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.4)]' : 'border-amber-900/30'} glass-panel rounded-3xl space-y-5 relative overflow-hidden transition-colors duration-300`}
    >

      {/* Atmospheric top line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />

      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-stone-800/50 pb-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-950/35 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
            📜 {category}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${getDifficultyColor(difficulty)}`}>
            {difficulty === 'EASY' ? '⭐ Squire' : difficulty === 'MEDIUM' ? '⭐⭐ Knight' : '⭐⭐⭐ Legend'}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/35 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
            🎲 Rolled: {rollValue}
          </span>
        </div>

        {/* Burning Timer */}
        <div className="flex-1 max-w-[120px] sm:max-w-[180px] ml-4 flex flex-col items-end gap-1">
          <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time</span>
            <span className={secondsLeft <= 5 ? 'text-rose-400 animate-pulse' : ''}>{secondsLeft}s</span>
          </div>
          <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
            <motion.div 
              className={`h-full ${barColor} shadow-[0_0_10px_currentColor]`}
              initial={{ width: '100%' }}
              animate={{ width: `${timePercentage}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4 text-center py-3">
        <Brain className="w-10 h-10 text-amber-500/50 mx-auto animate-pulse" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/60 mb-2">
            ⚜ Ancient Trial of the Royal Librarians ⚜
          </p>
          <h2 className="text-lg sm:text-xl font-bold leading-snug text-[#f5f0e8] px-2">
            {questionText}
          </h2>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === correctAnswer;

          let btnClass = "border-stone-700/50 bg-stone-900/30 hover:border-amber-700/40 hover:bg-stone-900/50 text-[#f5f0e8]";
          let icon = null;

          if (submitted) {
            if (isCorrect) {
              btnClass = "border-emerald-500/60 bg-emerald-950/25 text-emerald-300 shadow-md shadow-emerald-900/20";
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            } else if (isSelected) {
              btnClass = "border-rose-500/60 bg-rose-950/25 text-rose-300";
              icon = <XCircle className="w-4 h-4 text-rose-400" />;
            } else {
              btnClass = "border-stone-800/40 bg-stone-950/20 opacity-40";
            }
          } else if (isSelected) {
            btnClass = "border-amber-500/60 bg-amber-950/25 text-amber-300";
          }

          return (
            <button
              key={opt}
              disabled={submitted}
              onClick={() => handleSubmit(opt)}
              className={`w-full px-5 py-3.5 rounded-xl border-2 text-left font-semibold text-sm transition-all duration-200 flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] disabled:hover:scale-100 ${btnClass}`}
            >
              <span>{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Fun Fact */}
      {submitted && funFact && (
        <div className="mt-3 p-4 rounded-xl border border-amber-900/35 bg-amber-950/15 text-amber-200/80 text-xs italic shadow-inner">
          <span className="font-black text-amber-500 mr-1 not-italic">📚 Ancient Lore:</span> {funFact}
        </div>
      )}

      {/* Continue */}
      {submitted && (
        <div className="pt-3">
          <button
            onClick={() => onSubmitAnswer(selected || "")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg shadow-amber-900/25"
          >
            Continue the Quest →
          </button>
        </div>
      )}

      {/* Reward preview */}
      {!submitted && (
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-stone-500 pt-1 border-t border-stone-800/40">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-600/50" />
            +{difficulty === 'EASY' ? '5' : difficulty === 'MEDIUM' ? '10' : '20'} Royal Gold
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-800" />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400/50" />
            +{difficulty === 'EASY' ? '20' : difficulty === 'MEDIUM' ? '40' : '80'} XP
          </span>
        </div>
      )}
    </motion.div>
  );
}
