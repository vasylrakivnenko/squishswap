import React from 'react';

interface StudentAvatarProps {
  seed: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const AVATAR_MAP: Record<string, { emoji: string; bg: string; text: string }> = {
  cat: { emoji: '🐱', bg: 'bg-pink-100', text: 'text-pink-700' },
  panda: { emoji: '🐼', bg: 'bg-purple-100', text: 'text-purple-700' },
  boba: { emoji: '🧋', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  bear: { emoji: '🧸', bg: 'bg-amber-100', text: 'text-amber-800' },
  fox: { emoji: '🦊', bg: 'bg-orange-100', text: 'text-orange-700' },
  bunny: { emoji: '🐰', bg: 'bg-sky-100', text: 'text-sky-700' },
  dino: { emoji: '🦕', bg: 'bg-teal-100', text: 'text-teal-700' },
  duck: { emoji: '🐥', bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

export const AVAILABLE_AVATARS = Object.keys(AVATAR_MAP);

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  seed,
  name,
  size = 'md',
  showOnlineStatus = false,
  isOnline = false,
}) => {
  const avatar = AVATAR_MAP[seed.toLowerCase()] || AVATAR_MAP.panda;

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-16 h-16 text-3xl',
  }[size];

  const statusDotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <div
        className={`${sizeClasses} ${avatar.bg} rounded-full flex items-center justify-center shadow-xs select-none border border-black/5 font-medium`}
        title={name}
      >
        <span>{avatar.emoji}</span>
      </div>
      {showOnlineStatus && (
        <span
          className={`absolute bottom-0 right-0 ${statusDotSize} rounded-full ring-2 ring-white ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
          title={isOnline ? `${name} is currently online` : `${name} is currently offline`}
        />
      )}
    </div>
  );
};
