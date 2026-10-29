import React, { useState, useEffect, useRef } from 'react';
import { Ayah, SurahMeta, ReaderSettings, AppTheme } from '../types/quran';
import { ALL_SURAHS } from '../data/quranSurahs';
import { InlineRealTafsirView } from './InlineRealTafsirView';
import TranslationWithNotes, { stripNoteMarkers } from './TranslationWithNotes';
import VerseSourceDetails, { type VerseSourceCitation } from './VerseSourceDetails';
import {
  fetchRealAsbab,
  fetchRealHelmiNasr,
  fetchRealIbnKathir,
} from '../services/realTafsirApi';
import {
  Play,
  Pause,
  BookOpen,
  Bookmark as BookmarkIcon,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Volume2,
  FileText,
  Moon,
  Sun,
  Contrast,
  Sliders,
  Eye,
  EyeOff,
  Type,
  Split,
  Brain,
  AlignLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface QuranReaderProps {
  surah: SurahMeta;
  ayahs: Ayah[];
  isLoading: boolean;
  loadError?: string | null;
  onRetryLoad?: () => void;
  activeAyahNumber: number | null;
  isPlayingAudio: boolean;
  settings: ReaderSettings;
  onSelectAyahForTafsir: (ayah: Ayah) => void;
  onPlayAyah: (ayah: Ayah) => void;
  onTogglePlaySurah: () => void;
  onSaveBookmark: (ayah: Ayah) => void;
  isAyahBookmarked: (ayahNumber: number) => boolean;
  onNavigateSurah: (surahNumber: number) => void;
  onChangeTranslation: (trans: 'pt.nasr' | 'pt.elhayek') => void;
  onQuickUpdateSettings?: (updates: Partial<ReaderSettings>) => void;
  onOpenSettings?: () => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  surah,
  ayahs,
  isLoading,
  loadError,
  onRetryLoad,
  activeAyahNumber,
  isPlayingAudio,
  settings,
  onSelectAyahForTafsir,
  onPlayAyah,
  onTogglePlaySurah,
  onSaveBookmark,
  isAyahBookmarked,
  onNavigateSurah,
  onChangeTranslation,
  onQuickUpdateSettings,
  onOpenSettings,
}) => {
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const [showInlineTafsir, setShowInlineTafsir] = useState<boolean>(false);
  const [revealedHifzAyahs, setRevealedHifzAyahs] = useState<Set<number>>(new Set());
  const [expandedTafsirs, setExpandedTafsirs] = useState<Set<number>>(new Set());
  const activeAyahRef = useRef<HTMLDivElement | null>(null);

  const isDark = settings.theme === 'dark';
  const isHighContrast = settings.theme === 'highContrast';

  const toggleHifzReveal = (num: number) => {
    setRevealedHifzAyahs((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  const toggleTafsirExpand = (num: number) => {
    setExpandedTafsirs((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  // Auto-scroll when active ayah changes during audio playback
  useEffect(() => {
    if (activeAyahNumber && activeAyahRef.current) {
      activeAyahRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeAyahNumber]);

  const handleCopy = (ayah: Ayah) => {
    const textToCopy = `${ayah.arabicText}\n\n"${stripNoteMarkers(ayah.translation)}"\n(Alcorão Sagrado, Surata ${surah.transliteration} ${surah.number}:${ayah.numberInSurah} - Tradução ${
      settings.translationId === 'pt.nasr' ? 'Helmi Nasr' : 'Samir El-Hayek'
    })`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyahNumber(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNumber(null), 2500);
  };

  const hasBismillah = surah.number !== 1 && surah.number !== 9;
  const verseReference = (ayahNumber: number) =>
    settings.verseReferenceStyle === 'generic'
      ? `Versículo ${surah.number}:${ayahNumber}`
      : `${surah.transliteration} · ${surah.number}:${ayahNumber}`;

  const createQuranCitations = (ayah: Ayah): VerseSourceCitation[] => {
    const provenance = ayah.sourceProvenance;
    const reference = `${surah.number}:${ayah.numberInSurah}`;
    const citations: VerseSourceCitation[] = [];

    if (provenance?.quranText === 'alqurancloud:quran-uthmani') {
      citations.push({
        category: 'Texto corânico original',
        title: 'Uthmani',
        author: '',
        editionVersion: 'Identificador da API: quran-uthmani',
        platform: 'AlQuran Cloud',
        verseReference: reference,
        url: `https://api.alquran.cloud/v1/ayah/${ayah.number}/quran-uthmani`,
      });
    } else if (provenance?.quranText === 'local:bundled') {
      citations.push({
        category: 'Texto corânico original',
        title: 'Texto árabe incluído no aplicativo',
        author: '',
        editionVersion: '',
        platform: 'Dados locais do aplicativo',
        verseReference: reference,
        url: '',
        note: 'A edição bibliográfica não foi registrada nos dados locais.',
      });
    }

    const translationSourceIds = settings.sideBySideTranslation
      ? provenance?.translations || []
      : settings.translationId === 'pt.nasr'
        ? ['quranenc:portuguese_nasr']
        : ['alqurancloud:pt.elhayek'];

    for (const sourceId of translationSourceIds) {
      if (sourceId === 'quranenc:portuguese_nasr') {
        citations.push({
          category: 'Tradução em português',
          title: 'Portuguese Translation - Helmi Nasr',
          author: 'Dr. Helmi Nasr (tradutor)',
          editionVersion: 'Versão 1.4.1 do catálogo QuranEnc (identificador: portuguese_nasr)',
          platform: 'QuranEnc',
          verseReference: reference,
          url: `https://quranenc.com/en/browse/portuguese_nasr/${surah.number}`,
          note: 'Desenvolvida sob supervisão do Rowwad Translation Center, segundo o catálogo QuranEnc. As notas numeradas no texto são do tradutor.',
        });
      } else if (sourceId === 'alqurancloud:pt.elhayek') {
        citations.push({
          category: 'Tradução em português',
          title: 'El-Hayek',
          author: 'Samir El-Hayek',
          editionVersion: 'Identificador da edição: pt.elhayek',
          platform: 'AlQuran Cloud',
          verseReference: reference,
          url: `https://api.alquran.cloud/v1/ayah/${ayah.number}/pt.elhayek`,
        });
      } else if (sourceId === 'local:bundled') {
        citations.push({
          category: 'Tradução em português',
          title: 'Tradução local do aplicativo',
          author: '',
          editionVersion: '',
          platform: 'Dados locais do aplicativo',
          verseReference: reference,
          url: '',
          note: 'Autoria e edição não foram registradas nos dados locais.',
        });
      }
    }

    if (ayah.transliteration?.trim() && provenance?.transliteration === 'alqurancloud:en.transliteration') {
      citations.push({
        category: 'Transliteração',
        title: 'English Transliteration',
        author: '',
        editionVersion: 'Identificador da API: en.transliteration; idioma indicado: inglês',
        platform: 'AlQuran Cloud',
        verseReference: reference,
        url: `https://api.alquran.cloud/v1/ayah/${ayah.number}/en.transliteration`,
        note: 'A base identifica esta transliteração como edição em inglês.',
      });
    } else if (ayah.transliteration?.trim() && provenance?.transliteration === 'local:bundled') {
      citations.push({
        category: 'Transliteração',
        title: 'Transliteração local do aplicativo',
        author: '',
        editionVersion: '',
        platform: 'Dados locais do aplicativo',
        verseReference: reference,
        url: '',
        note: 'A fonte bibliográfica da transliteração não foi registrada nos dados locais.',
      });
    }

    return citations;
  };

  // Spacing class calculation for dyslexia and visual comfort
  const getSpacingClass = () => {
    switch (settings.verseSpacing) {
      case 'compact':
        return 'space-y-4';
      case 'spacious':
        return 'space-y-10';
      case 'dyslexic':
        return 'space-y-14';
      case 'normal':
      default:
        return 'space-y-6';
    }
  };

  // Card theme classes with Reading Ruler highlight
  const getCardThemeClass = (isCurrentPlaying: boolean) => {
    const rulerClass = settings.readingRuler && isCurrentPlaying
      ? 'border-l-4 border-l-amber-500 ring-2 ring-amber-500/30'
      : '';

    if (isHighContrast) {
      return `${
        isCurrentPlaying
          ? 'bg-black text-white border-2 border-yellow-400 ring-2 ring-yellow-400 shadow-xl'
          : 'bg-black text-white border-2 border-yellow-400/80 hover:border-yellow-300'
      } ${rulerClass}`;
    }
    if (isDark) {
      return `${
        isCurrentPlaying
          ? 'bg-[#151e2b] text-slate-100 border border-amber-500/70 shadow-lg'
          : 'bg-[#121924] text-slate-200 border border-slate-800/90 hover:border-slate-700 shadow-xs'
      } ${rulerClass}`;
    }
    // Paper or Light
    return `${
      isCurrentPlaying
        ? 'bg-amber-50/25 text-stone-900 border-amber-600 shadow-md'
        : 'bg-white text-stone-900 border-stone-200/90 hover:border-stone-300 shadow-xs'
    } ${rulerClass}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* QUICK ACCESSIBILITY & READING COMFORT BAR */}
      <aside
        aria-label="Barra de Conforto Visual e Acessibilidade"
        className={`mb-6 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
          isHighContrast
            ? 'bg-black border-2 border-yellow-400 text-yellow-300'
            : isDark
            ? 'bg-[#161f2c] border-slate-700 text-slate-300'
            : 'bg-white/80 border-stone-200 text-stone-700'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[11px] uppercase tracking-wider opacity-75">
            Conforto:
          </span>

          {/* Quick theme toggles */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-current/10">
            <button
              onClick={() => onQuickUpdateSettings?.({ theme: 'paper' })}
              title="Modo Papiro Arquivístico"
              className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                settings.theme === 'paper' ? 'bg-amber-100 text-amber-950 font-bold shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Papiro
            </button>
            <button
              onClick={() => onQuickUpdateSettings?.({ theme: 'dark' })}
              title="Modo Noturno (Leitura antes de dormir)"
              className={`px-2 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1 ${
                settings.theme === 'dark' ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Noturno</span>
            </button>
            <button
              onClick={() => onQuickUpdateSettings?.({ theme: 'highContrast' })}
              title="Modo Alto Contraste (Baixa Visão)"
              className={`px-2 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-1 ${
                settings.theme === 'highContrast' ? 'bg-yellow-400 text-black font-bold shadow-xs' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Contrast className="w-3 h-3" />
              <span>Alto Contraste</span>
            </button>
          </div>

          {/* Quick study mode switches */}
          <div className="flex items-center gap-1 pl-1 border-l border-current/20">
            <button
              onClick={() => onQuickUpdateSettings?.({ sideBySideTranslation: !settings.sideBySideTranslation })}
              title="Comparar Dr. Helmi Nasr e Samir El-Hayek lado a lado"
              className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                settings.sideBySideTranslation
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-500 shadow-xs'
                  : 'border-current/15 hover:bg-current/10 opacity-80'
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Comparar 2 Traduções</span>
            </button>

            <button
              onClick={() => onQuickUpdateSettings?.({ hifzMode: !settings.hifzMode, hifzRevealedAyahs: [] })}
              title="Modo Hifz: Oculta o árabe para você testar sua memória"
              className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                settings.hifzMode
                  ? 'bg-purple-600 text-white font-bold border-purple-500 shadow-xs'
                  : 'border-current/15 hover:bg-current/10 opacity-80'
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>{settings.hifzMode ? 'Hifz Ativo' : 'Modo Hifz'}</span>
            </button>

            <button
              onClick={() => onQuickUpdateSettings?.({ readingRuler: !settings.readingRuler })}
              title="Linha-guia de leitura suave no versículo ativo"
              className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                settings.readingRuler
                  ? 'bg-amber-600/20 text-amber-600 font-bold border-amber-500/40 shadow-xs'
                  : 'border-current/15 hover:bg-current/10 opacity-70'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>Linha-Guia</span>
            </button>
          </div>
        </div>

        {/* Quick Font Size Adjusters & Open full accessibility modal */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="opacity-70 text-[11px] mr-1">Tamanho:</span>
            <button
              onClick={() =>
                onQuickUpdateSettings?.({
                  arabicFontSize: Math.max(22, settings.arabicFontSize - 2),
                  translationFontSize: Math.max(14, settings.translationFontSize - 1),
                })
              }
              title="Diminuir fonte geral"
              className="w-7 h-7 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              A-
            </button>
            <button
              onClick={() =>
                onQuickUpdateSettings?.({
                  arabicFontSize: Math.min(56, settings.arabicFontSize + 2),
                  translationFontSize: Math.min(28, settings.translationFontSize + 1),
                })
              }
              title="Aumentar fonte geral"
              className="w-7 h-7 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              A+
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1.5 rounded-lg border border-current/20 hover:bg-current/10 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Mais Opções</span>
          </button>
        </div>
      </aside>

      {/* Surah Header Card */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-xs mb-8 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-2 border-yellow-400'
            : isDark
            ? 'bg-[#151e2b] text-slate-100 border border-slate-800'
            : 'bg-white text-stone-900 border border-stone-200/90'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-current/10">
          <div>
            <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
              <span>Surata {surah.number}</span>
              <span aria-hidden="true">·</span>
              <span>{surah.revelationType}</span>
              <span aria-hidden="true">·</span>
              <span>{surah.totalAyahs} Versículos</span>
              <span aria-hidden="true">·</span>
              <span>Juz {surah.juzStart}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-semibold flex items-center gap-3">
              <span>{surah.transliteration}</span>
              <span className="text-lg font-normal opacity-75 font-editorial">
                — {surah.portugueseName}
              </span>
            </h1>

            <p className="mt-2 text-xs sm:text-sm opacity-85 font-editorial max-w-2xl leading-relaxed">
              {surah.summary}
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span
              className={`font-arabic text-4xl sm:text-5xl font-normal font-arabic-${settings.arabicFont || 'amiriQuran'}`}
              style={{ color: isHighContrast ? '#fde047' : isDark ? '#fef3c7' : '#451a03' }}
            >
              {surah.name}
            </span>

            {/* Translation Edition Selector */}
            <div className="mt-3 flex items-center gap-1.5 text-xs opacity-85">
              <span className="opacity-60">Tradução:</span>
              <select
                value={settings.translationId}
                onChange={(e) => onChangeTranslation(e.target.value as any)}
                className={`rounded-md px-2 py-1 text-xs font-medium focus:outline-none cursor-pointer border ${
                  isHighContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : isDark
                    ? 'bg-slate-900 text-slate-200 border-slate-700'
                    : 'bg-stone-100 text-stone-800 border-stone-300'
                }`}
              >
                <option value="pt.nasr">Dr. Helmi Nasr (Complexo Rei Fahd)</option>
                <option value="pt.elhayek">Samir El-Hayek</option>
              </select>
            </div>
          </div>
        </div>

        {/* Surah Navigation Ribbon & Play All */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => surah.number > 1 && onNavigateSurah(surah.number - 1)}
              disabled={surah.number <= 1}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                surah.number <= 1
                  ? 'opacity-30 cursor-not-allowed border-current/10'
                  : 'hover:bg-current/10 border-current/20'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {/* Quick dropdown for all 114 Surahs */}
            <select
              value={surah.number}
              onChange={(e) => onNavigateSurah(Number(e.target.value))}
              className={`px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none cursor-pointer ${
                isHighContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : isDark
                  ? 'bg-slate-900 text-slate-200 border-slate-700'
                  : 'bg-white text-stone-800 border-stone-200'
              }`}
            >
              {ALL_SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.transliteration} ({s.portugueseName})
                </option>
              ))}
            </select>

            <button
              onClick={() => surah.number < 114 && onNavigateSurah(surah.number + 1)}
              disabled={surah.number >= 114}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                surah.number >= 114
                  ? 'opacity-30 cursor-not-allowed border-current/10'
                  : 'hover:bg-current/10 border-current/20'
              }`}
            >
              <span>Próxima</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowInlineTafsir(!showInlineTafsir)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                showInlineTafsir
                  ? 'bg-amber-500 text-black border-amber-600 shadow-xs'
                  : 'border-current/20 hover:bg-current/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showInlineTafsir ? 'Ocultar Tafsir Integrado' : 'Exibir Tafsir Completo nos Versículos'}</span>
            </button>

            <button
              onClick={onTogglePlaySurah}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Ouvir Surata</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bismillah Banner for non-Tawbah surahs */}
        {hasBismillah && (
          <div
            className={`mt-8 text-center py-4 rounded-xl border ${
              isHighContrast
                ? 'bg-black border-yellow-400 text-yellow-300'
                : isDark
                ? 'bg-[#182332] border-slate-700/80 text-amber-200'
                : 'bg-amber-50/40 border-amber-200/50 text-stone-800'
            }`}
          >
            <p className={`font-arabic text-3xl sm:text-4xl font-arabic-${settings.arabicFont || 'amiriQuran'}`}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="mt-2 text-xs opacity-75 font-editorial italic">
              "Em nome de Deus, o Clemente, o Misericordioso"
            </p>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`rounded-xl p-6 border animate-pulse space-y-4 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="h-6 bg-current/15 rounded w-1/4"></div>
              <div className="h-10 bg-current/10 rounded w-full"></div>
              <div className="h-4 bg-current/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && loadError && (
        <div
          role="alert"
          className={`rounded-xl border p-5 ${
            isHighContrast
              ? 'bg-black border-2 border-yellow-400 text-white'
              : isDark
              ? 'bg-slate-900 border-red-400/50 text-slate-100'
              : 'bg-white border-red-300 text-stone-900'
          }`}
        >
          <p className="font-semibold">Não foi possível carregar a tradução desta surata.</p>
          <p className="mt-2 text-sm opacity-80">{loadError}</p>
          <button
            type="button"
            onClick={onRetryLoad}
            className={`mt-4 rounded-lg border px-4 py-2 text-sm font-semibold ${
              isHighContrast
                ? 'border-yellow-300 text-yellow-200 hover:bg-yellow-300/15'
                : 'border-current/30 hover:bg-current/10'
            }`}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Ayahs Stream with Adjustable Spacing & Accessibility */}
      {!isLoading && !loadError && (
        <div className={getSpacingClass()}>
          {ayahs.map((ayah) => {
            const isCurrentPlaying = activeAyahNumber === ayah.number;
            const bookmarked = isAyahBookmarked(ayah.number);
            const loadExtraCitations = async (): Promise<VerseSourceCitation[]> => {
              const results = await Promise.allSettled([
                fetchRealHelmiNasr(surah.number, ayah.numberInSurah),
                fetchRealIbnKathir(surah.number, ayah.numberInSurah),
                fetchRealAsbab(surah.number, ayah.numberInSurah),
              ]);
              const helmi = results[0].status === 'fulfilled' ? results[0].value : null;
              const ibnKathir = results[1].status === 'fulfilled' ? results[1].value : null;
              const asbab = results[2].status === 'fulfilled' ? results[2].value : null;
              if (!helmi && !ibnKathir && !asbab) {
                throw new Error('Não foi possível consultar as fontes adicionais.');
              }

              const reference = `${surah.number}:${ayah.numberInSurah}`;
              const extraCitations: VerseSourceCitation[] = [];
              if (helmi?.hasFootnotes && helmi.footnotes.trim()) {
                extraCitations.push({
                  category: 'Notas da tradução',
                  title: 'Portuguese Translation - Helmi Nasr (notas do tradutor)',
                  author: 'Dr. Helmi Nasr (tradutor)',
                  editionVersion: 'Versão 1.4.1 do catálogo QuranEnc (identificador: portuguese_nasr)',
                  platform: 'QuranEnc',
                  verseReference: reference,
                  url: `https://quranenc.com/en/browse/portuguese_nasr/${surah.number}`,
                  note: 'A referência complementar foi retornada pela API para este versículo.',
                });
              }
              if (ibnKathir?.hasText && ibnKathir.text.trim()) {
                extraCitations.push({
                  category: 'Exegese',
                  title: ibnKathir.work || 'Tafsir Ibn Kathir',
                  author: ibnKathir.author,
                  editionVersion: ibnKathir.editionVersion,
                  platform: ibnKathir.source,
                  verseReference: reference,
                  url: ibnKathir.sourceUrl,
                  note: `Texto consultado em inglês${ibnKathir.language ? ` (${ibnKathir.language})` : ''}.`,
                });
              }
              if (asbab?.hasContext && asbab.text.trim()) {
                extraCitations.push({
                  category: 'Circunstâncias da revelação',
                  title: asbab.work,
                  author: asbab.author,
                  editionVersion: asbab.editionVersion,
                  platform: asbab.source,
                  verseReference: reference,
                  url: asbab.sourceUrl,
                  note: 'Registro específico retornado para este versículo.',
                });
              } else if (asbab?.availability === 'not-found') {
                extraCitations.push({
                  category: 'Circunstâncias da revelação',
                  title: 'Nenhuma entrada localizada nesta coleção',
                  author: '',
                  editionVersion: 'Coleção: en-asbab-al-nuzul-by-al-wahidi',
                  platform: asbab.source,
                  verseReference: reference,
                  url: asbab.sourceUrl,
                  note: 'A coleção não retornou texto para esta referência. Isso não comprova ausência em outras obras.',
                });
              } else if (asbab?.availability === 'unavailable') {
                extraCitations.push({
                  category: 'Circunstâncias da revelação',
                  title: 'Consulta indisponível',
                  author: '',
                  editionVersion: 'Coleção: en-asbab-al-nuzul-by-al-wahidi',
                  platform: asbab.source,
                  verseReference: reference,
                  url: asbab.sourceUrl,
                  note: 'Não foi possível confirmar se há uma entrada específica para esta referência.',
                });
              }
              return extraCitations;
            };

            return (
              <article
                key={ayah.number}
                ref={isCurrentPlaying ? activeAyahRef : null}
                className={`group relative rounded-2xl p-6 sm:p-7 border transition-all duration-200 ${getCardThemeClass(
                  isCurrentPlaying
                )} ${
                  settings.verseSpacing === 'dyslexic'
                    ? 'p-8 sm:p-9 shadow-md border-2'
                    : ''
                }`}
              >
                {/* Header ribbon of the Ayah */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-current/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${
                        isHighContrast
                          ? 'border-yellow-400 bg-yellow-400 text-black'
                          : isDark
                          ? 'border-slate-700 bg-slate-800 text-amber-300'
                          : 'border-stone-200 bg-stone-100 text-stone-700'
                      }`}
                    >
                      {ayah.numberInSurah}
                    </span>
                    <span className={`text-xs ${isHighContrast ? 'text-white' : 'opacity-60'}`}>
                      {verseReference(ayah.numberInSurah)}
                    </span>
                    {ayah.sajda && (
                      <span className="text-xs font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">
                        Prostração (Sajdah)
                      </span>
                    )}
                  </div>

                  {/* Quick actions right aligned */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPlayAyah(ayah)}
                      title="Ouvir este versículo"
                      className="p-1.5 opacity-60 hover:opacity-100 hover:bg-current/10 rounded-md transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSaveBookmark(ayah)}
                      title={bookmarked ? 'Remover dos salvos' : 'Salvar com reflexão'}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        bookmarked
                          ? 'text-amber-500 bg-amber-500/20'
                          : 'opacity-60 hover:opacity-100 hover:bg-current/10'
                      }`}
                    >
                      <BookmarkIcon className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleCopy(ayah)}
                      title="Copiar texto e referência"
                      className="p-1.5 opacity-60 hover:opacity-100 hover:bg-current/10 rounded-md transition-colors cursor-pointer"
                    >
                      {copiedAyahNumber === ayah.numberInSurah ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Uthmanic Text (or Hifz Memorization Test placeholder) */}
                {settings.hifzMode && !revealedHifzAyahs.has(ayah.numberInSurah) ? (
                  <div className="my-4 p-5 rounded-xl border border-dashed border-purple-500/40 bg-purple-500/5 text-center flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                      <Brain className="w-4 h-4" />
                      <span>Modo Hifz: Texto Árabe Oculto para Memorização</span>
                    </div>
                    <p className="text-xs opacity-75 font-editorial max-w-md">
                      Recite este versículo da sua memória (em voz alta ou no coração), e depois clique para conferir as palavras e diacríticos.
                    </p>
                    <button
                      onClick={() => toggleHifzReveal(ayah.numberInSurah)}
                      className="mt-1 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Revelar Árabe & Conferir Recitação</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {settings.hifzMode && (
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => toggleHifzReveal(ayah.numberInSurah)}
                          className="text-[11px] opacity-75 hover:opacity-100 text-purple-400 flex items-center gap-1 cursor-pointer"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Ocultar novamente (Re-testar)</span>
                        </button>
                      </div>
                    )}
                    <div
                      className={`font-arabic mb-5 text-right font-arabic-${settings.arabicFont || 'amiriQuran'}`}
                      style={{
                        fontSize: `${settings.arabicFontSize || 32}px`,
                        lineHeight: settings.arabicLineHeight || 2.4,
                        color: isHighContrast ? '#fde047' : isDark ? '#fef3c7' : '#1c1917',
                      }}
                    >
                      {ayah.arabicText}
                      <span
                        aria-label={`Versículo ${ayah.numberInSurah}`}
                        className="relative inline-flex items-center justify-center mr-2 select-none font-serif opacity-80 align-middle"
                        style={{
                          color: isHighContrast ? '#ffffff' : isDark ? '#fbbf24' : '#b45309',
                          fontSize: '1.5rem',
                          lineHeight: 1,
                        }}
                      >
                        <span aria-hidden="true" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", fontSize: '1.6em', lineHeight: 1 }}>۝</span>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center font-bold"
                          style={{
                            fontSize: String(ayah.numberInSurah).length >= 3 ? '0.5em' : String(ayah.numberInSurah).length === 2 ? '0.6em' : '0.7em',
                            direction: 'ltr',
                          }}
                        >
                          {ayah.numberInSurah}
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Optional Phonetic Transliteration with separate font size */}
                {settings.showTransliteration && (
                  ayah.transliteration?.trim() ? (
                    <p
                      className={`font-sans italic mb-3 ${isHighContrast ? 'text-white' : 'opacity-70'}`}
                      style={{
                        fontSize: `${settings.transliterationFontSize || 15}px`,
                      }}
                    >
                      {ayah.transliteration}
                    </p>
                  ) : (
                    <p className="font-sans italic mb-3 text-xs opacity-45">
                      Transliteração indisponível para este versículo.
                    </p>
                  )
                )}

                {/* Side-by-Side Comparison OR Single Portuguese Translation */}
                {settings.sideBySideTranslation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
                    {/* Dr. Helmi Nasr */}
                    <div className="p-3.5 rounded-xl border border-current/15 bg-current/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                        <span>Dr. Helmi Nasr (Complexo Rei Fahd)</span>
                        <span className="opacity-60 text-[10px]">Referência de Medina</span>
                      </div>
                      <TranslationWithNotes
                        className={`leading-relaxed font-pt-${settings.portugueseFont || 'serif'}`}
                        style={{
                          fontSize: `${settings.translationFontSize || 17}px`,
                          lineHeight: settings.translationLineHeight || 1.8,
                        }}
                        text={settings.translationId === 'pt.nasr' ? ayah.translation : (ayah.secondaryTranslation || ayah.translation)}
                        footnotes={ayah.nasrFootnotes}
                        isDark={isDark}
                        isHighContrast={isHighContrast}
                      />
                    </div>

                    {/* Samir El-Hayek */}
                    <div className="p-3.5 rounded-xl border border-current/15 bg-current/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                        <span>Prof. Samir El-Hayek</span>
                        <span className="opacity-60 text-[10px]">Significado dos Versículos</span>
                      </div>
                      <TranslationWithNotes
                        className={`leading-relaxed font-pt-${settings.portugueseFont || 'serif'}`}
                        style={{
                          fontSize: `${settings.translationFontSize || 17}px`,
                          lineHeight: settings.translationLineHeight || 1.8,
                        }}
                        text={stripNoteMarkers(settings.translationId === 'pt.elhayek' ? ayah.translation : (ayah.secondaryTranslation || ayah.translation))}
                        footnotes={undefined}
                        isDark={isDark}
                        isHighContrast={isHighContrast}
                      />
                    </div>
                  </div>
                ) : (
                  <TranslationWithNotes
                        className={`leading-relaxed max-w-3xl font-pt-${settings.portugueseFont || 'serif'}`}
                        style={{
                          fontSize: `${settings.translationFontSize || 17}px`,
                          lineHeight: settings.translationLineHeight || 1.8,
                        }}
                        text={settings.translationId === 'pt.nasr' ? ayah.translation : stripNoteMarkers(ayah.translation)}
                        footnotes={settings.translationId === 'pt.nasr' ? ayah.nasrFootnotes : undefined}
                        isDark={isDark}
                        isHighContrast={isHighContrast}
                      />
                )}

                {/* Inline Complete Tafsir View when toggled (Real APIs: QuranEnc, UmmahAPI, spa5k) */}
                {showInlineTafsir && (
                  <InlineRealTafsirView
                    surahNumber={surah.number}
                    ayahNumber={ayah.numberInSurah}
                    surahName={surah.transliteration}
                    isHighContrast={isHighContrast}
                    isDark={isDark}
                    sources={settings.inlineTafsirSources || ['ibnKathir', 'asbabNuzul', 'helmiNasr', 'practical']}
                  />
                )}

                {/* Classical Tafsir Preview / Action Ribbon */}
                <div className="mt-5 pt-4 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm opacity-80 italic max-w-xl leading-relaxed">
                    <span className="font-semibold not-italic">Tafsir: </span>
                    Ibn Kathir, notas de tradução e Asbāb al-Nuzūl quando houver registro disponível.
                  </p>

                  <button
                    onClick={() => onSelectAyahForTafsir(ayah)}
                    className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Abrir Tafsir Completo & Fontes</span>
                  </button>
                </div>

                <VerseSourceDetails
                  citations={createQuranCitations(ayah)}
                  isDark={isDark}
                  isHighContrast={isHighContrast}
                  loadExtraCitations={loadExtraCitations}
                />
              </article>
            );
          })}
        </div>
      )}

      {/* Surah End Footer Navigation */}
      <div
        className={`mt-12 p-6 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isHighContrast
            ? 'bg-black text-white border-2 border-yellow-400'
            : isDark
            ? 'bg-[#151e2b] text-slate-100 border-slate-800'
            : 'bg-white text-stone-900 border-stone-200'
        }`}
      >
        <div>
          <p className="text-xs opacity-60 uppercase tracking-widest font-medium">
            Fim da Surata {surah.transliteration}
          </p>
          <p className="text-sm font-editorial mt-0.5">
            Completou a leitura dos {surah.totalAyahs} versículos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {surah.number > 1 && (
            <button
              onClick={() => onNavigateSurah(surah.number - 1)}
              className="px-4 py-2 border border-current/20 rounded-lg text-xs font-semibold hover:bg-current/10 transition-colors cursor-pointer"
            >
              Surata Anterior
            </button>
          )}

          {surah.number < 114 && (
            <button
              onClick={() => onNavigateSurah(surah.number + 1)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Avançar para Surata {surah.number + 1}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
