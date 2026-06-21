'use client';

import React, { useState } from 'react';
import { X, Check, Save } from 'lucide-react';
import { AVATARS } from '@/lib/avatars';
import { UserProfile } from '@/hooks/useProfile';
import { sounds } from '@/lib/sounds';

interface ProfileEditModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (username: string, avatarId: string, nameColor: string, title: string) => Promise<any>;
}

const PRESET_COLORS = [
  '#38bdf8', // sky-400
  '#22c55e', // green-500
  '#a855f7', // purple-500
  '#f43f5e', // rose-500
  '#eab308', // yellow-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#ec4899', // pink-500
  '#f472b6', // pink-400
];

const PRESET_TITLES = [
  "Novice",
  "Trivia Rookie",
  "Adept Scholar",
  "Knowledge Sage",
  "Lobbyist",
  "Lucky Roller",
  "Coin Collector",
  "Risk Specialist",
  "Grand Legend"
];

export default function ProfileEditModal({ profile, onClose, onSave }: ProfileEditModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);
  const [selectedColor, setSelectedColor] = useState(profile.nameColor);
  const [selectedTitle, setSelectedTitle] = useState(profile.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    sounds.playClick();
    
    try {
      await onSave(username, selectedAvatar, selectedColor, selectedTitle);
      sounds.playLevelUp();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 glass-panel animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            Customize Profile
          </h2>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-400 border border-red-950/50 bg-red-950/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Username & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Display Username
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white"
                placeholder="Enter username..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Active Title
              </label>
              <select
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input bg-slate-900 text-white"
              >
                {PRESET_TITLES.map((t) => (
                  <option key={t} value={t} className="bg-slate-950 text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username Tag Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { sounds.playClick(); setSelectedColor(c); }}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: c,
                    borderColor: selectedColor === c ? '#fff' : 'transparent',
                    boxShadow: selectedColor === c ? `0 0 12px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Avatar chooser */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Choose Avatar ({AVATARS.length} Available)
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 max-h-56 overflow-y-auto p-2 border border-slate-800/80 rounded-xl bg-slate-950/40">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => { sounds.playClick(); setSelectedAvatar(av.id); }}
                    className={`relative p-1.5 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isSelected 
                        ? 'border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/20' 
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    {av.render("w-full h-full")}
                    {isSelected && (
                      <span className="absolute bottom-0 right-0 p-0.5 bg-sky-500 rounded-tl-lg rounded-br-md text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => { sounds.playClick(); onClose(); }}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
              <Save className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
