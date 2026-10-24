import React, { useState, useEffect } from 'react';
import { X, Check, User, Briefcase, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import { Client, RecallChannel, ClientStatus } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt'>, existingId?: string) => void;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const [name, setName] = useState('');
  const [companyOrRole, setCompanyOrRole] = useState('');
  const [category, setCategory] = useState('Salute & Benessere');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<RecallChannel>('whatsapp');
  const [lastContactDate, setLastContactDate] = useState('2026-10-01');
  const [recommendedRecallDays, setRecommendedRecallDays] = useState(45);
  const [lastService, setLastService] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ClientStatus>('due');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setCompanyOrRole(clientToEdit.companyOrRole);
      setCategory(clientToEdit.category);
      setPhone(clientToEdit.phone);
      setEmail(clientToEdit.email);
      setPreferredChannel(clientToEdit.preferredChannel);
      setLastContactDate(clientToEdit.lastContactDate);
      setRecommendedRecallDays(clientToEdit.recommendedRecallDays);
      setLastService(clientToEdit.lastService);
      setNotes(clientToEdit.notes);
      setStatus(clientToEdit.status);
      setTags(clientToEdit.tags || []);
    } else {
      setName('');
      setCompanyOrRole('');
      setCategory('Salute & Benessere');
      setPhone('');
      setEmail('');
      setPreferredChannel('whatsapp');
      setLastContactDate(new Date().toISOString().split('T')[0]);
      setRecommendedRecallDays(45);
      setLastService('');
      setNotes('');
      setStatus('recent');
      setTags(['Nuovo']);
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        companyOrRole: companyOrRole.trim() || 'Cliente privato',
        category,
        phone: phone.trim(),
        email: email.trim(),
        preferredChannel,
        lastContactDate,
        recommendedRecallDays: Number(recommendedRecallDays) || 30,
        lastService: lastService.trim() || 'Servizio / Consulenza',
        notes: notes.trim(),
        status,
        tags,
      },
      clientToEdit?.id
    );
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {clientToEdit ? 'Modifica Cliente' : 'Aggiungi Nuovo Cliente'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome e Cognome *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Laura Marini"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professione o Azienda
              </label>
              <input
                type="text"
                value={companyOrRole}
                onChange={(e) => setCompanyOrRole(e.target.value)}
                placeholder="es. Studio Legale / Freelance"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefono / Cellulare
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="es. +39 347 1234567"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="es. cliente@email.it"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          {/* Preferred Channel & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canale Preferito di Ricontatto
              </label>
              <select
                value={preferredChannel}
                onChange={(e) => setPreferredChannel(e.target.value as RecallChannel)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="whatsapp">WhatsApp (Consigliato)</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="call">Telefono / Chiamata</option>
                <option value="dm">Messaggio Diretto (Instagram/LinkedIn)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria / Settore
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="Salute & Benessere">Salute & Benessere</option>
                <option value="Consulenza & Servizi">Consulenza & Servizi</option>
                <option value="Design & Comunicazione">Design & Comunicazione</option>
                <option value="Sport & Performance">Sport & Performance</option>
                <option value="Arte & Eventi">Arte & Eventi</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
          </div>

          {/* Last Service & Recall Schedule */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ultimo Servizio o Trattamento
            </label>
            <input
              type="text"
              value={lastService}
              onChange={(e) => setLastService(e.target.value)}
              placeholder="es. Consulenza posturale o revisione bilancio"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Ultimo Contatto
              </label>
              <input
                type="date"
                value={lastContactDate}
                onChange={(e) => setLastContactDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ciclo Recall (Giorni)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={recommendedRecallDays}
                onChange={(e) => setRecommendedRecallDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stato Recall
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                <option value="recent">Recente / In regola</option>
                <option value="due">In scadenza</option>
                <option value="urgent">Da ricontattare urgente</option>
                <option value="paused">In pausa / Sospeso</option>
              </select>
            </div>
          </div>

          {/* Notes for AI generator */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note personali & Preferenze (usate dall'AI per contestualizzare)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="es. Preferisce essere ricontattato dopo le 16:00. Aveva segnalato un miglioramento al collo."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tag / Etichette
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Aggiungi tag (es. VIP, Sportivo)"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Aggiungi
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
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
