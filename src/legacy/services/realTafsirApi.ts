/**
 * Service for fetching REAL classical Tafsir data:
 * 1. QuranEnc: Portuguese Nasr translation and any verse notes returned by its API
 * 2. UmmahAPI / spa5k: Tafsir Ibn Kathir sources
 * 3. spa5k: Asbāb al-Nuzūl by Al-Wāḥidī
 * 4. Automatic translation to Portuguese on user request
 */

export interface HelmiNasrResult {
  surah: number;
  ayah: number;
  translation: string;
  footnotes: string;
  hasFootnotes: boolean;
  source: string;
  sourceUrl: string;
}

export interface IbnKathirResult {
  surah: number;
  ayah: number;
  text: string;
  hasText: boolean;
  language: string;
  source: string;
  author: string;
  sourceUrl: string;
  work: string;
  editionVersion: string;
}

export interface AsbabResult {
  surah: number;
  ayah: number;
  text: string;
  hasContext: boolean;
  availability: 'available' | 'not-found' | 'unavailable';
  language: string;
  source: string;
  author: string;
  sourceUrl: string;
  work: string;
  editionVersion: string;
}

const memoryHelmiNasr: Record<string, HelmiNasrResult> = {};
const memoryIbnKathir: Record<string, IbnKathirResult> = {};
const memoryAsbab: Record<string, AsbabResult> = {};
const memoryTranslations: Record<string, string> = {};

// 1. Fetch official notes of Dr. Helmi Nasr (Complexo do Rei Fahd de Medina)
export async function fetchRealHelmiNasr(surah: number, ayah: number): Promise<HelmiNasrResult> {
  const key = `${surah}:${ayah}`;
  if (memoryHelmiNasr[key]) {
    return memoryHelmiNasr[key];
  }

  try {
    // Try our server proxy first to avoid any CORS
    const res = await fetch(`/api/real-tafsir/helmi-nasr?surah=${surah}&ayah=${ayah}`);
    if (res.ok) {
      const data = await res.json();
      memoryHelmiNasr[key] = data;
      return data;
    }
  } catch (err) {
    console.warn('Proxy local do QuranEnc falhou, tentando direto:', err);
  }

  // Fallback direct call to QuranEnc
  try {
    const directRes = await fetch(`https://quranenc.com/api/v1/translation/sura/portuguese_nasr/${surah}`);
    if (directRes.ok) {
      const json = await directRes.json();
      const item = json.result?.find((x: any) => Number(x.aya) === ayah);
      const resData: HelmiNasrResult = {
        surah,
        ayah,
        translation: item?.translation || '',
        footnotes: item?.footnotes || '',
        hasFootnotes: Boolean(item?.footnotes && item.footnotes.trim().length > 0),
        source: 'QuranEnc',
        sourceUrl: `https://quranenc.com/api/v1/translation/sura/portuguese_nasr/${surah}`,
      };
      memoryHelmiNasr[key] = resData;
      return resData;
    }
  } catch (directErr) {
    console.error('Falha direta QuranEnc:', directErr);
  }

  return {
    surah,
    ayah,
    translation: '',
    footnotes: 'Não foi possível carregar as notas do QuranEnc no momento. Verifique sua conexão.',
    hasFootnotes: false,
    source: 'QuranEnc',
    sourceUrl: `https://quranenc.com/api/v1/translation/sura/portuguese_nasr/${surah}`,
  };
}

