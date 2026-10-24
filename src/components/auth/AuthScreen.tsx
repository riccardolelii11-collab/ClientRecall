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
  HelpCircle,
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../services/authContext';

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, resetPasswordForEmail, activateSessionFromLink, signInQuickDemo } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEmailUnconfirmedError, setIsEmailUnconfirmedError] = useState(false);

  // Email helper state for Supabase
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
      return 'La tua email non è stata ancora confermata in Supabase. Controlla la casella di posta o vedi le istruzioni sottostanti.';
    }
    if (msg.includes('rate limit')) {
      return 'Troppi tentativi consecutivi. Attendi qualche minuto prima di riprovare.';
    }
    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return 'Errore di connessione a Supabase. Verifica che il database sia raggiungibile.';
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
          setSuccessMessage('Accesso riuscito! Caricamento in corso...');
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
          setErrorMessage('Le due password inserite non coincidono.');
          setIsSubmitting(false);
          return;
        }

        const { error, session } = await signUp(name, email, password);
        if (error) {
          setErrorMessage(translateAuthError(error));
        } else {
          if (session) {
            setSuccessMessage('Registrazione completata! Benvenuto in ClientRecall.');
          } else {
            setSuccessMessage(
              'Registrazione inviata con successo! Abbiamo inviato l’email di conferma al tuo indirizzo. Clicca sul link nell’email per accedere.'
            );
            setMode('login');
          }
        }
      } else if (mode === 'forgot_password') {
        if (!email.trim()) {
          setErrorMessage('Inserisci la tua email per ricevere il link di ripristino.');
          setIsSubmitting(false);
          return;
        }

        const { error } = await resetPasswordForEmail(email);
        if (error) {
          setErrorMessage(translateAuthError(error));
        } else {
          setSuccessMessage(
            'Ti abbiamo inviato un’email con il link per reimpostare la tua password.'
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#F8FAFA] to-teal-50/20 flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#083338] via-[#0D5C63] to-[#14B8A6] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2DD4BF] ring-2 ring-white" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ClientRecall
            </h1>
            <p className="text-[11px] text-teal-800 font-semibold tracking-wider uppercase mt-0.5">
              Intelligenza per Professionisti su Appuntamento
            </p>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === 'login' && 'Accedi al tuo account per gestire clienti e promemoria di recall.'}
            {mode === 'register' && 'Crea un account per la tua attività e inizia a ricontattare i clienti.'}
            {mode === 'forgot_password' && 'Inserisci la tua email per reimpostare la password.'}
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
                placeholder="es. Riccardo Lelli o Barberia Centrale"
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
              placeholder="es. nome@studio.it"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all text-slate-800"
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
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium leading-relaxed">{errorMessage}</p>
                {isEmailUnconfirmedError && (
                  <p className="text-[11px] text-rose-700">
                    💡 Se hai appena registrato l’account, puoi confermarlo via email o disattivare la conferma email dal pannello Supabase.
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
            className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-900/15 active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Accesso in corso...</span>
              </span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Accedi a ClientRecall'}
                  {mode === 'register' && 'Crea Account ed Entra'}
                  {mode === 'forgot_password' && 'Invia Link di Ripristino'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Test Access */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => signInQuickDemo(email || 'riccardo.lelii11@gmail.com', name || 'Riccardo Lelli')}
            className="w-full py-2.5 px-4 bg-teal-50/80 hover:bg-teal-100/90 text-teal-950 border border-teal-200/80 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-teal-700" />
            <span>Entra subito in modalità Test Rapido</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-1">
            Accesso istantaneo per configurare l'attività, provare l'onboarding e testare l'algoritmo.
          </p>
        </div>

        {/* VPS & Online Status info */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowEmailHelp(!showEmailHelp)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-700" />
              <span>Stato Online VPS & Conferma Email</span>
            </span>
            {showEmailHelp ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {showEmailHelp && (
            <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-3 animate-in fade-in">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ClientRecall è ora online! Quando invii la registrazione, Supabase invia il link di conferma che reindirizza al tuo dominio:
              </p>

              <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={currentOrigin}
                  className="w-full text-[11px] bg-transparent font-mono text-slate-700 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={copyCurrentOrigin}
                  className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedOrigin ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copiato</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copia</span>
                    </>
                  )}
                </button>
              </div>

              {/* Paste link helper */}
              <div className="pt-1">
                <p className="text-[11px] font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-teal-700" />
                  <span>Hai ricevuto il link di conferma via email?</span>
                </p>
                <form onSubmit={handleActivatePastedLink} className="space-y-1.5">
                  <input
                    type="text"
                    value={pastedLink}
                    onChange={(e) => setPastedLink(e.target.value)}
                    placeholder="Incolla qui il link di conferma per attivare subito la sessione"
                    className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg font-mono focus:ring-1 focus:ring-teal-700 focus:outline-none"
                  />
                  {activationError && (
                    <p className="text-[10px] text-rose-600 font-medium">{activationError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isActivatingLink}
                    className="w-full py-1.5 px-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isActivatingLink ? 'Convalida...' : 'Attiva Sessione dal Link'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-1 text-center text-xs text-slate-500">
          {mode === 'forgot_password' ? (
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className="inline-flex items-center gap-1 font-semibold text-teal-800 hover:underline cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Torna al login</span>
            </button>
          ) : mode === 'login' ? (
            <p>
              Non hai ancora un account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="font-semibold text-teal-800 hover:underline cursor-pointer"
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
                className="font-semibold text-teal-800 hover:underline cursor-pointer"
              >
                Accedi subito
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Autenticazione reale protetta con Supabase Auth & RLS</span>
        </div>
      </div>
    </div>
  );
};
