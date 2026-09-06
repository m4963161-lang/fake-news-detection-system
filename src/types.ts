export type PredictionLabel = 'REAL' | 'FAKE';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'suspended';
  predictionsCount: number;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  details: string;
  type: 'auth' | 'prediction' | 'model_update' | 'user_management' | 'security';
}

export interface ModelThresholdConfig {
  fakeThreshold: number; // default 0.50 (50%)
  sensitivity: 'lenient' | 'standard' | 'strict';
  minCharacterLimit: number;
  maxCharacterLimit: number;
  autoQuarantineThreshold: number; // e.g. 90%
}

export interface PredictionRecord {
  id: number;
  news_text: string;
  prediction: PredictionLabel;
  confidence: number;
  prob_real: number;
  prob_fake: number;
  created_at: string;
  category?: string;
  raw_word_count: number;
  cleaned_token_count: number;
  tokens: string[];
  key_indicators: { term: string; weight: number; bias: 'REAL' | 'FAKE' }[];
  user_email?: string;
  verdict_summary?: string;
  fact_check_details?: string;
  official_corroboration?: string;
  key_evidence_points?: string[];
  is_actor_vijay_topic?: boolean;
  engine_mode?: 'gemini_ai' | 'knowledge_nlp';
  current_date_identified?: string;
  event_date_identified?: string;
  temporal_status?: 'CHRONOLOGICALLY_VALID' | 'OUTDATED_RECYCLED' | 'FUTURE_EVENT' | 'ANACHRONISTIC' | 'UNDATED';
  temporal_analysis?: string;
}

export interface ModelMetrics {
  model_name: string;
  vectorizer: string;
  dataset_file: string;
  total_samples: number;
  train_samples: number;
  test_samples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  top_fake_indicators: string[];
  top_real_indicators: string[];
}

export interface NLPBreakdown {
  raw_character_count: number;
  raw_word_count: number;
  processed_character_count: number;
  processed_word_count: number;
  cleaned_text: string;
  tokens: string[];
  removed_stopwords_count: number;
  uppercase_ratio: number;
  key_terms: { term: string; weight: number; bias: 'REAL' | 'FAKE' }[];
}

export type NavTab = 'home' | 'result' | 'history' | 'dashboard' | 'about' | 'dataset' | 'code' | 'admin' | 'autolearn';

export interface RecentNewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  publishedAt: string;
  suggestedLabel: PredictionLabel;
  verifiedLabel?: PredictionLabel;
  confidence: number;
  isLearned: boolean;
  learnedAt?: string;
  extractedNgrams: string[];
  driftImpact: number;
}

export interface AutoLearnConfig {
  autoLearnActive: boolean;
  confidenceThreshold: number; // e.g. 75%
  autoStreamInterval: number; // in seconds (0 = manual)
  sourceCredibilityCheck: boolean;
  allowUserSubmissionsToTrain: boolean;
  retrainCycleThreshold: number; // e.g. retrain after 5 news items
}

export interface LearningLogEntry {
  id: string;
  timestamp: string;
  sourceTitle: string;
  label: PredictionLabel;
  newTokensLearned: string[];
  accuracyBefore: number;
  accuracyAfter: number;
  vocabularySize: number;
  triggerType: 'auto_stream' | 'user_prediction' | 'manual_batch' | 'admin_override';
}

export interface ActiveLearningStats {
  modelVersion: string;
  baseModelAccuracy: number;
  currentAccuracy: number;
  totalLearnedRecentNews: number;
  recentVocabularyCount: number;
  lastRetrainedAt: string;
  driftStatus: 'STABLE' | 'OPTIMAL' | 'ADAPTED';
  learningLogs: LearningLogEntry[];
}

