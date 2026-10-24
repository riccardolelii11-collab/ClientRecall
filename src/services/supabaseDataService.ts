import { Client, Appointment, UserProfile, RecallReminder, RecallHistoryItem, ProfessionType } from '../types';
import { getSupabase } from './supabaseClient';
import { DEFAULT_PROFESSION_CONFIG } from './recallEngine';

export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- SCHEMA CLIENTRECALL CON ROW LEVEL SECURITY (RLS)
-- Esegui questo script nel tuo Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. TABELLA PROFILI PROFESSIONISTI
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  profession text default 'barbiere',
  custom_profession_title text,
  business_name text,
  phone text,
  default_recall_days integer default 21,
  default_channel text default 'whatsapp',
  has_completed_onboarding boolean default false,
  signature text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

drop policy if exists "Utenti visualizzano il proprio profilo" on public.profiles;
create policy "Utenti visualizzano il proprio profilo"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Utenti creano il proprio profilo" on public.profiles;
create policy "Utenti creano il proprio profilo"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Utenti modificano il proprio profilo" on public.profiles;
create policy "Utenti modificano il proprio profilo"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. TABELLA CLIENTI (ISOLATI PER PROFESSIONISTA)
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  phone text,
  email text,
  preferred_channel text default 'whatsapp',
  last_service text,
  last_contact_date date,
  recommended_recall_days integer default 28,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.clients enable row level security;

drop policy if exists "Isolamento RLS: Utenti visualizzano solo i propri clienti" on public.clients;
create policy "Isolamento RLS: Utenti visualizzano solo i propri clienti"
  on public.clients for select
  using (auth.uid() = user_id);

drop policy if exists "Isolamento RLS: Utenti inseriscono solo per se stessi" on public.clients;
create policy "Isolamento RLS: Utenti inseriscono solo per se stessi"
  on public.clients for insert
  with check (auth.uid() = user_id);

drop policy if exists "Isolamento RLS: Utenti modificano solo i propri clienti" on public.clients;
create policy "Isolamento RLS: Utenti modificano solo i propri clienti"
  on public.clients for update
  using (auth.uid() = user_id);

drop policy if exists "Isolamento RLS: Utenti eliminano solo i propri clienti" on public.clients;
create policy "Isolamento RLS: Utenti eliminano solo i propri clienti"
  on public.clients for delete
  using (auth.uid() = user_id);

