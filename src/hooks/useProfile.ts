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

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
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
  }, []);

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

  useEffect(() => {
    const storedId = localStorage.getItem('quizrealm_userId');
    if (!storedId) {
      // Auto-register initial random profile
      const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const randNum = Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('quizrealm_userId', newId);
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