// 2. Fetch real Tafsir Ibn Kathir (from UmmahAPI with spa5k fallback)
export async function fetchRealIbnKathir(surah: number, ayah: number): Promise<IbnKathirResult> {
  const key = `${surah}:${ayah}`;
  if (memoryIbnKathir[key]) {
    return memoryIbnKathir[key];
  }

  try {
    const res = await fetch(`/api/real-tafsir/ibn-kathir?surah=${surah}&ayah=${ayah}`);
    if (res.ok) {
      const data = await res.json();
      memoryIbnKathir[key] = data;
      return data;
    }
  } catch (err) {
    console.warn('Proxy local de Ibn Kathir falhou, tentando público direto:', err);
  }

  // Fallback direct to UmmahAPI
  try {
    const uRes = await fetch(`https://ummahapi.com/api/tafsir/ibn_kathir/surah/${surah}/ayah/${ayah}`);
    if (uRes.ok) {
      const uData = await uRes.json();
      if (uData.success && uData.data?.tafsir?.text) {
        const resData: IbnKathirResult = {
          surah,
          ayah,
          text: uData.data.tafsir.text,
          hasText: true,
          language: uData.data.tafsir.language || 'en',
          source: 'UmmahAPI',
          author: uData.data.tafsir.author || '',
          work: uData.data.tafsir.name || 'Tafsir Ibn Kathir',
          editionVersion: /\babridged\b/i.test(uData.data.tafsir.name || '')
            ? 'Abridged (identificado pela API)'
            : '',
          sourceUrl: `https://ummahapi.com/api/tafsir/ibn_kathir/surah/${surah}/ayah/${ayah}`,
        };
        memoryIbnKathir[key] = resData;
        return resData;
      }
    }
  } catch (uErr) {
    console.warn('UmmahAPI direto falhou, tentando spa5k:', uErr);
  }

  // Fallback to spa5k GitHub raw
  try {
    const spaRes = await fetch(
      `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/en-tafisr-ibn-kathir/${surah}/${ayah}.json`
    );
    if (spaRes.ok) {
      const spaData = await spaRes.json();
      const resData: IbnKathirResult = {
        surah,
        ayah,
        text: spaData.text || 'Não há texto exegético disponível para esta referência nesta fonte.',
        hasText: Boolean(spaData.text?.trim()),
        language: 'en',
        source: 'spa5k/tafsir_api',
        author: '',
        work: 'Tafsir Ibn Kathir',
        editionVersion: '',
        sourceUrl: `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/en-tafisr-ibn-kathir/${surah}/${ayah}.json`,
      };
      memoryIbnKathir[key] = resData;
      return resData;
    }
  } catch (spaErr) {
    console.error('Falha spa5k direto:', spaErr);
  }

  return {
    surah,
    ayah,
    text: 'Não foi possível carregar o texto de Ibn Kathir no momento.',
    hasText: false,
    language: 'en',
    source: '',
    author: '',
    sourceUrl: '',
    work: '',
    editionVersion: '',
  };
}

// 3. Fetch real Asbāb al-Nuzūl by Al-Wāḥidī (via spa5k)
export async function fetchRealAsbab(surah: number, ayah: number): Promise<AsbabResult> {
  const key = `${surah}:${ayah}`;
  if (memoryAsbab[key]) {
    return memoryAsbab[key];
  }

  try {
    const res = await fetch(`/api/real-tafsir/asbab?surah=${surah}&ayah=${ayah}`);
    if (res.ok) {
      const data = await res.json();
      memoryAsbab[key] = data;
      return data;
    }
  } catch (err) {
    console.warn('Proxy local de Asbab falhou, tentando direto:', err);
  }

  // Fallback direct to GitHub raw
  const sourceUrl = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/en-asbab-al-nuzul-by-al-wahidi/${surah}/${ayah}.json`;
  let text = '';
  let availability: AsbabResult['availability'] = 'unavailable';
  try {
    const spaRes = await fetch(sourceUrl);
    if (spaRes.ok) {
      const spaData = await spaRes.json();
      text = spaData.text || '';
      availability = text.trim() ? 'available' : 'not-found';
    } else if (spaRes.status === 404) {
      availability = 'not-found';
    }
  } catch (spaErr) {
    console.error('Falha Asbab direto:', spaErr);
  }

  const resData: AsbabResult = {
    surah,
    ayah,
    text,
    hasContext: Boolean(text.trim()),
    availability,
    language: 'en',
    source: 'spa5k/tafsir_api',
    author: text ? 'Al-Wāḥidī' : '',
    sourceUrl: text
      ? sourceUrl
      : 'https://github.com/spa5k/tafsir_api/tree/main/tafsir/en-asbab-al-nuzul-by-al-wahidi',
    work: 'Asbāb al-Nuzūl de Al-Wāḥidī',
    editionVersion: '',
  };
  if (availability !== 'unavailable') memoryAsbab[key] = resData;
  return resData;
}

// 4. Translate English classical text to Portuguese
//
// IMPORTANTE: esta função devolve SEMPRE o texto traduzido completo ou lança um erro.
// Antes ela devolvia o texto em inglês em silêncio quando algo falhava, e a interface
// mostrava esse inglês com o selo "Tradução em Português", o que parecia texto cortado/errado.

/** Hash simples (FNV-1a) sobre o texto INTEIRO, para evitar colisões de cache. */
function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${text.length}_${(h >>> 0).toString(16)}`;
}

const TRANSLATE_TIMEOUT_MS = 240_000; // textos longos são traduzidos em partes no servidor

export async function translateTextToPortuguese(text: string, title?: string): Promise<string> {
  if (!text || text.trim().length === 0) return '';
  const key = hashText(text);
  if (memoryTranslations[key]) {
    return memoryTranslations[key];
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);

  try {
    const res = await fetch('/api/real-tafsir/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.translatedText || data.isOriginalFallback) {
      throw new Error(data?.error || 'A tradução não pôde ser concluída.');
    }

    memoryTranslations[key] = data.translatedText as string;
    return data.translatedText as string;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('A tradução demorou demais. Tente novamente.');
    }
    throw err instanceof Error ? err : new Error('Falha ao traduzir.');
  } finally {
    clearTimeout(timer);
  }
}
