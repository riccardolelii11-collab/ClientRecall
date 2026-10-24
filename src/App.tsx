import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { SupabaseSetupNotice } from './components/auth/SupabaseSetupNotice';
import { ProfessionOnboardingModal } from './components/auth/ProfessionOnboardingModal';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { RecallsView } from './components/recalls/RecallsView';
import { ClientsView } from './components/clients/ClientsView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { GeneratorView } from './components/generator/GeneratorView';
import { SettingsView } from './components/settings/SettingsView';
import { AppointmentModal } from './components/appointments/AppointmentModal';
import { ClientDetailDrawer } from './components/clients/ClientDetailDrawer';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { supabaseDataService } from './services/supabaseDataService';
import { analyzeAllClients, DEFAULT_PROFESSION_CONFIG } from './services/recallEngine';
import {
  Client,
  Appointment,
  ClientRecallAnalysis,
  UserProfile,
  ProfessionType,
  AppointmentStatus,
  RecallChannel,
} from './types';
import { Sparkles, ShieldCheck } from 'lucide-react';

function PrivateAppContent() {
  const { user, signOut, isConfigured, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    businessName: '',
    profession: 'barbiere',
    customProfessionTitle: '',
    email: '',
    phone: '',
    defaultChannel: 'whatsapp',
    defaultRecallDays: 21,
    hasCompletedOnboarding: false,
  });

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [selectedClientForRecall, setSelectedClientForRecall] = useState<Client | null>(null);
  const [selectedClientForDrawer, setSelectedClientForDrawer] = useState<Client | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);
  const [appointmentClientTarget, setAppointmentClientTarget] = useState<Client | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = useCallback(
    (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        message,
        type,
      };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Caricamento dati isolati per l'utente loggato
  const loadUserData = useCallback(async () => {
    if (!user) {
      setClients([]);
      setAppointments([]);
      return;
    }
    setIsDataLoading(true);

    try {
      const [userProfile, userClients, userAppointments] = await Promise.all([
        supabaseDataService.getProfile(user.id, user.email || ''),
        supabaseDataService.getClients(user.id),
        supabaseDataService.getAppointments(user.id),
      ]);

      // Se il profilo ha un nome da metadata, usalo
      const fullName = user.user_metadata?.full_name || userProfile.name || '';
      setProfile({
        ...userProfile,
        name: fullName,
        email: user.email || userProfile.email,
      });

      setClients(userClients);
      setAppointments(userAppointments);
    } catch (err) {
      console.error('Errore caricamento dati utente:', err);
      showToast('Errore nel recupero dati', 'Verifica la connessione', 'error');
    } finally {
      setIsDataLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setClients([]);
      setAppointments([]);
      setSelectedClientForRecall(null);
      setSelectedClientForDrawer(null);
    }
  }, [user, loadUserData]);

  // Calcolo analisi ricontatti in tempo reale
  const analyses: ClientRecallAnalysis[] = useMemo(() => {
    return analyzeAllClients(clients, appointments, '2026-10-24', profile.defaultRecallDays);
  }, [clients, appointments, profile.defaultRecallDays]);

  const urgentCount = useMemo(() => {
    return analyses.filter((a) => a.isRecallDue).length;
  }, [analyses]);

  // Onboarding completato o da mostrare
  const shouldShowOnboarding = Boolean(user && !isDataLoading && !profile.hasCompletedOnboarding);

  const handleCompleteOnboarding = async (
    profileUpdates: Partial<UserProfile>,
    seedSampleData: boolean
  ) => {
    if (!user) return;

    const updatedProfile: UserProfile = {
      ...profile,
      ...profileUpdates,
      hasCompletedOnboarding: true,
      name: profile.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      email: user.email || profile.email,
    };

    await supabaseDataService.saveProfile(user.id, updatedProfile);
    setProfile(updatedProfile);

    if (seedSampleData) {
      const prof = (updatedProfile.profession as ProfessionType) || 'barbiere';
      await supabaseDataService.seedDemoDataForProfession(user.id, prof);
      const [newClients, newAppointments] = await Promise.all([
        supabaseDataService.getClients(user.id),
        supabaseDataService.getAppointments(user.id),
      ]);
      setClients(newClients);
      setAppointments(newAppointments);
      showToast(
        'Attività configurata con successo!',
        'Abbiamo caricato alcuni clienti di prova per mostrarti la stima dei ricontatti.'
      );
    } else {
      showToast('Attività configurata con successo!', 'Puoi iniziare ad inserire i tuoi clienti.');
    }
  };

  // Azioni Clienti
  const handleSelectClientForRecall = (client: Client) => {
    setSelectedClientForRecall(client);
    setCurrentTab('generator');
  };

  const handleSaveClient = async (
    clientData: Omit<Client, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (!user) return;

    if (existingId) {
      await supabaseDataService.updateClient(user.id, existingId, clientData);
      showToast('Cliente aggiornato con successo');
    } else {
      await supabaseDataService.addClient(user.id, clientData);
      showToast('Nuovo cliente aggiunto con successo');
    }

    // Ricarica clienti e appuntamenti
    const [c, a] = await Promise.all([
      supabaseDataService.getClients(user.id),
      supabaseDataService.getAppointments(user.id),
    ]);
    setClients(c);
    setAppointments(a);
  };

  const handleDeleteClient = async (id: string) => {
    if (!user) return;
    await supabaseDataService.deleteClient(user.id, id);
    const [c, a] = await Promise.all([
      supabaseDataService.getClients(user.id),
      supabaseDataService.getAppointments(user.id),
    ]);
    setClients(c);
    setAppointments(a);
    showToast('Cliente eliminato');
  };

  // Azioni Appuntamenti
  const handleSaveAppointment = async (
    appData: Omit<Appointment, 'id' | 'createdAt'>
  ) => {
    if (!user) return;
    await supabaseDataService.addAppointment(user.id, appData);
    const [c, a] = await Promise.all([
      supabaseDataService.getClients(user.id),
      supabaseDataService.getAppointments(user.id),
    ]);
    setClients(c);
    setAppointments(a);

    if (appData.status === 'programmato') {
      showToast(
        'Appuntamento futuro programmato',
        'Il cliente è stato escluso dai ricontatti fino alla data stabilita.'
      );
    } else {
      showToast(
        'Appuntamento svolto registrato',
        'La frequenza abituale del cliente è stata aggiornata.'
      );
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: AppointmentStatus) => {
    if (!user) return;
    await supabaseDataService.updateAppointment(user.id, id, { status: newStatus });
    const a = await supabaseDataService.getAppointments(user.id);
    setAppointments(a);
    showToast(`Stato appuntamento aggiornato a "${newStatus}"`);
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!user) return;
    await supabaseDataService.deleteAppointment(user.id, id);
    const a = await supabaseDataService.getAppointments(user.id);
    setAppointments(a);
    showToast('Appuntamento eliminato');
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    if (!user) return;
    await supabaseDataService.saveProfile(user.id, newProfile);
    setProfile(newProfile);
    showToast('Profilo e preferenze aggiornate');
  };

  const handleSeedProfessionData = async (prof: ProfessionType) => {
    if (!user) return;
    await supabaseDataService.seedDemoDataForProfession(user.id, prof);
    const [c, a] = await Promise.all([
      supabaseDataService.getClients(user.id),
      supabaseDataService.getAppointments(user.id),
    ]);
    setClients(c);
    setAppointments(a);
  };

  const handleSignOut = async () => {
    setClients([]);
    setAppointments([]);
    setSelectedClientForRecall(null);
    setSelectedClientForDrawer(null);
    setCurrentTab('dashboard');
    await signOut();
    showToast('Disconnessione effettuata', 'A presto su ClientRecall.', 'info');
  };

  // 1. Loading State while restoring session from Supabase
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex flex-col items-center justify-center p-4">
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#083338] via-[#0D5C63] to-[#14B8A6] flex items-center justify-center text-white shadow-lg animate-pulse">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-800 mt-4 tracking-tight">
          ClientRecall
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Verifica sessione Supabase in corso...
        </p>
      </div>
    );
  }

  // 2. Missing Supabase Configuration Notice
  if (!isConfigured) {
    return <SupabaseSetupNotice onConfigSaved={loadUserData} />;
  }

  // 3. Unauthenticated State (Strictly gated)
  if (!user) {
    return <AuthScreen />;
  }

  // 4. Authenticated Workspace
  return (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col md:flex-row text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'generator') {
            setSelectedClientForRecall(null);
          }
        }}
        urgentCount={urgentCount}
        totalAppointmentsCount={appointments.length}
        profile={profile}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSignOut={handleSignOut}
        userEmail={user.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onTriggerGenerator={() => {
            setSelectedClientForRecall(null);
            setCurrentTab('generator');
          }}
          onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
          onOpenNewAppointmentModal={() => {
            setAppointmentClientTarget(null);
            setIsAppointmentModalOpen(true);
          }}
          onSignOut={handleSignOut}
          userEmail={user.email}
        />

        {/* Security & RLS Status Strip */}
        <div className="bg-teal-50/70 border-b border-teal-900/10 px-4 sm:px-8 py-2 text-[11px] text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              Account Supabase: <strong className="font-mono">{user.email}</strong>
            </span>
            <span className="text-teal-400">·</span>
            <span>
              Attività:{' '}
              <strong>
                {profile.businessName ||
                  DEFAULT_PROFESSION_CONFIG[profile.profession as ProfessionType]?.label.split('/')[0] ||
                  'Professionista'}
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-teal-800 font-medium">
            Dati isolati per utente con Row Level Security (RLS)
          </span>
        </div>

        <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              clients={clients}
              appointments={appointments}
              analyses={analyses}
              profile={profile}
              onSelectClientForRecall={handleSelectClientForRecall}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onOpenAppointmentModal={(client) => {
                setAppointmentClientTarget(client || null);
                setIsAppointmentModalOpen(true);
              }}
              onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
            />
          )}

          {currentTab === 'recalls' && (
            <RecallsView
              analyses={analyses}
              onSelectClientForRecall={handleSelectClientForRecall}
              onOpenAppointmentModal={(client) => {
                setAppointmentClientTarget(client);
                setIsAppointmentModalOpen(true);
              }}
              onOpenClientDrawer={(client) => setSelectedClientForDrawer(client)}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              analyses={analyses}
              onSelectClientForRecall={handleSelectClientForRecall}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              isNewClientModalOpen={isNewClientModalOpen}
              setIsNewClientModalOpen={setIsNewClientModalOpen}
              onOpenCreateAppointmentModal={(client) => {
                setAppointmentClientTarget(client);
                setIsAppointmentModalOpen(true);
              }}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              clients={clients}
              onOpenNewAppointmentModal={() => {
                setAppointmentClientTarget(null);
                setIsAppointmentModalOpen(true);
              }}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onDeleteAppointment={handleDeleteAppointment}
              onOpenClientDrawer={(client) => setSelectedClientForDrawer(client)}
            />
          )}

          {currentTab === 'generator' && (
            <GeneratorView
              clients={clients}
              selectedClientFromNav={selectedClientForRecall}
              profile={profile}
              onSaveToHistory={() => {
                showToast('Bozza salvata', 'Annotata per la cronologia.');
              }}
              onSaveToReminders={() => {
                showToast('Promemoria programmato');
              }}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'imports' && <ImportsView />}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onSeedProfessionData={handleSeedProfessionData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Profession Onboarding Modal (Opens right after signup / first login) */}
      <ProfessionOnboardingModal
        isOpen={shouldShowOnboarding}
        userEmail={user.email}
        userName={user.user_metadata?.full_name}
        onComplete={handleCompleteOnboarding}
      />

      {/* Appointment Creation Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setAppointmentClientTarget(null);
        }}
        onSave={handleSaveAppointment}
        clients={clients}
        initialClientId={appointmentClientTarget?.id}
        defaultService={appointmentClientTarget?.lastService}
      />

      {/* Client Detail Drawer */}
      <ClientDetailDrawer
        client={selectedClientForDrawer}
        isOpen={selectedClientForDrawer !== null}
        onClose={() => setSelectedClientForDrawer(null)}
        onTriggerRecall={(c) => {
          setSelectedClientForDrawer(null);
          handleSelectClientForRecall(c);
        }}
        onEditClient={() => {
          setSelectedClientForDrawer(null);
          setCurrentTab('clients');
        }}
        onCreateReminder={(c) => {
          setSelectedClientForDrawer(null);
          setAppointmentClientTarget(c);
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PrivateAppContent />
    </AuthProvider>
  );
}
