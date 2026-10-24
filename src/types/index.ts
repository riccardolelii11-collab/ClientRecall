export type RecallChannel = 'whatsapp' | 'email' | 'sms' | 'call' | 'dm';

export type ClientStatus = 'urgent' | 'due' | 'recent' | 'paused';

export interface Client {
  id: string;
  name: string;
  companyOrRole: string;
  category: string;
  phone: string;
  email: string;
  preferredChannel: RecallChannel;
  lastContactDate: string; // YYYY-MM-DD
  recommendedRecallDays: number;
  lastService: string;
  notes: string;
  status: ClientStatus;
  tags: string[];
  createdAt: string;
}

export type ReminderPriority = 'high' | 'medium' | 'low';

export interface RecallReminder {
  id: string;
  clientId: string;
  clientName: string;
  dueDate: string; // YYYY-MM-DD
  priority: ReminderPriority;
  title: string;
  channel: RecallChannel;
  notes: string;
  completed: boolean;
  completedAt?: string;
}

export type RecallOutcome =
  | 'copied'
  | 'responded_positive'
  | 'booked'
  | 'no_response'
  | 'rescheduled';

export interface RecallHistoryItem {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO string
  channel: RecallChannel;
  reason: string;
  messageText: string;
  outcome: RecallOutcome;
  outcomeNotes?: string;
}

export interface UserProfile {
  name: string;
  businessName: string;
  profession: string;
  category: string;
  email: string;
  phone: string;
  defaultChannel: RecallChannel;
  defaultRecallDays: number;
  signature: string;
}

export interface RecallGenerationRequest {
  clientId?: string;
  clientName: string;
  clientService: string;
  clientNotes: string;
  lastContactDaysAgo?: number;
  reason: string;
  channel: RecallChannel | string;
  tone: string;
  length: string;
  customContext: string;
}

export interface GeneratedOption {
  id: string;
  title: string;
  text: string;
}
