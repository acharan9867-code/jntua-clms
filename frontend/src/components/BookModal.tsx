import React from 'react';
import { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, MapPin, Tag, ShieldCheck, Clock, Bookmark, AlertCircle, Info } from 'lucide-react';

interface BookModalProps {
  book: Book | null;
  onClose: () => void;
  onBorrow: (book: Book) => void;
  onReserve: (book: Book) => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  book,
  onClose,
  onBorrow,
  onReserve
}) => {
  const { user } = useAuth();

  if (!book) return null;

  const isAvailable = book.available_copies > 0;
  const isStudentOrFaculty = user?.role === 'student' || user?.role === 'faculty';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {book.category_name || 'Engineering'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ISBN: {book.isbn}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Book Cover */}
            <div className="w-full sm:w-44 flex-shrink-0 flex flex-col items-center">
              <div className="w-40 h-56 rounded-lg overflow-hidden border border-slate-200 shadow-md bg-slate-100">
                <img
                  src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Shelf Tag */}
              <div className="mt-3 w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-center text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Physical Location</span>
                <span className="font-mono font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {book.shelf_location}
                </span>
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 font-serif-jntu leading-snug">
                {book.title}
              </h2>
              <p className="text-sm font-medium text-slate-600 mt-1">
                By {book.author}
              </p>

              {/* Stats pill bar */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Total Stock</span>
                  <span className="text-sm font-bold text-slate-800">{book.total_copies}</span>
                </div>
                <div className={`border rounded-lg p-2 ${isAvailable ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Available</span>
                  <span className={`text-sm font-bold ${isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {book.available_copies}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">Price</span>
                  <span className="text-sm font-bold text-slate-800">₹{book.price}</span>
                </div>
              </div>

              {/* About / Syllabus Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  About This Text / Syllabus Relevance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-h-40 overflow-y-auto pr-1">
                  {book.description}
                </p>
              </div>

              {/* University Library Policy Note */}
              <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">JNTUA 15-Day Lending Rule:</p>
                  <p className="text-[11px] text-amber-800">
                    Valid for exactly 15 days from issue date. Late fine: ₹1/day after due date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {book.pending_reservations ? (
              <span className="font-medium text-amber-700">
                ⏳ {book.pending_reservations} student(s) waiting in reservation queue
              </span>
            ) : (
              <span>No current waitlist</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>

            {isStudentOrFaculty && (
              isAvailable ? (
                <button
                  onClick={() => {
                    onBorrow(book);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 rounded-lg shadow transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Issue Book (15 Days)
                </button>
              ) : (
                <button
                  onClick={() => {
                    onReserve(book);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow transition-all flex items-center gap-1.5"
                >
                  <Bookmark className="w-4 h-4" />
                  Join Reservation Waitlist
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
