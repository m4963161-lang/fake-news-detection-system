import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
  UserCheck,
  Lock,
  Sparkles,
  KeyRound,
  Fingerprint,
  UserPlus
} from 'lucide-react';
import { NavTab, AuthUser, UserRole } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  currentUser: AuthUser | null;
  onToggleSidebar: () => void;
  onOpenHelp: () => void;
  onOpenLogin: (role?: UserRole) => void;
  onOpenSignup?: () => void;
  onOpenSettings?: () => void;
  onLogout: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onToggleSidebar,
  onOpenHelp,
  onOpenLogin,
  onOpenSignup,
  onOpenSettings,
  onLogout,
  onNavigateTab
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return 'News Verification Input';
      case 'result': return 'Prediction Analysis Result';
      case 'history': return 'Prediction History & Logs';
      case 'dashboard': return 'Analytics & Model Metrics';
      case 'about': return 'About & System Architecture';
      case 'dataset': return 'Dataset Explorer (news.csv)';
      case 'autolearn': return 'Continuous Auto-Learning (Recent News)';
      case 'code': return 'Python Django Project Code';
      case 'admin': return 'Admin Governance Portal';
      default: return 'Dashboard';
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <span className="font-medium text-slate-400 hidden sm:inline">Fake News Detection</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-bold text-slate-800 capitalize truncate max-w-[180px] sm:max-w-none">
            {getTabTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* ML Status / Admin Badge */}
        {isAdmin ? (
          <div
            onClick={() => onNavigateTab('admin')}
            className="cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin Active</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>ML Pipeline Ready</span>
          </div>
        )}

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="NLP & Model Information"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User / Admin Authentication Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          {currentUser ? (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-90 transition-opacity"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs text-white ${
                  isAdmin
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-500 ring-2 ring-amber-300'
                    : 'bg-gradient-to-tr from-blue-700 to-indigo-600 ring-2 ring-blue-200'
                }`}
              >
                {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] font-semibold text-slate-400 leading-tight flex items-center gap-1">
                  {isAdmin ? (
                    <span className="text-amber-600 font-bold uppercase tracking-wider">Admin</span>
                  ) : (
                    <span className="text-blue-600 font-medium">Analyst</span>
                  )}
                  <span>•</span>
                  <span>{currentUser.department?.split(' ')[0] || 'Desk'}</span>
                </div>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              {onOpenSignup && (
                <button
                  onClick={onOpenSignup}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              )}
              <button
                onClick={() => onOpenLogin('user')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                User Login
              </button>
              <button
                onClick={() => onOpenLogin('admin')}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs shadow-xs"
              >
                Admin Login
              </button>
            </div>
          )}

          {/* Profile Dropdown Menu */}
          {showDropdown && currentUser && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-scaleUp">
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1">
                <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>ID: <code className="font-mono text-slate-700 font-bold">{currentUser.username || currentUser.id}</code></span>
                  <span>{currentUser.department?.split(' ')[0]}</span>
                </div>
              </div>

              {/* Set / Change My ID & Password */}
              {onOpenSettings && (
                <button
                  onClick={() => {
                    onOpenSettings();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 flex items-center gap-2 mb-1 transition-colors"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-600" />
                  <span>Set / Change My ID & Password</span>
                </button>
              )}

              {/* Admin Portal shortcut */}
              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigateTab('admin');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-2 mb-1"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Open Admin Portal</span>
                </button>
              )}

              {/* Fast switch roles */}
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Switch Role / Account
              </div>

              <button
                onClick={() => {
                  onOpenLogin('user');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Switch to User Login</span>
              </button>

              <button
                onClick={() => {
                  onOpenLogin('admin');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Switch to Admin Login</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  onLogout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
