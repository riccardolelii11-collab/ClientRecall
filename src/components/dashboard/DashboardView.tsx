import React from 'react';
import {
  Users,
  AlertCircle,
  Bell,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Mail,
  Smartphone,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';
import { Client, RecallReminder, RecallHistoryItem } from '../../types';

interface DashboardViewProps {
  clients: Client[];
  reminders: RecallReminder[];
  history: RecallHistoryItem[];
  onSelectClientForRecall: (client: Client) => void;
  onNavigateToTab: (tab: any) => void;
  onToggleReminder: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  reminders,
  history,
  onSelectClientForRecall,
  onNavigateToTab,
  onToggleReminder,
}) => {
  const urgentClients = clients.filter((c) => c.status === 'urgent');
  const dueClients = clients.filter((c) => c.status === 'due');
  const recallNeededClients = [...urgentClients, ...dueClients];

  const pendingReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-sky-600" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-amber-600" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <MessageCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getDaysAgo = (dateStr: string) => {
    const diffTime = Math.abs(new Date('2026-10-24').getTime() - new Date(dateStr).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Greeting Header (Airy & Unboxed) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Control Room
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Panoramica Ricontatti
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Ci sono <strong className="text-slate-800 font-semibold">{urgentClients.length} clienti</strong> che hanno superato il ciclo ideale di ricontatto e beneficerebbero di un tuo messaggio oggi.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('generator')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Genera Recall AI</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>

      {/* KPI Cards Strip (Minimalist & Flat) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div
          onClick={() => onNavigateToTab('clients')}
          className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Clienti Totali</span>
            <Users className="w-4 h-4 group-hover:text-slate-700 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3 font-mono tabular-nums tracking-tight">
            {clients.length}
          </p>
          <div className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span>{clients.filter((c) => c.status === 'recent').length} regolari</span>
            <span>·</span>
            <span>{clients.filter((c) => c.status === 'paused').length} in pausa</span>
          </div>
        </div>

        {/* Urgent Recalls */}
        <div
          onClick={() => onNavigateToTab('clients')}
          className="bg-white rounded-2xl p-5 border border-amber-200/60 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Da Ricontattare</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-3 font-mono tabular-nums tracking-tight">
            {urgentClients.length}
          </p>
          <div className="text-[12px] text-amber-700 font-medium mt-1.5">
            Oltre l’intervallo ideale
          </div>
        </div>

        {/* Active Reminders */}
        <div
          onClick={() => onNavigateToTab('reminders')}
          className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Promemoria Aperti</span>
            <Bell className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3 font-mono tabular-nums tracking-tight">
            {pendingReminders.length}
          </p>
          <div className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span>{completedReminders.length} evasi</span>
            <span>·</span>
            <span className="text-indigo-600 font-medium">In agenda</span>
          </div>
        </div>

        {/* History */}
        <div
          onClick={() => onNavigateToTab('history')}
          className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Recall Registrati</span>
            <Clock className="w-4 h-4 group-hover:text-slate-700 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-3 font-mono tabular-nums tracking-tight">
            {history.length}
          </p>
          <div className="text-[12px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fidelizzazione attiva</span>
          </div>
        </div>
      </div>

      {/* Main Section: Priority Queue & Side column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Priority Recall Clients (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Priorità di Ricontatto
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clienti ordinati per giorni trascorsi dall’ultimo servizio
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('clients')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <span>Vedi rubrica</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {recallNeededClients.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-800">Tutti i clienti sono in regola!</p>
                <p className="text-xs text-slate-400 mt-1">Non ci sono recall urgenti al momento.</p>
              </div>
            ) : (
              recallNeededClients.slice(0, 4).map((client) => {
                const daysAgo = getDaysAgo(client.lastContactDate);
                const isUrgent = client.status === 'urgent';

                return (
                  <div
                    key={client.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0">
                        {client.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{client.name}</h4>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{client.companyOrRole}</span>
                        </div>

                        <p className="text-xs text-slate-600">
                          {client.lastService}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            {getChannelIcon(client.preferredChannel)}
                            <span className="capitalize">{client.preferredChannel}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Ultimo: <span className="font-mono tabular-nums text-slate-600 font-medium">{daysAgo} gg fa</span></span>
                          <span aria-hidden="true">·</span>
                          <span>Ciclo consigliato: <span className="font-mono tabular-nums text-slate-600">{client.recommendedRecallDays} gg</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center shrink-0">
                      {isUrgent ? (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                          Scaduto
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          In scadenza
                        </span>
                      )}

                      <button
                        onClick={() => onSelectClientForRecall(client)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-xl transition-all shadow-2xs whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Prepara Recall</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Upcoming Reminders & Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reminders Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Agenda Promemoria</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('reminders')}
                className="text-xs font-medium text-slate-400 hover:text-slate-900"
              >
                Tutti
              </button>
            </div>

            <div className="space-y-3">
              {pendingReminders.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Nessun promemoria in sospeso.
                </p>
              ) : (
                pendingReminders.slice(0, 3).map((rem) => (
                  <div
                    key={rem.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-slate-100"
                  >
                    <button
                      onClick={() => onToggleReminder(rem.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-slate-300 hover:border-emerald-600 flex items-center justify-center shrink-0 transition-colors bg-white"
                      title="Segna come completato"
                    >
                      {rem.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{rem.title}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-600 font-medium">{rem.clientName}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{rem.dueDate}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent History Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Attività Recente</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('history')}
                className="text-xs font-medium text-slate-400 hover:text-slate-900"
              >
                Cronologia
              </button>
            </div>

            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Nessun messaggio recente.
                </p>
              ) : (
                history.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 font-semibold">{item.clientName}</span>
                      <span className="text-slate-400 text-[10px] font-mono tabular-nums">
                        {item.date.split('T')[0]}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-1 italic">
                      "{item.messageText}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
