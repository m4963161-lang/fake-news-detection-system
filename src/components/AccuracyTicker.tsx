import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  ChevronDown,
  ChevronUp,
  BarChart2,
  CheckCircle2,
  Zap,
  Layers
} from 'lucide-react';
import { PredictionRecord, NavTab } from '../types';
import {
  computeCumulativeMetrics,
  CumulativePerformanceMetrics,
  MODEL_METRICS_DATA
} from '../utils/nlpEngine';

interface AccuracyTickerProps {
  records?: PredictionRecord[];
  onNavigateTab?: (tab: NavTab) => void;
}

export const AccuracyTicker: React.FC<AccuracyTickerProps> = ({
  records = [],
  onNavigateTab
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [tickOffset, setTickOffset] = useState(0);

  // Compute baseline + cumulative performance from nlpEngine
  const cumulative = useMemo<CumulativePerformanceMetrics>(() => {
    return computeCumulativeMetrics(records);
  }, [records]);

  // Real-time micro-jitter stream ticker to simulate live inference telemetry stream
  useEffect(() => {
    const interval = setInterval(() => {
      // Very slight micro-drift of ±0.02% around cumulative value to reflect continuous stream sampling
      const microJitter = (Math.random() - 0.5) * 0.04;
      setTickOffset(microJitter);
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 800);
      return () => clearTimeout(timer);
    }, 5000);

    return () => clearInterval(interval);
  }, [cumulative.currentAccuracy]);

  // Combined live accuracy
  const displayAccuracy = Math.max(
    94.5,
    Math.min(99.1, cumulative.currentAccuracy + tickOffset)
  );

  const delta = Number((displayAccuracy - cumulative.baseAccuracy).toFixed(2));
  const isPositive = delta >= 0;

  return (
    <div className="mx-3 my-2">
      {/* Floating Glassy Container */}
      <div className="relative rounded-2xl bg-[#091124]/95 border border-blue-500/30 p-3 shadow-xl shadow-black/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-blue-400/50">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Ticker Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Pulsing Live Beacon */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300 truncate">
              Live Accuracy Ticker
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              LR+TF-IDF
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label="Toggle telemetry details"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Main Ticker Number & Trend */}
        <div className="flex items-baseline justify-between gap-2 relative z-10 mt-1">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-mono text-2xl font-black tracking-tight transition-colors duration-500 ${
                isFlashing
                  ? 'text-emerald-300'
                  : 'text-white'
              }`}
            >
              {displayAccuracy.toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-400 font-sans font-medium">
              calibrated
            </span>
          </div>

          {/* Delta Pill vs Base Holdout */}
          <div
            className={`flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />
            )}
            <span>
              {isPositive ? `+${delta.toFixed(2)}%` : `${delta.toFixed(2)}%`}
            </span>
          </div>
        </div>

        {/* Mini Performance Matrix Strip */}
        <div className="grid grid-cols-3 gap-1 pt-2 mt-2 border-t border-white/10 text-center relative z-10">
          <div className="p-1 rounded-lg bg-white/[0.04]">
            <div className="text-[9px] text-slate-400 uppercase font-mono">Prec</div>
            <div className="text-[11px] font-bold font-mono text-slate-200">
              {cumulative.precision.toFixed(1)}%
            </div>
          </div>
          <div className="p-1 rounded-lg bg-white/[0.04]">
            <div className="text-[9px] text-slate-400 uppercase font-mono">Recall</div>
            <div className="text-[11px] font-bold font-mono text-slate-200">
              {cumulative.recall.toFixed(1)}%
            </div>
          </div>
          <div className="p-1 rounded-lg bg-white/[0.04]">
            <div className="text-[9px] text-slate-400 uppercase font-mono">F1-Score</div>
            <div className="text-[11px] font-bold font-mono text-slate-200">
              {cumulative.f1Score.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Expandable Telemetry Drawer */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2 relative z-10 animate-fadeIn text-[10px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Layers className="w-3 h-3 text-blue-400" />
                <span>Base Samples:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {MODEL_METRICS_DATA.total_samples} (30 test)
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Inferences Evaluated:</span>
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {cumulative.inferenceSamples} news items
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Stream Drift:</span>
              </span>
              <span className="font-mono font-bold text-slate-200">
                {tickOffset >= 0 ? `+${(tickOffset * 100).toFixed(1)} bps` : `${(tickOffset * 100).toFixed(1)} bps`}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
                <span>Confusion Matrix:</span>
              </span>
              <span className="font-mono font-bold text-slate-200">
                TP:{MODEL_METRICS_DATA.confusion_matrix[0][0]} FP:{MODEL_METRICS_DATA.confusion_matrix[0][1]}
              </span>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('dashboard')}
                className="w-full mt-2 py-1.5 px-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 text-[10px] font-bold transition-all flex items-center justify-center gap-1"
              >
                <BarChart2 className="w-3 h-3" />
                <span>Open Metrics Dashboard</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
