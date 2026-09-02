'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import ProfileEditModal from '@/components/ProfileEditModal';
import ProfileStats from '@/components/ProfileStats';
import SoundSettings from '@/components/SoundSettings';
import HeroJournal from '@/components/HeroJournal';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Settings, Plus, Users, ArrowRight, ArrowLeft, ShieldAlert, Sparkles,
  BookOpen, Crown, Castle, Volume2, VolumeX, Monitor, Info,
  Gamepad2, Music, RotateCcw, Check, ChevronRight
} from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { getRandomFlavorMessage } from '@/lib/heroes';
import { getAvatarById } from '@/lib/avatars';

// ── Screen type ───────────────────────────────────────────────────────────────
type Screen = 'main' | 'play' | 'gameplay' | 'settings' | 'about';

// ── Settings persistence ──────────────────────────────────────────────────────
function loadSettings() {
  if (typeof window === 'undefined') return { sfx: true, music: true, volume: 80, animations: true };
  try {
    const s = localStorage.getItem('historia_settings');
    return s ? JSON.parse(s) : { sfx: true, music: true, volume: 80, animations: true };
  } catch { return { sfx: true, music: true, volume: 80, animations: true }; }
}
function saveSettings(s: object) {
  if (typeof window !== 'undefined') localStorage.setItem('historia_settings', JSON.stringify(s));
}

// ── Slide transition variants ─────────────────────────────────────────────────
const slideIn = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -60 },
  transition: { type: 'spring' as const, damping: 22, stiffness: 260 },
};
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

