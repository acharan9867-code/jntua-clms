import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileBarChart,
  AlertTriangle,
  TrendingUp,
  PieChart,
  History,
  Download,
  Filter,
  Calendar
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'overdue' | 'most-borrowed' | 'categories' | 'history'>('overdue');

  const [overdueList, setOverdueList] = useState<any[]>([]);
  const [mostBorrowed, setMostBorrowed] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      if (activeReport === 'overdue') {
        const res = await api.getOverdueReport();
        if (res.success) setOverdueList(res.overdueList);
      } else if (activeReport === 'most-borrowed') {
        const res = await api.getMostBorrowedReport();
        if (res.success) setMostBorrowed(res.report);
      } else if (activeReport === 'categories') {
        const res = await api.getCategoryReport();
        if (res.success) setCategoryStats(res.report);
      } else if (activeReport === 'history') {
        const res = await api.getTransactionHistory({ status: historyStatusFilter });
        if (res.success) setHistoryList(res.history);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeReport, historyStatusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif-jntu flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-amber-600" />
            JNTUA Library Analytical Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated metrics directly computed via database queries for academic accreditation & audits
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4" />
          Print / Export Report
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'overdue', label: 'Overdue Books', icon: AlertTriangle, count: overdueList.length },
          { id: 'most-borrowed', label: 'Most Borrowed Books', icon: TrendingUp },
          { id: 'categories', label: 'Category Statistics', icon: PieChart },
          { id: 'history', label: 'Audit Log & History', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-jntua-navy text-white border-jntua-navy shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
              <div className="font-bold text-xs mt-2">{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT AREA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-2">Computing database aggregations...</p>
          </div>
        ) : (
          <>
            {/* REPORT 1: OVERDUE BOOKS */}
            {activeReport === 'overdue' && (
              <div>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Overdue Books (15-Day Rule Violations)
                  </h3>
                  <p className="text-xs text-slate-500">Fine rate: ₹1 per day after the 15-day period</p>
                </div>

                {overdueList.length === 0 ? (
                  <div className="p-10 text-center text-xs text-emerald-700 font-semibold">
                    No books are currently overdue.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                        <tr>
                          <th className="px-6 py-3">Borrower Details</th>
                          <th className="px-4 py-3">Book Title & Author</th>
                          <th className="px-4 py-3">Issue Date</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3">Days Overdue</th>
                          <th className="px-6 py-3 text-right">Calculated Fine (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overdueList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3">
                              <div className="font-bold text-slate-900">{item.user_name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {item.member_id} • {item.user_role} ({item.department})
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900 line-clamp-1">{item.book_title}</div>
                              <div className="text-[11px] text-slate-500">Shelf: {item.shelf_location}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{item.issue_date.split(' ')[0]}</td>
                            <td className="px-4 py-3 text-slate-600 font-semibold">{item.due_date.split(' ')[0]}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                                {item.days_overdue} days
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right font-mono font-bold text-rose-600 text-sm">
                              ₹{Number(item.calculated_fine).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* REPORT 2: MOST BORROWED BOOKS */}
            {activeReport === 'most-borrowed' && (
              <div>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Most Borrowed Books (Circulation Frequency)
                  </h3>
                  <p className="text-xs text-slate-500">Ranked by total historical transactions</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-4 py-3">Book Title</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Total Copies</th>
                        <th className="px-4 py-3">Shelf</th>
                        <th className="px-6 py-3 text-right">Total Borrow Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mostBorrowed.map((b, index) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-bold text-amber-700">#{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                            <div className="text-[11px] text-slate-500">By {b.author}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{b.category_name}</td>
                          <td className="px-4 py-3 text-slate-600">{b.total_copies}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{b.shelf_location}</td>
                          <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                              {b.borrow_count} issues
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REPORT 3: CATEGORY STATISTICS */}
            {activeReport === 'categories' && (
              <div>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Category-Wise Inventory & Circulation Statistics
                  </h3>
                  <p className="text-xs text-slate-500">Departmental book distribution across JNTUA curricula</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Department / Category</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Book Titles</th>
                        <th className="px-4 py-3">Total Copies</th>
                        <th className="px-4 py-3">Available Copies</th>
                        <th className="px-6 py-3 text-right">Circulation Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categoryStats.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-bold text-slate-900">{c.name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold">
                              {c.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{c.total_titles} titles</td>
                          <td className="px-4 py-3 text-slate-600">{c.total_copies} copies</td>
                          <td className="px-4 py-3 text-emerald-700 font-bold">{c.available_copies}</td>
                          <td className="px-6 py-3 text-right font-mono font-bold text-blue-900">
                            {c.total_borrows} borrows
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REPORT 4: AUDIT HISTORY */}
            {activeReport === 'history' && (
              <div>
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Comprehensive Transaction Audit History
                    </h3>
                    <p className="text-xs text-slate-500">Every issue, return, loss, or damage record</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={historyStatusFilter}
                      onChange={(e) => setHistoryStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
                    >
                      <option value="all">All Statuses</option>
                      <option value="issued">Currently Issued</option>
                      <option value="returned">Returned</option>
                      <option value="lost">Lost</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3">Txn #</th>
                        <th className="px-4 py-3">Borrower</th>
                        <th className="px-4 py-3">Book</th>
                        <th className="px-4 py-3">Issue Date</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Return Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Fine Assessed</th>
                        <th className="px-6 py-3">Adjusted By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-mono font-bold text-slate-500">#{t.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{t.user_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{t.member_id}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 line-clamp-1">{t.book_title}</td>
                          <td className="px-4 py-3 text-slate-600">{t.issue_date.split(' ')[0]}</td>
                          <td className="px-4 py-3 text-slate-600">{t.due_date.split(' ')[0]}</td>
                          <td className="px-4 py-3 text-slate-600">{t.return_date ? t.return_date.split(' ')[0] : '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              t.status === 'issued'
                                ? 'bg-blue-100 text-blue-900'
                                : t.status === 'returned'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold">
                            ₹{(Number(t.adjusted_fine ?? t.calculated_fine) + Number(t.lost_damaged_charge)).toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-slate-500 text-[11px]">
                            {t.adjusted_by_name || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
