import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings, Clock, Save, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [settings, setSettings] = useState<Record<string, { value: string; description: string }>>({});
  const [timingsInput, setTimingsInput] = useState('');
  const [borrowDaysInput, setBorrowDaysInput] = useState('15');
  const [fineRateInput, setFineRateInput] = useState('1');
  const [lostFeeInput, setLostFeeInput] = useState('300');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
        setTimingsInput(res.settings['library_timings']?.value || '');
        setBorrowDaysInput(res.settings['borrowing_period_days']?.value || '15');
        setFineRateInput(res.settings['fine_rate_per_day']?.value || '1');
        setLostFeeInput(res.settings['lost_damaged_charge']?.value || '300');
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key_name: string, value: string) => {
    if (!isAdmin) {
      alert('Only library administrators can alter institutional settings.');
      return;
    }
    try {
      const res = await api.updateSetting(key_name, value);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        await fetchSettings();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Update failed' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast */}
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

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 font-serif-jntu flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-600" />
          University Library Configuration & Operating Policies
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configurable institutional settings for JNTUA Central Library
        </p>
      </div>

      {/* 1. Official Library Timings Setting */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700 border border-amber-200 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Official Library Timings Notice
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Notice displayed to students and faculty regarding Central Library opening hours.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            Current Active Notice / Placeholder:
          </label>
          <div className="p-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 leading-relaxed italic">
            "{timingsInput || 'Library timings will be updated soon.'}"
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              Update Timings Notice (Admin Authorization)
            </label>
            <textarea
              value={timingsInput}
              onChange={(e) => setTimingsInput(e.target.value)}
              placeholder="Enter confirmed library opening and closing hours..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
            <button
              onClick={() => handleUpdateSetting('library_timings', timingsInput)}
              className="px-4 py-2 bg-jntua-navy hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              Save Timings Notice
            </button>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Library opening hours are updated by the Chief Librarian's office.</span>
          </div>
        )}
      </div>

      {/* 2. Core Library Business Policies (Display & Configure) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-700" />
          Active JNTUA Circulation & Fine Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-medium block">Borrowing Period:</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">15 Days</span>
            <p className="text-[11px] text-slate-500 mt-1">
              Valid for exactly 15 days from issue date.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-medium block">Overdue Fine Rate:</span>
            <span className="text-xl font-bold text-rose-600 mt-1 block">₹1 / day</span>
            <p className="text-[11px] text-slate-500 mt-1">
              ₹0 on or before due date. ₹1 per day thereafter.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 font-medium block">Lost / Damaged Penalty:</span>
            <span className="text-xl font-bold text-amber-700 mt-1 block">₹300 + Late Fine</span>
            <p className="text-[11px] text-slate-500 mt-1">
              ₹300 administrative charge plus any overdue fine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
