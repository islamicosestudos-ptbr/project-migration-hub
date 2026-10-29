export type RevelationType = 'Meca' | 'Medina';

export interface SurahMeta {
  number: number;
  name: string; // Arabic with tashkeel
  transliteration: string;
  portugueseName: string;
  totalAyahs: number;
  revelationType: RevelationType;
  revelationOrder: number;
  juzStart: number;
  summary: string;
}

export interface Ayah {
  number: number; // Global number 1..6236
  numberInSurah: number; // 1..N
  arabicText: string;
  transliteration?: string;
  translation: string;
  secondaryTranslation?: string; // e.g. Samir El-Hayek for side-by-side
  juz?: number;
  page?: number;
  sajda?: boolean;
  tafsirSummary?: string;
  sourceProvenance?: {
    quranText: 'alqurancloud:quran-uthmani' | 'local:bundled';
    translations: Array<'quranenc:portuguese_nasr' | 'alqurancloud:pt.elhayek' | 'local:bundled'>;
    transliteration?: 'alqurancloud:en.transliteration' | 'local:bundled';
  };
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name: string;
  style: string;
  apiIdentifier: string;
}

export interface QuranTheme {
  id: string;
  title: string;
  description: string;
  category: 'doutrina' | 'profetas' | 'virtudes' | 'ciencia' | 'duas';
  iconName: string;
  verses: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    arabicPreview: string;
    translationPreview: string;
    themeNote: string;
  }[];
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  savedAt: string;
  note?: string;
  tag?: string;
}

export type AppTheme = 'paper' | 'dark' | 'highContrast' | 'light';
export type VerseSpacing = 'compact' | 'normal' | 'spacious' | 'dyslexic';
export type ArabicFontFamily = 'amiriQuran' | 'amiri' | 'scheherazade' | 'notoNaskh';
export type PortugueseFontFamily = 'serif' | 'sans' | 'lexend';
export type InlineTafsirSource = 'ibnKathir' | 'asbabNuzul' | 'helmiNasr' | 'practical';

export interface ReaderSettings {
  translationId: 'pt.nasr' | 'pt.elhayek';
  verseReferenceStyle: 'surahName' | 'generic';
  arabicFontSize: number; // 22 to 56
  transliterationFontSize: number; // 12 to 24
  translationFontSize: number; // 14 to 28
  arabicLineHeight: number; // 1.8 to 3.2
  translationLineHeight: number; // 1.4 to 2.6
  verseSpacing: VerseSpacing;
  arabicFont: ArabicFontFamily;
  portugueseFont: PortugueseFontFamily;
  showTransliteration: boolean;
  theme: AppTheme;
  viewMode: 'verse' | 'mushaf';
  reciterId: string;
  
  // Advanced reading & Hifz options
  sideBySideTranslation: boolean;
  readingRuler: boolean;
  hifzMode: boolean;
  hifzRevealedAyahs: number[];
  playbackSpeed: number; // 0.75, 1.0, 1.25, 1.5
  playbackRepeatCount: number; // 1, 2, 3, 5, 999
  inlineTafsirSources: InlineTafsirSource[];
}
