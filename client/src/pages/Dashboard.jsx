import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { FileText, Layers, Gamepad2, MessageCircle, Plus, Clock, Zap, TrendingUp, BookOpen, ChevronRight, Star, Sparkles, Calendar, Brain, Trophy, ArrowUpRight } from "lucide-react";

function ActivityHeatmap({ notes }) {
  // Generate last 52 weeks of activity data
  const today = new Date();
  const days = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (83 - i));
    const dateStr = d.toDateString();
    const hasActivity = notes.some(n => new Date(n.createdAt).toDateString() === dateStr);
    return { date: d, active: hasActivity };
  });

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div>
      <div style={{ display:"flex", gap:3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {week.map((day, di) => (
              <div key={di} title={day.date.toLocaleDateString()}
                style={{ width:10, height:10, borderRadius:2, background: day.active ? "var(--accent)" : "var(--bg-secondary)", opacity: day.active ? 1 : 0.4, cursor:"default", transition:"transform 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.5)"}
                onMouseLeave={e => e.currentTarget.style.transform=""} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:6, marginTop:8 }}>
        <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>Less</span>
        {[0.15, 0.4, 0.7, 1].map(o => (
          <div key={o} style={{ width:10, height:10, borderRadius:2, background:"var(--accent)", opacity:o }} />
        ))}
        <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>More</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notes").then(r => setNotes(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const recent = notes.slice(0, 4);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickActions = [
    { to: "/notes", icon: Plus, label: "New Note", color: "var(--accent)", desc: "Upload or write" },
    { to: "/flashcards", icon: Layers, label: "Flashcards", color: "var(--accent-2)", desc: "Review your cards" },
    { to: "/quiz", icon: Gamepad2, label: "Quiz Arena", color: "var(--accent-3)", desc: "Solo or multiplayer" },
    { to: "/tutor", icon: MessageCircle, label: "AI Tutor", color: "var(--accent-5)", desc: "Ask anything" },
  ];

  const stats = [
    { label: "Notes Created", value: notes.length, icon: FileText, color: "var(--accent)" },
    { label: "Current Level", value: `Lvl ${user?.level || 1}`, icon: TrendingUp, color: "var(--accent-2)" },
    { label: "Total XP", value: `${user?.xp || 0} XP`, icon: Zap, color: "var(--accent-4)" },
    { label: "Day Streak", value: `${user?.streak || 0} 🔥`, icon: Star, color: "var(--accent-3)" },
  ];

  return (
    <div className="page" style={{ paddingTop:32 }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:"1.8rem", fontWeight:800, marginBottom:6 }}>
          {greeting}, <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p style={{ color:"var(--text-secondary)" }}>Ready to learn something amazing today?</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:32 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, background:`${color}18`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize:"1.3rem", fontWeight:800, color }}>{value}</div>
              <div style={{ fontSize:"0.78rem", color:"var(--text-muted)", fontWeight:500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* XP progress */}
      <div className="card" style={{ marginBottom:32, padding:"20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Zap size={18} color="var(--accent-4)" />
            <span style={{ fontWeight:700 }}>Level {user?.level || 1} Progress</span>
          </div>
          <span style={{ color:"var(--text-muted)", fontSize:"0.85rem" }}>{user?.xp % 100 || 0}/100 XP</span>
        </div>
        <div className="progress-bar" style={{ height:10 }}>
          <div className="progress-fill" style={{ width:`${((user?.xp % 100) || 0)}%` }} />
        </div>
        <div style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginTop:6 }}>
          {100 - (user?.xp % 100 || 0)} XP until Level {(user?.level || 1) + 1}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontWeight:700, marginBottom:16, fontSize:"1rem" }}>Quick Actions</h2>
        <div className="grid-4">
          {quickActions.map(({ to, icon: Icon, label, color, desc }) => (
            <Link key={to} to={to} className="card" style={{ textDecoration:"none", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, gap:12, cursor:"pointer", transition:"all 0.2s", textAlign:"center" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform="translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform=""; }}>
              <div style={{ width:52, height:52, background:`${color}18`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={26} color={color} />
              </div>
              <div>
                <div style={{ fontWeight:700, marginBottom:2 }}>{label}</div>
                <div style={{ color:"var(--text-muted)", fontSize:"0.78rem" }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent notes */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex-between" style={{ marginBottom:16 }}>
          <h2 style={{ fontWeight:700, fontSize:"1rem" }}>Recent Notes</h2>
          <Link to="/notes" style={{ color:"var(--accent)", fontSize:"0.85rem", fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:14 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:100, borderRadius:16 }} />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="card" style={{ textAlign:"center", padding:48 }}>
            <BookOpen size={40} color="var(--text-muted)" style={{ margin:"0 auto 12px" }} />
            <div style={{ color:"var(--text-secondary)", fontWeight:600, marginBottom:8 }}>No notes yet</div>
            <p style={{ color:"var(--text-muted)", fontSize:"0.85rem", marginBottom:20 }}>Upload a document or write your first note to get started</p>
            <Link to="/notes" className="btn btn-primary">
              <Plus size={16} /> Create First Note
            </Link>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:14 }}>
            {recent.map(note => (
              <Link key={note.id} to={`/notes/${note.id}`} className="card hover-lift" style={{ textDecoration:"none", cursor:"pointer" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=""; }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ width:36, height:36, background:"rgba(108,99,255,0.1)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <FileText size={18} color="var(--accent)" />
                  </div>
                  <span style={{ fontSize:"0.72rem", color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}>
                    <Clock size={11} />{new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontWeight:700, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{note.title}</div>
                <div style={{ color:"var(--text-muted)", fontSize:"0.8rem", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                  {note.content?.slice(0, 100) || "No content"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      {notes.length > 0 && (
        <div className="card" style={{ marginBottom:32 }}>
          <div className="flex-between" style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Calendar size={18} color="var(--accent)" />
              <span style={{ fontWeight:700, fontSize:"0.95rem" }}>Study Activity</span>
            </div>
            <span style={{ fontSize:"0.78rem", color:"var(--text-muted)" }}>Last 12 weeks</span>
          </div>
          <ActivityHeatmap notes={notes} />
        </div>
      )}

      {/* Tips section */}
      <div className="card" style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.08),rgba(255,107,157,0.06))", border:"1px solid rgba(108,99,255,0.2)" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
          <div style={{ width:40, height:40, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Sparkles size={20} color="white"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, marginBottom:4, display:"flex", alignItems:"center", gap:8 }}>
              💡 Study Tip of the Day
              <span className="badge badge-accent" style={{ fontSize:"0.68rem" }}>AI Generated</span>
            </div>
            <p style={{ color:"var(--text-secondary)", fontSize:"0.88rem", lineHeight:1.6 }}>
              Use the <strong style={{color:"var(--text-primary)"}}>Pomodoro Technique</strong> — study for 25 minutes, then take a 5-minute break. After 4 rounds, take a longer 15–30 minute break. This helps maintain focus and prevent burnout. Try it with our <Link to="/study-plan" style={{color:"var(--accent)",textDecoration:"none"}}>Study Plan generator</Link>!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
