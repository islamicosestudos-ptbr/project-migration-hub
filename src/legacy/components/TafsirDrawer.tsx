import React, { useState, useEffect } from 'react';
import { Ayah, SurahMeta } from '../types/quran';
import { askGeminiTafsir } from '../services/quranApi';
import {
  fetchRealHelmiNasr,
  fetchRealIbnKathir,
  fetchRealAsbab,
  HelmiNasrResult,
  IbnKathirResult,
  AsbabResult,
} from '../services/realTafsirApi';
import { TafsirTextRenderer } from './TafsirTextRenderer';
import { TranslatableTafsir } from './TranslatableTafsir';
import {
  X,
  BookOpen,
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  History,
  BookMarked,
  Loader2,
  ExternalLink,
  Info,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface TafsirDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  surah: SurahMeta;
  ayah: Ayah | null;
}

export const TafsirDrawer: React.FC<TafsirDrawerProps> = ({
  isOpen,
  onClose,
  surah,
  ayah,
}) => {
  const [selectedTab, setSelectedTab] = useState<'ibnKathir' | 'helmiNasr' | 'asbabNuzul' | 'gemini'>('ibnKathir');

  // Real data state
  const [loadingReal, setLoadingReal] = useState<boolean>(false);
  const [helmiData, setHelmiData] = useState<HelmiNasrResult | null>(null);
  const [ibnKathirData, setIbnKathirData] = useState<IbnKathirResult | null>(null);
  const [asbabData, setAsbabData] = useState<AsbabResult | null>(null);

  // Texto atualmente visível em cada aba (original ou tradução) — usado pelo botão "Copiar"
  const [ibnKathirShown, setIbnKathirShown] = useState<string>('');
  const [asbabShown, setAsbabShown] = useState<string>('');

  // Gemini assistant state (Auxiliary only)
  const [aiTafsir, setAiTafsir] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);

  // Fetch real verified Tafsir data whenever ayah or surah changes
  useEffect(() => {
    if (!isOpen || !ayah) return;

    let isMounted = true;
    async function loadAllRealTafsir() {
      setLoadingReal(true);
      setAiTafsir(null);
      setUserQuestion('');

      try {
        const [h, i, a] = await Promise.all([
          fetchRealHelmiNasr(surah.number, ayah!.numberInSurah),
          fetchRealIbnKathir(surah.number, ayah!.numberInSurah),
          fetchRealAsbab(surah.number, ayah!.numberInSurah),
        ]);

        if (isMounted) {
          setHelmiData(h);
          setIbnKathirData(i);
          setAsbabData(a);
        }
      } catch (err) {
        console.error('Erro ao buscar dados reais de Tafsir:', err);
      } finally {
        if (isMounted) setLoadingReal(false);
      }
    }

    loadAllRealTafsir();
    return () => {
      isMounted = false;
    };
  }, [isOpen, surah.number, ayah?.numberInSurah]);

  if (!isOpen || !ayah) return null;

  const handleAskGemini = async (customQ?: string) => {
    setIsLoadingAi(true);
    setSelectedTab('gemini');
    try {
      const result = await askGeminiTafsir({
        surahNumber: surah.number,
        surahName: surah.transliteration,
        ayahNumber: ayah.numberInSurah,
        arabicText: ayah.arabicText,
        translationText: ayah.translation,
        question: customQ || userQuestion,
      });
      setAiTafsir(result);
    } catch (err: any) {
      console.error(err);
      setAiTafsir('Não foi possível obter resposta no momento. As fontes clássicas oficiais permanecem disponíveis nas outras abas.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyCurrentTafsir = () => {
    let textToCopy = `Alcorão Sagrado - Surata ${surah.transliteration} ${surah.number}:${ayah.numberInSurah}\n\n`;
    textToCopy += `Texto Sagrado:\n${ayah.arabicText}\n"${ayah.translation}"\n\n`;

    if (selectedTab === 'ibnKathir') {
      textToCopy += `--- TAFSIR IBN KATHIR ---\nFonte: ${ibnKathirData?.source || 'UmmahAPI'}\n\n`;
      textToCopy += ibnKathirShown || ibnKathirData?.text || '';
    } else if (selectedTab === 'helmiNasr') {
      textToCopy += `--- NOTAS OFICIAIS DO DR. HELMI NASR ---\nFonte: QuranEnc (Complexo do Rei Fahd de Medina)\n\n`;
      textToCopy += helmiData?.footnotes || 'Sem nota de rodapé suplementar.';
    } else if (selectedTab === 'asbabNuzul') {
      textToCopy += `--- ASBĀB AL-NUZŪL (AL-WĀḤIDĪ) ---\nFonte: spa5k/tafsir_api\n\n`;
      textToCopy += asbabShown || asbabData?.text || '';
    } else if (selectedTab === 'gemini') {
      textToCopy += `--- CONSULTA AUXILIAR (GEMINI) ---\n${aiTafsir || ''}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl lg:max-w-3xl bg-[#FBF9F5] dark:bg-[#101722] h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col border-l border-stone-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#162130] border-b border-stone-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-slate-300">
              <span className="font-semibold text-amber-950 dark:text-amber-300">
                Surata {surah.number}: {surah.transliteration}
              </span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>Versículo {ayah.numberInSurah} de {surah.totalAyahs}</span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span>{surah.revelationType}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-slate-100 mt-1">
              Tafsir e fontes de referência
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCurrentTafsir}
              title="Copiar texto com citação da fonte"
              className="p-2.5 text-stone-600 hover:text-stone-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-stone-200 dark:hover:border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar painel de Tafsir"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs with explicit sources */}
        <div className="bg-white dark:bg-[#162130] border-b border-stone-200 dark:border-slate-800 px-4 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          
          {/* Tab 1: Ibn Kathir */}
          <button
            onClick={() => setSelectedTab('ibnKathir')}
            className={`pb-3.5 px-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'ibnKathir'
                ? 'border-amber-700 dark:border-amber-400 text-amber-950 dark:text-amber-300 font-bold'
                : 'border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-950 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tafsir Ibn Kathir</span>
          </button>

          {/* Tab 2: Notas Helmi Nasr */}
          <button
            onClick={() => setSelectedTab('helmiNasr')}
            className={`pb-3.5 px-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'helmiNasr'
                ? 'border-amber-700 dark:border-amber-400 text-amber-950 dark:text-amber-300 font-bold'
                : 'border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-950 dark:hover:text-slate-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Notas Helmi Nasr (QuranEnc)</span>
          </button>

          {/* Tab 3: Asbāb al-Nuzūl */}
          <button
            onClick={() => setSelectedTab('asbabNuzul')}
            className={`pb-3.5 px-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'asbabNuzul'
                ? 'border-amber-700 dark:border-amber-400 text-amber-950 dark:text-amber-300 font-bold'
                : 'border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-950 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Asbāb al-Nuzūl (Al-Wāḥidī)</span>
          </button>

          {/* Tab 4: Consulta Aberta (IA Auxiliar) */}
          <button
            onClick={() => {
              setSelectedTab('gemini');
              if (!aiTafsir && !isLoadingAi) {
                handleAskGemini();
              }
            }}
            className={`pb-3.5 px-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'gemini'
                ? 'border-amber-700 dark:border-amber-400 text-amber-950 dark:text-amber-300 font-bold'
                : 'border-transparent text-stone-600 dark:text-slate-400 hover:text-stone-950 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Consulta Aberta (IA Auxiliar)</span>
          </button>
        </div>

        {/* Scrollable Body Content with generous spacing and smooth scrolling */}
        <div className="tafsir-scroll flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-6">
          {/* Versículo selecionado (rola junto com o conteúdo: mais altura para leitura) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-[#131c2a] border border-stone-200 dark:border-slate-800">
            <div className="font-arabic text-2xl sm:text-3xl text-stone-950 dark:text-amber-200 text-right leading-loose mb-3 selection:bg-amber-200" dir="rtl">
              {ayah.arabicText}
            </div>
            <p className="font-editorial text-[17px] text-stone-900 dark:text-slate-100 leading-[1.8] italic">
              "{ayah.translation}"
            </p>
          </div>

          
          {loadingReal && selectedTab !== 'gemini' && (
            <div className="p-12 text-center space-y-3.5 bg-white dark:bg-[#162130] rounded-2xl border border-stone-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
              <p className="text-sm font-medium text-stone-700 dark:text-slate-300">
                Consultando as fontes disponíveis para este versículo...
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Sem texto inventado — buscando dados verificados.
              </p>
            </div>
          )}

          {/* TAB 1: IBN KATHIR */}
          {!loadingReal && selectedTab === 'ibnKathir' && ibnKathirData && (
            <article className="bg-white dark:bg-[#162130] rounded-2xl p-5 sm:p-8 border border-stone-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-4 border-b border-stone-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                    {ibnKathirData.work || 'Tafsir Ibn Kathir'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
                      Exegese · {ibnKathirData.source || 'fonte não identificada'}
                    </span>
                    {ibnKathirData.author && (
                      <span className="text-xs text-stone-500 dark:text-slate-400">
                        {ibnKathirData.author}
                      </span>
                    )}
                    {ibnKathirData.editionVersion && (
                      <span className="text-xs text-stone-500 dark:text-slate-400">
                        {ibnKathirData.editionVersion}
                      </span>
                    )}
                    {ibnKathirData.sourceUrl && (
                      <a
                        href={ibnKathirData.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        Ver registro consultado
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {ibnKathirData.hasText ? (
                <TranslatableTafsir
                  text={ibnKathirData.text}
                  title={`${ibnKathirData.work || 'Tafsir Ibn Kathir'}: Surata ${surah.transliteration} (${surah.number}:${ayah.numberInSurah})`}
                  originalNotice={`Texto consultado em ${ibnKathirData.language || 'idioma não informado'}; fonte: ${ibnKathirData.source || 'não identificada'}.`}
                  onDisplayedTextChange={setIbnKathirShown}
                />
              ) : (
                <p className="rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900/50 p-4 text-sm text-stone-700 dark:text-slate-300">
                  Não foi retornado texto de Tafsir Ibn Kathir para esta referência nas fontes consultadas.
                </p>
              )}
            </article>
          )}

          {/* TAB 2: NOTAS DA TRADUÇÃO DE HELMI NASR */}
          {!loadingReal && selectedTab === 'helmiNasr' && helmiData && (
            <article className="bg-white dark:bg-[#162130] rounded-2xl p-5 sm:p-8 border border-stone-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-4 border-b border-stone-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-slate-100 flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                    Notas da tradução de Helmi Nasr
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/20">
                      Notas Helmi Nasr – fonte: QuranEnc
                    </span>
                    <a
                      href={helmiData.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Ver registro de origem</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {helmiData.hasFootnotes ? (
                <div className="space-y-4">
                  <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 dark:bg-slate-900/70 border border-amber-200/60 dark:border-slate-800">
                    <TafsirTextRenderer content={helmiData.footnotes} />
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 space-y-3">
                  <p className="font-semibold text-stone-900 dark:text-slate-100 text-sm">
                    Sem notas de rodapé suplementares neste versículo.
                  </p>
                  <p className="text-xs text-stone-600 dark:text-slate-400">
                    A tradução retornada pela QuranEnc para esta referência:
                  </p>
                  <blockquote className="p-4 rounded-xl bg-white dark:bg-[#162130] border-l-4 border-amber-600 font-editorial text-base text-stone-900 dark:text-slate-100 italic leading-[1.8]">
                    "{helmiData.translation || ayah.translation}"
                  </blockquote>
                </div>
              )}

              <div className="p-4 bg-stone-50 dark:bg-slate-900/50 rounded-xl border border-stone-200/80 dark:border-slate-800 text-xs text-stone-700 dark:text-slate-300 font-editorial leading-relaxed">
                <span className="font-bold block mb-1 text-stone-900 dark:text-slate-100">
                  Fonte consultada:
                </span>
                <em>QuranEnc</em>. A página consultada identifica a tradução como Helmi Nasr.
              </div>
            </article>
          )}

          {/* TAB 3: ASBAB AL-NUZUL */}
          {!loadingReal && selectedTab === 'asbabNuzul' && asbabData && (
            <article className="bg-white dark:bg-[#162130] rounded-2xl p-5 sm:p-8 border border-stone-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-4 border-b border-stone-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-slate-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
                    Asbāb al-Nuzūl — Circunstâncias Históricas da Revelação
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                      Circunstâncias da revelação · {asbabData.source}
                    </span>
                    {asbabData.author && (
                      <span className="text-xs text-stone-500 dark:text-slate-400">
                        {asbabData.author}
                      </span>
                    )}
                    {asbabData.sourceUrl && (
                      <a
                        href={asbabData.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-700 dark:text-amber-400 hover:underline"
                      >
                        Ver coleção consultada
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {asbabData.hasContext ? (
                <TranslatableTafsir
                  text={asbabData.text}
                  title={`Asbab al-Nuzul: Surata ${surah.transliteration} (${surah.number}:${ayah.numberInSurah})`}
                  originalNotice={`Texto consultado em ${asbabData.language || 'idioma não informado'}; fonte: ${asbabData.source || 'não identificada'}.`}
                  onDisplayedTextChange={setAsbabShown}
                />
              ) : (
                <p className="rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900/50 p-4 text-sm text-stone-700 dark:text-slate-300">
                  {asbabData.availability === 'not-found'
                    ? 'A coleção consultada não retornou uma entrada para este versículo. Isso não comprova ausência de circunstâncias de revelação em outras obras.'
                    : 'Não foi possível confirmar se a coleção consultada possui uma entrada para este versículo.'}
                </p>
              )}
            </article>
          )}

          {/* TAB 4: CONSULTA ABERTA (GEMINI) */}
          {selectedTab === 'gemini' && (
            <article className="bg-white dark:bg-[#162130] rounded-2xl p-5 sm:p-8 border border-stone-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-4 border-b border-stone-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900 dark:text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    Consulta Complementar (Ferramenta de Estudo)
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-semibold">
                    Auxiliar de Estudo
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300 mt-1.5 font-editorial leading-relaxed">
                  Utilize esta ferramenta para dúvidas de vocabulário ou reflexão ética. As respostas de IA são auxiliares; os textos e referências das outras abas são apresentados separadamente.
                </p>
              </div>

              {/* Custom question bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                  placeholder="Pergunte sobre um termo específico ou contexto deste versículo..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => handleAskGemini()}
                  disabled={isLoadingAi}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isLoadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Consultar</span>
                </button>
              </div>

              {isLoadingAi ? (
                <div className="p-10 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-300">Consultando referências acadêmicas...</p>
                </div>
              ) : aiTafsir ? (
                <div className="pt-2">
                  <TafsirTextRenderer content={aiTafsir} />
                </div>
              ) : null}
            </article>
          )}

        </div>
      </div>
    </div>
  );
};
