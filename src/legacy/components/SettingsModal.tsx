import React from 'react';
import {
  X,
  Type,
  Globe,
  Volume2,
  Palette,
  Eye,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  Contrast,
  BookOpen,
  AlignLeft,
  Check,
  Split,
  Brain,
  Bookmark
} from 'lucide-react';
import {
  ReaderSettings,
  AppTheme,
  VerseSpacing,
  ArabicFontFamily,
  PortugueseFontFamily,
  InlineTafsirSource
} from '../types/quran';
import { RECITERS } from '../data/quranSurahs';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';
  const isHighContrast = settings.theme === 'highContrast';

  const applyProfile = (profile: 'night' | 'dyslexia' | 'study' | 'hifz') => {
    switch (profile) {
      case 'night':
        onUpdateSettings({
          theme: 'dark',
          arabicFontSize: 32,
          translationFontSize: 16,
          transliterationFontSize: 14,
          verseSpacing: 'normal',
          readingRuler: true,
          hifzMode: false,
          sideBySideTranslation: false,
        });
        break;
      case 'dyslexia':
        onUpdateSettings({
          theme: 'paper',
          portugueseFont: 'lexend',
          arabicFont: 'scheherazade',
          arabicFontSize: 34,
          translationFontSize: 19,
          transliterationFontSize: 16,
          verseSpacing: 'dyslexic',
          readingRuler: true,
          showTransliteration: true,
          hifzMode: false,
        });
        break;
      case 'study':
        onUpdateSettings({
          theme: 'paper',
          arabicFontSize: 30,
          translationFontSize: 16,
          sideBySideTranslation: true,
          showTransliteration: true,
          verseSpacing: 'spacious',
          readingRuler: false,
          hifzMode: false,
          inlineTafsirSources: ['ibnKathir', 'asbabNuzul', 'helmiNasr', 'practical'],
        });
        break;
      case 'hifz':
        onUpdateSettings({
          arabicFontSize: 38,
          hifzMode: true,
          hifzRevealedAyahs: [],
          sideBySideTranslation: false,
          playbackRepeatCount: 3,
          playbackSpeed: 1.0,
          verseSpacing: 'spacious',
        });
        break;
    }
  };

  const toggleInlineTafsirSource = (source: InlineTafsirSource) => {
    const current = settings.inlineTafsirSources || ['ibnKathir', 'asbabNuzul', 'helmiNasr', 'practical'];
    if (current.includes(source)) {
      onUpdateSettings({
        inlineTafsirSources: current.filter((s) => s !== source),
      });
    } else {
      onUpdateSettings({
        inlineTafsirSources: [...current, source],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden my-8 max-h-[90vh] flex flex-col ${
          isHighContrast
            ? 'bg-black text-white border-2 border-yellow-400'
            : isDark
            ? 'bg-[#151c24] text-slate-100 border border-slate-700'
            : 'bg-[#FBF9F5] text-stone-900 border border-stone-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b shrink-0 ${
            isHighContrast
              ? 'border-yellow-400/60'
              : isDark
              ? 'border-slate-800'
              : 'border-stone-200'
          }`}
        >
          <div>
            <h2 className="text-lg sm:text-xl font-display font-semibold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              <span>Acessibilidade & Conforto Visual</span>
            </h2>
            <p className="text-xs opacity-75 font-editorial mt-0.5">
              Personalize tema noturno, alto contraste, fontes e espaçamento para sua leitura.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 opacity-60 hover:opacity-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar configurações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="mt-5 space-y-6 overflow-y-auto pr-1 flex-1">

          {/* PERFIS DE LEITURA EM 1 TOQUE */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90 uppercase">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Perfis de Leitura Rápidos (1 Toque)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyProfile('night')}
                className="p-2.5 rounded-xl border border-current/15 hover:border-amber-400/60 text-left transition-all cursor-pointer flex items-center gap-2.5 hover:bg-current/5"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <div className="font-semibold text-xs">Modo Noturno</div>
                  <div className="text-[10px] opacity-70">OLED escuro para relaxar</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyProfile('dyslexia')}
                className="p-2.5 rounded-xl border border-current/15 hover:border-amber-400/60 text-left transition-all cursor-pointer flex items-center gap-2.5 hover:bg-current/5"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-900/20 border border-amber-600/40 flex items-center justify-center shrink-0">
                  <AlignLeft className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-xs">Foco & Dislexia</div>
                  <div className="text-[10px] opacity-70">Lexend + espaçamento amplo</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyProfile('study')}
                className="p-2.5 rounded-xl border border-current/15 hover:border-amber-400/60 text-left transition-all cursor-pointer flex items-center gap-2.5 hover:bg-current/5"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-900/20 border border-emerald-600/40 flex items-center justify-center shrink-0">
                  <Split className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-xs">Estudo Acadêmico</div>
                  <div className="text-[10px] opacity-70">Nasr × El-Hayek lado a lado</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyProfile('hifz')}
                className="p-2.5 rounded-xl border border-current/15 hover:border-amber-400/60 text-left transition-all cursor-pointer flex items-center gap-2.5 hover:bg-current/5"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-900/20 border border-purple-600/40 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-xs">Memorização (Hifz)</div>
                  <div className="text-[10px] opacity-70">Ocultar árabe e testar</div>
                </div>
              </button>
            </div>
          </div>
          
          {/* 1. TEMA DE LEITURA (Modo Escuro Noturno / Alto Contraste / Papiro) */}
          <div className="space-y-2.5 pt-4 border-t border-current/10">
            <label className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90 uppercase">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Tema Visual & Modo Noturno</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Papiro */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'paper' })}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'paper'
                    ? 'border-amber-800 bg-[#F5EFE6] text-amber-950 font-bold ring-2 ring-amber-800/30 shadow-xs'
                    : 'border-stone-200 bg-[#FBF9F5] text-stone-700 hover:bg-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-800" />
                <span>Papiro</span>
              </button>

              {/* Modo Escuro (Noturno antes de dormir) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'border-amber-400 bg-[#0c1117] text-amber-300 font-bold ring-2 ring-amber-400/40 shadow-xs'
                    : 'border-slate-700 bg-[#161f2c] text-slate-300 hover:bg-[#1a2535]'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400" />
                <span>Noturno</span>
              </button>

              {/* Alto Contraste para Baixa Visão */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'highContrast' })}
                className={`p-3 rounded-xl border-2 text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'highContrast'
                    ? 'border-yellow-400 bg-black text-yellow-300 font-bold ring-2 ring-yellow-400/50 shadow-xs'
                    : 'border-stone-500 bg-stone-900 text-yellow-400 hover:bg-black'
                }`}
              >
                <Contrast className="w-4 h-4 text-yellow-400" />
                <span>Alto Contraste</span>
              </button>

              {/* Branco Puro */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'border-blue-600 bg-white text-slate-900 font-bold ring-2 ring-blue-500/30 shadow-xs'
                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-600" />
                <span>Branco</span>
              </button>
            </div>
          </div>

          {/* 2. CONTROLE SEPARADO DE TAMANHOS DE FONTE */}
          <div className="space-y-4 pt-4 border-t border-current/10">
            <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90 uppercase">
              <Type className="w-4 h-4 text-amber-500" />
              <span>Tamanhos de Fonte Independentes</span>
            </span>

            {/* Árabe */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">Texto Sagrado Árabe</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ arabicFontSize: Math.max(22, settings.arabicFontSize - 2) })}
                    className="w-6 h-6 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs w-9 text-center font-bold">{settings.arabicFontSize}px</span>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ arabicFontSize: Math.min(56, settings.arabicFontSize + 2) })}
                    className="w-6 h-6 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="22"
                max="56"
                step="2"
                value={settings.arabicFontSize}
                onChange={(e) => onUpdateSettings({ arabicFontSize: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Tradução em Português */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">Tradução em Português</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ translationFontSize: Math.max(14, settings.translationFontSize - 1) })}
                    className="w-6 h-6 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs w-9 text-center font-bold">{settings.translationFontSize}px</span>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ translationFontSize: Math.min(28, settings.translationFontSize + 1) })}
                    className="w-6 h-6 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="14"
                max="28"
                step="1"
                value={settings.translationFontSize}
                onChange={(e) => onUpdateSettings({ translationFontSize: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Transliteração */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">Transliteração Fonética</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ transliterationFontSize: Math.max(12, settings.transliterationFontSize - 1) })}
                    className="w-6 h-6 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs w-9 text-center font-bold">{settings.transliterationFontSize}px</span>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ transliterationFontSize: Math.min(24, settings.transliterationFontSize + 1) })}
                    className="w-6 h-6 rounded bg-current/10 hover:bg-current/20 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={settings.transliterationFontSize}
                onChange={(e) => onUpdateSettings({ transliterationFontSize: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. ESPAÇAMENTO ENTRE VERSÍCULOS (Acessibilidade & Leitores com Dislexia) */}
          <div className="space-y-2.5 pt-4 border-t border-current/10">
            <label className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90 uppercase">
              <AlignLeft className="w-4 h-4 text-amber-500" />
              <span>Espaçamento entre Versículos (Conforto / Dislexia)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'compact', label: 'Compacto', desc: 'Menor rolagem' },
                { id: 'normal', label: 'Padrão', desc: 'Equilibrado' },
                { id: 'spacious', label: 'Amplo', desc: 'Mais respiro' },
                { id: 'dyslexic', label: 'Dislexia', desc: 'Máximo foco' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => onUpdateSettings({ verseSpacing: sp.id as VerseSpacing })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    settings.verseSpacing === sp.id
                      ? 'border-amber-500 bg-amber-500/20 font-bold shadow-xs'
                      : 'border-current/15 hover:bg-current/5'
                  }`}
                >
                  <div className="font-semibold">{sp.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{sp.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. FONTE ÁRABE & COMPATIBILIDADE DE DIACRÍTICOS */}
          <div className="space-y-2.5 pt-4 border-t border-current/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90 uppercase">
                <span>Fonte Árabe (Compatibilidade de Diacríticos)</span>
              </label>
              <span className="text-[10px] opacity-60">Anti-quebra Android/iOS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'amiriQuran', name: 'Amiri Quran', sub: 'Caligrafia Corânica Tradicional' },
                { id: 'scheherazade', name: 'Scheherazade New', sub: 'SIL - Diacríticos 100% seguros em Android antigo' },
                { id: 'notoNaskh', name: 'Noto Naskh Arabic', sub: 'Google - Alta legibilidade universal' },
                { id: 'amiri', name: 'Amiri Padrão', sub: 'Naskh moderno fluído' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateSettings({ arabicFont: f.id as ArabicFontFamily })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    settings.arabicFont === f.id
                      ? 'border-amber-500 bg-amber-500/20 font-bold shadow-xs'
                      : 'border-current/15 hover:bg-current/5'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{f.name}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{f.sub}</div>
                  </div>
                  {settings.arabicFont === f.id && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Live Arabic Preview Box */}
            <div
              className={`p-3 rounded-xl border text-right font-arabic transition-all ${
                isHighContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : isDark
                  ? 'bg-slate-900 text-amber-200 border-slate-700'
                  : 'bg-white text-stone-900 border-stone-200'
              } font-arabic-${settings.arabicFont}`}
              style={{ fontSize: `${settings.arabicFontSize}px`, lineHeight: settings.arabicLineHeight }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝١
            </div>
          </div>

          {/* 5. FONTE DA TRADUÇÃO EM PORTUGUÊS (Com opção para Dislexia) */}
          <div className="space-y-2.5 pt-4 border-t border-current/10">
            <label className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90 uppercase">
              <span>Tipografia da Tradução em Português</span>
            </label>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'serif', name: 'Lora (Serif)', desc: 'Estilo Livro Clássico' },
                { id: 'sans', name: 'Jakarta (Sans)', desc: 'Moderna e Nítida' },
                { id: 'lexend', name: 'Lexend (Dislexia)', desc: 'Leitura Fácil e Confortável' },
              ].map((pf) => (
                <button
                  key={pf.id}
                  type="button"
                  onClick={() => onUpdateSettings({ portugueseFont: pf.id as PortugueseFontFamily })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    settings.portugueseFont === pf.id
                      ? 'border-amber-500 bg-amber-500/20 font-bold shadow-xs'
                      : 'border-current/15 hover:bg-current/5'
                  }`}
                >
                  <div className="font-semibold">{pf.name}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{pf.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-current/10">
            <label htmlFor="verse-reference-style" className="text-xs font-semibold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Identificação do versículo</span>
            </label>
            <p className="text-[11px] opacity-70">
              Escolha como a referência aparece no cabeçalho de cada cartão.
            </p>
            <select
              id="verse-reference-style"
              value={settings.verseReferenceStyle || 'surahName'}
              onChange={(e) =>
                onUpdateSettings({ verseReferenceStyle: e.target.value as ReaderSettings['verseReferenceStyle'] })
              }
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border cursor-pointer ${
                isHighContrast
                  ? 'bg-black text-yellow-300 border-yellow-400'
                  : isDark
                  ? 'bg-slate-900 text-slate-100 border-slate-700'
                  : 'bg-white text-stone-800 border-stone-300'
              }`}
            >
              <option value="surahName">Nome da surata · 16:7</option>
              <option value="generic">Versículo 16:7</option>
            </select>
          </div>

          {/* 6. TRANSLITERAÇÃO & RECITADOR */}
          <div className="space-y-4 pt-4 border-t border-current/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                Exibir Transliteração Fonética dos Versículos
              </span>
              <input
                type="checkbox"
                checked={settings.showTransliteration}
                onChange={(e) => onUpdateSettings({ showTransliteration: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
              />
            </div>

            {/* 7. RECURSOS AVANÇADOS DE ESTUDO & MEMORIZAÇÃO */}
            <div className="space-y-3 pt-4 border-t border-current/10">
              <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90 uppercase">
                <Brain className="w-4 h-4 text-amber-500" />
                <span>Estudo Avançado, Hifz & Foco</span>
              </span>

              {/* Side-by-Side Translation Comparison */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-current/10">
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-amber-500" />
                    Comparação de Traduções Lado a Lado
                  </div>
                  <div className="text-[11px] opacity-70">
                    Exibe Dr. Helmi Nasr e Samir El-Hayek simultaneamente
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sideBySideTranslation}
                  onChange={(e) => onUpdateSettings({ sideBySideTranslation: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
              </div>

              {/* Reading Ruler Focus Line */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-current/10">
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-amber-500" />
                    Linha-Guia de Leitura (Realce do Versículo Ativo)
                  </div>
                  <div className="text-[11px] opacity-70">
                    Acompanha a leitura ou áudio, ideal para dislexia e sono
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.readingRuler}
                  onChange={(e) => onUpdateSettings({ readingRuler: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
              </div>

              {/* Hifz Memorization Mode */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-current/10">
                <div>
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-amber-500" />
                    Modo Teste de Memorização (Hifz)
                  </div>
                  <div className="text-[11px] opacity-70">
                    Oculta o texto sagrado árabe; toque para revelar e conferir
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hifzMode}
                  onChange={(e) => onUpdateSettings({ hifzMode: e.target.checked, hifzRevealedAyahs: [] })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
              </div>

              {/* Selective Inline Tafsir Sources */}
              <div className="space-y-2 p-2.5 rounded-xl border border-current/10">
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    Fontes do Tafsir Embutido nos Versículos
                  </span>
                  <span className="text-[10px] opacity-60">Filtre fontes</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { id: 'ibnKathir' as InlineTafsirSource, label: 'Ibn Kathir (Clássico)' },
                    { id: 'asbabNuzul' as InlineTafsirSource, label: 'Asbāb al-Nuzūl (Histórico)' },
                    { id: 'helmiNasr' as InlineTafsirSource, label: 'Notas Dr. Helmi Nasr' },
                    { id: 'practical' as InlineTafsirSource, label: 'Lições Morais (Tadabbur)' },
                  ].map((src) => {
                    const isChecked = (settings.inlineTafsirSources || ['ibnKathir', 'asbabNuzul', 'helmiNasr', 'practical']).includes(src.id);
                    return (
                      <label
                        key={src.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg border border-current/10 hover:bg-current/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleInlineTafsirSource(src.id)}
                          className="w-3.5 h-3.5 accent-amber-500 rounded"
                        />
                        <span>{src.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-current/10">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Tradução em Português de Referência</span>
              </label>
              <select
                value={settings.translationId}
                onChange={(e) => onUpdateSettings({ translationId: e.target.value as any })}
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border cursor-pointer ${
                  isHighContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : isDark
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-white text-stone-800 border-stone-300'
                }`}
              >
                <option value="pt.nasr">Dr. Helmi Nasr (Complexo do Rei Fahd de Medina)</option>
                <option value="pt.elhayek">Samir El-Hayek (O Significado dos Versículos)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>Recitador Preferencial (Qāri')</span>
              </label>
              <select
                value={settings.reciterId}
                onChange={(e) => onUpdateSettings({ reciterId: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none border cursor-pointer ${
                  isHighContrast
                    ? 'bg-black text-yellow-300 border-yellow-400'
                    : isDark
                    ? 'bg-slate-900 text-slate-100 border-slate-700'
                    : 'bg-white text-stone-800 border-stone-300'
                }`}
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.style})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div
          className={`mt-6 pt-4 border-t flex justify-end shrink-0 ${
            isHighContrast
              ? 'border-yellow-400/60'
              : isDark
              ? 'border-slate-800'
              : 'border-stone-200'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Aplicar Ajustes
          </button>
        </div>

      </div>
    </div>
  );
};
