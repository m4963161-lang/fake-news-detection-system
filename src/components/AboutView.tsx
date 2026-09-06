import React from 'react';
import {
  Info,
  Layers,
  Code2,
  Cpu,
  Database,
  ShieldCheck,
  Binary,
  CheckCircle2,
  FileCode2,
  ExternalLink,
  BookOpen,
  Lock
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const techStack = [
    { name: 'Python 3.11+', role: 'Core Backend Language', bg: 'bg-slate-900 text-white' },
    { name: 'Django 5.0+', role: 'MVT Web Architecture & ORM', bg: 'bg-emerald-700 text-white' },
    { name: 'Scikit-learn', role: 'Machine Learning Models', bg: 'bg-amber-600 text-white' },
    { name: 'NLP & Tokenization', role: 'Text Preprocessing Pipeline', bg: 'bg-emerald-600 text-white' },
    { name: 'NLTK', role: 'Stopwords & Lexical Corpus', bg: 'bg-indigo-600 text-white' },
    { name: 'TF-IDF Vectorizer', role: 'N-Gram Feature Engineering', bg: 'bg-cyan-700 text-white' },
    { name: 'Django ORM & SQLite', role: 'Persistent Relational Database', bg: 'bg-slate-700 text-white' },
    { name: 'Django Admin Portal', role: 'Auditing & User Governance', bg: 'bg-blue-700 text-white' },
    { name: 'Bootstrap 5', role: 'UI Grid & Component Styling', bg: 'bg-purple-700 text-white' },
    { name: 'Chart.js / Recharts', role: 'Dynamic Telemetry Visuals', bg: 'bg-rose-600 text-white' },
    { name: 'JavaScript ES6+', role: 'Client Interactivity & Modals', bg: 'bg-yellow-600 text-slate-900' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* HERO SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Django MVT System Documentation & Technical Specs</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          DJANGO FAKE NEWS DETECTION SYSTEM
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          An enterprise-grade artificial intelligence application converted to the <strong>Django 5.0 Model-View-Template (MVT)</strong> architecture.
          By orchestrating <strong>Natural Language Processing (NLP)</strong>, <strong>TF-IDF N-Gram Vectorization</strong>, <strong>Supervised Logistic Regression</strong>, and the <strong>Django ORM</strong>, the system provides high-precision disinformation detection, empirical confidence probabilities, and robust database governance.
        </p>
      </div>

      {/* TECHNOLOGIES USED BADGES */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-600" />
          Technologies & Framework Ecosystem
        </h2>
        <p className="text-xs text-slate-500">
          Full-stack data science, machine learning, and Django web architecture
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex flex-col justify-center shadow-xs ${tech.bg}`}
            >
              <span>{tech.name}</span>
              <span className="text-[10px] font-normal opacity-80">{tech.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ARCHITECTURE FLOWCHART */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          Django MVT Architecture Pipeline
        </h2>
        <p className="text-xs text-slate-500">
          Visual representation of Django request routing, CSRF token validation, NLP transformation, Scikit-learn inference, and Django ORM persistence.
        </p>

        <div className="p-5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-inner">
          <pre>{`CLIENT / BROWSER
 │
 ▼
DJANGO URL DISPATCHER (fakenews_project/urls.py -> detector/urls.py)
 │
 ▼
DJANGO VIEW CONTROLLER (detector/views.py with @csrf_protect)
 │
 ├──► DJANGO FORM VALIDATION (detector/forms.py: NewsAnalysisForm)
 │
 ▼
NLP PREPROCESSING (utils.py: Lowercase, Regex Strip, Punctuation, Stopwords)
 │
 ▼
TF-IDF VECTORIZATION (model/tfidf_vectorizer.pkl: Sublinear TF, 5000 max features)
 │
 ▼
SCIKIT-LEARN CLASSIFIER (model/fake_news_model.pkl: LogisticRegression)
 │
 ▼
PREDICTION CALCULATION
┌───────────────┴───────────────┐
▼                               ▼
REAL NEWS (P[Real] >= 50%)    FAKE NEWS (P[Fake] > 50%)
│                               │
└───────────────┬───────────────┘
                ▼
         CONFIDENCE PROBABILITY
                │
                ▼
         DJANGO ORM MODEL (detector/models.py: Prediction.objects.create)
                │
                ▼
         SQLITE DATABASE (db.sqlite3)
                │
     ┌──────────┴──────────┐
     ▼                     ▼
DJANGO TEMPLATE VIEW   DJANGO ADMIN PORTAL (/admin/)
(result.html / history) (Superuser auditing & record review)`}</pre>
        </div>
      </div>

      {/* DJANGO CORE ARCHITECTURE HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-mono text-sm">
            M
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Model Layer (ORM)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Encapsulates the <code>Prediction</code> and <code>AuditLog</code> models. Enforces data integrity, handles schema migrations via <code>makemigrations</code>, and interacts with SQLite safely without raw SQL vulnerability.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold font-mono text-sm">
            V
          </div>
          <h3 className="font-bold text-slate-800 text-sm">View Layer (Controller)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Orchestrates incoming HTTP requests, CSRF validation, Scikit-learn feature extraction, confidence scoring, and responds with rendered Django templates or JSON REST API payloads.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold font-mono text-sm">
            T
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Template Layer (UI)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Uses Django template inheritance (<code>base.html</code>), contextual tags, and <code>&#123;% csrf_token %&#125;</code> to prevent Cross-Site Request Forgery across all POST submissions.
          </p>
        </div>
      </div>

      {/* NLP & ML DETAILED METHODOLOGY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-step NLP */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-emerald-600" />
            1. NLP Preprocessing Stages
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Lowercasing:</strong> Uniform lowercase representation avoids token casing duplication.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Regex Stripping:</strong> Removes URL links (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">http://</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">www.</code>), HTML tags and special entities.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Punctuation & Noise Removal:</strong> Removes excessive exclamation marks, question marks, and non-alphanumeric noise.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Stopwords Elimination:</strong> Removes high-frequency English particles (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">the</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">and</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">is</code>).</span>
            </li>
          </ul>
        </div>

        {/* TF-IDF & Logistic Regression */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            2. TF-IDF & Logistic Regression Math
          </h3>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>TF-IDF Vectorization:</strong> Evaluates word prominence relative to corpus frequency:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono text-xs font-semibold text-slate-800">
              TF-IDF(t, d, D) = TF(t, d) × log( |D| / (1 + DF(t, D)) )
            </div>
            <p>
              <strong>Sigmoid Probability Classification:</strong>
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono text-xs font-semibold text-slate-800">
              P(Fake | x) = 1 / (1 + e^-(w · x + b))
            </div>
          </div>
        </div>
      </div>

      {/* ETHICAL DISCLAIMER & LIMITATIONS */}
      <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-2">
        <h4 className="font-bold text-amber-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          Ethical AI Notice & Analytical Boundaries
        </h4>
        <p className="leading-relaxed">
          This system provides statistical classification based on language style, sensationalism markers, and vocabulary frequencies. It does not replace human fact-checking or journalistic verification. Users should verify critical reports across independent fact-checking registries and credible wire services.
        </p>
      </div>
    </div>
  );
};
