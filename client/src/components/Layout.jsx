import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, FileText, Layers, Gamepad2, MessageCircle,
  Calendar, Trophy, User, LogOut, Menu, X, BookOpen, Zap, Star
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/notes", icon: FileText, label: "My Notes" },
  { to: "/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/quiz", icon: Gamepad2, label: "Quiz Arena" },
  { to: "/tutor", icon: MessageCircle, label: "AI Tutor" },
  { to: "/study-plan", icon: Calendar, label: "Study Plan" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const xpToNext = 100 - (user?.xp % 100 || 0);
  const xpPercent = ((user?.xp % 100) / 100) * 100;

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:99, backdropFilter:"blur(4px)" }} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid var(--border-light)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BookOpen size={20} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:"1.1rem" }}>Study<span className="text-accent">Mate</span></span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10,
                marginBottom:2, textDecoration:"none", fontWeight:600, fontSize:"0.88rem",
                transition:"all 0.15s",
                background: isActive ? "rgba(108,99,255,0.15)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              })}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User profile bottom */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid var(--border-light)" }}>
          {/* XP Bar */}
          <div style={{ padding:"10px 12px", background:"var(--bg-primary)", borderRadius:10, marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:"0.75rem", color:"var(--text-muted)", fontWeight:600 }}>
                <Zap size={12} style={{ display:"inline", verticalAlign:"middle", color:"var(--accent-4)" }} /> Level {user?.level || 1}
              </span>
              <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{user?.xp || 0} XP</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${xpPercent}%` }} />
            </div>
            <div style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:4, textAlign:"right" }}>{xpToNext} XP to next level</div>
          </div>

          {/* Streak */}
          {(user?.streak || 0) > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", marginBottom:6, background:"rgba(247,201,72,0.08)", borderRadius:8 }}>
              <Star size={14} color="var(--accent-4)" />
              <span style={{ fontSize:"0.78rem", color:"var(--accent-4)", fontWeight:600 }}>{user.streak} day streak!</span>
            </div>
          )}

          <NavLink to="/profile" onClick={() => setSidebarOpen(false)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, textDecoration:"none", marginBottom:4, transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <div style={{ width:32, height:32, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.9rem", color:"white" }}>
              {user?.avatar || user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:"0.85rem", fontWeight:700, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name}</div>
              <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.email}</div>
            </div>
          </NavLink>

          <button onClick={handleLogout} className="btn btn-secondary btn-sm w-full" style={{ justifyContent:"center", gap:8 }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Mobile topbar */}
        <div style={{ display:"none", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border-light)", position:"sticky", top:0, zIndex:50 }}
          className="mobile-topbar" id="mobile-topbar">
          <button onClick={() => setSidebarOpen(true)} className="btn btn-secondary btn-icon">
            <Menu size={20} />
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BookOpen size={16} color="white" />
            </div>
            <span style={{ fontWeight:800, fontSize:"1rem" }}>Study<span className="text-accent">Mate</span></span>
          </div>
          <div style={{ width:40 }} />
        </div>

        <style>{`
          @media (max-width: 768px) {
            #mobile-topbar { display: flex !important; }
          }
        `}</style>

        <Outlet />
      </div>
    </div>
  );
}
