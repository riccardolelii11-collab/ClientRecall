import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Clock,
  ExternalLink,
  Sparkles,
  Copy,
  Database,
  Building,
  User,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, ProfessionType, RecallChannel } from '../../types';
import { DEFAULT_PROFESSION_CONFIG } from '../../services/recallEngine';
import { SUPABASE_SQL_SCHEMA } from '../../services/supabaseDataService';

interface SettingsViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onSeedProfessionData?: (profession: ProfessionType) => Promise<void>;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onSeedProfessionData,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);
  const [isSqlCopied, setIsSqlCopied] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleProfessionChange = (prof: ProfessionType) => {
    const conf = DEFAULT_PROFESSION_CONFIG[prof];
    setFormData({
      ...formData,
      profession: prof,
      defaultRecallDays: conf.defaultIntervalDays,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    onShowToast('Impostazioni profilo salvate');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setIsSqlCopied(true);
      onShowToast(
        'Script SQL copiato negli appunti!',
        'Incollalo ed eseguilo nel tuo SQL Editor su Supabase per attivare le tabelle con RLS.'
      );
      setTimeout(() => setIsSqlCopied(false), 3000);
    } catch {
      onShowToast('Copia manuale', 'Seleziona e copia il testo SQL.', 'info');
    }
  };

  const handleSeedData = async () => {
    if (!onSeedProfessionData) return;
    setIsSeeding(true);
    try {
      await onSeedProfessionData((formData.profession as ProfessionType) || 'barbiere');
      onShowToast('Clienti dimostrativi caricati con successo!');
    } catch (err) {
      onShowToast('Errore durante il caricamento', 'Riprova', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* 1. General Profile & Profession */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Profilo Professionista & Attività
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                La professione selezionata calibra l'intervallo ideale di ritorno e i modelli di messaggio.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-full">
              Autenticato con Supabase
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profession Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Professione / Settore *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(DEFAULT_PROFESSION_CONFIG) as ProfessionType[]).map((pKey) => {
                const conf = DEFAULT_PROFESSION_CONFIG[pKey];
                const isSelected = formData.profession === pKey;

                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => handleProfessionChange(pKey)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/70 font-semibold text-teal-950 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg block" role="img" aria-label={conf.label}>
                      {conf.emoji}
                    </span>
                    <span className="text-xs font-bold block mt-1 leading-tight">
                      {conf.label.split('/')[0]}
                    </span>
                    <span className="text-[10px] text-teal-800 block mt-0.5">
                      ~{conf.defaultIntervalDays} gg ciclo
                    </span>
                  </button>
                );
              })}
            </div>

            {formData.profession === 'altro' && (
              <div className="pt-2">
                <input
                  type="text"
                  value={formData.customProfessionTitle || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, customProfessionTitle: e.target.value })
                  }
                  placeholder="Specifica la tua professione (es. Tatuatore, Nutrizionista...)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>Nome Professionista / Titolare *</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="es. Riccardo Lelli"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-700" />
                <span>Nome Insegna / Studio</span>
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="es. Barberia Moderna"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>Ciclo Base Stimato (gg)</span>
              </label>
              <input
                type="number"
                min="7"
                max="180"
                value={formData.defaultRecallDays}
                onChange={(e) =>
                  setFormData({ ...formData, defaultRecallDays: Number(e.target.value) || 21 })
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Canale Predefinito
              </label>
              <select
                value={formData.defaultChannel}
                onChange={(e) =>
                  setFormData({ ...formData, defaultChannel: e.target.value as RecallChannel })
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-700" />
                <span>Recapito Telefonico Studio</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+39 02 1234567"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Le modifiche si applicano istantaneamente alle prossime bozze.
            </p>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvato!</span>
                </>
              ) : (
                <span>Salva Preferenze</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Supabase Database & Row Level Security (RLS) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Configurazione Database Supabase & Policy RLS
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Ogni cliente e appuntamento appartiene esclusivamente all'utente che lo ha inserito,
              garantito dalle policy Row Level Security (RLS) di PostgreSQL.
            </p>
          </div>

          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>RLS Ready</span>
          </span>
        </div>

        <div className="p-4 bg-teal-50/60 border border-teal-900/10 rounded-2xl text-xs text-teal-900 space-y-2">
          <p className="font-bold">Come attivare le tabelle nel tuo progetto Supabase:</p>
          <ol className="list-decimal list-inside space-y-1 text-teal-800/90 leading-relaxed">
            <li>Apri il tuo pannello su Supabase.com e seleziona il progetto.</li>
            <li>
              Vai nella sezione <strong>SQL Editor</strong> e clicca su <strong>+ New Query</strong>.
            </li>
            <li>Incolla il codice SQL riportato qui sotto e clicca su <strong>Run</strong>.</li>
            <li>
              Le tabelle <code className="bg-white px-1 py-0.5 rounded text-teal-950 font-mono">profiles</code>, <code className="bg-white px-1 py-0.5 rounded text-teal-950 font-mono">clients</code> e <code className="bg-white px-1 py-0.5 rounded text-teal-950 font-mono">appointments</code> saranno create con isolamento totale tra account.
            </li>
          </ol>
        </div>

        {/* SQL Code Box */}
        <div className="relative">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Script SQL Completo (Tabelle + Policy RLS)
            </span>
            <button
              onClick={handleCopySql}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                isSqlCopied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-teal-900 border-teal-700/30 hover:bg-teal-50'
              }`}
            >
              {isSqlCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiato negli Appunti!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copia Script SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-56 border border-slate-800 leading-relaxed select-all">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {/* Supabase URL Configuration & Email Redirect info */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">
              Impostazione Site URL & Conferma Email su Supabase
            </span>
            <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
              Consigliato
            </span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Per fare in modo che le email di conferma inviate da Supabase puntino direttamente a questa app online (e non a <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono">localhost:3000</code>), imposta l'indirizzo sottostante in <strong>Authentication &gt; URL Configuration &gt; Site URL</strong>:
          </p>
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.origin : ''}
              className="w-full text-xs font-mono text-slate-700 bg-transparent outline-none select-all"
            />
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.origin);
                  onShowToast('URL Copiato', 'Incollalo in Supabase > Authentication > URL Configuration');
                }
              }}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-teal-700" />
              <span>Copia URL Online</span>
            </button>
          </div>
          <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-snug">
            💡 <strong>Suggerimento rapido:</strong> Per testare senza attendere le email, puoi anche disattivare <strong>"Confirm email"</strong> in <em>Supabase &gt; Authentication &gt; Providers &gt; Email</em>. In questo modo le registrazioni e i login sono istantanei!
          </div>
        </div>

        {/* Demo Data Seeder */}
        {onSeedProfessionData && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Popola clienti dimostrativi per {DEFAULT_PROFESSION_CONFIG[formData.profession as ProfessionType]?.label || 'la tua attività'}
              </p>
              <p className="text-[11px] text-slate-400">
                Aggiunge 4 clienti campione con storico appuntamenti per testare la formula di ricontatto.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Caricamento...' : 'Carica Clienti di Esempio'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
