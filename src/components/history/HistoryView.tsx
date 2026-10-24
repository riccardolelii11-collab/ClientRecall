import React, { useState } from 'react';
import {
  Clock,
  Copy,
  Check,
  Search,
  MessageCircle,
  FileText,
  CheckCircle2,
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
      onShowToast('Bozza ricopiata negli appunti!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Copia manuale', 'Seleziona e copia il testo.', 'info');
    }
  };

  const getOutcomeBadge = (outcome: RecallOutcome) => {
    switch (outcome) {
      case 'booked':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
            Nuovo Appuntamento Fissato
          </span>
        );
      case 'responded_positive':
        return (
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 rounded-full">
            Risposta Positiva Ricevuta
          </span>
        );
      case 'copied':
        return (
          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 rounded-full">
            Bozza Copiata Manualmente
          </span>
        );
      case 'no_response':
        return (
          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full">
            In Attesa di Risposta
          </span>
        );
      case 'rescheduled':
        return (
          <span className="text-[11px] font-medium text-purple-800 bg-purple-50 border border-purple-200/70 px-2.5 py-0.5 rounded-full">
            Riprogrammato a Data Futura
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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Cronologia Bozze & Attività Registrate
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Archivio delle bozze create e annotate. I messaggi sono presentati come bozze copiate e non come invii automatici.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per cliente o testo..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all"
          />
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Nessuna comunicazione registrata</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Quando copi una bozza dal Generatore AI, clicca su "Salva in Cronologia" per registrarla e monitorare la risposta del cliente.
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
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:border-teal-700/30 transition-colors"
              >
                {/* Item Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{item.clientName}</h4>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-600 font-medium">{item.reason}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-[10px] font-bold text-teal-800 uppercase px-2 py-0.5 bg-teal-50 border border-teal-200/60 rounded-md">
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
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {item.messageText}
                </div>

                {/* Outcome notes & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-500">Annota esito:</label>
                    <select
                      value={item.outcome}
                      onChange={(e) => {
                        onUpdateOutcome(item.id, e.target.value as RecallOutcome);
                        onShowToast('Esito aggiornato');
                      }}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-800"
                    >
                      <option value="copied">Bozza Copiata Manualmente</option>
                      <option value="responded_positive">Risposta Positiva Ricevuta</option>
                      <option value="booked">Nuovo Appuntamento Fissato</option>
                      <option value="no_response">In Attesa di Risposta</option>
                      <option value="rescheduled">Riprogrammato a Data Futura</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleCopyText(item.id, item.messageText)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Bozza Ricopiata!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copia di nuovo</span>
                      </>
                    )}
                  </button>
                </div>

                {item.outcomeNotes && (
                  <p className="text-[11px] text-teal-900 bg-teal-50/50 p-2.5 rounded-xl border border-teal-900/10 italic">
                    Nota: {item.outcomeNotes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
