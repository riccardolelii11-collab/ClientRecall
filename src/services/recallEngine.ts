import { Client, Appointment, ClientRecallAnalysis, ProfessionType } from '../types';

export const DEFAULT_PROFESSION_CONFIG: Record<
  ProfessionType,
  {
    label: string;
    emoji: string;
    defaultIntervalDays: number;
    typicalServices: string[];
    description: string;
  }
> = {
  barbiere: {
    label: 'Barbiere / Barber Shop',
    emoji: '✂️',
    defaultIntervalDays: 21,
    typicalServices: [
      'Taglio Capelli',
      'Modellatura Barba',
      'Taglio & Barba Completo',
      'Trattamento Igienizzante Cute',
      'Shave Tradizionale a Lama',
    ],
    description: 'Ciclo di ricrescita rapido: i clienti tornano mediamente ogni 2-3 settimane.',
  },
  parrucchiere: {
    label: 'Parrucchiere / Salone',
    emoji: '💇',
    defaultIntervalDays: 35,
    typicalServices: [
      'Taglio & Piega',
      'Colore / Ritocco Ricrescita',
      'Balayage & Schiariture',
      'Trattamento Ristrutturante',
      'Piega & Trattamento Lucidante',
    ],
    description: 'Cicli variabili tra colore (3-4 settimane) e taglio/trattamenti (5-6 settimane).',
  },
  estetista: {
    label: 'Estetista / Centro Estetico',
    emoji: '💅',
    defaultIntervalDays: 28,
    typicalServices: [
      'Trattamento Viso Specifico',
      'Manicure Semipermanente',
      'Pedicure Curativa / Estetica',
      'Epilazione Laser / Cera',
      'Massaggio Linfodrenante / Rilassante',
    ],
    description: 'Manicure ed epilazione hanno cicli di circa 3-4 settimane; cicli trattamenti 2-4 settimane.',
  },
  fisioterapista: {
    label: 'Fisioterapista / Osteopata',
    emoji: '🩺',
    defaultIntervalDays: 21,
    typicalServices: [
      'Valutazione & Prima Visita',
      'Seduta Fisioterapica',
      'Trattamento Osteopatico',
      'Rieducazione Posturale Globale',
      'Terapia Manuale / Miofasciale',
    ],
    description: 'Dopo un ciclo acuto, check di mantenimento o richiamo posturale ogni 3-4 settimane.',
  },
  dentista: {
    label: 'Studio Dentistico / Igienista',
    emoji: '🦷',
    defaultIntervalDays: 180,
    typicalServices: [
      'Igiene Dentale & Ablazione Tartaro',
      'Visita di Controllo Semestrale',
      'Controllo Ortodonzia / Allineatori',
      'Sbiancamento Dentale Professionale',
      'Controllo Parodontale',
    ],
    description: 'Richiamo di igiene e controllo periodico ogni 6 mesi per prevenire carie e infiammazioni.',
  },
  personal_trainer: {
    label: 'Personal Trainer / Coach',
    emoji: '🏋️',
    defaultIntervalDays: 30,
    typicalServices: [
      'Valutazione Corporea & Misure',
      'Sessione One-to-One',
      'Aggiornamento Scheda di Allenamento',
      'Check Nutrizionale & Performance',
    ],
    description: 'Rinnovi schede e check-up periodici ogni 4 settimane.',
  },
  psicologo: {
    label: 'Psicologo / Nutrizionista',
    emoji: '🧠',
    defaultIntervalDays: 14,
    typicalServices: [
      'Seduta di Consulenza / Terapia',
      'Colloquio di Monitoraggio',
      'Visita di Controllo Nutrizionale',
      'Valutazione Obiettivi Periodici',
    ],
    description: 'Follow-up e controlli periodici a frequenza quindicinale o mensile.',
  },
  altro: {
    label: 'Altro Professionista su Appuntamento',
    emoji: '💼',
    defaultIntervalDays: 30,
    typicalServices: [
      'Consulenza Specialistica',
      'Seduta di Controllo',
      'Intervento di Mantenimento',
    ],
    description: 'Personalizza l’intervallo standard di ricontatto in base al tuo settore.',
  },
};

/**
 * Calcola la differenza in giorni interi tra due date YYYY-MM-DD
 */
