import React, { useState } from 'react';
import {
  ShieldAlert,
  Database,
  Key,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Info,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  getEffectiveSupabaseConfig,
  saveLocalSupabaseConfig,
  removeLocalSupabaseConfig,
} from '../../services/supabaseClient';

interface SupabaseSetupNoticeProps {
  onConfigSaved?: () => void;
}

export const SupabaseSetupNotice: React.FC<SupabaseSetupNoticeProps> = ({ onConfigSaved }) => {
  const currentConfig = getEffectiveSupabaseConfig();
  const [urlInput, setUrlInput] = useState(
    currentConfig.url && !currentConfig.url.includes('your-project-id') ? currentConfig.url : ''
  );
  const [keyInput, setKeyInput] = useState(
    currentConfig.anonKey && !currentConfig.anonKey.includes('your-anon-public-key')
      ? currentConfig.anonKey
      : ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUrl = urlInput.trim();
    const cleanKey = keyInput.trim();

    if (!cleanUrl || (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://'))) {
      setErrorMessage('Inserisci un URL Supabase valido (es. https://xyzcompany.supabase.co)');
      return;
    }

    if (!cleanKey || cleanKey.length < 20) {
      setErrorMessage('Inserisci una chiave anon valida (la trovi in Project Settings -> API -> Project API keys -> anon public)');
      return;
    }

    saveLocalSupabaseConfig(cleanUrl, cleanKey);
    setSaveSuccess(true);
    if (onConfigSaved) onConfigSaved();
  };

  const handleReset = () => {
    removeLocalSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    setSaveSuccess(false);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-800">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-teal-900/10 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#083338] via-[#0D5C63] to-[#14B8A6] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
              ClientRecall
            </h1>
            <p className="text-xs text-teal-800 font-semibold tracking-wider uppercase mt-1">
              Configurazione Supabase Richiesta
            </p>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 space-y-1">
            <p className="font-bold text-amber-900">
              Supabase Auth non è ancora collegato
            </p>
            <p className="text-amber-800/90 leading-relaxed">
              Come richiesto, ClientRecall utilizza l'autenticazione reale con Supabase e non simula login fittizi. Per consentire l'accesso e la registrazione degli utenti, sono necessari l'URL del tuo progetto Supabase e la chiave pubblica anonima.
            </p>
          </div>
        </div>

        {/* How to get credentials */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Come ottenere le credenziali in 3 passi:
          </h2>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside bg-slate-50 p-4 rounded-2xl border border-slate-200/60 leading-relaxed">
            <li>
              Accedi alla tua dashboard su{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 font-semibold underline inline-flex items-center gap-0.5"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              e seleziona il tuo progetto.
            </li>
            <li>
              Vai su <strong>Project Settings</strong> (icona ingranaggio in basso a sinistra) &rarr; <strong>API</strong>.
            </li>
            <li>
              Copia <strong>Project URL</strong> e la chiave <strong>anon public</strong> (Project API keys).
            </li>
          </ol>
        </div>

        {/* Config Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-700" />
              <span>VITE_SUPABASE_URL</span>
            </label>
            <input
              type="url"
              required
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-teal-700" />
              <span>VITE_SUPABASE_ANON_KEY (chiave pubblica anonima)</span>
            </label>
            <input
              type="text"
              required
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nota di sicurezza: usa solo la chiave <strong className="text-slate-600">anon public</strong>. Non inserire MAI la chiave segreta <code className="font-mono text-rose-600">service_role</code> nel frontend.
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errorMessage}
            </p>
          )}

          {saveSuccess && (
            <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Configurazione salvata! Connessione a Supabase in corso...</span>
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-sm shadow-teal-900/15 flex items-center justify-center gap-2"
            >
              <span>Salva e Connetti a Supabase</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {currentConfig.isFromLocalStorage && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-rose-600 underline"
              >
                Rimuovi configurazione memorizzata
              </button>
            )}
          </div>
        </form>

        {/* Security & RLS notice */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            I dati futuri saranno protetti da <strong>Row Level Security (RLS)</strong> su Supabase, garantendo che ogni professionista possa accedere esclusivamente ai propri clienti e promemoria.
          </p>
        </div>
      </div>
    </div>
  );
};
