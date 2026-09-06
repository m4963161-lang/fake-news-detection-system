import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Sliders,
  FileText,
  Activity,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  ArrowUpRight,
  Database,
  Cpu,
  Key,
  X,
  Fingerprint,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';
import { AuthUser, SystemAuditLog, ModelThresholdConfig, UserRole } from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredAuditLogs,
  saveStoredAuditLogs,
  getStoredModelConfig,
  saveStoredModelConfig,
  getStoredPasswords,
  saveStoredPasswords,
  getUserPassword,
  updateUserProfileAndCredentials
} from '../utils/authStore';

interface AdminViewProps {
  currentUser: AuthUser;
  onOpenLogin: (role: UserRole) => void;
  onShowToast: (msg: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  onOpenLogin,
  onShowToast
}) => {
  const isAdmin = currentUser && currentUser.role === 'admin';

  // Local state for tabs
  const [adminTab, setAdminTab] = useState<'users' | 'model' | 'indicators' | 'logs'>('users');
  const [users, setUsers] = useState<AuthUser[]>(() => getStoredUsers());
  const [logs, setLogs] = useState<SystemAuditLog[]>(() => getStoredAuditLogs());
  const [config, setConfig] = useState<ModelThresholdConfig>(() => getStoredModelConfig());

  // Search & filter
  const [userSearch, setUserSearch] = useState('');
  const [logFilter, setLogFilter] = useState<string>('all');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserDept, setNewUserDept] = useState('');
  const [newUserPass, setNewUserPass] = useState('user123');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editPass, setEditPass] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);

  // Retrain simulation state
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState<string | null>(null);

  // Add custom indicator state
  const [newTerm, setNewTerm] = useState('');
  const [newWeight, setNewWeight] = useState(2.5);
  const [newBias, setNewBias] = useState<'REAL' | 'FAKE'>('FAKE');
  const [customTerms, setCustomTerms] = useState<Array<{ term: string; weight: number; bias: 'REAL' | 'FAKE' }>>([
    { term: 'deepfake voice', weight: 3.4, bias: 'FAKE' },
    { term: 'peer reviewed archive', weight: 3.1, bias: 'REAL' },
    { term: 'unverified blog post', weight: 2.8, bias: 'FAKE' }
  ]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Administrator Authentication Required
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              The Admin Governance Portal contains elevated model hyperparameter tuning, user role permissions, vocabulary calibration, and security audit logs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 max-w-md mx-auto space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Current Session Status:
            </div>
            <div>
              Logged in as: <strong className="text-slate-800">{currentUser?.name || 'Guest'}</strong> ({currentUser?.email || 'N/A'})
            </div>
            <div>
              Current Role: <span className="font-semibold text-blue-600 uppercase">{currentUser?.role || 'None'}</span> (Insufficient privileges)
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenLogin('admin')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white font-bold text-sm shadow-md hover:from-slate-800 hover:to-indigo-900 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Login as Administrator</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Handlers ---
  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus: 'active' | 'suspended' = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    saveStoredUsers(updated);

    const target = users.find(u => u.id === userId);
    const nextStatus = target?.status === 'active' ? 'suspended' : 'activated';
    logEvent(`User status changed: ${target?.email} is now ${nextStatus}`, 'user_management');
    onShowToast(`User account ${nextStatus}`);
  };

  const handleToggleUserRole = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.id === currentUser.id) {
      onShowToast('Cannot demote your own active administrator account');
      return;
    }
    const nextRole: UserRole = target.role === 'admin' ? 'user' : 'admin';
    const updated = users.map(u => u.id === userId ? { ...u, role: nextRole } : u);
    setUsers(updated);
    saveStoredUsers(updated);
    logEvent(`Role changed: ${target.email} is now ${nextRole.toUpperCase()}`, 'user_management');
    onShowToast(`User role updated to ${nextRole.toUpperCase()}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      onShowToast('Cannot delete your own active administrator account');
      return;
    }
    const target = users.find(u => u.id === userId);
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveStoredUsers(updated);
    if (target) {
      logEvent(`User deleted: ${target.email} (${target.name})`, 'user_management');
    }
    onShowToast('User account deleted');
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const trimmedEmail = newUserEmail.trim().toLowerCase();
    const trimmedId = newUserId.trim().toLowerCase() || trimmedEmail.split('@')[0];

    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      onShowToast('User with this email already exists');
      return;
    }

    if (users.some(u => u.username && u.username.toLowerCase() === trimmedId)) {
      onShowToast(`User ID "${trimmedId}" is already taken`);
      return;
    }

    const initials = newUserName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || (newUserRole === 'admin' ? 'AD' : 'FD');

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newUser: AuthUser = {
      id: `usr_${trimmedId || Date.now()}`,
      username: trimmedId,
      name: newUserName.trim(),
      email: trimmedEmail,
      role: newUserRole,
      avatar: initials,
      department: newUserDept.trim() || (newUserRole === 'admin' ? 'Security & Governance' : 'News Desk'),
      createdAt: formattedDate,
      lastLogin: 'Never',
      status: 'active',
      predictionsCount: 0
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);

    const passwords = getStoredPasswords();
    passwords[trimmedEmail] = newUserPass || 'user123';
    passwords[trimmedId] = newUserPass || 'user123';
    passwords[newUser.id] = newUserPass || 'user123';
    saveStoredPasswords(passwords);

    logEvent(`Admin added new user: ${newUser.email} (ID: ${trimmedId}, Role: ${newUser.role})`, 'user_management');
    onShowToast(`User ${newUser.name} created successfully with ID: ${trimmedId}`);

    // Reset form
    setNewUserId('');
    setNewUserName('');
    setNewUserEmail('');
    setNewUserDept('');
    setNewUserPass('user123');
    setShowAddUserModal(false);
  };

  const handleOpenEditUser = (user: AuthUser) => {
    setEditingUser(user);
    setEditId(user.username || user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditDept(user.department || '');
    setEditRole(user.role);
    setEditPass(getUserPassword(user));
    setShowEditPass(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const result = updateUserProfileAndCredentials(editingUser.id, {
      username: editId.trim(),
      name: editName.trim(),
      email: editEmail.trim(),
      department: editDept.trim(),
      role: editRole,
      newPassword: editPass.trim()
    });

    if (!result.success || !result.user) {
      onShowToast(result.error || 'Failed to update user credentials');
      return;
    }

    const updatedUsers = getStoredUsers();
    setUsers(updatedUsers);

    logEvent(`Admin updated credentials for user ${result.user.name} (ID: ${editId}, Role: ${editRole})`, 'user_management');
    onShowToast(`Credentials updated for ${result.user.name}`);
    setEditingUser(null);
  };

  const handleSaveConfig = (newConfig: ModelThresholdConfig) => {
    setConfig(newConfig);
    saveStoredModelConfig(newConfig);
    logEvent(`Model hyperparameters updated (Threshold: ${(newConfig.fakeThreshold * 100).toFixed(0)}%, Sensitivity: ${newConfig.sensitivity})`, 'model_update');
    onShowToast('Model governance settings saved');
  };

  const handleSimulateRetrain = () => {
    setIsRetraining(true);
    setRetrainStep('Ingesting 4,000 verified news samples...');

    setTimeout(() => {
      setRetrainStep('Calculating TF-IDF vocabulary (unigrams + bigrams)...');
      setTimeout(() => {
        setRetrainStep('Fitting Logistic Regression (C=1.0, L2 penalty, liblinear)...');
        setTimeout(() => {
          setRetrainStep('Evaluating 5-fold cross-validation accuracy: 96.84% (+0.36%)...');
          setTimeout(() => {
            setIsRetraining(false);
            setRetrainStep(null);
            logEvent('Automated model retraining completed: accuracy 96.84%, weights synchronized', 'model_update');
            onShowToast('Model pipeline retrained and synchronized successfully!');
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  const handleAddCustomIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    const term = newTerm.trim().toLowerCase();
    if (customTerms.some(t => t.term === term)) {
      onShowToast('Indicator term already registered');
      return;
    }
    const updated = [{ term, weight: Number(newWeight), bias: newBias }, ...customTerms];
    setCustomTerms(updated);
    logEvent(`Added custom indicator "${term}" (weight: ${newWeight}, bias: ${newBias})`, 'model_update');
    onShowToast(`Indicator term "${term}" added`);
    setNewTerm('');
  };

  const handleDeleteCustomIndicator = (term: string) => {
    const updated = customTerms.filter(t => t.term !== term);
    setCustomTerms(updated);
    logEvent(`Removed indicator term "${term}"`, 'model_update');
    onShowToast(`Indicator "${term}" removed`);
  };

  const logEvent = (action: string, type: SystemAuditLog['type']) => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newLog: SystemAuditLog = {
      id: `log_${Date.now()}`,
      timestamp: formatted,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action,
      details: `Executed by ${currentUser.name} via Admin Portal.`,
      type
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredAuditLogs(updatedLogs);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'all') return true;
    return l.type === logFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Top Admin Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Admin Governance Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                Root Access
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Active Administrator: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleSimulateRetrain}
            disabled={isRetraining}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Retraining...' : 'Re-train & Sync Model'}</span>
          </button>
        </div>
      </div>

      {/* Retraining Progress Bar */}
      {isRetraining && (
        <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 text-indigo-100 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Machine Learning Pipeline Execution</span>
            </span>
            <span className="font-mono text-amber-300">{retrainStep}</span>
          </div>
          <div className="w-full h-2 bg-indigo-950 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Registered Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{users.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {users.filter(u => u.status === 'active').length} active analysts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Fake Decision Cutoff</span>
            <Sliders className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(config.fakeThreshold * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">
            {config.sensitivity} sensitivity
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">System Audit Events</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{logs.length}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Immutable event trail</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Engine Health</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">99.8%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Latency ~42ms</div>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            adminTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & Permissions ({users.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('model')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            adminTab === 'model'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Model Hyperparameters & Sensitivity</span>
        </button>

        <button
          onClick={() => setAdminTab('indicators')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            adminTab === 'indicators'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Vocabulary & Indicator Weights</span>
        </button>

        <button
          onClick={() => setAdminTab('logs')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            adminTab === 'logs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Trail & Telemetry ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                User Management & Access Control
              </h2>
              <p className="text-xs text-slate-500">
                Control analyst access, elevate administrator privileges, or suspend rogue accounts.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">User & Login ID</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Last Login</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  const displayId = u.username || u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {u.avatar || u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-sm bg-slate-200 text-slate-700 text-[9px] font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span>{u.email}</span>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-indigo-600 bg-indigo-50 px-1 rounded text-[10px]">
                                ID: {displayId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <>
                              <ShieldAlert className="w-3 h-3 text-amber-600" /> Admin
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-blue-600" /> Analyst
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {u.department || 'General'}
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {u.lastLogin || 'Never'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="capitalize">{u.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit ID & Password Button */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            title="Edit User ID, Password & Profile"
                            className="p-1.5 rounded-lg border text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Edit Credentials</span>
                          </button>

                          <button
                            onClick={() => handleToggleUserRole(u.id)}
                            disabled={isCurrent}
                            title={u.role === 'admin' ? 'Demote to Analyst' : 'Promote to Admin'}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isCurrent
                                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50 border-slate-200'
                                : u.role === 'admin'
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'
                            }`}
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            disabled={isCurrent}
                            title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isCurrent
                                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50 border-slate-200'
                                : u.status === 'active'
                                ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={isCurrent}
                            title="Delete user"
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isCurrent
                                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50 border-slate-200'
                                : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MODEL HYPERPARAMETERS & SENSITIVITY */}
      {adminTab === 'model' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Classification Decision Boundary & Sensitivity Tuning
              </h2>
              <p className="text-xs text-slate-500">
                Calibrate the fake probability cutoff threshold and input guardrails for the NLP inference engine.
              </p>
            </div>

            {/* Threshold Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Fake News Decision Cutoff</span>
                </label>
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-sm shadow-xs">
                  {(config.fakeThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.80"
                step="0.05"
                value={config.fakeThreshold}
                onChange={e => handleSaveConfig({ ...config, fakeThreshold: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>30% (Aggressive flag)</span>
                <span>50% (Standard default)</span>
                <span>80% (Conservative)</span>
              </div>
            </div>

            {/* Sensitivity Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Editorial Sensitivity Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['lenient', 'standard', 'strict'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleSaveConfig({ ...config, sensitivity: mode })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      config.sensitivity === mode
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs capitalize flex items-center gap-1">
                      {mode === 'strict' && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
                      {mode}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {mode === 'lenient'
                        ? 'Permissive, lowers false flags'
                        : mode === 'standard'
                        ? 'Balanced 50/50 boundary'
                        : 'Strict fact checking for breaking wire news'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guardrail Limits */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minimum Character Length
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={config.minCharacterLimit}
                  onChange={e => handleSaveConfig({ ...config, minCharacterLimit: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Rejects inputs shorter than this limit</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  High-Risk Quarantine Threshold
                </label>
                <input
                  type="number"
                  min={80}
                  max={99}
                  value={config.autoQuarantineThreshold}
                  onChange={e => handleSaveConfig({ ...config, autoQuarantineThreshold: parseInt(e.target.value) || 90 })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Automated escalation above this confidence</span>
              </div>
            </div>
          </div>

          {/* Model Architecture Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Active Pipeline Specs
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Estimator Algorithm:</span>
                <strong className="text-slate-800 font-mono">LogisticRegression</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Vectorizer Scheme:</span>
                <strong className="text-slate-800 font-mono">TfidfVectorizer</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">N-gram Range:</span>
                <strong className="text-slate-800 font-mono">(1, 2) [unigram+bigram]</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Max Features / Vocab:</span>
                <strong className="text-slate-800 font-mono">10,000 terms</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Regularization (C):</span>
                <strong className="text-slate-800 font-mono">1.0 (L2 Penalty)</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="text-slate-500">Dataset Anchor:</span>
                <strong className="text-slate-800 font-mono">dataset/news.csv (4,000)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VOCABULARY & INDICATOR WEIGHTS */}
      {adminTab === 'indicators' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add custom indicator form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Register Custom Indicator
              </h2>
              <p className="text-xs text-slate-500">
                Inject custom heuristic weights for newly trending misinformation buzzwords.
              </p>
            </div>

            <form onSubmit={handleAddCustomIndicator} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Indicator Keyword / Phrase
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. quantum frequency healing"
                  value={newTerm}
                  onChange={e => setNewTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bias Direction
                  </label>
                  <select
                    value={newBias}
                    onChange={e => setNewBias(e.target.value as 'REAL' | 'FAKE')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="FAKE">FAKE Indicator</option>
                    <option value="REAL">REAL Indicator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Weight ({newWeight})
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={newWeight}
                    onChange={e => setNewWeight(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 mt-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Inject Indicator Weight</span>
              </button>
            </form>
          </div>

          {/* Active custom indicators list */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Active Custom Calibrations
                </h2>
                <p className="text-xs text-slate-500">
                  Custom NLP tokens currently boosting classification accuracy.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {customTerms.length} terms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customTerms.map(t => (
                <div
                  key={t.term}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-xs text-slate-900 truncate">
                      "{t.term}"
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded-sm ${
                          t.bias === 'FAKE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {t.bias}
                      </span>
                      <span>Weight: {t.weight.toFixed(1)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomIndicator(t.term)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL & TELEMETRY */}
      {adminTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Security Audit Log & System Telemetry
              </h2>
              <p className="text-xs text-slate-500">
                Append-only log of user sessions, news inferences, and administrative parameter updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={e => setLogFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <option value="all">All Events ({logs.length})</option>
                <option value="auth">Auth & Logins</option>
                <option value="prediction">News Predictions</option>
                <option value="model_update">Model Parameter Updates</option>
                <option value="user_management">User Management</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-100/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                        log.type === 'auth'
                          ? 'bg-blue-100 text-blue-700'
                          : log.type === 'model_update'
                          ? 'bg-amber-100 text-amber-800'
                          : log.type === 'user_management'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.type.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{log.action}</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.details}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[11px] font-mono text-slate-500">{log.timestamp}</div>
                  <div className="text-[10px] text-slate-400">by {log.actorEmail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD USER MODAL DIALOG */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Register User with Custom ID & Password</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taylor Smith"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Custom ID / Username <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. taylor99"
                    value={newUserId}
                    onChange={e => setNewUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="taylor@fakedetect.org"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Assignment</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="user">User / Analyst</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Fact Checking"
                    value={newUserDept}
                    onChange={e => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Password</label>
                <input
                  type="text"
                  required
                  value={newUserPass}
                  onChange={e => setNewUserPass(e.target.value)}
                  placeholder="Set account password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER CREDENTIALS & ID MODAL DIALOG */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Edit User ID & Password</h3>
                  <p className="text-[11px] text-slate-500">Account: {editingUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Custom ID / Username <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editId}
                    onChange={e => setEditId(e.target.value)}
                    placeholder="e.g. admin or custom_id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="user">User / Analyst</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Reset / Change Password</span>
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-normal text-[10px]"
                  >
                    {showEditPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showEditPass ? 'Hide' : 'Show'}</span>
                  </button>
                </label>
                <input
                  type={showEditPass ? 'text' : 'password'}
                  required
                  value={editPass}
                  onChange={e => setEditPass(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  User can sign in using either this Password with their ID (<strong>{editId || 'ID'}</strong>) or Email.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
