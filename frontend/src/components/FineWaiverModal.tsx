import React, { useState } from 'react';
import { Transaction } from '../types';
import { X, DollarSign, ShieldAlert, Check } from 'lucide-react';

interface FineWaiverModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSubmitAdjustment: (payload: {
    transactionId: number;
    adjustedFine: number;
    waiverReason: string;
    totalPaid: number;
  }) => Promise<void>;
}

export const FineWaiverModal: React.FC<FineWaiverModalProps> = ({
  transaction,
  onClose,
  onSubmitAdjustment
}) => {
  if (!transaction) return null;

  const originalFine = Number(transaction.calculated_fine || 0);
  const currentLostFee = Number(transaction.lost_damaged_charge || 0);
  const initialAdjusted = transaction.adjusted_fine !== null && transaction.adjusted_fine !== undefined
    ? Number(transaction.adjusted_fine)
    : originalFine;

  const [adjustedFine, setAdjustedFine] = useState<number>(initialAdjusted);
  const [waiverReason, setWaiverReason] = useState<string>(transaction.waiver_reason || '');
  const [totalPaid, setTotalPaid] = useState<number>(Number(transaction.total_paid || 0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverReason.trim()) {
      alert('An audit reason is required when adjusting or waiving library fines.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitAdjustment({
        transactionId: transaction.id,
        adjustedFine: Number(adjustedFine),
        waiverReason: waiverReason.trim(),
        totalPaid: Number(totalPaid)
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Fine adjustment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullWaiver = () => {
    setAdjustedFine(0);
    setWaiverReason('Authorized by Librarian: Approved medical/exam leave waiver.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Admin Fine Adjustment & Waiver
            </h3>
            <p className="text-xs text-slate-500">
              Audit Record for Transaction #{transaction.id}
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
          <div className="p-6 space-y-4 text-xs">
            {/* Borrower & Book context */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-semibold text-slate-800">{transaction.user_name || transaction.member_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Book:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{transaction.book_title || transaction.title}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Original Calculated Late Fine:</span>
                <span className="font-bold text-rose-600 font-mono">₹{originalFine.toFixed(2)}</span>
              </div>
              {currentLostFee > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Lost/Damaged Penalty:</span>
                  <span className="font-bold text-amber-600 font-mono">₹{currentLostFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Quick full waiver button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFullWaiver}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold transition-colors"
              >
                Set Full 100% Waiver (₹0)
              </button>
            </div>

            {/* Adjusted Fine Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Adjusted Fine Amount (₹)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={adjustedFine}
                onChange={(e) => setAdjustedFine(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Original fine of ₹{originalFine.toFixed(2)} remains stored in audit log.
              </span>
            </div>

            {/* Total Paid Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Amount Collected at Counter (₹)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={totalPaid}
                onChange={(e) => setTotalPaid(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Mandatory Reason Textarea */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mandatory Reason for Adjustment / Waiver <span className="text-red-500">*</span>
              </label>
              <textarea
                value={waiverReason}
                onChange={(e) => setWaiverReason(e.target.value)}
                placeholder="e.g. Approved medical leave certificate submitted / Authorized by Principal"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 rounded-lg shadow flex items-center gap-1"
            >
              <Check className="w-4 h-4 text-amber-400" />
              {isSubmitting ? 'Saving...' : 'Save Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
