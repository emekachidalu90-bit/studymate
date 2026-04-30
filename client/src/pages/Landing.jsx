import { Link } from "react-router-dom";
import { BookOpen, Zap, Users, Brain, FileText, Trophy, Star, ChevronRight, Sparkles } from "lucide-react";

const features = [
  { icon: FileText, color: "var(--accent)", title: "Smart Notes", desc: "Upload PDFs, PPTX, DOCX, or type notes. AI summarizes and organizes everything instantly." },
  { icon: Brain, color: "var(--accent-2)", title: "AI Flashcards", desc: "Automatically generate flashcards from any document. Study smarter with spaced repetition." },
  { icon: Zap, color: "var(--accent-4)", title: "Solo Quiz", desc: "Test yourself with AI-generated quizzes from your notes. Track your progress over time." },
  { icon: Users, color: "var(--accent-3)", title: "Multiplayer Quiz", desc: "Host live quiz battles with friends — just like Kahoot but powered by your own notes." },
  { icon: Sparkles, color: "var(--accent-5)", title: "AI Tutor", desc: "Chat with an AI tutor about any topic. Get explanations, examples, and answers 24/7." },
  { icon: Trophy, color: "var(--accent-2)", title: "Leaderboards", desc: "Earn XP, level up, and compete with other students globally." },
];

export default function Landing() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-primary)", overflowX:"hidden" }}>
      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 32px", borderBottom:"1px solid var(--border-light)", position:"sticky", top:0, background:"rgba(15,15,26,0.9)", backdropFilter:"blur(20px)", zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <BookOpen size={20} color="white" />
          </div>
          <span style={{ fontWeight:800, fontSize:"1.2rem" }}>Study<span style={{ color:"var(--accent)" }}>Mate</span></span>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started <ChevronRight size={16} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:"center", padding:"100px 24px 80px", position:"relative" }}>
        {/* Background glow */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, background:"radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div className="animate-fade">
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:99, padding:"6px 16px", marginBottom:24 }}>
            <Sparkles size={14} color="var(--accent)" />
            <span style={{ fontSize:"0.82rem", fontWeight:600, color:"var(--accent)" }}>AI-Powered Study Platform</span>
          </div>

          <h1 style={{ fontSize:"clamp(2.2rem, 6vw, 4rem)", fontWeight:800, lineHeight:1.15, marginBottom:20, maxWidth:700, margin:"0 auto 20px" }}>
            Study Smarter with<br />
            <span className="gradient-text">AI That Gets You</span>
          </h1>
          <p style={{ fontSize:"1.1rem", color:"var(--text-secondary)", maxWidth:520, margin:"0 auto 40px", lineHeight:1.7 }}>
            Upload your notes, generate flashcards, quiz yourself solo or battle friends in real-time. Your personal AI tutor is always ready.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Studying Free <ChevronRight size={18} />
            </Link>
            <Link to="/quiz/join" className="btn btn-secondary btn-lg">
              <Users size={18} /> Join a Quiz
            </Link>
          </div>

          <p style={{ color:"var(--text-muted)", fontSize:"0.82rem", marginTop:16 }}>Free forever · No credit card required</p>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding:"0 24px 64px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[["10K+","Students"],["50K+","Quizzes Played"],["1M+","Flashcards Created"]].map(([n,l]) => (
            <div key={l} className="card" style={{ textAlign:"center", padding:"24px 16px" }}>
              <div style={{ fontSize:"2rem", fontWeight:800, color:"var(--accent)", marginBottom:4 }}>{n}</div>
              <div style={{ color:"var(--text-secondary)", fontSize:"0.85rem" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:"0 24px 80px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontSize:"2rem", fontWeight:800, marginBottom:8 }}>Everything you need to ace your exams</h2>
          <p style={{ textAlign:"center", color:"var(--text-secondary)", marginBottom:48 }}>One platform for all your study needs</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card" style={{ padding:24 }}>
                <div style={{ width:48, height:48, background:`${color}18`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontWeight:700, marginBottom:8 }}>{title}</h3>
                <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem", lineHeight:1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", textAlign:"center", background:"var(--bg-secondary)", borderTop:"1px solid var(--border-light)" }}>
        <h2 style={{ fontSize:"2rem", fontWeight:800, marginBottom:16 }}>Ready to transform how you study?</h2>
        <p style={{ color:"var(--text-secondary)", marginBottom:32, fontSize:"1rem" }}>Join thousands of students already using StudyMate AI</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account <ChevronRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding:"24px", textAlign:"center", color:"var(--text-muted)", fontSize:"0.8rem", borderTop:"1px solid var(--border-light)" }}>
        © {new Date().getFullYear()} StudyMate AI · Built with ❤️ for students everywhere
      </footer>
    </div>
  );
}
