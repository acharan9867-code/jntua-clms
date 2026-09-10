import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, UserCheck, Shield, Lock, Mail, ArrowRight, Sparkles, RefreshCw, CheckCircle2, Code2, BookOpen } from "lucide-react";

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

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, switchDemoRole, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaErr, setCaptchaErr] = useState("");

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha()); setCaptchaInput(""); setCaptchaErr("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setCaptchaErr("");
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaErr("Incorrect answer. Try again."); refreshCaptcha(); return;
    }
    try { await login(identifier, password); onSuccessLogin(); }
    catch (err: any) { setError(err.message || "Login failed."); refreshCaptcha(); }
  };

  const handleDemo = async (role: "student" | "faculty" | "admin") => {
    try { await switchDemoRole(role); onSuccessLogin(); }
    catch (err: any) { setError(err.message || "Demo login failed"); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* JNTUA Building Background */}
      <div className="fixed inset-0 -z-10">
        <img src="/jntua-building.jpg" alt="JNTUA Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.85) 50%, rgba(30,41,59,0.90) 100%)" }} />
        {/* Blue glow overlay */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(56,189,248,0.08) 0%, transparent 60%)" }} />
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10 animate-slide-up">
        {/* Login Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(24px)", border: "1px solid rgba(56,189,248,0.2)", boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 40px rgba(56,189,248,0.1)" }}>
          {/* Header */}
          <div className="relative p-6 text-center overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(56,189,248,0.08))", borderBottom: "1px solid rgba(56,189,248,0.15)" }}>
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.15), transparent 70%)" }} />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center p-0.5"
                style={{ background: "linear-gradient(135deg, #38BDF8, #0EA5E9)", boxShadow: "0 0 24px rgba(56,189,248,0.5)" }}>
                <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/en/e/e3/Jawaharlal_Nehru_Technological_University%2C_Anantapur_logo.png"
                    alt="JNTUA" className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              </div>
              <h2 className="text-sm font-bold font-serif-jntu tracking-wider uppercase text-glow" style={{ color: "#F8FAFC" }}>
                JNTUA Central Library
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: "#38BDF8" }}>Dr. A.P.J. Abdul Kalam Library — Member Portal</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium"
                style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", color: "#7DD3FC" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Mon–Sat: 8:30 AM – 6:30 PM
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-xs font-semibold animate-shake flex items-center gap-2"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5" }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: "#94A3B8" }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: "#38BDF8" }} /> Gmail / Roll No / Employee ID
                </label>
                <input value={identifier} onChange={e => setIdentifier(e.target.value)} type="text"
                  placeholder="yourname@gmail.com or 21001A0501"
                  className="dark-input" required />
                <p className="text-[10px] mt-1" style={{ color: "#475569" }}>✓ Any Gmail auto-creates a student account</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: "#94A3B8" }}>
                  <Lock className="w-3.5 h-3.5" style={{ color: "#38BDF8" }} /> Password
                </label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password"
                  placeholder="Enter your password"
                  className="dark-input" required />
              </div>

              {/* CAPTCHA */}
              <div className="p-3 rounded-xl space-y-2" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(56,189,248,0.15)" }}>
                <label className="text-xs font-bold flex items-center gap-1" style={{ color: "#94A3B8" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22C55E" }} /> Security Verification
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg px-4 py-2 font-mono font-black text-xl text-center select-none"
                    style={{ background: "rgba(56,189,248,0.08)", border: "2px dashed rgba(56,189,248,0.3)", color: "#38BDF8", letterSpacing: "0.2em", fontStyle: "italic", textShadow: "0 0 10px rgba(56,189,248,0.5)" }}>
                    {captcha.question} = ?
                  </div>
                  <button type="button" onClick={refreshCaptcha} className="btn-ripple p-2 rounded-lg transition-all"
                    style={{ color: "#64748B" }} title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <input type="number" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}
                  placeholder="Enter the answer" className="dark-input" required />
                {captchaErr && <p className="text-[11px] font-semibold" style={{ color: "#FCA5A5" }}>{captchaErr}</p>}
              </div>

              <button type="submit" disabled={isLoading}
                className="btn-ripple btn-electric w-full flex items-center justify-center gap-2">
                {isLoading
                  ? <><span className="w-3.5 h-3.5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />Authenticating...</>
                  : <>Sign In to Library Portal <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Demo Logins */}
            <div className="pt-3" style={{ borderTop: "1px solid rgba(56,189,248,0.1)" }}>
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold" style={{ color: "#64748B" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} /> Quick Demo / Viva Logins
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { role: "student" as const, icon: GraduationCap, name: "S. Charan Reddy", id: "21001A0501 • CSE", color: "#3B82F6", glow: "rgba(59,130,246,0.3)" },
                  { role: "faculty" as const, icon: UserCheck, name: "Dr. K. Kavitha", id: "JNTUA-FAC-101", color: "#8B5CF6", glow: "rgba(139,92,246,0.3)" },
                  { role: "admin" as const, icon: Shield, name: "Dr. M. Sreenivasulu", id: "LIBRARIAN-01 • Full Access", color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
                ].map(({ role, icon: Icon, name, id, color, glow }) => (
                  <button key={role} type="button" onClick={() => handleDemo(role)}
                    className="btn-ripple p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                    style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${glow}`; (e.currentTarget as HTMLElement).style.borderColor = `${color}60`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = `${color}30`; }}>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg" style={{ background: color, boxShadow: `0 0 8px ${glow}` }}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: "#F8FAFC" }}>{name}</div>
                        <div className="text-[10px] font-mono" style={{ color }}>{id}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color }}>Login →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Created by badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium"
            style={{ background: "rgba(30,41,59,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(56,189,248,0.15)", color: "rgba(248,250,252,0.7)" }}>
            <Code2 className="w-3.5 h-3.5" style={{ color: "#38BDF8" }} />
            Designed & Developed by
            <span className="font-bold" style={{ color: "#38BDF8" }}>Charan Apilagunta</span>
            • <span style={{ color: "#475569" }}>JNTUA CSE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
