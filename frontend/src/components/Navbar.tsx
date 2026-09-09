import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Bookmark,
  Receipt,
  FileBarChart,
  Settings,
  LogOut,
  Users,
  Repeat
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    if (!user) {
      return [{ id: 'catalog', label: 'Browse Catalog', icon: BookOpen }];
    }

    if (user.role === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'catalog', label: 'Book Catalog', icon: BookOpen },
        { id: 'counter-issue', label: 'Counter Issues', icon: Repeat },
        { id: 'reservations', label: 'Reservations', icon: Bookmark },
        { id: 'admin-fines', label: 'Fine Management', icon: Receipt },
        { id: 'members', label: 'Members Directory', icon: Users },
        { id: 'reports', label: 'Reports', icon: FileBarChart },
        { id: 'settings', label: 'Timings & Rules', icon: Settings }
      ];
    }

    // Student and Faculty Navigation
    return [
      { id: 'dashboard', label: user.role === 'faculty' ? 'Faculty Portal' : 'My Dashboard', icon: LayoutDashboard },
      { id: 'catalog', label: 'Search & Borrow', icon: BookOpen },
      { id: 'my-books', label: 'My Borrowed Books', icon: Repeat },
      { id: 'reservations', label: 'My Reservations', icon: Bookmark },
      { id: 'fines-history', label: 'Fines & History', icon: Receipt }
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-jntua-navy border-b border-blue-950 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Nav Links */}
          <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-inner'
                      : 'text-slate-200 hover:text-white hover:bg-blue-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          {user ? (
            <div className="flex items-center space-x-3 pl-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                <div className="text-[11px] text-amber-300 flex items-center justify-end gap-1">
                  <span>{user.member_id}</span>
                  <span className="px-1.5 py-0.2 bg-blue-950 rounded text-[10px] uppercase font-semibold text-slate-200">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-300 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
