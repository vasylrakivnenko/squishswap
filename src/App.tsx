/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Student, SquishyItem, TradeOffer } from './types';
import { Header } from './components/Header';
import { SchoolDisclaimerBanner } from './components/SchoolDisclaimerBanner';
import { SquishyCard } from './components/SquishyCard';
import { StudentAuthModal } from './components/StudentAuthModal';
import { SquishyUploadModal } from './components/SquishyUploadModal';
import { TradeModal } from './components/TradeModal';
import { TradesLocker } from './components/TradesLocker';
import { SchoolRulesView } from './components/SchoolRulesView';
import { SchoolDogGatekeeper } from './components/SchoolDogGatekeeper';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  Search,
  Sparkles,
  Radio,
  RotateCcw,
  Layers,
  PlusCircle,
  Camera,
  Filter,
} from 'lucide-react';

const COLORS = [
  'All',
  'Pink',
  'Purple',
  'Mint Green',
  'Rainbow',
  'Blue',
  'Yellow',
  'White',
  'Multi',
];

const TEXTURES = [
  'All',
  'Ultra Slow-Rise',
  'Mochi & Taba',
  'Jelly / Gummy',
  'Liquid / Water Bead',
  'Maltose / Dough',
  'Fast-Rising / Bouncy',
  'Jumbo Dense Foam',
  'Fuzzy & Flocked',
  'Scented Sweet Squishy',
  'Crunchy / Crinkly',
];

