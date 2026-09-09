import React, { useState } from 'react';
import { Transaction } from '../types';
import { X, Calendar, AlertTriangle, CheckCircle, ShieldAlert, DollarSign } from 'lucide-react';

interface ReturnModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSubmitReturn: (transactionId: number) => Promise<void>;
  onSubmitLostDamaged: (payload: { transactionId: number; statusType: 'lost' | 'damaged'; notes: string }) => Promise<void>;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  transaction,
  onClose,
  onSubmitReturn,
  onSubmitLostDamaged
}) => {
  if (!transaction) return null;

  const [mode, setMode] = useState<'return' | 'lost' | 'damaged'>('return');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic date calculations
  const today = new Date();
  const dueDate = new Date(transaction.due_date);
  const issueDate = new Date(transaction.issue_date);

  const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const diffDays = Math.floor((todayMidnight - dueMidnight) / (1000 * 60 * 60 * 24));
  const overdueDays = Math.max(0, diffDays);
  const lateFine = overdueDays * 1; // ₹1/day
  const lostDamagedFee = 300;
  const totalPayable = mode === 'return' ? lateFine : (lostDamagedFee + lateFine);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'return') {
        await onSubmitReturn(transaction.id);
      } else {
        await onSubmitLostDamaged({
          transactionId: transaction.id,
          statusType: mode,
          notes: notes.trim() || `Reported ${mode} by user/librarian.`
        });
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Process Return / Status Update
            </h3>
            <p className="text-xs text-slate-500">
              Transaction #{transaction.id} • {transaction.book_title || transaction.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Timeline Breakdown */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">Issue Date (Day 1):</span>
                <span className="font-semibold text-slate-800">{transaction.issue_date.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Due Date (+15 Days):</span>
                <span className="font-semibold text-slate-800">{transaction.due_date.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Return / Report Date:</span>
                <span className="font-semibold text-slate-800">{today.toISOString().split('T')[0]}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Overdue Duration:</span>
                <span className={`font-bold ${overdueDays > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {overdueDays > 0 ? `${overdueDays} day(s) late` : 'Within 15 days (On time)'}
                </span>
              </div>
            </div>

            {/* Action Mode Radio Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Return Condition
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('return')}
                  className={`p-3 rounded-lg border text-center text-xs font-semibold transition-all ${
                    mode === 'return'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  Regular Return
                </button>

                <button
                  type="button"
                  onClick={() => setMode('lost')}
                  className={`p-3 rounded-lg border text-center text-xs font-semibold transition-all ${
                    mode === 'lost'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                  Report Lost
                </button>

                <button
                  type="button"
                  onClick={() => setMode('damaged')}
                  className={`p-3 rounded-lg border text-center text-xs font-semibold transition-all ${
                    mode === 'damaged'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  Report Damaged
                </button>
              </div>
            </div>

            {/* Financial Penalty Breakdown Box */}
            <div className="p-4 rounded-xl border bg-slate-900 text-white space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Overdue Fine (₹1 × {overdueDays} days):</span>
                <span className="font-mono text-sm font-semibold">₹{lateFine.toFixed(2)}</span>
              </div>

              {mode !== 'return' && (
                <div className="flex justify-between items-center text-amber-400">
                  <span>Lost/Damaged Replacement Fee:</span>
                  <span className="font-mono text-sm font-semibold">+ ₹{lostDamagedFee.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-bold text-white">
                <span>Total Amount Payable:</span>
                <span className="text-amber-400 font-mono text-base">₹{totalPayable.toFixed(2)}</span>
              </div>

              <p className="text-[11px] text-slate-400 italic pt-1">
                {mode === 'return'
                  ? overdueDays === 0
                    ? 'Returned on or before due date. Fine = ₹0.'
                    : `Returned ${overdueDays} days after due date. Fine calculated as ₹1 per overdue day.`
                  : `JNTUA Rule: Lost/Damaged book charges ₹300 fixed penalty plus ₹${lateFine} late fine.`}
              </p>
            </div>

            {/* Optional Notes for Lost/Damaged */}
            {mode !== 'return' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason / Condition Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pages torn during semester lab / reported missing by student"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow transition-colors flex items-center gap-1.5 ${
                mode === 'return'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? 'Processing...' : `Confirm ${mode === 'return' ? 'Book Return' : mode.toUpperCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
