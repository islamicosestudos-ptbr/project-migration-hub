import React from 'react';
import { Search, BookOpen, Sparkles, Volume2 } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSurah: (surahNumber: number) => void;
  onQuickJump: (surahNumber: number, ayahNumber?: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSelectSurah,
  onQuickJump,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-stone-200/80 bg-stone-900 text-stone-100">
      {/* Visual Focal Anchor: Illuminated Archival Artwork */}
      <div className="absolute inset-0 opacity-25 mix-blend-luminosity pointer-events-none">
        <img
          src="/src/assets/images/quran_illumination_banner_1793206586337.jpg"
          alt="Manuscrito Alcorânico Iluminado"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Subtle linear scrim for contrast compliance */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/85 to-stone-900/70" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl">
          {/* Metadata Discipline: unboxed text with typographic separator */}
          <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-amber-300/85 mb-3">
            <span>Al-Qur'an Al-Karim</span>
            <span aria-hidden="true">·</span>
            <span>Tradução Oficial & Exegese</span>
            <span aria-hidden="true">·</span>
            <span>114 Suratas</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-amber-50 tracking-tight leading-tight [text-wrap:balance]">
            O Nobre Alcorão com Tafsir em Língua Portuguesa
          </h1>

          <p className="mt-3 text-base sm:text-lg text-stone-300 font-editorial leading-relaxed max-w-2xl">
            Texto sagrado em caligrafia árabe Uthmani acompanhado da tradução acadêmica do 
            Dr. Helmi Nasr e Samir El-Hayek, com exegese versículo a versículo e estudos teológicos aprofundados.
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por surata, versículo ou palavra (ex: Fatihah, misericórdia, Moisés, paciência)..."
                className="w-full pl-12 pr-4 py-3 bg-stone-950/80 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-xs text-stone-400 hover:text-stone-200 px-2 py-1"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-400">
            <span className="text-stone-300">Acesso Rápido:</span>
            <button
              onClick={() => onSelectSurah(1)}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              1. Al-Fatihah
            </button>
            <span>·</span>
            <button
              onClick={() => onQuickJump(2, 255)}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              Ayat al-Kursi (2:255)
            </button>
            <span>·</span>
            <button
              onClick={() => onSelectSurah(18)}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              18. Al-Kahf
            </button>
            <span>·</span>
            <button
              onClick={() => onSelectSurah(36)}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              36. Ya-Sin
            </button>
            <span>·</span>
            <button
              onClick={() => onSelectSurah(67)}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              67. Al-Mulk
            </button>
            <span>·</span>
            <button
              onClick={() => onSelectSurah(112)}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              112. Al-Ikhlas
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
