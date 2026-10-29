import { useId, useState } from "react";

/**
 * A verified bibliographic reference for a verse or its commentary.
 * Empty strings are omitted from the expanded bibliography.
 */
export interface VerseSourceCitation {
  category: string;
  title: string;
  author: string;
  editionVersion: string;
  platform: string;
  verseReference: string;
  url: string;
  note?: string;
}

export interface VerseSourceDetailsProps {
  citations: readonly VerseSourceCitation[];
  isDark: boolean;
  isHighContrast: boolean;
  loadExtraCitations?: () => Promise<readonly VerseSourceCitation[]>;
}

interface CitationField {
  key: string;
  label: string;
  value: string;
}

function citationFields(citation: VerseSourceCitation): CitationField[] {
  const fields: CitationField[] = [
    { key: "category", label: "Categoria", value: citation.category },
    { key: "title", label: "Título", value: citation.title },
    { key: "author", label: "Autor", value: citation.author },
    { key: "editionVersion", label: "Edição / versão", value: citation.editionVersion },
    { key: "platform", label: "Plataforma", value: citation.platform },
    { key: "verseReference", label: "Referência do versículo", value: citation.verseReference },
    { key: "url", label: "URL", value: citation.url },
    { key: "note", label: "Nota", value: citation.note ?? "" },
  ];

  return fields.filter((field) => field.value.trim().length > 0);
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default function VerseSourceDetails({
  citations,
  isDark,
  isHighContrast,
  loadExtraCitations,
}: VerseSourceDetailsProps) {
  const panelId = useId();
  const [expanded, setExpanded] = useState(false);
  const [extraCitations, setExtraCitations] = useState<readonly VerseSourceCitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const highContrast = isHighContrast;
  const panelColors = highContrast
    ? "border-yellow-400/70 text-white"
    : isDark
      ? "border-slate-700 text-slate-200"
      : "border-amber-900/10 text-stone-700";
  const mutedText = highContrast
    ? "text-white/80"
    : isDark
      ? "text-slate-400"
      : "text-stone-500";
  const accentText = highContrast
    ? "text-yellow-300"
    : isDark
      ? "text-amber-300"
      : "text-amber-800";
  const chipStyle = highContrast
    ? "border-yellow-400/70 bg-yellow-300/10 text-yellow-100"
    : isDark
      ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
      : "border-amber-800/15 bg-amber-700/[0.045] text-amber-900";

  const allCitations = [...citations, ...extraCitations];
  const compactLabels = citations
    .map((citation) => {
      const category = citation.category.trim();
      const source =
        citation.title.trim() || citation.author.trim() || citation.platform.trim();
      if (!category && !source) return "";
      return [category, source].filter(Boolean).join(" · ");
    })
    .filter((label, index, labels) => label && labels.indexOf(label) === index);

  async function fetchExtraCitations(force = false) {
    if (
      !loadExtraCitations ||
      loading ||
      hasLoaded ||
      (attempted && !force)
    ) {
      return;
    }

    setLoading(true);
    setLoadError(false);
    setAttempted(true);
    try {
      const loaded = await loadExtraCitations();
      setExtraCitations(loaded);
      setHasLoaded(true);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleDisclosure() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) void fetchExtraCitations();
  }

  function handleRetry() {
    setLoadError(false);
    void fetchExtraCitations(true);
  }

  return (
    <section className={`mt-3 border-t pt-2.5 ${panelColors}`}>
      <button
        type="button"
        onClick={handleDisclosure}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={`group flex min-h-9 w-full items-center justify-between gap-3 rounded-md text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
          highContrast
            ? "focus-visible:ring-offset-black"
            : isDark
              ? "focus-visible:ring-offset-[#151e2b]"
              : "focus-visible:ring-offset-[#fbf9f5]"
        }`}
      >
        <span className="min-w-0">
          <span className={`block text-xs font-semibold tracking-wide ${mutedText}`}>
            Fontes de referência
          </span>
          {compactLabels.length > 0 ? (
            <span className={`mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] ${mutedText}`}>
              {compactLabels.map((label) => (
                <span key={label} className="break-words">
                  {label}
                </span>
              ))}
            </span>
          ) : (
            <span className={`mt-1 block text-[11px] ${mutedText}`}>
              {loadExtraCitations
                ? "Detalhes bibliográficos disponíveis ao expandir"
                : "Nenhuma fonte informada"}
            </span>
          )}
        </span>
        <span className={`shrink-0 text-[11px] font-medium ${accentText}`}>
          {expanded ? "Recolher" : "Ver detalhes"}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`ml-1 inline-block h-3.5 w-3.5 align-[-2px] transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
          >
            <path
              d="m3.5 6 4.5 4.5L12.5 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        hidden={!expanded}
        className={`mt-2 space-y-3 border-l-2 pl-3 ${
          highContrast
            ? "border-yellow-400/60"
            : isDark
              ? "border-amber-300/30"
              : "border-amber-700/25"
        }`}
      >
          {loading && (
            <div role="status" className="space-y-2 py-1">
              <span className="sr-only">Carregando referências adicionais</span>
              <div
                aria-hidden="true"
                className={`h-3 w-2/3 animate-pulse rounded ${
                  highContrast
                    ? "bg-white/20"
                    : isDark
                      ? "bg-slate-700"
                      : "bg-amber-900/10"
                }`}
              />
              <div
                aria-hidden="true"
                className={`h-3 w-1/2 animate-pulse rounded ${
                  highContrast
                    ? "bg-white/20"
                    : isDark
                      ? "bg-slate-700"
                      : "bg-amber-900/10"
                }`}
              />
            </div>
          )}

          {loadError && (
            <div
              role="alert"
              className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${mutedText}`}
            >
              <span>Não foi possível carregar referências adicionais.</span>
              <button
                type="button"
                onClick={handleRetry}
                className={`rounded-sm font-semibold underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${accentText}`}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {allCitations.some((citation) => citationFields(citation).length > 0) ? (
            <ul className="space-y-3">
              {allCitations.map((citation, index) => {
                const fields = citationFields(citation);
                if (fields.length === 0) return null;

                return (
                  <li
                    key={`${citation.category}-${citation.title}-${citation.verseReference}-${index}`}
                    className={`rounded-md border px-3 py-2.5 ${
                      highContrast
                        ? "border-yellow-400/35 bg-yellow-300/[0.04]"
                        : isDark
                          ? "border-slate-700 bg-slate-900/20"
                          : "border-amber-900/10 bg-amber-50/40"
                    }`}
                  >
                    <dl className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[minmax(8rem,auto)_1fr]">
                      {fields.map((field) => (
                        <div
                          key={field.key}
                          className="grid min-w-0 grid-cols-[minmax(6.75rem,auto)_minmax(0,1fr)] gap-x-3 sm:contents"
                        >
                          <dt className={`text-[11px] font-semibold ${mutedText}`}>
                            {field.label}
                          </dt>
                          <dd className="min-w-0 break-words text-xs leading-relaxed">
                            {field.key === "url" && isSafeHttpUrl(field.value.trim()) ? (
                              <a
                                href={field.value.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Abrir URL da fonte em nova aba: ${field.value.trim()}`}
                                className={`break-all underline decoration-current/40 underline-offset-2 hover:decoration-current focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${accentText}`}
                              >
                                {field.value.trim()}
                              </a>
                            ) : (
                              field.value.trim()
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ul>
          ) : (
            !loading &&
            !loadError && (
              <p className={`py-1 text-xs leading-relaxed ${mutedText}`}>
                {hasLoaded
                  ? "Nenhuma referência adicional foi encontrada."
                  : "Nenhuma referência bibliográfica foi informada."}
              </p>
            )
          )}
      </div>
    </section>
  );
}
