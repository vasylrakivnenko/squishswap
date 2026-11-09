import React from 'react';
import { SquishyItem, Student } from '../types';
import { StudentAvatar } from './StudentAvatar';
import { ArrowLeftRight, Check, Clock, Sparkles } from 'lucide-react';

interface SquishyCardProps {
  squishy: SquishyItem;
  currentStudent: Student | null;
  onOfferTrade: (squishy: SquishyItem) => void;
  onRequestLogin: () => void;
}

export const SquishyCard: React.FC<SquishyCardProps> = ({
  squishy,
  currentStudent,
  onOfferTrade,
  onRequestLogin,
}) => {
  const isMine = currentStudent?.id === squishy.ownerId;
  const isAvailable = squishy.status === 'available';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Image Container with Fallback */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100">
        <img
          src={squishy.imageUrl}
          alt={squishy.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Status badges */}
        {squishy.status === 'traded' && (
          <div className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Traded</span>
          </div>
        )}
        {squishy.status === 'trade_pending' && (
          <div className="absolute top-2.5 right-2.5 bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </div>
        )}

        {/* Condition tag */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs border border-slate-200/60">
          {squishy.condition || 'Like New'}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm leading-snug truncate group-hover:text-amber-800 transition-colors">
            {squishy.name}
          </h3>

          {/* Clean Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center flex-wrap gap-x-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 truncate max-w-[130px]">{squishy.texture}</span>
            <span aria-hidden="true">·</span>
            <span>{squishy.color}</span>
          </div>

          {/* Wishlist note */}
          <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2 rounded-xl border border-amber-100/80 truncate">
            <span className="font-bold text-amber-900">Want:</span>{' '}
            <span>{squishy.wishlist}</span>
          </div>
        </div>

        {/* Owner & Trade Button */}
        <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <StudentAvatar
              seed={squishy.ownerName.toLowerCase()}
              name={squishy.ownerName}
              size="sm"
              showOnlineStatus
              isOnline={squishy.isOwnerOnline}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                <span className="truncate">{squishy.ownerName}</span>
                {squishy.isOwnerOnline && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online now" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{squishy.ownerClassroom}</div>
            </div>
          </div>

          {/* Touch-Friendly Action Button */}
          {isMine ? (
            <div className="w-full h-10 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl flex items-center justify-center">
              Your Squishy
            </div>
          ) : (
            <button
              onClick={() => {
                if (!currentStudent) {
                  onRequestLogin();
                } else {
                  onOfferTrade(squishy);
                }
              }}
              disabled={!isAvailable}
              className={`w-full min-h-[42px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isAvailable
                  ? 'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Offer Swap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
