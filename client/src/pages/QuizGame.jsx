import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { getSocket } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ─── Ring timer component ───
function RingTimer({ value, max, danger }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  const offset = circ * (1 - pct);
  const color = value <= 5 ? "#FF6363" : value <= 10 ? "#F7C948" : "var(--accent)";
  return (
    <div className="ring-timer" style={{ "--ring-size": "56px" }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle className="track" cx="28" cy="28" r={r} />
        <circle className="fill" cx="28" cy="28" r={r}
          style={{ stroke: color, strokeDasharray: circ, strokeDashoffset: offset, transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
      </svg>
      <div className="label" style={{ color, fontSize: value >= 10 ? "0.9rem" : "1rem" }}>{value}</div>
    </div>
  );
}

// ─── Confetti burst ───
function Confetti({ active }) {
  const pieces = active ? Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    delay: `${Math.random() * 1.5}s`,
    color: ["#6C63FF","#FF6B9D","#43E97B","#F7C948","#38B2FF"][i % 5],
    size: `${6 + Math.random() * 8}px`,
  })) : [];
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{ left: p.left, background: p.color, width: p.size, height: `calc(${p.size} * 1.5)`, animationDelay: p.delay }} />
      ))}
    </div>
  );
}
import { Copy, Users, Crown, Send, Trophy, Home, CheckCircle, XCircle, Clock, Zap } from "lucide-react";

// ─── OPTION COLORS ───
const OPT_COLORS = ["#FF6B9D","#6C63FF","#43E97B","#F7C948"];
const OPT_LETTERS = ["A","B","C","D"];

