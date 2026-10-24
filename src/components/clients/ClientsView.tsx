import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  MessageCircle,
  Mail,
  Smartphone,
  PhoneCall,
  Filter,
  Eye,
  CalendarPlus,
  CalendarCheck2,
} from 'lucide-react';
import { Client, RecallChannel, ClientRecallAnalysis } from '../../types';
import { ClientModal } from './ClientModal';
import { ClientDetailDrawer } from './ClientDetailDrawer';

interface ClientsViewProps {
  clients: Client[];
  analyses: ClientRecallAnalysis[];
  onSelectClientForRecall: (client: Client) => void;
  onSaveClient: (clientData: Omit<Client, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeleteClient: (id: string) => void;
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
  onOpenCreateAppointmentModal: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  analyses,
  onSelectClientForRecall,
  onSaveClient,
  onDeleteClient,
  isNewClientModalOpen,
  setIsNewClientModalOpen,
  onOpenCreateAppointmentModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'future' | 'ok'>('all');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  const analysisMap = useMemo(() => {
    const map = new Map<string, ClientRecallAnalysis>();
    analyses.forEach((a) => map.set(a.clientId, a));
    return map;
  }, [analyses]);

  const getChannelBadge = (channel: RecallChannel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-teal-800 font-medium">
            <Mail className="w-3.5 h-3.5 text-teal-600" />
            <span>Email</span>
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>SMS</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-teal-900 font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
            <span className="capitalize">{channel}</span>
          </span>
        );
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.lastService && client.lastService.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.phone && client.phone.includes(searchQuery));

      if (!matchesSearch) return false;

      const analysis = analysisMap.get(client.id);

      if (statusFilter === 'all') return true;
      if (statusFilter === 'due') return analysis?.isRecallDue;
      if (statusFilter === 'future') return analysis?.hasFutureAppointment;
      if (statusFilter === 'ok') return !analysis?.isRecallDue && !analysis?.hasFutureAppointment;
      return true;
    });
  }, [clients, searchQuery, statusFilter, analysisMap]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-teal-900/10 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Rubrica Personale
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gestione Clienti
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ogni cliente appartiene al tuo account ed è protetto da Row Level Security (RLS).
          </p>
        </div>

        <button
          onClick={() => setIsNewClientModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi Cliente</span>
        </button>
      </div>

      {/* Search and Segmented Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per nome, servizio, telefono..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tutti ({clients.length})
          </button>
          <button
            onClick={() => setStatusFilter('due')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === 'due'
                ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Da Ricontattare ({analyses.filter((a) => a.isRecallDue).length})
          </button>
          <button
            onClick={() => setStatusFilter('future')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === 'future'
                ? 'bg-white text-teal-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Con Appuntamento Futuro ({analyses.filter((a) => a.hasFutureAppointment).length})
          </button>
          <button
            onClick={() => setStatusFilter('ok')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === 'ok'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Regola
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Nessun cliente trovato</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Nessun contatto corrisponde ai filtri impostati.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs font-semibold text-teal-700 hover:underline pt-1"
            >
              Azzera filtri
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Cliente</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Servizio Abituale</th>
                  <th className="py-3.5 px-4">Ultimo Appuntamento</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Canale Preferito</th>
                  <th className="py-3.5 px-4">Stato Recall</th>
                  <th className="py-3.5 px-5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const analysis = analysisMap.get(client.id);

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-teal-50/20 transition-colors group cursor-pointer"
                      onClick={() => setDetailClient(client)}
                    >
                      {/* Name & Phone */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/50 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0 group-hover:bg-teal-100 transition-colors">
                            {client.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                              {client.name}
                            </p>
                            <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                              {client.phone || client.email || 'Nessun recapito'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-4 hidden md:table-cell max-w-xs">
                        <p className="text-slate-800 font-medium truncate">{client.lastService}</p>
                        {client.notes && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {client.notes}
                          </p>
                        )}
                      </td>

                      {/* Last Appointment */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800 font-mono tabular-nums">
                          {client.lastContactDate || 'Non specificata'}
                        </p>
                        {analysis && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {analysis.daysSinceLast} gg fa · {analysis.estimatedFrequencyDays} gg stima
                          </p>
                        )}
                      </td>

                      {/* Channel */}
                      <td className="py-4 px-4 hidden sm:table-cell whitespace-nowrap">
                        {getChannelBadge(client.preferredChannel)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {analysis?.hasFutureAppointment ? (
                          <span className="text-[11px] font-semibold text-teal-900 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-full">
                            Prenotato ({analysis.nextFutureAppointmentDate})
                          </span>
                        ) : analysis?.isRecallDue ? (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                            Da ricontattare (+{analysis.overdueDays} gg)
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                            In regola
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenCreateAppointmentModal(client)}
                            className="p-1.5 text-slate-400 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Nuovo appuntamento per questo cliente"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSelectClientForRecall(client)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-2xs"
                            title="Prepara messaggio recall"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                            <span className="hidden sm:inline">Messaggio</span>
                          </button>

                          <button
                            onClick={() => setEditingClient(client)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Modifica scheda cliente"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Sei sicuro di voler eliminare ${client.name}?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Elimina cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <ClientDetailDrawer
        client={detailClient}
        isOpen={detailClient !== null}
        onClose={() => setDetailClient(null)}
        onTriggerRecall={(c) => {
          setDetailClient(null);
          onSelectClientForRecall(c);
        }}
        onEditClient={(c) => {
          setDetailClient(null);
          setEditingClient(c);
        }}
        onCreateReminder={(c) => {
          setDetailClient(null);
          onOpenCreateAppointmentModal(c);
        }}
      />

      {/* Edit / Add Modal */}
      <ClientModal
        isOpen={isNewClientModalOpen || editingClient !== null}
        onClose={() => {
          setIsNewClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={onSaveClient}
        clientToEdit={editingClient}
      />
    </div>
  );
};
