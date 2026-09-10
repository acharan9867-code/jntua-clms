import React from "react";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LayoutDashboard, Bookmark, Receipt, FileBarChart, Settings, LogOut, Users, Repeat } from "lucide-react";

interface NavbarProps { currentTab: string; setCurrentTab: (tab: string) => void; }

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    if (!user) return [{ id: "catalog", label: "Browse Catalog", icon: BookOpen }];
    if (user.role === "admin") return [
      { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "catalog", label: "Book Catalog", icon: BookOpen },
      { id: "counter-issue", label: "Counter Issues", icon: Repeat },
      { id: "reservations", label: "Reservations", icon: Bookmark },
      { id: "admin-fines", label: "Fine Management", icon: Receipt },
      { id: "members", label: "Members", icon: Users },
      { id: "reports", label: "Reports", icon: FileBarChart },
      { id: "settings", label: "Settings", icon: Settings },
    ];
    return [
      { id: "dashboard", label: user.role === "faculty" ? "Faculty Portal" : "My Dashboard", icon: LayoutDashboard },
      { id: "catalog", label: "Search & Borrow", icon: BookOpen },
      { id: "my-books", label: "My Books", icon: Repeat },
      { id: "reservations", label: "Reservations", icon: Bookmark },
      { id: "fines-history", label: "Fines & History", icon: Receipt },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="sticky top-0 z-40 shadow-lg"
      style={{ background: "rgba(15,23,42,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(56,189,248,0.12)" }}>
      {/* Subtle glow line at top */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Nav Tabs */}
          <div className="flex items-center space-x-0.5 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button key={item.id} onClick={() => setCurrentTab(item.id)}
                  className="btn-ripple flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                  style={isActive
                    ? { background: "linear-gradient(135deg, #0EA5E9, #38BDF8)", color: "#0F172A", boxShadow: "0 0 14px rgba(56,189,248,0.4)" }
                    : { color: "#64748B", background: "transparent" }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "#38BDF8"; (e.currentTarget as HTMLElement).style.background = "rgba(56,189,248,0.08)"; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "#64748B"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}>
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User + Logout */}
          {user ? (
            <div className="flex items-center gap-3 pl-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold" style={{ color: "#F8FAFC" }}>{user.name}</div>
                <div className="text-[10px] flex items-center justify-end gap-1.5" style={{ color: "#38BDF8" }}>
                  <span>{user.member_id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold"
                    style={{ background: "rgba(56,189,248,0.15)", color: "#7DD3FC", border: "1px solid rgba(56,189,248,0.25)" }}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button onClick={logout} title="Logout"
                className="btn-ripple p-2 rounded-lg transition-all"
                style={{ color: "#64748B", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#FCA5A5"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748B"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setCurrentTab("login")}
              className="btn-ripple btn-electric px-4 py-1.5 text-xs">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
