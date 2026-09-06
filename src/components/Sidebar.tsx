import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  House,
  Search,
  History,
  BarChart3,
  Info,
  Database,
  Code,
  LogOut,
  Sparkles,
  User,
  KeyRound,
  UserCheck,
  Fingerprint,
  UserPlus,
  Brain
} from 'lucide-react';
import { NavTab, AuthUser, UserRole, PredictionRecord } from '../types';
import { AccuracyTicker } from './AccuracyTicker';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: AuthUser | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: (role?: UserRole) => void;
  onOpenSignup?: () => void;
  onOpenSettings?: () => void;
  onLogout: () => void;
  onResetSession: () => void;
  records?: PredictionRecord[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOpen,
  onClose,
  onOpenLogin,
  onOpenSignup,
  onOpenSettings,
  onLogout,
  onResetSession,
  records = []
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { id: 'home' as NavTab, label: 'Home', icon: House },
    { id: 'check' as NavTab, label: 'Check News', icon: Search, tab: 'home' as NavTab },
    { id: 'autolearn' as NavTab, label: 'Auto-Learn News', icon: Brain, badge: 'LIVE' },
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'admin' as NavTab, label: 'Admin Portal', icon: ShieldAlert, badge: 'ADMIN' },
    { id: 'dataset' as NavTab, label: 'Dataset (news.csv)', icon: Database },
    { id: 'about' as NavTab, label: 'About & Model', icon: Info },
    { id: 'code' as NavTab, label: 'Django Code & Export', icon: Code },
  ];

  const handleNavClick = (item: typeof menuItems[0]) => {
    const targetTab = item.tab || item.id;
    if (targetTab === 'admin' && !isAdmin) {
      // Prompt admin login if not authenticated as admin
      onOpenLogin('admin');
      onClose();
      return;
    }
    setActiveTab(targetTab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container with Dark Navy Gradient */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0b132b] via-[#111d3d] to-[#1c2541] text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                FakeDetect
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wide">
                ML News Verifier
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            v2.4
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Navigation
          </div>
          {menuItems.map(item => {
            const Icon = item.icon;
            const targetTab = item.tab || item.id;
            const isActive = activeTab === targetTab;
            const isItemAdmin = item.id === 'admin';

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 text-left ${
                  isActive
                    ? isItemAdmin
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : isItemAdmin
                    ? 'text-amber-300/90 hover:text-amber-200 hover:bg-amber-400/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : isItemAdmin
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isItemAdmin
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Floating Real-Time Accuracy Ticker */}
        <div className="shrink-0">
          <AccuracyTicker
            records={records}
            onNavigateTab={tab => {
              setActiveTab(tab);
              onClose();
            }}
          />
        </div>

        {/* User Account & Session Card in Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {currentUser ? (
            <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shrink-0 ${
                      isAdmin ? 'bg-amber-600' : 'bg-blue-600'
                    }`}
                  >
                    {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    isAdmin
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>

              {/* Stored ID display */}
              <div className="text-[10px] text-slate-400 font-mono px-1 flex items-center justify-between">
                <span>Login ID:</span>
                <span className="text-amber-300 font-bold">{currentUser.username || currentUser.id}</span>
              </div>

              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="w-full py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Fingerprint className="w-3 h-3 text-emerald-400" />
                  <span>Manage ID & Password</span>
                </button>
              )}

              <div className="flex items-center gap-1 pt-1 border-t border-white/5">
                <button
                  onClick={() => onOpenLogin(isAdmin ? 'user' : 'admin')}
                  className="flex-1 py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <KeyRound className="w-3 h-3 text-slate-400" />
                  <span>Switch Role</span>
                </button>
                <button
                  onClick={onLogout}
                  className="py-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[10px] text-red-300 font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {onOpenSignup && (
                <button
                  onClick={onOpenSignup}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up (New Account)</span>
                </button>
              )}
              <button
                onClick={() => onOpenLogin('user')}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>User Login</span>
              </button>
              <button
                onClick={() => onOpenLogin('admin')}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-amber-400/30"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>
            </div>
          )}

          {/* Reset Demo State Button */}
          <button
            onClick={onResetSession}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Reset Demo & History</span>
          </button>
        </div>
      </aside>
    </>
  );
};

