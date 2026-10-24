import React, { useState } from 'react';
import {
  Users,
  AlertCircle,
  CalendarCheck2,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Eye,
  CalendarPlus,
  Info,
} from 'lucide-react';
import { Client, Appointment, ClientRecallAnalysis, UserProfile, ProfessionType } from '../../types';
import { ClientDetailDrawer } from '../clients/ClientDetailDrawer';
import { DEFAULT_PROFESSION_CONFIG } from '../../services/recallEngine';

interface DashboardViewProps {
  clients: Client[];
  appointments: Appointment[];
  analyses: ClientRecallAnalysis[];
  profile: UserProfile;
  onSelectClientForRecall: (client: Client) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenAppointmentModal: (client?: Client) => void;
  onOpenNewClientModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  appointments,
  analyses,
  profile,
  onSelectClientForRecall,
  onNavigateToTab,
  onOpenAppointmentModal,
  onOpenNewClientModal,
}) => {
  const [selectedDetailClient, setSelectedDetailClient] = useState<Client | null>(null);

  const dueAnalyses = analyses.filter((a) => a.isRecallDue);
  const urgentCount = dueAnalyses.filter((a) => a.overdueDays >= 14).length;
  const completedAppointmentsCount = appointments.filter((a) => a.status === 'svolto').length;
  const scheduledAppointmentsCount = appointments.filter((a) => a.status === 'programmato').length;

  const professionConfig =
    DEFAULT_PROFESSION_CONFIG[(profile.profession as ProfessionType) || 'barbiere'] ||
    DEFAULT_PROFESSION_CONFIG.barbiere;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="professione">
              {professionConfig.emoji}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              {profile.businessName || professionConfig.label}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Dashboard Attività
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Panoramica dei clienti da ricontattare in base allo storico degli appuntamenti svolti.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => onOpenAppointmentModal()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <CalendarPlus className="w-4 h-4 text-slate-500" />
            <span>Nuovo Appuntamento</span>
          </button>

          <button
            onClick={() => onNavigateToTab('generator')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Prepara Messaggio</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      </div>

      {/* 4 Essential KPI Cards (Req 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Numero Clienti */}
        <div
          onClick={() => onNavigateToTab('clients')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-700/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Numero Clienti</span>
            <Users className="w-4 h-4 group-hover:text-teal-700 transition-colors" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono tabular-nums tracking-tight">
            {clients.length}
          </p>
          <div className="text-[12px] text-slate-400 mt-1.5">
            Nel tuo archivio personale
          </div>
        </div>

        {/* 2. Clienti da Ricontattare */}
        <div
          onClick={() => onNavigateToTab('recalls')}
          className="bg-white rounded-3xl p-5 border border-amber-200/70 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Da Ricontattare</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-3 font-mono tabular-nums tracking-tight">
            {dueAnalyses.length}
          </p>
          <div className="text-[12px] text-amber-700 font-medium mt-1.5">
            {urgentCount > 0 ? `${urgentCount} oltre 14 gg dal ciclo` : 'Oltre il ciclo ideale'}
          </div>
        </div>

        {/* 3. Appuntamenti Registrati */}
        <div
          onClick={() => onNavigateToTab('appointments')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-700/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Appuntamenti Registrati</span>
            <CalendarCheck2 className="w-4 h-4 group-hover:text-teal-700 transition-colors" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono tabular-nums tracking-tight">
            {appointments.length}
          </p>
          <div className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span>{completedAppointmentsCount} svolti</span>
            <span>·</span>
            <span className="text-teal-700 font-medium">{scheduledAppointmentsCount} futuri</span>
          </div>
        </div>

        {/* 4. Ciclo & Frequenza Base */}
        <div
          onClick={() => onNavigateToTab('settings')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-700/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Ciclo Medio Stimato</span>
            <Clock className="w-4 h-4 group-hover:text-teal-700 transition-colors" />
          </div>
          <p className="text-3xl font-extrabold text-teal-900 mt-3 font-mono tabular-nums tracking-tight">
            {profile.defaultRecallDays || professionConfig.defaultIntervalDays} gg
          </p>
          <div className="text-[12px] text-slate-500 mt-1.5 truncate">
            {professionConfig.label.split('/')[0]}
          </div>
        </div>
      </div>

      {/* Main Section: Priority List of Clients Requiring Attention */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Clienti che Richiedono Attenzione
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clienti oltre l'intervallo abituale o provvisorio senza appuntamenti futuri fissati
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('recalls')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 transition-colors"
          >
            <span>Vedi tutti ({dueAnalyses.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {dueAnalyses.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto opacity-80" />
              <p className="text-sm font-semibold text-slate-800">
                Tutti i clienti sono in regola!
              </p>
              <p className="text-xs text-slate-400">
                Non ci sono clienti oltre l'intervallo abituale al momento.
              </p>
            </div>
          ) : (
            dueAnalyses.slice(0, 5).map((analysis) => {
              const { client } = analysis;
              const isUrgent = analysis.overdueDays >= 14;

              return (
                <div
                  key={analysis.clientId}
                  className="p-5 hover:bg-teal-50/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setSelectedDetailClient(client)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/50 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0">
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{client.name}</h4>
                        {isUrgent ? (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
                            In ritardo di {analysis.overdueDays} gg
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                            In ritardo di {analysis.overdueDays} gg
                          </span>
                        )}

                        {analysis.isProvisional && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Info className="w-3 h-3 text-slate-400" />
                            <span>Stima provvisoria</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {client.lastService || 'Servizio abituale'}
                      </p>

                      <p className="text-[11px] text-slate-400 font-mono">
                        {analysis.rationale}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 sm:self-center shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelectedDetailClient(client)}
                      className="p-1.5 text-slate-400 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Apri scheda cliente"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenAppointmentModal(client)}
                      className="p-1.5 text-slate-400 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Registra appuntamento"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onSelectClientForRecall(client)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-2xs whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                      <span>Prepara Messaggio</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Client Detail Drawer */}
      <ClientDetailDrawer
        client={selectedDetailClient}
        isOpen={selectedDetailClient !== null}
        onClose={() => setSelectedDetailClient(null)}
        onTriggerRecall={(c) => {
          setSelectedDetailClient(null);
          onSelectClientForRecall(c);
        }}
        onEditClient={() => {
          setSelectedDetailClient(null);
          onNavigateToTab('clients');
        }}
        onCreateReminder={() => {
          setSelectedDetailClient(null);
          onOpenAppointmentModal(selectedDetailClient || undefined);
        }}
      />
    </div>
  );
};
