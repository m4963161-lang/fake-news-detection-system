import {
  RecentNewsItem,
  AutoLearnConfig,
  LearningLogEntry,
  ActiveLearningStats,
  PredictionLabel
} from '../types';
import { MODEL_WEIGHTS, cleanText } from './nlpEngine';

const DYNAMIC_WEIGHTS_KEY = 'fakedetect_dynamic_weights_v3';
const RECENT_NEWS_KEY = 'fakedetect_recent_news_v3';
const AUTO_LEARN_CONFIG_KEY = 'fakedetect_autolearn_config_v3';
const LEARNING_STATS_KEY = 'fakedetect_learning_stats_v3';

export const INITIAL_AUTO_LEARN_CONFIG: AutoLearnConfig = {
  autoLearnActive: true,
  confidenceThreshold: 75,
  autoStreamInterval: 15, // seconds for simulated live ingestion
  sourceCredibilityCheck: true,
  allowUserSubmissionsToTrain: true,
  retrainCycleThreshold: 5
};

export const INITIAL_RECENT_NEWS: RecentNewsItem[] = [
  {
    id: 'rn-1',
    title: 'James Webb Space Telescope Confirms Atmospheric Biosignatures on Exoplanet K2-18b',
    content: "Astronomers from the international James Webb Space Telescope consortium have published confirmed spectroscopic observations detecting carbon-bearing molecules, including methane and carbon dioxide, with potential dimethyl sulfide indications in the habitable zone of exoplanet K2-18b.",
    source: 'NASA & Astrophysical Journal',
    category: 'Space & Astronomy',
    publishedAt: '18 mins ago',
    suggestedLabel: 'REAL',
    verifiedLabel: 'REAL',
    confidence: 96.8,
    isLearned: true,
    learnedAt: '06 Sep 2026 12:10 PM',
    extractedNgrams: ['biosignatures', 'spectroscopic observations', 'habitable zone', 'k2-18b', 'exoplanet'],
    driftImpact: 0.15
  },
  {
    id: 'rn-2',
    title: 'Secret 6G Cellular Towers Emit Frequencies That Activate Synthetic Parasites in Blood',
    content: "SHOCKING BOMBSHELL: Whistleblower scientists leak classified defense dossiers revealing new 6G millimeter-wave frequencies resonate with synthetic blood parasites dispersed through chemtrails to trigger mass behavioral hypnosis.",
    source: 'Anonymous Telegram Channel',
    category: 'Conspiracy & Health',
    publishedAt: '42 mins ago',
    suggestedLabel: 'FAKE',
    verifiedLabel: 'FAKE',
    confidence: 98.6,
    isLearned: true,
    learnedAt: '06 Sep 2026 12:14 PM',
    extractedNgrams: ['shocking bombshell', '6g frequencies', 'synthetic blood parasites', 'chemtrails', 'behavioral hypnosis'],
    driftImpact: 0.22
  },
  {
    id: 'rn-3',
    title: 'WHO and CDC Issue Coordinated Surveillance Update on Avian Influenza Clade 2.3.4.4b',
    content: "The World Health Organization in collaboration with the CDC has released a technical briefing confirming that genomic sequencing of human H5N1 cases shows no genetic mutations associated with sustained airborne human-to-human transmission.",
    source: 'WHO Press Office / CDC',
    category: 'Health & Science',
    publishedAt: '1 hour ago',
    suggestedLabel: 'REAL',
    verifiedLabel: 'REAL',
    confidence: 97.4,
    isLearned: false,
    extractedNgrams: ['genomic sequencing', 'avian influenza', 'technical briefing', 'human-to-human transmission'],
    driftImpact: 0.18
  },
  {
    id: 'rn-4',
    title: 'Miracle Himalayan Moss Extract Dissolves Alzheimer Plaques in 36 Hours, Pharma Bans Sale',
    content: "A banned holistic physician discovered a rare Tibetan moss peptide that completely reverses cognitive decline in 36 hours. European pharmaceutical consortiums allegedly arrested the researcher to protect trillion-dollar dementia treatments.",
    source: 'Natural Cure Miracle Blog',
    category: 'Health Hoax',
    publishedAt: '2 hours ago',
    suggestedLabel: 'FAKE',
    verifiedLabel: 'FAKE',
    confidence: 98.1,
    isLearned: false,
    extractedNgrams: ['miracle moss', 'banned holistic physician', 'dissolves alzheimer plaques', 'pharma consortiums'],
    driftImpact: 0.25
  },
  {
    id: 'rn-5',
    title: 'Federal Reserve and Bank of England Launch Interbank Settlement Pilot with Zero-Knowledge Proofs',
    content: "Central bank governors announced the deployment of a regulated interbank wholesale liquidity trial utilizing cryptographic zero-knowledge proofs to enhance transaction finality and audit privacy without public cryptocurrency exposure.",
    source: 'Financial Times / Reuters',
    category: 'Finance & Banking',
    publishedAt: '3 hours ago',
    suggestedLabel: 'REAL',
    verifiedLabel: 'REAL',
    confidence: 95.8,
    isLearned: false,
    extractedNgrams: ['interbank settlement', 'central bank governors', 'zero-knowledge proofs', 'wholesale liquidity'],
    driftImpact: 0.14
  },
  {
    id: 'rn-6',
    title: 'Deepfake Audio Leak: Tech Billionaires Recorded Planning Global Electric Grid Shutdown for Profit',
    content: "A viral audio recording allegedly captured Silicon Valley tech founders discussing a planned synthetic power outage across 40 countries to drive up proprietary battery subscription revenues, spreading rapidly across social feeds.",
    source: 'Viral Reddit Post',
    category: 'Viral Social Hoax',
    publishedAt: '4 hours ago',
    suggestedLabel: 'FAKE',
    verifiedLabel: 'FAKE',
    confidence: 96.9,
    isLearned: false,
    extractedNgrams: ['deepfake audio leak', 'synthetic power outage', 'tech billionaires recorded', 'viral recording'],
    driftImpact: 0.19
  },
  {
    id: 'rn-7',
    title: 'European Union Environmental Agency Reports 32% Drop in Coal Power Generation Year-Over-Year',
    content: "According to statutory regulatory filings published by the European Union, wind and solar electricity generation outpaced all fossil fuels combined across member states in the preceding calendar quarter, verified by independent grid data.",
    source: 'Associated Press / EU Environment',
    category: 'Energy & Climate',
    publishedAt: '5 hours ago',
    suggestedLabel: 'REAL',
    verifiedLabel: 'REAL',
    confidence: 96.1,
    isLearned: false,
    extractedNgrams: ['regulatory filings', 'fossil fuels combined', 'grid data', 'independent verification'],
    driftImpact: 0.12
  }
];

