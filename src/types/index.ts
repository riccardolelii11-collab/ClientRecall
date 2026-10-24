export type RecallChannel = 'whatsapp' | 'email' | 'sms' | 'call' | 'dm';

export type ClientStatus = 'urgent' | 'due' | 'recent' | 'paused';

export type ProfessionType =
  | 'barbiere'
  | 'parrucchiere'
  | 'estetista'
  | 'fisioterapista'
  | 'dentista'
  | 'personal_trainer'
  | 'psicologo'
  | 'altro';

export type AppointmentStatus = 'svolto' | 'programmato' | 'annullato';

export interface Appointment {
  id: string;
  userId?: string;
  clientId: string;
  clientName?: string;
  date: string; // YYYY-MM-DD
  service: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
}

// Retrocompatibilità con vecchie strutture
export interface AppointmentRecord {
  id: string;
  date: string; // YYYY-MM-DD
  service: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  preferredChannel: RecallChannel;
  companyOrRole?: string;
  category?: string;
  lastContactDate: string; // Data ultimo appuntamento YYYY-MM-DD
  recommendedRecallDays: number;
  lastService: string;
  notes?: string;
  status?: ClientStatus;
  tags?: string[];
  createdAt: string;
  pastAppointments?: AppointmentRecord[];
}

export interface ClientRecallAnalysis {
  clientId: string;
  client: Client;
  lastCompletedDate: string | null;
  daysSinceLast: number;
  clientRhythmDays: number; // Ritmo proprio di questo cliente (es. 1, 7, 14, 30...)
  estimatedFrequencyDays: number; // retrocompatibile
  gracePeriodDays: number; // Giorni di tolleranza prima del ricontatto specifico per questo ritmo
  targetRecallDays: number; // Soglia effettiva di ricontatto (ritmo + tolleranza, es. 30 + 10 = 40 gg)
  isProvisional: boolean; // Pochi dati (< 2 appuntamenti svolti)
  hasFutureAppointment: boolean; // Ha già un appuntamento futuro fissato
  nextFutureAppointmentDate: string | null;
  completedAppointmentsCount: number;
  isRecallDue: boolean;
  overdueDays: number; // Giorni oltre il ritmo abituale
  overdueBeyondThreshold: number; // Giorni oltre la soglia di tolleranza
  urgency: 'urgent' | 'due' | 'ok' | 'future_booked';
  rationale: string;
  rhythmDescription: string;
}

export type ReminderPriority = 'high' | 'medium' | 'low';

export interface RecallReminder {
  id: string;
  userId?: string;
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
  userId?: string;
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
  profession: ProfessionType | string;
  customProfessionTitle?: string;
  email: string;
  phone: string;
  defaultChannel: RecallChannel;
  defaultRecallDays: number;
  hasCompletedOnboarding: boolean;
  signature?: string;
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
  profession?: string;
}

export interface GeneratedOption {
  id: string;
  title: string;
  text: string;
}
