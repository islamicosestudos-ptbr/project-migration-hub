import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ALL_SURAHS, RECITERS } from './data/quranSurahs';
import { Ayah, Bookmark, ReaderSettings, SurahMeta } from './types/quran';
import { fetchSurahAyahs, getAudioUrl } from './services/quranApi';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SurahCatalog } from './components/SurahCatalog';
import { QuranReader } from './components/QuranReader';
import { TafsirDrawer } from './components/TafsirDrawer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ThematicExplorer } from './components/ThematicExplorer';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { DailyAyahModal } from './components/DailyAyahModal';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_SETTINGS: ReaderSettings = {
  translationId: 'pt.nasr',
  verseReferenceStyle: 'surahName',
  arabicFontSize: 32,
  transliterationFontSize: 15,
  translationFontSize: 17,
  arabicLineHeight: 2.4,
  translationLineHeight: 1.8,
  verseSpacing: 'normal',
  arabicFont: 'amiriQuran',
  portugueseFont: 'serif',
  showTransliteration: true,
  theme: 'paper',
  viewMode: 'verse',
  reciterId: 'ar.alafasy',
  sideBySideTranslation: false,
  readingRuler: false,
  hifzMode: false,
  hifzRevealedAyahs: [],
  playbackSpeed: 1.0,
  playbackRepeatCount: 1,
  inlineTafsirSources: ['ibnKathir', 'asbabNuzul', 'helmiNasr', 'practical'],
};

