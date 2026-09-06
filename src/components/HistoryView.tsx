import React, { useState, useMemo } from 'react';
import {
  History,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { PredictionRecord, PredictionLabel } from '../types';

interface HistoryViewProps {
  records: PredictionRecord[];
  onSelectRecord: (record: PredictionRecord) => void;
  onDeleteRecord: (id: number) => void;
  onClearAll: () => void;
  onGoToHome: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onGoToHome
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabel, setFilterLabel] = useState<PredictionLabel | 'ALL'>('ALL');
  const [showClearModal, setShowClearModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      const matchesSearch = item.news_text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterLabel === 'ALL' || item.prediction === filterLabel;
      return matchesSearch && matchesFilter;
    });
  }, [records, searchTerm, filterLabel]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID', 'Prediction', 'Confidence (%)', 'Date & Time', 'News Text'];
    const rows = records.map(r => [
      r.id,
      r.prediction,
      r.confidence,
      `"${r.created_at}"`,
      `"${r.news_text.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fakedetect_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 font-heading">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            Prediction History & Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review and inspect all previous classification queries persisted securely in the SQLite database.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {records.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                title="Export history records to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowClearModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search within news history archive..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline mr-1 font-heading">Filter:</span>
          <button
            onClick={() => { setFilterLabel('ALL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterLabel === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => { setFilterLabel('REAL'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterLabel === 'REAL'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Real ({records.filter(r => r.prediction === 'REAL').length})</span>
          </button>
          <button
            onClick={() => { setFilterLabel('FAKE'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterLabel === 'FAKE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fake ({records.filter(r => r.prediction === 'FAKE').length})</span>
          </button>
        </div>
      </div>

      {/* History Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {paginatedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                  <th className="py-4 px-4 w-16">ID</th>
                  <th className="py-4 px-4">News Headline / Excerpt</th>
                  <th className="py-4 px-4 w-32">Verdict</th>
                  <th className="py-4 px-4 w-44">Confidence</th>
                  <th className="py-4 px-4 w-44">Timestamp</th>
                  <th className="py-4 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {paginatedRecords.map(item => {
                  const isReal = item.prediction === 'REAL';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">
                        #{item.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 line-clamp-2 max-w-md leading-relaxed" title={item.news_text}>
                          {item.news_text}
                        </div>
                        {item.event_date_identified && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Timeline: {item.event_date_identified}
                            </span>
                            {item.temporal_status && item.temporal_status !== 'UNDATED' && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {item.temporal_status}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${
                            isReal
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isReal ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                          <span>{item.prediction}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span className={isReal ? 'text-emerald-700' : 'text-rose-700'}>
                              {item.confidence.toFixed(2)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isReal ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                        <div>{item.created_at}</div>
                        {item.user_email && (
                          <div className="text-[10px] text-blue-600 font-sans font-medium mt-0.5">
                            by {item.user_email.split('@')[0]}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectRecord(item)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-2xs"
                            title="Inspect Prediction Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(item.id)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors shadow-2xs"
                            title="Delete this record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-heading">No Prediction Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || filterLabel !== 'ALL'
                ? 'No items match your active search or filter criteria.'
                : 'You have not checked any news articles yet.'}
            </p>
            <button
              onClick={onGoToHome}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors inline-block"
            >
              Verify News Now
            </button>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredRecords.length > pageSize && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CLEAR HISTORY CONFIRMATION MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg font-heading">Confirm Clear History</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete all historical prediction records from the SQLite database? This operation cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-colors"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

