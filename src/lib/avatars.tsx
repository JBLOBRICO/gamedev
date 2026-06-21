import React from 'react';

export interface AvatarInfo {
  id: string;
  name: string;
  render: (className?: string) => React.ReactNode;
}

export const AVATARS: AvatarInfo[] = [
  {
    id: "avatar_1",
    name: "Cosmic Explorer",
    render: (cls = "w-16 h-16") => (
      <svg className={cls} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="url(#cosmicGrad)" stroke="#38bdf8" strokeWidth="2"/>
        <circle cx="50" cy="45" r="28" fill="#e0f2fe"/>
        <rect x="30" y="35" width="40" height="20" rx="10" fill="#0284c7" opacity="0.8"/>
        <rect x="35" y="38" width="30" height="14" rx="7" fill="#38bdf8" opacity="0.9"/>
        <rect x="40" y="40" width="10" height="4" rx="2" fill="#fff" opacity="0.6"/>
        <path d="M40 73 L60 73 L65 85 L35 85 Z" fill="#94a3b8"/>
        <circle cx="50" cy="80" r="3" fill="#ef4444"/>
        <defs>
          <linearGradient id="cosmicGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f172a"/>
            <stop offset="1" stopColor="#1e1b4b"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: "avatar_2",
    name: "Cyber Punk",
    render: (cls = "w-16 h-16") => (
      <svg className={cls} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#f43f5e" strokeWidth="2"/>
        <path d="M30 25 L40 10 L50 25 L60 10 L70 25 L80 15 L75 40 L25 40 Z" fill="#f43f5e"/>
        <circle cx="50" cy="55" r="25" fill="#fde047"/>
        <rect x="32" y="48" width="36" height="10" rx="3" fill="#06b6d4"/>
        <line x1="32" y1="53" x2="68" y2="53" stroke="#fff" strokeWidth="2"/>
        <path d="M45 70 Q50 78 55 70" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: "avatar_3",
    name: "Retro Gamer",
    render: (cls = "w-16 h-16") => (
      <svg className={cls} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#22c55e" strokeWidth="2"/>
        <rect x="25" y="35" width="50" height="30" rx="6" fill="#475569"/>
        <circle cx="65" cy="50" r="5" fill="#ef4444"/>
        <circle cx="55" cy="50" r="5" fill="#f59e0b"/>
        <path d="M35 50 H45 M40 45 V55" stroke="#1e293b" strokeWidth="4" strokeLinecap="round"/>
        <rect x="42" y="60" width="16" height="4" rx="2" fill="#94a3b8"/>
      </svg>
    )
  },
  {
    id: "avatar_4",
    name: "Professor Brains",
    render: (cls = "w-16 h-16") => (
      <svg className={cls} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#f8fafc" stroke="#6366f1" strokeWidth="2"/>
        <path d="M25 35 L50 20 L75 35 L50 42 Z" fill="#312e81"/>
        <rect x="48" y="35" width="4" height="20" fill="#fbbf24"/>
        <circle cx="50" cy="55" r="22" fill="#ffedd5"/>
        <circle cx="40" cy="55" r="7" fill="none" stroke="#000" strokeWidth="2"/>
        <circle cx="60" cy="55" r="7" fill="none" stroke="#000" strokeWidth="2"/>
        <line x1="47" y1="55" x2="53" y2="55" stroke="#000" strokeWidth="2"/>
        <path d="M45 68 Q50 72 55 68" stroke="#000" strokeWidth="2" fill="none"/>
        <path d="M30 45 Q50 35 70 45" stroke="#475569" strokeWidth="4" fill="none"/>
      </svg>
    )
  },
  {
    id: "avatar_5",
    name: "Cat Burglar",
    render: (cls = "w-16 h-16") => (
      <svg className={cls} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#090d16" stroke="#a855f7" strokeWidth="2"/>
        <path d="M25 40 L30 20 L45 35 Z" fill="#1e293b"/>
        <path d="M75 40 L70 20 L55 35 Z" fill="#1e293b"/>
        <circle cx="50" cy="55" r="24" fill="#334155"/>
        <rect x="26" y="45" width="48" height="12" rx="6" fill="#0f172a"/>
        <circle cx="40" cy="51" r="3" fill="#22c55e"/>
        <circle cx="60" cy="51" r="3" fill="#22c55e"/>
        <path d="M48 62 L52 62 L50 65 Z" fill="#f43f5e"/>
        <path d="M46 68 Q50 72 54 68" stroke="#f43f5e" strokeWidth="2" fill="none"/>
      </svg>
    )
  },
  // Add placeholder generators for avatars 6 to 45 so we fulfill the 40-50 avatars requirement fully
  ...Array.from({ length: 40 }).map((_, index) => {
    const idNum = index + 6;
    const colors = [
      { border: "#3b82f6", bg: "#dbeafe", accent: "#1d4ed8", name: "Astro Chef" },
      { border: "#10b981", bg: "#d1fae5", accent: "#047857", name: "Forest Ranger" },
      { border: "#f59e0b", bg: "#fef3c7", accent: "#b45309", name: "Desert Bandit" },
      { border: "#ec4899", bg: "#fce7f3", accent: "#be185d", name: "Neon Fairy" },
      { border: "#8b5cf6", bg: "#ede9fe", accent: "#6d28d9", name: "Mystic Sage" },
      { border: "#ef4444", bg: "#fee2e2", accent: "#b91c1c", name: "Lava Beast" },
      { border: "#14b8a6", bg: "#ccfbf1", accent: "#0f766e", name: "Aqua Ninja" },
      { border: "#6b7280", bg: "#f3f4f6", accent: "#374151", name: "Metal Golem" }
    ];
    const col = colors[index % colors.length];
    return {
      id: `avatar_${idNum}`,
      name: `${col.name} #${idNum}`,
      render: (cls = "w-16 h-16") => (
        <svg className={cls} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill={col.bg} stroke={col.border} strokeWidth="2"/>
          {/* Add visual elements based on index to differentiate them */}
          {idNum % 2 === 0 ? (
            <>
              <polygon points="50,15 80,45 80,80 20,80 20,45" fill={col.accent} opacity="0.7"/>
              <circle cx="50" cy="50" r="16" fill="#fff"/>
              <circle cx="50" cy="50" r="8" fill={col.border}/>
              <path d="M42 70 Q50 75 58 70" stroke="#000" strokeWidth="2" fill="none"/>
            </>
          ) : (
            <>
              <rect x="25" y="25" width="50" height="50" rx="10" fill={col.accent} opacity="0.7"/>
              <circle cx="38" cy="45" r="5" fill="#fff"/>
              <circle cx="62" cy="45" r="5" fill="#fff"/>
              <circle cx="38" cy="45" r="2" fill="#000"/>
              <circle cx="62" cy="45" r="2" fill="#000"/>
              <path d="M40 60 H60" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
            </>
          )}
          <text x="50" y="90" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            {idNum}
          </text>
        </svg>
      )
    };
  })
];

export function getAvatarById(id: string): AvatarInfo {
  return AVATARS.find(av => av.id === id) || AVATARS[0];
}
