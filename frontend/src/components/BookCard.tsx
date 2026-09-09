import React from 'react';
import { Book } from '../types';
import { MapPin, BookCheck, Clock, Bookmark } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onBorrow?: (book: Book) => void;
  onReserve?: (book: Book) => void;
  isAdmin?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelect,
  onBorrow,
  onReserve,
  isAdmin = false
}) => {
  const isAvailable = book.available_copies > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Card Header with Shelf Location Tag */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
          <MapPin className="w-3 h-3 text-amber-600" />
          {book.shelf_location}
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          ISBN: {book.isbn.slice(-6)}
        </span>
      </div>

      {/* Book Cover and Title Info */}
      <div className="p-4 flex-1 flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-28 flex-shrink-0 bg-slate-100 rounded-md overflow-hidden border border-slate-200 shadow-inner relative">
          <img
            src={book.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center p-1 text-center">
              <span className="text-[10px] font-bold text-amber-300 uppercase leading-tight">
                Waitlist Only
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-50 text-blue-800 border border-blue-200 mb-1">
            {book.category_code || 'CSE'}
          </span>
          <h3
            onClick={() => onSelect(book)}
            className="font-bold text-sm text-slate-900 hover:text-blue-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
            By {book.author}
          </p>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>
      </div>

      {/* Availability Status Bar */}
      <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {book.available_copies} of {book.total_copies} available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              0 Available ({book.pending_reservations || 0} in queue)
            </span>
          )}
        </div>
        <span className="text-slate-500 font-medium text-[11px]">
          ₹{book.price}
        </span>
      </div>

      {/* Card Action Buttons */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onSelect(book)}
          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
        >
          View Details
        </button>

        {!isAdmin && (
          isAvailable ? (
            <button
              onClick={() => onBorrow?.(book)}
              className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 transition-colors flex items-center gap-1 shadow-sm"
              title="Borrow for 15 days"
            >
              <BookCheck className="w-3.5 h-3.5 text-amber-400" />
              Borrow
            </button>
          ) : (
            <button
              onClick={() => onReserve?.(book)}
              className="py-1.5 px-3 rounded-lg text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center gap-1 shadow-sm"
              title="Join reservation waitlist"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Reserve
            </button>
          )
        )}
      </div>
    </div>
  );
};
