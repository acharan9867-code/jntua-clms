import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap, UserCheck, Shield, Lock, Mail,
  ArrowRight, Sparkles, RefreshCw, CheckCircle, Code2
} from "lucide-react";

interface LoginPageProps { onSuccessLogin: () => void; }

function generateCaptcha() {
  const ops = ["+", "+", "-", "+", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 9) + 1;
  let b = Math.floor(Math.random() * 9) + 1;
  if (op === "-" && b > a) [a, b] = [b, a];
  if (op === "*") { a = Math.floor(Math.random() * 5) + 1; b = Math.floor(Math.random() * 5) + 1; }
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { question: `${a} ${op} ${b}`, answer };
}

// JNTUA / Engineering College / CSE Lab photos from Unsplash
const BG_PHOTOS = [
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",  // University building
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80",  // College campus
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",  // University campus
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80",  // Computer lab
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1920&q=80",  // Programming / CSE
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&q=80",  // Students studying
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80",  // Library shelves
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1920&q=80",  // Lecture hall
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, switchDemoRole, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [bgIndex, setBgIndex] = useState(0);
  const [bgFade, setBgFade] = useState(true);

  // Rotate background photos every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgFade(false);
      setTimeout(() => {
        setBgIndex(i => (i + 1) % BG_PHOTOS.length);
        setBgFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError(""); setErrorMessage("");
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError("Incorrect CAPTCHA. Please try again.");
      refreshCaptcha(); return;
    }
    try {
      await login(identifier, password);
      onSuccessLogin();
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed.");
      refreshCaptcha();
    }
  };

  const handleDemoLogin = async (role: "student" | "faculty" | "admin") => {
    setErrorMessage("");
    try { await switchDemoRole(role); onSuccessLogin(); }
    catch (err: any) { setErrorMessage(err.message || "Demo login failed"); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 relative overflow-hidden">

      {/* ── Fullscreen JNTUA CSE background photos ── */}
      <div className="fixed inset-0 -z-10">
        <img
          src={BG_PHOTOS[bgIndex]}
          alt="JNTUA Campus"
          className="w-full h-full object-cover"
          style={{ opacity: bgFade ? 1 : 0, transition: "opacity 0.5s ease-in-out" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-jntua-navy/80 via-blue-900/70 to-black/60" />
        {/* SVG book pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="books2" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="8" y="10" width="12" height="60" rx="2" fill="white"/>
              <rect x="24" y="15" width="10" height="55" rx="2" fill="white"/>
              <rect x="38" y="8" width="14" height="62" rx="2" fill="white"/>
              <rect x="56" y="20" width="11" height="50" rx="2" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#books2)"/>
        </svg>
        {/* Animated floating light orbs */}
        <div className="absolute top-10 left-16 w-80 h-80 bg-amber-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-16 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Photo indicator dots */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {BG_PHOTOS.map((_, i) => (
          <button key={i} onClick={() => { setBgFade(false); setTimeout(() => { setBgIndex(i); setBgFade(true); }, 300); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === bgIndex ? "bg-amber-400 w-4" : "bg-white/40"}`} />
        ))}
      </div>

      <div className="max-w-md w-full space-y-4">
        {/* ── Login Card ── */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-jntua-navy/90 to-blue-900/90 text-white p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
            </div>
            <div className="relative z-10">
              <div className="w-18 h-18 w-16 h-16 mx-auto mb-2 bg-white p-1 rounded-full border-2 border-amber-400 shadow-xl flex items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/en/e/e3/Jawaharlal_Nehru_Technological_University%2C_Anantapur_logo.png"
                  alt="JNTUA Logo" className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <h2 className="text-sm font-bold font-serif-jntu tracking-wide uppercase">JNTUA Central Library</h2>
              <p className="text-[11px] text-amber-300">Dr. A.P.J. Abdul Kalam Library — Member Portal</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-200 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Mon–Sat: 8:30 AM – 6:30 PM
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4 bg-white/95">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold animate-shake">
                ⚠ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Gmail / Roll No / Employee ID
                </label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="yourname@gmail.com or 21001A0501"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none bg-slate-50/50 transition-all" required />
                <p className="text-[10px] text-slate-400 mt-0.5">✓ Any Gmail works — new accounts auto-created</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-600" /> Password
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none bg-slate-50/50 transition-all" required />
              </div>

              {/* CAPTCHA */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <label className="block font-bold text-slate-700 flex items-center gap-1 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Security Verification
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border-2 border-dashed border-blue-200 rounded-lg px-4 py-2 font-mono font-black text-xl text-jntua-navy tracking-widest text-center select-none"
                    style={{ fontStyle: "italic", letterSpacing: "0.25em" }}>
                    {captcha.question} = ?
                  </div>
                  <button type="button" onClick={refreshCaptcha} title="Refresh"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all btn-ripple">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter the answer"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none bg-white transition-all" required />
                {captchaError && <p className="text-rose-600 text-[11px] font-semibold">{captchaError}</p>}
              </div>

              <button type="submit" disabled={isLoading}
                className="btn-ripple w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-jntua-navy to-blue-700 hover:from-blue-900 hover:to-blue-800 shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5">
                {isLoading
                  ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating...</span>
                  : <span className="flex items-center gap-1.5">Sign In to Library Portal <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </form>

            {/* Demo Logins */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Demo / Viva Logins
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button type="button" onClick={() => handleDemoLogin("student")}
                  className="btn-ripple p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:shadow-md text-left transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg"><GraduationCap className="w-3.5 h-3.5" /></div>
                    <div><div className="text-xs font-bold text-blue-950">Student: S. Charan Reddy</div>
                    <div className="text-[10px] text-blue-600 font-mono">21001A0501 • CSE</div></div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700">Login →</span>
                </button>

                <button type="button" onClick={() => handleDemoLogin("faculty")}
                  className="btn-ripple p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 hover:shadow-md text-left transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-600 text-white rounded-lg"><UserCheck className="w-3.5 h-3.5" /></div>
                    <div><div className="text-xs font-bold text-purple-950">Faculty: Dr. K. Kavitha</div>
                    <div className="text-[10px] text-purple-600 font-mono">JNTUA-FAC-101</div></div>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700">Login →</span>
                </button>

                <button type="button" onClick={() => handleDemoLogin("admin")}
                  className="btn-ripple p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 hover:shadow-md text-left transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-600 text-white rounded-lg"><Shield className="w-3.5 h-3.5" /></div>
                    <div><div className="text-xs font-bold text-amber-950">Librarian: Dr. M. Sreenivasulu</div>
                    <div className="text-[10px] text-amber-700 font-mono">LIBRARIAN-01 • Full Access</div></div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800">Login →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Created by Charan footer ── */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-[11px] font-medium">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            Designed & Developed by
            <span className="font-bold text-amber-300">Charan Apilagunta</span>
            •
            <span className="text-white/60">JNTUA CSE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
