import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Calendar, Clock, Target, BookOpen, Sparkles, Loader, ChevronRight, Zap, Brain, Trophy } from "lucide-react";

const PRESETS = [
  { label: "Exam in 1 week", subject: "", duration: "1 week (2-3 hours/day)", goals: "Pass the upcoming exam with a high score" },
  { label: "Learn a new subject", subject: "", duration: "1 month (1 hour/day)", goals: "Build a solid foundation in the subject" },
  { label: "Quick revision", subject: "", duration: "3 days (4 hours/day)", goals: "Revise key concepts quickly before an exam" },
];

export default function StudyPlan() {
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("2 weeks (2 hours/day)");
  const [goals, setGoals] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [style, setStyle] = useState("balanced");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    if (!subject.trim() || !goals.trim()) return toast.error("Fill in subject and goals");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/study-plan", {
        subject: `${subject} (level: ${level}, style: ${style})`,
        duration,
        goals,
      });
      setPlan(data.plan);
      setGenerated(true);
      toast.success("Study plan created! 🎯");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setPlan(""); setGenerated(false); setSubject(""); setGoals(""); };

  return (
    <div className="page" style={{ paddingTop: 32, maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, var(--accent-5), var(--accent))", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={22} color="white" />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: "1.6rem" }}>Study Plan Generator</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginLeft: 54 }}>
          Let AI craft a personalized, day-by-day study schedule tailored to your goals
        </p>
      </div>

      {!generated ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick presets */}
          <div>
            <label className="label" style={{ marginBottom: 10 }}>Quick Presets</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { setDuration(p.duration); setGoals(p.goals); }}
                  className="btn btn-secondary btn-sm" style={{ borderRadius: 99 }}>
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Subject */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">📚 Subject / Topic</label>
              <input className="input" placeholder="e.g. Organic Chemistry, World War II, Calculus…"
                value={subject} onChange={e => setSubject(e.target.value)} />
            </div>

            {/* Duration */}
            <div>
              <label className="label">⏱ Available Time</label>
              <select className="input" value={duration} onChange={e => setDuration(e.target.value)}>
                {["3 days (4 hours/day)", "1 week (2-3 hours/day)", "2 weeks (2 hours/day)", "1 month (1 hour/day)", "3 months (45 min/day)", "6 months (30 min/day)"].map(d =>
                  <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="label">🎯 Your Level</label>
              <select className="input" value={level} onChange={e => setLevel(e.target.value)}>
                <option value="beginner">Beginner (starting fresh)</option>
                <option value="intermediate">Intermediate (some knowledge)</option>
                <option value="advanced">Advanced (deep dive)</option>
                <option value="exam-prep">Exam Prep (intensive review)</option>
              </select>
            </div>

            {/* Learning style */}
            <div>
              <label className="label">🧠 Learning Style</label>
              <select className="input" value={style} onChange={e => setStyle(e.target.value)}>
                <option value="balanced">Balanced (theory + practice)</option>
                <option value="visual">Visual (diagrams, mind maps)</option>
                <option value="practice">Practice-heavy (problems, quizzes)</option>
                <option value="reading">Reading & note-taking</option>
                <option value="spaced">Spaced repetition focused</option>
              </select>
            </div>

            {/* Goals */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">🏆 Goals & Objectives</label>
              <textarea className="input" placeholder="What do you want to achieve? e.g. Pass my final exam, understand the fundamentals, be able to solve complex problems…"
                value={goals} onChange={e => setGoals(e.target.value)} style={{ minHeight: 90 }} />
            </div>
          </div>

          {/* Stats preview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { icon: Brain, color: "var(--accent)", label: "AI-Personalized", val: "Smart scheduling" },
              { icon: Target, color: "var(--accent-2)", label: "Goal-Oriented", val: "Milestone tracking" },
              { icon: Trophy, color: "var(--accent-4)", label: "Adaptive", val: "Fits your pace" },
            ].map(({ icon: Icon, color, label, val }) => (
              <div key={label} style={{ background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: "var(--radius)", padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                <Icon size={20} color={color} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color }}>{label}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={generate} className="btn btn-primary btn-lg" disabled={loading || !subject.trim() || !goals.trim()}>
            {loading
              ? <><Loader size={18} className="animate-spin" /> Crafting your plan…</>
              : <><Sparkles size={18} /> Generate My Study Plan</>}
          </button>
        </div>
      ) : (
        <div>
          {/* Plan actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>📋 Your Personalized Plan</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{subject} · {duration}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(plan); toast.success("Copied!"); }} className="btn btn-secondary btn-sm">📋 Copy</button>
            <button onClick={reset} className="btn btn-secondary btn-sm">🔄 New Plan</button>
          </div>

          {/* Plan content */}
          <div className="card" style={{ padding: 32 }}>
            <div style={{
              fontSize: "0.9rem", lineHeight: 1.8, color: "var(--text-primary)",
              "--heading-color": "var(--accent)", "--strong-color": "var(--text-primary)",
            }}>
              <style>{`
                .plan-md h1,.plan-md h2,.plan-md h3 { color: var(--accent); font-weight: 800; margin: 20px 0 10px; }
                .plan-md h1 { font-size: 1.3rem; } .plan-md h2 { font-size: 1.1rem; } .plan-md h3 { font-size: 1rem; }
                .plan-md ul,.plan-md ol { padding-left: 20px; margin: 8px 0; }
                .plan-md li { margin: 4px 0; color: var(--text-secondary); }
                .plan-md strong { color: var(--text-primary); font-weight: 700; }
                .plan-md p { margin: 8px 0; color: var(--text-secondary); }
                .plan-md hr { border: none; border-top: 1px solid var(--border-light); margin: 20px 0; }
                .plan-md code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; color: var(--accent-2); }
                .plan-md blockquote { border-left: 3px solid var(--accent); padding-left: 16px; margin: 12px 0; color: var(--text-muted); font-style: italic; }
              `}</style>
              <div className="plan-md">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* CTA after plan */}
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <a href="/notes" className="btn btn-primary"><BookOpen size={16} /> Add Notes for This Topic</a>
            <a href="/quiz" className="btn btn-secondary"><Zap size={16} /> Create a Quiz</a>
          </div>
        </div>
      )}
    </div>
  );
}
