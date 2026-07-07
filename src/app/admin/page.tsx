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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] bg-grid-pattern">
        <div className="w-full max-w-md p-8 rounded-2xl border border-amber-900/35 glass-panel space-y-6 text-center medieval-frame">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-900/20 flex items-center justify-center border border-amber-700/30">
            <Lock className="w-8 h-8 text-amber-500/70" />
          </div>

          <div>
            <p className="text-[9px] font-black text-amber-700/50 uppercase tracking-[0.25em] mb-1">⚜ Royal Sanctum ⚜</p>
            <h1 className="text-2xl font-black text-[#f5f0e8]">Royal Scribe's Chamber</h1>
            <p className="text-xs text-stone-500 mt-1 italic">Enter the passcode to access the kingdom's records. Default: admin123</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-xs text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">{error}</p>}
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Verifying Seal…' : 'Enter the Chamber'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0f] text-[#f5f0e8] space-y-6 bg-grid-pattern">

      {/* Ambient top border */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-700/35 to-transparent z-50 pointer-events-none" />

      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center pb-5 border-b border-amber-900/25 gap-4 pt-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 bg-stone-900/60 border border-stone-800/50 rounded-xl text-stone-400 hover:text-amber-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[9px] font-black text-amber-700/50 uppercase tracking-[0.2em]">⚜ Royal Sanctum</p>
            <h1 className="text-xl font-black text-[#f5f0e8] flex items-center gap-2 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-amber-500/70" />
              Royal Scribe's Chamber
            </h1>
            <p className="text-xs text-stone-500 italic">Manage the kingdom's trial scrolls and chronicles</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'questions', label: `📜 Trial Scrolls (${questions.length})` },
            { id: 'add_question', label: '✍️ Inscribe Trial' },
            { id: 'logs', label: `📖 Chronicles (${matches.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-stone-950'
                  : 'bg-stone-900/50 border border-stone-800/50 text-stone-400 hover:text-[#f5f0e8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* TRIAL SCROLLS (Questions List) */}
        {activeTab === 'questions' && (
          <div className="p-6 rounded-2xl border border-stone-800/50 glass-panel space-y-4">
            <h2 className="text-sm font-black text-[#f5f0e8] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500/60" />
              Trial Scroll Pool — {questions.length} Ancient Trials Recorded
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-800/60 text-stone-500 font-black uppercase tracking-wider">
                    <th className="py-3 px-2">Realm</th>
                    <th className="py-3 px-2">Rank</th>
                    <th className="py-3 px-2">The Trial</th>
                    <th className="py-3 px-2">Correct Answer</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/40">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-stone-900/20 text-stone-300">
                      <td className="py-3 px-2 font-bold text-amber-500/80">{q.category}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                          q.difficulty === 'EASY'   ? 'text-emerald-400 bg-emerald-950/25' :
                          q.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-950/25' :
                                                      'text-rose-400 bg-rose-950/25'
                        }`}>
                          {q.difficulty === 'EASY' ? '⭐ Squire' : q.difficulty === 'MEDIUM' ? '⭐⭐ Knight' : '⭐⭐⭐ Legend'}
                        </span>
                      </td>
                      <td className="py-3 px-2 max-w-sm truncate text-stone-300">{q.question}</td>
                      <td className="py-3 px-2 text-emerald-400 font-semibold">{q.correctAnswer}</td>
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
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-600 italic text-xs">
                        The Royal Library holds no trial scrolls yet. Inscribe the first one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INSCRIBE TRIAL (Add Question) */}
        {activeTab === 'add_question' && (
          <div className="max-w-xl mx-auto p-6 rounded-2xl border border-stone-800/50 glass-panel space-y-6">
            <div>
              <p className="text-[9px] font-black text-amber-700/50 uppercase tracking-[0.2em] mb-0.5">Royal Librarian's Quill</p>
              <h2 className="text-sm font-black text-[#f5f0e8] uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500/70" />
                Inscribe a New Ancient Trial
              </h2>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              {error && <p className="text-xs text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">{error}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-stone-500 font-black uppercase tracking-wider mb-1.5">Realm (Category)</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input bg-stone-950/60 text-xs">
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
                    <option value="Philippines">Philippines</option>
                    <option value="Food & Drinks">Food & Drinks</option>
                    <option value="TV Shows & Anime">TV Shows & Anime</option>
                    <option value="Animals">Animals</option>
                    <option value="Logic">Logic</option>
                    <option value="World Wonders">World Wonders</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-stone-500 font-black uppercase tracking-wider mb-1.5">Trial Rank</label>
                  <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input bg-stone-950/60 text-xs">
                    <option value="EASY">⭐ Squire (Easy)</option>
                    <option value="MEDIUM">⭐⭐ Knight (Medium)</option>
                    <option value="HARD">⭐⭐⭐ Legend (Hard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 font-black uppercase tracking-wider mb-1.5">The Trial Question</label>
                <input type="text" required value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm" placeholder="Enter the ancient trial text…" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Answer A', val: newOptionA, set: setNewOptionA },
                  { label: 'Answer B', val: newOptionB, set: setNewOptionB },
                  { label: 'Answer C', val: newOptionC, set: setNewOptionC },
                  { label: 'Answer D', val: newOptionD, set: setNewOptionD },
                ].map(opt => (
                  <div key={opt.label}>
                    <label className="block text-[9px] text-stone-500 font-black uppercase tracking-wider mb-1.5">{opt.label}</label>
                    <input type="text" required value={opt.val} onChange={(e) => opt.set(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs" />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[9px] text-stone-500 font-black uppercase tracking-wider mb-1.5">✓ Correct Answer (must match exactly)</label>
                <input type="text" required value={newCorrectAnswer} onChange={(e) => setNewCorrectAnswer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input border-emerald-600/30 text-emerald-400 text-sm" placeholder="Must match one of the answers exactly" />
              </div>

              <button type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase text-xs transition-all active:scale-95 shadow-lg shadow-amber-900/25"
              >
                ✍️ Seal the Trial Scroll
              </button>
            </form>
          </div>
        )}

        {/* CHRONICLES (Match History) */}
        {activeTab === 'logs' && (
          <div className="p-6 rounded-2xl border border-stone-800/50 glass-panel space-y-4">
            <h2 className="text-sm font-black text-[#f5f0e8] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500/60" />
              Chronicles of Historia — Recent Quests
            </h2>

            <div className="overflow-x-auto">
              {matches.length === 0 ? (
                <p className="text-xs text-stone-600 italic py-6 text-center">
                  📜 The Chronicles are empty. No quests have been completed yet.
                </p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-800/60 text-stone-500 font-black uppercase tracking-wider">
                      <th className="py-3 px-2">Quest ID</th>
                      <th className="py-3 px-2">Battle Mode</th>
                      <th className="py-3 px-2">Crowned Champion</th>
                      <th className="py-3 px-2">Trials Faced</th>
                      <th className="py-3 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/40 text-stone-300">
                    {matches.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-900/15">
                        <td className="py-3 px-2 font-mono text-[9px] text-stone-600">{m.id.slice(0, 8)}…</td>
                        <td className="py-3 px-2 font-bold text-amber-500/80">
                          {m.mode === 'DUEL' ? '⚔️ Royal Duel' : m.mode === 'TEAM' ? '🛡️ Band of Heroes' : '👑 Grand Melee'}
                        </td>
                        <td className="py-3 px-2 font-black text-amber-300">👑 {m.winnerUsername}</td>
                        <td className="py-3 px-2 text-stone-400">{m.roundCount} Rounds</td>
                        <td className="py-3 px-2 text-stone-500">{new Date(m.createdAt).toLocaleString()}</td>
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
