import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  CalendarPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  Calendar,
  Check,
} from 'lucide-react';
import { Appointment, Client, AppointmentStatus } from '../../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  clients: Client[];
  onOpenNewAppointmentModal: () => void;
  onUpdateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onOpenClientDrawer: (client: Client) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  clients,
  onOpenNewAppointmentModal,
  onUpdateAppointmentStatus,
  onDeleteAppointment,
  onOpenClientDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'svolto' | 'programmato'>('all');

  const filtered = useMemo(() => {
    return appointments.filter((app) => {
      const clientName = app.clientName || clients.find((c) => c.id === app.clientId)?.name || '';
      const matchesSearch =
        clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      return app.status === statusFilter;
    });
  }, [appointments, clients, searchQuery, statusFilter]);

  const counts = {
    all: appointments.length,
    svolto: appointments.filter((a) => a.status === 'svolto').length,
    programmato: appointments.filter((a) => a.status === 'programmato').length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-teal-900/10 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Registro Appuntamenti
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Storico & Appuntamenti Futuri
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Registra le sedute per calcolare la frequenza di ritorno. Non consideriamo svolto un
            appuntamento automaticamente: segnalo tu quando completato.
          </p>
        </div>

        <button
          onClick={onOpenNewAppointmentModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs self-start sm:self-auto active:scale-[0.98]"
        >
          <CalendarPlus className="w-4 h-4 text-teal-200" />
          <span>Nuovo Appuntamento</span>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per cliente o servizio..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tutti ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('svolto')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === 'svolto'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completati / Svolti ({counts.svolto})
          </button>
          <button
            onClick={() => setStatusFilter('programmato')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === 'programmato'
                ? 'bg-white text-teal-950 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Futuri Programmati ({counts.programmato})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Nessun appuntamento registrato</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Inizia registrando gli appuntamenti svolti dei tuoi clienti per attivare il calcolo
              intelligente della frequenza.
            </p>
            <button
              onClick={onOpenNewAppointmentModal}
              className="text-xs font-semibold text-teal-700 hover:underline pt-1"
            >
              + Aggiungi il primo appuntamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Servizio</th>
                  <th className="py-3 px-4">Stato</th>
                  <th className="py-3 px-4 hidden md:table-cell">Note</th>
                  <th className="py-3 px-5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => {
                  const client = clients.find((c) => c.id === app.clientId);
                  const clientName = app.clientName || client?.name || 'Cliente';
                  const isCompleted = app.status === 'svolto';

                  return (
                    <tr key={app.id} className="hover:bg-teal-50/20 transition-colors group">
                      <td className="py-3.5 px-5 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {app.date}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {client ? (
                          <button
                            onClick={() => onOpenClientDrawer(client)}
                            className="hover:text-teal-800 hover:underline transition-colors"
                          >
                            {clientName}
                          </button>
                        ) : (
                          <span>{clientName}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">{app.service}</td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Svolto</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-900 border border-teal-200/60">
                            <Clock className="w-3 h-3 text-teal-600" />
                            <span>Programmato</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 hidden md:table-cell max-w-xs truncate">
                        {app.notes || '—'}
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCompleted && (
                            <button
                              onClick={() => onUpdateAppointmentStatus(app.id, 'svolto')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60 flex items-center gap-1"
                              title="Segna come svolto (quando il cliente si presenta)"
                            >
                              <Check className="w-3 h-3" />
                              <span>Segna Svolto</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('Vuoi eliminare questo appuntamento?')) {
                                onDeleteAppointment(app.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Elimina appuntamento"
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
    </div>
  );
};
