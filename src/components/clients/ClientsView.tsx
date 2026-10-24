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
} from 'lucide-react';
import { Client, ClientStatus, RecallChannel } from '../../types';
import { ClientModal } from './ClientModal';

interface ClientsViewProps {
  clients: Client[];
  onSelectClientForRecall: (client: Client) => void;
  onSaveClient: (clientData: Omit<Client, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeleteClient: (id: string) => void;
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onSelectClientForRecall,
  onSaveClient,
  onDeleteClient,
  isNewClientModalOpen,
  setIsNewClientModalOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const getDaysAgo = (dateStr: string) => {
    const diffTime = Math.abs(new Date('2026-10-24').getTime() - new Date(dateStr).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
          <span className="inline-flex items-center gap-1.5 text-xs text-sky-800 font-medium">
            <Mail className="w-3.5 h-3.5 text-sky-600" />
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
      case 'call':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-800 font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chiamata</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">Altro</span>;
    }
  };

  const getStatusLabel = (status: ClientStatus) => {
    switch (status) {
      case 'urgent':
        return (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
            Scaduto
          </span>
        );
      case 'due':
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
            In scadenza
          </span>
        );
      case 'recent':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
            Recente
          </span>
        );
      case 'paused':
        return (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
            In pausa
          </span>
        );
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.companyOrRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.lastService.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.tags && client.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;
      if (selectedStatus === 'all') return true;
      return client.status === selectedStatus;
    });
  }, [clients, searchQuery, selectedStatus]);

  const counts = {
    all: clients.length,
    urgent: clients.filter((c) => c.status === 'urgent').length,
    due: clients.filter((c) => c.status === 'due').length,
    recent: clients.filter((c) => c.status === 'recent').length,
    paused: clients.filter((c) => c.status === 'paused').length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search and Segmented Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca cliente per nome, servizio, tag..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedStatus === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tutti ({counts.all})
          </button>
          <button
            onClick={() => setSelectedStatus('urgent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedStatus === 'urgent'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scaduti ({counts.urgent})
          </button>
          <button
            onClick={() => setSelectedStatus('due')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedStatus === 'due'
                ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In scadenza ({counts.due})
          </button>
          <button
            onClick={() => setSelectedStatus('recent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedStatus === 'recent'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recenti ({counts.recent})
          </button>
          <button
            onClick={() => setSelectedStatus('paused')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedStatus === 'paused'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In pausa ({counts.paused})
          </button>
        </div>
      </div>

      {/* Clients Table (Airy & Spacious) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Nessun cliente trovato</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Nessun contatto corrisponde ai criteri impostati.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
              className="text-xs font-medium text-indigo-600 hover:underline pt-1"
            >
              Azzera filtri
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5 sm:px-6">Cliente</th>
                  <th className="py-3 px-4 hidden md:table-cell">Ultimo Servizio</th>
                  <th className="py-3 px-4">Ultimo Contatto</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Canale</th>
                  <th className="py-3 px-4">Stato</th>
                  <th className="py-3 px-5 sm:px-6 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredClients.map((client) => {
                  const daysAgo = getDaysAgo(client.lastContactDate);

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Name & Role */}
                      <td className="py-4 px-5 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0">
                            {client.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{client.name}</p>
                            <p className="text-slate-400 text-[11px] truncate mt-0.5">
                              {client.companyOrRole}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-4 hidden md:table-cell max-w-xs">
                        <p className="text-slate-700 font-medium truncate">{client.lastService}</p>
                        {client.notes && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {client.notes}
                          </p>
                        )}
                      </td>

                      {/* Last Contact */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-700 font-mono tabular-nums">
                          {client.lastContactDate}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                          {daysAgo} gg fa (ciclo {client.recommendedRecallDays}gg)
                        </p>
                      </td>

                      {/* Channel */}
                      <td className="py-4 px-4 hidden sm:table-cell whitespace-nowrap">
                        {getChannelBadge(client.preferredChannel)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusLabel(client.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectClientForRecall(client)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-2xs"
                            title="Genera messaggio recall"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="hidden sm:inline">Recall</span>
                          </button>

                          <button
                            onClick={() => setEditingClient(client)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Modifica scheda"
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

      {/* Modal */}
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
