import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Trophy, Zap, Flame, Medal, Crown, TrendingUp, Star } from "lucide-react";

// In a real app this would come from the API
// For now we'll show the current user + simulated demo players
const DEMO_PLAYERS = [
  { name: "Sophia K.", xp: 2840, level: 29, streak: 14, notes: 47, avatar: "S", color: "#6C63FF" },
  { name: "James M.", xp: 2210, level: 23, streak: 9, notes: 38, avatar: "J", color: "#FF6B9D" },
  { name: "Aisha N.", xp: 1980, level: 20, streak: 21, notes: 52, avatar: "A", color: "#43E97B" },
  { name: "Lucas P.", xp: 1650, level: 17, streak: 6, notes: 29, avatar: "L", color: "#F7C948" },
  { name: "Emma T.", xp: 1430, level: 15, streak: 12, notes: 33, avatar: "E", color: "#38B2FF" },
  { name: "Noah R.", xp: 1200, level: 13, streak: 4, notes: 21, avatar: "N", color: "#A78BFA" },
  { name: "Mia C.", xp: 980, level: 10, streak: 7, notes: 18, avatar: "M", color: "#FF6363" },
  { name: "Ethan B.", xp: 760, level: 8, streak: 2, notes: 14, avatar: "E", color: "#34D399" },
  { name: "Chloe W.", xp: 540, level: 6, streak: 5, notes: 10, avatar: "C", color: "#FBBF24" },
];

const RANK_BADGES = {
  0: { emoji: "🥇", color: "#F7C948", glow: "rgba(247,201,72,0.3)" },
  1: { emoji: "🥈", color: "#C0C0C0", glow: "rgba(192,192,192,0.3)" },
  2: { emoji: "🥉", color: "#CD7F32", glow: "rgba(205,127,50,0.3)" },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("xp");

  const myEntry = {
    name: user?.name || "You",
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
    notes: 0,
    avatar: user?.name?.charAt(0).toUpperCase() || "Y",
    color: "var(--accent)",
    isMe: true,
  };

  const allPlayers = [...DEMO_PLAYERS, myEntry];

  const sorted = {
    xp: [...allPlayers].sort((a, b) => b.xp - a.xp),
    streak: [...allPlayers].sort((a, b) => b.streak - a.streak),
    level: [...allPlayers].sort((a, b) => b.level - a.level),
  };

  const players = sorted[tab];
  const myRank = players.findIndex(p => p.isMe) + 1;

  return (
    <div className="page" style={{ paddingTop: 32, maxWidth: 720 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, var(--accent-4), #FF6B9D)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Trophy size={32} color="white" />
        </div>
        <h1 style={{ fontWeight: 800, fontSize: "1.8rem", marginBottom: 6 }}>Global Leaderboard</h1>
        <p style={{ color: "var(--text-secondary)" }}>Compete with students worldwide. Study more, earn more XP!</p>
      </div>

      {/* My rank card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,107,157,0.1))",
        border: "1px solid rgba(108,99,255,0.3)", borderRadius: "var(--radius)", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem", color: "white" }}>
            {myEntry.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{myEntry.name} <span style={{ color: "var(--accent)", fontSize: "0.8rem" }}>(You)</span></div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Rank #{myRank} globally</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: "var(--accent-4)" }}>{myEntry.xp}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>XP</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: "var(--accent)" }}>Lvl {myEntry.level}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Level</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, color: "#FF6363" }}>{myEntry.streak}🔥</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Streak</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${tab === "xp" ? "active" : ""}`} onClick={() => setTab("xp")}><Zap size={13} /> XP</button>
        <button className={`tab ${tab === "streak" ? "active" : ""}`} onClick={() => setTab("streak")}><Flame size={13} /> Streaks</button>
        <button className={`tab ${tab === "level" ? "active" : ""}`} onClick={() => setTab("level")}><TrendingUp size={13} /> Levels</button>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
        {[players[1], players[0], players[2]].map((p, i) => {
          if (!p) return <div key={i} />;
          const actualRank = i === 0 ? 1 : i === 1 ? 0 : 2;
          const badge = RANK_BADGES[actualRank];
          const heights = ["120px", "150px", "100px"];
          const val = tab === "xp" ? `${p.xp} XP` : tab === "streak" ? `${p.streak}🔥` : `Lvl ${p.level}`;
          return (
            <div key={p.name} style={{
              background: `${badge.color}12`, border: `2px solid ${badge.color}40`,
              borderRadius: "var(--radius)", padding: "16px 12px", textAlign: "center",
              height: heights[i], display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 6, boxShadow: `0 0 20px ${badge.glow}`,
              transition: "transform 0.2s",
            }}>
              <span style={{ fontSize: "1.6rem" }}>{badge.emoji}</span>
              <div style={{ width: 40, height: 40, background: p.color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: "1rem" }}>
                {p.avatar}
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{p.name}</div>
              <div style={{ fontWeight: 800, color: badge.color, fontSize: "0.85rem" }}>{val}</div>
            </div>
          );
        })}
      </div>

      {/* Full ranking list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {players.map((p, i) => {
          const badge = RANK_BADGES[i];
          const val = tab === "xp" ? `${p.xp} XP` : tab === "streak" ? `${p.streak} days 🔥` : `Level ${p.level}`;
          const val2 = tab === "xp" ? `Lvl ${p.level}` : tab === "streak" ? `${p.xp} XP` : `${p.xp} XP`;
          return (
            <div key={`${p.name}-${i}`} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              background: p.isMe ? "rgba(108,99,255,0.08)" : "var(--bg-card)",
              border: `1px solid ${p.isMe ? "rgba(108,99,255,0.3)" : badge ? `${badge.color}30` : "var(--border-light)"}`,
              borderRadius: "var(--radius)", transition: "transform 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>
              {/* Rank */}
              <div style={{ width: 32, textAlign: "center", fontSize: badge ? "1.2rem" : "0.9rem", fontWeight: 800, color: badge ? badge.color : "var(--text-muted)", flexShrink: 0 }}>
                {badge ? badge.emoji : `#${i + 1}`}
              </div>
              {/* Avatar */}
              <div style={{ width: 40, height: 40, background: p.color, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", flexShrink: 0 }}>
                {p.avatar}
              </div>
              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name} {p.isMe && <span style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 600 }}>• You</span>}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{val2}</div>
              </div>
              {/* Primary value */}
              <div style={{ fontWeight: 800, color: badge ? badge.color : "var(--text-primary)", fontSize: "0.95rem", flexShrink: 0 }}>{val}</div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 24, color: "var(--text-muted)", fontSize: "0.8rem" }}>
        ✨ Study daily to climb the leaderboard! Every note and quiz earns XP.
      </div>
    </div>
  );
}
