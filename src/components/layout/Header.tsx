import React from 'react';
import { Menu, Sparkles, UserPlus } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onTriggerGenerator: () => void;
  onOpenNewClientModal: () => void;
}

const titles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Panoramica',
    subtitle: 'Stato dei clienti e ricontatti consigliati',
  },
  clients: {
    title: 'Rubrica Clienti',
    subtitle: 'Cronologia e preferenze di ricontatto',
  },
  generator: {
    title: 'Generatore Recall AI',
    subtitle: 'Componi messaggi personalizzati per canale e tono',
  },
  reminders: {
    title: 'Promemoria',
    subtitle: 'Scadenze e controlli programmati',
  },
  history: {
    title: 'Cronologia',
    subtitle: 'Storico delle comunicazioni e degli esiti',
  },
  settings: {
    title: 'Impostazioni',
    subtitle: 'Profilo attività ed etica del contatto',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onTriggerGenerator,
  onOpenNewClientModal,
}) => {
  const current = titles[currentTab];

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
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Nuovo Cliente</span>
          </button>
        )}

        {currentTab !== 'generator' && (
          <button
            onClick={onTriggerGenerator}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs shadow-indigo-600/10 whitespace-nowrap active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Nuovo Recall AI</span>
          </button>
        )}
      </div>
    </header>
  );
};
