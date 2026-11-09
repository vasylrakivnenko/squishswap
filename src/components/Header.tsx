import React from 'react';
import { Student } from '../types';
import { StudentAvatar } from './StudentAvatar';
import { PlusCircle, Compass, ArrowLeftRight, BookOpen, Radio } from 'lucide-react';

interface HeaderProps {
  currentStudent: Student | null;
  onOpenAuth: () => void;
  onOpenUpload: () => void;
  onlineCount: number;
  activeView: 'browse' | 'trades' | 'rules';
  setActiveView: (view: 'browse' | 'trades' | 'rules') => void;
  pendingTradesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStudent,
  onOpenAuth,
  onOpenUpload,
  onlineCount,
  activeView,
  setActiveView,
  pendingTradesCount,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('browse')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
              🧸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 font-display">
                  SquishSwap
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                  La Entrada
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Recess Squishy Trading Station
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Tablet Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/70">
          <button
            onClick={() => setActiveView('browse')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'browse'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Squishies</span>
          </button>

          <button
            onClick={() => setActiveView('trades')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeView === 'trades'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-amber-600" />
            <span>Trade Locker</span>
            {pendingTradesCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {pendingTradesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('rules')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'rules'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Rules & Safety</span>
          </button>
        </nav>

        {/* Zone 3: Tablet Action & Profile Area */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Online Badge */}
          {onlineCount > 0 && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800"
              title={`${onlineCount} student${onlineCount === 1 ? '' : 's'} online right now`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{onlineCount} Online</span>
            </div>
          )}

          {/* Primary Action Button: Add Squishy */}
          <button
            onClick={onOpenUpload}
            className="min-h-[42px] px-3.5 sm:px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Squishy</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Student Account Status */}
          {currentStudent ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 transition cursor-pointer"
              title={`${currentStudent.name} (${currentStudent.classroom}) - Click to manage`}
            >
              <StudentAvatar
                seed={currentStudent.avatarSeed}
                name={currentStudent.name}
                size="sm"
                showOnlineStatus
                isOnline={currentStudent.isOnline}
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentStudent.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[90px]">
                  {currentStudent.classroom.split('·')[0]}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="min-h-[42px] px-3.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
