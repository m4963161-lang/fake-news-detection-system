import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Building,
  UserPlus,
  Fingerprint
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import {
  getStoredUsers,
  getStoredPasswords,
  saveStoredUsers,
  saveStoredCurrentUser,
  saveStoredPasswords,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  findUserByIdentifier,
  getUserPassword
} from '../utils/authStore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, message: string) => void;
  initialRole?: UserRole;
  initialMode?: 'user_login' | 'admin_login' | 'signup';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'user',
  initialMode
}) => {
  const [authMode, setAuthMode] = useState<'user_login' | 'admin_login' | 'signup'>(() => {
    if (initialMode) return initialMode;
    return initialRole === 'admin' ? 'admin_login' : 'user_login';
  });

  // Keep in sync if initialMode changes
  React.useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    } else if (initialRole) {
      setAuthMode(initialRole === 'admin' ? 'admin_login' : 'user_login');
    }
  }, [initialMode, initialRole, isOpen]);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom Registration / Setup states
  const [customUsername, setCustomUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('user');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFillDemo = (role: UserRole) => {
    setErrorMsg(null);
    if (role === 'admin') {
      setLoginIdentifier('admin');
      setPassword('admin123');
      setAuthMode('admin_login');
    } else {
      setLoginIdentifier('user');
      setPassword('user123');
      setAuthMode('user_login');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const trimmedId = loginIdentifier.trim();
      if (!trimmedId) {
        setErrorMsg('Please enter your User ID, Username, or Email address.');
        setIsLoading(false);
        return;
      }

      const matchedUser = findUserByIdentifier(trimmedId);

      if (!matchedUser) {
        setErrorMsg(`No account found matching ID/Email "${trimmedId}". You can create one using the "Set My Own ID & Password" tab.`);
        setIsLoading(false);
        return;
      }

      if (matchedUser.status === 'suspended') {
        setErrorMsg('This account has been suspended by a System Administrator.');
        setIsLoading(false);
        return;
      }

      const expectedPass = getUserPassword(matchedUser);
      if (password !== expectedPass) {
        setErrorMsg('Invalid password. Please verify your password or use demo credentials.');
        setIsLoading(false);
        return;
      }

      // Check role constraints if on admin tab
      if (authMode === 'admin_login' && matchedUser.role !== 'admin') {
        setErrorMsg('Access Denied: This account is registered as a standard User/Analyst. Please use the "User Login" tab or register as Admin.');
        setIsLoading(false);
        return;
      }

      // Update last login
      const now = new Date();
      const formattedTime = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const updatedUser: AuthUser = {
        ...matchedUser,
        lastLogin: formattedTime
      };

      const users = getStoredUsers();
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      saveStoredUsers(updatedUsers);
      saveStoredCurrentUser(updatedUser);

      // Record audit log
      const logs = getStoredAuditLogs();
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: formattedTime,
        actorEmail: updatedUser.email,
        actorRole: updatedUser.role,
        action: updatedUser.role === 'admin' ? 'Admin Portal Authentication' : 'User Session Started',
        details: `Successfully authenticated via ${authMode === 'admin_login' ? 'Admin Gateway' : 'User Gateway'} using ID: ${trimmedId}.`,
        type: 'auth' as const
      };
      saveStoredAuditLogs([newLog, ...logs]);

      setIsLoading(false);
      onLoginSuccess(updatedUser, `Welcome back, ${updatedUser.name} (${updatedUser.role.toUpperCase()})`);
      onClose();
    }, 350);
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUsername = customUsername.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedUsername || !trimmedName || !trimmedEmail || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users = getStoredUsers();

      if (users.some(u => u.username && u.username.toLowerCase() === trimmedUsername)) {
        setErrorMsg(`The Custom ID / Username "${trimmedUsername}" is already taken. Please choose another.`);
        setIsLoading(false);
        return;
      }

      if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
        setErrorMsg(`The Email "${trimmedEmail}" already exists. Please log in or use another email.`);
        setIsLoading(false);
        return;
      }

      const initials = trimmedName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || (registerRole === 'admin' ? 'AD' : 'US');

      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const formattedFullTime = `${formattedDate} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

      const newUser: AuthUser = {
        id: `usr_${trimmedUsername || Date.now()}`,
        username: trimmedUsername,
        name: trimmedName,
        email: trimmedEmail,
        role: registerRole,
        avatar: initials,
        department: department.trim() || (registerRole === 'admin' ? 'ML Security & Governance' : 'Fact Checking Desk'),
        createdAt: formattedDate,
        lastLogin: 'Just now',
        status: 'active',
        predictionsCount: 0
      };

      const updatedUsers = [...users, newUser];
      saveStoredUsers(updatedUsers);
      saveStoredCurrentUser(newUser);

      // Save custom password keyed by both email, username, and id
      const passwords = getStoredPasswords();
      passwords[trimmedEmail] = password;
      passwords[trimmedUsername] = password;
      passwords[newUser.id] = password;
      saveStoredPasswords(passwords);

      // Audit log
      const logs = getStoredAuditLogs();
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: formattedFullTime,
        actorEmail: newUser.email,
        actorRole: newUser.role,
        action: `${registerRole === 'admin' ? 'Admin' : 'User'} Account Created`,
        details: `Created custom ${newUser.role} ID "${trimmedUsername}" for ${newUser.name} with custom password.`,
        type: 'auth' as const
      };
      saveStoredAuditLogs([newLog, ...logs]);

      setIsLoading(false);
      onLoginSuccess(newUser, `Custom ${newUser.role.toUpperCase()} account created! Logged in as ${newUser.name}.`);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
        {/* Top Header Banner */}
        <div
          className={`p-6 text-white transition-colors duration-300 relative ${
            authMode === 'admin_login'
              ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/50'
              : authMode === 'signup'
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/50'
              : 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-800/50'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
                authMode === 'admin_login'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : authMode === 'signup'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                  : 'bg-blue-400/20 text-blue-300 border border-blue-400/40'
              }`}
            >
              {authMode === 'admin_login' ? (
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              ) : authMode === 'signup' ? (
                <UserPlus className="w-6 h-6 text-emerald-300" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                {authMode === 'admin_login'
                  ? 'Admin Login'
                  : authMode === 'signup'
                  ? 'Sign Up (Create Account)'
                  : 'User Login'}
              </h3>
              <p className="text-xs text-slate-300">
                {authMode === 'admin_login'
                  ? 'Sign in with your Admin ID, Username, or Email'
                  : authMode === 'signup'
                  ? 'Register a new User or Admin account with custom ID & password'
                  : 'Sign in with your User ID, Username, or Email'}
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-black/30 p-1 mt-4 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('user_login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'user_login'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              User Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('admin_login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'admin_login'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-900" />
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-emerald-400 text-slate-950 shadow-xs font-extrabold'
                  : 'text-emerald-300 hover:text-white hover:bg-white/5 font-semibold'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Credentials Card */}
          {authMode !== 'signup' && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-blue-600" /> Quick Demo Credentials
                </span>
                <span className="text-[10px] text-slate-400">1-click fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('user')}
                  className={`px-3 py-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                    authMode === 'user_login'
                      ? 'bg-blue-50/80 border-blue-200 text-blue-700 hover:bg-blue-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-slate-800 font-bold truncate">User (Analyst)</div>
                  <div className="text-[10px] text-slate-500 font-mono">ID: user • pass: user123</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className={`px-3 py-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                    authMode === 'admin_login'
                      ? 'bg-amber-50/80 border-amber-300 text-amber-800 hover:bg-amber-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-amber-900 font-bold truncate flex items-center gap-1">
                    Admin <ShieldCheck className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="text-[10px] text-amber-800 font-mono">ID: admin • pass: admin123</div>
                </button>
              </div>
            </div>
          )}

          {/* Login or Sign Up Form */}
          {authMode !== 'signup' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {authMode === 'admin_login' ? 'Admin ID / Email Address' : 'User ID / Email Address'}
                </label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder={authMode === 'admin_login' ? 'admin or admin@fakedetect.org' : 'user or user@fakedetect.org'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  You can enter your custom ID/username (e.g. <code>admin</code>) or full email.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'admin_login' && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Admin login unlocks ML sensitivity thresholds and user governance.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                  authMode === 'admin_login'
                    ? 'bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 hover:from-slate-800 hover:to-indigo-800'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{authMode === 'admin_login' ? 'Sign In as Administrator' : 'Sign In as User'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg(null);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1.5 hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sign Up (Create Account)</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCustomAccountSubmit} className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  Create a New Account (Sign Up)
                </span>
                Choose your custom login ID (username), email, and password. Select whether this account should be a <strong>User</strong> or an <strong>Administrator</strong>.
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Type / Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('user')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      registerRole === 'user'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>User / Analyst</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('admin')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      registerRole === 'admin'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              {/* Custom User ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Login ID / Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customUsername}
                    onChange={e => setCustomUsername(e.target.value.replace(/\s+/g, ''))}
                    placeholder="e.g. analyst_john or admin_sarah"
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  You can type this ID on the login screen to sign in directly.
                </span>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Jordan Smith"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jordan@mydomain.com"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Organization (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder={registerRole === 'admin' ? 'Security & Governance' : 'Fact Checking Desk'}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Set Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-md flex items-center justify-center gap-2 transition-all mt-3"
              >
                {isLoading ? (
                  <span>Creating Account & Signing In...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Sign Up & Sign In</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('user_login')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Log In as User
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('admin_login')}
                  className="font-bold text-amber-700 hover:underline"
                >
                  Log In as Admin
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
