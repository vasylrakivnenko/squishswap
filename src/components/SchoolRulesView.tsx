import React from 'react';
import { ShieldCheck, MapPin, EyeOff, Sparkles, CheckCircle2, AlertTriangle, School } from 'lucide-react';

export const SchoolRulesView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner Card */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-200/80 shadow-xs bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 p-6 sm:p-8">
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/60 px-3 py-1 rounded-lg">
            <School className="w-3.5 h-3.5" />
            <span>Unofficial La Entrada Student Club Guidelines</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Safe, Fair & Friendly Squishy Trading
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            SquishSwap is an unofficial, student-made app created for students at <strong>La Entrada School</strong> to browse squishies and propose friendly in-person swaps at recess or lunch. To keep every kid safe, the app uses AI safety checks and COPPA privacy protection.
          </p>
        </div>
      </div>

      {/* 4 Pillars of Safety - 2 Columns on Tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rule 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">1. In-Person School Trading Only</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Trades only happen on the La Entrada school campus during official recess or lunch periods (e.g. by the lunch benches or library tree). No swaps should ever be scheduled outside of school grounds.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">2. Squishy Nicknames Only (Zero Real Names)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students must never use their real first name, last name, or any part of their name. Gemini AI automatically checks and declines real names, asking kids to choose fun squishy nicknames like <em>FluffyPanda</em> or <em>MochiMaster</em> to keep their identity 100% private.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">3. AI Background Safety Inspector</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every photo must be a real squishy toy and must be placed on a plain, clean surface. Hyperbolic AI vision models automatically detect and block photos containing people, faces, backpacks with student names, schoolwork, or home clutter.
          </p>
        </div>

        {/* Rule 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">4. No Open Direct Messaging</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            There is zero free-form private chat. Students communicate their trade intentions using polite, pre-written school notes ("Would you like to swap squishies at recess?"). Both kids must agree before a swap is marked accepted.
          </p>
        </div>
      </div>

      {/* Helpful Photo Guidelines for Kids */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <span>📸</span>
          <span>How to Take an Approved Squishy Photo on Your Tablet:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>DO (Gets Approved Instantly):</span>
            </div>
            <ul className="space-y-1.5 text-emerald-800 list-disc list-inside leading-relaxed">
              <li>Place squishy on a plain desk, table, or solid floor.</li>
              <li>Ensure good daylight lighting so colors and textures look clear.</li>
              <li>Make sure the squishy is the only object in frame.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="font-bold text-rose-900 flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>DON'T (Will Be Blocked by AI):</span>
            </div>
            <ul className="space-y-1.5 text-rose-800 list-disc list-inside leading-relaxed">
              <li>Don't show faces, selfies, friends, or hands covering the toy.</li>
              <li>Don't have backpacks, IDs, or homework with student names.</li>
              <li>Don't upload photos of non-squish items (books, pets, electronics).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
