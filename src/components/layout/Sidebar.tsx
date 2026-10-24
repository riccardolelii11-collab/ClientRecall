import React from 'react';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Bell,
  Clock3,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../../types';

export type NavTab = 'dashboard' | 'clients' | 'generator' | 'reminders' | 'history' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  urgentCount: number;
  dueRemindersCount: number;
  profile: UserProfile;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  urgentCount,
  dueRemindersCount,
  profile,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number; badgeType?: 'urgent' | 'standard' }[] = [
    {
      id: 'dashboard',
      label: 'Panoramica',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'clients',
      label: 'Clienti',
      icon: <Users className="w-4 h-4" />,
      badge: urgentCount > 0 ? urgentCount : undefined,
      badgeType: 'urgent',
    },
    {
      id: 'generator',
      label: 'Generatore AI',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'reminders',
      label: 'Promemoria',
      icon: <Bell className="w-4 h-4" />,
      badge: dueRemindersCount > 0 ? dueRemindersCount : undefined,
      badgeType: 'standard',
    },
    {
      id: 'history',
      label: 'Cronologia',
      icon: <Clock3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Impostazioni',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/70 flex flex-col justify-between transition-all duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header & Navigation */}
        <div className="flex flex-col">
          {/* Brand */}
          <div className="h-18 flex items-center px-6 gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-slate-900 leading-none">
                ClientRecall
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-1">Smart Outreach</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
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
                  className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-slate-400 group-hover:text-slate-600'
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
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-200/70 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile & Human Touch note */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 px-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Controllo umano al 100%</span>
          </div>

          <div
            onClick={() => onSelectTab('settings')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 font-semibold text-xs shrink-0">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'CR'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {profile.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {profile.businessName || profile.profession}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
