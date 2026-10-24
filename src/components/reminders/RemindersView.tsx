import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  MessageCircle,
  Mail,
  Smartphone,
  PhoneCall,
  Check,
  Clock,
  Filter,
} from 'lucide-react';
import { RecallReminder, Client } from '../../types';
import { ReminderModal } from './ReminderModal';

interface RemindersViewProps {
  reminders: RecallReminder[];
  clients: Client[];
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onPostponeReminder: (id: string, days: number) => void;
  onAddReminder: (reminder: Omit<RecallReminder, 'id' | 'completed'>) => void;
  onTriggerRecallForClient: (client: Client) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  clients,
  onToggleReminder,
  onDeleteReminder,
  onPostponeReminder,
  onAddReminder,
  onTriggerRecallForClient,
}) => {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [intervalFilter, setIntervalFilter] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'pending' && r.completed) return false;
    if (filter === 'completed' && !r.completed) return false;

    if (intervalFilter !== 'all') {
      const client = clients.find((c) => c.id === r.clientId);
      if (client && client.recommendedRecallDays !== intervalFilter) {
        return false;
      }
    }

    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
            Alta priorità
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            Media
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
            Bassa
          </span>
        );
      default:
        return null;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-teal-600" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-amber-600" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-teal-700" />;
      default:
        return <MessageCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner: Explanation */}
      <div className="bg-white rounded-3xl border border-teal-900/10 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pianificazione Promemoria Recall
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clienti da ricontattare con scadenze personalizzate calcolate in base all'ultimo appuntamento svolto.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuovo Promemoria</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'pending'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Sospeso ({reminders.filter((r) => !r.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'completed'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completati ({reminders.filter((r) => r.completed).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tutti ({reminders.length})
          </button>
        </div>

        {/* Interval Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-500">
          <span className="font-semibold text-slate-700 text-[11px] whitespace-nowrap">Ciclo recall:</span>
          {[
            { label: 'Tutti', val: 'all' },
            { label: '21-30 gg', val: 30 },
            { label: '45-60 gg', val: 45 },
            { label: '90 gg', val: 90 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setIntervalFilter(item.val as any)}
              className={`px-2.5 py-1 rounded-lg transition-all text-xs whitespace-nowrap ${
                intervalFilter === item.val
                  ? 'bg-teal-50 text-teal-900 border border-teal-200/70 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-bold text-slate-800">Nessun promemoria corrispondente</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              I ricontatti pianificati per questo filtro sono tutti in regola.
            </p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const client = clients.find((c) => c.id === rem.clientId);

            return (
              <div
                key={rem.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  rem.completed ? 'border-slate-100 opacity-60' : 'border-slate-200/80 hover:border-teal-700/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => onToggleReminder(rem.id)}
                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      rem.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-teal-700 bg-white'
                    }`}
                    title={rem.completed ? 'Segna come non completato' : 'Segna come completato'}
                  >
                    {rem.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold ${
                          rem.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {rem.title}
                      </h4>
                      {getPriorityBadge(rem.priority)}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{rem.clientName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Scadenza: {rem.dueDate}
                      </span>
                      {client && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-400">
                            Ciclo consigliato: <span className="font-mono text-slate-700">{client.recommendedRecallDays}gg</span>
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 capitalize">
                        {getChannelIcon(rem.channel)}
                        {rem.channel}
                      </span>
                    </div>

                    {rem.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {rem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {client && !rem.completed && (
                    <button
                      onClick={() => onTriggerRecallForClient(client)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-2xs transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                      <span>Prepara Recall</span>
                    </button>
                  )}

                  {!rem.completed && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPostponeReminder(rem.id, 7)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Posticipa di 7 giorni"
                      >
                        +7 gg
                      </button>
                      <button
                        onClick={() => onPostponeReminder(rem.id, 30)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Posticipa di 30 giorni"
                      >
                        +30 gg
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Elimina promemoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddReminder}
        clients={clients}
      />
    </div>
  );
};
