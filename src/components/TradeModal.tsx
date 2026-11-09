import React, { useState } from 'react';
import { Student, SquishyItem, TradeOffer } from '../types';
import { ArrowLeftRight, AlertCircle, Plus, Check, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSquishy: SquishyItem | null;
  currentStudent: Student | null;
  mySquishies: SquishyItem[];
  onTradeProposed: (trade: TradeOffer) => void;
  onOpenUpload: () => void;
}

const PRESET_MESSAGES = [
  'Would you like to swap squishies at recess near the big oak tree? 🌳',
  'I love your squishy! Want to trade at lunchtime by the picnic benches? 🍱',
  'I have this slow-rise squishy you might like! Let\'s swap tomorrow! ✨',
  'Would love to trade squishies with you after school near the front gate! 🎒',
];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  targetSquishy,
  currentStudent,
  mySquishies,
  onTradeProposed,
  onOpenUpload,
}) => {
  const [selectedMySquishyId, setSelectedMySquishyId] = useState<string>('');
  const [selectedPresetMessage, setSelectedPresetMessage] = useState<string>(PRESET_MESSAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !targetSquishy || !currentStudent) return null;

  const availableSquishies = mySquishies.filter((s) => s.status === 'available');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMySquishyId) {
      setErrorMessage('Please pick one of your squishies to offer in trade!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStudentId: currentStudent.id,
          offeredSquishyId: selectedMySquishyId,
          toStudentId: targetSquishy.ownerId,
          targetSquishyId: targetSquishy.id,
          presetMessage: selectedPresetMessage,
        }),
      });

      const trade = await res.json();
      if (res.ok) {
        confetti({ particleCount: 45, spread: 75, origin: { y: 0.6 } });
        onTradeProposed(trade);
        onClose();
      } else {
        setErrorMessage(trade.error || 'Failed to propose trade');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to send trade offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Tablet Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center text-2xl">
              🤝
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Propose a Squishy Swap</h3>
              <p className="text-xs text-slate-500">
                Trading with {targetSquishy.ownerName} ({targetSquishy.ownerClassroom})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Target Squishy & Pre-approved Meeting Note */}
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Squishy You Want to Receive:
              </span>

              {/* Showcase Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-4 items-center">
                <img
                  src={targetSquishy.imageUrl}
                  alt={targetSquishy.name}
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    {targetSquishy.condition || 'Like New'}
                  </div>
                  <h4 className="font-bold text-slate-900 text-base truncate">
                    {targetSquishy.name}
                  </h4>
                  <div className="text-xs text-slate-600">
                    {targetSquishy.texture} · {targetSquishy.color}
                  </div>
                  {targetSquishy.wishlist && (
                    <div className="text-[11px] text-slate-500 bg-white p-1.5 rounded-lg border border-slate-200 mt-1 truncate">
                      <strong>Looking for:</strong> {targetSquishy.wishlist}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Child-Safe Pre-written Meeting Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Safe Recess Swap Message (Pre-approved):
              </label>
              <div className="space-y-2">
                {PRESET_MESSAGES.map((msg, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedPresetMessage === msg
                        ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preset_msg"
                      checked={selectedPresetMessage === msg}
                      onChange={() => setSelectedPresetMessage(msg)}
                      className="mt-0.5 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="leading-relaxed">{msg}</span>
                  </label>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>To keep all students safe, private open chat is disabled.</span>
              </div>
            </div>
          </div>

          {/* Right Column: User's Squishies & Submit CTA */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Pick Which of Your Squishies to Offer:
                </label>
                {availableSquishies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUpload();
                    }}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
                  >
                    + Add Another Squishy
                  </button>
                )}
              </div>

              {availableSquishies.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50/50 text-center space-y-3">
                  <div className="text-3xl">🧸</div>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    You don't have any squishies posted yet! Add a squishy to your locker first so you have something to trade.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUpload();
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload a Squishy First</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                  {availableSquishies.map((mySq) => {
                    const isSelected = selectedMySquishyId === mySq.id;
                    return (
                      <div
                        key={mySq.id}
                        onClick={() => setSelectedMySquishyId(mySq.id)}
                        className={`p-2.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={mySq.imageUrl}
                          alt={mySq.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {mySq.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">{mySq.texture}</div>
                          <div className="text-[9px] text-amber-800 font-medium">{mySq.condition || 'Like New'}</div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action CTA */}
            <button
              type="submit"
              disabled={isSubmitting || availableSquishies.length === 0 || !selectedMySquishyId}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-4"
            >
              {isSubmitting ? (
                'Sending Proposal...'
              ) : (
                <>
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Send Trade Offer to {targetSquishy.ownerName}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
