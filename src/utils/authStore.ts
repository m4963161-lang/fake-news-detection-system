import { AuthUser, SystemAuditLog, ModelThresholdConfig, UserRole } from '../types';

export const INITIAL_USERS: AuthUser[] = [
  {
    id: 'usr_admin_001',
    username: 'admin',
    name: 'Dr. Sarah Chen',
    email: 'admin@fakedetect.org',
    role: 'admin',
    avatar: 'SC',
    department: 'ML & AI Safety Directorate',
    createdAt: '15 Jan 2026',
    lastLogin: 'Today, 09:30 AM',
    status: 'active',
    predictionsCount: 142
  },
  {
    id: 'usr_analyst_002',
    username: 'user',
    name: 'Alex Rivera',
    email: 'user@fakedetect.org',
    role: 'user',
    avatar: 'AR',
    department: 'Editorial Fact-Checking Desk',
    createdAt: '02 Feb 2026',
    lastLogin: 'Today, 08:45 AM',
    status: 'active',
    predictionsCount: 68
  },
  {
    id: 'usr_analyst_003',
    username: 'elena',
    name: 'Elena Rostova',
    email: 'elena@pressreview.com',
    role: 'user',
    avatar: 'ER',
    department: 'Investigative Journalism',
    createdAt: '10 Feb 2026',
    lastLogin: 'Yesterday, 04:15 PM',
    status: 'active',
    predictionsCount: 39
  },
  {
    id: 'usr_analyst_004',
    username: 'marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@cyberthreat.io',
    role: 'user',
    avatar: 'MV',
    department: 'Digital Verification Team',
    createdAt: '22 Feb 2026',
    lastLogin: '28 Aug 2026',
    status: 'active',
    predictionsCount: 24
  }
];

// In-memory passwords for demo accounts (keyed by email, username, or id)
export const USER_PASSWORDS: Record<string, string> = {
  'admin@fakedetect.org': 'admin123',
  'admin': 'admin123',
  'user@fakedetect.org': 'user123',
  'user': 'user123',
  'elena@pressreview.com': 'user123',
  'elena': 'user123',
  'marcus.v@cyberthreat.io': 'user123',
  'marcus': 'user123'
};

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log_001',
    timestamp: '02 Sep 2026 09:30 AM',
    actorEmail: 'admin@fakedetect.org',
    actorRole: 'admin',
    action: 'Admin Session Login',
    details: 'Logged into Admin Governance Console with 2FA authorization token.',
    type: 'auth'
  },
  {
    id: 'log_002',
    timestamp: '02 Sep 2026 09:15 AM',
    actorEmail: 'user@fakedetect.org',
    actorRole: 'user',
    action: 'News Article Analyzed',
    details: 'Submitted 36-word science report; classification: REAL (96.45% confidence).',
    type: 'prediction'
  },
  {
    id: 'log_003',
    timestamp: '02 Sep 2026 08:50 AM',
    actorEmail: 'admin@fakedetect.org',
    actorRole: 'admin',
    action: 'Model Hyperparameter Check',
    details: 'TF-IDF ngram_range=(1,2) and C=1.0 verified against test suite.',
    type: 'model_update'
  },
  {
    id: 'log_004',
    timestamp: '01 Sep 2026 05:20 PM',
    actorEmail: 'admin@fakedetect.org',
    actorRole: 'admin',
    action: 'User Role Audit',
    details: 'Verified permissions for 4 active security analysts.',
    type: 'user_management'
  }
];

export const DEFAULT_MODEL_CONFIG: ModelThresholdConfig = {
  fakeThreshold: 0.50,
  sensitivity: 'standard',
  minCharacterLimit: 20,
  maxCharacterLimit: 5000,
  autoQuarantineThreshold: 92
};

const USERS_KEY = 'fakedetect_users_v2';
const AUTH_KEY = 'fakedetect_current_user_v3';
const AUDIT_KEY = 'fakedetect_audit_logs_v2';
const PASSWORDS_KEY = 'fakedetect_passwords_v2';
const CONFIG_KEY = 'fakedetect_model_config_v2';

export const getStoredUsers = (): AuthUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load users:', e);
  }
  return INITIAL_USERS;
};

export const saveStoredUsers = (users: AuthUser[]) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
};

export const getStoredCurrentUser = (): AuthUser | null => {
  try {
    // Purge legacy auto-login artifact so returning browsers do not auto-login
    localStorage.removeItem('fakedetect_current_user_v2');
    localStorage.removeItem('fakedetect_current_user');

    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load current user:', e);
  }
  // No auto login: default to guest / logged out state
  return null;
};

