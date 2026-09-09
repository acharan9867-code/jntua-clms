import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, GraduationCap, Sparkles, Phone, Mail } from 'lucide-react';

export const JntuaHeader: React.FC = () => {
  const { user, switchDemoRole } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      {/* Top Academic Info Bar */}
      <div className="bg-jntua-navy text-slate-100 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-amber-300 tracking-wide uppercase">
              🏛️ Estd. 1946 • JNTUA College of Engineering
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-200 italic">
              "Yogah Karmasu Kausalam" (Excellence in Action)
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-300 text-xs">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              library@jntua.ac.in
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              +91 8554 272433
            </span>
          </div>
        </div>
      </div>

      {/* Main University Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          {/* Official JNTUA Emblem */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-white p-1 rounded-full border-2 border-amber-500/60 shadow-sm flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/e/e3/Jawaharlal_Nehru_Technological_University%2C_Anantapur_logo.png"
              alt="JNTUA Emblem"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback elegant SVG seal if offline
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-jntua-navy font-serif-jntu leading-tight">
              JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              College of Engineering Anantapur (Autonomous) • Ananthapuramu - 515002, Andhra Pradesh
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Dr. A.P.J. Abdul Kalam Central Library
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Integrated Portal (CLMS v2.4)
              </span>
            </div>
          </div>
        </div>

        {/* Quick 1-Click Role Switcher for Viva Evaluation & Demos */}
        <div className="w-full md:w-auto bg-amber-50/80 border border-amber-200/90 rounded-lg p-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Viva Demo Switcher:
            </span>
            <span className="text-[11px] text-slate-500">
              Active: <strong className="text-jntua-navy uppercase">{user?.role || 'Guest'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => switchDemoRole('student')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 ${
                user?.role === 'student'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-200'
              }`}
              title="Login as B.Tech CSE Student (21001A0501)"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Student
            </button>

            <button
              onClick={() => switchDemoRole('faculty')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 ${
                user?.role === 'faculty'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-white hover:bg-purple-50 text-purple-900 border border-purple-200'
              }`}
              title="Login as Professor (JNTUA-FAC-101)"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Faculty
            </button>

            <button
              onClick={() => switchDemoRole('admin')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1 ${
                user?.role === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
              title="Login as Chief Librarian (Admin)"
            >
              <Shield className="w-3.5 h-3.5" />
              Librarian
            </button>
          </div>
        </div>
      </div>

      {/* University Announcement Notice Ticker */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5 text-xs text-slate-700 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="bg-red-600 text-white text-[10px] font-bold uppercase px-1.5 py-0.5 rounded animate-pulse">
            Notice
          </span>
          <p className="truncate text-xs text-slate-700 font-medium">
            Standard borrowing period is <strong>15 days</strong>. Late fine: <strong>₹1 per overdue day</strong>. Lost or damaged book penalty: <strong>₹300 + late fine</strong>. Library timings will be updated soon.
          </p>
        </div>
      </div>
    </header>
  );
};
