import React from 'react';
import { Menu, Sparkles, UserPlus, LogOut, CalendarPlus } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onTriggerGenerator: () => void;
  onOpenNewClientModal: () => void;
  onOpenNewAppointmentModal?: () => void;
  onSignOut?: () => void;
  userEmail?: string;
}

const titles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Attività',
    subtitle: 'Panoramica ricontatti, clienti e appuntamenti',
  },
  recalls: {
    title: 'Da Ricontattare',
    subtitle: 'Clienti oltre l’intervallo abituale o provvisorio',
  },
  clients: {
    title: 'Rubrica Clienti',
    subtitle: 'Gestione contatti e preferenze di ricontatto',
  },
  appointments: {
    title: 'Appuntamenti',
    subtitle: 'Storico sedute svolte e prenotazioni future',
  },
  generator: {
    title: 'Generatore Messaggi',
    subtitle: 'Bozze personalizzate su misura del cliente e della professione',
  },
  imports: {
    title: 'Importazioni Future',
    subtitle: 'Integrazione Google Calendar e importazione da file CSV/Excel',
  },
  settings: {
    title: 'Impostazioni & Supabase',
    subtitle: 'Profilo attività e policy Row Level Security (RLS)',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onTriggerGenerator,
  onOpenNewClientModal,
  onOpenNewAppointmentModal,
  onSignOut,
  userEmail,
}) => {
  const current = titles[currentTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Apri menu laterale"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-3">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {current.title}
          </h1>
          <span className="hidden sm:inline text-xs text-slate-400 font-normal">
            {current.subtitle}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentTab === 'clients' && (
          <button
            onClick={onOpenNewClientModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Nuovo Cliente</span>
          </button>
        )}

        {currentTab === 'appointments' && onOpenNewAppointmentModal && (
          <button
            onClick={onOpenNewAppointmentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Nuovo Appuntamento</span>
          </button>
        )}

        {currentTab !== 'generator' && (
          <button
            onClick={onTriggerGenerator}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-[13px] font-medium text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs shadow-teal-900/15 whitespace-nowrap active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Prepara Messaggio</span>
          </button>
        )}

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="md:hidden p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Esci"
            aria-label="Esci"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
