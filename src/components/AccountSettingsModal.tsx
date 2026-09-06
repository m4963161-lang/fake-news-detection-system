import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Building,
  KeyRound,
  Fingerprint,
  Sparkles
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import {
  updateUserProfileAndCredentials,
  getUserPassword,
  getStoredAuditLogs,
  saveStoredAuditLogs
} from '../utils/authStore';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onUserUpdated: (updatedUser: AuthUser, message: string) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated
}) => {
  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  // Form states
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [username, setUsername] = useState(currentUser.username || currentUser.id || '');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [department, setDepartment] = useState(currentUser.department || '');
  const [role, setRole] = useState<UserRole>(currentUser.role);

  // Password states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const existingPassword = getUserPassword(currentUser);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and Email cannot be empty.');
      setIsSaving(false);
      return;
    }

    const result = updateUserProfileAndCredentials(currentUser.id, {
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role: role
    });

    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Failed to update profile settings.');
      setIsSaving(false);
      return;
    }

    // Audit log
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const logs = getStoredAuditLogs();
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: formatted,
      actorEmail: result.user.email,
      actorRole: result.user.role,
      action: 'Account Settings Updated',
      details: `${result.user.name} updated custom ID (${result.user.username || 'default'}), email, and details.`,
      type: 'user_management' as const
    };
    saveStoredAuditLogs([newLog, ...logs]);

    setIsSaving(false);
    setSuccessMsg('Account details saved successfully!');
    onUserUpdated(result.user, 'Account details and ID updated');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verify current password (if user didn't leave empty)
    if (currentPasswordInput && currentPasswordInput !== existingPassword) {
      setErrorMsg('Current password does not match. Please verify your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);

    const result = updateUserProfileAndCredentials(currentUser.id, {
      newPassword: newPassword
    });

    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Failed to change password.');
      setIsSaving(false);
      return;
    }

    // Audit log
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const logs = getStoredAuditLogs();
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: formatted,
      actorEmail: result.user.email,
      actorRole: result.user.role,
      action: 'Password Changed',
      details: `Password changed for account ${result.user.email} (${result.user.role}).`,
      type: 'security' as const
    };
    saveStoredAuditLogs([newLog, ...logs]);

    setIsSaving(false);
    setSuccessMsg('Password changed successfully!');
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
    onUserUpdated(result.user, 'Password updated successfully');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
        {/* Header */}
        <div
          className={`p-6 text-white relative ${
            isAdmin
              ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/50'
              : 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-blue-800/50'
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
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-md ${
                isAdmin
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-500 ring-2 ring-amber-300'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-2 ring-blue-300'
              }`}
            >
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  {currentUser.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-blue-400 text-blue-950'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Custom User ID: <span className="font-mono text-amber-300">{currentUser.username || currentUser.id}</span>
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex rounded-xl bg-black/25 p-1 mt-4 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              Set My ID & Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Change Password
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Custom ID & Login Credentials
                </span>
                You can set your own personalized User/Admin ID or Username. You can use either this ID or your Email address to sign in.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom User ID / Username
                </label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. alex_rivera or admin_lead"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used as your direct login ID (e.g. typing "{username || 'my_id'}" into the login screen).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@fakedetect.org"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Team
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="Fact Checking Desk"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User / Analyst</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isSaving ? <span>Saving Profile...</span> : <span>Save ID & Profile Changes</span>}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Current Stored Password:
                </div>
                <div className="text-[11px] font-mono text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                  {existingPassword || 'user123'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password (optional confirmation)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPasswordInput}
                    onChange={e => setCurrentPasswordInput(e.target.value)}
                    placeholder="Enter current password or leave blank"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password (min 4 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter your new custom password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your new custom password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 hover:from-slate-800 hover:to-indigo-800 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isSaving ? <span>Updating Password...</span> : <span>Set New Password</span>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
