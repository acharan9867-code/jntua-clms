import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { JntuaHeader } from "./components/JntuaHeader";
import { Navbar } from "./components/Navbar";
import { CatalogPage } from "./pages/CatalogPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { MouseGlow } from "./components/MouseGlow";

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>("catalog");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        {/* Floating orbs */}
        <div className="orb w-96 h-96 bg-electric top-1/4 left-1/4" />
        <div className="orb w-80 h-80 bg-blue-500 bottom-1/4 right-1/4" style={{ animationDelay: "2s" }} />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-14 h-14 border-2 border-electric border-t-transparent rounded-full animate-spin mx-auto" style={{ boxShadow: "0 0 20px rgba(56,189,248,0.5)" }} />
          <p className="text-sm font-bold text-electric text-glow font-serif-jntu tracking-widest uppercase">
            JNTUA Library System
          </p>
          <p className="text-xs text-dark-500">Connecting to Central Library Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-dark-text" style={{ background: "#0F172A" }}>
      {/* Ambient glow orbs (fixed background) */}
      <div className="orb w-[600px] h-[600px] bg-electric" style={{ top: "-200px", left: "-200px", animationDelay: "0s" }} />
      <div className="orb w-[500px] h-[500px] bg-blue-700" style={{ bottom: "-150px", right: "-150px", animationDelay: "3s" }} />
      <div className="orb w-[300px] h-[300px] bg-indigo-600" style={{ top: "50%", left: "50%", animationDelay: "6s" }} />

      {/* Premium mouse cursor spotlight — pointer-events:none, desktop only */}
      <MouseGlow />

      {/* Header */}
      <JntuaHeader />
      {/* Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content */}
      <main className="flex-1 animate-slide-up">
        {currentTab === "login" && (
          <LoginPage onSuccessLogin={() => setCurrentTab(user?.role === "admin" ? "admin-dashboard" : "dashboard")} />
        )}
        {currentTab === "catalog" && (
          <CatalogPage onIssueSuccess={() => setCurrentTab(user?.role === "admin" ? "admin-dashboard" : "dashboard")} />
        )}
        {(currentTab === "dashboard" || currentTab === "my-books" || currentTab === "fines-history") && (
          <StudentDashboard onNavigateCatalog={() => setCurrentTab("catalog")} />
        )}
        {(currentTab === "admin-dashboard" || currentTab === "counter-issue") && (
          <AdminDashboard initialSubTab="overview" onOpenAddBook={() => setCurrentTab("catalog")} />
        )}
        {currentTab === "admin-fines" && (
          <AdminDashboard initialSubTab="fines" onOpenAddBook={() => setCurrentTab("catalog")} />
        )}
        {currentTab === "members" && (
          <AdminDashboard initialSubTab="members" onOpenAddBook={() => setCurrentTab("catalog")} />
        )}
        {currentTab === "reservations" && (
          user?.role === "admin"
            ? <AdminDashboard initialSubTab="reservations" onOpenAddBook={() => setCurrentTab("catalog")} />
            : <StudentDashboard onNavigateCatalog={() => setCurrentTab("catalog")} />
        )}
        {currentTab === "reports" && <ReportsPage />}
        {currentTab === "settings" && <SettingsPage />}
      </main>

      {/* Premium Dark Footer */}
      <footer className="relative mt-auto border-t" style={{ background: "rgba(15,23,42,0.95)", borderColor: "rgba(56,189,248,0.15)" }}>
        <div className="absolute inset-0 bg-glow-blue-sm pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div>
            <h4 className="text-electric font-bold text-sm mb-3 font-serif-jntu text-glow-sm">
              Dr. A.P.J. Abdul Kalam Central Library
            </h4>
            <p className="text-dark-500 text-xs leading-relaxed">
              JNTUA College of Engineering, Ananthapuramu - 515002.<br />
              Jawaharlal Nehru Technological University Anantapur.
            </p>
            <div className="mt-3 text-xs text-electric/60 font-mono">🌐 www.jntualibrarymanagement.com</div>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Library Rules</h4>
            <ul className="space-y-1.5 text-xs" style={{ color: "#64748B" }}>
              <li className="flex items-center gap-2"><span className="text-electric">▸</span> Borrowing: <strong className="text-slate-300 ml-1">15 days</strong></li>
              <li className="flex items-center gap-2"><span className="text-electric">▸</span> Late fine: <strong className="text-slate-300 ml-1">₹1 per day</strong></li>
              <li className="flex items-center gap-2"><span className="text-electric">▸</span> Lost book: <strong className="text-slate-300 ml-1">₹300 + fine</strong></li>
              <li className="flex items-center gap-2"><span className="text-electric">▸</span> Timings: <strong className="text-slate-300 ml-1">Mon–Sat 8:30AM–6:30PM</strong></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-3">About This System</h4>
            <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
              B.Tech CSE Full-Stack Capstone Project.<br />
              Stack: React + TypeScript, Node.js + Express, SQLite, JWT Auth.
            </p>
            <div className="mt-3 text-[11px] text-electric/80 font-semibold">
              ⚡ Developed by Charan Apilagunta • JNTUA CSE
            </div>
            <div className="mt-1 text-[10px]" style={{ color: "#334155" }}>
              © {new Date().getFullYear()} JNTUA Library Management System
            </div>
          </div>
        </div>
        {/* Bottom glow line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)" }} />
      </footer>
    </div>
  );
}

export default function App() {
  return <AuthProvider><MainApp /></AuthProvider>;
}
