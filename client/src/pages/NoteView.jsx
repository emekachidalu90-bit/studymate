import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Sparkles, Layers, Gamepad2, Brain, Map, Loader, ChevronDown, ChevronUp, Tag, Clock } from "lucide-react";

export default function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [generatingFC, setGeneratingFC] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [mindmap, setMindmap] = useState(null);
  const [generatingMM, setGeneratingMM] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [tab, setTab] = useState("content");

  useEffect(() => {
    api.get(`/notes/${id}`).then(r => { setNote(r.data); setSummary(r.data.summary || ""); }).catch(() => navigate("/notes")).finally(() => setLoading(false));
  }, [id]);

  const summarize = async () => {
    setSummarizing(true);
    try {
      const { data } = await api.post(`/ai/summarize/${id}`);
      setSummary(data.summary);
      setNote(p => ({ ...p, summary: data.summary }));
      toast.success("Summary generated!");
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setSummarizing(false); }
  };

  const generateFlashcards = async () => {
    setGeneratingFC(true);
    try {
      const { data } = await api.post(`/ai/flashcards/${id}`, { count: 15 });
      setNote(p => ({ ...p, flashcards: data.flashcards }));
      toast.success(`${data.flashcards.length} flashcards created!`);
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setGeneratingFC(false); }
  };

  const generateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const { data } = await api.post("/ai/generate-quiz", { content: note.content, count: 10 });
      navigate("/quiz", { state: { questions: data.questions, sourceNote: note } });
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setGeneratingQuiz(false); }
  };

  const generateMindmap = async () => {
    setGeneratingMM(true);
    try {
      const { data } = await api.post(`/ai/mindmap/${id}`);
      setMindmap(data.mindmap);
      setTab("mindmap");
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setGeneratingMM(false); }
  };

  if (loading) return <div className="page flex-center" style={{ paddingTop:80 }}><Loader size={32} className="animate-spin" color="var(--accent)" /></div>;
  if (!note) return null;

  const contentPreview = showFull ? note.content : note.content?.slice(0, 1500);

  return (
    <div className="page" style={{ paddingTop:24, maxWidth:900 }}>
      {/* Back */}
      <Link to="/notes" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--text-secondary)", fontSize:"0.85rem", textDecoration:"none", marginBottom:20 }}>
        <ArrowLeft size={16} /> Back to Notes
      </Link>

      {/* Header */}
      <div className="card" style={{ marginBottom:20, padding:24 }}>
        <h1 style={{ fontWeight:800, fontSize:"1.5rem", marginBottom:10 }}>{note.title}</h1>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:"0.78rem", color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}>
            <Clock size={12} />{new Date(note.createdAt).toLocaleDateString()}
          </span>
          {note.tags?.map(t => <span key={t} className="badge badge-accent" style={{ fontSize:"0.72rem" }}><Tag size={10}/>{t}</span>)}
          {note.flashcards?.length > 0 && <span className="badge badge-pink">{note.flashcards.length} flashcards</span>}
        </div>
      </div>

      {/* AI Action Buttons */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <button onClick={summarize} className="btn btn-secondary" disabled={summarizing}>
          {summarizing ? <Loader size={15} className="animate-spin"/> : <Sparkles size={15}/>}
          {summarizing ? "Summarizing…" : summary ? "Re-summarize" : "AI Summary"}
        </button>
        <button onClick={generateFlashcards} className="btn btn-secondary" disabled={generatingFC}>
          {generatingFC ? <Loader size={15} className="animate-spin"/> : <Layers size={15}/>}
          {generatingFC ? "Generating…" : "Make Flashcards"}
        </button>
        <button onClick={generateQuiz} className="btn btn-secondary" disabled={generatingQuiz}>
          {generatingQuiz ? <Loader size={15} className="animate-spin"/> : <Gamepad2 size={15}/>}
          {generatingQuiz ? "Building Quiz…" : "Create Quiz"}
        </button>
        <button onClick={generateMindmap} className="btn btn-secondary" disabled={generatingMM}>
          {generatingMM ? <Loader size={15} className="animate-spin"/> : <Map size={15}/>}
          {generatingMM ? "Mapping…" : "Mind Map"}
        </button>
        {note.flashcards?.length > 0 && (
          <Link to={`/flashcards/${note.id}`} className="btn btn-primary">
            <Brain size={15}/> Study Flashcards ({note.flashcards.length})
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:20 }}>
        {["content", "summary", "mindmap"].map(t => (
          <button key={t} className={`tab ${tab===t?"active":""}`} onClick={()=>setTab(t)} style={{ textTransform:"capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      {tab === "content" && (
        <div className="card" style={{ padding:28 }}>
          <div style={{ color:"var(--text-secondary)", fontSize:"0.9rem", lineHeight:1.8, whiteSpace:"pre-wrap", fontFamily:"var(--font-mono)", fontSize:"0.85rem" }}>
            {contentPreview}
            {note.content?.length > 1500 && (
              <div>
                <button onClick={()=>setShowFull(p=>!p)} className="btn btn-secondary btn-sm" style={{ marginTop:16 }}>
                  {showFull ? <><ChevronUp size={14}/> Show Less</> : <><ChevronDown size={14}/> Show More ({note.content.length - 1500} chars more)</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "summary" && (
        <div className="card" style={{ padding:28 }}>
          {summary ? (
            <div className="markdown-body" style={{ fontSize:"0.92rem", lineHeight:1.8 }}>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:40 }}>
              <Sparkles size={40} color="var(--text-muted)" style={{ margin:"0 auto 12px" }} />
              <p style={{ color:"var(--text-muted)", marginBottom:16 }}>No summary yet</p>
              <button onClick={summarize} className="btn btn-primary" disabled={summarizing}>
                {summarizing ? "Generating…" : "Generate AI Summary"}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "mindmap" && (
        <div className="card" style={{ padding:28 }}>
          {mindmap ? (
            <MindMapView mindmap={mindmap} />
          ) : (
            <div style={{ textAlign:"center", padding:40 }}>
              <Map size={40} color="var(--text-muted)" style={{ margin:"0 auto 12px" }} />
              <p style={{ color:"var(--text-muted)", marginBottom:16 }}>Generate a visual mind map from your notes</p>
              <button onClick={generateMindmap} className="btn btn-primary" disabled={generatingMM}>
                {generatingMM ? "Generating…" : "Generate Mind Map"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MindMapView({ mindmap }) {
  return (
    <div style={{ overflowX:"auto", padding:20 }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, minWidth:600 }}>
        {/* Center */}
        <div className="mindmap-node mindmap-center" style={{ maxWidth:280 }}>{mindmap.center}</div>
        {/* Branches */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16, width:"100%" }}>
          {mindmap.branches?.map((branch, i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div className="mindmap-node" style={{ borderColor:`hsl(${i*60},60%,60%)`, color:`hsl(${i*60},60%,70%)` }}>{branch.label}</div>
              {branch.children?.map((child, j) => (
                <div key={j} style={{ marginLeft:12, padding:"8px 14px", background:"var(--bg-secondary)", borderRadius:8, fontSize:"0.85rem", color:"var(--text-secondary)", borderLeft:`3px solid hsl(${i*60},40%,50%)` }}>
                  {child}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