-- 3. TABELLA APPUNTAMENTI (SVOLTI E PROGRAMMATI)
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  client_id uuid references public.clients on delete cascade not null,
  date date not null,
  service text not null,
  status text not null default 'svolto' check (status in ('svolto', 'programmato', 'annullato')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.appointments enable row level security;

drop policy if exists "Isolamento RLS: Utenti visualizzano solo i propri appuntamenti" on public.appointments;
create policy "Isolamento RLS: Utenti visualizzano solo i propri appuntamenti"
  on public.appointments for select
  using (auth.uid() = user_id);

drop policy if exists "Isolamento RLS: Utenti inseriscono solo i propri appuntamenti" on public.appointments;
create policy "Isolamento RLS: Utenti inseriscono solo i propri appuntamenti"
  on public.appointments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Isolamento RLS: Utenti modificano solo i propri appuntamenti" on public.appointments;
create policy "Isolamento RLS: Utenti modificano solo i propri appuntamenti"
  on public.appointments for update
  using (auth.uid() = user_id);

drop policy if exists "Isolamento RLS: Utenti eliminano solo i propri appuntamenti" on public.appointments;
create policy "Isolamento RLS: Utenti eliminano solo i propri appuntamenti"
  on public.appointments for delete
  using (auth.uid() = user_id);

-- Indici per massime prestazioni nelle query di calcolo
create index if not exists idx_clients_user_id on public.clients(user_id);
create index if not exists idx_appointments_client_date on public.appointments(client_id, date desc);
create index if not exists idx_appointments_user_status on public.appointments(user_id, status);
`;

export interface SyncStatus {
  isSupabaseLive: boolean;
  tablesExist: boolean;
  error?: string;
}

// Storage helpers scoped per user ID
function getScopedStorageKey(userId: string, key: string) {
  return `clientrecall_${userId}_${key}`;
}

export const supabaseDataService = {
  /**
   * Verifica se le tabelle Supabase sono presenti nel progetto
   */
  async checkTablesAvailability(userId: string): Promise<SyncStatus> {
    const supabase = getSupabase();
    if (!supabase) {
      return { isSupabaseLive: false, tablesExist: false, error: 'Supabase non configurato' };
    }

    try {
      const { error } = await supabase.from('clients').select('id').limit(1);
      if (error) {
        // Codice 42P01 indica tabella non esistente in Postgres
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('not find the table')) {
          return {
            isSupabaseLive: true,
            tablesExist: false,
            error: 'Tabelle non ancora create nel database Supabase. Esegui lo script SQL.',
          };
        }
        return { isSupabaseLive: true, tablesExist: false, error: error.message };
      }
      return { isSupabaseLive: true, tablesExist: true };
    } catch (e: any) {
      return { isSupabaseLive: false, tablesExist: false, error: e?.message };
    }
  },

  // ===================== PROFILO =====================
  async getProfile(userId: string, defaultEmail: string = ''): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      name: '',
      businessName: '',
      profession: 'barbiere',
      customProfessionTitle: '',
      email: defaultEmail,
      phone: '',
      defaultChannel: 'whatsapp',
      defaultRecallDays: 21,
      hasCompletedOnboarding: false,
      signature: '',
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (data && !error) {
          return {
            name: data.full_name || '',
            businessName: data.business_name || '',
            profession: data.profession || 'barbiere',
            customProfessionTitle: data.custom_profession_title || '',
            email: defaultEmail || '',
            phone: data.phone || '',
            defaultChannel: data.default_channel || 'whatsapp',
            defaultRecallDays: data.default_recall_days || 21,
            hasCompletedOnboarding: data.has_completed_onboarding ?? false,
            signature: data.signature || '',
          };
        }
      } catch (err) {
        console.warn('Errore lettura profilo Supabase:', err);
      }
    }

    // Fallback a localStorage per utente
    const local = localStorage.getItem(getScopedStorageKey(userId, 'profile'));
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return defaultProfile;
  },

  async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    // Salva sempre localmente per robustezza
    localStorage.setItem(getScopedStorageKey(userId, 'profile'), JSON.stringify(profile));

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          full_name: profile.name,
          profession: profile.profession,
          custom_profession_title: profile.customProfessionTitle || null,
          business_name: profile.businessName,
          phone: profile.phone,
          default_recall_days: profile.defaultRecallDays,
          default_channel: profile.defaultChannel,
          has_completed_onboarding: profile.hasCompletedOnboarding,
          signature: profile.signature || '',
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Impossibile sincronizzare profilo con Supabase:', err);
      }
    }
  },

  // ===================== CLIENTI =====================
  async getClients(userId: string): Promise<Client[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mappedClients: Client[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            name: d.name,
            phone: d.phone || '',
            email: d.email || '',
            preferredChannel: d.preferred_channel || 'whatsapp',
            companyOrRole: d.company_or_role || '',
            category: d.category || '',
            lastContactDate: d.last_contact_date || '',
            recommendedRecallDays: d.recommended_recall_days || 28,
            lastService: d.last_service || '',
            notes: d.notes || '',
            createdAt: d.created_at ? d.created_at.split('T')[0] : '',
          }));

          // Aggiorna cache locale
          localStorage.setItem(getScopedStorageKey(userId, 'clients'), JSON.stringify(mappedClients));
          return mappedClients;
        }
      } catch (err) {
        console.warn('Lettura clienti Supabase fallita, uso cache:', err);
      }
    }

    const local = localStorage.getItem(getScopedStorageKey(userId, 'clients'));
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  },

  async addClient(userId: string, clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const newId = `cli-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newClient: Client = {
      ...clientData,
      id: newId,
      userId,
      createdAt: todayStr,
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            name: clientData.name.trim(),
            phone: clientData.phone?.trim() || null,
            email: clientData.email?.trim() || null,
            preferred_channel: clientData.preferredChannel || 'whatsapp',
            last_service: clientData.lastService || null,
            last_contact_date: clientData.lastContactDate || null,
            recommended_recall_days: clientData.recommendedRecallDays || 28,
            notes: clientData.notes || null,
          })
          .select()
          .single();

        if (!error && data) {
          newClient.id = data.id;
        }
      } catch (err) {
        console.warn('Errore salvataggio cliente su Supabase:', err);
      }
    }

    // Salva in cache locale isolata per questo utente
    const local = await this.getClients(userId);
    const updated = [newClient, ...local.filter((c) => c.id !== newClient.id)];
    localStorage.setItem(getScopedStorageKey(userId, 'clients'), JSON.stringify(updated));

    // Se il cliente ha una data dell'ultimo appuntamento, registra automaticamente l'appuntamento storico svolto
    if (clientData.lastContactDate && clientData.lastService) {
      await this.addAppointment(userId, {
        clientId: newClient.id,
        clientName: newClient.name,
        date: clientData.lastContactDate,
        service: clientData.lastService,
        status: 'svolto',
        notes: 'Ultimo appuntamento iniziale registrato alla creazione della scheda.',
      });
    }

    return newClient;
  },

  async updateClient(userId: string, clientId: string, updates: Partial<Client>): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('clients')
          .update({
            name: updates.name,
            phone: updates.phone || null,
            email: updates.email || null,
            preferred_channel: updates.preferredChannel,
            last_service: updates.lastService,
            last_contact_date: updates.lastContactDate,
            recommended_recall_days: updates.recommendedRecallDays,
            notes: updates.notes || null,
          })
          .eq('id', clientId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Errore update cliente su Supabase:', err);
      }
    }

    const current = await this.getClients(userId);
    const next = current.map((c) => (c.id === clientId ? { ...c, ...updates } : c));
    localStorage.setItem(getScopedStorageKey(userId, 'clients'), JSON.stringify(next));
  },

  async deleteClient(userId: string, clientId: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('clients').delete().eq('id', clientId).eq('user_id', userId);
      } catch (err) {
        console.warn('Errore eliminazione cliente su Supabase:', err);
      }
    }

    const current = await this.getClients(userId);
    const next = current.filter((c) => c.id !== clientId);
    localStorage.setItem(getScopedStorageKey(userId, 'clients'), JSON.stringify(next));

    // Rimuovi anche gli appuntamenti collegati in locale
    const appointments = await this.getAppointments(userId);
    const nextApp = appointments.filter((a) => a.clientId !== clientId);
    localStorage.setItem(getScopedStorageKey(userId, 'appointments'), JSON.stringify(nextApp));
  },

  // ===================== APPUNTAMENTI =====================
  async getAppointments(userId: string): Promise<Appointment[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, clients(name)')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (!error && data) {
          const mapped: Appointment[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            clientId: d.client_id,
            clientName: d.clients?.name || '',
            date: d.date,
            service: d.service,
            status: d.status,
            notes: d.notes || '',
            createdAt: d.created_at ? d.created_at.split('T')[0] : '',
          }));

          localStorage.setItem(getScopedStorageKey(userId, 'appointments'), JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Lettura appuntamenti Supabase fallita:', err);
      }
    }

    const local = localStorage.getItem(getScopedStorageKey(userId, 'appointments'));
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  },

  async addAppointment(
    userId: string,
    appointmentData: Omit<Appointment, 'id' | 'createdAt'>
  ): Promise<Appointment> {
    const newId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newApp: Appointment = {
      ...appointmentData,
      id: newId,
      userId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            user_id: userId,
            client_id: appointmentData.clientId,
            date: appointmentData.date,
            service: appointmentData.service,
            status: appointmentData.status,
            notes: appointmentData.notes || null,
          })
          .select()
          .single();

        if (!error && data) {
          newApp.id = data.id;
        }
      } catch (err) {
        console.warn('Errore salvataggio appuntamento su Supabase:', err);
      }
    }

    const current = await this.getAppointments(userId);
    const next = [newApp, ...current];
    localStorage.setItem(getScopedStorageKey(userId, 'appointments'), JSON.stringify(next));

    // Se l'appuntamento registrato è 'svolto' ed è più recente dell'ultimo appuntamento noto del cliente, aggiorna la data del cliente!
    if (appointmentData.status === 'svolto') {
      const clients = await this.getClients(userId);
      const targetClient = clients.find((c) => c.id === appointmentData.clientId);
      if (targetClient) {
        if (!targetClient.lastContactDate || appointmentData.date > targetClient.lastContactDate) {
          await this.updateClient(userId, targetClient.id, {
            lastContactDate: appointmentData.date,
            lastService: appointmentData.service,
          });
        }
      }
    }

    return newApp;
  },

  async updateAppointment(
    userId: string,
    appointmentId: string,
    updates: Partial<Appointment>
  ): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('appointments')
          .update({
            date: updates.date,
            service: updates.service,
            status: updates.status,
            notes: updates.notes || null,
          })
          .eq('id', appointmentId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Errore update appuntamento su Supabase:', err);
      }
    }

    const current = await this.getAppointments(userId);
    const next = current.map((a) => (a.id === appointmentId ? { ...a, ...updates } : a));
    localStorage.setItem(getScopedStorageKey(userId, 'appointments'), JSON.stringify(next));
  },

  async deleteAppointment(userId: string, appointmentId: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('appointments').delete().eq('id', appointmentId).eq('user_id', userId);
      } catch (err) {
        console.warn('Errore delete appuntamento su Supabase:', err);
      }
    }

    const current = await this.getAppointments(userId);
    const next = current.filter((a) => a.id !== appointmentId);
    localStorage.setItem(getScopedStorageKey(userId, 'appointments'), JSON.stringify(next));
  },

  /**
   * Genera dati di esempio personalizzati in base alla professione scelta
   * (Chiamato opzionalmente dall'utente con 1 click per popolare una demo iniziale)
   */
  async seedDemoDataForProfession(userId: string, profession: ProfessionType): Promise<void> {
    const conf = DEFAULT_PROFESSION_CONFIG[profession] || DEFAULT_PROFESSION_CONFIG.barbiere;
    const baseDate = new Date('2026-10-24');

    const getPastDateStr = (daysAgo: number): string => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const getFutureDateStr = (daysAhead: number): string => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    const cycle = conf.defaultIntervalDays || 28;
    const marcoLastDate = getPastDateStr(Math.round(cycle * 1.4));
    const marcoPrevDate = getPastDateStr(Math.round(cycle * 2.8));
    const giuliaLastDate = getPastDateStr(Math.round(cycle * 1.2));
    const alessandroLastDate = getPastDateStr(Math.max(2, Math.round(cycle * 0.3)));
    const alessandroFutureDate = getFutureDateStr(6);
    const chiaraLastDate = getPastDateStr(Math.round(cycle * 1.8));

    const sampleClients: Omit<Client, 'id' | 'createdAt'>[] = [
      {
        name: 'Marco Rossi',
        phone: '+39 340 1234567',
        email: 'marco.rossi@example.com',
        preferredChannel: 'whatsapp',
        lastService: conf.typicalServices[0] || 'Servizio Principale',
        lastContactDate: marcoLastDate, // Oltre il ciclo -> Da ricontattare!
        recommendedRecallDays: conf.defaultIntervalDays,
        notes: 'Cliente abituale, preferisce il pomeriggio.',
      },
      {
        name: 'Giulia Bianchi',
        phone: '+39 338 9876543',
        email: 'giulia.b@example.com',
        preferredChannel: 'whatsapp',
        lastService: conf.typicalServices[1] || 'Servizio 2',
        lastContactDate: giuliaLastDate, // In ritardo rispetto alla frequenza
        recommendedRecallDays: conf.defaultIntervalDays,
        notes: 'Molto attenta alla puntualità.',
      },
      {
        name: 'Alessandro Ferrari',
        phone: '+39 349 5554321',
        email: 'a.ferrari@example.com',
        preferredChannel: 'sms',
        lastService: conf.typicalServices[0] || 'Servizio 1',
        lastContactDate: alessandroLastDate, // Recente (in regola!)
        recommendedRecallDays: conf.defaultIntervalDays,
        notes: 'Ha già un appuntamento futuro programmato.',
      },
      {
        name: 'Chiara Esposito',
        phone: '+39 320 8887766',
        email: 'chiara.esposito@example.com',
        preferredChannel: 'email',
        lastService: conf.typicalServices[2] || conf.typicalServices[0] || 'Trattamento Speciale',
        lastContactDate: chiaraLastDate, // Molto in ritardo!
        recommendedRecallDays: conf.defaultIntervalDays,
        notes: 'Contattare preferibilmente la mattina prima delle 12.',
      },
    ];

    for (const cli of sampleClients) {
      const created = await this.addClient(userId, cli);

      // Aggiungi uno storico realistico di appuntamenti per Marco Rossi (2 appuntamenti svolti -> frequenza calcolata)
      if (cli.name === 'Marco Rossi') {
        await this.addAppointment(userId, {
          clientId: created.id,
          clientName: created.name,
          date: marcoPrevDate,
          service: cli.lastService,
          status: 'svolto',
          notes: 'Prima seduta registrata.',
        });
        await this.addAppointment(userId, {
          clientId: created.id,
          clientName: created.name,
          date: marcoLastDate,
          service: cli.lastService,
          status: 'svolto',
          notes: 'Ultimo appuntamento completato.',
        });
      }

      // Per Alessandro Ferrari: aggiungi un appuntamento FUTURO (deve essere escluso dai ricontatti!)
      if (cli.name === 'Alessandro Ferrari') {
        await this.addAppointment(userId, {
          clientId: created.id,
          clientName: created.name,
          date: alessandroLastDate,
          service: cli.lastService,
          status: 'svolto',
        });
        await this.addAppointment(userId, {
          clientId: created.id,
          clientName: created.name,
          date: alessandroFutureDate, // Data futura!
          service: cli.lastService,
          status: 'programmato',
          notes: 'Già prenotato per i prossimi giorni.',
        });
      }
    }
  },
};
