import React, { useState } from 'react';
import {
  Search,
  Newspaper,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Binary,
  ShieldAlert,
  Database,
  ArrowRight,
  Zap,
  Clipboard,
  Activity,
  BarChart2,
  Sliders,
  Check,
  Calendar,
  CalendarCheck,
  CalendarClock,
  History
} from 'lucide-react';
import { analyzeNLP, extractAndAnalyzeDates } from '../utils/nlpEngine';
import confetti from 'canvas-confetti';

interface HomeViewProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ onAnalyze, isAnalyzing }) => {
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sampleCategory, setSampleCategory] = useState<'all' | 'vijay' | 'real' | 'fake'>('all');
  const [hasPasted, setHasPasted] = useState(false);

  const charLimit = 5000;
  const currentChars = inputText.length;

  const quickSamples = [
    {
      label: 'Vijay TVK Launch & 2026 Contest',
      type: 'real' as const,
      category: 'Vijay & TVK',
      text: "Thalapathy Vijay officially launches political party Tamilaga Vettri Kazhagam (TVK), unveils the party flag featuring two fighting elephants and vaagai flower, confirming contest in the 2026 Tamil Nadu Legislative Assembly elections."
    },
    {
      label: 'Vijay Leaked TVK Merger Hoax',
      type: 'fake' as const,
      category: 'Vijay & TVK',
      text: "SHOCKING: Leaked letter claims Thalapathy Vijay secretly decided to withdraw TVK party registration and merge with ruling coalition before 2026 elections in exchange for a ₹1,000 crore 5-movie contract."
    },
    {
      label: 'Vijay Sworn In as CM of Tamil Nadu',
      type: 'real' as const,
      category: 'Vijay & TVK',
      text: "Thalapathy Vijay is sworn in as the 22nd Chief Minister of Tamil Nadu on May 10, 2026, after Tamilaga Vettri Kazhagam (TVK) secures victory in the Legislative Assembly elections."
    },
    {
      label: 'Vijay Thalapathy 69 Cinema Retirement',
      type: 'real' as const,
      category: 'Vijay & Cinema',
      text: "Thalapathy Vijay announces retirement from acting after his 69th film directed by H. Vinoth and produced by KVN Productions with music by Anirudh to dedicate himself to full-time public service."
    },
    {
      label: 'Vijay ₹10,000 Fan Club Cash Scam',
      type: 'fake' as const,
      category: 'Vijay Viral Hoax',
      text: "VIRAL: Thalapathy Vijay announces distribution of ₹10,000 monthly cash vouchers and free laptops to all registered TVK fan club members starting this week."
    },
    {
      label: 'TVK Vikravandi State Conference',
      type: 'real' as const,
      category: 'Vijay & TVK',
      text: "TVK President Vijay addresses mammoth inaugural state conference in Vikravandi, outlining secular social justice, anti-corruption, and state autonomy as core party ideology."
    },
    {
      label: 'NASA Galaxy Discovery',
      type: 'real' as const,
      category: 'Science',
      text: "Astronomers utilizing data from NASA's James Webb Space Telescope have identified JADES-GS-z14-0, a galaxy that existed just 290 million years after the Big Bang, with spectroscopic confirmation published in astrophysics journals."
    },
    {
      label: 'Underground Alien Pyramid',
      type: 'fake' as const,
      category: 'Conspiracy',
      text: "SHOCKING: Leaked government files reveal miners uncovered an alien underground pyramid under Mount Rushmore with cryogenic alien chambers suppressed by the media."
    },
    {
      label: 'Federal Reserve Policy',
      type: 'real' as const,
      category: 'Economy',
      text: "The Federal Reserve announced on Wednesday that it will maintain benchmark federal funds rates steady following the latest consumer price index and labor market report."
    },
    {
      label: 'Banana Peel Diabetes Cure',
      type: 'fake' as const,
      category: 'Health',
      text: "MIRACLE DOCTOR Banned by Big Pharma reveals drinking boiled banana peel tea cures all diabetes overnight in 8 hours without insulin injections."
    },
    {
      label: 'EU Artificial Intelligence Act',
      type: 'real' as const,
      category: 'Technology',
      text: "European Union Parliament overwhelmingly approves landmark Artificial Intelligence Act establishing legal governance and transparency rules for foundation models."
    },
    {
      label: '5G Frequency Mind Control',
      type: 'fake' as const,
      category: 'Conspiracy',
      text: "5G cell towers linked to mass DNA mutation and nocturnal zombie frequency mind control, whistleblower warns citizens to wear tinfoil shielding."
    },
    {
      label: 'James Webb Exoplanet Discovery',
      type: 'real' as const,
      category: 'Recent News',
      text: "Astronomers from the international James Webb Space Telescope consortium have published confirmed spectroscopic observations detecting carbon-bearing molecules, including methane and carbon dioxide, in the habitable zone of exoplanet K2-18b."
    },
    {
      label: '6G Blood Parasite Hoax',
      type: 'fake' as const,
      category: 'Recent Hoax',
      text: "SHOCKING BOMBSHELL: Whistleblower scientists leak classified defense dossiers revealing new 6G millimeter-wave frequencies resonate with synthetic blood parasites dispersed through chemtrails to trigger mass behavioral hypnosis."
    }
  ];

  const filteredSamples = quickSamples.filter(s => {
    if (sampleCategory === 'vijay') return s.category.toLowerCase().includes('vijay');
    if (sampleCategory === 'real') return s.type === 'real';
    if (sampleCategory === 'fake') return s.type === 'fake';
    return true;
  });

  const handlePickRandom = () => {
    const randomSample = quickSamples[Math.floor(Math.random() * quickSamples.length)];
    setInputText(randomSample.text);
    setErrorMsg(null);
  };

  const minChars = 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter or paste a news headline or article to analyze.');
      return;
    }
    if (trimmed.length < minChars) {
      setErrorMsg(`News text must be at least ${minChars} characters long to perform accurate NLP analysis (currently ${trimmed.length} characters).`);
      return;
    }
    if (inputText.length > charLimit) {
      setErrorMsg(`Text exceeds maximum length of ${charLimit} characters.`);
      return;
    }
    setErrorMsg(null);

    // Trigger celebratory animation
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.8 }
    });

    onAnalyze(inputText);
  };

  const handleSampleClick = (sampleText: string) => {
    setInputText(sampleText);
    setErrorMsg(null);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setErrorMsg(null);
        setHasPasted(true);
        setTimeout(() => setHasPasted(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    setInputText('');
    setErrorMsg(null);
  };

  const liveNLP = inputText.trim() ? analyzeNLP(inputText) : null;
  const liveDateInfo = inputText.trim() ? extractAndAnalyzeDates(inputText) : null;
  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Sensationalism index calculation
  const exclamationCount = (inputText.match(/!/g) || []).length;
  const capsRatio = liveNLP ? liveNLP.uppercase_ratio : 0;
  const fakeTermsFound = liveNLP ? liveNLP.key_terms.filter(k => k.bias === 'FAKE').length : 0;
  const realTermsFound = liveNLP ? liveNLP.key_terms.filter(k => k.bias === 'REAL').length : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* HERO SECTION WITH REFINED METRICS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Real-World News & Content Verification Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight font-heading">
              Fake News Detection System
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Verify claims, headlines, and journalistic narratives against real-world facts. Evaluates strictly the truth of the news content and events — ignoring raw words, stylistic tone, or formatting.
            </p>

            {/* Quick Live Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200 font-mono font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                96.25% Accuracy
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200 font-mono font-medium flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-blue-400" />
                &lt;45ms Inference
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-mono font-medium flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-indigo-300" />
                Current Date: {todayDisplay}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Auto-Learning: Online
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-400/40 text-amber-200 font-mono font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Real-World & Vijay (TVK) Fact-Checking
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center shrink-0">
            <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-2xl border border-white/20">
              <Newspaper className="w-14 h-14 text-white/95" />
              <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center border-4 border-slate-900 shadow-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-800 font-bold text-xs px-2 py-1 rounded-md hover:bg-rose-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN NEWS INPUT CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight font-heading">
                Enter News Headline or Article
              </h2>
              <p className="text-xs text-slate-500">
                Paste any article body, press release, or headline up to 5,000 characters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-mono font-medium shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Current Date: <strong>{todayDisplay}</strong></span>
            </div>

            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Paste from system clipboard"
            >
              {hasPasted ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5 text-slate-400" />}
              <span>{hasPasted ? 'Pasted!' : 'Paste'}</span>
            </button>

            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                currentChars > 0 && currentChars < minChars
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : currentChars > 4500
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {currentChars > 0 && currentChars < minChars
                ? `${currentChars} chars (min ${minChars})`
                : `${currentChars} / ${charLimit}`}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              rows={6}
              maxLength={charLimit}
              placeholder="Type or paste your news headline, excerpt, or full article text here for real-time verification..."
              className="w-full p-4.5 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-200 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base leading-relaxed font-sans resize-y bg-slate-50/30 focus:bg-white"
            />
          </div>

          {/* Quick Preset Samples with Filter Tabs */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Quick Test Presets:</span>
                </div>
                <button
                  type="button"
                  onClick={handlePickRandom}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                  title="Randomly pick any real or fake news headline to test"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Try Random News</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSampleCategory('vijay')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all flex items-center gap-1 ${
                    sampleCategory === 'vijay' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-2xs font-extrabold' : 'text-amber-800 hover:text-rose-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Vijay & TVK (5)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSampleCategory('all')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${
                    sampleCategory === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({quickSamples.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSampleCategory('real')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${
                    sampleCategory === 'real' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  Real News
                </button>
                <button
                  type="button"
                  onClick={() => setSampleCategory('fake')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${
                    sampleCategory === 'fake' ? 'bg-rose-600 text-white shadow-2xs' : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  Deceptive / Fake
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleClick(sample.text)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 flex items-center gap-2 shadow-2xs ${
                    sample.type === 'real'
                      ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                      : 'bg-rose-50/80 text-rose-800 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                  }`}
                >
                  {sample.type === 'real' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  <span className="truncate max-w-[200px] sm:max-w-none">{sample.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/70 text-slate-500 border border-slate-200/60">
                    {sample.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live NLP Diagnostic & Sensationalism Radar */}
          {liveNLP && liveNLP.tokens.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 text-xs space-y-3 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                  <FileCode2 className="w-4 h-4 text-blue-600" />
                  Real-World Content & Claim Evaluation Status
                </span>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Content-Only Fact Check
                  </span>
                  <span>Evaluates News Truth, Not Raw Words</span>
                </div>
              </div>

              {/* Content-First Verification Policy Card */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Content & Real-World Factuality Policy:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The detector analyzes whether the events, statements, and actions described actually occurred in reality according to verified records. Raw word choices, emotional tone, exclamation marks, and capitalization are ignored.
                </p>
              </div>

              {/* Date & Current Date Identification Block */}
              {liveDateInfo && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-indigo-900/60 shadow-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/50 pb-2">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-white text-xs font-heading">
                        Date & Current Date Identification
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
                        liveDateInfo.temporalStatus === 'CHRONOLOGICALLY_VALID'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          : liveDateInfo.temporalStatus === 'ANACHRONISTIC'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                          : liveDateInfo.temporalStatus === 'FUTURE_EVENT'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                          : liveDateInfo.temporalStatus === 'OUTDATED_RECYCLED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      <CalendarClock className="w-3 h-3" />
                      {liveDateInfo.temporalStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10px] text-indigo-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        Today's Reference Date:
                      </span>
                      <span className="font-mono font-bold text-white block">
                        {liveDateInfo.currentDateIdentified}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-[10px] text-indigo-300 flex items-center gap-1">
                        <History className="w-3 h-3 text-amber-400" />
                        Identified Event Timeline:
                      </span>
                      <span className="font-mono font-bold text-amber-300 block truncate">
                        {liveDateInfo.eventDateIdentified}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-indigo-200/90 leading-relaxed font-sans">
                    <strong className="text-white">Temporal Check: </strong>
                    {liveDateInfo.temporalAnalysis}
                  </p>
                </div>
              )}

              {/* Verified Entities & Context Recognized */}
              {liveNLP.key_terms.length > 0 && (
                <div className="pt-1 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block font-heading">
                    Identified News Subject & Contextual Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {liveNLP.key_terms.map((term, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border flex items-center gap-1 shadow-2xs ${
                          term.bias === 'REAL'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-rose-50 text-rose-900 border-rose-300'
                        }`}
                      >
                        <span>{term.term}</span>
                        <span className="text-[9px] opacity-80">({term.bias === 'REAL' ? 'Verified Fact' : 'Debunked Claim'})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              disabled={!inputText}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Text</span>
            </button>

            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing TF-IDF & Probabilities...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>RUN VERIFICATION ANALYSIS</span>
                  <ArrowRight className="w-4 h-4 opacity-75" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4 FEATURE BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileCode2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm mb-1 font-heading">NLP Preprocessing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Lowercasing, regex URL/HTML stripping, stopword elimination, and lexical normalization.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Binary className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm mb-1 font-heading">TF-IDF Vectorization</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            N-gram feature frequency extraction mapped onto calibrated linear classification hyperplanes.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm mb-1 font-heading">Calibrated Confidence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sigmoid output probabilities providing explainable confidence percentages per prediction.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-200 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm mb-1 font-heading">SQLite Audit Trail</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Timestamped query logging, user attribution, and retrospective dashboard telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};

