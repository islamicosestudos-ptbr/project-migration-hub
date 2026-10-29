// Public Quran / tafsir source proxies, ported from the original Express server.
const quranSurahCache: Record<number, any[]> = {};
const quranEncCache: Record<number, any[]> = {};
const ibnKathirCache: Record<string, any> = {};
const asbabCache: Record<string, any> = {};

export async function getSurah(surahNumber: number): Promise<any> {
    if (quranSurahCache[surahNumber]) {
      return ({ surah: surahNumber, ayahs: quranSurahCache[surahNumber] });
    }

    try {
      const [quranResponse, nasrResponse] = await Promise.all([
        fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,pt.elhayek,en.transliteration`,
          { signal: AbortSignal.timeout(15_000) }
        ),
        fetch(
          `https://quranenc.com/api/v1/translation/sura/portuguese_nasr/${surahNumber}`,
          { signal: AbortSignal.timeout(15_000) }
        ),
      ]);

      if (!quranResponse.ok || !nasrResponse.ok) {
        throw new Error(`Fontes de tradução indisponíveis (${quranResponse.status}/${nasrResponse.status}).`);
      }

      const [quranJson, nasrJson] = await Promise.all([
        quranResponse.json(),
        nasrResponse.json(),
      ]);
      const editions = Array.isArray(quranJson?.data) ? quranJson.data : [];
      const arabicAyahs = editions.find((edition: any) => edition?.edition?.identifier === 'quran-uthmani')?.ayahs;
      const elhayekAyahs = editions.find((edition: any) => edition?.edition?.identifier === 'pt.elhayek')?.ayahs;
      const transliterationAyahs = editions.find(
        (edition: any) => edition?.edition?.identifier === 'en.transliteration'
      )?.ayahs;
      const nasrAyahs = Array.isArray(nasrJson?.result) ? nasrJson.result : [];

      if (!Array.isArray(arabicAyahs) || !Array.isArray(elhayekAyahs) || nasrAyahs.length === 0) {
        throw new Error('As fontes não retornaram as edições esperadas para esta surata.');
      }

      const nasrByAyah = new Map(nasrAyahs.map((ayah: any) => [Number(ayah.aya), ayah]));
      const elhayekByAyah = new Map(
        elhayekAyahs.map((ayah: any) => [Number(ayah.numberInSurah), ayah])
      );
      const transliterationByAyah = new Map(
        (Array.isArray(transliterationAyahs) ? transliterationAyahs : []).map((ayah: any) => [
          Number(ayah.numberInSurah),
          ayah,
        ])
      );
      const formatted = arabicAyahs.map((arabic: any) => {
        const ayahNumber = Number(arabic.numberInSurah);
        const nasr = (nasrByAyah.get(ayahNumber) as any)?.translation?.trim() || '';
        const elhayek = (elhayekByAyah.get(ayahNumber) as any)?.text?.trim() || '';
        const transliteration =
          (transliterationByAyah.get(ayahNumber) as any)?.text?.trim() || '';
        if (!arabic.text?.trim() || !nasr || !elhayek) {
          throw new Error(`A tradução do versículo ${ayahNumber} está incompleta.`);
        }

        return {
          number: arabic.number,
          numberInSurah: ayahNumber,
          arabicText: arabic.text,
          ...(transliteration ? { transliteration } : {}),
          translations: { 'pt.nasr': nasr, 'pt.elhayek': elhayek },
          juz: arabic.juz,
          page: arabic.page,
          sajda: Boolean(arabic.sajda),
        };
      });

      quranSurahCache[surahNumber] = formatted;
      return ({ surah: surahNumber, ayahs: formatted });
}

export async function getHelmiNasr(surah: number, ayah: number): Promise<any> {
      if (!quranEncCache[surah]) {
        const fetchRes = await fetch(
          `https://quranenc.com/api/v1/translation/sura/portuguese_nasr/${surah}`
        );
        if (!fetchRes.ok) {
          throw new Error(`QuranEnc respondeu com status ${fetchRes.status}`);
        }
        const data = await fetchRes.json();
        if (data.result && Array.isArray(data.result)) {
          quranEncCache[surah] = data.result;
        }
      }

      const surahData = quranEncCache[surah] || [];
      const item = surahData.find((x: any) => Number(x.aya) === ayah);

      return ({
        surah,
        ayah,
        translation: item?.translation || '',
        footnotes: item?.footnotes || '',
        hasFootnotes: Boolean(item?.footnotes && item.footnotes.trim().length > 0),
        source: 'QuranEnc (Complexo do Rei Fahd para Impressão do Nobre Alcorão, Medina)',
        sourceUrl: `https://quranenc.com/api/v1/translation/sura/portuguese_nasr/${surah}`,
      });
}

