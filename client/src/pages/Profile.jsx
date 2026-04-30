import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { User, Zap, Star, Trophy, FileText, Layers, Gamepad2, Shield, Edit3, Check, X, Camera, TrendingUp, Award, Flame } from "lucide-react";

const ACHIEVEMENTS = [
  { id: "first_note", icon: "📄", label: "First Note", desc: "Upload or create your first note", xp: 10, check: (s) => s.notes >= 1 },
  { id: "note_collector", icon: "📚", label: "Note Collector", desc: "Create 10 notes", xp: 50, check: (s) => s.notes >= 10 },
  { id: "flashcard_maker", icon: "🃏", label: "Flashcard Maker", desc: "Generate your first flashcard set", xp: 20, check: (s) => s.flashcards >= 1 },
  { id: "quiz_master", icon: "🎯", label: "Quiz Master", desc: "Complete 5 quizzes", xp: 75, check: (s) => s.quizzes >= 5 },
  { id: "streak_3", icon: "🔥", label: "On Fire", desc: "3-day study streak", xp: 30, check: (s) => s.streak >= 3 },
  { id: "streak_7", icon: "⚡", label: "Week Warrior", desc: "7-day study streak", xp: 100, check: (s) => s.streak >= 7 },
  { id: "level_5", icon: "🌟", label: "Rising Star", desc: "Reach Level 5", xp: 50, check: (s) => s.level >= 5 },
  { id: "level_10", icon: "👑", label: "Scholar", desc: "Reach Level 10", xp: 150, check: (s) => s.level >= 10 },
];

const LEVEL_TITLES = ["Newcomer","Curious Mind","Eager Learner","Knowledge Seeker","Study Warrior","Academic","Scholar","Expert","Master","Grandmaster","Legend"];

export default function Profile() {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { api.get("/notes").then(r => setNotes(r.data)).catch(() => {}); }, []);

  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpInLevel = xp % 100;
  const xpPct = xpInLevel;
  const streak = user?.streak || 0;
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  const stats = { notes: notes.length, flashcards: notes.reduce((a, n) => a + (n.flashcards?.length || 0), 0), quizzes: 0, streak, level, xp };

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(stats));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.check(stats));

  const colors = ["#6C63FF", "#FF6B9D", "#43E97B", "#F7C948", "#38B2FF", "#FF6363", "#A78BFA", "#34D399"];
  const userColor = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="page" style={{ paddingTop: 32, maxWidth: 860 }}>
      {/* Profile hero card */}
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
        {/* Banner */}
        <div style={{ height: 100, background: `linear-gradient(135deg, ${userColor}55, ${userColor}22)`, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
        </div>

        <div style={{ padding: "0 28px 28px", marginTop: -40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${userColor}, ${userColor}aa)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: "white", border: "3px solid var(--bg-card)" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ position: "absolute", bottom: -4, right: -4, background: "var(--accent-4)", borderRadius: 8, padding: "2px 6px", fontSize: "0.7rem", fontWeight: 800, color: "#000", border: "2px solid var(--bg-card)" }}>
                {level}
              </div>
            </div>

            {/* Edit button */}
            {!editing
              ? <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm"><Edit3 size={14} /> Edit Profile</button>
              : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditing(false)} className="btn btn-secondary btn-sm"><X size={14} /></button>
                  <button onClick={() => { toast.success("Profile updated!"); setEditing(false); }} className="btn btn-primary btn-sm"><Check size={14} /> Save</button>
                </div>
              )}
          </div>

          <div style={{ marginTop: 14 }}>
            {editing ? (
              <input className="input" value={nameInput} onChange={e => setNameInput(e.target.value)} style={{ maxWidth: 280, marginBottom: 6 }} />
            ) : (
              <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: 2 }}>{user?.name}</h2>
            )}
            <div style={{ color: userColor, fontWeight: 700, fontSize: "0.85rem", marginBottom: 4 }}>{levelTitle}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{user?.email}</div>
          </div>

          {/* XP Bar */}
          <div style={{ marginTop: 18, maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                <Zap size={11} style={{ display: "inline", verticalAlign: "middle" }} /> Level {level} — {levelTitle}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{xpInLevel}/100 XP</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
              {100 - xpInLevel} XP to Level {level + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {["overview", "achievements", "settings"].map(t => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
            {[
              { icon: Zap, color: "var(--accent-4)", label: "Total XP", val: `${xp.toLocaleString()} XP` },
              { icon: TrendingUp, color: "var(--accent)", label: "Level", val: level },
              { icon: Flame, color: "#FF6363", label: "Day Streak", val: `${streak} 🔥` },
              { icon: FileText, color: "var(--accent-5)", label: "Notes", val: stats.notes },
              { icon: Layers, color: "var(--accent-2)", label: "Flashcards", val: stats.flashcards },
              { icon: Award, color: "var(--accent-3)", label: "Badges", val: unlockedAchievements.length },
            ].map(({ icon: Icon, color, label, val }) => (
              <div key={label} className="card" style={{ textAlign: "center", padding: "18px 12px" }}>
                <Icon size={22} color={color} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 800, fontSize: "1.3rem", color }}>{val}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: "0.95rem" }}>🏆 Recent Achievements</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {unlockedAchievements.map(a => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(67,233,123,0.08)", border: "1px solid rgba(67,233,123,0.2)", borderRadius: 99 }}>
                    <span style={{ fontSize: "1.1rem" }}>{a.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--accent-3)" }}>{a.label}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{a.xp}xp</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements tab */}
      {activeTab === "achievements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--accent-3)" }}>✅ Unlocked ({unlockedAchievements.length})</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {unlockedAchievements.map(a => (
                  <div key={a.id} className="card" style={{ display: "flex", gap: 14, alignItems: "center", border: "1px solid rgba(67,233,123,0.25)", background: "rgba(67,233,123,0.05)" }}>
                    <span style={{ fontSize: "2rem" }}>{a.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--accent-3)" }}>{a.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{a.desc}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--accent-4)", marginTop: 4 }}>+{a.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lockedAchievements.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 14, color: "var(--text-muted)" }}>🔒 Locked ({lockedAchievements.length})</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {lockedAchievements.map(a => (
                  <div key={a.id} className="card" style={{ display: "flex", gap: 14, alignItems: "center", opacity: 0.5, filter: "grayscale(0.5)" }}>
                    <span style={{ fontSize: "2rem" }}>{a.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.label}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{a.desc}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>+{a.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {activeTab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem" }}>Account</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="label">Display Name</label>
                <input className="input" value={nameInput} onChange={e => setNameInput(e.target.value)} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={user?.email || ""} disabled style={{ opacity: 0.6 }} />
              </div>
              <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-end" }} onClick={() => toast.success("Saved!")}>
                <Check size={14} /> Save Changes
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem" }}>Danger Zone</h3>
            <button onClick={() => { if (confirm("Are you sure you want to sign out?")) logout(); }} className="btn btn-danger w-full">
              Sign Out of StudyMate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
