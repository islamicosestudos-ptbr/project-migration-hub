import React, { useState, useMemo } from 'react';
import { Bookmark } from '../types/quran';
import {
  Bookmark as BookmarkIcon,
  Trash2,
  ArrowRight,
  Edit3,
  Check,
  X,
  Download,
  Tag,
  Share2
} from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onJumpToVerse: (surahNumber: number, ayahNumber: number) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onUpdateNote,
  onJumpToVerse,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  if (!isOpen) return null;

  const handleStartEdit = (b: Bookmark) => {
    setEditingId(b.id);
    setNoteDraft(b.note || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, noteDraft);
    setEditingId(null);
  };

  // Export Tadabbur Notebook to Markdown file
  const handleExportMarkdown = () => {
    let md = `# Caderno de Estudos e Reflexões do Alcorão Sagrado (Tadabbur)\n\n`;
    md += `*Exportado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}*\n`;
    md += `*Total de passagens salvas: ${bookmarks.length}*\n\n---\n\n`;

    bookmarks.forEach((b, idx) => {
      md += `### ${idx + 1}. Surata ${b.surahName} (${b.surahNumber}:${b.ayahNumber})\n\n`;
      md += `**Texto Árabe:**\n> ${b.arabicText}\n\n`;
      md += `**Tradução:**\n> "${b.translationText}"\n\n`;
      md += `**Reflexão Pessoal (Tadabbur):**\n${b.note ? b.note : '*Nenhuma nota inserida.*'}\n\n`;
      md += `*Data em que foi salvo: ${new Date(b.savedAt).toLocaleDateString('pt-BR')}*\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Alcorão_Tadabbur_Reflexoes_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-xl bg-[#FBF9F5] dark:bg-[#121924] h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#162130] border-b border-stone-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookmarkIcon className="w-5 h-5 text-amber-900 dark:text-amber-400" />
            <div>
              <h2 className="text-xl font-display font-semibold text-stone-900 dark:text-slate-100">
                Versículos Salvos & Reflexões
              </h2>
              <p className="text-xs text-stone-500 dark:text-slate-400 font-editorial">
                {bookmarks.length} passagens guardadas para reflexão (Tadabbur)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <button
                onClick={handleExportMarkdown}
                title="Exportar Caderno de Reflexões em Markdown (.md)"
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 text-xs font-semibold text-stone-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Exportar (.md)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Fechar gaveta de versículos salvos"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of bookmarks */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#162130] rounded-xl border border-stone-200 dark:border-slate-800 p-8">
              <BookmarkIcon className="w-8 h-8 text-stone-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-base font-editorial text-stone-700 dark:text-slate-200">
                Nenhum versículo salvo ainda.
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Durante a leitura, toque no ícone de marcador para salvar versículos com suas anotações pessoais de estudo.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-[#162130] rounded-xl p-5 border border-stone-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-stone-800 dark:text-slate-200">
                    Surata {b.surahName} ({b.surahNumber}:{b.ayahNumber})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onJumpToVerse(b.surahNumber, b.ayahNumber);
                        onClose();
                      }}
                      className="text-xs text-amber-900 dark:text-amber-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(b.id)}
                      title="Excluir marcador"
                      className="text-stone-400 hover:text-red-700 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-arabic text-xl text-stone-900 dark:text-amber-200 text-right leading-loose">
                  {b.arabicText}
                </div>

                <p className="font-editorial text-xs sm:text-sm text-stone-700 dark:text-slate-300 italic leading-relaxed">
                  "{b.translationText}"
                </p>

                {/* Personal Tadabbur reflection note */}
                <div className="pt-2">
                  {editingId === b.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Escreva sua reflexão pessoal sobre este versículo..."
                        rows={2}
                        className="w-full text-xs p-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg text-stone-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700 dark:text-slate-400 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveNote(b.id)}
                          className="px-3 py-1 bg-stone-900 dark:bg-amber-500 text-white dark:text-black rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Salvar Nota</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 p-2.5 bg-stone-50 dark:bg-slate-900 rounded-lg border border-stone-200/60 dark:border-slate-800 text-xs text-stone-600 dark:text-slate-300">
                      <p className="italic">
                        {b.note || 'Nenhuma reflexão anotada ainda.'}
                      </p>
                      <button
                        onClick={() => handleStartEdit(b)}
                        className="text-stone-400 hover:text-amber-900 dark:hover:text-amber-400 shrink-0 p-1 cursor-pointer"
                        title="Editar anotação de reflexão"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-stone-400 dark:text-slate-400 text-right">
                  Salvo em: {new Date(b.savedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100/90 dark:bg-[#162130] border-t border-stone-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 dark:bg-amber-500 text-white dark:text-black rounded-lg text-xs font-medium hover:bg-stone-800 dark:hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
