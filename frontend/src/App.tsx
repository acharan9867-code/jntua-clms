import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JntuaHeader } from './components/JntuaHeader';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('catalog');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-700 font-serif-jntu">
            Connecting to JNTUA Central Library Network...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* University Official Header */}
      <JntuaHeader />

      {/* Role-Specific Navigation Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'login' && (
          <LoginPage
            onSuccessLogin={() => {
              if (user?.role === 'admin') {
                setCurrentTab('admin-dashboard');
              } else {
                setCurrentTab('dashboard');
              }
            }}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogPage onIssueSuccess={() => setCurrentTab(user?.role === 'admin' ? 'admin-dashboard' : 'dashboard')} />
        )}

        {currentTab === 'dashboard' && (
          <StudentDashboard onNavigateCatalog={() => setCurrentTab('catalog')} />
        )}

        {currentTab === 'my-books' && (
          <StudentDashboard onNavigateCatalog={() => setCurrentTab('catalog')} />
        )}

        {currentTab === 'fines-history' && (
          <StudentDashboard onNavigateCatalog={() => setCurrentTab('catalog')} />
        )}

        {/* Admin Views */}
        {currentTab === 'admin-dashboard' && (
          <AdminDashboard
            initialSubTab="overview"
            onOpenAddBook={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'counter-issue' && (
          <AdminDashboard
            initialSubTab="overview"
            onOpenAddBook={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'admin-fines' && (
          <AdminDashboard
            initialSubTab="fines"
            onOpenAddBook={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'members' && (
          <AdminDashboard
            initialSubTab="members"
            onOpenAddBook={() => setCurrentTab('catalog')}
          />
        )}

        {currentTab === 'reservations' && (
          user?.role === 'admin' ? (
            <AdminDashboard
              initialSubTab="reservations"
              onOpenAddBook={() => setCurrentTab('catalog')}
            />
          ) : (
            <StudentDashboard onNavigateCatalog={() => setCurrentTab('catalog')} />
          )
        )}

        {currentTab === 'reports' && <ReportsPage />}

        {currentTab === 'settings' && <SettingsPage />}
      </main>

      {/* Academic Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-white font-bold text-sm mb-2 font-serif-jntu">
              Dr. A.P.J. Abdul Kalam Central Library
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              JNTUA College of Engineering, Ananthapuramu - 515002.<br />
              Autonomous institution affiliated with Jawaharlal Nehru Technological University Anantapur.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-2">Core Lending Rules</h4>
            <ul className="space-y-1 text-slate-400 text-xs">
              <li>• Standard borrowing validity: <strong>15 days</strong></li>
              <li>• Overdue penalty: <strong>₹1 per day</strong> after 15 days</li>
              <li>• Lost/Damaged book charge: <strong>₹300 + late fine</strong></li>
              <li>• Queue-based reservation when 0 copies available</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-2">Project Information</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Developed as a 1-Month B.Tech CSE Full-Stack Capstone Project.<br />
              Stack: React.js, Node.js + Express, Relational Database (MySQL / SQLite), JWT Auth.
            </p>
            <div className="mt-2 text-[11px] text-amber-400">
              © {new Date().getFullYear()} JNTUA CLMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
