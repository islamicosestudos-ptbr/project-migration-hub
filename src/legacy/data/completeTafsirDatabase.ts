// Types and definitions for Real Tafsir Data (QuranEnc, UmmahAPI, spa5k)

export interface RealTafsirSourceInfo {
  name: string;
  sourceUrl: string;
  provider: string;
  language: 'pt' | 'en' | 'ar';
}

export interface RealTafsirEntry {
  surahNumber: number;
  ayahNumber: number;
  helmiNasrNotes?: string;
  helmiNasrSource?: string;
  ibnKathirText?: string;
  ibnKathirTranslation?: string;
  ibnKathirSource?: string;
  asbabText?: string;
  asbabTranslation?: string;
  asbabSource?: string;
}

export const TAFSIR_SOURCES: Record<string, RealTafsirSourceInfo> = {
  helmiNasr: {
    name: "Notas Oficiais do Dr. Helmi Nasr",
    provider: "QuranEnc (Complexo do Rei Fahd de Medina)",
    sourceUrl: "https://quranenc.com/api/v1/translation/sura/portuguese_nasr/",
    language: "pt",
  },
  ibnKathir: {
    name: "Tafsir Ibn Kathir (Abridged)",
    provider: "UmmahAPI / spa5k tafsir_api",
    sourceUrl: "https://ummahapi.com/api/tafsir/ibn_kathir/surah/",
    language: "en",
  },
  asbabNuzul: {
    name: "Asbāb al-Nuzūl de Al-Wāḥidī",
    provider: "spa5k / Royal Aal al-Bayt Institute",
    sourceUrl: "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/en-asbab-al-nuzul-by-al-wahidi/",
    language: "en",
  },
};
