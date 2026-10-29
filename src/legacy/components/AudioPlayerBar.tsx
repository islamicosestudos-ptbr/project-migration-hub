import React, { useRef, useEffect, useState } from 'react';
import { Ayah, SurahMeta } from '../types/quran';
import { RECITERS } from '../data/quranSurahs';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  X,
  User,
  Gauge
} from 'lucide-react';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  activeAyah: Ayah | null;
  surah: SurahMeta;
  reciterId: string;
  isLoopingAyah: boolean;
  playbackSpeed: number;
  playbackRepeatCount: number;
  onTogglePlay: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onToggleLoop: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeRepeatCount: (count: number) => void;
  onChangeReciter: (id: string) => void;
  onClose: () => void;
  audioUrl: string | null;
  onAudioEnded: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  activeAyah,
  surah,
  reciterId,
  isLoopingAyah,
  playbackSpeed = 1.0,
  playbackRepeatCount = 1,
  onTogglePlay,
  onNextAyah,
  onPrevAyah,
  onToggleLoop,
  onChangeSpeed,
  onChangeRepeatCount,
  onChangeReciter,
  onClose,
  audioUrl,
  onAudioEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPlayIteration, setCurrentPlayIteration] = useState<number>(1);

  // Reset repeat counter when active ayah changes
  useEffect(() => {
    setCurrentPlayIteration(1);
  }, [activeAyah?.number]);

  // Sync playback speed and play/pause
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Audio play thwarted by browser autoplay policy:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioUrl, isPlaying]);

  if (!activeAyah && !audioUrl) return null;

  const handleCustomAudioEnded = () => {
    if (isLoopingAyah || playbackRepeatCount > 1) {
      if (playbackRepeatCount === 999 || currentPlayIteration < playbackRepeatCount) {
        setCurrentPlayIteration((prev) => prev + 1);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        return;
      }
    }
    // Completed repetitions, proceed to next ayah
    setCurrentPlayIteration(1);
    onAudioEnded();
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5];
  const repeatOptions = [
    { count: 1, label: '1x (Sem repetição)' },
    { count: 2, label: '2x por versículo' },
    { count: 3, label: '3x (Memorização)' },
    { count: 5, label: '5x (Hifz intensivo)' },
    { count: 999, label: 'Repetir continuamente (∞)' },
  ];

  return (
    <aside
      aria-label="Controle de Áudio da Recitação"
      className="fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-t border-stone-800 px-4 py-3 shadow-2xl transition-all"
    >
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={handleCustomAudioEnded}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Current Ayah Info */}
        <div className="flex items-center gap-3 w-full md:w-auto truncate">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-300">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="font-semibold text-stone-200">
                {surah.transliteration}
              </span>
              <span>·</span>
              <span>Versículo {activeAyah?.numberInSurah || 1} de {surah.totalAyahs}</span>
              {playbackRepeatCount > 1 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-mono text-[10px]">
                  Repetição {currentPlayIteration}/{playbackRepeatCount === 999 ? '∞' : playbackRepeatCount}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-200/90 truncate font-editorial max-w-xs sm:max-w-md">
              {activeAyah?.translation || 'Recitação do Nobre Alcorão'}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={onPrevAyah}
            title="Versículo Anterior"
            className="p-2 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pausar' : 'Reproduzir'}
            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextAyah}
            title="Próximo Versículo"
            className="p-2 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Repeat Interval Selector for Hifz */}
          <div className="flex items-center gap-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-300">
            <Repeat className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={playbackRepeatCount}
              onChange={(e) => onChangeRepeatCount(Number(e.target.value))}
              className="bg-transparent text-stone-200 focus:outline-none cursor-pointer text-[11px]"
              title="Quantas vezes repetir cada versículo (ideal para memorização Hifz)"
            >
              {repeatOptions.map((opt) => (
                <option key={opt.count} value={opt.count} className="bg-stone-900 text-stone-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-300">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={playbackSpeed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="bg-transparent text-stone-200 focus:outline-none cursor-pointer text-[11px]"
              title="Velocidade de reprodução"
            >
              {speedOptions.map((s) => (
                <option key={s} value={s} className="bg-stone-900 text-stone-100">
                  {s}x
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Reciter Picker & Close */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-stone-800/80 border border-stone-700 rounded-lg px-2.5 py-1 text-xs">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={reciterId}
              onChange={(e) => onChangeReciter(e.target.value)}
              className="bg-transparent text-stone-200 focus:outline-none cursor-pointer text-xs"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id} className="bg-stone-900 text-stone-100">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onClose}
            title="Encerrar Áudio"
            className="p-1.5 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
