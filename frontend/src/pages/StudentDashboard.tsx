import React, { useState, useEffect } from 'react';
import { Transaction, Reservation } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReturnModal } from '../components/ReturnModal';
import {
  BookOpen,
  Calendar,
  AlertCircle,
  Clock,
  Bookmark,
  CheckCircle,
  Receipt,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface MemberDashboardProps {
  onNavigateCatalog: () => void;
}

export const StudentDashboard: React.FC<MemberDashboardProps> = ({ onNavigateCatalog }) => {
  const { user, stats, refreshProfile } = useAuth();

  const [activeLoans, setActiveLoans] = useState<Transaction[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTxnForReturn, setSelectedTxnForReturn] = useState<Transaction | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txData, resData] = await Promise.all([
        api.getMyTransactions(),
        api.getMyReservations()
      ]);

      if (txData.success) {
        setActiveLoans(txData.active);
        setHistory(txData.history);
      }
      if (resData.success) {
        setReservations(resData.reservations);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load dashboard data' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleReturnSubmit = async (transactionId: number) => {
    const res = await api.returnBook(transactionId);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      await loadData();
      await refreshProfile();
    }
  };

  const handleLostDamagedSubmit = async (payload: { transactionId: number; statusType: 'lost' | 'damaged'; notes: string }) => {
    const res = await api.reportLostOrDamaged(payload);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      await loadData();
      await refreshProfile();
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await api.cancelReservation(reservationId);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        await loadData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Cancellation failed' });
    }
  };

  const readyForPickupReservations = reservations.filter((r) => r.status === 'ready_for_pickup');
  const pendingReservations = reservations.filter((r) => r.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Alert */}
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

      {/* Priority Pickup Notification Banner */}
      {readyForPickupReservations.length > 0 && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-md flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                Book Available for Pickup!
              </h4>
              <p className="text-xs text-amber-950">
                A copy of <strong>"{readyForPickupReservations[0].book_title}"</strong> is now available on shelf. Please collect it from the Central Library circulation counter.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateCatalog}
            className="px-3 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-bold whitespace-nowrap hover:bg-slate-800"
          >
            Go to Catalog
          </button>
        </div>
      )}

      {/* Profile & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Borrowed Books */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Currently Borrowed</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeLoans.length}</span>
            <span className="text-xs text-slate-500">/ {user?.max_books_allowed || 3} allowed</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (activeLoans.length / (user?.max_books_allowed || 3)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 2. Overdue Books */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Overdue Items</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">
              {activeLoans.filter((l) => l.is_overdue).length}
            </span>
            <span className="text-xs text-slate-500">books past 15 days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Fine rule: ₹1 per day overdue
          </p>
        </div>

        {/* 3. Active Reservations */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Waitlist Reservations</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{reservations.length}</span>
            <span className="text-xs text-slate-500">in queue</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Auto-promotes when books returned
          </p>
        </div>

        {/* 4. Outstanding Dues */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Current Fines / Dues</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{activeLoans.reduce((sum, item) => sum + (item.live_fine || 0), 0).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">live accrued</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Payable at circulation desk
          </p>
        </div>
      </div>

      {/* Section: Currently Borrowed Books */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              Currently Borrowed Books ({activeLoans.length})
            </h3>
            <p className="text-xs text-slate-500">
              Strict 15-day borrowing rule with real-time fine calculation
            </p>
          </div>

          <button
            onClick={onNavigateCatalog}
            className="px-3 py-1.5 text-xs font-bold text-jntua-navy bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1"
          >
            Borrow New Book
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-10 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No books currently checked out</p>
            <p className="text-xs text-slate-500 mt-0.5">Explore the library repository to borrow textbooks for your semester.</p>
            <button
              onClick={onNavigateCatalog}
              className="mt-3 px-4 py-1.5 text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 rounded-lg transition-colors"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3">Book Details</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status / Countdown</th>
                  <th className="px-4 py-3">Current Fine</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={loan.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                          alt={loan.title}
                          className="w-10 h-14 object-cover rounded border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{loan.title}</div>
                          <div className="text-[11px] text-slate-500">By {loan.author}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Shelf: {loan.shelf_location} • ISBN: {loan.isbn}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600 font-medium">
                      {loan.issue_date.split(' ')[0]}
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-900">
                      {loan.due_date.split(' ')[0]}
                    </td>

                    <td className="px-4 py-4">
                      {loan.is_overdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Overdue by {loan.live_overdue_days} day(s)
                        </span>
                      ) : loan.days_remaining !== undefined && loan.days_remaining <= 3 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Due soon ({loan.days_remaining} days left)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {loan.days_remaining} days remaining
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 font-mono font-bold">
                      {loan.live_fine && loan.live_fine > 0 ? (
                        <span className="text-rose-600">₹{loan.live_fine.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-400">₹0.00</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTxnForReturn(loan)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 transition-colors shadow-xs"
                        >
                          Return / Report
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

      {/* Section: Active Reservations Waitlist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600" />
            My Book Reservations Queue ({reservations.length})
          </h3>
          <p className="text-xs text-slate-500">
            When all physical copies are checked out, students can queue up. Copies are allocated strictly by queue order.
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            You do not have any pending reservations in queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reservations.map((res) => (
              <div key={res.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-amber-300">
                    #{res.queue_position}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{res.book_title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Reserved on: {res.reservation_date.split(' ')[0]} • Shelf: {res.shelf_location || 'Library Stacks'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {res.status === 'ready_for_pickup' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
                      Ready for Pickup at Counter
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      Queue Position #{res.queue_position}
                    </span>
                  )}

                  <button
                    onClick={() => handleCancelReservation(res.id)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: Past Borrowing History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-600" />
            Borrowing History Archive ({history.length})
          </h3>
          <p className="text-xs text-slate-500">Record of previously returned, lost, or damaged books</p>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No past borrowing history recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="px-6 py-3">Book Title</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Return Date</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Fine Assessed</th>
                  <th className="px-6 py-3">Audit Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-semibold text-slate-900">
                      {h.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{h.issue_date.split(' ')[0]}</td>
                    <td className="px-4 py-3 text-slate-600">{h.return_date ? h.return_date.split(' ')[0] : '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          h.status === 'returned'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      ₹{(Number(h.adjusted_fine ?? h.calculated_fine) + Number(h.lost_damaged_charge)).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-[11px]">
                      {h.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return & Lost/Damaged Modal */}
      <ReturnModal
        transaction={selectedTxnForReturn}
        onClose={() => setSelectedTxnForReturn(null)}
        onSubmitReturn={handleReturnSubmit}
        onSubmitLostDamaged={handleLostDamagedSubmit}
      />
    </div>
  );
};
