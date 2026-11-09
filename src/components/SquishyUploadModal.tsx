import React, { useState, useRef } from 'react';
import { Student, SquishyItem, AIInspectionResult } from '../types';
import {
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  HeartHandshake,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SquishyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  onSquishyAdded: (squish: SquishyItem) => void;
  onRequestLogin: () => void;
}

export const SQUISHY_TEXTURES = [
  { id: 'Ultra Slow-Rise', label: 'Ultra Slow-Rise (PU Memory Foam)', desc: 'Melts in hand & slowly puffs back in 5–15s' },
  { id: 'Mochi & Taba', label: 'Mochi & Taba (Soft Silicone)', desc: 'Skin-soft, flexible, silky powder feel' },
  { id: 'Jelly / Gummy', label: 'Jelly / Gummy (Translucent)', desc: 'Glossy, gelatinous, squelchy gummy squeeze' },
  { id: 'Liquid / Water Bead', label: 'Liquid / Water Bead Filled', desc: 'Clear skin with water beads or liquid core' },
  { id: 'Maltose / Dough', label: 'Maltose / Sugar Dough', desc: 'Dense clay-like heavy dough squeeze' },
  { id: 'Fast-Rising / Bouncy', label: 'Fast-Rising / Bouncy', desc: 'Springy snappy rebound, pops back instantly' },
  { id: 'Jumbo Dense Foam', label: 'Jumbo Dense Foam', desc: 'Oversized heavy foam resistance' },
  { id: 'Fuzzy & Flocked', label: 'Fuzzy & Flocked', desc: 'Velvety peach-fuzz coated surface' },
  { id: 'Scented Sweet Squishy', label: 'Scented Sweet Squishy', desc: 'Bakery, strawberry, or vanilla scented' },
  { id: 'Crunchy / Crinkly', label: 'Crunchy / Crinkly Core', desc: 'Inner crackle beads with squishy exterior' },
];

