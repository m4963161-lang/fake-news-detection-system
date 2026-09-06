import React, { useState, useEffect } from 'react';
import { NavTab, PredictionRecord, AuthUser, UserRole } from './types';
import {
  INITIAL_PREDICTIONS,
  MODEL_METRICS_DATA,
  classifyNews,
  classifyNewsAsync,
  registerWeightsProvider
} from './utils/nlpEngine';
import {
  getStoredCurrentUser,
  saveStoredCurrentUser,
  getStoredUsers,
  saveStoredUsers,
  getStoredAuditLogs,
  saveStoredAuditLogs
} from './utils/authStore';
import {
  getDynamicWeights,
  learnFromRecentNews,
  getAutoLearnConfig
} from './utils/autoLearnStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { DashboardView } from './components/DashboardView';
import { AboutView } from './components/AboutView';
import { DatasetView } from './components/DatasetView';
import { CodeExportView } from './components/CodeExportView';
import { AdminView } from './components/AdminView';
import { AutoLearnView } from './components/AutoLearnView';
import { LoginModal } from './components/LoginModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { Sparkles, HelpCircle, X, CheckCircle2 } from 'lucide-react';

// Connect dynamic online weights provider
registerWeightsProvider(getDynamicWeights);

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredCurrentUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalInitialRole, setLoginModalInitialRole] = useState<UserRole>('user');
  const [loginModalInitialMode, setLoginModalInitialMode] = useState<'user_login' | 'admin_login' | 'signup'>('user_login');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [records, setRecords] = useState<PredictionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('fakedetect_predictions_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading predictions:', e);
    }
    return INITIAL_PREDICTIONS;
  });

  const [activeRecord, setActiveRecord] = useState<PredictionRecord | null>(() => {
    return records[0] || null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sync records with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fakedetect_predictions_v2', JSON.stringify(records));
    } catch (e) {
      console.error('Error saving predictions:', e);
    }
  }, [records]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleOpenLogin = (role: UserRole = 'user') => {
    setLoginModalInitialRole(role);
    setLoginModalInitialMode(role === 'admin' ? 'admin_login' : 'user_login');
    setShowLoginModal(true);
  };

  const handleOpenSignup = () => {
    setLoginModalInitialRole('user');
    setLoginModalInitialMode('signup');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (user: AuthUser, message: string) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    showToast(message);
    if (user.role === 'admin' && activeTab === 'home') {
      setActiveTab('admin');
    }
  };

  const handleUserUpdated = (updatedUser: AuthUser, message: string) => {
    setCurrentUser(updatedUser);
    saveStoredCurrentUser(updatedUser);
    showToast(message);
  };

  const handleLogout = () => {
    if (currentUser) {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const logs = getStoredAuditLogs();
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: formatted,
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
        action: 'User Sign Out',
        details: `${currentUser.name} signed out of session.`,
        type: 'auth' as const
      };
      saveStoredAuditLogs([newLog, ...logs]);
    }

    setCurrentUser(null);
    saveStoredCurrentUser(null);
    showToast('Signed out successfully');
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  // Perform classification
  const handleAnalyze = async (newsText: string) => {
    setIsAnalyzing(true);
    try {
      const nextId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
      const newRecord = await classifyNewsAsync(newsText, nextId);
      if (currentUser) {
        newRecord.user_email = currentUser.email;

        // Update user's prediction count
        const users = getStoredUsers();
        const updated = users.map(u => u.id === currentUser.id ? { ...u, predictionsCount: (u.predictionsCount || 0) + 1 } : u);
        saveStoredUsers(updated);
      }

      // Auto-learn from recent user submission if active
      const autoConfig = getAutoLearnConfig();
      if (autoConfig.autoLearnActive && autoConfig.allowUserSubmissionsToTrain && newRecord.confidence >= autoConfig.confidenceThreshold) {
        learnFromRecentNews(null, newsText, newRecord.prediction, newsText.slice(0, 50), 'user_prediction');
      }

      setRecords(prev => [newRecord, ...prev]);
      setActiveRecord(newRecord);
      setIsAnalyzing(false);
      setActiveTab('result');
      const tag = newRecord.is_actor_vijay_topic ? ' [Vijay / TVK]' : '';
      showToast(`Prediction complete: ${newRecord.prediction} NEWS (${newRecord.confidence}%)${tag}`);
    } catch (err) {
      console.error('Error during analysis:', err);
      // Fallback
      const nextId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
      const fallbackRecord = classifyNews(newsText, nextId);
      setRecords(prev => [fallbackRecord, ...prev]);
      setActiveRecord(fallbackRecord);
      setIsAnalyzing(false);
      setActiveTab('result');
      showToast(`Prediction complete: ${fallbackRecord.prediction} NEWS (${fallbackRecord.confidence}%)`);
    }
  };

  const handleDeleteRecord = (id: number) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    if (activeRecord?.id === id) {
      setActiveRecord(records.find(r => r.id !== id) || null);
    }
    showToast('Record removed from history');
  };

  const handleClearAll = () => {
    setRecords([]);
    setActiveRecord(null);
    showToast('All prediction records cleared');
  };

  const handleResetSession = () => {
    setRecords(INITIAL_PREDICTIONS);
    setActiveRecord(INITIAL_PREDICTIONS[0]);
    setCurrentUser(null);
    saveStoredCurrentUser(null);
    showToast('Demo dataset & history restored (Logged out)');
  };

  const handleSelectRecord = (record: PredictionRecord) => {
    setActiveRecord(record);
    setActiveTab('result');
  };

  const handleTestFromDataset = (text: string) => {
    setActiveTab('home');
    handleAnalyze(text);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col lg:flex-row antialiased font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenLogin={handleOpenLogin}
        onOpenSignup={handleOpenSignup}
        onOpenSettings={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
        onResetSession={handleResetSession}
        records={records}
      />

      {/* Main content pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenLogin={handleOpenLogin}
          onOpenSignup={handleOpenSignup}
          onOpenSettings={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
          onNavigateTab={tab => setActiveTab(tab)}
        />

        {/* Global Toast Banner */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-fadeIn">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toast}</span>
            </div>
          </div>
        )}

        {/* Main Body View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'result' && (
            activeRecord ? (
              <ResultView
                record={activeRecord}
                onCheckAnother={() => setActiveTab('home')}
                onNavigate={tab => setActiveTab(tab)}
              />
            ) : (
              <div className="max-w-md mx-auto text-center py-16 space-y-4">
                <h3 className="text-lg font-bold text-slate-800">No active prediction selected</h3>
                <p className="text-xs text-slate-500">
                  Please enter a news article to generate a real-time prediction result.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Go to News Input
                </button>
              </div>
            )
          )}

          {activeTab === 'history' && (
            <HistoryView
              records={records}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAll}
              onGoToHome={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              records={records}
              metrics={MODEL_METRICS_DATA}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              currentUser={currentUser || {
                id: 'guest',
                name: 'Guest User',
                email: 'guest@fakedetect.org',
                role: 'user',
                createdAt: 'Today',
                lastLogin: 'Now',
                status: 'active',
                predictionsCount: 0
              }}
              onOpenLogin={handleOpenLogin}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'about' && <AboutView />}

          {activeTab === 'dataset' && (
            <DatasetView onTestSample={handleTestFromDataset} />
          )}

          {activeTab === 'autolearn' && (
            <AutoLearnView
              onNavigateToAnalyze={handleTestFromDataset}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'code' && <CodeExportView />}
        </main>
      </div>

      {/* LOGIN & REGISTRATION MODAL */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={loginModalInitialRole}
        initialMode={loginModalInitialMode}
      />

      {/* ACCOUNT SETTINGS & CREDENTIALS MODAL */}
      <AccountSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentUser={currentUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* QUICK HELP / INFO MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">How FakeDetect Works</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>1. Ingestion:</strong> Accepts news headlines or articles up to 5,000 characters.
              </p>
              <p>
                <strong>2. NLP Preprocessing:</strong> Normalizes text, strips HTML and URLs, eliminates English stopwords, and cleans punctuation.
              </p>
              <p>
                <strong>3. TF-IDF & Logistic Regression:</strong> Calculates n-gram frequency matrices and applies learned weights to output probability confidence scores.
              </p>
              <p>
                <strong>4. User & Admin Roles:</strong> Users verify articles and maintain query history. Administrators manage model hyperparameters, decision boundaries, and user accounts.
              </p>
              <p>
                <strong>5. SQLite Persistence:</strong> Saves all queries with timestamps and probability breakdowns for retrospective analytics.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

