'use client';

import React, { useState } from 'react';
import { X, Check, Save } from 'lucide-react';
import { AVATARS } from '@/lib/avatars';
import { getHeroByAvatarId } from '@/lib/heroes';
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
  "Apprentice Hero",
  "Trivia Squire",
  "Adept Scholar",
  "Knowledge Sage",
  "Grand Lorekeeper",
  "Royal Tactician",
  "Lucky Adventurer",
  "Gold Seeker",
  "Crowned Champion",
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
        <div className="flex items-center justify-between p-6 border-b border-amber-900/30">
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
              ⚜ Hero Customisation
            </h2>
            <p className="text-[10px] text-stone-500 italic mt-0.5">Shape your legend in the Kingdom of Historia</p>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-lg text-stone-400 hover:text-[#f5f0e8] hover:bg-stone-800/50 transition-colors"
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
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Hero Name
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
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Hero Title
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
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Heraldic Name Colour
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
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Choose Hero Avatar ({AVATARS.length} Heroes Available)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-72 overflow-y-auto p-3 border border-amber-900/40 rounded-xl stone-panel scroll-texture">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                const hero = getHeroByAvatarId(av.id);
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => { sounds.playClick(); setSelectedAvatar(av.id); }}
                    className={`relative p-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 overflow-hidden flex flex-col items-center gap-2 group ${
                      isSelected 
                        ? `border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)] ${hero?.borderClass || ''}` 
                        : 'border-stone-800 bg-stone-900/60 hover:border-amber-700/50 hover:shadow-lg'
                    }`}
                  >
                    {/* Magical glow behind avatar */}
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent pointer-events-none" />}
                    
                    <div className="w-full aspect-square rounded-lg overflow-hidden border border-stone-800 relative shadow-inner shadow-stone-950/80">
                      {av.render("w-full h-full object-cover transition-transform duration-500 group-hover:scale-110")}
                      {hero && (
                        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-stone-950/80 border border-stone-700 flex items-center justify-center text-[10px] shadow-sm">
                          {hero.crest}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full text-center relative z-10">
                      <span className="block text-[10px] font-black text-stone-300 truncate group-hover:text-amber-400 transition-colors">{av.name}</span>
                      {hero && <span className={`block text-[8px] uppercase tracking-wider font-bold ${hero.colorAccent} truncate`}>{hero.class}</span>}
                    </div>

                    {isSelected && (
                      <span className="absolute top-1 right-1 p-0.5 bg-amber-500 rounded text-stone-950 shadow-md">
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