export function diffDays(dateAStr: string, dateBStr: string): number {
  const [y1, m1, d1] = dateAStr.split('-').map(Number);
  const [y2, m2, d2] = dateBStr.split('-').map(Number);
  const dateA = new Date(Date.UTC(y1, m1 - 1, d1));
  const dateB = new Date(Date.UTC(y2, m2 - 1, d2));
  const diffTime = dateA.getTime() - dateB.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Normalizza la data di oggi in formato YYYY-MM-DD
 */
export function getTodayDateString(referenceDate?: string): string {
  if (referenceDate) return referenceDate;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Algoritmo di analisi e individuazione dei clienti da ricontattare
 */
export function analyzeClientRecall(
  client: Client,
  allAppointments: Appointment[],
  referenceDateStr?: string,
  fallbackDefaultDays: number = 28
): ClientRecallAnalysis {
  const today = getTodayDateString(referenceDateStr);

  // 1. Raccogli tutti gli appuntamenti collegati a questo cliente
  const clientAppointments = allAppointments.filter((a) => a.clientId === client.id);

  // Considera anche eventuali record storici incorporati se allAppointments non ne contiene
  const mergedCompletedDates: { date: string; service: string }[] = [];

  clientAppointments.forEach((a) => {
    if (a.status === 'svolto') {
      mergedCompletedDates.push({ date: a.date, service: a.service });
    }
  });

  if (mergedCompletedDates.length === 0 && client.pastAppointments) {
    client.pastAppointments.forEach((pa) => {
      if (pa.status !== 'programmato') {
        mergedCompletedDates.push({ date: pa.date, service: pa.service });
      }
    });
  }

  // Se ancora vuoto ma abbiamo lastContactDate, usala come unico appuntamento conosciuto
  if (mergedCompletedDates.length === 0 && client.lastContactDate) {
    mergedCompletedDates.push({
      date: client.lastContactDate,
      service: client.lastService || 'Servizio',
    });
  }

  // 2. REGOLE SICURE: Controlla se il cliente ha già un appuntamento FUTURO programmato
  const futureAppointments = clientAppointments.filter((a) => {
    return a.status === 'programmato' && a.date >= today;
  });

  // Ordina gli appuntamenti futuri dal più vicino
  futureAppointments.sort((a, b) => a.date.localeCompare(b.date));

  if (futureAppointments.length > 0) {
    const nextApp = futureAppointments[0];
    const daysUntilNext = diffDays(nextApp.date, today);

    return {
      clientId: client.id,
      client,
      lastCompletedDate: mergedCompletedDates.length > 0 ? mergedCompletedDates[mergedCompletedDates.length - 1].date : null,
      daysSinceLast: mergedCompletedDates.length > 0 ? diffDays(today, mergedCompletedDates[mergedCompletedDates.length - 1].date) : 0,
      estimatedFrequencyDays: client.recommendedRecallDays || fallbackDefaultDays,
      isProvisional: false,
      hasFutureAppointment: true,
      nextFutureAppointmentDate: nextApp.date,
      completedAppointmentsCount: mergedCompletedDates.length,
      isRecallDue: false, // NON proporre clienti che hanno già un appuntamento futuro noto!
      overdueDays: 0,
      urgency: 'future_booked',
      rationale: `Appuntamento futuro già fissato per il ${nextApp.date} (${nextApp.service}, tra ${daysUntilNext} gg). Escluso automaticamente dai clienti da ricontattare.`,
    };
  }

  // 3. Nessun appuntamento futuro noto -> Analizza lo storico degli appuntamenti svolti
  // Ordina per data crescente
  mergedCompletedDates.sort((a, b) => a.date.localeCompare(b.date));

  const completedCount = mergedCompletedDates.length;
  const lastCompleted = completedCount > 0 ? mergedCompletedDates[completedCount - 1] : null;
  const lastCompletedDate = lastCompleted ? lastCompleted.date : client.lastContactDate || null;

  if (!lastCompletedDate) {
    // Nessuna data disponibile
    return {
      clientId: client.id,
      client,
      lastCompletedDate: null,
      daysSinceLast: 0,
      estimatedFrequencyDays: client.recommendedRecallDays || fallbackDefaultDays,
      isProvisional: true,
      hasFutureAppointment: false,
      nextFutureAppointmentDate: null,
      completedAppointmentsCount: 0,
      isRecallDue: false,
      overdueDays: 0,
      urgency: 'ok',
      rationale: 'Nessun appuntamento registrato per questo cliente.',
    };
  }

  const daysSinceLast = Math.max(0, diffDays(today, lastCompletedDate));

  let estimatedFrequencyDays: number;
  let isProvisional = false;

  if (completedCount >= 2) {
    // Calcola l'intervallo medio tra gli appuntamenti svolti
    const intervals: number[] = [];
    for (let i = 1; i < completedCount; i++) {
      const interval = diffDays(mergedCompletedDates[i].date, mergedCompletedDates[i - 1].date);
      if (interval > 0) {
        intervals.push(interval);
      }
    }

    if (intervals.length > 0) {
      const sum = intervals.reduce((acc, curr) => acc + curr, 0);
      estimatedFrequencyDays = Math.max(7, Math.round(sum / intervals.length));
      isProvisional = false;
    } else {
      estimatedFrequencyDays = client.recommendedRecallDays || fallbackDefaultDays;
      isProvisional = true;
    }
  } else {
    // Meno di 2 appuntamenti svolti: usa l'intervallo iniziale configurabile e indica stima provvisoria
    estimatedFrequencyDays = client.recommendedRecallDays || fallbackDefaultDays;
    isProvisional = true;
  }

  // 4. Determina se il cliente è da ricontattare
  const isRecallDue = daysSinceLast > estimatedFrequencyDays;
  const overdueDays = isRecallDue ? daysSinceLast - estimatedFrequencyDays : 0;

  let urgency: 'urgent' | 'due' | 'ok' = 'ok';
  let rationale = '';

  if (isRecallDue) {
    if (overdueDays >= 14) {
      urgency = 'urgent';
    } else {
      urgency = 'due';
    }

    if (isProvisional) {
      rationale = `Ultimo appuntamento il ${lastCompletedDate} (${daysSinceLast} gg fa). Stima provvisoria di ${estimatedFrequencyDays} gg (pochi dati storici). In ritardo di ${overdueDays} gg.`;
    } else {
      rationale = `Ultimo appuntamento il ${lastCompletedDate} (${daysSinceLast} gg fa). Frequenza abituale calcolata: ${estimatedFrequencyDays} gg (su ${completedCount} appuntamenti). In ritardo di ${overdueDays} gg.`;
    }
  } else {
    urgency = 'ok';
    const remainingDays = estimatedFrequencyDays - daysSinceLast;
    rationale = `In regola. Ultimo appuntamento il ${lastCompletedDate} (${daysSinceLast} gg fa). Prossimo contatto ideale tra ${remainingDays} gg (frequenza: ${estimatedFrequencyDays} gg).`;
  }

  return {
    clientId: client.id,
    client,
    lastCompletedDate,
    daysSinceLast,
    estimatedFrequencyDays,
    isProvisional,
    hasFutureAppointment: false,
    nextFutureAppointmentDate: null,
    completedAppointmentsCount: completedCount,
    isRecallDue,
    overdueDays,
    urgency,
    rationale,
  };
}

/**
 * Analizza l'intera rubrica e ordina i clienti da ricontattare per urgenza decrescente
 */
export function analyzeAllClients(
  clients: Client[],
  appointments: Appointment[],
  referenceDateStr?: string,
  fallbackDefaultDays: number = 28
): ClientRecallAnalysis[] {
  const analyses = clients.map((client) =>
    analyzeClientRecall(client, appointments, referenceDateStr, fallbackDefaultDays)
  );

  // Ordina: prima chi è da ricontattare (priorità a urgent, poi due, ordinati per giorni di ritardo decrescenti)
  return analyses.sort((a, b) => {
    if (a.isRecallDue && !b.isRecallDue) return -1;
    if (!a.isRecallDue && b.isRecallDue) return 1;
    if (a.isRecallDue && b.isRecallDue) {
      return b.overdueDays - a.overdueDays;
    }
    // Entrambi non da ricontattare
    return a.client.name.localeCompare(b.client.name);
  });
}
