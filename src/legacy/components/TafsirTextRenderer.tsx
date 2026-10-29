import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface TafsirTextRendererProps {
  content: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Pré-processamento                                                   */
/* ------------------------------------------------------------------ */

// Linhas que devem continuar coladas à anterior (itens de lista e citações em Markdown)
const JOINABLE_LINE = /^\s*(?:[-*+]\s|\d+[.)]\s|>)/;

function reflowLongPlainParagraph(block: string): string {
  const plainText = block.trim();
  const hasFormatting = /(?:^|\n)\s{0,3}(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|`)|\*\*|__|\[[^\]]+\]\(/.test(
    plainText
  );
  if (plainText.length < 900 || hasFormatting) return block;

  const sentences =
    plainText.match(/[^.!?؟]+[.!?؟]+["”')\]]*\s*|[^.!?؟]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ||
    [];
  if (sentences.length < 4) return block;

  const paragraphs: string[] = [];
  let current: string[] = [];
  let currentLength = 0;
  for (const sentence of sentences) {
    current.push(sentence);
    currentLength += sentence.length;
    if (current.length >= 3 || currentLength >= 700) {
      paragraphs.push(current.join(' '));
      current = [];
      currentLength = 0;
    }
  }
  if (current.length) paragraphs.push(current.join(' '));
  return paragraphs.join('\n\n');
}

/**
 * Normaliza o texto vindo das APIs (inglês) ou da tradução (português) para
 * Markdown limpo, SEM remover nenhum conteúdo:
 *  - converte HTML simples (<br>, <p>, <b>, <i>...) em Markdown;
 *  - transforma quebras de linha simples em parágrafos (o Markdown, por padrão,
 *    junta linhas simples num bloco único e o texto vira uma "parede");
 *  - colapsa excesso de linhas em branco.
 */
export function normalizeTafsirText(raw: string): string {
  if (!raw) return '';

  let text = raw.replace(/\r\n?/g, '\n');

  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|blockquote)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/?(?:b|strong)(?:\s[^>]*)?>/gi, '**')
    .replace(/<\/?(?:i|em)(?:\s[^>]*)?>/gi, '*')
    .replace(/<\/?(?:p|div|span|ul|ol|li|h[1-6]|blockquote|a|sup|sub|font|u)(?:\s[^>]*)?>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');

  text = text
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Linha a linha: cada linha de texto vira um parágrafo; itens de lista consecutivos
  // (e suas continuações indentadas) continuam juntos para o Markdown montar a lista.
  const blocks = text.split(/\n{2,}/).map((block) => {
    const lines = block.split('\n').filter((l) => l.trim().length > 0);
    let normalizedBlock = block;
    if (lines.length > 1) {
      let out = '';
      let prevJoinable = false;
      lines.forEach((line, i) => {
        const joinable = JOINABLE_LINE.test(line);
        const indentedContinuation = prevJoinable && /^\s{2,}\S/.test(line);
        const sep = i === 0 ? '' : (joinable && prevJoinable) || indentedContinuation ? '\n' : '\n\n';
        out += sep + (joinable || indentedContinuation ? line : line.trim());
        prevJoinable = joinable || indentedContinuation;
      });
      normalizedBlock = out;
    }
    return reflowLongPlainParagraph(normalizedBlock);
  });

  return blocks.filter(Boolean).join('\n\n');
}

/* ------------------------------------------------------------------ */
/* Detecção de citações                                                */
/* ------------------------------------------------------------------ */

const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const QUOTE_OPEN = /^\s*["“«‘']/;
const QUOTE_CLOSE_WITH_REF =
  /["”»’'][\s.,;:]*[(\[][^)\]]{0,60}?\d{1,3}\s*:\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?[)\]][\s.,;:]*$/;

const HADITH_INTRO: RegExp[] = [
  /\b(?:narrated|it was narrated|reported|recorded|related|transmitted)\b/i,
  /\b(?:the prophet|allah'?s messenger|the messenger of allah|messenger of allah)\b[^.]{0,60}\b(?:said|says|stated|told|used to)\b/i,
  /\b(?:relatou|narrou|registrou|transmitiu|reportou)\b/i,
  /\b(?:o profeta|o mensageiro de (?:allah|deus))\b[^.]{0,60}\b(?:disse|diz|afirmou|declarou)\b/i,
  /\b(?:sahih al-bukhari|sahih muslim|sunan abi dawud|jami'? at-tirmidhi|sunan an-nasa'?i|sunan ibn majah|musnad)\b/i,
];

const VERSE_INTRO: RegExp[] = [
  /^\s*(?:allah|god)(?:,? the (?:exalted|almighty|most high))?\s+(?:says|said|states|stated|declares)\b/i,
  /^\s*(?:allah|deus)(?:,? o (?:altíssimo|exaltado|todo-poderoso))?\s+(?:diz|disse|afirma|afirmou)\b/i,
];

function arabicRatio(text: string): number {
  const letters = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
  if (!letters.length) return 0;
  const arabic = (text.match(ARABIC_CHAR) || []).length;
  return arabic / letters.length;
}

type BlockKind = 'verse-arabic' | 'verse' | 'hadith' | 'normal';

function classifyParagraph(text: string): BlockKind {
  const t = text.trim();
  if (!t) return 'normal';

  if (arabicRatio(t) > 0.55) return 'verse-arabic';

  // Parágrafos muito longos são texto corrido, não citação isolada
  if (t.length > 1100) return 'normal';

  if (QUOTE_OPEN.test(t) && QUOTE_CLOSE_WITH_REF.test(t)) return 'verse';
  if (VERSE_INTRO.some((re) => re.test(t.slice(0, 80))) && /["“«]/.test(t)) return 'verse';

  const intro = t.slice(0, 240);
  if (HADITH_INTRO.some((re) => re.test(intro))) return 'hadith';

  if (QUOTE_OPEN.test(t) && /["”»’']\s*[.,;:]?\s*$/.test(t) && t.length > 40) return 'hadith';

  return 'normal';
}

/** Extrai o texto puro de children (inclui <strong>, <em> aninhados). */
function nodeToText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join('');
  if (React.isValidElement(node)) {
    return nodeToText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

const TafsirTextRendererBase: React.FC<TafsirTextRendererProps> = ({ content, className = '' }) => {
  const normalized = useMemo(() => normalizeTafsirText(content), [content]);

  if (!normalized) return null;

  return (
    <div className={`tafsir-prose select-text ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => {
            const kind = classifyParagraph(nodeToText(children));

            if (kind === 'verse-arabic') {
              return (
                <div className="tafsir-verse">
                  <span className="tafsir-quote-label">Versículo</span>
                  <p className="tafsir-arabic" lang="ar" dir="rtl">
                    {children}
                  </p>
                </div>
              );
            }

            if (kind === 'verse') {
              return (
                <div className="tafsir-verse">
                  <span className="tafsir-quote-label">Versículo do Alcorão</span>
                  <div className="tafsir-quote-body">
                    <p>{children}</p>
                  </div>
                </div>
              );
            }

            if (kind === 'hadith') {
              return (
                <div className="tafsir-hadith">
                  <span className="tafsir-quote-label">Citação / Hadith</span>
                  <div className="tafsir-quote-body">
                    <p>{children}</p>
                  </div>
                </div>
              );
            }

            return <p>{children}</p>;
          },
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
};

export const TafsirTextRenderer = React.memo(TafsirTextRendererBase);
