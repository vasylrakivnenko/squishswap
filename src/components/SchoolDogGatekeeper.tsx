import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Dog, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SchoolDogGatekeeperProps {
  onUnlock: () => void;
}

export const SchoolDogGatekeeper: React.FC<SchoolDogGatekeeperProps> = ({ onUnlock }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = answer.trim().toLowerCase();

    if (!cleanAnswer) {
      setError("Please type the school dog's name to enter!");
      triggerShake();
      return;
    }

    // Must be "leo"
    if (cleanAnswer === 'leo') {
      setError(null);
      setIsSuccess(true);
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
      });
      localStorage.setItem('la_entrada_dog_verified', 'true');
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setError("That's not the school dog's name! Only La Entrada students know. Ask a classmate or teacher at school! 🐕");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-amber-50 via-orange-50/50 to-pink-50/40 p-6 sm:p-10 text-slate-800">
      {/* Top Header */}
      <div className="pt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100/90 text-amber-950 rounded-full text-xs font-bold border border-amber-200 shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>La Entrada Students Only · Unofficial Squishy Trading Station</span>
        </div>
      </div>

      {/* Main Card - perfectly proportioned for Tablets */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div
          className={`bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-amber-100 text-center space-y-6 transition-transform ${
            shake ? 'translate-x-[-8px] duration-100' : ''
          }`}
        >
          {/* Dog Mascot Icon */}
          <div className="relative mx-auto w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-5xl shadow-inner border-2 border-amber-200">
            <span>🐶</span>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs font-bold">
              🐾
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
              SquishSwap
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Student-made squishy trading exclusively for La Entrada
            </p>
          </div>

          <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/90 text-left space-y-1">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              School Verification Question:
            </span>
            <p className="text-base font-bold text-slate-900">
              "What's the name of the school dog?"
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Type the school dog's name..."
                autoFocus
                autoComplete="off"
                className="w-full h-14 px-5 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-slate-900 font-bold text-center text-lg placeholder:text-slate-400 placeholder:font-normal bg-slate-50/50 focus:bg-white transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium text-left flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center">
                🎉 That's right! Leo says welcome to the SquishSwap board!
              </div>
            )}

            <button
              type="submit"
              className="w-full h-13 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-base shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter SquishSwap</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Helper Note */}
        <p className="text-xs text-center text-slate-500 mt-5 px-4 leading-relaxed">
          🐾 <em>Unofficial student club.</em> Access is limited to La Entrada students who know our school dog!
        </p>
      </div>

      {/* Footer */}
      <div className="pb-4 text-center text-xs text-slate-400">
        In-person recess trading on school premises · Zero open messaging · COPPA compliant
      </div>
    </div>
  );
};
