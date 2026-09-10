import React from "react";
import { useAuth } from "../context/AuthContext";
import { UserCheck, Shield, GraduationCap, Sparkles, Phone, Mail, Globe } from "lucide-react";

export const JntuaHeader: React.FC = () => {
  const { user, switchDemoRole } = useAuth();

  return (
    <header className="relative z-30" style={{ background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(56,189,248,0.15)" }}>
      {/* Subtle top glow line */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)" }} />

      {/* Top Info Bar */}
      <div className="py-1.5 px-4 sm:px-6 text-xs" style={{ background: "rgba(56,189,248,0.05)", borderBottom: "1px solid rgba(56,189,248,0.08)" }}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-semibold text-electric/80 uppercase tracking-wider text-[10px]">
              🏛️ Estd. 1946 • JNTUA College of Engineering
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline italic text-slate-500 text-[10px]">
              "Yogah Karmasu Kausalam"
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-electric font-bold">
              <Globe className="w-3 h-3" />
              www.jntualibrarymanagement.com
            </span>
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <Mail className="w-3 h-3 text-electric/60" />
              library@jntua.ac.in
            </span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <Phone className="w-3 h-3 text-electric/60" />
              +91 8554 272433
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center p-0.5"
              style={{ background: "linear-gradient(135deg, #38BDF8, #0EA5E9)", boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}>
              <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/e/e3/Jawaharlal_Nehru_Technological_University%2C_Anantapur_logo.png"
                  alt="JNTUA"
                  className="w-13 h-13 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-dark-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight font-serif-jntu leading-tight"
              style={{ color: "#F8FAFC", textShadow: "0 0 30px rgba(56,189,248,0.2)" }}>
              JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY
            </h1>
            <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
              College of Engineering Anantapur • Ananthapuramu - 515002, AP
            </p>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(56,189,248,0.15)", color: "#38BDF8", border: "1px solid rgba(56,189,248,0.3)" }}>
                ✦ Dr. A.P.J. Abdul Kalam Central Library
              </span>
              <span className="text-[10px] font-mono" style={{ color: "#475569" }}>CLMS v2.4 • Mon–Sat 8:30AM–6:30PM</span>
            </div>
          </div>
        </div>

        {/* Viva Switcher */}
        <div className="w-full md:w-auto rounded-xl p-3"
          style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)" }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[11px] font-bold text-electric flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Viva Demo Switcher
            </span>
            <span className="text-[10px]" style={{ color: "#64748B" }}>
              Role: <strong className="text-electric uppercase">{user?.role || "Guest"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { role: "student" as const, icon: GraduationCap, label: "Student", activeColor: "#3B82F6" },
              { role: "faculty" as const, icon: UserCheck, label: "Faculty", activeColor: "#8B5CF6" },
              { role: "admin" as const, icon: Shield, label: "Librarian", activeColor: "#F59E0B" },
            ].map(({ role, icon: Icon, label, activeColor }) => (
              <button key={role} onClick={() => switchDemoRole(role)}
                className="btn-ripple px-2.5 py-1.5 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-all"
                style={user?.role === role
                  ? { background: activeColor, color: "#fff", boxShadow: `0 0 12px ${activeColor}60` }
                  : { background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notice Ticker */}
      <div className="px-4 py-1.5 text-[11px] flex items-center gap-3 overflow-hidden"
        style={{ background: "rgba(56,189,248,0.04)", borderTop: "1px solid rgba(56,189,248,0.06)" }}>
        <span className="shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse"
          style={{ background: "rgba(239,68,68,0.2)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.3)" }}>
          Notice
        </span>
        <div className="flex gap-6 text-slate-500 overflow-hidden">
          <span>Borrowing: <strong className="text-slate-400">15 days</strong></span>
          <span>Late fine: <strong className="text-slate-400">₹1/day</strong></span>
          <span>Lost book: <strong className="text-slate-400">₹300 + fine</strong></span>
          <span>Timings: <strong className="text-electric/80">Mon–Sat 8:30AM–6:30PM</strong></span>
          <span>🌐 <strong className="text-electric/70">www.jntualibrarymanagement.com</strong></span>
        </div>
      </div>
    </header>
  );
};
