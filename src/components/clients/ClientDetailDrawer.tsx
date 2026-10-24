import React from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Smartphone,
  PhoneCall,
  Edit,
  Tag,
  CheckCircle2,
  CalendarCheck2,
  CalendarRange,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Client, RecallChannel, ClientStatus } from '../../types';

interface ClientDetailDrawerProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onTriggerRecall: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onCreateReminder: (client: Client) => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  client,
  isOpen,
  onClose,
  onTriggerRecall,
  onEditClient,
  onCreateReminder,
}) => {
  if (!isOpen || !client) return null;

  const getDaysAgo = (dateStr: string) => {
    const diffTime = Math.abs(new Date('2026-10-24').getTime() - new Date(dateStr).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysAgo = getDaysAgo(client.lastContactDate);
  const isUrgent = client.status === 'urgent';
  const isDue = client.status === 'due';

  const getChannelIcon = (channel: RecallChannel) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-teal-600" />;
      case 'sms':
        return <Smartphone className="w-4 h-4 text-amber-600" />;
      case 'call':
        return <PhoneCall className="w-4 h-4 text-teal-700" />;
      default:
        return <MessageCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-teal-900/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Drawer Header (Petrol Green Accent) */}
        <div className="p-6 bg-gradient-to-r from-teal-950 via-[#0D5C63] to-teal-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {client.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">{client.name}</h2>
                {isUrgent ? (
                  <span className="text-[11px] font-semibold bg-rose-500/20 text-rose-200 border border-rose-400/30 px-2.5 py-0.5 rounded-full">
                    Ricontatto Scaduto
                  </span>
                ) : isDue ? (
                  <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    In Scadenza
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                    In Regola
                  </span>
                )}
              </div>
              <p className="text-teal-100/80 text-xs mt-1">
                {client.companyOrRole} · {client.category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Chiudi scheda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-900/10 text-center">
            <div>
              <span className="text-[11px] text-teal-800/80 font-medium block">Ultimo Appuntamento</span>
              <span className="text-sm font-bold text-teal-950 font-mono tabular-nums mt-0.5 block">
                {client.lastContactDate}
              </span>
              <span className="text-[10px] text-teal-700 block mt-0.5">({daysAgo} giorni fa)</span>
            </div>
            <div className="border-x border-teal-900/10">
              <span className="text-[11px] text-teal-800/80 font-medium block">Ciclo Consigliato</span>
              <span className="text-sm font-bold text-teal-950 font-mono tabular-nums mt-0.5 block">
                {client.recommendedRecallDays} giorni
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">intervallo ideale</span>
            </div>
            <div>
              <span className="text-[11px] text-teal-800/80 font-medium block">Canale Preferito</span>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm font-bold text-teal-950 capitalize">
                {getChannelIcon(client.preferredChannel)}
                <span>{client.preferredChannel}</span>
              </div>
            </div>
          </div>

          {/* Details & Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Contatti & Recapiti
              </span>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{client.phone || 'Non specificato'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.email || 'Non specificata'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Ultimo Servizio Registrato
              </span>
              <p className="text-xs font-semibold text-slate-800">{client.lastService}</p>
              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {client.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes for AI generator */}
          {client.notes && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Note & Preferenze di Ricontatto
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">{client.notes}</p>
            </div>
          )}

          {/* Past Appointment History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Storico Appuntamenti Dimostrativi
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {client.pastAppointments?.length || 1} appuntamenti registrati
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
              {client.pastAppointments && client.pastAppointments.length > 0 ? (
                client.pastAppointments.map((app) => (
                  <div key={app.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">{app.service}</p>
                      {app.notes && <p className="text-[11px] text-slate-500 italic">{app.notes}</p>}
                    </div>
                    <span className="text-slate-500 font-mono tabular-nums shrink-0 font-medium">
                      {app.date}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{client.lastService}</span>
                  <span className="text-slate-500 font-mono tabular-nums">{client.lastContactDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Future Integration Badge */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-900/10 flex items-start gap-3 text-xs text-teal-900">
            <CalendarRange className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-teal-950">Integrazione Agenda Google Calendar (In arrivo)</p>
              <p className="text-[11px] text-teal-800/80 mt-0.5 leading-relaxed">
                Nelle versioni successive, gli appuntamenti verranno rilevati in tempo reale dal tuo Google Calendar senza doverli registrare a mano.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEditClient(client);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Modifica Dati</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onCreateReminder(client);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Nuovo Promemoria</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onTriggerRecall(client);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-sm shadow-teal-900/20 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Prepara Recall AI</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
