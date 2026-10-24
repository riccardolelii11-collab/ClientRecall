import React from 'react';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  CalendarCheck2,
  CalendarRange,
  Settings,
  ChevronRight,
  ShieldCheck,
  LogOut,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { UserProfile, ProfessionType } from '../../types';
import { DEFAULT_PROFESSION_CONFIG } from '../../services/recallEngine';

export type NavTab =
  | 'dashboard'
  | 'recalls'
  | 'clients'
  | 'appointments'
  | 'generator'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  urgentCount: number;
  totalAppointmentsCount: number;
  profile: UserProfile;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut?: () => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  urgentCount,
  totalAppointmentsCount,
  profile,
  isMobileOpen,
  onCloseMobile,
  onSignOut,
  userEmail,
}) => {
  const professionConfig =
    DEFAULT_PROFESSION_CONFIG[(profile.profession as ProfessionType) || 'barbiere'] ||
    DEFAULT_PROFESSION_CONFIG.barbiere;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeType?: 'urgent' | 'standard';
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'recalls',
      label: 'Da Ricontattare',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeType: 'urgent',
    },
    {
      id: 'clients',
      label: 'Clienti & Ritmi',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'appointments',
      label: 'Appuntamenti',
      icon: <CalendarCheck2 className="w-4 h-4" />,
      badge: totalAppointmentsCount > 0 ? totalAppointmentsCount : undefined,
      badgeType: 'standard',
    },
    {
      id: 'generator',
      label: 'Generatore Messaggi',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Impostazioni & Supabase',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-teal-900/10 flex flex-col justify-between transition-all duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header & Navigation */}
        <div className="flex flex-col">
          {/* Brand */}
          <div className="h-18 flex items-center px-6 gap-3 border-b border-teal-900/5">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#083338] via-[#0D5C63] to-[#14B8A6] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2DD4BF] ring-2 ring-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-extrabold tracking-tight text-slate-900 leading-none">
                ClientRecall
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[11px]" role="img" aria-label="professione">
                  {professionConfig.emoji}
                </span>
                <span className="text-[10px] text-teal-800 font-semibold tracking-wider uppercase truncate max-w-[140px]">
                  {profile.customProfessionTitle || professionConfig.label.split('/')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Principale
            </div>

            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 text-teal-950 font-semibold border border-teal-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined ? (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full font-semibold transition-colors ${
                        item.badgeType === 'urgent'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200/60'
                          : 'bg-teal-100/70 text-teal-900 border border-teal-200/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile & Human Touch note */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-900/10 text-[11px] text-teal-950 space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-teal-900">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Nessun invio automatico</span>
            </div>
            <p className="text-[10px] text-teal-800/80 leading-snug">
              ClientRecall prepara le bozze; decidi tu quando e come inviare ogni messaggio.
            </p>
          </div>

          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
            <div
              onClick={() => onSelectTab('settings')}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-900 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                {(profile.name || userEmail || 'CR')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {profile.name || userEmail?.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                  {userEmail || profile.businessName}
                </p>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                title="Esci dall'account"
                aria-label="Disconnetti"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
