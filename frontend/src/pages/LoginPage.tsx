import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Code2,
  UserCheck,
  KeyRound,
  User
} from "lucide-react";

interface LoginPageProps {
  onSuccessLogin: () => void;
}

function generateCaptcha() {
  const ops = ["+", "+", "-", "+", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 9) + 1;
  let b = Math.floor(Math.random() * 9) + 1;
  if (op === "-" && b > a) [a, b] = [b, a];
  if (op === "*") {
    a = Math.floor(Math.random() * 5) + 1;
    b = Math.floor(Math.random() * 5) + 1;
  }
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { question: `${a} ${op} ${b}`, answer };
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, switchDemoRole, isLoading } = useAuth();
  const [loginRole, setLoginRole] = useState<"student" | "librarian">("student");

  // Student form fields
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Librarian form fields
  const [librarianId, setLibrarianId] = useState("acharan apilagunta");
  const [librarianPassword, setLibrarianPassword] = useState("");

  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaErr, setCaptchaErr] = useState("");

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaErr("");
  }, []);

  const handleRoleChange = (role: "student" | "librarian") => {
    setLoginRole(role);
    setError("");
    setCaptchaErr("");
    refreshCaptcha();
    if (role === "librarian") {
      setLibrarianId("acharan apilagunta");
      setLibrarianPassword("charan@143232");
    } else {
      setStudentPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaErr("");

    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaErr("Incorrect math answer. Please try again.");
      refreshCaptcha();
      return;
    }

    try {
      if (loginRole === "student") {
        const trimmedEmail = studentEmail.trim().toLowerCase();
        if (!trimmedEmail.endsWith("@gmail.com")) {
          setError("Students must enter a valid Gmail address (must end with @gmail.com)");
          return;
        }
        if (!studentPassword) {
          setError("Please enter your Gmail password.");
          return;
        }
        await login(trimmedEmail, studentPassword, "student");
      } else {
        // Librarian Login
        const trimmedId = librarianId.trim();
        if (!trimmedId) {
          setError("Please enter the Librarian username (acharan apilagunta).");
          return;
        }
        if (!librarianPassword) {
          setError("Please enter the Librarian password (charan@143232).");
          return;
        }
        await login(trimmedId, librarianPassword, "librarian");
      }
      onSuccessLogin();
    } catch (err: any) {
      setError(err.message || "Login failed. Please verify credentials.");
      refreshCaptcha();
    }
  };

  const handleDemo = async (role: "student" | "faculty" | "admin") => {
    try {
      await switchDemoRole(role);
      onSuccessLogin();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* JNTUA Building Background */}
      <div className="fixed inset-0 -z-10">
        <img src="/jntua-building.jpg" alt="JNTUA Campus" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.88) 50%, rgba(30,41,59,0.92) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(56,189,248,0.1) 0%, transparent 65%)",
          }}
        />
      </div>

      <div className="w-full max-w-md space-y-4 relative z-10 animate-slide-up">
        {/* Main Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(30,41,59,0.9)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(56,189,248,0.25)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 40px rgba(56,189,248,0.12)",
          }}
        >
          {/* Header Banner */}
          <div
            className="relative p-5 text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(14,165,233,0.18), rgba(56,189,248,0.08))",
              borderBottom: "1px solid rgba(56,189,248,0.18)",
            }}
          >
            <div
              className="w-14 h-14 mx-auto mb-2.5 rounded-full flex items-center justify-center p-0.5"
              style={{
                background: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
                boxShadow: "0 0 20px rgba(56,189,248,0.5)",
              }}
            >
              <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/e/e3/Jawaharlal_Nehru_Technological_University%2C_Anantapur_logo.png"
                  alt="JNTUA"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
            <h2
              className="text-sm font-bold font-serif-jntu tracking-wider uppercase text-glow"
              style={{ color: "#F8FAFC" }}
            >
              JNTUA Central Library
            </h2>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#38BDF8" }}>
              Dr. A.P.J. Abdul Kalam Library — Portal Sign In
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div
            className="grid grid-cols-2 p-1.5 mx-5 mt-4 rounded-xl gap-1.5"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(56,189,248,0.18)",
            }}
          >
            <button
              type="button"
              onClick={() => handleRoleChange("student")}
              className="btn-ripple flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
              style={
                loginRole === "student"
                  ? {
                      background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                      color: "#0F172A",
                      boxShadow: "0 0 16px rgba(56,189,248,0.45)",
                    }
                  : { color: "#94A3B8", background: "transparent" }
              }
            >
              <GraduationCap className="w-4 h-4" />
              Student Login
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("librarian")}
              className="btn-ripple flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
              style={
                loginRole === "librarian"
                  ? {
                      background: "linear-gradient(135deg, #F59E0B, #D97706)",
                      color: "#0F172A",
                      boxShadow: "0 0 16px rgba(245,158,11,0.45)",
                    }
                  : { color: "#94A3B8", background: "transparent" }
              }
            >
              <Shield className="w-4 h-4" />
              Librarian Login
            </button>
          </div>

          <div className="p-5 space-y-4">
            {error && (
              <div
                className="p-3 rounded-xl text-xs font-semibold animate-shake flex items-center gap-2"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "#FCA5A5",
                }}
              >
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* STUDENT LOGIN FORM */}
              {loginRole === "student" && (
                <>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                        <Mail className="w-3.5 h-3.5" style={{ color: "#38BDF8" }} />
                        Student Gmail Address <span className="text-red-400">*</span>
                      </span>
                      <span className="text-[10px] text-electric">@gmail.com</span>
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="Enter your Gmail (e.g. yourname@gmail.com)"
                      className="dark-input"
                      required
                    />
                    <p className="text-[10px] mt-1" style={{ color: "#64748B" }}>
                      ✓ Enter your personal Gmail to access or auto-create your student account
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                      <Lock className="w-3.5 h-3.5" style={{ color: "#38BDF8" }} />
                      Gmail Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="dark-input"
                      required
                    />
                  </div>
                </>
              )}

              {/* LIBRARIAN LOGIN FORM */}
              {loginRole === "librarian" && (
                <>
                  <div
                    className="p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2"
                    style={{
                      background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      color: "#FCD34D",
                    }}
                  >
                    <KeyRound className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Librarian: <strong>acharan apilagunta</strong> • Password: <strong>charan@143232</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      Librarian Name / ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={librarianId}
                      onChange={(e) => setLibrarianId(e.target.value)}
                      placeholder="acharan apilagunta"
                      className="dark-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Librarian Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={librarianPassword}
                      onChange={(e) => setLibrarianPassword(e.target.value)}
                      placeholder="charan@143232"
                      className="dark-input"
                      required
                    />
                  </div>
                </>
              )}

              {/* CAPTCHA */}
              <div
                className="p-3 rounded-xl space-y-2"
                style={{
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(56,189,248,0.15)",
                }}
              >
                <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                  Security Verification (Captcha)
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 rounded-lg px-4 py-2 font-mono font-black text-xl text-center select-none"
                    style={{
                      background: "rgba(56,189,248,0.08)",
                      border: "2px dashed rgba(56,189,248,0.3)",
                      color: loginRole === "librarian" ? "#F59E0B" : "#38BDF8",
                      letterSpacing: "0.2em",
                      fontStyle: "italic",
                      textShadow:
                        loginRole === "librarian"
                          ? "0 0 10px rgba(245,158,11,0.5)"
                          : "0 0 10px rgba(56,189,248,0.5)",
                    }}
                  >
                    {captcha.question} = ?
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="btn-ripple p-2 rounded-lg transition-all"
                    style={{ color: "#64748B" }}
                    title="Refresh Captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter the result"
                  className="dark-input"
                  required
                />
                {captchaErr && <p className="text-[11px] font-semibold" style={{ color: "#FCA5A5" }}>{captchaErr}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`btn-ripple w-full flex items-center justify-center gap-2 ${
                  loginRole === "librarian"
                    ? "py-2.5 rounded-xl text-xs font-bold text-slate-950 transition-all shadow-lg"
                    : "btn-electric"
                }`}
                style={
                  loginRole === "librarian"
                    ? {
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        boxShadow: "0 0 20px rgba(245,158,11,0.4)",
                      }
                    : {}
                }
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In as {loginRole === "librarian" ? "Chief Librarian" : "Student"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins Section */}
            <div className="pt-3" style={{ borderTop: "1px solid rgba(56,189,248,0.1)" }}>
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold" style={{ color: "#64748B" }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                1-Click Quick Viva Demo Logins
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    role: "student" as const,
                    icon: GraduationCap,
                    name: "S. Charan Reddy",
                    id: "21001A0501 • Student Portal",
                    color: "#3B82F6",
                    glow: "rgba(59,130,246,0.3)",
                  },
                  {
                    role: "admin" as const,
                    icon: Shield,
                    name: "Acharan Apilagunta",
                    id: "Chief Librarian • charan@143232",
                    color: "#F59E0B",
                    glow: "rgba(245,158,11,0.3)",
                  },
                ].map(({ role, icon: Icon, name, id, color, glow }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemo(role)}
                    className="btn-ripple p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                    style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${glow}`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${color}60`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
                    }}
                  >
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

        {/* Created By Footer */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium"
            style={{
              background: "rgba(30,41,59,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(56,189,248,0.15)",
              color: "rgba(248,250,252,0.75)",
            }}
          >
            <Code2 className="w-3.5 h-3.5" style={{ color: "#38BDF8" }} />
            Designed & Developed by
            <span className="font-bold" style={{ color: "#38BDF8" }}>Charan Apilagunta</span>
            • <span style={{ color: "#64748B" }}>JNTUA CSE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
