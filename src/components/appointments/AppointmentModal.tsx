import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle2, CalendarPlus, AlertCircle } from 'lucide-react';
import { Appointment, AppointmentStatus, Client } from '../../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  clients: Client[];
  initialClientId?: string;
  defaultService?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  initialClientId,
  defaultService,
}) => {
  const [clientId, setClientId] = useState(initialClientId || (clients[0]?.id || ''));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [service, setService] = useState(defaultService || '');
  const [status, setStatus] = useState<AppointmentStatus>('svolto');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClientId) {
      setClientId(initialClientId);
      const c = clients.find((x) => x.id === initialClientId);
      if (c && !service) {
        setService(c.lastService || '');
      }
    } else if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [initialClientId, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Seleziona un cliente.');
      return;
    }
    if (!date) {
      setError('Inserisci una data valida.');
      return;
    }
    if (!service.trim()) {
      setError('Inserisci il tipo di servizio.');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);

    onSave({
      clientId,
      clientName: selectedClient?.name,
      date,
      service: service.trim(),
      status,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-teal-900/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-950 via-[#0D5C63] to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registra Appuntamento</h2>
              <p className="text-xs text-teal-100/80">
                Aggiungi un appuntamento svolto o programma una prenotazione futura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Client Select */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Cliente *
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const c = clients.find((x) => x.id === e.target.value);
                if (c && c.lastService) setService(c.lastService);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.lastService ? `(${c.lastService})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Data *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Stato Appuntamento *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800 font-medium"
              >
                <option value="svolto">✅ Già svolto (Passato)</option>
                <option value="programmato">📅 Programmato (Futuro)</option>
              </select>
            </div>
          </div>

          {status === 'programmato' ? (
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
              <strong>Nota importante:</strong> Registrando un appuntamento futuro programmato, questo cliente verrà <strong>automaticamente escluso</strong> dall'elenco "Da ricontattare" per evitare contatti inutili.
            </div>
          ) : (
            <div className="p-3 bg-teal-50/60 border border-teal-900/10 rounded-xl text-xs text-teal-900">
              <strong>Calcolo frequenza:</strong> Gli appuntamenti completati concorrono a stimare la frequenza reale di ritorno del cliente.
            </div>
          )}

          {/* Service */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Tipo di Servizio *
            </label>
            <input
              type="text"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="es. Taglio & Barba, Pulizia viso, Trattamento schiena..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Note (opzionale)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dettagli specifici o preferenze espresse..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800 resize-none text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              Salva Appuntamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
