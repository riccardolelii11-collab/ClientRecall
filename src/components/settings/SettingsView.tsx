import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  RotateCcw,
  Check,
} from 'lucide-react';
import { UserProfile, RecallChannel } from '../../types';
import { storageService } from '../../services/storageService';

interface SettingsViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetDemoData: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onResetDemoData,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    onShowToast('Profilo aggiornato con successo');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = storageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientrecall-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Backup scaricato in JSON');
  };

  const handleReset = () => {
    if (
      confirm(
        'Ripristinare i dati dimostrativi di default? Tutti i clienti e i promemoria verranno reimpostati.'
      )
    ) {
      onResetDemoData();
      onShowToast('Dati demo ripristinati');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-8">
      {/* Profile & Business Details */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Profilo Professionale & Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parametri usati dal Generatore AI per personalizzare saluti e firme dei messaggi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Il tuo Nome e Titolo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="es. Riccardo Lelli / Dott.ssa Rossi"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Nome Studio / Brand
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="es. Studio Fisioterapia Dinamica"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Settore di Attività
              </label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="es. Fisioterapia, Consulenza, Design"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Canale Predefinito
              </label>
              <select
                value={formData.defaultChannel}
                onChange={(e) => setFormData({ ...formData, defaultChannel: e.target.value as RecallChannel })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="call">Telefono</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Ciclo Recall Tipico (Giorni)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={formData.defaultRecallDays}
                onChange={(e) => setFormData({ ...formData, defaultRecallDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Firma di Chiusura
            </label>
            <input
              type="text"
              value={formData.signature}
              onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
              placeholder="es. Dott. Riccardo Lelli - Fisioterapista"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? 'Salvato!' : 'Salva Impostazioni'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Privacy & Contact Ethics Section */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Etica del Contatto & Rispetto GDPR
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          ClientRecall nasce per <strong>coltivare relazioni genuine con persone che ti conoscono già</strong>, evitando newsletter massive o automatismi invasivi che rischiano di danneggiare la reputazione della tua attività.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
            <p className="font-semibold text-slate-800 mb-1">Cura del Cliente, Non Spam</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Il contatto si basa sul servizio già erogato e sull'interesse reciproco a verificare risultati e benefici nel tempo.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
            <p className="font-semibold text-slate-800 mb-1">Supervisione Personale Totale</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Non c'è invio automatizzato: sei sempre tu a validare ogni parola prima di inoltrarla.
            </p>
          </div>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Archivio Dati & Backup</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            I dati sono salvati nel tuo browser locale. Puoi esportarli o ripristinare i dati demo in ogni momento.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Esporta Dati (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Ripristina Dati Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
