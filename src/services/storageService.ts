import { Client, RecallReminder, RecallHistoryItem, UserProfile } from '../types';
import {
  initialClients,
  initialReminders,
  initialHistory,
  initialUserProfile,
} from '../data/mockData';

const CLIENTS_KEY = 'clientrecall_clients_v1';
const REMINDERS_KEY = 'clientrecall_reminders_v1';
const HISTORY_KEY = 'clientrecall_history_v1';
const PROFILE_KEY = 'clientrecall_profile_v1';

export const storageService = {
  getClients(): Client[] {
    try {
      const data = localStorage.getItem(CLIENTS_KEY);
      if (!data) {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(initialClients));
        return initialClients;
      }
      return JSON.parse(data);
    } catch {
      return initialClients;
    }
  },

  saveClients(clients: Client[]): void {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    window.dispatchEvent(new Event('clientrecall_data_updated'));
  },

  addClient(newClient: Omit<Client, 'id' | 'createdAt'>): Client {
    const clients = this.getClients();
    const client: Client = {
      ...newClient,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.saveClients([client, ...clients]);
    return client;
  },

  updateClient(id: string, updates: Partial<Client>): void {
    const clients = this.getClients();
    const index = clients.findIndex((c) => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updates };
      this.saveClients(clients);
    }
  },

  deleteClient(id: string): void {
    const clients = this.getClients().filter((c) => c.id !== id);
    this.saveClients(clients);
  },

  getReminders(): RecallReminder[] {
    try {
      const data = localStorage.getItem(REMINDERS_KEY);
      if (!data) {
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(initialReminders));
        return initialReminders;
      }
      return JSON.parse(data);
    } catch {
      return initialReminders;
    }
  },

  saveReminders(reminders: RecallReminder[]): void {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    window.dispatchEvent(new Event('clientrecall_data_updated'));
  },

  addReminder(newReminder: Omit<RecallReminder, 'id' | 'completed'>): RecallReminder {
    const reminders = this.getReminders();
    const reminder: RecallReminder = {
      ...newReminder,
      id: `rem-${Date.now()}`,
      completed: false,
    };
    this.saveReminders([reminder, ...reminders]);
    return reminder;
  },

  toggleReminder(id: string): void {
    const reminders = this.getReminders();
    const index = reminders.findIndex((r) => r.id === id);
    if (index !== -1) {
      reminders[index].completed = !reminders[index].completed;
      if (reminders[index].completed) {
        reminders[index].completedAt = new Date().toISOString();
      } else {
        delete reminders[index].completedAt;
      }
      this.saveReminders(reminders);
    }
  },

  deleteReminder(id: string): void {
    const reminders = this.getReminders().filter((r) => r.id !== id);
    this.saveReminders(reminders);
  },

  postponeReminder(id: string, daysToAdd: number): void {
    const reminders = this.getReminders();
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      const current = new Date(reminder.dueDate);
      current.setDate(current.getDate() + daysToAdd);
      reminder.dueDate = current.toISOString().split('T')[0];
      this.saveReminders(reminders);
    }
  },

  getHistory(): RecallHistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (!data) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(initialHistory));
        return initialHistory;
      }
      return JSON.parse(data);
    } catch {
      return initialHistory;
    }
  },

  saveHistory(history: RecallHistoryItem[]): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event('clientrecall_data_updated'));
  },

  addHistoryItem(item: Omit<RecallHistoryItem, 'id' | 'date'>): RecallHistoryItem {
    const history = this.getHistory();
    const newItem: RecallHistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
    };
    this.saveHistory([newItem, ...history]);
    return newItem;
  },

  updateHistoryOutcome(id: string, outcome: RecallHistoryItem['outcome'], outcomeNotes?: string): void {
    const history = this.getHistory();
    const item = history.find((h) => h.id === id);
    if (item) {
      item.outcome = outcome;
      if (outcomeNotes !== undefined) item.outcomeNotes = outcomeNotes;
      this.saveHistory(history);
    }
  },

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(initialUserProfile));
        return initialUserProfile;
      }
      return JSON.parse(data);
    } catch {
      return initialUserProfile;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('clientrecall_data_updated'));
  },

  resetAllToDemo(): void {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(initialClients));
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(initialReminders));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(initialHistory));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(initialUserProfile));
    window.dispatchEvent(new Event('clientrecall_data_updated'));
  },

  exportAllData(): string {
    const exportObject = {
      app: 'ClientRecall',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      clients: this.getClients(),
      reminders: this.getReminders(),
      history: this.getHistory(),
    };
    return JSON.stringify(exportObject, null, 2);
  },
};
