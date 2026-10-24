import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabase, getEffectiveSupabaseConfig } from './supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isDemoSession: boolean;
  configUrl: string;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: AuthError | Error | null; user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  activateSessionFromLink: (rawInput: string) => Promise<{ error: Error | null; user?: User | null }>;
  signInQuickDemo: (demoEmail?: string, demoName?: string) => void;
  refreshConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'clientrecall_demo_active_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isDemoSession, setIsDemoSession] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [configState, setConfigState] = useState(getEffectiveSupabaseConfig());

  const refreshConfig = useCallback(() => {
    const nextConfig = getEffectiveSupabaseConfig();
    setConfigState(nextConfig);
  }, []);

  // Helper to construct a demo mock user/session
  const buildMockSession = (email = 'riccardo.lelii11@gmail.com', name = 'Riccardo Lelli') => {
    const mockUser: User = {
      id: 'demo-riccardo-user-id',
      app_metadata: { provider: 'demo' },
      user_metadata: { full_name: name },
      aud: 'authenticated',
      confirmation_sent_at: new Date().toISOString(),
      recovery_sent_at: '',
      email_change_sent_at: '',
      new_email: '',
      invited_at: '',
      action_link: '',
      email,
      phone: '',
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      phone_confirmed_at: '',
      last_sign_in_at: new Date().toISOString(),
      role: 'authenticated',
      updated_at: new Date().toISOString(),
      identities: [],
      is_anonymous: false,
    };

    const mockSession: Session = {
      access_token: 'demo-access-token-valid',
      refresh_token: 'demo-refresh-token-valid',
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      token_type: 'bearer',
      user: mockUser,
    };

    return { mockUser, mockSession };
  };

  // 1-Click Quick Demo Sign-in for immediate evaluation
  const signInQuickDemo = (demoEmail = 'riccardo.lelii11@gmail.com', demoName = 'Riccardo Lelli') => {
    const { mockUser, mockSession } = buildMockSession(demoEmail, demoName);
    setUser(mockUser);
    setSession(mockSession);
    setIsDemoSession(true);
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify({ email: demoEmail, name: demoName }));
  };

  // Initialize session and listen to auth changes
  useEffect(() => {
    let mounted = true;
    const client = getSupabase();

    // Check for saved demo session first if Supabase is not returning session
    const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        const { mockUser, mockSession } = buildMockSession(parsed.email, parsed.name);
        setUser(mockUser);
        setSession(mockSession);
        setIsDemoSession(true);
        setIsLoading(false);
        return;
      } catch {}
    }

    if (!client) {
      setIsLoading(false);
      setUser(null);
      setSession(null);
      return;
    }

    setIsLoading(true);

    // If URL has hash with access_token or token_hash, try parsing it directly
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data, error }) => {
            if (!mounted) return;
            if (!error && data.session) {
              setSession(data.session);
              setUser(data.user);
              setIsDemoSession(false);
              setIsLoading(false);
              // Clean hash without reload
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          });
        }
      } catch (err) {
        console.warn('Errore parsing hash URL Supabase:', err);
      }
    }

    // 1. Get initial session from Supabase
    client.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.warn('Errore nel recupero della sessione Supabase:', error.message);
      }
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user ?? null);
        setIsDemoSession(false);
      }
      setIsLoading(false);
    });

    // 2. Subscribe to auth state updates (login, logout, token refresh)
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user ?? null);
        setIsDemoSession(false);
      } else if (!localStorage.getItem(DEMO_USER_STORAGE_KEY)) {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configState.isConfigured, configState.url, configState.anonKey]);

  // Listen for custom config changes event
  useEffect(() => {
    const handleConfigChange = () => {
      refreshConfig();
    };
    window.addEventListener('clientrecall_supabase_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('clientrecall_supabase_config_changed', handleConfigChange);
    };
  }, [refreshConfig]);

  // Sign In method
  const signIn = async (email: string, password: string) => {
    const client = getSupabase();
    if (!client) {
      return { error: new Error('Supabase non è configurato. Inserisci URL e chiave anonima.') };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error };
      }

      setSession(data.session);
      setUser(data.user);
      setIsDemoSession(false);
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign Up method - Includes emailRedirectTo pointing to the active studio origin!
  const signUp = async (name: string, email: string, password: string) => {
    const client = getSupabase();
    if (!client) {
      return {
        error: new Error('Supabase non è configurato. Inserisci URL e chiave anonima.'),
        user: null,
        session: null,
      };
    }

    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;

      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: currentOrigin,
        },
      });

      if (error) {
        return { error, user: null, session: null };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setIsDemoSession(false);
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
      }

      return { error: null, user: data.user, session: data.session };
    } catch (err: any) {
      return { error: err, user: null, session: null };
    }
  };

  // Activate session from a copied email confirmation link or redirected localhost URL
  const activateSessionFromLink = async (rawInput: string): Promise<{ error: Error | null; user?: User | null }> => {
    const client = getSupabase();
    if (!client) {
      return { error: new Error('Supabase non è configurato.') };
    }

    const clean = rawInput.trim();
    if (!clean) {
      return { error: new Error('Inserisci il link di conferma o i parametri ricevuti.') };
    }

    try {
      // Extract fragment or search parameters
      let fragment = clean;
      if (clean.includes('#')) {
        fragment = clean.split('#')[1];
      } else if (clean.includes('?')) {
        fragment = clean.split('?')[1];
      }

      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data, error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) return { error };

        setSession(data.session);
        setUser(data.user);
        setIsDemoSession(false);
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        return { error: null, user: data.user };
      }

      // Check for token / token_hash OTP verification
      const tokenHash = params.get('token_hash') || params.get('token');
      const typeParam = params.get('type') || 'signup';

      if (tokenHash) {
        const { data, error } = await client.auth.verifyOtp({
          token_hash: tokenHash,
          type: (typeParam === 'email' ? 'email' : 'signup') as any,
        });

        if (error) return { error };

        setSession(data.session);
        setUser(data.user);
        setIsDemoSession(false);
        localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        return { error: null, user: data.user };
      }

      return {
        error: new Error(
          'Il link inserito non contiene i parametri di autenticazione (access_token o token_hash). Assicurati di copiare tutto l\'indirizzo.'
        ),
      };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign Out method
  const signOut = async () => {
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Errore durante il logout:', err);
      }
    }
    setSession(null);
    setUser(null);
    setIsDemoSession(false);
  };

  // Password Reset Request method
  const resetPasswordForEmail = async (email: string) => {
    const client = getSupabase();
    if (!client) {
      return { error: new Error('Supabase non è configurato.') };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: configState.isConfigured,
        isDemoSession,
        configUrl: configState.url,
        signIn,
        signUp,
        signOut,
        resetPasswordForEmail,
        activateSessionFromLink,
        signInQuickDemo,
        refreshConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all’interno di un AuthProvider');
  }
  return context;
}
