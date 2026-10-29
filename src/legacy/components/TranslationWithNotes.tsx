import { useState } from 'react';

/** Splits QuranEnc footnotes ("[1] text\n[2] text") into a map keyed by number. */
export function parseFootnotes(raw?: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!raw) return map;
  const re = /\[(\d+)\]\s*([\s\S]*?)(?=\s*\[\d+\]|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) { const [, k, v] = m; if (k && v?.trim()) map[k] = v.trim(); }
  return map;
}

/** Removes "[n]" note markers (used where notes can't be shown: copy, audio bar, other translations). */
export function stripNoteMarkers(text: string): string {
  return text.replace(/\s?\[\d+\]/g, '').replace(/\s+([.,;:!?])/g, '$1');
}

interface Props {
  text: string;
  footnotes?: string | undefined;
  className?: string;
  style?: React.CSSProperties;
  isDark: boolean;
  isHighContrast: boolean;
}

/**
 * Renders a translation; "[n]" markers that have a matching translator note become
 * clickable superscripts that reveal the note below. Markers without a note are removed.
 */
export default function TranslationWithNotes({ text, footnotes, className, style, isDark, isHighContrast }: Props) {
  const notes = parseFootnotes(footnotes);
  const [open, setOpen] = useState<string | null>(null);
  const parts = text.split(/(\[\d+\])/g);
  const accent = isHighContrast ? 'text-yellow-300' : isDark ? 'text-amber-300' : 'text-amber-700';

  return (
    <div>
      <p className={className} style={style}>
        "
        {parts.map((part, i) => {
          const n = part.match(/^\[(\d+)\]$/)?.[1];
          if (!n) return <span key={i}>{part}</span>;
          if (!notes[n]) return null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(open === n ? null : n)}
              aria-expanded={open === n}
              aria-label={`Nota ${n} do tradutor`}
              className={`align-super text-[0.65em] font-bold px-0.5 rounded cursor-pointer underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${accent}`}
            >
              {n}
            </button>
          );
        })}
        "
      </p>
      {open && notes[open] && (
        <p
          role="note"
          className={`mt-2 border-l-2 pl-3 text-sm leading-relaxed font-editorial ${
            isHighContrast ? 'border-yellow-400 text-white' : isDark ? 'border-amber-300/40 text-slate-300' : 'border-amber-700/30 text-stone-600'
          }`}
        >
          <span className={`font-semibold ${accent}`}>Nota {open} (Helmi Nasr): </span>
          {notes[open]}
        </p>
      )}
    </div>
  );
}
