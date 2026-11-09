import React from 'react';
import { PlusCircle, ArrowLeftRight, BookOpen, Compass } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'browse' | 'trades' | 'rules';
  setActiveView: (view: 'browse' | 'trades' | 'rules') => void;
  onOpenUpload: () => void;
  pendingTradesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  onOpenUpload,
  pendingTradesCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="grid grid-cols-4 items-center h-16 px-1 max-w-lg mx-auto">
        {/* Tab 1: Browse Squishies */}
        <button
          onClick={() => setActiveView('browse')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'browse' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5" />
            {activeView === 'browse' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Squishies</span>
        </button>

        {/* Tab 2: Add Squishy */}
        <button
          onClick={onOpenUpload}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-700 hover:text-amber-600 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs group-active:scale-95 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-amber-700 tracking-tight mt-0.5">Add</span>
        </button>

        {/* Tab 3: Trade Locker */}
        <button
          onClick={() => setActiveView('trades')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer relative ${
            activeView === 'trades' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ArrowLeftRight className="w-5 h-5" />
            {pendingTradesCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {pendingTradesCount}
              </span>
            )}
            {activeView === 'trades' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Trades</span>
        </button>

        {/* Tab 4: Rules & Guidelines */}
        <button
          onClick={() => setActiveView('rules')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'rules' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" />
            {activeView === 'rules' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Rules</span>
        </button>
      </div>
    </nav>
  );
};
