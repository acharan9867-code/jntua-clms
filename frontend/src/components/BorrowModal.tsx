import React, { useState, useEffect } from "react";
import { Book } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  X,
  BookOpen,
  Calendar,
  User,
  Mail,
  Phone,
  Hash,
  Clock,
  ShieldCheck,
  MapPin,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface BorrowModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    bookId: number;
    name: string;
    email: string;
    admissionNumber: string;
    phone: string;
    issueDate: string;
  }) => Promise<void>;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  book,
  isOpen,
  onClose,
  onSubmit
}) => {
  const { user } = useAuth();

  const getTodayString = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [issueDate, setIssueDate] = useState(getTodayString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
        setAdmissionNumber(user.member_id && !user.member_id.startsWith("GUEST-") ? user.member_id : "");
        setPhone(user.phone || "");
      } else {
        setName("");
        setEmail("");
        setAdmissionNumber("");
        setPhone("");
      }
      setIssueDate(getTodayString());
      setError("");
    }
  }, [isOpen, user]);

  if (!isOpen || !book) return null;

  // Calculate 15 days due date
  const calculateDueDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + 15);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedAdmission = admissionNumber.trim().toUpperCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your Gmail address.");
      return;
    }

    if (!trimmedEmail.endsWith("@gmail.com")) {
      setError("Please enter a valid Gmail address (must end with @gmail.com).");
      return;
    }

    if (!trimmedAdmission) {
      setError("Please enter your student Admission / Roll Number.");
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!issueDate) {
      setError("Please select the borrowing date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        bookId: book.id,
        name: trimmedName,
        email: trimmedEmail,
        admissionNumber: trimmedAdmission,
        phone: trimmedPhone,
        issueDate
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process borrow request. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          background: "#1E293B",
          borderColor: "rgba(56,189,248,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(56,189,248,0.12)"
        }}
      >
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(30,41,59,0.8))",
            borderBottom: "1px solid rgba(56,189,248,0.18)"
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                color: "#0F172A",
                boxShadow: "0 0 16px rgba(56,189,248,0.4)"
              }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif-jntu tracking-wide">
                Student Book Borrowing Form
              </h3>
              <p className="text-[11px] text-electric">
                Enter your student details to issue this book
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Book Summary Bar */}
        <div
          className="p-3.5 mx-5 mt-4 rounded-xl flex items-center gap-3"
          style={{
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(56,189,248,0.12)"
          }}
        >
          <div className="w-10 h-14 rounded bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
            <img
              src={book.cover_image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{book.title}</h4>
            <p className="text-[11px] text-slate-400 truncate">By {book.author}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-electric">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {book.shelf_location}
              </span>
              <span>•</span>
              <span className="font-mono">ISBN: {book.isbn.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div
              className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.35)",
                color: "#FCA5A5"
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Student Name */}
          <div>
            <label className="block text-xs font-bold mb-1 flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-electric" />
              Student Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S. Charan Reddy"
              className="dark-input"
              required
            />
          </div>

          {/* 2. Gmail Address */}
          <div>
            <label className="block text-xs font-bold mb-1 flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-electric" />
                Student Gmail Address <span className="text-red-400">*</span>
              </span>
              <span className="text-[10px] text-electric font-mono">@gmail.com</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student.charan@gmail.com"
              className="dark-input"
              required
            />
          </div>

          {/* 3. Admission / Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 flex items-center gap-1.5 text-slate-300">
                <Hash className="w-3.5 h-3.5 text-electric" />
                Admission / Roll No <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="e.g. 21001A0501"
                className="dark-input font-mono uppercase"
                required
              />
            </div>

            {/* 4. Mobile Number */}
            <div>
              <label className="block text-xs font-bold mb-1 flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-electric" />
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="dark-input font-mono"
                required
              />
            </div>
          </div>

          {/* 5. Date of Borrowing */}
          <div>
            <label className="block text-xs font-bold mb-1 flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-electric" />
                Borrow Date <span className="text-red-400">*</span>
              </span>
              {issueDate && (
                <span className="text-[11px] text-amber-300 font-medium">
                  Due Date: <strong>{calculateDueDate(issueDate)}</strong>
                </span>
              )}
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="dark-input"
              required
            />
          </div>

          {/* Lending Policy Note */}
          <div
            className="p-3 rounded-xl text-xs flex items-start gap-2"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#FCD34D"
            }}
          >
            <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>JNTUA Central Library Rule:</strong> 15-day borrowing period. Late returns incur a fine of ₹1/day. Your details will be registered securely in the university database.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-ripple btn-electric px-5 py-2.5 text-xs font-bold flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  Saving & Borrowing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Confirm & Borrow Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
