import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Sparkles, FileText, Trash2, BookOpen } from "lucide-react";

export default function Tutor() {
  const [messages, setMessages] = useState([{ role:"assistant", content:"Hi! I'm your AI study tutor 🎓 Ask me anything — I can explain concepts, help you understand your notes, give examples, or quiz you on any topic. What are you studying today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { api.get("/notes").then(r=>setNotes(r.data)).catch(()=>{}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input.trim() };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/tutor", {
        messages: [...messages, userMsg].map(m=>({ role:m.role, content:m.content })),
        noteContext: selectedNote?.content?.slice(0,4000),
      });
      setMessages(p => [...p, { role:"assistant", content:data.reply }]);
    } catch(err) {
      toast.error("Tutor unavailable. Check your Groq API key.");
      setMessages(p => [...p, { role:"assistant", content:"Sorry, I'm having trouble connecting right now. Please check the API configuration." }]);
    } finally { setLoading(false); }
  };

  const clear = () => {
    setMessages([{ role:"assistant", content:"Chat cleared! What would you like to study?" }]);
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const suggestions = ["Explain this concept simply","Give me 3 practice questions","What are the key points?","Create a quick summary","How does this relate to…"];

  return (
    <div className="page" style={{ paddingTop:24, display:"flex", flexDirection:"column", height:"calc(100vh - 48px)", maxWidth:860 }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom:16 }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:"1.4rem", marginBottom:2 }}>AI Tutor</h1>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem" }}>Your personal 24/7 study assistant</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setShowNotes(p=>!p)} className={`btn btn-secondary btn-sm ${selectedNote?"":"" }`}>
            <FileText size={14}/> {selectedNote ? `📎 ${selectedNote.title.slice(0,16)}…` : "Add Context"}
          </button>
          <button onClick={clear} className="btn btn-secondary btn-sm"><Trash2 size={14}/></button>
        </div>
      </div>

      {/* Note picker */}
      {showNotes && (
        <div className="card" style={{ marginBottom:12, padding:14 }}>
          <div style={{ fontSize:"0.82rem", fontWeight:700, color:"var(--text-muted)", marginBottom:10 }}>📚 Give the tutor context from your notes:</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={()=>{setSelectedNote(null);setShowNotes(false);}} className={`btn btn-sm ${!selectedNote?"btn-primary":"btn-secondary"}`}>None</button>
            {notes.map(n=>(
              <button key={n.id} onClick={()=>{setSelectedNote(n);setShowNotes(false);}} className={`btn btn-sm ${selectedNote?.id===n.id?"btn-primary":"btn-secondary"}`} style={{ maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {n.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:14, paddingBottom:8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", animation:"fadeIn 0.2s ease" }}>
            <div style={{ width:34, height:34, borderRadius:10, background:msg.role==="assistant"?"linear-gradient(135deg,var(--accent),var(--accent-2))":"var(--bg-hover)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
              {msg.role==="assistant" ? <Bot size={18} color="white"/> : <User size={18} color="var(--text-secondary)"/>}
            </div>
            <div style={{ flex:1, maxWidth:"85%" }}>
              <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", marginBottom:4, fontWeight:600 }}>
                {msg.role==="assistant"?"StudyMate AI":"You"}
              </div>
              <div style={{ background:msg.role==="assistant"?"var(--bg-card)":"rgba(108,99,255,0.1)", border:`1px solid ${msg.role==="assistant"?"var(--border-light)":"rgba(108,99,255,0.2)"}`, borderRadius:msg.role==="assistant"?"4px 16px 16px 16px":"16px 4px 16px 16px", padding:"12px 16px", fontSize:"0.9rem", lineHeight:1.7 }}>
                {msg.role==="assistant" ? (
                  <div className="markdown-content" style={{ color:"var(--text-primary)" }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span style={{ color:"var(--text-primary)" }}>{msg.content}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Bot size={18} color="white"/>
            </div>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-light)", borderRadius:"4px 16px 16px 16px", padding:"14px 18px", display:"flex", gap:6, alignItems:"center" }}>
              {[0,1,2].map(i=><div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
          {suggestions.map(s => (
            <button key={s} onClick={()=>{setInput(s);textareaRef.current?.focus();}} style={{ padding:"6px 12px", borderRadius:99, border:"1px solid var(--border)", background:"var(--bg-secondary)", color:"var(--text-secondary)", fontSize:"0.78rem", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="";e.currentTarget.style.color="";}}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display:"flex", gap:10, background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"10px 14px", alignItems:"flex-end" }}>
        <textarea ref={textareaRef} value={input} onChange={e=>{setInput(e.target.value);autoResize(e);}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Ask me anything about your studies… (Enter to send, Shift+Enter for new line)" rows={1}
          style={{ flex:1, background:"transparent", border:"none", color:"var(--text-primary)", fontFamily:"var(--font)", fontSize:"0.9rem", resize:"none", outline:"none", lineHeight:1.6, maxHeight:160 }} />
        <button onClick={send} disabled={loading||!input.trim()} className="btn btn-primary" style={{ padding:"10px 16px", flexShrink:0 }}>
          <Send size={16}/>
        </button>
      </div>
    </div>
  );
}
