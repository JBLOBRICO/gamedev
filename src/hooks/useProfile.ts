'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  avatarId: string;
  frameId: string;
  nameColor: string;
  title: string;
  xp: number;
  level: number;
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
  triviaAccuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
  longestStreak: number;
  favoriteCategory: string;
  unlockedAvatars: string;
  unlockedFrames: string;
  unlockedTitles: string;
  unlockedBadges: string;
}

/** POST to /api/profile — creates or updates a profile. Does NOT touch loading state. */
async function apiCreateProfile(
  userId: string | null,
  username: string,
  avatarId = 'avatar_1',
  nameColor = '#38bdf8',
  title = 'Novice'
): Promise<UserProfile> {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId ?? undefined,
      username,
      avatarId,
      nameColor,
      title,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create profile');
  }
  return res.json();
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bootstrapped = useRef(false);

  // ── Bootstrap: runs once on mount ───────────────────────────────────────────
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    async function bootstrap() {
      setLoading(true);
      try {
        const storedId = localStorage.getItem('quizrealm_userId');

        if (storedId) {
          // Try to fetch existing profile
          const res = await fetch(`/api/profile?userId=${encodeURIComponent(storedId)}`);

          if (res.ok) {
            const data: UserProfile = await res.json();
            setProfile(data);
            return;
          }

          // Profile not found in this DB (stale localStorage) — clear and recreate
          if (res.status === 404) {
            localStorage.removeItem('quizrealm_userId');
            localStorage.removeItem('quizrealm_username');
          }
          // For other errors (5xx network issues), also fall through to create
        }

        // No stored ID, or ID was stale — create a fresh profile
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const data = await apiCreateProfile(
          null,
          `Player#${randNum}`,
          'avatar_1',
          '#38bdf8',
          'Novice'
        );
        localStorage.setItem('quizrealm_userId', data.id);
        localStorage.setItem('quizrealm_username', data.username);
        setProfile(data);
        setError(null);
      } catch (err: any) {
        console.error('Profile bootstrap error:', err);
        setError(err.message ?? 'Could not load profile');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  // ── Update profile (called from settings/edit modal) ────────────────────────
  const updateProfile = useCallback(async (
    username: string,
    avatarId: string,
    nameColor: string,
    title: string
  ) => {
    setLoading(true);
    try {
      const storedId = localStorage.getItem('quizrealm_userId');
      const data = await apiCreateProfile(storedId, username, avatarId, nameColor, title);
      setProfile(data);
      localStorage.setItem('quizrealm_userId', data.id);
      localStorage.setItem('quizrealm_username', data.username);
      setError(null);
      return data;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Manual refresh ───────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const storedId = localStorage.getItem('quizrealm_userId');
    if (!storedId) return;
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(storedId)}`);
      if (res.ok) {
        const data: UserProfile = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile refresh error:', err);
    }
  }, []);

  return { profile, loading, error, refresh, updateProfile };
}