export default function App() {
  const [currentView, setCurrentView] = useState<'catalog' | 'reader' | 'themes' | 'bookmarks'>('catalog');
  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(true);
  const [ayahLoadError, setAyahLoadError] = useState<string | null>(null);
  const [ayahLoadAttempt, setAyahLoadAttempt] = useState(0);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);

  // Settings with full accessibility and visual comfort properties
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('quran_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Sync body theme class whenever theme changes
  useEffect(() => {
    document.body.className = `theme-${settings.theme} antialiased transition-colors duration-200`;
  }, [settings.theme]);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('quran_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Last read Surah
  const [lastRead, setLastRead] = useState<{ surahNumber: number; ayahNumber?: number }>(() => {
    try {
      const saved = localStorage.getItem('quran_last_read');
      return saved ? JSON.parse(saved) : { surahNumber: 1, ayahNumber: 1 };
    } catch {
      return { surahNumber: 1, ayahNumber: 1 };
    }
  });

  // Modals & Drawers
  const [tafsirDrawerOpen, setTafsirDrawerOpen] = useState<boolean>(false);
  const [tafsirAyah, setTafsirAyah] = useState<Ayah | null>(null);
  const [bookmarksDrawerOpen, setBookmarksDrawerOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [dailyAyahModalOpen, setDailyAyahModalOpen] = useState<boolean>(false);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentAudioAyahIndex, setCurrentAudioAyahIndex] = useState<number>(0);
  const [isLoopingAyah, setIsLoopingAyah] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSurahMeta: SurahMeta = useMemo(() => {
    return ALL_SURAHS.find((s) => s.number === activeSurahNumber) || ALL_SURAHS[0];
  }, [activeSurahNumber]);

  // Load ayahs whenever activeSurahNumber or translationId changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingAyahs(true);
    setAyahs([]);
    setAyahLoadError(null);

    fetchSurahAyahs(activeSurahNumber, settings.translationId)
      .then((loadedAyahs) => {
        if (!isCancelled) {
          setAyahs(loadedAyahs);
          setIsLoadingAyahs(false);
          const updated = { surahNumber: activeSurahNumber, ayahNumber: 1 };
          setLastRead(updated);
          try {
            localStorage.setItem('quran_last_read', JSON.stringify(updated));
          } catch (e) {
            // ignore
          }
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar versículos:', err);
        if (!isCancelled) {
          setAyahLoadError(err?.message || 'Não foi possível carregar esta surata.');
          setIsLoadingAyahs(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSurahNumber, settings.translationId, ayahLoadAttempt]);

  // Update settings in state and localStorage
  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('quran_settings', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Bookmark actions
  const isAyahBookmarked = useCallback(
    (globalAyahNumber: number) => {
      return bookmarks.some((b) => b.surahNumber === activeSurahNumber && b.ayahNumber === globalAyahNumber);
    },
    [bookmarks, activeSurahNumber]
  );

  const handleToggleBookmark = (ayah: Ayah) => {
    setBookmarks((prev) => {
      const existing = prev.find(
        (b) => b.surahNumber === activeSurahNumber && b.ayahNumber === ayah.numberInSurah
      );
      let updated: Bookmark[];
      if (existing) {
        updated = prev.filter((b) => b.id !== existing.id);
      } else {
        const newBm: Bookmark = {
          id: `${activeSurahNumber}_${ayah.numberInSurah}_${Date.now()}`,
          surahNumber: activeSurahNumber,
          surahName: activeSurahMeta.transliteration,
          ayahNumber: ayah.numberInSurah,
          arabicText: ayah.arabicText,
          translationText: ayah.translation,
          savedAt: new Date().toISOString(),
        };
        updated = [newBm, ...prev];
      }
      try {
        localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleUpdateBookmarkNote = (id: string, note: string) => {
    setBookmarks((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, note } : b));
      try {
        localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Audio Handlers
  const currentAudioAyah = ayahs[currentAudioAyahIndex] || null;
  const audioUrl = currentAudioAyah
    ? getAudioUrl(currentAudioAyah.number, settings.reciterId)
    : null;

  const handlePlayAyah = (ayah: Ayah) => {
    const idx = ayahs.findIndex((a) => a.number === ayah.number);
    if (idx !== -1) {
      setCurrentAudioAyahIndex(idx);
      setActiveAyahNumber(ayah.number);
      setIsPlayingAudio(true);
    }
  };

  const handleTogglePlaySurah = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      if (!currentAudioAyah && ayahs.length > 0) {
        setCurrentAudioAyahIndex(0);
        setActiveAyahNumber(ayahs[0].number);
      }
      setIsPlayingAudio(true);
    }
  };

  const handleNextAudioAyah = () => {
    if (currentAudioAyahIndex < ayahs.length - 1) {
      const nextIdx = currentAudioAyahIndex + 1;
      setCurrentAudioAyahIndex(nextIdx);
      setActiveAyahNumber(ayahs[nextIdx].number);
      setIsPlayingAudio(true);
    } else if (activeSurahNumber < 114) {
      setActiveSurahNumber(activeSurahNumber + 1);
      setCurrentAudioAyahIndex(0);
      setIsPlayingAudio(true);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handlePrevAudioAyah = () => {
    if (currentAudioAyahIndex > 0) {
      const prevIdx = currentAudioAyahIndex - 1;
      setCurrentAudioAyahIndex(prevIdx);
      setActiveAyahNumber(ayahs[prevIdx].number);
      setIsPlayingAudio(true);
    }
  };

  const handleAudioEnded = () => {
    if (!isLoopingAyah) {
      handleNextAudioAyah();
    }
  };

  // Navigation Handlers
  const handleSelectSurah = (num: number) => {
    setActiveSurahNumber(num);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToVerse = (surahNumber: number, ayahNumber?: number) => {
    setActiveSurahNumber(surahNumber);
    setCurrentView('reader');
    if (ayahNumber) {
      setTimeout(() => {
        setActiveAyahNumber(ayahNumber);
      }, 400);
    }
  };

  const handleOpenTafsirForAyah = (ayah: Ayah) => {
    setTafsirAyah(ayah);
    setTafsirDrawerOpen(true);
  };

  const handleOpenTafsirForRef = async (surahNumber: number, ayahNumber: number) => {
    setActiveSurahNumber(surahNumber);
    try {
      const targetAyahs = await fetchSurahAyahs(surahNumber, settings.translationId);
      const found = targetAyahs.find((a) => a.numberInSurah === ayahNumber) || targetAyahs[0];
      setTafsirAyah(found);
    } catch {
      setTafsirAyah({
        number: ayahNumber,
        numberInSurah: ayahNumber,
        arabicText: '',
        translation: '',
      });
    }
    setTafsirDrawerOpen(true);
  };

  const handleContinueLastRead = () => {
    setActiveSurahNumber(lastRead.surahNumber || 1);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Daily Ayah computation
  const dailyAyahData = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const inspirations = [
      {
        surahNumber: 2,
        surahName: "Al-Baqarah",
        portugueseName: "A Vaca",
        ayahNumber: 255,
        arabicText: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
        translation: "Deus! Não há divindade além d'Ele, o Vivente, o Sustentador de tudo...",
        reflection: "A segurança absoluta reside em saber que Aquele que governa o cosmos não dorme e cuida de cada detalhe da sua existência com ciência perfeita."
      },
      {
        surahNumber: 94,
        surahName: "Ash-Sharh",
        portugueseName: "A Abertura",
        ayahNumber: 5,
        arabicText: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        translation: "Pois, em verdade, com a dificuldade está a facilidade. Sim, com a dificuldade está a facilidade!",
        reflection: "Não perca a esperança diante dos momentos difíceis. O socorro divino não tarda e o alívio já está preparado para o coração perseverante."
      },
      {
        surahNumber: 13,
        surahName: "Ar-Ra'd",
        portugueseName: "O Trovão",
        ayahNumber: 28,
        arabicText: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
        translation: "Porventura, não é pela recordação de Deus que os corações encontram tranquilidade?",
        reflection: "Quando a ansiedade do mundo tentar perturbar sua paz, volte seus pensamentos e orações ao Criador; ali reside o verdadeiro repouso da alma."
      },
      {
        surahNumber: 39,
        surahName: "Az-Zumar",
        portugueseName: "Os Grupos",
        ayahNumber: 53,
        arabicText: "قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ",
        translation: "Dize: Ó Meus servos que pecastes contra vós mesmos! Não desespereis da misericórdia de Deus...",
        reflection: "A misericórdia de Deus é mais ampla do que todos os erros humanos juntos. O arrependimento sincero renova todo o destino."
      }
    ];
    return inspirations[dayOfYear % inspirations.length];
  }, []);

  const themeContainerClass = useMemo(() => {
    if (settings.theme === 'highContrast') {
      return 'bg-black text-white selection:bg-yellow-400 selection:text-black';
    }
    if (settings.theme === 'dark') {
      return 'bg-[#0c1117] text-slate-100 selection:bg-amber-400 selection:text-black';
    }
    if (settings.theme === 'light') {
      return 'bg-white text-slate-900 selection:bg-blue-200 selection:text-black';
    }
    return 'bg-[#FBF9F5] text-stone-900 selection:bg-amber-200 selection:text-stone-900';
  }, [settings.theme]);

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-24 transition-colors duration-200 ${themeContainerClass}`}>
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        theme={settings.theme}
        onNavigate={(view) => {
          if (view === 'bookmarks') {
            setBookmarksDrawerOpen(true);
          } else {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenDailyAyah={() => setDailyAyahModalOpen(true)}
        lastReadSurahName={ALL_SURAHS.find((s) => s.number === lastRead.surahNumber)?.transliteration}
        onContinueLastRead={handleContinueLastRead}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'catalog' && (
          <>
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectSurah={handleSelectSurah}
              onQuickJump={handleJumpToVerse}
            />
            <SurahCatalog
              searchQuery={searchQuery}
              onSelectSurah={handleSelectSurah}
              onPlaySurah={(num) => {
                handleSelectSurah(num);
                setTimeout(() => handleTogglePlaySurah(), 500);
              }}
              activeSurahNumber={activeSurahNumber}
              theme={settings.theme}
            />
          </>
        )}

        {currentView === 'reader' && (
          <QuranReader
            surah={activeSurahMeta}
            ayahs={ayahs}
            isLoading={isLoadingAyahs}
            loadError={ayahLoadError}
            onRetryLoad={() => setAyahLoadAttempt((attempt) => attempt + 1)}
            activeAyahNumber={activeAyahNumber}
            isPlayingAudio={isPlayingAudio}
            settings={settings}
            onSelectAyahForTafsir={handleOpenTafsirForAyah}
            onPlayAyah={handlePlayAyah}
            onTogglePlaySurah={handleTogglePlaySurah}
            onSaveBookmark={handleToggleBookmark}
            isAyahBookmarked={isAyahBookmarked}
            onNavigateSurah={(num) => {
              setActiveSurahNumber(num);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onChangeTranslation={(trans) => handleUpdateSettings({ translationId: trans })}
            onQuickUpdateSettings={handleUpdateSettings}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
        )}

        {currentView === 'themes' && (
          <ThematicExplorer
            onJumpToVerse={handleJumpToVerse}
            onOpenTafsirForRef={handleOpenTafsirForRef}
          />
        )}
      </main>

      {/* Persistent Audio Recitation Bar */}
      <AudioPlayerBar
        isPlaying={isPlayingAudio}
        activeAyah={currentAudioAyah}
        surah={activeSurahMeta}
        reciterId={settings.reciterId}
        isLoopingAyah={isLoopingAyah}
        playbackSpeed={settings.playbackSpeed || 1.0}
        playbackRepeatCount={settings.playbackRepeatCount || 1}
        onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
        onNextAyah={handleNextAudioAyah}
        onPrevAyah={handlePrevAudioAyah}
        onToggleLoop={() => setIsLoopingAyah(!isLoopingAyah)}
        onChangeSpeed={(spd) => handleUpdateSettings({ playbackSpeed: spd })}
        onChangeRepeatCount={(cnt) => handleUpdateSettings({ playbackRepeatCount: cnt })}
        onChangeReciter={(id) => handleUpdateSettings({ reciterId: id })}
        onClose={() => {
          setIsPlayingAudio(false);
          setActiveAyahNumber(null);
        }}
        audioUrl={audioUrl}
        onAudioEnded={handleAudioEnded}
      />

      {/* Tafsir Exegesis Drawer */}
      <TafsirDrawer
        isOpen={tafsirDrawerOpen}
        onClose={() => setTafsirDrawerOpen(false)}
        surah={activeSurahMeta}
        ayah={tafsirAyah}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={bookmarksDrawerOpen}
        onClose={() => setBookmarksDrawerOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onUpdateNote={handleUpdateBookmarkNote}
        onJumpToVerse={handleJumpToVerse}
      />

      {/* Settings & Accessibility Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Daily Ayah Modal */}
      <DailyAyahModal
        isOpen={dailyAyahModalOpen}
        onClose={() => setDailyAyahModalOpen(false)}
        ayah={dailyAyahData}
        onOpenInReader={handleJumpToVerse}
        onOpenTafsir={() => {
          handleJumpToVerse(dailyAyahData.surahNumber, dailyAyahData.ayahNumber);
          setTafsirDrawerOpen(true);
        }}
      />
    </div>
  );
}
