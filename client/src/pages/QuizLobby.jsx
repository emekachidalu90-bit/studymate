import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Gamepad2, Plus, Users, User, Upload, FileText, Loader, Copy, Globe, Lock, ChevronRight, Zap } from "lucide-react";

export default function QuizLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState("create");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState("solo"); // solo | multi
  const [sourceTab, setSourceTab] = useState("notes"); // notes | upload | write
  const [selectedNote, setSelectedNote] = useState(null);
  const [customContent, setCustomContent] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [isPublic, setIsPublic] = useState(false);
  const [timePerQ, setTimePerQ] = useState(20);
  const [quizTitle, setQuizTitle] = useState("");
  const [uploadedContent, setUploadedContent] = useState("");
  const [uploadName, setUploadName] = useState("");

  useEffect(() => {
    api.get("/notes").then(r => setNotes(r.data)).catch(() => {});
    if (location.state?.questions) {
      handleStartWithQuestions(location.state.questions, location.state.sourceNote?.title || "Quick Quiz");
    }
  }, []);

  const onDrop = async (accepted) => {
    if (!accepted[0]) return;
    const fd = new FormData();
    fd.append("file", accepted[0]);
    fd.append("title", accepted[0].name);
    setLoading(true);
    try {
      const { data } = await api.post("/notes/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadedContent(data.content);
      setUploadName(data.title);
      toast.success("File extracted!");
    } catch(err) { toast.error("Upload failed"); }
    finally { setLoading(false); }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, maxSize: 25*1024*1024 });

  const getContent = () => {
    if (sourceTab === "notes") return selectedNote?.content || "";
    if (sourceTab === "upload") return uploadedContent;
    return customContent;
  };

  const buildQuiz = async () => {
    const content = getContent();
    if (!content.trim()) { toast.error("Please select or provide content"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/ai/generate-quiz", { content, count: questionCount, difficulty });
      if (!data.questions?.length) { toast.error("Could not generate questions. Try different content."); return; }
      await handleStartWithQuestions(data.questions, quizTitle || (sourceTab==="notes" ? selectedNote?.title : uploadName) || "Study Quiz");
    } catch(err) { toast.error(err.response?.data?.error || "Failed to generate quiz"); }
    finally { setLoading(false); }
  };

  const handleStartWithQuestions = async (questions, title) => {
    if (mode === "solo") {
      navigate("/quiz/join/SOLO", { state: { solo: true, questions, title } });
      return;
    }
    try {
      const { data } = await api.post("/quiz/create", { title, questions, isPublic, timePerQuestion: timePerQ });
      navigate(`/quiz/join/${data.room.code}`, { state: { host: true, room: data.room } });
    } catch(err) { toast.error("Failed to create room"); }
  };

  const joinRoom = () => {
    if (!joinCode.trim()) return toast.error("Enter a room code");
    navigate(`/quiz/join/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="page" style={{ paddingTop:32, maxWidth:780 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontWeight:800, fontSize:"1.6rem", marginBottom:4 }}>Quiz Arena</h1>
        <p style={{ color:"var(--text-secondary)" }}>Solo practice or live multiplayer battles with friends</p>
      </div>

      <div className="tabs" style={{ marginBottom:24 }}>
        <button className={`tab ${tab==="create"?"active":""}`} onClick={()=>setTab("create")}><Plus size={14}/> Create Quiz</button>
        <button className={`tab ${tab==="join"?"active":""}`} onClick={()=>setTab("join")}><Users size={14}/> Join Game</button>
      </div>

      {tab === "join" ? (
        <div className="card" style={{ padding:32, textAlign:"center" }}>
          <Gamepad2 size={48} color="var(--accent)" style={{ margin:"0 auto 16px" }} />
          <h2 style={{ fontWeight:700, marginBottom:8 }}>Join a Live Game</h2>
          <p style={{ color:"var(--text-secondary)", marginBottom:24 }}>Enter the room code from your host</p>
          <div style={{ display:"flex", gap:10, maxWidth:360, margin:"0 auto" }}>
            <input className="input" placeholder="Enter room code…" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
              style={{ textAlign:"center", letterSpacing:"0.15em", fontWeight:700, fontSize:"1.1rem", textTransform:"uppercase" }}
              onKeyDown={e=>e.key==="Enter"&&joinRoom()} />
            <button onClick={joinRoom} className="btn btn-primary"><ChevronRight size={20}/></button>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Mode selection */}
          <div>
            <label className="label" style={{ marginBottom:10 }}>Game Mode</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { val:"solo", icon:User, label:"Solo Practice", desc:"Study at your own pace", color:"var(--accent)" },
                { val:"multi", icon:Users, label:"Multiplayer", desc:"Live battle with friends (Kahoot-style)", color:"var(--accent-3)" },
              ].map(({ val, icon:Icon, label, desc, color }) => (
                <div key={val} onClick={()=>setMode(val)} style={{ cursor:"pointer", padding:18, borderRadius:"var(--radius)", border:`2px solid ${mode===val?color:"var(--border-light)"}`, background:mode===val?`${color}0d`:"var(--bg-card)", transition:"all 0.2s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <Icon size={20} color={color} />
                    <span style={{ fontWeight:700, color:mode===val?color:"var(--text-primary)" }}>{label}</span>
                  </div>
                  <p style={{ color:"var(--text-muted)", fontSize:"0.8rem" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content source */}
          <div>
            <label className="label" style={{ marginBottom:10 }}>Quiz Content</label>
            <div className="tabs" style={{ marginBottom:16 }}>
              <button className={`tab ${sourceTab==="notes"?"active":""}`} onClick={()=>setSourceTab("notes")}><FileText size={13}/> My Notes</button>
              <button className={`tab ${sourceTab==="upload"?"active":""}`} onClick={()=>setSourceTab("upload")}><Upload size={13}/> Upload File</button>
              <button className={`tab ${sourceTab==="write"?"active":""}`} onClick={()=>setSourceTab("write")}>✏️ Write</button>
            </div>

            {sourceTab === "notes" && (
              notes.length === 0 ? (
                <div className="card" style={{ textAlign:"center", padding:24 }}>
                  <p style={{ color:"var(--text-muted)", marginBottom:12 }}>No notes found. Upload one first.</p>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10, maxHeight:240, overflowY:"auto" }}>
                  {notes.map(n => (
                    <div key={n.id} onClick={()=>setSelectedNote(n)}
                      style={{ padding:14, borderRadius:10, border:`2px solid ${selectedNote?.id===n.id?"var(--accent)":"var(--border-light)"}`, background:selectedNote?.id===n.id?"rgba(108,99,255,0.08)":"var(--bg-secondary)", cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontWeight:600, fontSize:"0.85rem", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.title}</div>
                      <div style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>{n.content?.length?.toLocaleString()} chars</div>
                    </div>
                  ))}
                </div>
              )
            )}

            {sourceTab === "upload" && (
              <div>
                <div {...getRootProps()} style={{ border:`2px dashed ${isDragActive?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius)", padding:24, textAlign:"center", cursor:"pointer", background:isDragActive?"rgba(108,99,255,0.05)":"transparent" }}>
                  <input {...getInputProps()} />
                  <Upload size={28} color="var(--text-muted)" style={{ margin:"0 auto 8px" }} />
                  {uploadedContent ? <div style={{ color:"var(--accent-3)", fontWeight:600 }}>✓ {uploadName} extracted!</div> : <div style={{ color:"var(--text-muted)", fontSize:"0.9rem" }}>Drop or click to upload (PDF, DOCX, PPTX…)</div>}
                </div>
              </div>
            )}

            {sourceTab === "write" && (
              <textarea className="input" placeholder="Paste or write your study material here…" value={customContent} onChange={e=>setCustomContent(e.target.value)} style={{ minHeight:160 }} />
            )}
          </div>

          {/* Quiz settings */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label className="label">Quiz Title</label>
              <input className="input" placeholder="My Quiz" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Questions</label>
              <select className="input" value={questionCount} onChange={e=>setQuestionCount(+e.target.value)}>
                {[5,10,15,20,25].map(n=><option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            {mode === "multi" && (
              <div>
                <label className="label">Time per Question</label>
                <select className="input" value={timePerQ} onChange={e=>setTimePerQ(+e.target.value)}>
                  {[10,15,20,30,45,60].map(n=><option key={n} value={n}>{n}s</option>)}
                </select>
              </div>
            )}
          </div>

          {mode === "multi" && (
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"var(--bg-secondary)", borderRadius:10 }}>
              <div onClick={()=>setIsPublic(p=>!p)} style={{ width:44, height:24, background:isPublic?"var(--accent)":"var(--bg-hover)", borderRadius:12, cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <div style={{ width:18, height:18, background:"white", borderRadius:"50%", position:"absolute", top:3, left:isPublic?22:3, transition:"left 0.2s" }} />
              </div>
              {isPublic ? <Globe size={16} color="var(--accent)"/> : <Lock size={16} color="var(--text-muted)"/>}
              <span style={{ fontSize:"0.88rem", fontWeight:600 }}>{isPublic?"Public room (anyone can join)":"Private room (share code to invite)"}</span>
            </div>
          )}

          <button onClick={buildQuiz} className="btn btn-primary btn-lg" disabled={loading || (!getContent().trim())}>
            {loading ? <><Loader size={18} className="animate-spin"/> Generating Quiz…</> : <><Zap size={18}/>{mode==="solo"?"Start Solo Quiz":"Create Room & Generate Quiz"}</>}
          </button>
        </div>
      )}
    </div>
  );
}