export default function QuizGame() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = getSocket();

  const isSolo = location.state?.solo;
  const isHost = location.state?.host;
  const soloQuestions = location.state?.questions;
  const soloTitle = location.state?.title;

  const [phase, setPhase] = useState("lobby"); // lobby | question | result | leaderboard | ended
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [myScore, setMyScore] = useState(0);
  const [playerName, setPlayerName] = useState(user?.name || "");
  const [joined, setJoined] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [questionNum, setQuestionNum] = useState(0);
  const [totalQ, setTotalQ] = useState(0);
  const timerRef = useRef(null);
  const chatRef = useRef(null);

  // Solo mode state
  const [soloIdx, setSoloIdx] = useState(0);
  const [soloAnswered, setSoloAnswered] = useState(false);
  const [soloScore, setSoloScore] = useState(0);
  const [soloHistory, setSoloHistory] = useState([]);
  const [soloTimer, setSoloTimer] = useState(20);
  const [confetti, setConfetti] = useState(false);
  const soloTimerRef = useRef(null);

  // ─── SOLO MODE ───
  useEffect(() => {
    if (!isSolo || !soloQuestions) return;
    setPhase("question");
    setQuestion(soloQuestions[0]);
    setTotalQ(soloQuestions.length);
    startSoloTimer(20);
    return () => clearInterval(soloTimerRef.current);
  }, [isSolo]);

  const startSoloTimer = (t) => {
    setSoloTimer(t);
    clearInterval(soloTimerRef.current);
    soloTimerRef.current = setInterval(() => {
      setSoloTimer(p => {
        if (p <= 1) { clearInterval(soloTimerRef.current); if (!soloAnswered) soloAutoNext(); return 0; }
        return p-1;
      });
    }, 1000);
  };

  const soloAutoNext = () => { if (!soloAnswered) soloAnswer(-1); };

  const soloAnswer = (idx) => {
    if (soloAnswered) return;
    setSoloAnswered(true);
    clearInterval(soloTimerRef.current);
    const q = soloQuestions[soloIdx];
    const correct = idx === q.correct;
    const pts = correct ? Math.max(500, Math.round(1000 * (soloTimer/20))) : 0;
    setSoloScore(p => p + pts);
    setSoloHistory(p => [...p, { question:q.question, selected:idx, correct:q.correct, isCorrect:correct, points:pts }]);
    setSelected(idx);
    setAnswerResult({ correct, correctAnswer:q.correct, explanation:q.explanation, points:pts });
  };

  const soloNext = () => {
    const next = soloIdx + 1;
    if (next >= soloQuestions.length) { setPhase("ended"); setLeaderboard([{ name:user?.name||"You", score:soloScore + (answerResult?.points||0) }]); return; }
    setSoloIdx(next);
    setQuestion(soloQuestions[next]);
    setQuestionNum(next);
    setSelected(null);
    setSoloAnswered(false);
    setAnswerResult(null);
    startSoloTimer(20);
  };

  // ─── MULTIPLAYER ───
  useEffect(() => {
    if (isSolo) return;
    if (isHost && location.state?.room) {
      const r = location.state.room;
      setRoom(r);
      setPlayers([{ id:"host", name:user?.name||"Host", score:0 }]);
      setJoined(true);
      setPlayerName(user?.name||"Host");
      setTotalQ(r.totalQuestions||10);
      socket.data = { roomCode:code, userId:user?.id };
      socket.emit("quiz:join", { code, playerName:user?.name, userId:user?.id });
    }

    socket.on("quiz:joined", ({ room:r, playerId }) => {
      setRoom(r); setJoined(true); setTotalQ(r.totalQuestions||10);
    });
    socket.on("quiz:playerJoined", ({ players:p }) => setPlayers(p));
    socket.on("quiz:playerLeft", ({ players:p }) => setPlayers(p));
    socket.on("quiz:started", ({ totalQuestions }) => { setTotalQ(totalQuestions); setPhase("starting"); setTimeout(()=>setPhase("question"),1000); });
    socket.on("quiz:question", ({ question:q, timeLimit }) => {
      setQuestion(q); setTimeLeft(timeLimit); setSelected(null); setAnswerResult(null); setPhase("question");
      setQuestionNum(q.index+1);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(()=>setTimeLeft(p=>{if(p<=1){clearInterval(timerRef.current);return 0;}return p-1;}), 1000);
    });
    socket.on("quiz:answerResult", (r) => { setAnswerResult(r); setMyScore(r.totalScore); clearInterval(timerRef.current); });
    socket.on("quiz:leaderboard", ({ leaderboard:lb, correctAnswer, explanation }) => {
      setLeaderboard(lb); setAnswerResult(p=>p||{correct:false,correctAnswer,explanation,points:0}); setPhase("leaderboard");
    });
    socket.on("quiz:ended", ({ leaderboard:lb }) => { setLeaderboard(lb); setPhase("ended"); });
    socket.on("quiz:chat", (msg) => { setChat(p=>[...p,msg]); setTimeout(()=>chatRef.current?.scrollTo(0,99999),50); });
    socket.on("error", (msg) => toast.error(msg));

    return () => {
      ["quiz:joined","quiz:playerJoined","quiz:playerLeft","quiz:started","quiz:question","quiz:answerResult","quiz:leaderboard","quiz:ended","quiz:chat","error"].forEach(e=>socket.off(e));
      clearInterval(timerRef.current);
    };
  }, [isSolo]);

  const joinGame = () => {
    if (!nameInput.trim()) return toast.error("Enter your name");
    setPlayerName(nameInput);
    socket.data = { roomCode:code, userId:user?.id };
    socket.emit("quiz:join", { code, playerName:nameInput, userId:user?.id });
  };

  const submitAnswer = (idx) => {
    if (selected !== null || answerResult) return;
    setSelected(idx);
    socket.emit("quiz:answer", { code, questionIndex:questionNum-1, answerIndex:idx, timeLeft });
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    socket.emit("quiz:chat", { code, message:chatMsg });
    setChatMsg("");
  };

  const startGame = () => socket.emit("quiz:start", { code });

  const timerPct = (timeLeft / (room?.timePerQuestion||20)) * 100;
  const soloTimerPct = (soloTimer / 20) * 100;

  // ─── JOIN SCREEN ───
  if (!isSolo && !joined) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg-primary)", padding:24 }}>
        <div className="card animate-fade" style={{ maxWidth:400, width:"100%", padding:36, textAlign:"center" }}>
          <div style={{ width:64, height:64, background:"linear-gradient(135deg,var(--accent),var(--accent-2))", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <Zap size={32} color="white"/>
          </div>
          <h2 style={{ fontWeight:800, fontSize:"1.4rem", marginBottom:4 }}>Join Quiz</h2>
          <div className="badge badge-accent" style={{ margin:"0 auto 20px" }}>Room: {code}</div>
          <div style={{ marginBottom:16 }}>
            <label className="label">Your Name</label>
            <input className="input" placeholder="Enter your name…" value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinGame()} autoFocus />
          </div>
          <button onClick={joinGame} className="btn btn-primary btn-lg w-full">Join Game 🚀</button>
          <Link to="/" style={{ display:"block", marginTop:12, color:"var(--text-muted)", fontSize:"0.85rem", textDecoration:"none" }}>Back to home</Link>
        </div>
      </div>
    );
  }

  // ─── LOBBY ───
  if (!isSolo && phase === "lobby") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg-primary)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:24 }}>
        <div className="card animate-fade" style={{ maxWidth:500, width:"100%", padding:32 }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <h2 style={{ fontWeight:800, fontSize:"1.4rem", marginBottom:6 }}>{room?.title || "Quiz Lobby"}</h2>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:12 }}>
              <div style={{ background:"var(--bg-secondary)", borderRadius:10, padding:"10px 20px", fontSize:"1.6rem", fontWeight:800, letterSpacing:"0.15em", color:"var(--accent)" }}>{code}</div>
              <button onClick={()=>{navigator.clipboard.writeText(code);toast.success("Copied!");}} className="btn btn-secondary btn-icon"><Copy size={16}/></button>
            </div>
            <p style={{ color:"var(--text-muted)", fontSize:"0.85rem" }}>Share this code with friends</p>
          </div>

          <div style={{ marginBottom:24 }}>
            <div className="flex-between" style={{ marginBottom:10 }}>
              <span style={{ fontWeight:700, display:"flex", alignItems:"center", gap:6 }}><Users size={16}/> Players ({players.length})</span>
              <div className="glow-dot"/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:200, overflowY:"auto" }}>
              {players.map((p,i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"var(--bg-secondary)", borderRadius:10 }}>
                  <div style={{ width:32, height:32, background:`hsl(${i*60},60%,50%)`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"0.9rem", color:"white" }}>{p.name.charAt(0).toUpperCase()}</div>
                  <span style={{ fontWeight:600 }}>{p.name}</span>
                  {p.name === playerName && <span className="badge badge-accent" style={{ marginLeft:"auto", fontSize:"0.7rem" }}>You</span>}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <button onClick={startGame} className="btn btn-primary btn-lg w-full" disabled={players.length < 1}>
              <Zap size={18}/> Start Game ({players.length} player{players.length!==1?"s":""})
            </button>
          )}
          {!isHost && <p style={{ textAlign:"center", color:"var(--text-muted)", fontSize:"0.9rem" }}>Waiting for host to start…</p>}
        </div>

        <ChatBox chat={chat} chatMsg={chatMsg} setChatMsg={setChatMsg} sendChat={sendChat} chatRef={chatRef} />
      </div>
    );
  }

  // ─── QUESTION ───
  if (phase === "question" && question) {
    const answered = isSolo ? soloAnswered : (selected !== null || !!answerResult);
    const result = isSolo ? answerResult : answerResult;
    const currentTimer = isSolo ? soloTimer : timeLeft;
    const currentTimerPct = isSolo ? soloTimerPct : timerPct;

    return (
      <div style={{ minHeight:"100vh", background:"var(--bg-primary)", display:"flex", flexDirection:"column", padding:16, gap:12 }}>
        {/* Header */}
        <div style={{ maxWidth:700, margin:"0 auto", width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div className="badge badge-accent">Q {isSolo?soloIdx+1:questionNum} / {totalQ}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <RingTimer value={currentTimer} max={room?.timePerQuestion||20} />
          </div>
          {!isSolo && <div style={{ fontWeight:700, color:"var(--accent-4)" }}><Zap size={14} style={{display:"inline",verticalAlign:"middle"}}/> {myScore}</div>}
        </div>

        {/* Timer bar */}
        <div style={{ maxWidth:700, margin:"0 auto", width:"100%" }}>
          <div className="progress-bar" style={{ height:8 }}>
            <div style={{ height:"100%", width:`${currentTimerPct}%`, background:currentTimer<=5?"#FF6363":"linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius:99, transition:"width 1s linear" }}/>
          </div>
        </div>

        {/* Question */}
        <div style={{ maxWidth:700, margin:"0 auto", width:"100%", textAlign:"center", padding:"12px 0" }}>
          <p style={{ fontWeight:700, fontSize:"clamp(1rem,3vw,1.3rem)", lineHeight:1.5 }}>{question.question}</p>
        </div>

        {/* Options */}
        <div style={{ maxWidth:700, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {question.options.map((opt, i) => {
            let extraStyle = {};
            if (answered && result) {
              if (i === result.correctAnswer) extraStyle = { borderColor:"var(--accent-3)", background:"rgba(67,233,123,0.15)" };
              else if (i === (isSolo?selected:selected) && i !== result.correctAnswer) extraStyle = { borderColor:"#FF6363", background:"rgba(255,99,99,0.15)" };
            }
            return (
              <button key={i} onClick={()=>isSolo?soloAnswer(i):submitAnswer(i)}
                disabled={answered}
                style={{ background:`${OPT_COLORS[i]}18`, border:`2px solid ${answered?OPT_COLORS[i]+"40":OPT_COLORS[i]}`, borderRadius:"var(--radius)", padding:"16px 20px", cursor:answered?"default":"pointer", transition:"all 0.2s", fontWeight:700, textAlign:"left", color:"var(--text-primary)", fontFamily:"var(--font)", fontSize:"0.9rem", display:"flex", alignItems:"center", gap:12, ...extraStyle,
                  ...(selected===i&&!answered?{borderColor:OPT_COLORS[i],background:`${OPT_COLORS[i]}25`}:{}) }}>
                <span style={{ width:28, height:28, background:OPT_COLORS[i], borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:"0.85rem", flexShrink:0 }}>{OPT_LETTERS[i]}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {answered && result && (
          <div style={{ maxWidth:700, margin:"0 auto", width:"100%", padding:16, borderRadius:"var(--radius)", background:result.correct?"rgba(67,233,123,0.1)":"rgba(255,99,99,0.1)", border:`1px solid ${result.correct?"rgba(67,233,123,0.3)":"rgba(255,99,99,0.3)"}`, textAlign:"center" }} className="animate-bounce-in">
            <div style={{ fontSize:"1.6rem", marginBottom:4 }}>{result.correct?"🎉":"😅"}</div>
            <div style={{ fontWeight:700, color:result.correct?"var(--accent-3)":"#FF6363", marginBottom:4 }}>
              {result.correct?`+${result.points} points!`:"Incorrect"} {result.points>800&&"⚡ Speed bonus!"}
            </div>
            {result.explanation && <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem", lineHeight:1.6 }}>{result.explanation}</p>}
            {isSolo && <button onClick={soloNext} className="btn btn-primary" style={{ marginTop:12 }}>{soloIdx+1>=totalQ?"See Results":"Next Question →"}</button>}
          </div>
        )}

        {/* Chat (multiplayer) */}
        {!isSolo && <div style={{ maxWidth:700, margin:"0 auto", width:"100%" }}><ChatBox chat={chat} chatMsg={chatMsg} setChatMsg={setChatMsg} sendChat={sendChat} chatRef={chatRef} compact /></div>}
      </div>
    );
  }

  // ─── LEADERBOARD ───
  if (phase === "leaderboard") {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg-primary)", display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:24 }}>
        <h2 style={{ fontWeight:800, fontSize:"1.4rem" }}>Leaderboard</h2>
        <div style={{ width:"100%", maxWidth:460 }}>
          {leaderboard.slice(0,8).map((p,i) => (
            <div key={p.id||i} className={`card ${i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":""}`} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", marginBottom:8 }}>
              <span style={{ width:28, fontWeight:800, fontSize:"1.1rem", textAlign:"center" }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
              <div style={{ width:36, height:36, background:`hsl(${i*60},60%,50%)`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"white" }}>{p.name.charAt(0).toUpperCase()}</div>
              <span style={{ flex:1, fontWeight:700 }}>{p.name} {p.id===socket.id&&<span style={{color:"var(--accent)",fontSize:"0.8rem"}}>(you)</span>}</span>
              <span style={{ fontWeight:800, color:"var(--accent-4)" }}><Zap size={14} style={{display:"inline",verticalAlign:"middle"}}/> {p.score}</span>
            </div>
          ))}
        </div>
        <p style={{ color:"var(--text-muted)", fontSize:"0.85rem" }}>Next question coming up…</p>
        <ChatBox chat={chat} chatMsg={chatMsg} setChatMsg={setChatMsg} sendChat={sendChat} chatRef={chatRef} />
      </div>
    );
  }

  // ─── ENDED ───
  if (phase === "ended") {
    const myRank = isSolo ? 1 : leaderboard.findIndex(p=>p.id===socket.id)+1;
    const finalScore = isSolo ? soloScore : myScore;
    const won = myRank === 1;
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg-primary)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:24 }}>
        <Confetti active={won} />
        <div className="card animate-bounce-in" style={{ maxWidth:500, width:"100%", textAlign:"center", padding:36 }}>
          <Trophy size={52} color="var(--accent-4)" style={{ margin:"0 auto 12px" }} />
          <h2 style={{ fontWeight:800, fontSize:"1.6rem", marginBottom:4 }}>Game Over!</h2>
          {!isSolo && <div style={{ fontSize:"1.1rem", color:"var(--text-secondary)", marginBottom:16 }}>You finished #{myRank}</div>}
          <div style={{ fontSize:"2.5rem", fontWeight:800, color:"var(--accent-4)", marginBottom:20 }}>{finalScore} pts</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={()=>navigate("/quiz")} className="btn btn-primary"><Home size={16}/> Play Again</button>
            <button onClick={()=>navigate("/dashboard")} className="btn btn-secondary">Dashboard</button>
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div style={{ width:"100%", maxWidth:460 }}>
            <h3 style={{ fontWeight:700, textAlign:"center", marginBottom:14 }}>Final Standings</h3>
            {leaderboard.slice(0,10).map((p,i) => (
              <div key={p.id||i} className={`card ${i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":""}`} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", marginBottom:8 }}>
                <span style={{ width:24, fontWeight:800, textAlign:"center" }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
                <span style={{ flex:1, fontWeight:600 }}>{p.name}</span>
                <span style={{ fontWeight:800, color:"var(--accent-4)" }}>{p.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div className="page flex-center" style={{paddingTop:80}}><div style={{width:40,height:40,border:"3px solid rgba(108,99,255,0.2)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;
}

function ChatBox({ chat, chatMsg, setChatMsg, sendChat, chatRef, compact }) {
  return (
    <div style={{ width:"100%", maxWidth:compact?700:460, background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border-light)", overflow:"hidden" }}>
      <div style={{ padding:"8px 12px", borderBottom:"1px solid var(--border-light)", fontSize:"0.8rem", fontWeight:700, color:"var(--text-muted)" }}>💬 Game Chat</div>
      <div ref={chatRef} style={{ height:compact?100:180, overflowY:"auto", padding:"8px 12px", display:"flex", flexDirection:"column", gap:4 }}>
        {chat.length===0 ? <span style={{ color:"var(--text-muted)", fontSize:"0.78rem" }}>No messages yet…</span> : chat.map(m => (
          <div key={m.id} style={{ fontSize:"0.82rem" }}>
            <span style={{ fontWeight:700, color:"var(--accent)" }}>{m.playerName}: </span>
            <span style={{ color:"var(--text-secondary)" }}>{m.message}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, padding:"6px 8px", borderTop:"1px solid var(--border-light)" }}>
        <input className="input" style={{ flex:1, padding:"7px 10px", fontSize:"0.82rem" }} placeholder="Type a message…" value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} />
        <button onClick={sendChat} className="btn btn-primary btn-sm"><Send size={13}/></button>
      </div>
    </div>
  );
}
