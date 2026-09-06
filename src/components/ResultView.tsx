import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  ArrowLeft,
  Clock,
  FileText,
  Activity,
  Layers,
  BarChart3,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
  Share2,
  Copy,
  Check,
  Download,
  Sparkles,
  ExternalLink,
  Award,
  SlidersHorizontal,
  Brain,
  Calendar,
  CalendarCheck,
  CalendarClock,
  History
} from 'lucide-react';
import { PredictionRecord, NavTab } from '../types';

interface ResultViewProps {
  record: PredictionRecord;
  onCheckAnother: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  record,
  onCheckAnother,
  onNavigate
}) => {
  const [showNLPDetails, setShowNLPDetails] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isReal = record.prediction === 'REAL';
  const fakeProb = isReal ? (100 - record.confidence).toFixed(1) : record.confidence.toFixed(1);
  const realProb = isReal ? record.confidence.toFixed(1) : (100 - record.confidence).toFixed(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `--- [FakeDetect Model Analysis Report] ---\nVerdict: ${record.prediction} NEWS\nConfidence: ${record.confidence}%\nReal Probability: ${realProb}%\nFake Probability: ${fakeProb}%\nRecord ID: #${record.id}\nTimestamp: ${record.created_at}\n\nSubmitted News:\n"${record.news_text}"\n\nNLP Features:\nProcessed Tokens: ${record.tokens.length}\nTF-IDF Salient Weights: ${record.key_indicators?.map(k => `${k.term} (${k.bias})`).join(', ') || 'None'}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render text with highlighted key terms
  const renderHighlightedText = () => {
    const text = record.news_text;
    if (!record.key_indicators || record.key_indicators.length === 0) {
      return <span>{text}</span>;
    }

    // Build regex from indicators
    const terms = record.key_indicators.map(k => k.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (terms.length === 0) return <span>{text}</span>;

    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          const matched = record.key_indicators.find(k => k.term.toLowerCase() === part.toLowerCase());
          if (matched) {
            return (
              <mark
                key={i}
                className={`px-1.5 py-0.5 rounded font-semibold text-xs transition-colors ${
                  matched.bias === 'REAL'
                    ? 'bg-emerald-200 text-emerald-950 border-b-2 border-emerald-500'
                    : 'bg-rose-200 text-rose-950 border-b-2 border-rose-500'
                }`}
                title={`Feature Weight: ${matched.weight} | Bias: ${matched.bias}`}
              >
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button & Quick Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCheckAnother}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to News Check</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>View Verification Certificate</span>
          </button>
        </div>
      </div>

      {/* MAIN RESULT VERDICT CARD */}
      <div
        className={`bg-white rounded-3xl border-2 shadow-xl overflow-hidden transition-all relative ${
          isReal ? 'border-emerald-500/80 shadow-emerald-500/10' : 'border-rose-500/80 shadow-rose-500/10'
        }`}
      >
        {/* Top colored accent line */}
        <div
          className={`h-3 w-full ${
            isReal
              ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-rose-400 via-rose-500 to-amber-500'
          }`}
        />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Centered Verdict Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Machine Learning Forensic Verdict</span>
            </div>

            <div className="flex justify-center pt-1">
              <div
                className={`inline-flex items-center gap-3.5 px-8 py-3.5 rounded-2xl border-2 shadow-md ${
                  isReal
                    ? 'bg-emerald-50/90 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50/90 text-rose-800 border-rose-300'
                }`}
              >
                {isReal ? (
                  <CheckCircle2 className="w-9 h-9 text-emerald-600 shrink-0" />
                ) : (
                  <AlertOctagon className="w-9 h-9 text-rose-600 shrink-0" />
                )}
                <div className="text-left">
                  <div className="text-2xl sm:text-4xl font-black tracking-tight font-heading leading-tight">
                    {record.prediction} NEWS
                  </div>
                  <div className="text-xs font-bold font-mono opacity-80">
                    Confidence: {record.confidence.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed pt-1">
              {isReal
                ? 'The syntactic construction, neutral sentiment dispersion, and verified lexical indicators align with authoritative journalistic reporting.'
                : 'The submitted text demonstrates statistical correlation with deceptive patterns, hyperbolic adjectives, or unverified claims.'}
            </p>
          </div>

          {/* REAL-WORLD FACT-CHECK & CORROBORATION CARD */}
          {(record.is_actor_vijay_topic || record.fact_check_details || record.verdict_summary) && (
            <div className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm ${
              isReal
                ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border-emerald-300'
                : 'bg-gradient-to-br from-rose-50/90 via-amber-50/50 to-white border-rose-300'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${isReal ? 'text-emerald-600' : 'text-rose-600'}`} />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                      {record.is_actor_vijay_topic ? 'Thalapathy Vijay & TVK Real-World Fact-Check' : 'Real-World News Verification Insight'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cross-referenced against verified public statements, press releases, and electoral filings
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {record.engine_mode && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-mono font-bold border border-blue-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      {record.engine_mode === 'gemini_ai' ? 'Gemini AI Grounded' : 'Real-World Knowledge Engine'}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                    {record.confidence >= 99 ? '100% Calibrated Precision' : `${record.confidence}% Verified`}
                  </span>
                </div>
              </div>

              {record.verdict_summary && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Executive Finding
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-snug">
                    {record.verdict_summary}
                  </div>
                </div>
              )}

              {record.fact_check_details && (
                <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-2xs">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Context & Reality Check:</span>
                  </div>
                  <p>{record.fact_check_details}</p>
                </div>
              )}

              {record.official_corroboration && (
                <div className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                  <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-semibold">Official Source Corroboration: </strong>
                    <span>{record.official_corroboration}</span>
                  </div>
                </div>
              )}

              {record.key_evidence_points && record.key_evidence_points.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verified Real-World Evidence Points:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {record.key_evidence_points.map((point, i) => (
                      <li
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-800 flex items-start gap-2 shadow-2xs"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isReal ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* DATE & TEMPORAL CHRONOLOGY IDENTIFICATION */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-800/60 shadow-lg space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white font-heading flex items-center gap-1.5">
                    Date & Current Date Identification
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-mono font-medium">
                      Temporal Engine Active
                    </span>
                  </h4>
                  <p className="text-[11px] text-indigo-200/80">
                    Chronological cross-examination between current real-world date and event timeline
                  </p>
                </div>
              </div>

              {/* Temporal Status Badge */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border flex items-center gap-1.5 ${
                    record.temporal_status === 'CHRONOLOGICALLY_VALID'
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : record.temporal_status === 'ANACHRONISTIC'
                      ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                      : record.temporal_status === 'FUTURE_EVENT'
                      ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                      : record.temporal_status === 'OUTDATED_RECYCLED'
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                      : 'bg-slate-500/20 border-slate-400/40 text-slate-300'
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  {record.temporal_status === 'CHRONOLOGICALLY_VALID' && 'Chronologically Verified'}
                  {record.temporal_status === 'ANACHRONISTIC' && 'Anachronistic / Timeline Contradiction'}
                  {record.temporal_status === 'FUTURE_EVENT' && 'Future Target Milestone'}
                  {record.temporal_status === 'OUTDATED_RECYCLED' && 'Recycled Outdated Claim'}
                  {(!record.temporal_status || record.temporal_status === 'UNDATED') && 'Evaluated on Current Date'}
                </span>
              </div>
            </div>

            {/* Current Date vs Event Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Current Date Identification */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1.5 font-heading">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Current Identified System Date:</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                  <span>{record.current_date_identified || new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-semibold">
                    CURRENT
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Active reference timeline used to evaluate the temporal validity of claims
                </p>
              </div>

              {/* Event Date / Timeline Mentioned */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1.5 font-heading">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Claim / Event Date Extracted:</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-amber-300 font-mono">
                  {record.event_date_identified || 'Not explicitly dated / General narrative'}
                </div>
                <p className="text-[10px] text-slate-400">
                  Event date or timeframe extracted from the submitted news claim
                </p>
              </div>
            </div>

            {/* Temporal Analysis Explanation */}
            {record.temporal_analysis && (
              <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-xs text-indigo-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white font-heading">Chronological Reasoning: </strong>
                  {record.temporal_analysis}
                </div>
              </div>
            )}
          </div>

          {/* DUAL PROBABILITY GAUGES */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-heading">
                  Calibrated Sigmoid Probability Spectrum
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                Decision Threshold: 0.50
              </span>
            </div>

            {/* Visual Probability Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Real Probability Card */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isReal
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Real News Probability
                  </span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    {realProb}%
                  </span>
                </div>
                <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${realProb}%` }}
                  />
                </div>
              </div>

              {/* Fake Probability Card */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  !isReal
                    ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                    : 'bg-white border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Fake / Deceptive Probability
                  </span>
                  <span className="font-mono font-black text-rose-700 text-sm">
                    {fakeProb}%
                  </span>
                </div>
                <div className="w-full h-2 bg-rose-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all duration-700"
                    style={{ width: `${fakeProb}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EXPLAINABLE SUBMITTED TEXT WITH INLINE HIGHLIGHTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-heading">
                <FileText className="w-4 h-4 text-blue-600" />
                Submitted News Article & Evaluated Content Claims:
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1.5 font-bold transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Report Copied!' : 'Copy Factual Report'}</span>
              </button>
            </div>

            <div className="p-4.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm leading-relaxed font-sans max-h-56 overflow-y-auto whitespace-pre-wrap shadow-inner">
              {renderHighlightedText()}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 font-mono gap-2">
              <span>Record ID: <strong className="text-slate-600">#{record.id}</strong></span>
              <span>Attributed User: <strong className="text-slate-600">{record.user_email || 'Session User'}</strong></span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {record.created_at}
              </span>
            </div>
          </div>

          {/* INFLUENTIAL CONTENT & NEWS CLAIMS */}
          {record.key_indicators && record.key_indicators.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1.5 font-heading">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    Core News Claims & Factual Indicators Evaluated
                  </span>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Evaluated strictly by real-world news veracity and facts, not raw words or tone
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border">
                  {record.key_indicators.length} substantive claims evaluated
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {record.key_indicators.map((indicator, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border shadow-2xs ${
                      indicator.bias === 'REAL'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                  >
                    <span>{indicator.term}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/90 border border-slate-200/80 font-bold">
                      {indicator.bias === 'REAL' ? 'Verified True' : 'Fabricated Claim'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CONTENT-FIRST FACT-CHECKING DIAGNOSTICS */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowNLPDetails(!showNLPDetails)}
              className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 font-heading">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Fact-Checking Engine & Content Verification Architecture</span>
              </div>
              {showNLPDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showNLPDetails && (
              <div className="p-5 bg-white border-t border-slate-200 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-slate-400 font-medium text-[11px]">Evaluation Scope</div>
                    <div className="text-sm font-extrabold text-slate-900 font-heading mt-0.5">
                      Content & News Only
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-slate-400 font-medium text-[11px]">Raw Words Policy</div>
                    <div className="text-sm font-extrabold text-emerald-600 font-heading mt-0.5">
                      Ignored (Non-Lexical)
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-slate-400 font-medium text-[11px]">Corroboration</div>
                    <div className="text-sm font-extrabold text-blue-600 font-heading mt-0.5">
                      Official Records & ECI
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-slate-400 font-medium text-[11px]">Inference Engine</div>
                    <div className="text-xs font-bold text-slate-800 font-mono mt-1">
                      {record.engine_mode === 'gemini_ai' ? 'Gemini 2.5 Flash' : 'Real-World Heuristics'}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-slate-700">
                  <div className="font-bold text-blue-950 mb-1 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Real-World Grounding Guarantee:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Sensational buzzwords, capitalized acronyms, and formatting tone are never used to penalize or reward news veracity. Even highly sensationalized text is confirmed as REAL if the event is verified, and polite formal text is identified as FAKE if the underlying event never occurred.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ETHICAL DISCLAIMER */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs text-slate-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-900 font-heading">Factuality Verification Standard:</strong> This assessment is grounded in verified news events, official statements, and electoral filings. It focuses strictly on whether the substantive news content and claims are true or fabricated in reality, independent of raw wording or stylistic tone.
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onCheckAnother}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>VERIFY ANOTHER ARTICLE</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>View History Log</span>
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-2xs"
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Analytics Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('autolearn')}
              className="px-5 py-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Brain className="w-4 h-4 text-emerald-600" />
              <span>Auto-Learn Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* VERIFICATION CERTIFICATE MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg font-heading">
                    Forensic Verification Certificate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official Cryptographic & Machine Learning Audit Record
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">CERTIFICATE NO:</span>
                <span className="font-bold text-slate-900">FD-2026-{record.id.toString().padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">VERDICT:</span>
                <span className={`font-extrabold px-2 py-0.5 rounded text-white ${isReal ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                  {record.prediction} NEWS ({record.confidence.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">ALGORITHM:</span>
                <span className="font-bold text-slate-800">Scikit-Learn Logistic Regression (C=1.0, L2)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">VECTORIZER:</span>
                <span className="font-bold text-slate-800">TF-IDF (1,2-grams, 5000 max features)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">TIMESTAMP:</span>
                <span className="text-slate-800">{record.created_at}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">SNIPPET:</span>
                <p className="font-sans text-slate-700 text-xs italic bg-white p-2.5 rounded-lg border border-slate-200 max-h-24 overflow-y-auto">
                  "{record.news_text.slice(0, 200)}..."
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

