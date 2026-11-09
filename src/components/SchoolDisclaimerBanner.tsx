import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, School, EyeOff, Info } from 'lucide-react';

export const SchoolDisclaimerBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-amber-50/90 border-b border-amber-200/70 text-slate-800">
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
            <School className="w-3.5 h-3.5" />
          </div>
          <div className="leading-tight truncate">
            <span className="font-bold text-amber-950">Unofficial Student Club:</span>{' '}
            <span className="text-amber-900">
              Made strictly for students at La Entrada School · In-person trading on school grounds during recess only.
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 hover:text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Safety Rules</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="bg-white border-t border-amber-200/60 px-4 sm:px-6 py-4 shadow-inner animate-in fade-in duration-200 text-xs">
          <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-3">
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 text-sm">Notice for Students & Parents:</span>
                <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                  This website is an unofficial student-made trading club tool. It is not managed or endorsed by the school administration. Swaps must be fair, friendly, and conducted strictly in person during designated school recess or lunch breaks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  School Premises Only
                </span>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  All physical trades occur on campus during recess or lunch. Never arrange off-campus meetings.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                  COPPA Student Privacy
                </span>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  Never use your real name, first or last name. Only squishy usernames are permitted.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 sm:col-span-2 md:col-span-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <School className="w-3.5 h-3.5 text-amber-600" />
                  AI Photo Inspection
                </span>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  All uploaded photos are inspected by AI to verify squishy items and ensure plain backgrounds without personal items.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