export default function App() {
  // Gatekeeper: Name of the school dog is "Leo"
  const [isGateUnlocked, setIsGateUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('la_entrada_dog_verified') === 'true';
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const saved = localStorage.getItem('la_entrada_student');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [squishies, setSquishies] = useState<SquishyItem[]>([]);
  const [trades, setTrades] = useState<TradeOffer[]>([]);

  // Navigation & Modals
  const [activeView, setActiveView] = useState<'browse' | 'trades' | 'rules'>('browse');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedTargetSquishy, setSelectedTargetSquishy] = useState<SquishyItem | null>(null);

  // Filters
  const [onlyOnlineUsers, setOnlyOnlineUsers] = useState(false);
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedTexture, setSelectedTexture] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial real data loading
  useEffect(() => {
    fetch('/api/students')
      .then((r) => r.json())
      .then((data: Student[]) => {
        setAllStudents(data);
      })
      .catch((err) => console.error('Failed to load students:', err));

    fetch('/api/squishies')
      .then((r) => r.json())
      .then((data: SquishyItem[]) => setSquishies(data))
      .catch((err) => console.error('Failed to load squishies:', err));

    fetch('/api/trades')
      .then((r) => r.json())
      .then((data: TradeOffer[]) => setTrades(data))
      .catch((err) => console.error('Failed to load trades:', err));
  }, []);

  // Heartbeat to keep active student online
  useEffect(() => {
    if (!currentStudent) return;
    const interval = setInterval(() => {
      fetch('/api/students/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentStudent.id, isOnline: true }),
      }).catch(() => {});
    }, 45000);
    return () => clearInterval(interval);
  }, [currentStudent]);

  const handleUnlockDogGate = () => {
    setIsGateUnlocked(true);
  };

  const handleLogin = (student: Student) => {
    setCurrentStudent(student);
    localStorage.setItem('la_entrada_student', JSON.stringify(student));
    fetch('/api/students')
      .then((r) => r.json())
      .then(setAllStudents);
    fetch('/api/squishies')
      .then((r) => r.json())
      .then(setSquishies);
  };

  const handleSquishyAdded = (newSquish: SquishyItem) => {
    setSquishies((prev) => [newSquish, ...prev]);
    setActiveView('browse');
  };

  const handleTradeProposed = (newTrade: TradeOffer) => {
    setTrades((prev) => [newTrade, ...prev]);
    setActiveView('trades');
  };

  const handleTradeResponded = (updatedTrade: TradeOffer) => {
    setTrades((prev) => prev.map((t) => (t.id === updatedTrade.id ? updatedTrade : t)));
    if (updatedTrade.status === 'accepted') {
      setSquishies((prev) =>
        prev.map((s) => {
          if (s.id === updatedTrade.offeredSquishyId || s.id === updatedTrade.targetSquishyId) {
            return { ...s, status: 'traded' };
          }
          return s;
        })
      );
    }
  };

  const handleOpenTradeOffer = (target: SquishyItem) => {
    setSelectedTargetSquishy(target);
    setIsTradeModalOpen(true);
  };

  const handleOpenUpload = () => {
    if (!currentStudent) {
      setIsAuthOpen(true);
    } else {
      setIsUploadOpen(true);
    }
  };

  // Pending trades count for this student
  const pendingTradesCount = useMemo(() => {
    if (!currentStudent) return 0;
    return trades.filter((t) => t.toStudentId === currentStudent.id && t.status === 'pending')
      .length;
  }, [trades, currentStudent]);

  // Online students count
  const onlineStudentsCount = useMemo(() => {
    return allStudents.filter((s) => s.isOnline).length;
  }, [allStudents]);

  // Filtered Squishies
  const filteredSquishies = useMemo(() => {
    return squishies.filter((sq) => {
      // 1. Live Users Currently Logged In Filter
      if (onlyOnlineUsers && !sq.isOwnerOnline) {
        return false;
      }

      // 2. Color Filter
      if (selectedColor !== 'All') {
        const matchesColor = sq.color.toLowerCase().includes(selectedColor.toLowerCase());
        if (!matchesColor) return false;
      }

      // 3. Feeling / Texture Filter
      if (selectedTexture !== 'All') {
        const sqText = sq.texture.toLowerCase();
        const selText = selectedTexture.toLowerCase();
        if (!sqText.includes(selText) && !selText.includes(sqText)) {
          return false;
        }
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = sq.name.toLowerCase().includes(q);
        const matchesOwner = sq.ownerName.toLowerCase().includes(q);
        const matchesClass = sq.ownerClassroom.toLowerCase().includes(q);
        const matchesWishlist = sq.wishlist.toLowerCase().includes(q);
        if (!matchesName && !matchesOwner && !matchesClass && !matchesWishlist) {
          return false;
        }
      }

      return true;
    });
  }, [squishies, onlyOnlineUsers, selectedColor, selectedTexture, searchQuery]);

  const hasActiveFilters =
    onlyOnlineUsers || selectedColor !== 'All' || selectedTexture !== 'All' || searchQuery !== '';

  const resetFilters = () => {
    setOnlyOnlineUsers(false);
    setSelectedColor('All');
    setSelectedTexture('All');
    setSearchQuery('');
  };

  // If not unlocked with school dog "Leo", display gatekeeper
  if (!isGateUnlocked) {
    return <SchoolDogGatekeeper onUnlock={handleUnlockDogGate} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col text-slate-800">
      {/* Unofficial Student Club Notice Banner */}
      <SchoolDisclaimerBanner />

      {/* Tablet-First Header with Integrated Navigation Tabs & CTA */}
      <Header
        currentStudent={currentStudent}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUpload={handleOpenUpload}
        onlineCount={onlineStudentsCount}
        activeView={activeView}
        setActiveView={setActiveView}
        pendingTradesCount={pendingTradesCount}
      />

      {/* Main Tablet-Optimized Container */}
      <main className="flex-1 max-w-5xl xl:max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeView === 'rules' && <SchoolRulesView />}

        {activeView === 'trades' && (
          <TradesLocker
            currentStudent={currentStudent}
            trades={trades}
            onTradeResponded={handleTradeResponded}
            onRequestLogin={() => setIsAuthOpen(true)}
          />
        )}

        {activeView === 'browse' && (
          <div className="space-y-6">
            {/* Tablet Station Banner: 2-Column Split */}
            <div className="relative rounded-3xl overflow-hidden border border-amber-200/80 bg-gradient-to-r from-amber-100/80 via-orange-50 to-pink-50 p-6 md:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                    <span>🎒 La Entrada Recess Station</span>
                    <span>·</span>
                    <span>Dog Verified: Leo</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-display">
                    Squishy Trading Board
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Snap a photo of your squishy on a clean surface. Swap in-person with classmates during recess or lunch at La Entrada!
                  </p>
                </div>

                {/* Tablet Quick Stats & Post Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-amber-200/60">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-slate-800">
                      {onlineStudentsCount > 0
                        ? `${onlineStudentsCount} student${onlineStudentsCount === 1 ? '' : 's'} online`
                        : 'Trading board live'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {squishies.length} {squishies.length === 1 ? 'item' : 'items'} posted
                    </div>
                  </div>

                  <button
                    onClick={handleOpenUpload}
                    className="min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Post Your Squishy</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tablet Filter & Search Toolbar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              {/* Row 1: Search + Online Filter Toggle + Reset */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by squishy name, username, or classroom..."
                    className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-slate-800 bg-slate-50/50 focus:bg-white transition"
                  />
                </div>

                {/* Online Kids Only Toggle */}
                <button
                  onClick={() => setOnlyOnlineUsers(!onlyOnlineUsers)}
                  className={`h-11 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border shrink-0 ${
                    onlyOnlineUsers
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-2xs'
                      : 'bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${onlyOnlineUsers ? 'animate-pulse' : ''}`} />
                  <span>Online Kids Only</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                      onlyOnlineUsers
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-200/80 text-emerald-900 font-bold'
                    }`}
                  >
                    {onlineStudentsCount}
                  </span>
                </button>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="h-11 px-3.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>

              {/* Row 2: Texture & Feel Chips */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Filter by Texture & Rebound Feel:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                  {TEXTURES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTexture(t)}
                      className={`min-h-[34px] px-3.5 py-1 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer shrink-0 ${
                        selectedTexture === t
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Color Chips */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Filter by Primary Color:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`min-h-[34px] px-3.5 py-1 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer shrink-0 ${
                        selectedColor === c
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feed Status Summary */}
            {squishies.length > 0 && (
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <span className="font-bold text-slate-800 text-sm">
                  {filteredSquishies.length} {filteredSquishies.length === 1 ? 'Squishy' : 'Squishies'} Available
                </span>
                {onlyOnlineUsers && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Showing online students only
                  </span>
                )}
              </div>
            )}

            {/* Real Squishy Grid or Tablet Empty State */}
            {filteredSquishies.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-4xl border border-amber-100">
                  🧸
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {squishies.length === 0
                      ? 'No squishies posted yet!'
                      : 'No squishies match your filters'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    {squishies.length === 0
                      ? 'Be the first student to snap a photo of your squishy on a plain surface and post it on the trading board!'
                      : 'Try resetting your color or texture filters to view all available squishies.'}
                  </p>
                </div>

                {squishies.length === 0 ? (
                  <button
                    onClick={handleOpenUpload}
                    className="mt-3 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload the First Squishy</span>
                  </button>
                ) : (
                  <button
                    onClick={resetFilters}
                    className="mt-3 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              /* Tablet Grid: 2 cols on mobile, 3 cols on tablet portrait, 4 cols on tablet landscape */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filteredSquishies.map((sq) => (
                  <SquishyCard
                    key={sq.id}
                    squishy={sq}
                    currentStudent={currentStudent}
                    onOfferTrade={handleOpenTradeOffer}
                    onRequestLogin={() => setIsAuthOpen(true)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Responsive Bottom Navigation for small screens (< 768px), hidden on tablets (>= 768px) */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenUpload={handleOpenUpload}
        pendingTradesCount={pendingTradesCount}
      />

      {/* Real Tablet Modals */}
      <StudentAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentStudent={currentStudent}
        onLogin={handleLogin}
      />

      <SquishyUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentStudent={currentStudent}
        onSquishyAdded={handleSquishyAdded}
        onRequestLogin={() => setIsAuthOpen(true)}
      />

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        targetSquishy={selectedTargetSquishy}
        currentStudent={currentStudent}
        mySquishies={squishies.filter((s) => s.ownerId === currentStudent?.id)}
        onTradeProposed={handleTradeProposed}
        onOpenUpload={handleOpenUpload}
      />
    </div>
  );
}
