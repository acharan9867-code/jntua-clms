import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, UserCheck, Shield, Lock, User,
  ArrowRight, Sparkles, RefreshCw, CheckCircle
} from 'lucide-react';

interface LoginPageProps {
  onSuccessLogin: () => void;
}

function generateCaptcha() {
  const ops = ['+', '-', '+', '+', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 9) + 1;
  let b = Math.floor(Math.random() * 9) + 1;
  if (op === '-' && b > a) [a, b] = [b, a];
  if (op === '*') { a = Math.floor(Math.random() * 5) + 1; b = Math.floor(Math.random() * 5) + 1; }
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { question: `${a} ${op} ${b}`, answer };
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, switchDemoRole, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  }, []);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - btn.left;
    const y = e.clientY - btn.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(ri => ri.id !== id)), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError('');
    setErrorMessage('');
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError('Incorrect CAPTCHA answer. Please try again.');
      refreshCaptcha();
      return;
    }
    try {
      await login(identifier, password);
      onSuccessLogin();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
      refreshCaptcha();
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Animated background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="books" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="8" y="10" width="12" height="60" rx="2" fill="#1e3a5f" />
              <rect x="24" y="15" width="10" height="55" rx="2" fill="#b45309" />
              <rect x="38" y="8" width="14" height="62" rx="2" fill="#1e3a5f" />
              <rect x="56" y="20" width="11" height="50" rx="2" fill="#b45309" />
              <rect x="70" y="12" width="9" height="58" rx="2" fill="#1e3a5f" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#books)" />
        </svg>
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-jntua-navy via-blue-900 to-indigo-900 text-white p-6 text-center relative overflow-hidden">
          {/* Header background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-3 bg-white p-1 rounded-full border-2 border-amber-400 shadow-lg flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/e/e3/Jawaharlal_Nehru_Technological_University%2C_Anantapur_logo.png"
                alt="JNTUA Logo"
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <h2 className="text-base font-bold font-serif-jntu tracking-wide uppercase">JNTUA Central Library</h2>
            <p className="text-xs text-amber-300 font-medium">Dr. A.P.J. Abdul Kalam Library — Member Portal</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-200 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Mon–Sat: 8:30 AM – 6:30 PM
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold animate-shake">
              ⚠ {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Roll No / Employee ID / Gmail
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 21001A0501 or yourname@gmail.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 transition-all"
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
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 transition-all"
                required
              />
            </div>

            {/* CAPTCHA */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <label className="block font-bold text-slate-700 flex items-center gap-1 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                Security Check (CAPTCHA)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white border border-dashed border-slate-300 rounded-lg px-4 py-2 font-mono font-black text-lg text-jntua-navy tracking-widest text-center select-none"
                     style={{ letterSpacing: '0.2em', fontStyle: 'italic' }}>
                  {captcha.question} = ?
                </div>
                <button type="button" onClick={refreshCaptcha}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all btn-ripple"
                  title="Refresh CAPTCHA">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter the answer above"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition-all"
                required
              />
              {captchaError && <p className="text-rose-600 text-[11px] font-semibold">{captchaError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={addRipple}
              className="btn-ripple w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-jntua-navy hover:bg-blue-900 shadow-lg hover:shadow-blue-900/30 transition-all duration-200 flex items-center justify-center gap-1.5 relative overflow-hidden"
            >
              {ripples.map(r => (
                <span key={r.id} className="ripple-effect" style={{ left: r.x, top: r.y }} />
              ))}
              {isLoading ? (
                <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating...</span>
              ) : (
                <span className="flex items-center gap-1.5">Sign In to Portal <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>

          {/* 1-Click Demo Logins */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Viva & Demo 1-Click Fast Logins:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button type="button" onClick={(e) => { addRipple(e); handleDemoLogin('student'); }}
                className="btn-ripple p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 hover:border-blue-400 hover:shadow-md text-left transition-all duration-200 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow"><GraduationCap className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs font-bold text-blue-950">Student: S. Charan Reddy</div>
                    <div className="text-[10px] text-blue-700 font-mono">Roll: 21001A0501 • Max 3 Books</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-700">Login →</span>
              </button>

              <button type="button" onClick={(e) => { addRipple(e); handleDemoLogin('faculty'); }}
                className="btn-ripple p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 hover:border-purple-400 hover:shadow-md text-left transition-all duration-200 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-600 text-white rounded-lg shadow"><UserCheck className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs font-bold text-purple-950">Faculty: Dr. K. Kavitha</div>
                    <div className="text-[10px] text-purple-700 font-mono">ID: JNTUA-FAC-101 • Max 6 Books</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-700">Login →</span>
              </button>

              <button type="button" onClick={(e) => { addRipple(e); handleDemoLogin('admin'); }}
                className="btn-ripple p-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 hover:border-amber-400 hover:shadow-md text-left transition-all duration-200 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-600 text-white rounded-lg shadow"><Shield className="w-4 h-4" /></div>
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
