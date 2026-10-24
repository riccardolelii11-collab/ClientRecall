import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  ChevronLeft,
  CalendarCheck2,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Info,
} from 'lucide-react';
import { useAuth } from '../../services/authContext';

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, resetPasswordForEmail, activateSessionFromLink, signInQuickDemo, isConfigured } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEmailUnconfirmedError, setIsEmailUnconfirmedError] = useState(false);

  // Email localhost helper state
  const [showEmailHelp, setShowEmailHelp] = useState(false);
  const [pastedLink, setPastedLink] = useState('');
  const [isActivatingLink, setIsActivatingLink] = useState(false);
  const [activationError, setActivationError] = useState('');
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsEmailUnconfirmedError(false);
    setActivationError('');
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    clearMessages();
  };

  const copyCurrentOrigin = () => {
    if (typeof navigator !== 'undefined' && currentOrigin) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2500);
    }
  };

  const handleActivatePastedLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedLink.trim()) {
      setActivationError('Incolla l’indirizzo URL o il link di conferma ricevuto.');
      return;
    }

    setIsActivatingLink(true);
    setActivationError('');
    try {
      const res = await activateSessionFromLink(pastedLink);
      if (res.error) {
        setActivationError(res.error.message || 'Impossibile convalidare il link inserito.');
      } else {
        setSuccessMessage('Sessione attivata con successo! Benvenuto in ClientRecall.');
      }
    } catch (err: any) {
      setActivationError(err?.message || 'Errore durante la convalida del link.');
    } finally {
      setIsActivatingLink(false);
    }
  };

  const translateAuthError = (err: any): string => {
    const msg = (err?.message || '').toLowerCase();

    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return 'Email o password non corretti. Verifica le tue credenziali e riprova.';
    }
    if (msg.includes('user already registered') || msg.includes('already exists')) {
      return 'Esiste già un account registrato con questo indirizzo email. Puoi accedere direttamente.';
    }
    if (msg.includes('password should be at least 6 characters') || msg.includes('weak password')) {
      return 'La password deve contenere almeno 6 caratteri.';
    }
    if (msg.includes('email not confirmed')) {
      setIsEmailUnconfirmedError(true);
      setShowEmailHelp(true);
      return 'La tua email non è stata ancora confermata in Supabase. Questo succede perché il link nell’email puntava di default a localhost:3000 anziché a questo sito online.';
    }
    if (msg.includes('rate limit')) {
      return 'Troppi tentativi consecutivi. Attendi qualche minuto prima di riprovare.';
    }
    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return 'Errore di connessione a Supabase. Verifica che il tuo progetto Supabase sia attivo e l’URL sia raggiungibile.';
    }

    return err?.message || 'Si è verificato un errore durante l’operazione. Riprova tra poco.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setErrorMessage('Inserisci email e password per accedere.');
          setIsSubmitting(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(translateAuthError(error));
        } else {
          setSuccessMessage('Accesso riuscito! Caricamento della tua area riservata...');
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Inserisci il tuo nome e cognome o il nome dell’attività.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !password) {
          setErrorMessage('Inserisci email e password per registrarti.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('La password deve contenere almeno 6 caratteri.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Le due password inserite non coincidono. Riprova.');
          setIsSubmitting(false);
          return;
        }

        const { error, session } = await signUp(name, email, password);
        if (error) {
          setErrorMessage(translateAuthError(error));
        } else {
          if (session) {
            setSuccessMessage('Registrazione completata con successo! Benvenuto in ClientRecall.');
          } else {
            setSuccessMessage(
              'Registrazione inviata! Se ricevi l’email con link localhost:3000, consulta il riquadro sottostante per completare l’accesso in 30 secondi.'
            );
            setShowEmailHelp(true);
            setMode('login');
          }
        }
      } else if (mode === 'forgot_password') {
        if (!email.trim()) {
          setErrorMessage('Inserisci il tuo indirizzo email per ricevere il link di ripristino.');
          setIsSubmitting(false);
          return;
        }

        const { error } = await resetPasswordForEmail(email);
        if (error) {
          setErrorMessage(translateAuthError(error));
        } else {
          setSuccessMessage(
            'Ti abbiamo inviato un’email con le istruzioni per reimpostare la tua password.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(translateAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-800">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-teal-900/10 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#083338] via-[#0D5C63] to-[#14B8A6] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2DD4BF] ring-2 ring-white" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ClientRecall
            </h1>
            <p className="text-xs text-teal-800 font-semibold tracking-wider uppercase mt-0.5">
              Attività & Professionisti su Appuntamento
            </p>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === 'login' && 'Accedi con il tuo account Supabase per gestire clienti e promemoria di recall.'}
            {mode === 'register' && 'Crea un nuovo account per gestire i ricontatti della tua attività.'}
            {mode === 'forgot_password' && 'Inserisci la tua email per ricevere il link di ripristino password.'}
          </p>
        </div>

        {/* Tab switch between Login & Register */}
        {mode !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-teal-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-teal-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Registrati
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-700" />
                <span>Nome e Cognome / Studio *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Riccardo Lelli / Studio Fisio"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-700" />
              <span>Email *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="es. riccardo.lelii11@gmail.com"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all text-slate-800 font-mono"
            />
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Password *</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot_password')}
                    className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 underline"
                  >
                    Password dimenticata?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all text-slate-800"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                <span>Conferma Password *</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all text-slate-800"
              />
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium leading-relaxed">{errorMessage}</p>
                {isEmailUnconfirmedError && (
                  <p className="text-[11px] text-rose-700">
                    💡 Vedi sotto la guida rapida per confermare l’account in 1 clic su Supabase o incollare il link ricevuto.
                  </p>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-900/15 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifica in corso...</span>
              </span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Accedi a ClientRecall'}
                  {mode === 'register' && 'Crea il tuo Account'}
                  {mode === 'forgot_password' && 'Invia Link di Ripristino'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Direct 1-Click Test Access Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => signInQuickDemo(email || 'riccardo.lelii11@gmail.com', name || 'Riccardo Lelli')}
            className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100/80 text-teal-900 border border-teal-200/80 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
          >
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            <span>Entra subito in modalità Test Rapido (Riccardo)</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-1">
            Accesso immediato per testare clienti, calcolo frequenze, promemoria e messaggi.
          </p>
        </div>

        {/* Special Helper: Email link opens localhost:3000 explanation & solutions */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowEmailHelp(!showEmailHelp)}
            className="w-full py-2 px-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 text-amber-900 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2 text-left">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Il link dell’email ha aperto localhost:3000? Come risolvere</span>
            </span>
            {showEmailHelp ? (
              <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-700 shrink-0" />
            )}
          </button>

          {showEmailHelp && (
            <div className="mt-3 p-4 bg-amber-50/40 border border-amber-200 rounded-2xl text-xs text-slate-700 space-y-3.5 animate-in fade-in">
              <div className="space-y-1">
                <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Perché succede?</span>
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Supabase di default imposta il <strong>Site URL</strong> su <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-950 font-mono">http://localhost:3000</code>.
                  Poiché ClientRecall è ospitato online su Google Cloud e non in locale sul tuo PC, cliccando il link nell’email il browser tenta di aprire il tuo PC dove non c’è nessun server attivo.
                </p>
              </div>

              {/* Solution 1: Paste link from email or error page */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/70 space-y-2">
                <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-teal-700" />
                  <span>Soluzione 1: Incolla qui il link dell’email o di errore</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Copia l’indirizzo dalla scheda con l’errore su localhost (es. <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">localhost:3000/#access_token=...</code>) o il link dell’email:
                </p>
                <form onSubmit={handleActivatePastedLink} className="space-y-2">
                  <input
                    type="text"
                    value={pastedLink}
                    onChange={(e) => setPastedLink(e.target.value)}
                    placeholder="Incolla l'indirizzo con #access_token=... o il link dell'email"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-700 focus:outline-none"
                  />
                  {activationError && (
                    <p className="text-[11px] text-rose-600 font-medium">{activationError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isActivatingLink}
                    className="w-full py-2 px-3 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    {isActivatingLink ? 'Convalida in corso...' : 'Attiva Sessione e Accedi Subito'}
                  </button>
                </form>
              </div>

              {/* Solution 2: Turn off confirm email in Supabase dashboard */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/70 space-y-2">
                <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Soluzione 2 (Consigliata per lo sviluppo): Disattiva la verifica email</span>
                </p>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                  <li>Apri la tua <strong>Dashboard Supabase</strong>.</li>
                  <li>Vai su <strong>Authentication</strong> &gt; <strong>Providers</strong> &gt; <strong>Email</strong>.</li>
                  <li>Disattiva l’interruttore <strong>"Confirm email"</strong> e clicca <strong>Save</strong>.</li>
                  <li>
                    Se l’utente è già registrato: vai su <strong>Authentication</strong> &gt; <strong>Users</strong>, clicca <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">...</code> accanto alla tua email e seleziona <strong>"Confirm user"</strong>.
                  </li>
                </ol>
                <p className="text-[11px] text-teal-800 font-medium">
                  Così potrai accedere subito con email e password senza dover mai attendere email!
                </p>
              </div>

              {/* Solution 3: Set Site URL to the cloud domain */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/70 space-y-2">
                <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
                  <span>Soluzione 3: Imposta l’URL online in Supabase</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Nel pannello Supabase su <strong>Authentication</strong> &gt; <strong>URL Configuration</strong>, imposta <strong>Site URL</strong> con l’indirizzo online di ClientRecall:
                </p>
                <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-lg">
                  <input
                    type="text"
                    readOnly
                    value={currentOrigin}
                    className="w-full text-[11px] bg-transparent font-mono text-slate-700 select-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyCurrentOrigin}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 shrink-0"
                  >
                    {copiedOrigin ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copiato</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copia URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="pt-2 text-center text-xs text-slate-500">
          {mode === 'forgot_password' ? (
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:underline"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Torna alla schermata di accesso</span>
            </button>
          ) : mode === 'login' ? (
            <p>
              Non hai ancora un account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="font-semibold text-teal-800 hover:underline"
              >
                Registrati gratuitamente
              </button>
            </p>
          ) : (
            <p>
              Hai già un account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="font-semibold text-teal-800 hover:underline"
              >
                Accedi subito
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Autenticazione reale protetta da Supabase Auth</span>
        </div>
      </div>
    </div>
  );
};