export default function Home() {
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile();

  // ── Navigation state ──────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('main');

  // ── Play screen state (existing logic) ───────────────────────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<'DUEL' | 'TEAM' | 'FFA'>('DUEL');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);

  // ── Main screen extras ────────────────────────────────────────────────────
  const [flavorMsg, setFlavorMsg] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; dur: number }>>([]);

  // ── Settings state ────────────────────────────────────────────────────────
  const [settings, setSettings] = useState(() => loadSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setFlavorMsg(getRandomFlavorMessage());
    const iv = setInterval(() => setFlavorMsg(getRandomFlavorMessage()), 8000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setParticles(Array.from({ length: 14 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      delay: Math.random() * 4, dur: 3 + Math.random() * 4,
    })));
  }, []);

  const nav = (s: Screen) => { sounds.playClick(); setScreen(s); };
  const back = () => { sounds.playClick(); setScreen(prev => prev === 'play' ? 'main' : 'main'); };

  // ── Settings helpers ──────────────────────────────────────────────────────
  const updateSetting = (key: string, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
    sounds.enabled = next.sfx;
    if (key === 'sfx' && value) sounds.playClick();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1500);
  };
  const resetSettings = () => {
    const def = { sfx: true, music: true, volume: 80, animations: true };
    setSettings(def);
    saveSettings(def);
    sounds.enabled = true;
    sounds.playClick();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1500);
  };

  // ── Existing room actions ─────────────────────────────────────────────────
  const handleCreateRoom = async () => {
    if (!profile) return;
    sounds.playClick();
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', userId: profile.id, mode: selectedMode }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create room'); }
      const room = await res.json();
      sounds.playLevelUp();
      router.push(`/game/${room.code}`);
    } catch (err: any) { setActionError(err.message); setActionLoading(false); }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !roomCodeInput) return;
    sounds.playClick();
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'JOIN', userId: profile.id, code: roomCodeInput.trim().toUpperCase() }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to join room'); }
      const room = await res.json();
      sounds.playLevelUp();
      router.push(`/game/${room.code}`);
    } catch (err: any) { setActionError(err.message); setActionLoading(false); }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="w-24 h-24 rounded-full bg-stone-950 border border-amber-800/40 flex items-center justify-center">
              <Crown className="w-12 h-12 text-amber-400 crown-float" />
            </div>
          </div>
          <p className="text-sm text-amber-700 font-bold uppercase tracking-widest">Entering the Kingdom…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-[var(--foreground)] relative overflow-hidden">

      {/* ── Global ambient BG ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-black/60" />
        <div className="absolute bottom-0 left-0 w-[200%] h-64 bg-white/3 blur-3xl fog-drift" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-10 left-0 w-[200%] h-48 bg-amber-500/5 blur-3xl fog-drift" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        {particles.map(p => (
          <div key={p.id} className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-400/40 sparkle-float"
            style={{ left: `${p.x}%`, animation: `particleRise ${p.dur}s ${p.delay}s infinite ease-in-out` }} />
        ))}
        <div className="absolute top-0 left-8 w-4 h-10 bg-amber-500/15 rounded-full blur-md torch-flicker" />
        <div className="absolute top-0 right-8 w-4 h-10 bg-amber-500/15 rounded-full blur-md torch-flicker" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* ── Flavor ticker (persistent) ────────────────────────────────────── */}
      {flavorMsg && screen === 'main' && (
        <div className="fixed top-0 left-0 right-0 z-50 text-center py-1.5 bg-amber-950/30 border-b border-amber-900/20 backdrop-blur-sm">
          <p className="flavor-text text-amber-600/60 text-[10px] tracking-widest italic">✦ {flavorMsg} ✦</p>
        </div>
      )}

      {/* ── Screen Router ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ════════════════════════════════════════════════════════════════
            MAIN DASHBOARD
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'main' && (
          <motion.div key="main" {...fadeUp} className="relative z-10 min-h-screen flex flex-col">

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 sm:px-8 pt-8 pb-4">
              <div />
              <div className="flex items-center gap-2">
                <ThemeToggle className="border-amber-900/40 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300" />
                {profile && (
                  <button onClick={() => { sounds.playClick(); setShowEdit(true); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-900/40 bg-amber-950/20 hover:bg-amber-950/40 text-xs font-bold transition-all text-amber-300 active:scale-95">
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hero Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hero banner */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center space-y-8">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                className="space-y-3"
              >
                <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
                  <div className="absolute inset-0 rounded-full bg-amber-500/15 animate-pulse blur-xl" />
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-900/50 to-stone-950 border-2 border-amber-600/50 flex items-center justify-center shadow-2xl shadow-amber-900/40">
                    <Crown className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 crown-float" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
                    <span className="text-[var(--foreground)]">HISTORIA</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                      LEGENDS
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-xs text-amber-700/60 font-bold uppercase tracking-[0.3em] mt-2">
                    ⚜ Crown of Wisdom · Kingdom Quest ⚜
                  </p>
                </div>
              </motion.div>

              {/* Player greeting */}
              {profile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-stone-800/50 bg-stone-900/30 backdrop-blur-sm"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-700/40">
                    {getAvatarById(profile.avatarId).render('w-full h-full object-cover')}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black" style={{ color: profile.nameColor }}>
                      {profile.username}
                    </p>
                    <p className="text-[9px] text-stone-500 font-bold">Level {profile.level} · {profile.gamesWon} victories</p>
                  </div>
                </motion.div>
              )}

              {/* Main menu buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-3 w-full max-w-xs"
              >
                {/* PLAY — primary CTA */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => nav('play')}
                  className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-lg uppercase tracking-widest shadow-2xl shadow-amber-500/30 transition-shadow"
                >
                  <Crown className="w-6 h-6" />
                  PLAY
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                {/* Secondary buttons */}
                {[
                  { label: 'GAMEPLAY',  icon: <Gamepad2 className="w-5 h-5" />, s: 'gameplay' as Screen },
                  { label: 'SETTINGS',  icon: <Settings className="w-5 h-5" />, s: 'settings' as Screen },
                  { label: 'ABOUT',     icon: <Info className="w-5 h-5" />,     s: 'about' as Screen },
                ].map(({ label, icon, s }) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => nav(s)}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl border border-stone-700/60 bg-stone-900/50 hover:bg-stone-800/60 hover:border-amber-700/40 text-[var(--foreground)] font-black text-sm uppercase tracking-widest transition-all backdrop-blur-sm"
                  >
                    {icon}
                    {label}
                  </motion.button>
                ))}
              </motion.div>

              {/* Lore tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {['⚔️ Royal Duels', '🏰 Castle Arena', '📜 Ancient Trials', '👑 Relics', '🌿 Enchanted Realm'].map(t => (
                  <span key={t} className="text-[9px] font-bold uppercase tracking-wider text-amber-600/60 bg-amber-950/20 border border-amber-900/25 px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Bottom bar */}
            <div className="relative z-10 border-t border-amber-900/20 bg-stone-950/50 backdrop-blur-sm py-3 px-6 flex items-center justify-between text-[9px] text-stone-600">
              <span>© 2026 Historia Legends</span>
              <span className="hidden sm:flex items-center gap-3">
                <span>⚔️ Duels</span><span>🛡️ Teams</span><span>👑 Melee</span>
              </span>
              <span>v1.0.0</span>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PLAY SCREEN — existing create/join logic
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'play' && (
          <motion.div key="play" {...slideIn} className="relative z-10 min-h-screen flex flex-col">
            <ScreenHeader title="The Great Hall" subtitle="Choose your battle and enter the realm" onBack={back} />

            <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* Left: Create + Join */}
              <div className="lg:col-span-1 space-y-4">

                {/* Create Room */}
                <div className="p-5 rounded-2xl glass-panel border border-amber-900/30 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-amber-900/25">
                    <Castle className="w-5 h-5 text-amber-500" />
                    <h2 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider">Summon the Great Hall</h2>
                  </div>
                  <div>
                    <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-2">Choose Battle Mode</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { mode: 'DUEL', label: 'Royal Duel', sub: '1v1', icon: '⚔️' },
                        { mode: 'TEAM', label: 'Band of Heroes', sub: '2v2', icon: '🛡️' },
                        { mode: 'FFA', label: 'Grand Melee', sub: '4P', icon: '👑' },
                      ] as const).map(({ mode, label, sub, icon }) => (
                        <button key={mode} type="button"
                          onClick={() => { sounds.playClick(); setSelectedMode(mode); }}
                          className={`py-2.5 px-2 rounded-xl text-[10px] font-bold transition-all border flex flex-col items-center gap-1 ${
                            selectedMode === mode
                              ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
                              : 'border-stone-800/50 bg-stone-900/20 text-stone-400 hover:border-stone-700'
                          }`}>
                          <span className="text-base">{icon}</span>
                          <span className="uppercase tracking-wider leading-none">{sub}</span>
                          <span className="text-[8px] opacity-70 leading-none">{label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-stone-500 mt-2 leading-snug">
                      {selectedMode === 'DUEL' && '⚔️ Two heroes face off in a test of wisdom.'}
                      {selectedMode === 'TEAM' && '🛡️ Four heroes form two bands sharing a banner.'}
                      {selectedMode === 'FFA' && '👑 Up to four heroes battle for the crown.'}
                    </p>
                  </div>
                  {actionError && (
                    <p className="text-[11px] text-red-400 font-bold bg-red-950/20 p-2.5 rounded-xl border border-red-900/30">{actionError}</p>
                  )}
                  <motion.button whileTap={{ scale: 0.97 }} disabled={actionLoading} onClick={handleCreateRoom}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black uppercase text-xs tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-amber-900/30">
                    <Castle className="w-4 h-4" /> Open the Great Hall <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Join Room */}
                <div className="p-5 rounded-2xl glass-panel border border-stone-800/40 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-800/40">
                    <Users className="w-5 h-5 text-sky-400" />
                    <h2 className="text-sm font-black text-[var(--foreground)] uppercase tracking-wider">Answer the King's Call</h2>
                  </div>
                  <form onSubmit={handleJoinRoom} className="space-y-3">
                    <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">Hall Seal (Room Code)</p>
                    <input type="text" required maxLength={6} value={roomCodeInput}
                      onChange={e => setRoomCodeInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-center font-black tracking-[0.35em] uppercase text-amber-300 text-base"
                      placeholder="· · · · · ·" />
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={actionLoading || !roomCodeInput}
                      className="w-full py-3 rounded-xl border border-stone-700/50 bg-stone-900/40 hover:bg-stone-800/50 text-[#f5f0e8] font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50">
                      Enter the Great Hall
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* Right: Profile Stats */}
              <div className="lg:col-span-2">
                {profile && <ProfileStats profile={profile} />}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            GAMEPLAY / HOW TO PLAY
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'gameplay' && (
          <motion.div key="gameplay" {...slideIn} className="relative z-10 min-h-screen flex flex-col">
            <ScreenHeader title="How to Play" subtitle="Master the ancient trials of Historia" onBack={back} />

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-4 overflow-y-auto">
              {GAMEPLAY_SECTIONS.map((sec, i) => (
                <motion.div key={sec.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-2xl glass-panel border border-stone-800/40 space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{sec.icon}</span>
                    <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">{sec.title}</h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed">{sec.body}</p>
                  {sec.bullets && (
                    <ul className="space-y-1 pt-1">
                      {sec.bullets.map(b => (
                        <li key={b} className="flex items-start gap-2 text-[10px] sm:text-[11px] text-stone-500">
                          <span className="text-amber-600/60 mt-0.5 shrink-0">⚜</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SETTINGS
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'settings' && (
          <motion.div key="settings" {...slideIn} className="relative z-10 min-h-screen flex flex-col">
            <ScreenHeader title="Settings" subtitle="Adjust your kingdom experience" onBack={back} />

            <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">

              {/* SFX */}
              <SettingRow
                icon={<Volume2 className="w-5 h-5 text-amber-400" />}
                label="Sound Effects"
                desc="UI clicks, dice rolls, tile sounds"
              >
                <Toggle value={settings.sfx} onChange={v => updateSetting('sfx', v)} />
              </SettingRow>

              {/* Music */}
              <SettingRow
                icon={<Music className="w-5 h-5 text-sky-400" />}
                label="Music"
                desc="Background atmosphere (not yet available)"
              >
                <Toggle value={settings.music} onChange={v => updateSetting('music', v)} disabled />
              </SettingRow>

              {/* Volume */}
              <SettingRow
                icon={<Volume2 className="w-5 h-5 text-emerald-400" />}
                label="Volume"
                desc={`${settings.volume}%`}
              >
                <input type="range" min={0} max={100} value={settings.volume}
                  onChange={e => updateSetting('volume', Number(e.target.value))}
                  className="w-28 accent-amber-500 cursor-pointer" />
              </SettingRow>

              {/* Animations */}
              <SettingRow
                icon={<Monitor className="w-5 h-5 text-purple-400" />}
                label="Animations"
                desc="Board transitions and pawn movements"
              >
                <Toggle value={settings.animations} onChange={v => updateSetting('animations', v)} />
              </SettingRow>

              {/* Save indicator */}
              <AnimatePresence>
                {settingsSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-400 text-xs font-black px-4 py-2 bg-emerald-950/20 border border-emerald-800/30 rounded-xl"
                  >
                    <Check className="w-4 h-4" /> Settings saved!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset */}
              <motion.button whileTap={{ scale: 0.97 }} onClick={resetSettings}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-800/40 bg-rose-950/15 text-rose-400 hover:bg-rose-950/30 font-bold uppercase text-xs tracking-wider transition-all">
                <RotateCcw className="w-4 h-4" /> Reset to Defaults
              </motion.button>

              {/* Hero Profile shortcut */}
              {profile && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { sounds.playClick(); setShowEdit(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-amber-800/40 bg-amber-950/15 text-amber-400 hover:bg-amber-950/30 font-bold uppercase text-xs tracking-wider transition-all">
                  <Settings className="w-4 h-4" /> Edit Hero Profile & Avatar
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            ABOUT
        ════════════════════════════════════════════════════════════════ */}
        {screen === 'about' && (
          <motion.div key="about" {...slideIn} className="relative z-10 min-h-screen flex flex-col">
            <ScreenHeader title="About" subtitle="The story of the realm" onBack={back} />

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">

              {/* Game logo card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl glass-panel border border-amber-800/30 text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-900/50 to-stone-950 border-2 border-amber-600/40 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-amber-400 crown-float" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                    Historia Legends
                  </h2>
                  <p className="text-[10px] text-amber-700/60 font-bold uppercase tracking-widest mt-1">
                    Crown of Wisdom · Kingdom Quest
                  </p>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed max-w-md mx-auto">
                  A real-time multiplayer trivia board game set in the medieval fantasy Kingdom of Historia.
                  Heroes compete across an isometric 3D board, answering ancient trivia trials to advance,
                  collect Royal Gold, and claim the legendary Crown of Wisdom.
                </p>
              </motion.div>

              {/* Info cards */}
              {[
                { icon: '🎯', title: 'Purpose', body: 'Historia Legends is an educational-entertainment trivia game designed to make learning fun through competitive multiplayer gameplay, fantasy storytelling, and strategic board mechanics.' },
                { icon: '⚙️', title: 'Technology', body: 'Built with Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Prisma ORM · PostgreSQL · Lucide Icons · canvas-confetti' },
                { icon: '👥', title: 'Credits', body: 'Designed & developed as a full-stack multiplayer game. Game design, UI/UX, backend logic, trivia system, and all visual elements crafted from scratch.' },
                { icon: '🎮', title: 'Game Modes', body: 'Royal Duel (1v1) · Band of Heroes (2v2 Teams) · Grand Melee (Free-for-All, up to 4 players). All modes share the same 46-tile isometric board and trivia trial system.' },
              ].map((item, i) => (
                <motion.div key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-4 rounded-xl glass-panel border border-stone-800/40 flex gap-3"
                >
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider mb-1">{item.title}</h3>
                    <p className="text-[11px] text-stone-400 leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}

              {/* Version */}
              <div className="text-center pt-2 pb-4 space-y-1">
                <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">Version 1.0.0</p>
                <p className="text-[9px] text-stone-700">© 2026 Historia Legends · All rights reserved</p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Global modals ─────────────────────────────────────────────────── */}
      {showEdit && profile && (
        <ProfileEditModal profile={profile} onClose={() => setShowEdit(false)} onSave={updateProfile} />
      )}
      <HeroJournal isOpen={journalOpen} onClose={() => setJournalOpen(false)} />
      <SoundSettings />
    </main>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4 px-4 sm:px-8 pt-6 pb-4 border-b border-amber-900/20">
      <motion.button whileTap={{ scale: 0.93 }} onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-700/50 bg-stone-900/40 hover:bg-stone-800/60 text-stone-300 text-xs font-bold uppercase tracking-wider transition-all shrink-0">
        <ArrowLeft className="w-4 h-4" /> Back
      </motion.button>
      <div>
        <h1 className="text-lg sm:text-2xl font-black text-[var(--foreground)] uppercase tracking-tight leading-none">{title}</h1>
        <p className="text-[10px] text-amber-700/60 italic mt-0.5">{subtitle}</p>
      </div>
      <div className="ml-auto">
        <Crown className="w-6 h-6 text-amber-700/30 crown-float" />
      </div>
    </div>
  );
}

function Toggle({ value, onChange, disabled = false }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${value ? 'bg-amber-500' : 'bg-stone-700'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md ${value ? 'left-6' : 'left-0.5'}`}
      />
    </button>
  );
}

function SettingRow({ icon, label, desc, children }: { icon: React.ReactNode; label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl glass-panel border border-stone-800/40 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div className="min-w-0">
          <p className="text-sm font-black text-[var(--foreground)] leading-tight">{label}</p>
          <p className="text-[9px] text-stone-500 leading-snug mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Gameplay sections data ────────────────────────────────────────────────────
const GAMEPLAY_SECTIONS = [
  {
    icon: '🗺️',
    title: 'The Sacred Board',
    body: 'Historia Legends is played on a 46-tile isometric 3D board arranged in a serpentine 10×5 grid. Players start at Tile 0 and race to Tile 45 (the Finish Line) to claim the Crown of Wisdom and win the match.',
  },
  {
    icon: '🎲',
    title: 'How Movement Works',
    body: 'On your turn, roll the ancient dice (1–6). You must then answer a trivia question. Answer correctly to advance the full roll distance. Wrong answers move you fewer tiles (based on difficulty).',
    bullets: [
      'Easy question: move full roll on correct, partial on wrong',
      'Medium question: roll +1 tiles on correct answer',
      'Hard question: roll +2 tiles on correct answer',
      'Blessed Dice relic guarantees a roll of 5 or 6',
    ],
  },
  {
    icon: '📜',
    title: 'Trivia Trials',
    body: 'Each turn features a timed trivia question. You have a countdown to select your answer. The difficulty of the question scales the coin reward and bonus movement.',
    bullets: [
      'Easy: +5 Royal Gold, +20 XP on correct',
      'Medium: +10 Royal Gold, +40 XP on correct',
      'Hard: +20 Royal Gold, +80 XP on correct',
      'Time runs out = answer submitted as blank (wrong)',
    ],
  },
  {
    icon: '🏰',
    title: 'Special Tiles',
    body: 'The board is filled with 20+ special tile types that trigger unique effects when landed on.',
    bullets: [
      '💀 Cursed Rune (Trap) — lose coins and move back',
      '💰 Gold Pile / Coin Fountain — collect free Royal Gold',
      '⚡ Tailwind / Launch Pad — move forward for free',
      '🌀 Mystery / Dimensional Rift — random effect',
      '🔄 Swap Pad / Mirror World — swap positions with a player',
      '🏆 Sunken Chest / Vault — spend gold for a big reward or trap',
      '❄️ Frozen Path / Time Warp — skip upcoming turns',
      '🎲 Roll Again / Momentum — roll the dice a second time',
      '⚡ Teleporter / Nexus Portal — teleport to a random tile',
      '🎁 Enchanted Crate — receive a free relic item',
    ],
  },
  {
    icon: '🧙',
    title: 'Wild & Challenge Tiles',
    body: 'Wild Tiles (Fate Scroll) let you choose any trivia category for your next question. Challenge Tiles (Knight\'s Trial) present a Hard difficulty bonus question — answer correctly for double coin rewards.',
  },
  {
    icon: '🛒',
    title: 'Merchant\'s Caravan (Items)',
    body: 'During any turn, you can purchase powerful relics from the Merchant\'s Caravan using Royal Gold earned from correct answers.',
    bullets: [
      '🛡️ Iron Shield (20g) — blocks the next Cursed Rune',
      '⏳ Hourglass Relic (10g) — +15 seconds on your next trial',
      '🎲 Blessed Dice (20g) — guarantees a roll of 5 or 6',
      '🌑 Shadow Cloak (18g) — absorbs the next trap passively',
      '💰 Royal Multiplier (15g) — doubles gold on next correct answer',
    ],
  },
  {
    icon: '🏆',
    title: 'How to Win',
    body: 'The first player to reach or pass Tile 45 (the Finish Line) wins the match, earns XP, Royal Gold, and is declared the Crowned Champion of Historia.',
  },
  {
    icon: '👥',
    title: 'Multiplayer Modes',
    body: 'Historia Legends supports three battle modes, all using real-time polling for synchronised gameplay.',
    bullets: [
      '⚔️ Royal Duel — 1v1 head-to-head battle',
      '🛡️ Band of Heroes — 2v2 team mode (shared banner)',
      '👑 Grand Melee — Free-for-all, up to 4 heroes',
    ],
  },
  {
    icon: '🦸',
    title: 'Heroes & Passives',
    body: 'Choose one of four heroes, each with a unique passive ability that provides a small advantage during the match.',
    bullets: [
      '📚 Seraphel — Scholar\'s Edge: +3 seconds on Hard trials',
      '🌿 Thorn — Pathfinder: once per match, ignores a trap penalty',
      '🗡️ Mira — Veil Step: 15% chance of +1 movement on correct answers',
      '☀️ Caldwyn — Holy Aegis: Shield Relic lasts one extra turn',
    ],
  },
];
