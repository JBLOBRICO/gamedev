'use client';

import { useState, useEffect, useCallback } from 'react';

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

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Create or update profile (POST) ────────────────────────────────────────
  // Defined first so fetchProfile can reference it in its dependency array.
  const createOrUpdateProfile = useCallback(async (
    username: string,
    avatarId: string,
    nameColor: string,
    title: string
  ) => {
    try {
      setLoading(true);
      const storedId = localStorage.getItem('quizrealm_userId');
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedId || undefined,
          username,
          avatarId,
          nameColor,
          title,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update profile');
      }

      const data = await res.json();
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

  // ── Fetch profile (GET) ─────────────────────────────────────────────────────
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);

      if (res.status === 404) {
        // The userId in localStorage doesn't exist in this database
        // (e.g. user was on local dev, now on production). Clear stale data
        // and auto-create a fresh profile so the app keeps working.
        localStorage.removeItem('quizrealm_userId');
        localStorage.removeItem('quizrealm_username');
        const randNum = Math.floor(1000 + Math.random() * 9000);
        await createOrUpdateProfile(`Player#${randNum}`, 'avatar_1', '#38bdf8', 'Novice');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [createOrUpdateProfile]);

  // ── Bootstrap on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    const storedId = localStorage.getItem('quizrealm_userId');
    if (!storedId) {
      // No ID at all — auto-register a new profile
      const randNum = Math.floor(1000 + Math.random() * 9000);
      createOrUpdateProfile(`Player#${randNum}`, 'avatar_1', '#38bdf8', 'Novice')
        .catch(() => setLoading(false));
    } else {
      fetchProfile(storedId);
    }
  }, [fetchProfile, createOrUpdateProfile]);

  return {
    profile,
    loading,
    error,
    refresh: () => profile && fetchProfile(profile.id),
    updateProfile: createOrUpdateProfile,
  };
}
