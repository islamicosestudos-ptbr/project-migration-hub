import React, { useState } from 'react';
import { QURAN_THEMES } from '../data/tafsirThemes';
import { QuranTheme } from '../types/quran';
import {
  Compass,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ThematicExplorerProps {
  onJumpToVerse: (surahNumber: number, ayahNumber: number) => void;
  onOpenTafsirForRef: (surahNumber: number, ayahNumber: number) => void;
}

export const ThematicExplorer: React.FC<ThematicExplorerProps> = ({
  onJumpToVerse,
  onOpenTafsirForRef,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(QURAN_THEMES[0]!.id);

  const activeTheme = QURAN_THEMES.find((t) => t.id === selectedThemeId) || QURAN_THEMES[0]!;

  const getThemeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-4 h-4 text-amber-800 dark:text-amber-300" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-300" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-amber-800 dark:text-amber-300" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-amber-800 dark:text-amber-300" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-800 dark:text-amber-300" />;
      default:
        return <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-300" />;
    }
  };

  return (
    <div className="thematic-explorer max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="pb-6 border-b border-stone-200 dark:border-slate-800">
        <h2 className="text-2xl font-display font-semibold text-stone-900 dark:text-slate-100">
          Índice Temático & Estudos do Alcorão
        </h2>
        <p className="mt-1 text-sm font-editorial text-stone-600 dark:text-slate-300">
          Navegue pelas grandes diretrizes corânicas organizadas por assuntos fundamentais da fé, filosofia e ética de vida.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Theme Picker Tabs */}
        <div className="space-y-2 lg:col-span-1">
          <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
            Tópicos Selecionados
          </span>
          {QURAN_THEMES.map((theme) => {
            const isSelected = theme.id === activeTheme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-[#121924] border-amber-800/80 shadow-xs font-semibold text-amber-950 dark:text-amber-200'
                    : 'bg-white/60 hover:bg-white dark:bg-[#121924]/60 dark:hover:bg-[#121924] border-stone-200/90 dark:border-slate-800 text-stone-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-50 dark:bg-amber-400/10 rounded-lg">
                    {getThemeIcon(theme.iconName)}
                  </span>
                  <div>
                    <h3 className="text-xs font-medium">{theme.title}</h3>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400 font-editorial line-clamp-1">
                      {theme.verses.length} passagens
                    </p>
                  </div>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-800 dark:text-amber-300' : 'text-stone-300 dark:text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Column: Theme Details & Verses */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#121924] rounded-2xl p-6 sm:p-7 border border-stone-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
              {getThemeIcon(activeTheme.iconName)}
              <span className="uppercase tracking-widest">Estudo Temático</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-stone-900 dark:text-slate-100">
              {activeTheme.title}
            </h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-slate-300 font-editorial leading-relaxed">
              {activeTheme.description}
            </p>
          </div>

          {/* Verses List */}
          <div className="space-y-4">
            {activeTheme.verses.map((verse, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#121924] rounded-xl p-6 border border-stone-200/90 dark:border-slate-800 hover:border-amber-700/40 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-slate-300">
                    <span className="px-2 py-0.5 bg-stone-100 dark:bg-slate-800 rounded text-stone-800 dark:text-slate-200 font-mono">
                      {verse.surahNumber}:{verse.ayahNumber}
                    </span>
                    <span>Surata {verse.surahName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onOpenTafsirForRef(verse.surahNumber, verse.ayahNumber)}
                      className="text-xs text-amber-950 dark:text-amber-200 font-medium hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300" />
                      <span>Ver Tafsir Completo</span>
                    </button>

                    <button
                      onClick={() => onJumpToVerse(verse.surahNumber, verse.ayahNumber)}
                      className="text-xs text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white font-medium cursor-pointer flex items-center gap-1"
                    >
                      <span>Ler na Surata</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="font-arabic text-2xl text-stone-900 dark:text-slate-100 text-right leading-loose mb-3">
                  {verse.arabicPreview}
                </div>

                {/* Portuguese Translation */}
                <p className="font-editorial text-sm sm:text-base text-stone-800 dark:text-slate-200 italic leading-relaxed">
                  "{verse.translationPreview}"
                </p>

                {/* Thematic Commentary Note */}
                <div className="mt-4 p-3.5 bg-stone-50 dark:bg-slate-900/40 rounded-lg border border-stone-200/60 dark:border-slate-700 text-xs text-stone-700 dark:text-slate-300 leading-relaxed font-editorial">
                  <span className="font-semibold text-amber-950 dark:text-amber-200 not-italic block mb-1">
                    Significado & Reflexão Teológica:
                  </span>
                  {verse.themeNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
