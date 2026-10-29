import React from 'react';
import { BookOpen, Bookmark, Compass, Settings, Sparkles, Moon, Contrast } from 'lucide-react';
import { AppTheme } from '../types/quran';

interface NavbarProps {
  currentView: 'reader' | 'catalog' | 'themes' | 'bookmarks';
  onNavigate: (view: 'reader' | 'catalog' | 'themes' | 'bookmarks') => void;
  onOpenSettings: () => void;
  onOpenDailyAyah: () => void;
  lastReadSurahName?: string | undefined;
  onContinueLastRead: () => void;
  theme?: AppTheme;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSettings,
  onOpenDailyAyah,
  lastReadSurahName,
  onContinueLastRead,
  theme = 'paper',
}) => {
  const isDark = theme === 'dark';
  const isHighContrast = theme === 'highContrast';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-yellow-400'
          : isDark
          ? 'bg-[#0c1117]/95 text-slate-100 border-slate-800'
          : 'bg-[#FBF9F5]/95 text-stone-900 border-stone-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('catalog')}
          className="text-left group cursor-pointer focus-visible:outline-none"
        >
          <span
            className={`text-xl font-display font-semibold tracking-wider whitespace-nowrap shrink-0 transition-colors ${
              isHighContrast
                ? 'text-yellow-400 group-hover:text-yellow-300'
                : isDark
                ? 'text-amber-300 group-hover:text-amber-200'
                : 'text-stone-900 group-hover:text-amber-900'
            }`}
          >
            ALCORÃO SAGRADO
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium opacity-85">
          <button
            onClick={() => onNavigate('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentView === 'catalog'
                ? isHighContrast
                  ? 'text-yellow-400 font-bold border-b-2 border-yellow-400'
                  : isDark
                  ? 'text-amber-300 font-bold border-b-2 border-amber-400'
                  : 'text-amber-950 font-semibold border-b-2 border-amber-900'
                : 'hover:opacity-100'
            }`}
          >
            Índice de Suratas
          </button>

          <button
            onClick={() => onNavigate('reader')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentView === 'reader'
                ? isHighContrast
                  ? 'text-yellow-400 font-bold border-b-2 border-yellow-400'
                  : isDark
                  ? 'text-amber-300 font-bold border-b-2 border-amber-400'
                  : 'text-amber-950 font-semibold border-b-2 border-amber-900'
                : 'hover:opacity-100'
            }`}
          >
            Leitura & Tafsir
          </button>

          <button
            onClick={() => onNavigate('themes')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentView === 'themes'
                ? isHighContrast
                  ? 'text-yellow-400 font-bold border-b-2 border-yellow-400'
                  : isDark
                  ? 'text-amber-300 font-bold border-b-2 border-amber-400'
                  : 'text-amber-950 font-semibold border-b-2 border-amber-900'
                : 'hover:opacity-100'
            }`}
          >
            Estudos Temáticos
          </button>

          <button
            onClick={() => onNavigate('bookmarks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              currentView === 'bookmarks'
                ? isHighContrast
                  ? 'text-yellow-400 font-bold border-b-2 border-yellow-400'
                  : isDark
                  ? 'text-amber-300 font-bold border-b-2 border-amber-400'
                  : 'text-amber-950 font-semibold border-b-2 border-amber-900'
                : 'hover:opacity-100'
            }`}
          >
            Versículos Salvos
          </button>

          <button
            onClick={onOpenDailyAyah}
            className="whitespace-nowrap shrink-0 transition-colors py-1 hover:opacity-100 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Versículo do Dia</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action + settings affordance */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSettings}
            title="Ajustar Tipografia, Modo Escuro e Acessibilidade"
            className="p-2 hover:bg-current/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Configurações e Acessibilidade"
          >
            <Settings className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={onContinueLastRead}
            className={`px-4 py-2 text-xs font-semibold tracking-wide rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              isHighContrast
                ? 'bg-yellow-400 text-black font-bold hover:bg-yellow-300'
                : isDark
                ? 'bg-amber-400 text-slate-950 font-bold hover:bg-amber-300'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Continuar</span>
            <span className="truncate max-w-[110px] text-amber-200">
              {lastReadSurahName || 'Al-Fātihah'}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile nav bar strip */}
      <div
        className={`md:hidden flex items-center justify-around border-t py-2 px-2 text-xs font-medium ${
          isHighContrast
            ? 'bg-black text-white border-yellow-400/40'
            : isDark
            ? 'bg-[#0f1722] text-slate-300 border-slate-800'
            : 'bg-[#FBF9F5] text-stone-600 border-stone-200/60'
        }`}
      >
        <button
          onClick={() => onNavigate('catalog')}
          className={`px-2 py-1.5 rounded cursor-pointer ${
            currentView === 'catalog' ? 'font-bold bg-current/10' : ''
          }`}
        >
          Suratas
        </button>
        <button
          onClick={() => onNavigate('reader')}
          className={`px-2 py-1.5 rounded cursor-pointer ${
            currentView === 'reader' ? 'font-bold bg-current/10' : ''
          }`}
        >
          Leitura & Tafsir
        </button>
        <button
          onClick={() => onNavigate('themes')}
          className={`px-2 py-1.5 rounded cursor-pointer ${
            currentView === 'themes' ? 'font-bold bg-current/10' : ''
          }`}
        >
          Temas
        </button>
        <button
          onClick={() => onNavigate('bookmarks')}
          className={`px-2 py-1.5 rounded cursor-pointer ${
            currentView === 'bookmarks' ? 'font-bold bg-current/10' : ''
          }`}
        >
          Salvos
        </button>
      </div>
    </header>
  );
};
