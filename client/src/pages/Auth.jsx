import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { BookOpen, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";

export default function Auth({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isLogin = mode === "login";

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back! 👋");
      } else {
        if (!form.name.trim()) return toast.error("Name is required");
        if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
        await register(form.name, form.email, form.password);
        toast.success("Account created! Let's study! 🚀");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"var(--bg-primary)", position:"relative" }}>
      {/* bg glow */}
      <div style={{ position:"fixed", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:500, height:500, background:"radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:420 }} className="animate-fade">
        {/* Back */}
        <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--text-secondary)", fontSize:"0.85rem", textDecoration:"none", marginBottom:32 }}>
          <ArrowLeft size={16} /> Back to home
        </Link>

        {/* Card */}
        <div className="card" style={{ padding:36 }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ width:52, height:52, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
              <BookOpen size={26} color="white" />
            </div>
            <h1 style={{ fontWeight:800, fontSize:"1.4rem" }}>Study<span style={{ color:"var(--accent)" }}>Mate</span></h1>
            <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem", marginTop:6 }}>
              {isLogin ? "Welcome back! Ready to learn?" : "Create your free account"}
            </p>
          </div>

          <form onSubmit={handle}>
            {!isLogin && (
              <div style={{ marginBottom:16 }}>
                <label className="label">Full Name</label>
                <div style={{ position:"relative" }}>
                  <User size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                  <input className="input" style={{ paddingLeft:40 }} type="text" placeholder="Your name" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>
            )}

            <div style={{ marginBottom:16 }}>
              <label className="label">Email</label>
              <div style={{ position:"relative" }}>
                <Mail size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                <input className="input" style={{ paddingLeft:40 }} type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label className="label">Password</label>
              <div style={{ position:"relative" }}>
                <Lock size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                <input className="input" style={{ paddingLeft:40, paddingRight:44 }} type={showPass ? "text" : "password"}
                  placeholder={isLogin ? "Your password" : "Min. 6 characters"} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <span className="animate-spin" style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", display:"inline-block" }} /> : (isLogin ? "Sign In 🚀" : "Create Account 🎉")}
            </button>
          </form>

          <div style={{ marginTop:20, textAlign:"center", color:"var(--text-secondary)", fontSize:"0.88rem" }}>
            {isLogin ? (
              <>Don't have an account? <Link to="/register" style={{ color:"var(--accent)", fontWeight:600, textDecoration:"none" }}>Sign up free</Link></>
            ) : (
              <>Already have an account? <Link to="/login" style={{ color:"var(--accent)", fontWeight:600, textDecoration:"none" }}>Sign in</Link></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
