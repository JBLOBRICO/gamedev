'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Hourglass, CheckCircle2, XCircle, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '@/lib/sounds';

interface TriviaQuizProps {
  questionText: string;
  category: string;
  difficulty: string;
  options: string[]; // parsed array
  correctAnswer: string;
  timeLimit: number;
  onSubmitAnswer: (answer: string) => void;
}

export default function TriviaQuiz({
  questionText,
  category,
  difficulty,
  options,
  correctAnswer,
  timeLimit,
  onSubmitAnswer,
}: TriviaQuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const [submitted, setSubmitted] = useState(false);

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
        origin: { y: 0.7 }
      });
    } else {
      sounds.playIncorrect();
    }

    setTimeout(() => {
      onSubmitAnswer(answer);
    }, 2000);
  }, [submitted, correctAnswer, onSubmitAnswer]);

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

  return (
    <div className="w-full max-w-xl mx-auto p-6 border border-slate-800 glass-panel rounded-3xl space-y-6 relative overflow-hidden">
      
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 bg-sky-950/40 border border-sky-900/40 px-2.5 py-0.5 rounded-full">
            Category: {category}
          </span>
          <span className={`ml-2 text-[10px] font-extrabold uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          <Hourglass className={`w-4 h-4 ${secondsLeft <= 5 ? 'text-rose-500 animate-spin' : 'text-slate-400'}`} />
          <span className={`text-xs font-black tracking-wider ${secondsLeft <= 5 ? 'text-rose-400' : 'text-white'}`}>
            {secondsLeft}s
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="space-y-4 text-center py-4">
        <Brain className="w-10 h-10 text-indigo-400 mx-auto opacity-70 animate-pulse" />
        <h2 className="text-lg sm:text-xl font-bold leading-snug text-slate-100 px-2">
          {questionText}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === correctAnswer;
          
          let btnClass = "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60";
          let icon = null;

          if (submitted) {
            if (isCorrect) {
              btnClass = "border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-md shadow-emerald-500/10";
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            } else if (isSelected) {
              btnClass = "border-rose-500 bg-rose-950/20 text-rose-300 shadow-md shadow-rose-500/10";
              icon = <XCircle className="w-4 h-4 text-rose-400" />;
            } else {
              btnClass = "border-slate-900 bg-slate-950/20 opacity-50";
            }
          } else if (isSelected) {
            btnClass = "border-sky-400 bg-sky-950/30 text-white";
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

      {/* Quiz footer rewards preview */}
      <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-800/60">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          +{difficulty === 'EASY' ? '5' : difficulty === 'MEDIUM' ? '10' : '20'} Coins
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          +{difficulty === 'EASY' ? '20' : difficulty === 'MEDIUM' ? '40' : '80'} XP
        </span>
      </div>

    </div>
  );
}