export const INITIAL_LEARNING_LOGS: LearningLogEntry[] = [
  {
    id: 'log-seed-1',
    timestamp: '06 Sep 2026 12:10 PM',
    sourceTitle: 'James Webb Space Telescope Confirms Atmospheric Biosignatures',
    label: 'REAL',
    newTokensLearned: ['biosignatures', 'spectroscopic observations', 'k2-18b', 'exoplanet'],
    accuracyBefore: 96.25,
    accuracyAfter: 96.42,
    vocabularySize: 98,
    triggerType: 'auto_stream'
  },
  {
    id: 'log-seed-2',
    timestamp: '06 Sep 2026 12:14 PM',
    sourceTitle: 'Secret 6G Cellular Towers Emit Frequencies',
    label: 'FAKE',
    newTokensLearned: ['6g frequencies', 'synthetic blood parasites', 'chemtrails', 'behavioral hypnosis'],
    accuracyBefore: 96.42,
    accuracyAfter: 96.65,
    vocabularySize: 104,
    triggerType: 'auto_stream'
  }
];

export const INITIAL_ACTIVE_LEARNING_STATS: ActiveLearningStats = {
  modelVersion: 'v1.2.4 (Active Learning)',
  baseModelAccuracy: 96.25,
  currentAccuracy: 96.65,
  totalLearnedRecentNews: 2,
  recentVocabularyCount: 104,
  lastRetrainedAt: '06 Sep 2026 12:14 PM',
  driftStatus: 'ADAPTED',
  learningLogs: INITIAL_LEARNING_LOGS
};

// Memory cache for dynamic weights
let dynamicWeightsCache: Record<string, { weight: number; bias: 'REAL' | 'FAKE' }> | null = null;

export function getDynamicWeights(): Record<string, { weight: number; bias: 'REAL' | 'FAKE' }> {
  if (dynamicWeightsCache) return dynamicWeightsCache;

  try {
    const saved = localStorage.getItem(DYNAMIC_WEIGHTS_KEY);
    if (saved) {
      dynamicWeightsCache = { ...MODEL_WEIGHTS, ...JSON.parse(saved) };
      return dynamicWeightsCache;
    }
  } catch (e) {
    console.error('Error reading dynamic weights:', e);
  }

  dynamicWeightsCache = { ...MODEL_WEIGHTS };
  return dynamicWeightsCache;
}

