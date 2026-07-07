import React from 'react';

export interface AvatarInfo {
  id: string;
  name: string;
  render: (className?: string) => React.ReactNode;
}

export const AVATARS: AvatarInfo[] = [
  {
    id: "avatar_2",
    name: "Seraphel",
    render: (cls = "w-16 h-16") => (
      <img src="/avatars/avatar_2.png" alt="Seraphel" className={`${cls} object-cover rounded-lg`} />
    )
  },
  {
    id: "avatar_3",
    name: "Thorn Willowmere",
    render: (cls = "w-16 h-16") => (
      <img src="/avatars/avatar_3.png" alt="Thorn" className={`${cls} object-cover rounded-lg`} />
    )
  },
  {
    id: "avatar_4",
    name: "Mira Ashveil",
    render: (cls = "w-16 h-16") => (
      <img src="/avatars/avatar_4.png" alt="Mira" className={`${cls} object-cover rounded-lg`} />
    )
  },
  {
    id: "avatar_5",
    name: "Caldwyn",
    render: (cls = "w-16 h-16") => (
      <img src="/avatars/avatar_5.png" alt="Caldwyn" className={`${cls} object-cover rounded-lg`} />
    )
  },
];

export function getAvatarById(id: string): AvatarInfo {
  return AVATARS.find(av => av.id === id) || AVATARS[0];
}
