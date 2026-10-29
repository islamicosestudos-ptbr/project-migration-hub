import { Ayah, SurahDetail } from '../types/quran';
import { ALL_SURAHS } from '../data/quranSurahs';
import { BUNDLED_SURAHS } from '../data/bundledTafsir';

const cache: Record<string, Ayah[]> = {};

export async function fetchSurahAyahs(
  surahNumber: number,
  primaryTranslation: 'pt.nasr' | 'pt.elhayek' = 'pt.nasr'
): Promise<Ayah[]> {
  // v3 separates results containing verified, verse-specific transliterations
  // from older entries that used the same generic Bismillah fallback.
  const cacheKey = `v3_${surahNumber}_dual_${primaryTranslation}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // Check localStorage cache
  try {
    const stored = localStorage.getItem(`quran_cache_${cacheKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const expectedCount = ALL_SURAHS.find((surah) => surah.number === surahNumber)?.totalAyahs;
      if (
        Array.isArray(parsed) &&
        parsed.length === expectedCount &&
        parsed.every(
          (ayah) =>
            typeof ayah.arabicText === 'string' &&
            Boolean(ayah.arabicText.trim()) &&
            typeof ayah.translation === 'string' &&
            Boolean(ayah.translation.trim()) &&
            typeof ayah.secondaryTranslation === 'string' &&
            Boolean(ayah.secondaryTranslation.trim())
        )
      ) {
        cache[cacheKey] = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }

  const bundled = BUNDLED_SURAHS[surahNumber];

  try {
    const res = await fetch(`/api/quran/surah/${surahNumber}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(json?.ayahs)) {
      throw new Error(json?.error || `Falha ao carregar a surata (${res.status}).`);
    }

    const formatted: Ayah[] = json.ayahs.map((ayah: any) => {
      const nasr = ayah?.translations?.['pt.nasr'];
      const elhayek = ayah?.translations?.['pt.elhayek'];
      if (!nasr?.trim() || !elhayek?.trim()) {
        throw new Error(`A tradução do versículo ${ayah?.numberInSurah || ''} está incompleta.`);
      }
      const primaryText = primaryTranslation === 'pt.nasr' ? nasr : elhayek;
      const secondaryText = primaryTranslation === 'pt.nasr' ? elhayek : nasr;
      const bundledAyah = bundled?.ayahs?.find(
        (item) => item.numberInSurah === ayah.numberInSurah
      );
      const remoteTransliteration =
        typeof ayah.transliteration === 'string' ? ayah.transliteration.trim() : '';
      const bundledTransliteration =
        typeof bundledAyah?.transliteration === 'string'
          ? bundledAyah.transliteration.trim()
          : '';

      return {
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        arabicText: ayah.arabicText,
        ...(remoteTransliteration || bundledTransliteration
          ? { transliteration: remoteTransliteration || bundledTransliteration }
          : {}),
        translation: primaryText,
        secondaryTranslation: secondaryText,
        juz: ayah.juz,
        page: ayah.page,
        sajda: Boolean(ayah.sajda),
        tafsirSummary: bundledAyah?.tafsirSummary,
        sourceProvenance: {
          quranText: 'alqurancloud:quran-uthmani',
          translations: ['quranenc:portuguese_nasr', 'alqurancloud:pt.elhayek'],
          ...(remoteTransliteration
            ? { transliteration: 'alqurancloud:en.transliteration' as const }
            : bundledTransliteration
              ? { transliteration: 'local:bundled' as const }
              : {}),
        },
      };
    });

    const expectedCount = ALL_SURAHS.find((surah) => surah.number === surahNumber)?.totalAyahs;
    if (!expectedCount || formatted.length !== expectedCount) {
      throw new Error('A fonte retornou uma quantidade incompleta de versículos.');
    }

    cache[cacheKey] = formatted;
    try {
      localStorage.setItem(`quran_cache_${cacheKey}`, JSON.stringify(formatted));
    } catch {
      // Storage may be unavailable or full; the in-memory result is still usable.
    }
    return formatted;
  } catch (error) {
    console.error(`Falha ao carregar a Surata ${surahNumber}:`, error);
    if (bundled?.ayahs?.length && primaryTranslation === 'pt.nasr') {
      const bundledAyahs = bundled.ayahs.map((ayah) => ({
        ...ayah,
        secondaryTranslation: ayah.secondaryTranslation || ayah.translation,
        sourceProvenance: {
          quranText: 'local:bundled' as const,
          translations: ['local:bundled' as const],
          ...(ayah.transliteration?.trim() ? { transliteration: 'local:bundled' as const } : {}),
        },
      }));
      cache[cacheKey] = bundledAyahs;
      return bundledAyahs;
    }
    throw error instanceof Error
      ? error
      : new Error('Não foi possível carregar as traduções desta surata. Verifique sua conexão e tente novamente.');
  }

}

export function getAudioUrl(globalAyahNumber: number, reciterId: string = 'ar.alafasy'): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`;
}

export async function askGeminiTafsir(params: {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  question?: string;
  mode?: string;
}): Promise<string> {
  const res = await fetch('/api/tafsir/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.details || 'Falha ao consultar Tafsir do Erudito.');
  }

  const data = await res.json();
  return data.tafsir;
}
