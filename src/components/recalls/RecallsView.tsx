import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  ArrowRight,
  Filter,
  Search,
  MessageCircle,
  Mail,
  Smartphone,
  PhoneCall,
  CalendarPlus,
  Info,
} from 'lucide-react';
import { ClientRecallAnalysis, Client, RecallChannel } from '../../types';

interface RecallsViewProps {
  analyses: ClientRecallAnalysis[];
  onSelectClientForRecall: (client: Client) => void;
  onOpenAppointmentModal: (client: Client) => void;
  onOpenClientDrawer: (client: Client) => void;
}

export const RecallsView: React.FC<RecallsViewProps> = ({
  analyses,
  onSelectClientForRecall,
  onOpenAppointmentModal,
  onOpenClientDrawer,
}) => {
  const [filterType, setFilterType] = useState<'all_due' | 'urgent' | 'provisional' | 'all'>(
    'all_due'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const getChannelBadge = (channel: RecallChannel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
            <MessageCircle className="w-3 h-3 text-emerald-600" />
            <span>WhatsApp</span>
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md">
            <Mail className="w-3 h-3 text-teal-600" />
            <span>Email</span>
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
            <Smartphone className="w-3 h-3 text-amber-600" />
            <span>SMS</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <PhoneCall className="w-3 h-3 text-slate-500" />
            <span className="capitalize">{channel}</span>
          </span>
        );
    }
  };

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((item) => {
      // Ricerca testo
      const matchesSearch =
        item.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.client.lastService &&
          item.client.lastService.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.client.phone && item.client.phone.includes(searchQuery));

      if (!matchesSearch) return false;

      // Filtro categorie
      if (filterType === 'all_due') {
        return item.isRecallDue;
      }
      if (filterType === 'urgent') {
        return item.isRecallDue && item.overdueDays >= 14;
      }
      if (filterType === 'provisional') {
        return item.isRecallDue && item.isProvisional;
      }
      if (filterType === 'all') {
        return true;
      }
      return true;
    });
  }, [analyses, searchQuery, filterType]);

  const counts = {
    allDue: analyses.filter((a) => a.isRecallDue).length,
    urgent: analyses.filter((a) => a.isRecallDue && a.overdueDays >= 14).length,
    provisional: analyses.filter((a) => a.isRecallDue && a.isProvisional).length,
    futureBooked: analyses.filter((a) => a.hasFutureAppointment).length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Explanation of Recall Engine */}
      <div className="bg-white rounded-3xl border border-teal-900/10 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Motore di Ricontatto Intelligente
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Clienti da Ricontattare
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            ClientRecall calcola la frequenza abituale di ogni cliente in base agli appuntamenti
            svolti. Chi ha già un appuntamento futuro fissato viene <strong>escluso automaticamente</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-xs font-semibold text-amber-900 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{counts.allDue} in ritardo sul ciclo</span>
          </div>
          {counts.futureBooked > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/70 text-xs font-semibold text-teal-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{counts.futureBooked} con appuntamento futuro</span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca cliente o servizio..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setFilterType('all_due')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              filterType === 'all_due'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tutti da Ricontattare ({counts.allDue})
          </button>
          <button
            onClick={() => setFilterType('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              filterType === 'urgent'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Molto in ritardo ({counts.urgent})
          </button>
          <button
            onClick={() => setFilterType('provisional')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              filterType === 'provisional'
                ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stime provvisorie ({counts.provisional})
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tutti i Clienti ({analyses.length})
          </button>
        </div>
      </div>

      {/* Recalls List */}
      <div className="space-y-3">
        {filteredAnalyses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-slate-900">
              Nessun cliente in questa categoria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tutti i clienti sono in regola oppure hanno già un appuntamento futuro fissato.
            </p>
          </div>
        ) : (
          filteredAnalyses.map((analysis) => {
            const { client } = analysis;
            const isVeryUrgent = analysis.overdueDays >= 14;

            return (
              <div
                key={analysis.clientId}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  analysis.hasFutureAppointment
                    ? 'border-slate-200 bg-slate-50/40 opacity-90'
                    : isVeryUrgent
                    ? 'border-rose-200/80 hover:border-rose-300'
                    : analysis.isRecallDue
                    ? 'border-amber-200/80 hover:border-amber-300'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Left Side: Client Info and Metrics */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    onClick={() => onOpenClientDrawer(client)}
                    className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-800 font-bold text-sm shrink-0 cursor-pointer hover:bg-teal-100 transition-colors"
                  >
                    {client.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3
                        onClick={() => onOpenClientDrawer(client)}
                        className="text-sm font-bold text-slate-900 hover:text-teal-900 cursor-pointer transition-colors"
                      >
                        {client.name}
                      </h3>

                      {getChannelBadge(client.preferredChannel)}

                      {/* Status Badges */}
                      {analysis.hasFutureAppointment ? (
                        <span className="text-[11px] font-semibold text-teal-900 bg-teal-50 border border-teal-300/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>Appuntamento futuro fissato ({analysis.nextFutureAppointmentDate})</span>
                        </span>
                      ) : isVeryUrgent ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>In ritardo di {analysis.overdueDays} giorni</span>
                        </span>
                      ) : analysis.isRecallDue ? (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>In ritardo di {analysis.overdueDays} giorni</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-300/80 px-2.5 py-0.5 rounded-full">
                          In regola
                        </span>
                      )}

                      {/* Stima Provvisoria Badge */}
                      {analysis.isProvisional && !analysis.hasFutureAppointment && (
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Info className="w-3 h-3 text-slate-400" />
                          <span>Stima provvisoria (pochi dati)</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Ultimo servizio: <span className="text-slate-900 font-semibold">{client.lastService || 'Non specificato'}</span>
                      {client.phone && <span className="text-slate-400 font-mono ml-2">· {client.phone}</span>}
                    </p>

                    {/* Rationale String */}
                    <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                      {analysis.rationale}
                    </p>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => onOpenAppointmentModal(client)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
                    title="Registra nuovo appuntamento"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Appuntamento</span>
                  </button>

                  <button
                    onClick={() => onSelectClientForRecall(client)}
                    className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                    <span>Prepara Messaggio</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-70" />
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
