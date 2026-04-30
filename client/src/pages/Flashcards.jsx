import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, RotateCcw, Check, X, Shuffle, BookOpen, Loader } from "lucide-react";

export default function Flashcards() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get("/notes").then(r => {
      const notesWithCards = r.data.filter(n => n.flashcards?.length > 0);
      setNotes(notesWithCards);
      if (id) {
        const n = r.data.find(x => x.id === id);
        if (n?.flashcards?.length > 0) loadNote(n);
        else if (n) setSelectedNote(n);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const loadNote = (note) => {
    setSelectedNote(note);
    setCards(shuffle([...note.flashcards]));
    setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false);
  };

  const shuffle = (arr) => { for (let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };

  const generate = async (note) => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/ai/flashcards/${note.id}`, { count: 15 });
      toast.success(`${data.flashcards.length} flashcards created!`);
      const updated = { ...note, flashcards: data.flashcards };
      loadNote(updated);
      setNotes(p => p.some(n=>n.id===note.id) ? p.map(n=>n.id===note.id?updated:n) : [...p, updated]);
    } catch(err) { toast.error(err.response?.data?.error || "Failed"); }
    finally { setGenerating(false); }
  };

  const mark = (isKnown) => {
    if (isKnown) setKnown(p=>[...p, current]);
    else setUnknown(p=>[...p, current]);
    setFlipped(false);
    setTimeout(() => {
      if (current + 1 >= cards.length) setDone(true);
      else setCurrent(p => p+1);
    }, 150);
  };

  const restart = (unknownOnly=false) => {
    const newCards = unknownOnly ? unknown.map(i=>cards[i]) : shuffle([...cards]);
    setCards(newCards); setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false);
  };

  if (loading) return <div className="page flex-center" style={{paddingTop:80}}><Loader size={32} className="animate-spin" color="var(--accent)"/></div>;

  // Note selector
  if (!selectedNote || !cards.length) {
    return (
      <div className="page" style={{paddingTop:32}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontWeight:800,fontSize:"1.6rem",marginBottom:4}}>Flashcards</h1>
          <p style={{color:"var(--text-secondary)"}}>Study your notes with AI-generated flashcards</p>
        </div>

        {selectedNote && !cards.length && (
          <div className="card" style={{textAlign:"center",padding:48,marginBottom:24}}>
            <BookOpen size={40} color="var(--text-muted)" style={{margin:"0 auto 12px"}}/>
            <h3 style={{fontWeight:700,marginBottom:8}}>No flashcards for "{selectedNote.title}"</h3>
            <p style={{color:"var(--text-muted)",marginBottom:20}}>Generate flashcards from this note using AI</p>
            <button onClick={()=>generate(selectedNote)} className="btn btn-primary" disabled={generating}>
              {generating?"Generating…":"Generate Flashcards"}
            </button>
          </div>
        )}

        <h2 style={{fontWeight:700,fontSize:"1rem",marginBottom:16}}>Notes with flashcards</h2>
        {notes.length === 0 ? (
          <div className="card" style={{textAlign:"center",padding:48}}>
            <p style={{color:"var(--text-muted)",marginBottom:16}}>No flashcard sets yet. Open a note and generate flashcards first.</p>
            <Link to="/notes" className="btn btn-primary">Go to Notes</Link>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
            {notes.map(n=>(
              <div key={n.id} onClick={()=>loadNote(n)} className="card" style={{cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent-2)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="";e.currentTarget.style.transform="";}}>
                <h3 style={{fontWeight:700,marginBottom:6,fontSize:"0.95rem"}}>{n.title}</h3>
                <span className="badge badge-pink">{n.flashcards.length} cards</span>
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop:32}}>
          <h2 style={{fontWeight:700,fontSize:"1rem",marginBottom:16}}>Generate from any note</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
            {api.get && []}
          </div>
          <Link to="/notes" className="btn btn-secondary"><BookOpen size={15}/> Browse All Notes</Link>
        </div>
      </div>
    );
  }

  // Done screen
  if (done) {
    const pct = Math.round((known.length/cards.length)*100);
    return (
      <div className="page flex-center" style={{paddingTop:48,flexDirection:"column",gap:24}}>
        <div className="card" style={{maxWidth:480,width:"100%",textAlign:"center",padding:40}}>
          <div style={{fontSize:"3rem",marginBottom:16}}>{pct>=80?"🎉":pct>=50?"👍":"💪"}</div>
          <h2 style={{fontWeight:800,fontSize:"1.4rem",marginBottom:8}}>Session Complete!</h2>
          <p style={{color:"var(--text-secondary)",marginBottom:24}}>You studied {cards.length} cards from <strong>{selectedNote.title}</strong></p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
            <div style={{background:"rgba(67,233,123,0.1)",borderRadius:12,padding:16}}>
              <div style={{fontSize:"2rem",fontWeight:800,color:"var(--accent-3)"}}>{known.length}</div>
              <div style={{color:"var(--text-muted)",fontSize:"0.82rem"}}>Got it ✓</div>
            </div>
            <div style={{background:"rgba(255,99,99,0.1)",borderRadius:12,padding:16}}>
              <div style={{fontSize:"2rem",fontWeight:800,color:"#FF6363"}}>{unknown.length}</div>
              <div style={{color:"var(--text-muted)",fontSize:"0.82rem"}}>Need review</div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={()=>restart(false)} className="btn btn-primary"><RotateCcw size={15}/>Restart All</button>
            {unknown.length>0&&<button onClick={()=>restart(true)} className="btn btn-secondary"><X size={15}/>Review Missed ({unknown.length})</button>}
            <button onClick={()=>{setSelectedNote(null);setCards([]);}} className="btn btn-secondary">Change Set</button>
          </div>
        </div>
      </div>
    );
  }

  const card = cards[current];
  const progress = ((known.length + unknown.length) / cards.length) * 100;

  return (
    <div className="page flex-center" style={{paddingTop:32,flexDirection:"column",gap:20}}>
      {/* Header */}
      <div style={{width:"100%",maxWidth:600}}>
        <div className="flex-between" style={{marginBottom:12}}>
          <button onClick={()=>{setSelectedNote(null);setCards([]);}} className="btn btn-secondary btn-sm"><ArrowLeft size={14}/> Sets</button>
          <span style={{fontWeight:700,fontSize:"0.9rem",color:"var(--text-muted)"}}>{current+1} / {cards.length}</span>
          <button onClick={()=>restart(false)} className="btn btn-secondary btn-sm"><Shuffle size={14}/> Shuffle</button>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:"0.75rem",color:"var(--text-muted)"}}>
          <span style={{color:"var(--accent-3)"}}>✓ {known.length} known</span>
          <span>{selectedNote.title}</span>
          <span style={{color:"#FF6363"}}>✗ {unknown.length} to review</span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flashcard-scene" onClick={()=>setFlipped(p=>!p)}>
        <div className={`flashcard-inner ${flipped?"flipped":""}`}>
          <div className="flashcard-face flashcard-front">
            <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.1em"}}>Question</div>
            <div style={{fontSize:"1.1rem",fontWeight:700,lineHeight:1.6}}>{card.front}</div>
            <div style={{fontSize:"0.78rem",color:"var(--text-muted)",marginTop:16}}>Tap to reveal answer</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <div style={{fontSize:"0.75rem",color:"var(--accent)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.1em"}}>Answer</div>
            <div style={{fontSize:"1rem",lineHeight:1.7,color:"var(--text-primary)"}}>{card.back}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {flipped ? (
        <div style={{display:"flex",gap:16}}>
          <button onClick={()=>mark(false)} className="btn btn-danger btn-lg" style={{minWidth:120}}>
            <X size={20}/> Still learning
          </button>
          <button onClick={()=>mark(true)} className="btn btn-success btn-lg" style={{minWidth:120}}>
            <Check size={20}/> Got it!
          </button>
        </div>
      ) : (
        <div style={{display:"flex",gap:12}}>
          <button disabled={current===0} onClick={()=>{setCurrent(p=>p-1);setFlipped(false);}} className="btn btn-secondary">
            <ArrowLeft size={16}/>
          </button>
          <button onClick={()=>setFlipped(true)} className="btn btn-primary btn-lg">Reveal Answer</button>
          <button disabled={current===cards.length-1} onClick={()=>{setCurrent(p=>p+1);setFlipped(false);}} className="btn btn-secondary">
            <ArrowRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
}