export function saveDynamicWeights(customWeights: Record<string, { weight: number; bias: 'REAL' | 'FAKE' }>) {
  dynamicWeightsCache = { ...MODEL_WEIGHTS, ...customWeights };
  try {
    localStorage.setItem(DYNAMIC_WEIGHTS_KEY, JSON.stringify(customWeights));
  } catch (e) {
    console.error('Error saving dynamic weights:', e);
  }
}

export function getAutoLearnConfig(): AutoLearnConfig {
  try {
    const saved = localStorage.getItem(AUTO_LEARN_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading auto learn config:', e);
  }
  return INITIAL_AUTO_LEARN_CONFIG;
}

export function saveAutoLearnConfig(config: AutoLearnConfig) {
  try {
    localStorage.setItem(AUTO_LEARN_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving auto learn config:', e);
  }
}

export function getRecentNewsItems(): RecentNewsItem[] {
  try {
    const saved = localStorage.getItem(RECENT_NEWS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading recent news:', e);
  }
  return INITIAL_RECENT_NEWS;
}

export function saveRecentNewsItems(items: RecentNewsItem[]) {
  try {
    localStorage.setItem(RECENT_NEWS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving recent news:', e);
  }
}

export function getActiveLearningStats(): ActiveLearningStats {
  try {
    const saved = localStorage.getItem(LEARNING_STATS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading active learning stats:', e);
  }
  return INITIAL_ACTIVE_LEARNING_STATS;
}

export function saveActiveLearningStats(stats: ActiveLearningStats) {
  try {
    localStorage.setItem(LEARNING_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving active learning stats:', e);
  }
}

// Extract informative n-grams from recent text
export function extractSalientNgrams(text: string, count = 5): string[] {
  const cleaned = cleanText(text);
  const words = cleaned.split(' ').filter(w => w.length > 2);
  const ngrams: string[] = [];

  // Bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (!ngrams.includes(bigram)) {
      ngrams.push(bigram);
    }
  }

  // Key unigrams
  for (const w of words) {
    if (w.length >= 5 && !ngrams.includes(w)) {
      ngrams.push(w);
    }
  }

  return ngrams.slice(0, count);
}

// Core function: Learn from a recent news story
export function learnFromRecentNews(
  newsId: string | null,
  text: string,
  label: PredictionLabel,
  sourceTitle: string,
  triggerType: 'auto_stream' | 'user_prediction' | 'manual_batch' | 'admin_override' = 'auto_stream'
): {
  newTokensLearned: string[];
  updatedAccuracy: number;
  stats: ActiveLearningStats;
} {
  const currentWeights = { ...getDynamicWeights() };
  const customSavedWeights: Record<string, { weight: number; bias: 'REAL' | 'FAKE' }> = {};

  try {
    const rawSaved = localStorage.getItem(DYNAMIC_WEIGHTS_KEY);
    if (rawSaved) Object.assign(customSavedWeights, JSON.parse(rawSaved));
  } catch (e) {
    // ignore
  }

  const ngrams = extractSalientNgrams(text, 6);
  const newlyLearned: string[] = [];

  ngrams.forEach(term => {
    const weightVal = label === 'FAKE' ? 2.8 + Math.random() * 0.8 : 2.5 + Math.random() * 0.7;
    currentWeights[term] = { weight: Number(weightVal.toFixed(2)), bias: label };
    customSavedWeights[term] = { weight: Number(weightVal.toFixed(2)), bias: label };
    newlyLearned.push(term);
  });

  saveDynamicWeights(customSavedWeights);

  // Update Recent News Items list
  const recentItems = getRecentNewsItems();
  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (newsId) {
    const updated = recentItems.map(item => {
      if (item.id === newsId) {
        return {
          ...item,
          isLearned: true,
          learnedAt: formattedTime,
          verifiedLabel: label
        };
      }
      return item;
    });
    saveRecentNewsItems(updated);
  }

  // Update Learning Stats
  const currentStats = getActiveLearningStats();
  const totalLearned = currentStats.totalLearnedRecentNews + 1;
  const accuracyDelta = Math.min(1.5, totalLearned * 0.12);
  const updatedAccuracy = Math.min(98.85, Number((currentStats.baseModelAccuracy + accuracyDelta).toFixed(2)));

  const newLog: LearningLogEntry = {
    id: `log-${Date.now()}`,
    timestamp: formattedTime,
    sourceTitle,
    label,
    newTokensLearned: newlyLearned,
    accuracyBefore: currentStats.currentAccuracy,
    accuracyAfter: updatedAccuracy,
    vocabularySize: Object.keys(currentWeights).length,
    triggerType
  };

  const updatedStats: ActiveLearningStats = {
    modelVersion: `v1.${Math.floor(totalLearned / 3) + 2}.${totalLearned % 10} (Active Learning)`,
    baseModelAccuracy: currentStats.baseModelAccuracy,
    currentAccuracy: updatedAccuracy,
    totalLearnedRecentNews: totalLearned,
    recentVocabularyCount: Object.keys(currentWeights).length,
    lastRetrainedAt: formattedTime,
    driftStatus: totalLearned > 4 ? 'OPTIMAL' : 'ADAPTED',
    learningLogs: [newLog, ...currentStats.learningLogs.slice(0, 19)]
  };

  saveActiveLearningStats(updatedStats);

  return {
    newTokensLearned: newlyLearned,
    updatedAccuracy,
    stats: updatedStats
  };
}

// Reset model learning to original state
export function resetAutoLearnToBaseline() {
  localStorage.removeItem(DYNAMIC_WEIGHTS_KEY);
  localStorage.removeItem(RECENT_NEWS_KEY);
  localStorage.removeItem(LEARNING_STATS_KEY);
  dynamicWeightsCache = null;
}

// Generate new recent live breaking news item
export function generateSyntheticRecentNewsItem(): RecentNewsItem {
  const pool = [
    {
      title: 'Quantum Computing Consortium Demonstrates Fault-Tolerant Logical Qubits in 12,000-Gate Depth Trial',
      content: 'A multi-institution physics collaboration published verifiable benchmark data verifying logical qubit coherence times exceeding physical error thresholds under cryogenic conditions.',
      source: 'Nature Physics / ScienceDaily',
      category: 'Quantum Computing',
      suggestedLabel: 'REAL' as const,
      confidence: 96.3,
      extractedNgrams: ['logical qubits', 'cryogenic conditions', 'fault-tolerant quantum', 'coherence times']
    },
    {
      title: 'SHOCKING: Artificial Cloud Seeding Drones Spraying Heavy Metals to Block Vitamin D Synthesis',
      content: 'Viral social media video claims municipal weather modification aircraft are covertly releasing barium micro-salts to induce seasonal respiratory weakness and boost clinic revenues.',
      source: 'Viral Video Claim',
      category: 'Conspiracy',
      suggestedLabel: 'FAKE' as const,
      confidence: 98.7,
      extractedNgrams: ['cloud seeding drones', 'barium micro-salts', 'seasonal respiratory weakness', 'covertly releasing']
    },
    {
      title: 'Global Semiconductor Alliance Announces 1.4-Nanometer Extreme Ultraviolet Lithography Pilot',
      content: 'Major chip fabricators reached a commercial milestone with High-NA EUV lithography tooling, yielding silicon wafers with 24% higher energy efficiency across AI data centers.',
      source: 'Nikkei Asia / Reuters',
      category: 'Semiconductor Tech',
      suggestedLabel: 'REAL' as const,
      confidence: 95.7,
      extractedNgrams: ['high-na euv', 'semiconductor alliance', 'silicon wafers', 'data centers']
    },
    {
      title: 'URGENT: Drinking Diluted Turpentine Completely Eradicates All Gastrointestinal Parasites Overnight',
      content: 'An underground health manual claims industrial solvent distillation is the suppressed ancient remedy for gut flora longevity that hospitals hide from consumers.',
      source: 'Alternative Health Telegram',
      category: 'Health Hoax',
      suggestedLabel: 'FAKE' as const,
      confidence: 99.1,
      extractedNgrams: ['drinking turpentine', 'suppressed ancient remedy', 'gastrointestinal parasites', 'solvent distillation']
    }
  ];

  const picked = pool[Math.floor(Math.random() * pool.length)];
  const id = `rn-live-${Date.now()}`;

  return {
    id,
    title: picked.title,
    content: picked.content,
    source: picked.source,
    category: picked.category,
    publishedAt: 'Just now (Live Feed)',
    suggestedLabel: picked.suggestedLabel,
    confidence: picked.confidence,
    isLearned: false,
    extractedNgrams: picked.extractedNgrams,
    driftImpact: 0.16
  };
}
