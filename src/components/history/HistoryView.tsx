import React, { useState } from 'react';
import {
  Clock,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { RecallHistoryItem, RecallOutcome } from '../../types';

interface HistoryViewProps {
  history: RecallHistoryItem[];
  onUpdateOutcome: (id: string, outcome: RecallOutcome, notes?: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onUpdateOutcome,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      onShowToast('Messaggio ricopiato!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Copia manuale', 'Seleziona e copia il testo.', 'info');
    }
  };

  const getOutcomeBadge = (outcome: RecallOutcome) => {
    switch (outcome) {
      case 'booked':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
            Appuntamento Fissato
          </span>
        );
      case 'responded_positive':
        return (
          <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md">
            Risposta Positiva
          </span>
        );
      case 'copied':
        return (
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
            Bozza Copiata
          </span>
        );
      case 'no_response':
        return (
          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md">
            In Attesa
          </span>
        );
      case 'rescheduled':
        return (
          <span className="text-[11px] font-medium text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md">
            Riprogrammato
          </span>
        );
    }
  };

  const filteredHistory = history.filter((item) => {
    return (
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.messageText.toLowerCase().includes(search.toLowerCase()) ||
      item.reason.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca nella cronologia messaggi..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Totale registrazioni: <strong className="text-slate-700">{filteredHistory.length}</strong>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-16 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Nessuna comunicazione registrata</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Quando copi un messaggio dal Generatore AI, salvalo in cronologia per tracciarne l’esito.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const formattedDate = new Date(item.date).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Item Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{item.clientName}</h4>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-600 font-medium">{item.reason}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase px-2 py-0.5 bg-slate-100 rounded-md">
                      {item.channel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {formattedDate}
                    </span>
                    {getOutcomeBadge(item.outcome)}
                  </div>
                </div>

                {/* Message Body Box */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/50 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {item.messageText}
                </div>

                {/* Outcome notes & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-400">Aggiorna esito:</label>
                    <select
                      value={item.outcome}
                      onChange={(e) => {
                        onUpdateOutcome(item.id, e.target.value as RecallOutcome);
                        onShowToast('Esito aggiornato');
                      }}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    >
                      <option value="copied">Bozza Copiata</option>
                      <option value="responded_positive">Risposta Positiva</option>
                      <option value="booked">Appuntamento Fissato</option>
                      <option value="no_response">In Attesa di Risposta</option>
                      <option value="rescheduled">Riprogrammato</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleCopyText(item.id, item.messageText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copia di nuovo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
