import React, { useState } from 'react';
import { X, Repeat, UserCheck, BookOpen } from 'lucide-react';

interface QuickIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIssue: (memberIdentifier: string, bookIdentifier: string) => Promise<void>;
}

export const QuickIssueModal: React.FC<QuickIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmitIssue
}) => {
  if (!isOpen) return null;

  const [memberId, setMemberId] = useState('');
  const [bookIdentifier, setBookIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim() || !bookIdentifier.trim()) {
      alert('Please provide both Member Roll No/ID and Book ISBN/ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitIssue(memberId.trim(), bookIdentifier.trim());
      setMemberId('');
      setBookIdentifier('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Counter issue failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-900">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Library Circulation Counter Issue
              </h3>
              <p className="text-xs text-slate-500">15-Day lending period applied automatically</p>
            </div>
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
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Member Roll No / Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="e.g. 21001A0501 or JNTUA-FAC-101"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase tracking-wide font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Enter student hall ticket roll number or faculty employee ID.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Book ISBN / Book ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bookIdentifier}
                onChange={(e) => setBookIdentifier(e.target.value)}
                placeholder="e.g. 9780262046305 or 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Scan barcode or enter book ISBN.
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
              <strong>Rule Verification:</strong> The system will verify borrowing quotas (Student 3, Faculty 6) and current physical copy availability before confirming.
            </div>
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 rounded-lg shadow"
            >
              {isSubmitting ? 'Issuing...' : 'Confirm Issue (15 Days)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