export const saveStoredCurrentUser = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('fakedetect_current_user_v2');
      localStorage.removeItem('fakedetect_current_user');
    }
  } catch (e) {
    console.error('Failed to save current user:', e);
  }
};

export const getStoredAuditLogs = (): SystemAuditLog[] => {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load audit logs:', e);
  }
  return INITIAL_AUDIT_LOGS;
};

export const saveStoredAuditLogs = (logs: SystemAuditLog[]) => {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }
};

export const getStoredPasswords = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load passwords:', e);
  }
  return USER_PASSWORDS;
};

export const saveStoredPasswords = (passwords: Record<string, string>) => {
  try {
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  } catch (e) {
    console.error('Failed to save passwords:', e);
  }
};

export const getStoredModelConfig = (): ModelThresholdConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load model config:', e);
  }
  return DEFAULT_MODEL_CONFIG;
};

export const saveStoredModelConfig = (config: ModelThresholdConfig) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save model config:', e);
  }
};

/**
 * Finds user by Email, Custom Username, or User ID (case-insensitive)
 */
export const findUserByIdentifier = (identifier: string): AuthUser | undefined => {
  const cleanId = identifier.trim().toLowerCase();
  const users = getStoredUsers();
  return users.find(u =>
    u.email.toLowerCase() === cleanId ||
    (u.username && u.username.toLowerCase() === cleanId) ||
    u.id.toLowerCase() === cleanId
  );
};

/**
 * Retrieves the stored password for a given user
 */
export const getUserPassword = (user: AuthUser): string => {
  const passwords = getStoredPasswords();
  return (
    passwords[user.email.toLowerCase()] ||
    (user.username && passwords[user.username.toLowerCase()]) ||
    passwords[user.id] ||
    (user.role === 'admin' ? 'admin123' : 'user123')
  );
};

/**
 * Updates a user's password in persistent storage
 */
export const updateUserPassword = (user: AuthUser, newPassword: string) => {
  const passwords = getStoredPasswords();
  passwords[user.email.toLowerCase()] = newPassword;
  if (user.username) {
    passwords[user.username.toLowerCase()] = newPassword;
  }
  passwords[user.id] = newPassword;
  saveStoredPasswords(passwords);
};

/**
 * Updates an existing user's profile and credentials
 */
export const updateUserProfileAndCredentials = (
  userId: string,
  updates: {
    username?: string;
    name?: string;
    email?: string;
    department?: string;
    role?: UserRole;
    newPassword?: string;
  }
): { success: boolean; user?: AuthUser; error?: string } => {
  const users = getStoredUsers();
  const userIdx = users.findIndex(u => u.id === userId);

  if (userIdx === -1) {
    return { success: false, error: 'User not found.' };
  }

  const existing = users[userIdx];
  const trimmedUsername = updates.username ? updates.username.trim().toLowerCase() : existing.username;
  const trimmedEmail = updates.email ? updates.email.trim().toLowerCase() : existing.email;

  // Check username collision if changed
  if (trimmedUsername && trimmedUsername !== existing.username?.toLowerCase()) {
    const conflict = users.find(u => u.id !== userId && u.username?.toLowerCase() === trimmedUsername);
    if (conflict) {
      return { success: false, error: `The Custom ID / Username "${trimmedUsername}" is already taken.` };
    }
  }

  // Check email collision if changed
  if (trimmedEmail && trimmedEmail !== existing.email.toLowerCase()) {
    const conflict = users.find(u => u.id !== userId && u.email.toLowerCase() === trimmedEmail);
    if (conflict) {
      return { success: false, error: `The Email "${trimmedEmail}" is already in use by another account.` };
    }
  }

  const initials = (updates.name || existing.name)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'FD';

  const updatedUser: AuthUser = {
    ...existing,
    username: trimmedUsername,
    name: updates.name ? updates.name.trim() : existing.name,
    email: trimmedEmail,
    department: updates.department !== undefined ? updates.department.trim() : existing.department,
    role: updates.role || existing.role,
    avatar: initials
  };

  users[userIdx] = updatedUser;
  saveStoredUsers(users);

  // Update password if specified
  if (updates.newPassword && updates.newPassword.trim()) {
    updateUserPassword(updatedUser, updates.newPassword.trim());
  }

  // If current logged-in user, update session
  const current = getStoredCurrentUser();
  if (current && current.id === updatedUser.id) {
    saveStoredCurrentUser(updatedUser);
  }

  return { success: true, user: updatedUser };
};
