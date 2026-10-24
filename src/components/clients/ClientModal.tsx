import React, { useState, useEffect } from 'react';
import { X, Check, User, Phone, Mail, Clock, Calendar, Sparkles } from 'lucide-react';
import { Client, RecallChannel, ClientStatus } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt'>, existingId?: string) => void;
  clientToEdit?: Client | null;
  defaultRecallDays?: number;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
  defaultRecallDays = 21,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<RecallChannel>('whatsapp');
  const [lastContactDate, setLastContactDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [recommendedRecallDays, setRecommendedRecallDays] = useState(defaultRecallDays);
  const [lastService, setLastService] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setPhone(clientToEdit.phone || '');
      setEmail(clientToEdit.email || '');
      setPreferredChannel(clientToEdit.preferredChannel || 'whatsapp');
      setLastContactDate(clientToEdit.lastContactDate || new Date().toISOString().split('T')[0]);
      setRecommendedRecallDays(clientToEdit.recommendedRecallDays || defaultRecallDays);
      setLastService(clientToEdit.lastService || '');
      setNotes(clientToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setPreferredChannel('whatsapp');
      setLastContactDate(new Date().toISOString().split('T')[0]);
      setRecommendedRecallDays(defaultRecallDays);
      setLastService('');
      setNotes('');
    }
  }, [clientToEdit, isOpen, defaultRecallDays]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        preferredChannel,
        lastContactDate,
        recommendedRecallDays: Number(recommendedRecallDays) || defaultRecallDays,
        lastService: lastService.trim() || 'Servizio / Trattamento',
        notes: notes.trim() || undefined,
      },
      clientToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-teal-900/10 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-950 via-[#0D5C63] to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {clientToEdit ? 'Modifica Scheda Cliente' : 'Aggiungi Nuovo Cliente'}
              </h2>
              <p className="text-xs text-teal-100/80">
                I dati vengono associati al tuo account personale con protezione RLS
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs sm:text-sm text-slate-800">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Nome e Cognome *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Marco Rossi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800"
            />
          </div>

          {/* Recapiti: Telefono & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-700" />
                <span>Telefono / Cellulare</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 340 1234567"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-700" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.it"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Tipo di servizio */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Tipo di Servizio Abituale *
            </label>
            <input
              type="text"
              required
              value={lastService}
              onChange={(e) => setLastService(e.target.value)}
              placeholder="es. Taglio & Modellatura Barba, Pulizia Viso, Seduta Posturale..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800"
            />
          </div>

          {/* Data Ultimo Appuntamento & Canale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Ultimo Appuntamento Conosciuto *</span>
              </label>
              <input
                type="date"
                required
                value={lastContactDate}
                onChange={(e) => setLastContactDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Canale Preferito
              </label>
              <select
                value={preferredChannel}
                onChange={(e) => setPreferredChannel(e.target.value as RecallChannel)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800"
              >
                <option value="whatsapp">WhatsApp (Consigliato)</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="call">Chiamata Telefonica</option>
              </select>
            </div>
          </div>

          {/* Intervallo stimato giorni */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-700" />
              <span>Intervallo iniziale stimato (giorni)</span>
            </label>
            <input
              type="number"
              min="7"
              max="180"
              value={recommendedRecallDays}
              onChange={(e) => setRecommendedRecallDays(Number(e.target.value) || 28)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Verrà ricalcolato automaticamente in base allo storico reale non appena saranno presenti almeno 2 appuntamenti svolti.
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Note per la personalizzazione dei messaggi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="es. Preferisce il giovedì pomeriggio; cliente molto attento ai dettagli..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-800 resize-none text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{clientToEdit ? 'Salva Modifiche' : 'Crea Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
