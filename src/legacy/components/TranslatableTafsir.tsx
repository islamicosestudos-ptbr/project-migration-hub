import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Globe, Loader2, RefreshCw } from 'lucide-react';
import { translateTextToPortuguese } from '../services/realTafsirApi';
import { TafsirTextRenderer } from './TafsirTextRenderer';

interface TranslatableTafsirProps {
  /** Texto original (inglês) — exibido por inteiro, sem limite de tamanho. */
  text: string;
  /** Contexto enviado ao tradutor, ex.: "Tafsir Ibn Kathir: Surata Al-Fatiha (1:1)". */
  title: string;
  /** Frase curta que descreve a fonte do original. */
  originalNotice?: string;
  /** Avisa o pai qual texto está visível (original ou tradução), p.ex. para o botão "Copiar". */
  onDisplayedTextChange?: (displayed: string) => void;
}

// Mensagens que o próprio app gera em português quando a fonte falha: não há o que traduzir.
const PT_PLACEHOLDER = /^(Não foi possível|Nenhum texto|Não há narrativa|Sem comentário)/i;

export const TranslatableTafsir: React.FC<TranslatableTafsirProps> = ({
  text,
  title,
  originalNotice,
  onDisplayedTextChange,
}) => {
  const [translated, setTranslated] = useState<string | null>(null);
  const [showTranslated, setShowTranslated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Ao mudar de versículo/fonte, volta ao estado inicial (e ignora respostas atrasadas)
  useEffect(() => {
    requestId.current += 1;
    setTranslated(null);
    setShowTranslated(false);
    setLoading(false);
    setError(null);
  }, [text]);

  const canTranslate = Boolean(text && text.trim()) && !PT_PLACEHOLDER.test(text.trim());

  const runTranslation = async () => {
    const myId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await translateTextToPortuguese(text, title);
      if (myId !== requestId.current) return;
      setTranslated(result);
      setShowTranslated(true);
    } catch (e: any) {
      if (myId !== requestId.current) return;
      setError(e?.message || 'Não foi possível traduzir agora. Tente novamente.');
      setShowTranslated(false);
    } finally {
      if (myId === requestId.current) setLoading(false);
    }
  };

  const handleToggle = () => {
    if (loading) return;
    if (showTranslated) {
      setShowTranslated(false); // volta ao original em inglês
      return;
    }
    if (translated) {
      setShowTranslated(true); // já traduzido: só alterna
      return;
    }
    void runTranslation();
  };

  const showingPt = showTranslated && translated !== null;
  const displayedText = showingPt ? (translated as string) : text;

  useEffect(() => {
    onDisplayedTextChange?.(displayedText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedText]);

  return (
    <div className="space-y-6">
      {/* Barra de idioma + botão */}
      {canTranslate && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-stone-50 dark:bg-slate-900/70 border border-stone-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm text-stone-800 dark:text-slate-200 min-w-0">
            {showingPt ? (
              <>
                <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold">Tradução completa em português</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>{originalNotice || 'Texto integral em inglês.'}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            aria-busy={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-bold border border-amber-700/40 dark:border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Traduzindo…</span>
              </>
            ) : showingPt ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Ver original em inglês</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Traduzir para português</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Estado de carregamento da tradução */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 sm:p-5 rounded-xl border border-amber-600/30 bg-amber-500/10 dark:bg-amber-400/10"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-amber-950 dark:text-amber-200">
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <span>Traduzindo o texto completo… textos longos são traduzidos em partes e podem levar alguns segundos.</span>
          </div>
          <div className="mt-4 space-y-2.5 animate-pulse" aria-hidden="true">
            <div className="h-3 rounded bg-amber-700/20 dark:bg-amber-200/20 w-full" />
            <div className="h-3 rounded bg-amber-700/20 dark:bg-amber-200/20 w-11/12" />
            <div className="h-3 rounded bg-amber-700/20 dark:bg-amber-200/20 w-4/5" />
          </div>
        </div>
      )}

      {/* Erro: o original é mantido e dá para tentar de novo */}
      {error && !loading && (
        <div
          role="alert"
          className="p-4 sm:p-5 rounded-xl border border-red-600/40 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5 text-sm text-red-900 dark:text-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void runTranslation()}
            className="px-4 py-2 rounded-xl text-sm font-bold border border-red-700/40 dark:border-red-300/40 bg-red-500/10 hover:bg-red-500/20 text-red-900 dark:text-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar novamente</span>
          </button>
        </div>
      )}

      {/* Conteúdo completo (nunca truncado): original ou tradução */}
      <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'} lang={showingPt ? 'pt-BR' : 'en'}>
        <TafsirTextRenderer content={displayedText} />
      </div>
    </div>
  );
};
