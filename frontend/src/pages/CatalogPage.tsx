import React, { useState, useEffect } from 'react';
import { Book, Category } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookCard } from '../components/BookCard';
import { BookModal } from '../components/BookModal';
import { AddBookModal } from '../components/AddBookModal';
import { Search, Filter, Plus, BookOpen, Layers, RefreshCw } from 'lucide-react';

interface CatalogPageProps {
  onIssueSuccess?: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onIssueSuccess }) => {
  const { user, refreshProfile } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBooks({
        search: searchQuery,
        category: selectedCategory,
        availableOnly,
        sortBy
      });
      if (res.success) {
        setBooks(res.books);
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to load catalog' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Instant zero-latency search with immediate response
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 80);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, availableOnly, sortBy]);

  const handleBorrow = async (book: Book) => {
    if (!user) {
      alert('Please log in as a Student or Faculty to borrow books.');
      return;
    }
    try {
      const res = await api.issueBook(book.id);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: res.message });
        await fetchBooks();
        await refreshProfile();
        onIssueSuccess?.();
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Borrow failed' });
    }
  };

  const handleReserve = async (book: Book) => {
    if (!user) {
      alert('Please log in as a Student or Faculty to reserve books.');
      return;
    }
    try {
      const res = await api.createReservation(book.id);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: res.message });
        await fetchBooks();
        await refreshProfile();
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Reservation failed' });
    }
  };

  const handleAddBook = async (newBookData: any) => {
    const res = await api.createBook(newBookData);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message });
      await fetchBooks();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-sm ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-500 hover:text-slate-800 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Catalog Header & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif-jntu flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Central Library Book Repository
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Forgiving search across Title, Author, and ISBN with real-time shelf tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchBooks()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Refresh Catalog"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 shadow transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                Add New Book
              </button>
            )}
          </div>
        </div>

        {/* Search Input and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Forgiving Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Forgiving search: try 'data', 'cormen', '9780132', 'operating'..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium whitespace-nowrap">Available on Shelf Only</span>
            </label>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-amber-500 bg-slate-50"
            >
              <option value="newest">Sort: Catalog Order</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="author">Sort: Author Name</option>
              <option value="copies">Sort: Available Copies</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Subjects ({books.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.code
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.code}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {(() => {
        const query = searchQuery.trim().toLowerCase();
        const displayList = query
          ? books.filter(
              (b) =>
                b.title.toLowerCase().includes(query) ||
                b.author.toLowerCase().includes(query) ||
                b.isbn.toLowerCase().includes(query)
            )
          : books;

        if (isLoading && books.length === 0) {
          return (
            <div className="py-16 text-center">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Scanning JNTUA Library stacks...</p>
            </div>
          );
        }

        if (displayList.length === 0) {
          return (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching books found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search keywords or switching category filter. For CSE textbooks, try "Algorithms", "Database", or "Networks".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setAvailableOnly(false);
                }}
                className="mt-4 px-4 py-2 text-xs font-bold text-jntua-navy bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayList.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={(b) => setSelectedBook(b)}
                onBorrow={(b) => handleBorrow(b)}
                onReserve={(b) => handleReserve(b)}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>
        );
      })()}

      {/* Book Detail Modal */}
      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBorrow={(b) => handleBorrow(b)}
        onReserve={(b) => handleReserve(b)}
      />

      {/* Admin Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        categories={categories}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBook}
      />
    </div>
  );
};
