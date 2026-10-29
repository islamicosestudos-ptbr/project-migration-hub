import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Loader2, BookMarked, History } from 'lucide-react';
import {
  fetchRealHelmiNasr,
  fetchRealIbnKathir,
  fetchRealAsbab,
  HelmiNasrResult,
  IbnKathirResult,
  AsbabResult,
} from '../services/realTafsirApi';
import { InlineTafsirSource } from '../types/quran';
import { TafsirTextRenderer } from './TafsirTextRenderer';
import { TranslatableTafsir } from './TranslatableTafsir';

interface InlineRealTafsirViewProps {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  isHighContrast: boolean;
  isDark: boolean;
  sources: InlineTafsirSource[];
}

export const InlineRealTafsirView: React.FC<InlineRealTafsirViewProps> = ({
  surahNumber,
  ayahNumber,
  surahName,
  isHighContrast,
  isDark,
  sources,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true); // aberto por padrão para leitura direta
  const [loading, setLoading] = useState<boolean>(false);
  const [helmiData, setHelmiData] = useState<HelmiNasrResult | null>(null);
  const [ibnKathirData, setIbnKathirData] = useState<IbnKathirResult | null>(null);
  const [asbabData, setAsbabData] = useState<AsbabResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [h, i, a] = await Promise.all([
          fetchRealHelmiNasr(surahNumber, ayahNumber),
          fetchRealIbnKathir(surahNumber, ayahNumber),
          fetchRealAsbab(surahNumber, ayahNumber),
        ]);
        if (isMounted) {
          setHelmiData(h);
          setIbnKathirData(i);
          setAsbabData(a);
        }
      } catch (err) {
        console.error('Erro ao carregar Tafsir real:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [surahNumber, ayahNumber]);

  const showHelmi = sources.includes('helmiNasr');
  const showIbnKathir = sources.includes('ibnKathir') && Boolean(ibnKathirData?.hasText);
  const showAsbab = sources.includes('asbabNuzul') && Boolean(asbabData?.hasContext);

  // Seções visíveis, para numerar os títulos em sequência
  let sectionNumber = 0;
  const nextNumber = () => ++sectionNumber;

  const sectionBadge = (n: number) => (
    <span className="w-7 h-7 shrink-0 rounded-full bg-amber-500/20 dark:bg-amber-400/20 text-amber-900 dark:text-amber-200 text-sm font-bold flex items-center justify-center border border-amber-600/30 dark:border-amber-400/30">
      {n}
    </span>
  );

  return (
    <div
      className={`mt-8 rounded-2xl p-5 sm:p-8 transition-colors shadow-xs border min-w-0 ${
        isHighContrast
          ? 'border-yellow-400 bg-stone-950 text-white'
          : isDark
          ? 'border-slate-700 bg-[#0e1622] text-slate-100'
          : 'border-amber-200/80 bg-[#FDFBF7] text-stone-900'
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-300/70 dark:border-slate-700">
        <div className="flex items-center gap-2.5 min-w-0">
          <BookOpen className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Tafsir e referências — {surahNumber}:{ayahNumber}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg bg-stone-200/70 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer text-stone-800 dark:text-slate-200"
        >
          <span>{isExpanded ? 'Recolher' : 'Expandir completo'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {loading && (
        <div role="status" className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-slate-300 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          <span>Consultando as fontes disponíveis para este versículo...</span>
        </div>
      )}

      {!loading && !isExpanded && (
        <div className="text-sm sm:text-base font-editorial text-stone-800 dark:text-slate-200 leading-relaxed pt-4 flex flex-wrap items-center justify-between gap-2">
          <span>Referências disponíveis para este versículo.</span>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-amber-800 dark:text-amber-300 font-semibold hover:underline text-sm cursor-pointer"
          >
            Clique para ler na íntegra →
          </button>
        </div>
      )}

      {!loading && isExpanded && (
        <div className="divide-y divide-stone-300/70 dark:divide-slate-700">
          {/* 1. Notas associadas à tradução de Helmi Nasr */}
          {showHelmi && (
            <section className="py-8 first:pt-6 last:pb-0 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h4 className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-3">
                  {sectionBadge(nextNumber())}
                  <BookMarked className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>Notas da tradução de Helmi Nasr</span>
                </h4>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-600/30 font-semibold">
                  Fonte: QuranEnc
                </span>
              </div>

              {helmiData?.hasFootnotes ? (
                <div className="p-5 sm:p-6 rounded-xl bg-amber-500/10 dark:bg-slate-900/60 border border-amber-600/20 dark:border-slate-700">
                  <TafsirTextRenderer content={helmiData.footnotes} />
                </div>
              ) : (
                <p className="font-editorial text-base text-stone-700 dark:text-slate-300 italic leading-relaxed">
                  A QuranEnc não retornou notas complementares para este versículo.
                </p>
              )}
            </section>
          )}

          {/* 2. Tafsir Ibn Kathir */}
          {showIbnKathir && ibnKathirData && (
            <section className="py-8 first:pt-6 last:pb-0 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h4 className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-3">
                  {sectionBadge(nextNumber())}
                  <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>Tafsir Ibn Kathir</span>
                </h4>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-600/30 font-semibold">
                  Fonte: {ibnKathirData?.source || 'não identificada'}
                </span>
              </div>

              <TranslatableTafsir
                text={ibnKathirData.text}
                title={`Tafsir Ibn Kathir: Surata ${surahName} (${surahNumber}:${ayahNumber})`}
                originalNotice={`Texto consultado em ${ibnKathirData?.language || 'idioma não informado'}; fonte: ${ibnKathirData?.source || 'não identificada'}.`}
              />
            </section>
          )}

          {/* 3. Circunstâncias da revelação (quando há texto retornado) */}
          {showAsbab && asbabData && (
            <section className="py-8 first:pt-6 last:pb-0 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h4 className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-slate-100 flex items-center gap-3">
                  {sectionBadge(nextNumber())}
                  <History className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
                  <span>Circunstâncias da Revelação (Asbāb al-Nuzūl)</span>
                </h4>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-600/30 font-semibold">
                  Fonte: {asbabData?.source || 'não identificada'}
                </span>
              </div>

              <TranslatableTafsir
                text={asbabData.text}
                title={`Asbab al-Nuzul: Surata ${surahName} (${surahNumber}:${ayahNumber})`}
                originalNotice={`Texto consultado em ${asbabData.language || 'idioma não informado'}; fonte: ${asbabData.source || 'não identificada'}.`}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
};
