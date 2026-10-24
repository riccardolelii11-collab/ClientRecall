import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve from Vite environment variables or locally configured credentials
const ENV_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const ENV_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const LOCAL_STORAGE_URL_KEY = 'clientrecall_supabase_url';
const LOCAL_STORAGE_ANON_KEY = 'clientrecall_supabase_anon_key';

export function getEffectiveSupabaseConfig() {
  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_URL_KEY) || '' : '').trim();
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_ANON_KEY) || '' : '').trim();

  const url = localUrl || ENV_URL;
  const anonKey = localKey || ENV_KEY;

  const isValidUrl =
    url.length > 0 &&
    !url.includes('your-project-id') &&
    (url.startsWith('https://') || url.startsWith('http://'));

  const isValidKey =
    anonKey.length > 0 &&
    !anonKey.includes('your-anon-public-key');

  const isConfigured = isValidUrl && isValidKey;

  return {
    url,
    anonKey,
    isConfigured,
    isFromLocalStorage: !!(localUrl && localKey),
  };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase(): SupabaseClient | null {
  const config = getEffectiveSupabaseConfig();

  if (!config.isConfigured) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && lastUsedUrl === config.url && lastUsedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Errore durante l\'inizializzazione del client Supabase:', error);
    cachedClient = null;
    return null;
  }
}

export function saveLocalSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_URL_KEY, url.trim());
    localStorage.setItem(LOCAL_STORAGE_ANON_KEY, key.trim());
    cachedClient = null;
    window.dispatchEvent(new Event('clientrecall_supabase_config_changed'));
  }
}

export function removeLocalSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
    cachedClient = null;
    window.dispatchEvent(new Event('clientrecall_supabase_config_changed'));
  }
}
