import React from 'react';

export interface AvatarInfo {
  id: string;
  name: string;
  render: (className?: string) => React.ReactNode;
}

export const AVATARS: AvatarInfo[] = [
  {
    id: "avatar_1",
    name: "Sir Aldric",
    render: (cls = "w-16 h-16") => (
      <img src="/avatars/avatar_1.png" alt="Sir Aldric" className={`${cls} object-cover rounded-lg`} />
    )
  },
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
  {
    id: "avatar_6",
    name: "Vesper Ironquill",
    render: (cls = "w-16 h-16") => (
      <img src="/avatars/avatar_6.png" alt="Vesper" className={`${cls} object-cover rounded-lg`} />
    )
  },
  {
    id: "avatar_7",
    name: "Gareth Cogsworth",
    render: (cls = "w-16 h-16") => (
      <img src="/avatars/avatar_7.png" alt="Gareth" className={`${cls} object-cover rounded-lg`} />
    )
  },
  {
    id: "avatar_8",
    name: "Lunara",
    render: (cls = "w-16 h-16") => (
      <div className={`${cls} rounded-lg bg-gradient-to-br from-indigo-900 to-violet-950 flex flex-col items-center justify-center border border-indigo-500/50 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
        <span className="text-3xl filter drop-shadow-md z-10">🔮</span>
      </div>
    )
  },
  {
    id: "avatar_9",
    name: "Ragnar Embervein",
    render: (cls = "w-16 h-16") => (
      <div className={`${cls} rounded-lg bg-gradient-to-br from-red-900 to-orange-950 flex flex-col items-center justify-center border border-red-500/50 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
        <span className="text-3xl filter drop-shadow-md z-10">🐉</span>
      </div>
    )
  },
  {
    id: "avatar_10",
    name: "Countess Elara",
    render: (cls = "w-16 h-16") => (
      <div className={`${cls} rounded-lg bg-gradient-to-br from-rose-900 to-pink-950 flex flex-col items-center justify-center border border-rose-500/50 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
        <span className="text-3xl filter drop-shadow-md z-10">⚜️</span>
      </div>
    )
  }
];

export function getAvatarById(id: string): AvatarInfo {
  return AVATARS.find(av => av.id === id) || AVATARS[0];
}
