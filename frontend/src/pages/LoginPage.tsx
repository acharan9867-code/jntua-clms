import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  UserCheck,
  Shield,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
  Info
} from 'lucide-react';

interface LoginPageProps {
  onSuccessLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, switchDemoRole, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('jntua@123');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await login(identifier, password);
      onSuccessLogin();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleDemoLogin = async (role: 'student' | 'faculty' | 'admin') => {
    setErrorMessage('');
    try {
      await switchDemoRole(role);
      onSuccessLogin();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header with JNTUA Crest */}
        <div className="bg-jntua-navy text-white p-6 text-center relative overflow-hidden">
          <div className="w-20 h-20 mx-auto mb-3 bg-white p-1 rounded-full border-2 border-amber-400 shadow-sm flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/e/e3/Jawaharlal_Nehru_Technological_University%2C_Anantapur_logo.png"
              alt="JNTUA Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <h2 className="text-base font-bold font-serif-jntu tracking-wide uppercase">
            JNTUA Central Library
          </h2>
          <p className="text-xs text-amber-300 font-medium">
            Academic Portal Authentication
          </p>
        </div>

        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Roll No / Employee ID / Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 21001A0501 or admin@jntua.ac.in"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default password for all demo accounts: <code className="text-slate-700 font-bold font-mono">jntua@123</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 shadow transition-colors flex items-center justify-center gap-1.5"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Viva Evaluation 1-Click Fast Presets */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Viva & Demo 1-Click Fast Logins:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950">Student: S. Charan Reddy</div>
                    <div className="text-[10px] text-blue-700 font-mono">Roll: 21001A0501 • Max 3 Books</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-700">Login →</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('faculty')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-600 text-white rounded-lg">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-950">Faculty: Dr. K. Kavitha</div>
                    <div className="text-[10px] text-purple-700 font-mono">ID: JNTUA-FAC-101 • Max 6 Books</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-700">Login →</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-600 text-white rounded-lg">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950">Chief Librarian: Dr. M. Sreenivasulu</div>
                    <div className="text-[10px] text-amber-800 font-mono">ID: LIBRARIAN-01 • Full Access</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-800">Login →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
