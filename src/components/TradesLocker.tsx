import React, { useState } from 'react';
import { Student, TradeOffer } from '../types';
import { ArrowLeftRight, Check, X, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TradesLockerProps {
  currentStudent: Student | null;
  trades: TradeOffer[];
  onTradeResponded: (updatedTrade: TradeOffer) => void;
  onRequestLogin: () => void;
}

export const TradesLocker: React.FC<TradesLockerProps> = ({
  currentStudent,
  trades,
  onTradeResponded,
  onRequestLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl">
          🎒
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Sign In to View Your Trade Offers</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Sign in with your squishy username and classroom to review pending trade offers from other La Entrada students.
          </p>
        </div>
        <button
          onClick={onRequestLogin}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const incomingTrades = trades.filter((t) => t.toStudentId === currentStudent.id);
  const outgoingTrades = trades.filter((t) => t.fromStudentId === currentStudent.id);

  const handleResponse = async (
    tradeId: string,
    decision: 'accepted' | 'declined',
    note: string
  ) => {
    setIsProcessingId(tradeId);
    try {
      const res = await fetch(`/api/trades/${tradeId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, responseNote: note }),
      });
      const data = await res.json();
      if (res.ok) {
        if (decision === 'accepted') {
          confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
        }
        onTradeResponded(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingId(null);
    }
  };

  const listToShow = activeTab === 'incoming' ? incomingTrades : outgoingTrades;

  return (
    <div className="space-y-6">
      {/* Tablet Tab Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">My Squishy Trade Locker</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and respond to recess squishy trade proposals
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`min-h-[38px] px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'incoming'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Offers Received</span>
            {incomingTrades.filter((t) => t.status === 'pending').length > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {incomingTrades.filter((t) => t.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`min-h-[38px] px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'outgoing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Offers Sent</span>
            <span className="text-[10px] text-slate-400 font-semibold">({outgoingTrades.length})</span>
          </button>
        </div>
      </div>

      {listToShow.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 space-y-3 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl">
            🧸
          </div>
          <div className="font-bold text-slate-900 text-base">
            {activeTab === 'incoming' ? 'No trade offers received yet' : 'You haven’t sent any trade offers yet'}
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {activeTab === 'incoming'
              ? 'When classmates at La Entrada want to swap for one of your squishies, their proposals will appear here.'
              : 'Browse other students’ squishies on the main board and click "Offer Swap" to start a trade!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {listToShow.map((trade) => {
            const isIncoming = activeTab === 'incoming';
            const isPending = trade.status === 'pending';

            return (
              <div
                key={trade.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition hover:shadow-xs ${
                  trade.status === 'accepted'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : trade.status === 'declined'
                    ? 'border-slate-200 opacity-70'
                    : 'border-amber-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Visual Swap Preview */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Offered squishy */}
                    <div className="text-center w-28">
                      <img
                        src={trade.offeredSquishyImageUrl}
                        alt={trade.offeredSquishyName}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-slate-50 mx-auto shadow-2xs"
                      />
                      <div className="text-xs font-bold text-slate-900 mt-1.5 truncate">
                        {trade.offeredSquishyName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        From {trade.fromStudentName}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center px-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 mt-1">Swap</span>
                    </div>

                    {/* Target squishy */}
                    <div className="text-center w-28">
                      <img
                        src={trade.targetSquishyImageUrl}
                        alt={trade.targetSquishyName}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-slate-50 mx-auto shadow-2xs"
                      />
                      <div className="text-xs font-bold text-slate-900 mt-1.5 truncate">
                        {trade.targetSquishyName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        To {trade.toStudentName}
                      </div>
                    </div>
                  </div>

                  {/* Middle Note & Status */}
                  <div className="flex-1 min-w-0 bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">
                        {isIncoming
                          ? `${trade.fromStudentName} (${trade.fromStudentClassroom}) asks:`
                          : `Your offer to ${trade.toStudentName}:`}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                          trade.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trade.status === 'declined'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {trade.status === 'accepted' && '🎉 Trade Accepted!'}
                        {trade.status === 'declined' && 'Offer Declined'}
                        {trade.status === 'pending' && 'Awaiting Response'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 italic">"{trade.presetMessage}"</p>

                    {trade.responseNote && (
                      <div className="pt-2 border-t border-slate-200/60 text-xs font-medium text-emerald-800">
                        Reply: "{trade.responseNote}"
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  {isIncoming && isPending && (
                    <div className="flex flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto">
                      <button
                        onClick={() =>
                          handleResponse(
                            trade.id,
                            'accepted',
                            'Yes! Let’s swap at recess by the benches! 🎉'
                          )
                        }
                        disabled={isProcessingId === trade.id}
                        className="flex-1 lg:flex-none min-h-[42px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Swap!</span>
                      </button>

                      <button
                        onClick={() =>
                          handleResponse(
                            trade.id,
                            'declined',
                            'Thanks for the offer, but looking for something else right now!'
                          )
                        }
                        disabled={isProcessingId === trade.id}
                        className="flex-1 lg:flex-none min-h-[42px] px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
