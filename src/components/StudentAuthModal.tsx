import React, { useState } from 'react';
import { Student } from '../types';
import { StudentAvatar, AVAILABLE_AVATARS } from './StudentAvatar';
import { ShieldAlert, UserCheck, Dices, ShieldCheck } from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  allStudents?: Student[];
  onLogin: (student: Student) => void;
}

const FUN_USERNAME_STARTERS = ['Fluffy', 'Mochi', 'SuperSlow', 'Galaxy', 'Boba', 'Berry', 'Rainbow', 'Velvet', 'Pastel', 'Jelly'];
const FUN_USERNAME_NOUNS = ['Panda', 'Cat', 'Bunny', 'Bear', 'Donut', 'Boba', 'Fox', 'Squish', 'Roll', 'Cloud'];

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onLogin,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [classInput, setClassInput] = useState('Room 14 · 4th Grade');
  const [avatarSeed, setAvatarSeed] = useState('panda');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateRandomUsername = () => {
    const starter = FUN_USERNAME_STARTERS[Math.floor(Math.random() * FUN_USERNAME_STARTERS.length)];
    const noun = FUN_USERNAME_NOUNS[Math.floor(Math.random() * FUN_USERNAME_NOUNS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    const generated = `${starter}${noun}${num}`;
    setUsernameInput(generated);
    setRejectionMessage(null);
    setSuggestedUsernames([]);
  };

  const handleSignUpOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRejectionMessage(null);
    setApprovalMessage(null);
    setSuggestedUsernames([]);

    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setRejectionMessage('Please choose a squishy nickname!');
      return;
    }

    setIsCheckingUsername(true);

    try {
      const checkRes = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });
      const checkData = await checkRes.json();

      if (!checkData.isValid || checkData.isRealName) {
        setRejectionMessage(
          checkData.message ||
            'Please do NOT use your real name, first name, or last name! Choose a fun squishy nickname instead to protect your privacy. 🔒'
        );
        if (checkData.suggestions && checkData.suggestions.length > 0) {
          setSuggestedUsernames(checkData.suggestions);
        } else {
          setSuggestedUsernames(['MochiMaster', 'FluffyPanda', 'GalaxySquish']);
        }
        setIsCheckingUsername(false);
        return;
      }

      const finalUsername = checkData.sanitizedUsername || trimmed;
      setApprovalMessage('Awesome squishy nickname! Safe & approved! ✨');

      const loginRes = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalUsername,
          classroom: classInput.trim(),
          avatarSeed,
        }),
      });

      const loginData = await loginRes.json();
      if (loginData.student) {
        setTimeout(() => {
          onLogin(loginData.student);
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error(err);
      onLogin({
        id: `student-local-${Date.now()}`,
        name: trimmed,
        classroom: classInput,
        avatarSeed,
        isOnline: true,
        lastActive: Date.now(),
      });
      onClose();
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const popularClasses = [
    'Room 14 · 4th Grade',
    'Room 11 · 3rd Grade',
    'Room 12 · 3rd Grade',
    'Room 18 · 5th Grade',
    'Room 19 · 5th Grade',
    'Room 8 · 2nd Grade',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Tablet Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center text-2xl">
              🎒
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentStudent ? 'Student Account Profile' : 'Choose a Squishy Nickname'}
              </h3>
              <p className="text-xs text-slate-500">
                Strict privacy · Never use your real first or last name
              </p>
            </div>
          </div>
          {currentStudent && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold flex items-center justify-center cursor-pointer transition"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Prominent Privacy Alert */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>STRICT PRIVACY RULE: No Real Names</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Do <strong>NOT</strong> enter your real name, first name, last name, or initials. Choose a playful squishy nickname instead (e.g. <em>FluffyPanda</em>, <em>MochiMaster</em>, <em>BobaCat</em>). Gemini AI verifies all entries to protect student safety.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUpOrLogin} className="space-y-4">
            {/* Username Input with Generator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Squishy Nickname (Username)
                </label>
                <button
                  type="button"
                  onClick={generateRandomUsername}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Generate Fun Idea</span>
                </button>
              </div>

              <input
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (rejectionMessage) setRejectionMessage(null);
                }}
                placeholder="e.g. MochiHero or BobaQueen"
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-slate-900 font-bold text-sm bg-slate-50/50 focus:bg-white transition"
                disabled={isCheckingUsername}
              />
            </div>

            {/* AI Real-Name Rejection */}
            {rejectionMessage && (
              <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-900 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-semibold text-xs leading-relaxed">{rejectionMessage}</p>
                </div>

                {suggestedUsernames.length > 0 && (
                  <div className="pt-2 border-t border-rose-200">
                    <span className="text-xs font-bold text-rose-800 block mb-1.5">
                      Tap one of these safe suggested nicknames:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestedUsernames.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setUsernameInput(sug);
                            setRejectionMessage(null);
                            setSuggestedUsernames([]);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-800 font-bold text-xs rounded-xl border border-rose-300 shadow-2xs transition cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {approvalMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{approvalMessage}</span>
              </div>
            )}

            {/* Classroom */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Your Classroom at La Entrada
              </label>
              <select
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-amber-500 outline-none text-slate-800 bg-white text-xs font-medium cursor-pointer"
                disabled={isCheckingUsername}
              >
                {popularClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other Class · La Entrada">Other Classroom · La Entrada</option>
              </select>
            </div>

            {/* Mascot Avatar */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Pick Your Mascot Avatar
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                {AVAILABLE_AVATARS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setAvatarSeed(seed)}
                    className={`p-1.5 rounded-2xl border-2 transition cursor-pointer shrink-0 ${
                      avatarSeed === seed
                        ? 'border-amber-500 bg-amber-50 scale-105 shadow-2xs'
                        : 'border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <StudentAvatar seed={seed} name={seed} size="md" />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCheckingUsername}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              {isCheckingUsername ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Checking Nickname Privacy...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>{currentStudent ? 'Save Profile' : 'Create Nickname & Enter'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
