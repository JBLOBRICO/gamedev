'use client';

import React, { useState } from 'react';
import { Lock, FileText, Award, Trash2, Plus, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { sounds } from '@/lib/sounds';

interface AdminQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: string; // JSON string
  correctAnswer: string;
}

interface MatchLog {
  id: string;
  mode: string;
  winnerUsername: string;
  roundCount: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tabs: 'questions' | 'add_question' | 'logs'
  const [activeTab, setActiveTab] = useState<'questions' | 'add_question' | 'logs'>('questions');

  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [matches, setMatches] = useState<MatchLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCategory, setNewCategory] = useState('General Knowledge');
  const [newDifficulty, setNewDifficulty] = useState('EASY');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin?passcode=${passcode}`);
      if (!res.ok) {
        throw new Error('Invalid Admin Passcode');
      }
      const data = await res.json();
      setQuestions(data.questions);
      setMatches(data.matches);
      setAuthorized(true);
      sounds.playLevelUp();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch(`/api/admin?passcode=${passcode}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setMatches(data.matches);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    if (!newCorrectAnswer || ![newOptionA, newOptionB, newOptionC, newOptionD].includes(newCorrectAnswer)) {
      setError('Correct answer must match one of the options!');
      return;
    }

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode,
          target: 'question',
          action: 'CREATE',
          data: {
            category: newCategory,
            difficulty: newDifficulty,
            question: newQuestionText,
            options: [newOptionA, newOptionB, newOptionC, newOptionD],
            correctAnswer: newCorrectAnswer
          }
        })
      });

      if (!res.ok) throw new Error('Failed to add question');

      setNewQuestionText('');
      setNewOptionA('');
      setNewOptionB('');
      setNewOptionC('');
      setNewOptionD('');
      setNewCorrectAnswer('');
      setError(null);
      await loadData();
      setActiveTab('questions');
      sounds.playCoin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    sounds.playClick();

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode,
          target: 'question',
          action: 'DELETE',
          data: { id }
        })
      });

      if (!res.ok) throw new Error('Failed to delete question');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800 glass-panel space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <Lock className="w-8 h-8 text-sky-400" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">Admin Workspace</h1>
            <p className="text-xs text-slate-500 mt-1">Please enter passcode to access dashboard. Default: admin123</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-xs text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded-lg">{error}</p>}
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-center font-bold tracking-widest"
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black uppercase text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-slate-950 space-y-6">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-sky-400" />
              Admin Control Panel
            </h1>
            <p className="text-xs text-slate-500">Configure questions, match logs, and statistics</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'questions' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('add_question')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'add_question' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            Add Question
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            Match Logs ({matches.length})
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* QUESTIONS LIST */}
        {activeTab === 'questions' && (
          <div className="p-6 rounded-2xl border border-slate-800 glass-panel space-y-4">
            <h2 className="text-base font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              Question Pool ({questions.length} Total)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Difficulty</th>
                    <th className="py-3 px-2">Question</th>
                    <th className="py-3 px-2">Correct Answer</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-900/20 text-slate-300">
                      <td className="py-3 px-2 font-bold text-sky-400">{q.category}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${q.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-950/20' : q.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-950/20' : 'text-rose-400 bg-rose-950/20'}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-2 max-w-sm truncate">{q.question}</td>
                      <td className="py-3 px-2 text-emerald-400">{q.correctAnswer}</td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD QUESTION FORM */}
        {activeTab === 'add_question' && (
          <div className="max-w-xl mx-auto p-6 rounded-2xl border border-slate-800 glass-panel space-y-6">
            <h2 className="text-base font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" />
              Create Custom Question
            </h2>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              {error && <p className="text-xs text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded-lg">{error}</p>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input bg-slate-900"
                  >
                    <option value="General Knowledge">General Knowledge</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Technology">Technology</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Movies">Movies</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Pop Culture">Pop Culture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input bg-slate-900"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Question Text</label>
                <input
                  type="text"
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  placeholder="Enter trivia question..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Option A</label>
                  <input
                    type="text"
                    required
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Option B</label>
                  <input
                    type="text"
                    required
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Option C</label>
                  <input
                    type="text"
                    required
                    value={newOptionC}
                    onChange={(e) => setNewOptionC(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Option D</label>
                  <input
                    type="text"
                    required
                    value={newOptionD}
                    onChange={(e) => setNewOptionD(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Exact Correct Answer</label>
                <input
                  type="text"
                  required
                  value={newCorrectAnswer}
                  onChange={(e) => setNewCorrectAnswer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input border-emerald-500/30 text-emerald-400"
                  placeholder="Must match one of the options exactly"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black uppercase text-xs transition-all active:scale-95"
              >
                Publish Question
              </button>
            </form>
          </div>
        )}

        {/* MATCH HISTORY LOGS */}
        {activeTab === 'logs' && (
          <div className="p-6 rounded-2xl border border-slate-800 glass-panel space-y-4">
            <h2 className="text-base font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-400" />
              Recent Matches Log
            </h2>

            <div className="overflow-x-auto">
              {matches.length === 0 ? (
                <p className="text-xs text-slate-600 italic py-4">No matches completed yet.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="py-3 px-2">Match ID</th>
                      <th className="py-3 px-2">Mode</th>
                      <th className="py-3 px-2">Winner</th>
                      <th className="py-3 px-2">Rounds</th>
                      <th className="py-3 px-2">Completed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {matches.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-900/10">
                        <td className="py-3 px-2 font-mono text-[10px] text-slate-500">{m.id}</td>
                        <td className="py-3 px-2 font-bold text-sky-400">{m.mode}</td>
                        <td className="py-3 px-2 font-bold text-emerald-400">{m.winnerUsername}</td>
                        <td className="py-3 px-2">{m.roundCount} Rounds</td>
                        <td className="py-3 px-2 text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
