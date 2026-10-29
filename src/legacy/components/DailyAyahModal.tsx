import React from 'react';
import { X, Sparkles, BookOpen, Volume2, Share2, Copy, Check } from 'lucide-react';
import { Ayah, SurahMeta } from '../types/quran';

interface DailyAyahModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: {
    surahNumber: number;
    surahName: string;
    portugueseName: string;
    ayahNumber: number;
    arabicText: string;
    translation: string;
    reflection: string;
  };
  onOpenInReader: (surahNumber: number, ayahNumber: number) => void;
  onOpenTafsir: () => void;
}

export const DailyAyahModal: React.FC<DailyAyahModalProps> = ({
  isOpen,
  onClose,
  ayah,
  onOpenInReader,
  onOpenTafsir,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `Versículo do Dia (Alcorão Sagrado)\nSurata ${ayah.surahName} (${ayah.portugueseName}) ${ayah.surahNumber}:${ayah.ayahNumber}\n\n${ayah.arabicText}\n\n"${ayah.translation}"\n\nReflexão: ${ayah.reflection}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#FBF9F5] rounded-2xl border border-stone-200 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Versículo do Dia & Reflexão</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-block px-3 py-1 bg-stone-100 rounded-full text-xs font-mono font-medium text-stone-600 mb-4">
            Surata {ayah.surahName} · Versículo {ayah.ayahNumber}
          </div>

          <div className="font-arabic text-2xl sm:text-3xl text-stone-900 leading-loose mb-5 selection:bg-amber-200">
            {ayah.arabicText}
          </div>

          <p className="font-editorial text-base sm:text-lg text-stone-800 italic leading-relaxed">
            "{ayah.translation}"
          </p>

          <div className="mt-6 p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-left text-xs sm:text-sm text-stone-700 leading-relaxed font-editorial">
            <span className="font-semibold text-amber-950 block mb-1">
              Reflexão Espiritual (Tadabbur):
            </span>
            {ayah.reflection}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Versículo</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenInReader(ayah.surahNumber, ayah.ayahNumber);
                onClose();
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ler na Surata</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