export const SquishyUploadModal: React.FC<SquishyUploadModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onSquishyAdded,
  onRequestLogin,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<AIInspectionResult | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  // Feel/texture and wishlist (Name, Color, and Condition are 100% automatically detected by AI)
  const [selectedTexture, setSelectedTexture] = useState('Ultra Slow-Rise');
  const [wishlist, setWishlist] = useState('Open to all friendly trades!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  if (!currentStudent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl">
            🧸
          </div>
          <h3 className="text-lg font-bold text-slate-900">Sign In to Add Your Squishy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please sign in with your squishy nickname and classroom before posting items to trade with classmates.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestLogin();
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setInspectionResult(null);
      setInspectionError(null);
      runAIInspection(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const runAIInspection = async (base64Data: string, mime: string) => {
    setIsInspecting(true);
    setInspectionError(null);
    setInspectionResult(null);

    try {
      const res = await fetch('/api/inspect-squish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mime,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setInspectionResult(data);
        if (data.status === 'approved') {
          if (data.detectedTexture) {
            setSelectedTexture(data.detectedTexture);
          }
          confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        setInspectionError(data.error || 'Failed to inspect image');
      }
    } catch (err: any) {
      console.error(err);
      setInspectionError('Could not contact AI safety inspector. Please try again.');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSaveSquishy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionResult || inspectionResult.status !== 'approved' || !imagePreview) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/squishies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: currentStudent.id,
          name: inspectionResult.suggestedName || 'Cute Squishy Toy',
          color: inspectionResult.detectedColor || 'Multi',
          condition: inspectionResult.detectedCondition || 'Like New',
          texture: selectedTexture,
          wishlist: wishlist.trim() || 'Open to all trades!',
          imageUrl: imagePreview,
        }),
      });

      const newSquish = await res.json();
      if (res.ok) {
        onSquishyAdded(newSquish);
        onClose();
      } else {
        setInspectionError(newSquish.error || 'Failed to add squishy');
      }
    } catch (err) {
      console.error(err);
      setInspectionError('Failed to add squishy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Tablet Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-50 via-amber-50 to-emerald-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center text-xl">
              📸
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add a Squishy to Trade</h3>
              <p className="text-xs text-slate-500">
                Snap or upload a photo · Gemini AI checks privacy & auto-detects name, color, and condition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center justify-center cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* Tablet 2-Column Body Layout */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Column 1: Photo Upload & AI Inspector */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                1. Squishy Photo (Plain background, no personal items)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/30 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group min-h-[220px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-100/70 group-hover:bg-amber-200/80 group-hover:scale-105 text-amber-700 flex items-center justify-center transition">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">
                      Tap to take photo or choose from tablet library
                    </div>
                    <div className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Place squishy on a plain desk or table with no personal items, student names, or backpacks behind it
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col items-center p-3">
                  <div className="relative w-52 h-52 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white">
                    <img
                      src={imagePreview}
                      alt="Squishy preview"
                      className="w-full h-full object-cover"
                    />
                    {isInspecting && (
                      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold p-3 text-center gap-2">
                        <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span>Hyperbolic AI Inspecting Squishy & Background...</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Choose Different Photo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Inspection Callout */}
            {inspectionResult && (
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  inspectionResult.status === 'approved'
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : inspectionResult.status === 'background_clutter'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {inspectionResult.status === 'approved' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : inspectionResult.status === 'background_clutter' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5">
                    <div className="font-bold text-xs sm:text-sm">
                      {inspectionResult.status === 'approved' && '✅ Squishy Verified & Safe!'}
                      {inspectionResult.status === 'background_clutter' && '⚠️ Background Privacy Alert'}
                      {inspectionResult.status === 'not_a_squish' && '🚫 Not a Squishy Toy'}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{inspectionResult.message}</p>
                  </div>
                </div>
              </div>
            )}

            {inspectionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {inspectionError}
              </div>
            )}
          </div>

          {/* Column 2: AI Recognized Attributes & Texture Details */}
          <div className="space-y-4">
            {!inspectionResult || inspectionResult.status !== 'approved' ? (
              <div className="h-full border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 opacity-60" />
                <div className="font-bold text-slate-600 text-xs">
                  AI Auto-Detection Station
                </div>
                <p className="text-[11px] max-w-xs text-slate-400">
                  Once your squishy photo is verified, AI will automatically detect its name, color, and condition!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSaveSquishy} className="space-y-4 animate-in fade-in duration-200">
                {/* AI Recognized Attributes Card */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>AI Recognized Squishy</span>
                      {inspectionResult.verifiedBy && (
                        <span className="text-[10px] font-normal text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          ⚡ {inspectionResult.verifiedBy}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-100/90 px-2.5 py-0.5 rounded-lg">
                      {inspectionResult.detectedCondition || 'Like New'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">
                      {inspectionResult.suggestedName || 'Cute Squishy Toy'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                      <span>
                        Color: <strong className="text-slate-800">{inspectionResult.detectedColor || 'Pastel'}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Condition: <strong className="text-slate-800">{inspectionResult.detectedCondition || 'Like New'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Texture Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>Squishy Texture & Feel</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Tap to select rebound feel</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {SQUISHY_TEXTURES.map((tex) => {
                      const isSelected = selectedTexture === tex.id;
                      return (
                        <div
                          key={tex.id}
                          onClick={() => setSelectedTexture(tex.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition text-left ${
                            isSelected
                              ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400 text-slate-900'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs leading-tight">{tex.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{tex.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Wishlist Note */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    What would you like to trade for? (Wishlist)
                  </label>
                  <input
                    type="text"
                    value={wishlist}
                    onChange={(e) => setWishlist(e.target.value)}
                    placeholder="e.g. Looking for boba, fruit, or cat squishies!"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-amber-500 outline-none text-slate-800 text-xs bg-slate-50/50 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? (
                    <span>Posting Squishy...</span>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4" />
                      <span>Post to Trading Board 🎉</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
