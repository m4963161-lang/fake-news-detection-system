import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  RotateCw,
  Play,
  Pause,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Database,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Clock,
  Radio,
  Sliders,
  Terminal,
  Activity,
  Award,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  RecentNewsItem,
  AutoLearnConfig,
  ActiveLearningStats,
  PredictionLabel,
  NavTab
} from '../types';
import {
  getRecentNewsItems,
  saveRecentNewsItems,
  getAutoLearnConfig,
  saveAutoLearnConfig,
  getActiveLearningStats,
  learnFromRecentNews,
  resetAutoLearnToBaseline,
  generateSyntheticRecentNewsItem,
  getDynamicWeights
} from '../utils/autoLearnStore';
import confetti from 'canvas-confetti';

interface AutoLearnViewProps {
  onNavigateToAnalyze: (text: string) => void;
  onShowToast: (msg: string) => void;
}

export const AutoLearnView: React.FC<AutoLearnViewProps> = ({
  onNavigateToAnalyze,
  onShowToast
}) => {
  const [newsItems, setNewsItems] = useState<RecentNewsItem[]>(() => getRecentNewsItems());
  const [config, setConfig] = useState<AutoLearnConfig>(() => getAutoLearnConfig());
  const [stats, setStats] = useState<ActiveLearningStats>(() => getActiveLearningStats());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learned' | 'pending'>('all');

  // Custom addition modal/form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newCategory, setNewCategory] = useState('Technology & AI');
  const [newLabel, setNewLabel] = useState<PredictionLabel>('REAL');

  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const [streamCountdown, setStreamCountdown] = useState<number>(config.autoStreamInterval || 15);

  // Background auto-streaming interval effect
  useEffect(() => {
    if (!config.autoLearnActive || config.autoStreamInterval <= 0) return;

    const timer = setInterval(() => {
      setStreamCountdown(prev => {
        if (prev <= 1) {
          // Ingest new breaking news item and auto-learn
          handleAutoStreamIngest();
          return config.autoStreamInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.autoLearnActive, config.autoStreamInterval, newsItems]);

  const handleAutoStreamIngest = () => {
    const freshItem = generateSyntheticRecentNewsItem();
    const updatedList = [freshItem, ...newsItems];
    setNewsItems(updatedList);
    saveRecentNewsItems(updatedList);

    // If auto-learning is active, automatically learn this item
    if (config.autoLearnActive) {
      const result = learnFromRecentNews(
        freshItem.id,
        freshItem.content,
        freshItem.suggestedLabel,
        freshItem.title,
        'auto_stream'
      );
      setStats(result.stats);
      setNewsItems(getRecentNewsItems());
      onShowToast(`[Auto-Learn] Ingested live recent story: "${freshItem.title.slice(0, 45)}..."`);
    }
  };

  const handleToggleAutoLearn = () => {
    const updated = { ...config, autoLearnActive: !config.autoLearnActive };
    setConfig(updated);
    saveAutoLearnConfig(updated);
    onShowToast(
      updated.autoLearnActive
        ? 'Continuous Automated Learning: ACTIVE (Ingesting recent news)'
        : 'Continuous Automated Learning: PAUSED'
    );
  };

  const handleLearnSingleStory = (item: RecentNewsItem) => {
    const result = learnFromRecentNews(
      item.id,
      item.content,
      item.verifiedLabel || item.suggestedLabel,
      item.title,
      'manual_batch'
    );
    setStats(result.stats);
    setNewsItems(getRecentNewsItems());
    onShowToast(
      `Learned "${item.title.slice(0, 40)}..." -> Extracted ${result.newTokensLearned.length} new N-grams`
    );
  };

  const handleFetchOneNow = () => {
    handleAutoStreamIngest();
  };

  const handleInstantBatchRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      // Retrain on all pending items
      const pending = newsItems.filter(i => !i.isLearned);
      pending.forEach(item => {
        learnFromRecentNews(
          item.id,
          item.content,
          item.verifiedLabel || item.suggestedLabel,
          item.title,
          'manual_batch'
        );
      });

      setStats(getActiveLearningStats());
      setNewsItems(getRecentNewsItems());
      setIsRetraining(false);
      setRetrainSuccess(true);
      confetti({ particleCount: 65, spread: 60, origin: { y: 0.7 } });
      onShowToast('Model successfully retrained on all recent news streams!');
      setTimeout(() => setRetrainSuccess(false), 3000);
    }, 1200);
  };

  const handleResetToBaseline = () => {
    if (window.confirm('Reset the model to baseline weights? (All learned recent news tokens will be cleared).')) {
      resetAutoLearnToBaseline();
      setNewsItems(getRecentNewsItems());
      setStats(getActiveLearningStats());
      onShowToast('Model reset to baseline pre-trained state.');
    }
  };

  const handleAddCustomRecentStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      onShowToast('Please provide both headline and content.');
      return;
    }

    const newItem: RecentNewsItem = {
      id: `rn-custom-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      source: newSource.trim() || 'Custom News Submission',
      category: newCategory,
      publishedAt: 'Just now (User verified)',
      suggestedLabel: newLabel,
      verifiedLabel: newLabel,
      confidence: 97.5,
      isLearned: true,
      learnedAt: 'Just now',
      extractedNgrams: [],
      driftImpact: 0.15
    };

    // Learn immediately
    const result = learnFromRecentNews(
      null,
      newItem.content,
      newLabel,
      newItem.title,
      'user_prediction'
    );
    newItem.extractedNgrams = result.newTokensLearned;

    const updatedList = [newItem, ...newsItems];
    setNewsItems(updatedList);
    saveRecentNewsItems(updatedList);
    setStats(result.stats);

    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
    setNewSource('');
    onShowToast(`Successfully learned custom story: "${newItem.title.slice(0, 35)}..."`);
    confetti({ particleCount: 50, spread: 50 });
  };

  // Filtered stories
  const filteredItems = newsItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'learned' && item.isLearned) ||
      (statusFilter === 'pending' && !item.isLearned);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const categories = ['all', ...Array.from(new Set(newsItems.map(i => i.category)))];
  const dynamicWeightsCount = Object.keys(getDynamicWeights()).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Control Deck */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>CONTINUOUS ACTIVE LEARNING ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Brain className="w-7 h-7 text-emerald-600" />
              Automated Learning from Recent News
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Continuously adapts the TF-IDF feature space and Logistic Regression weights to novel breaking news, counteracting concept drift and misinformation spikes.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleToggleAutoLearn}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all ${
                config.autoLearnActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {config.autoLearnActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Auto-Learning: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Auto-Learning: PAUSED</span>
                </>
              )}
            </button>

            <button
              onClick={handleFetchOneNow}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              title="Stream a fresh breaking news article into the system"
            >
              <Radio className="w-4 h-4 text-indigo-600" />
              <span>Ingest Live Wire</span>
            </button>

            <button
              onClick={handleInstantBatchRetrain}
              disabled={isRetraining}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isRetraining ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isRetraining ? 'Retraining...' : 'Batch Retrain'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Add Custom Story</span>
            </button>
          </div>
        </div>

        {/* Live Auto-Stream Status Pill */}
        {config.autoLearnActive && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">Live Wire Ingestion Feed:</span>
              <span>Next automatic story poll in <strong className="text-emerald-700 font-mono">{streamCountdown}s</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-mono">
                Active Threshold: &ge; {config.confidenceThreshold}%
              </span>
              <button
                onClick={handleResetToBaseline}
                className="text-xs text-slate-400 hover:text-red-600 transition-colors underline"
              >
                Reset to Baseline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Model Health & Active Learning Stats Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Version */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Model State</div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 font-mono">
              {stats.modelVersion}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Online incremental learning</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Accuracy</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1.5">
              <span>{stats.currentAccuracy}%</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                +{ (stats.currentAccuracy - stats.baseModelAccuracy).toFixed(2) }%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Base: {stats.baseModelAccuracy}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Absorbed Stories */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent News Ingested</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {stats.totalLearnedRecentNews} <span className="text-sm font-normal text-slate-400">stories</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {newsItems.filter(i => !i.isLearned).length} awaiting batch sync
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic Vocabulary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Vocabulary</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {dynamicWeightsCount} <span className="text-sm font-normal text-slate-400">N-Grams</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>+{dynamicWeightsCount - 64} learned from recent news</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Stream on Left, Live Log & Vocabulary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent News Live Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  Recent News Stream & Auto-Learning Buffer
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live breaking news stories ingested from wire services, science journals, and viral social reports.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                {(['all', 'learned', 'pending'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      statusFilter === tab
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search recent headlines, keywords, or wire sources..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden text-slate-700 capitalize"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Stories Cards List */}
            <div className="space-y-3 pt-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No recent stories match the current filter.
                </div>
              ) : (
                filteredItems.map(item => {
                  const isReal = (item.verifiedLabel || item.suggestedLabel) === 'REAL';
                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        item.isLearned
                          ? 'bg-white border-slate-200 shadow-xs'
                          : 'bg-slate-50/70 border-dashed border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                              {item.category}
                            </span>
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.publishedAt}
                            </span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="font-semibold text-slate-600">{item.source}</span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                            {item.title}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {item.content}
                          </p>

                          {/* Extracted Salient Tokens Pill List */}
                          {item.extractedNgrams && item.extractedNgrams.length > 0 && (
                            <div className="pt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                                Salient N-Grams:
                              </span>
                              {item.extractedNgrams.map((ngram, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                    isReal
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  {ngram}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right side verdict & auto-learn button */}
                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-mono ${
                                isReal
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.verifiedLabel || item.suggestedLabel}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {item.confidence}%
                            </span>
                          </div>

                          {/* Learn Trigger / Status */}
                          {item.isLearned ? (
                            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Learned into Model</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleLearnSingleStory(item)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Auto-Learn Now</span>
                            </button>
                          )}

                          <button
                            onClick={() => onNavigateToAnalyze(item.content)}
                            className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>Test in Detector</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Learning Logs & Dynamic Vocabulary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Learning Audit Log */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Continuous Learning Event Log
              </h3>
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                STREAM ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live audit trace of newly ingested vocabulary, n-gram weights, and accuracy drift.
            </p>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 text-xs font-mono">
              {stats.learningLogs.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">No learning events recorded yet.</div>
              ) : (
                stats.learningLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{log.timestamp}</span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded ${
                          log.label === 'REAL' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {log.label}
                      </span>
                    </div>

                    <div className="text-slate-200 font-sans font-semibold truncate">
                      {log.sourceTitle}
                    </div>

                    <div className="text-slate-400 text-[10px]">
                      Tokens: <span className="text-emerald-300">{log.newTokensLearned.slice(0, 3).join(', ')}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-800/80">
                      <span>Vocab: {log.vocabularySize}</span>
                      <span className="text-emerald-400 font-bold">
                        Acc: {log.accuracyBefore}% &rarr; {log.accuracyAfter}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Vocabulary Cloud Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Recent Learned N-Grams Sample
            </h3>
            <p className="text-[11px] text-slate-500">
              Sample of high-salience terms extracted from recent news stories with learned bias:
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { term: 'logical qubits', bias: 'REAL', w: 2.9 },
                { term: 'biosignatures', bias: 'REAL', w: 3.1 },
                { term: 'k2-18b exoplanet', bias: 'REAL', w: 2.8 },
                { term: 'avian influenza clade', bias: 'REAL', w: 2.6 },
                { term: 'interbank settlement', bias: 'REAL', w: 2.5 },
                { term: '6g cellular towers', bias: 'FAKE', w: 3.4 },
                { term: 'synthetic blood parasites', bias: 'FAKE', w: 3.6 },
                { term: 'deepfake audio leak', bias: 'FAKE', w: 3.2 },
                { term: 'drinking turpentine', bias: 'FAKE', w: 3.7 },
                { term: 'cloud seeding drones', bias: 'FAKE', w: 3.0 },
                { term: 'miracle moss peptide', bias: 'FAKE', w: 3.3 }
              ].map((item, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                    item.bias === 'REAL'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span>{item.term}</span>
                  <span className="opacity-60 text-[9px]">+{item.w}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Recent News Story Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Ingest & Auto-Learn Custom Story</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCustomRecentStory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Breakthrough Solid-State Battery Begins Vehicle Road Tests"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Body / Excerpt
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste the full paragraph or news wire excerpt..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Wire / Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reuters, TechCrunch"
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Technology & AI">Technology & AI</option>
                    <option value="Health & Science">Health & Science</option>
                    <option value="Finance & Economy">Finance & Economy</option>
                    <option value="Global Affairs">Global Affairs</option>
                    <option value="Space & Physics">Space & Physics</option>
                    <option value="Viral Social Hoax">Viral Social Hoax</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Verified Truth
                  </label>
                  <select
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value as PredictionLabel)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
                  >
                    <option value="REAL">REAL News</option>
                    <option value="FAKE">FAKE / Disinformation</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 leading-relaxed">
                <strong>Instant Auto-Learning:</strong> Submitting will immediately tokenize this text, compute salience scores, update model weights, and adjust the online classifier.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Learn & Update Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
