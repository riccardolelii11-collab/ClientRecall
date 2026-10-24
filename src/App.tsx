import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientsView } from './components/clients/ClientsView';
import { GeneratorView } from './components/generator/GeneratorView';
import { RemindersView } from './components/reminders/RemindersView';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { storageService } from './services/storageService';
import { Client, RecallReminder, RecallHistoryItem, UserProfile, RecallOutcome, RecallChannel } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [reminders, setReminders] = useState<RecallReminder[]>([]);
  const [history, setHistory] = useState<RecallHistoryItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());

  const [selectedClientForRecall, setSelectedClientForRecall] = useState<Client | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
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

      // Auto dismiss after 3.5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state from storage
  const syncData = useCallback(() => {
    setClients(storageService.getClients());
    setReminders(storageService.getReminders());
    setHistory(storageService.getHistory());
    setProfile(storageService.getProfile());
  }, []);

  useEffect(() => {
    syncData();

    const handleUpdate = () => {
      syncData();
    };

    window.addEventListener('clientrecall_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('clientrecall_data_updated', handleUpdate);
    };
  }, [syncData]);

  // Actions
  const handleSelectClientForRecall = (client: Client) => {
    setSelectedClientForRecall(client);
    setCurrentTab('generator');
  };

  const handleSaveClient = (
    clientData: Omit<Client, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      storageService.updateClient(existingId, clientData);
      showToast('Cliente aggiornato con successo');
    } else {
      storageService.addClient(clientData);
      showToast('Nuovo cliente aggiunto con successo');
    }
  };

  const handleDeleteClient = (id: string) => {
    storageService.deleteClient(id);
    showToast('Cliente eliminato');
  };

  const handleToggleReminder = (id: string) => {
    storageService.toggleReminder(id);
    showToast('Stato promemoria aggiornato');
  };

  const handleDeleteReminder = (id: string) => {
    storageService.deleteReminder(id);
    showToast('Promemoria eliminato');
  };

  const handlePostponeReminder = (id: string, days: number) => {
    storageService.postponeReminder(id, days);
    showToast(`Promemoria posticipato di ${days} giorni`);
  };

  const handleAddReminder = (reminder: Omit<RecallReminder, 'id' | 'completed'>) => {
    storageService.addReminder(reminder);
    showToast('Nuovo promemoria salvato');
  };

  const handleSaveToHistory = (item: {
    clientId: string;
    clientName: string;
    channel: RecallChannel;
    reason: string;
    messageText: string;
  }) => {
    storageService.addHistoryItem({
      ...item,
      outcome: 'copied',
      outcomeNotes: 'Bozza preparata e copiata dal Generatore AI.',
    });
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    storageService.saveProfile(newProfile);
  };

  const handleResetDemoData = () => {
    storageService.resetAllToDemo();
  };

  const urgentCount = clients.filter((c) => c.status === 'urgent').length;
  const dueRemindersCount = reminders.filter((r) => !r.completed).length;

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex flex-col md:flex-row text-slate-900 font-sans selection:bg-indigo-50 selection:text-indigo-900">
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
        dueRemindersCount={dueRemindersCount}
        profile={profile}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
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
        />

        <main className="flex-1 p-5 sm:p-7 lg:p-10 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              clients={clients}
              reminders={reminders}
              history={history}
              onSelectClientForRecall={handleSelectClientForRecall}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onToggleReminder={handleToggleReminder}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              onSelectClientForRecall={handleSelectClientForRecall}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              isNewClientModalOpen={isNewClientModalOpen}
              setIsNewClientModalOpen={setIsNewClientModalOpen}
            />
          )}

          {currentTab === 'generator' && (
            <GeneratorView
              clients={clients}
              selectedClientFromNav={selectedClientForRecall}
              profile={profile}
              onSaveToHistory={handleSaveToHistory}
              onSaveToReminders={handleAddReminder}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              clients={clients}
              onToggleReminder={handleToggleReminder}
              onDeleteReminder={handleDeleteReminder}
              onPostponeReminder={handlePostponeReminder}
              onAddReminder={handleAddReminder}
              onTriggerRecallForClient={handleSelectClientForRecall}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              history={history}
              onUpdateOutcome={(id, outcome, notes) => {
                storageService.updateHistoryOutcome(id, outcome, notes);
              }}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onResetDemoData={handleResetDemoData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
