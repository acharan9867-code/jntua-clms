import React, { useState, useEffect } from 'react';
import { DashboardStats, Book, Transaction, Reservation, User } from '../types';
import { api } from '../services/api';
import { FineWaiverModal } from '../components/FineWaiverModal';
import { QuickIssueModal } from '../components/QuickIssueModal';
import { ReturnModal } from '../components/ReturnModal';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  Receipt,
  Bookmark,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  DollarSign
} from 'lucide-react';

interface AdminDashboardProps {
  initialSubTab?: string;
  onOpenAddBook: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubTab = 'overview',
  onOpenAddBook
}) => {
  const [subTab, setSubTab] = useState<string>(initialSubTab);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [overdueTxns, setOverdueTxns] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchMember, setSearchMember] = useState('');
  const [searchBook, setSearchBook] = useState('');

  // Modals state
  const [selectedTxnForWaiver, setSelectedTxnForWaiver] = useState<Transaction | null>(null);
  const [selectedTxnForReturn, setSelectedTxnForReturn] = useState<Transaction | null>(null);
  const [isQuickIssueOpen, setIsQuickIssueOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, booksRes, membersRes, resRes, overdueRes] = await Promise.all([
        api.getDashboardStats(),
        api.getBooks(),
        api.getAllMembers({ search: searchMember }),
        api.getAllReservations(),
        api.getOverdueReport()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (booksRes.success) setBooks(booksRes.books);
      if (membersRes.success) setMembers(membersRes.members);
      if (resRes.success) setReservations(resRes.reservations);
      if (overdueRes.success) setOverdueTxns(overdueRes.overdueList);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load admin data' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [searchMember]);

  const handleAdjustFineSubmit = async (payload: any) => {
    const res = await api.adjustFine(payload);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      await fetchDashboardData();
    }
  };

  const handleQuickIssueSubmit = async (memberId: string, bookId: string) => {
    const res = await api.quickCounterIssue(memberId, bookId);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      await fetchDashboardData();
    }
  };

  const handleReturnSubmit = async (transactionId: number) => {
    const res = await api.returnBook(transactionId);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      await fetchDashboardData();
    }
  };

  const handleDeactivateBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to deactivate this book from the active catalog?')) return;
    try {
      const res = await api.deleteBook(bookId);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        await fetchDashboardData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Deactivation failed' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="ml-4 font-bold text-slate-500">
            ✕
          </button>
        </div>
      )}

      {/* Admin Sub Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Command Center & Stats', icon: LayoutDashboard },
          { id: 'inventory', label: 'Manage Inventory', icon: BookOpen },
          { id: 'fines', label: 'Fine Management & Audit', icon: Receipt },
          { id: 'members', label: 'Members Directory', icon: Users },
          { id: 'reservations', label: 'Reservation Waitlist', icon: Bookmark }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-jntua-navy text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 text-amber-400" />
              {tab.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2 pl-2">
          <button
            onClick={() => setIsQuickIssueOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-xs flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5" />
            Counter Issue
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Overview & KPI Stats */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Book Titles</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalTitles || 0}</div>
              <span className="text-[11px] text-slate-500">{stats?.totalCopies || 0} total physical copies</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Available on Shelf</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{stats?.availableCopies || 0}</div>
              <span className="text-[11px] text-emerald-700">Ready for instant lending</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Currently Borrowed</span>
              <div className="text-2xl font-bold text-blue-700 mt-1">{stats?.currentlyIssued || 0}</div>
              <span className="text-[11px] text-slate-500">Issued to students & faculty</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Overdue Items</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">{stats?.overdueCount || 0}</div>
              <span className="text-[11px] text-rose-700">Past 15 days borrowing limit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Registered Members</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {(stats?.totalStudents || 0) + (stats?.totalFaculty || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.totalStudents || 0} B.Tech Students • {stats?.totalFaculty || 0} Faculty
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Waitlist Reservations</span>
              <div className="text-xl font-bold text-amber-600 mt-1">{stats?.activeReservations || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Queued for unavailable books</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Fines Accrued</span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
                ₹{(stats?.totalFinesAccrued || 0).toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Collected: ₹{(stats?.totalFinesCollected || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Overdue Alerts Quick View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Urgent Overdue Books Notice ({overdueTxns.length})
                </h3>
                <p className="text-xs text-slate-500">Borrowers who exceeded the 15-day limit</p>
              </div>
              <button
                onClick={() => setSubTab('fines')}
                className="text-xs font-bold text-jntua-navy hover:underline"
              >
                Manage All Fines →
              </button>
            </div>

            {overdueTxns.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-700 font-semibold">
                ✓ No books are currently overdue. All borrowers are within the 15-day window.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Borrower (Roll No / ID)</th>
                      <th className="px-4 py-3">Book Title</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Days Overdue</th>
                      <th className="px-4 py-3">Calculated Fine (₹1/day)</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueTxns.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          <div className="font-bold text-slate-900">{item.user_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{item.member_id} • {item.user_role}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 line-clamp-1">{item.book_title}</td>
                        <td className="px-4 py-3 text-slate-600">{item.due_date.split(' ')[0]}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                            {item.days_overdue} days
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-rose-600">
                          ₹{Number(item.calculated_fine).toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedTxnForReturn(item)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              Process Return
                            </button>
                            <button
                              onClick={() => setSelectedTxnForWaiver(item)}
                              className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 rounded hover:bg-amber-200"
                            >
                              Waive / Adjust
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Inventory Management */}
      {subTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Book Catalog & Stock Control ({books.length} Titles)
              </h3>
              <p className="text-xs text-slate-500">Track shelf locations, copies, and active catalog status</p>
            </div>
            <button
              onClick={onOpenAddBook}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Add New Book
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Book & Author</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Shelf Location</th>
                  <th className="px-4 py-3">Available / Total</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                      <div className="text-[11px] text-slate-500">By {b.author}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{b.isbn}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-semibold text-slate-700">
                        {b.shelf_location}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${b.available_copies > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {b.available_copies} / {b.total_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">₹{b.price}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleDeactivateBook(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Deactivate Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Fine Management & Audit */}
      {subTab === 'fines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Fine Management & Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Audit Rule: Original calculated fine is never silently overwritten. Every adjustment requires a mandatory reason.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Borrower</th>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Original Fine</th>
                  <th className="px-4 py-3">Lost/Damage Fee</th>
                  <th className="px-4 py-3">Adjusted Fine</th>
                  <th className="px-4 py-3">Waiver Reason</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-900">{txn.user_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{txn.member_id}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 line-clamp-1">{txn.book_title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">
                      ₹{Number(txn.calculated_fine).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      ₹{Number(txn.lost_damaged_charge || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      {txn.adjusted_fine !== null && txn.adjusted_fine !== undefined
                        ? `₹${Number(txn.adjusted_fine).toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 max-w-xs truncate">
                      {txn.waiver_reason || '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setSelectedTxnForWaiver(txn)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        Adjust / Waive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Members Directory */}
      {subTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registered University Members ({members.length})
              </h3>
              <p className="text-xs text-slate-500">B.Tech CSE Students and Engineering Faculty</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search member name or roll no..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Member ID (Roll / Emp)</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Active Loans</th>
                  <th className="px-4 py-3">Max Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-bold text-jntua-navy">{m.member_id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{m.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        m.role === 'faculty' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.department}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{m.active_borrowed_count || 0}</span> books
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.max_books_allowed} books</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: Reservations Waitlist */}
      {subTab === 'reservations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-600" />
              University-wide Book Reservation Waitlist ({reservations.length})
            </h3>
            <p className="text-xs text-slate-500">
              Queue positions are assigned automatically. Returning a book triggers notification to Position #1.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Queue #</th>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Reserved By</th>
                  <th className="px-4 py-3">Reservation Date</th>
                  <th className="px-4 py-3">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-bold text-amber-700">#{r.queue_position}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 line-clamp-1">{r.book_title}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{r.user_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.member_id} ({r.user_role})</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.reservation_date.split(' ')[0]}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        r.status === 'ready_for_pickup'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <FineWaiverModal
        transaction={selectedTxnForWaiver}
        onClose={() => setSelectedTxnForWaiver(null)}
        onSubmitAdjustment={handleAdjustFineSubmit}
      />

      <QuickIssueModal
        isOpen={isQuickIssueOpen}
        onClose={() => setIsQuickIssueOpen(false)}
        onSubmitIssue={handleQuickIssueSubmit}
      />

      <ReturnModal
        transaction={selectedTxnForReturn}
        onClose={() => setSelectedTxnForReturn(null)}
        onSubmitReturn={handleReturnSubmit}
        onSubmitLostDamaged={async () => {}}
      />
    </div>
  );
};
