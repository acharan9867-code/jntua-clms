import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { X, BookPlus, Send, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props { onClose: () => void; onSuccess: () => void; }

export const BookRequestModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: "", author: "", isbn: "", publisher: "", edition: "",
    year_published: "", category_id: "", department: "",
    reason: "", priority: "normal", copies_requested: "2", estimated_price: ""
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.getCategories?.().then((r: any) => setCategories(r.categories || [])).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.reason) {
      setError("Title, author and reason are required."); return;
    }
    setIsLoading(true); setError("");
    try {
      const res = await api.submitBookRequest({
        ...form,
        year_published: form.year_published ? parseInt(form.year_published) : undefined,
        category_id: form.category_id ? parseInt(form.category_id) : undefined,
        copies_requested: parseInt(form.copies_requested) || 2,
        estimated_price: form.estimated_price ? parseFloat(form.estimated_price) : undefined
      });
      setSuccess(res.message);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally { setIsLoading(false); }
  };

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none bg-white transition-all";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-jntua-navy to-blue-800 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm">Request a New Book</h3>
              <p className="text-[10px] text-blue-200">Submit for librarian approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {error && <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}
          {success && <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Required */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Required Details</p>
              <div>
                <label className={labelClass}>Book Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Design Patterns by Gang of Four" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Author(s) *</label>
                <input value={form.author} onChange={e => set("author", e.target.value)} placeholder="e.g. Erich Gamma, Richard Helm" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Reason for Request *</label>
                <textarea value={form.reason} onChange={e => set("reason", e.target.value)}
                  placeholder="Why is this book needed? (e.g. prescribed for 5th sem DBMS, not available in current catalog)"
                  rows={3} className={inputClass + " resize-none"} required />
              </div>
            </div>

            {/* Optional Details */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Book Details (Optional but helpful)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>ISBN</label>
                  <input value={form.isbn} onChange={e => set("isbn", e.target.value)} placeholder="978-..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Edition</label>
                  <input value={form.edition} onChange={e => set("edition", e.target.value)} placeholder="e.g. 3rd Edition" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Publisher</label>
                  <input value={form.publisher} onChange={e => set("publisher", e.target.value)} placeholder="e.g. Pearson" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Year Published</label>
                  <input type="number" value={form.year_published} onChange={e => set("year_published", e.target.value)} placeholder="e.g. 2022" className={inputClass} min="1900" max="2030" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Department</label>
                  <input value={form.department} onChange={e => set("department", e.target.value)} placeholder="e.g. CSE, ECE, MECH" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={form.category_id} onChange={e => set("category_id", e.target.value)} className={inputClass}>
                    <option value="">Select category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Copies Needed</label>
                  <input type="number" value={form.copies_requested} onChange={e => set("copies_requested", e.target.value)} min="1" max="20" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Estimated Price (₹)</label>
                  <input type="number" value={form.estimated_price} onChange={e => set("estimated_price", e.target.value)} placeholder="e.g. 650" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <div className="flex gap-2">
                  {["low","normal","high","urgent"].map(p => (
                    <button type="button" key={p} onClick={() => set("priority", p)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all capitalize ${form.priority === p
                        ? p === "urgent" ? "bg-red-600 text-white border-red-600"
                          : p === "high" ? "bg-amber-500 text-white border-amber-500"
                          : p === "normal" ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-400 text-white border-slate-400"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-ripple w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-jntua-navy to-blue-700 hover:from-blue-900 transition-all flex items-center justify-center gap-2">
              {isLoading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting...</span>
                : <><Send className="w-4 h-4"/>Submit Request to Librarian</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