export async function getIbnKathir(surah: number, ayah: number): Promise<any> {
      const cacheKey = `${surah}:${ayah}`;
      if (ibnKathirCache[cacheKey]) {
        return (ibnKathirCache[cacheKey]);
      }

      let text = '';
      let provider = '';
      let sourceUrl = '';
      let work = '';
      let author = '';
      let editionVersion = '';
      let language = 'en';

      try {
        // Try UmmahAPI first
        const ummahUrl = `https://ummahapi.com/api/tafsir/ibn_kathir/surah/${surah}/ayah/${ayah}`;
        const ummahRes = await fetch(
          ummahUrl
        );
        if (ummahRes.ok) {
          const uData = await ummahRes.json();
          const tafsir = uData.data?.tafsir;
          if (uData.success && tafsir?.text) {
            text = tafsir.text;
            provider = 'UmmahAPI';
            sourceUrl = ummahUrl;
            work = tafsir.name || 'Tafsir Ibn Kathir';
            author = tafsir.author || '';
            language = tafsir.language || 'en';
            editionVersion = /\babridged\b/i.test(work) ? 'Abridged (identificado pela API)' : '';
          }
        }
      } catch (errUmmah: any) {
        console.warn('UmmahAPI falhou, tentando spa5k:', errUmmah?.message);
      }

      // If UmmahAPI failed or was empty, fallback to spa5k GitHub raw
      if (!text) {
        const spaUrl = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/en-tafisr-ibn-kathir/${surah}/${ayah}.json`;
        const spaRes = await fetch(
          spaUrl
        );
        if (spaRes.ok) {
          const spaData = await spaRes.json();
          text = spaData.text || '';
          if (text) {
            provider = 'spa5k/tafsir_api';
            sourceUrl = spaUrl;
            work = 'Tafsir Ibn Kathir';
          }
        }
      }

      const result = {
        surah,
        ayah,
        text: text || 'Não há texto exegético disponível para esta referência nas fontes consultadas.',
        hasText: Boolean(text.trim()),
        language,
        source: provider,
        sourceUrl,
        work,
        author,
        editionVersion,
      };

      ibnKathirCache[cacheKey] = result;
      return (result);
}

export async function getAsbab(surah: number, ayah: number): Promise<any> {
      const cacheKey = `${surah}:${ayah}`;
      if (asbabCache[cacheKey]) {
        return (asbabCache[cacheKey]);
      }

      let text = '';
      let availability: 'available' | 'not-found' | 'unavailable' = 'unavailable';
      const sourceUrl = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/en-asbab-al-nuzul-by-al-wahidi/${surah}/${ayah}.json`;
      try {
        const asbabRes = await fetch(sourceUrl);
        if (asbabRes.ok) {
          const aData = await asbabRes.json();
          text = aData.text || '';
          availability = text.trim() ? 'available' : 'not-found';
        } else if (asbabRes.status === 404) {
          availability = 'not-found';
        } else {
          throw new Error(`A fonte respondeu com status ${asbabRes.status}`);
        }
      } catch (errAsbab: any) {
        console.warn('Erro ao carregar Asbab spa5k:', errAsbab?.message);
      }

      const result = {
        surah,
        ayah,
        text,
        hasContext: Boolean(text && text.trim().length > 0),
        availability,
        language: 'en',
        source: 'spa5k/tafsir_api',
        sourceUrl: availability === 'available'
          ? sourceUrl
          : 'https://github.com/spa5k/tafsir_api/tree/main/tafsir/en-asbab-al-nuzul-by-al-wahidi',
        work: 'Asbāb al-Nuzūl de Al-Wāḥidī',
        author: text ? 'Al-Wāḥidī' : '',
        editionVersion: '',
      };

      asbabCache[cacheKey] = result;
      return (result);
}
