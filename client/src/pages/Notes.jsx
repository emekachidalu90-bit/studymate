import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FileText, Upload, Plus, Search, Trash2, Eye, Layers, Clock, Tag, X, File } from "lucide-react";

const ACCEPTED = { "application/pdf":[".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document":[".docx"], "application/msword":[".doc"], "application/vnd.openxmlformats-officedocument.presentationml.presentation":[".pptx"], "application/vnd.ms-powerpoint":[".ppt"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":[".xlsx"], "application/vnd.ms-excel":[".xls"], "text/plain":[".txt"], "text/markdown":[".md"], "application/json":[".json"] };

function UploadModal({ onClose, onUploaded }) {
  const [tab, setTab] = useState("file");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(accepted => { if (accepted[0]) { setFile(accepted[0]); if (!title) setTitle(accepted[0].name.replace(/\.[^.]+$/, "")); } }, [title]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED, multiple: false, maxSize: 25*1024*1024 });

  const submit = async () => {
    setLoading(true);
    try {
      if (tab === "file") {
        if (!file) return toast.error("Select a file");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title || file.name);
        fd.append("tags", tags);
        const { data } = await api.post("/notes/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("File uploaded & text extracted! 📄");
        onUploaded(data);
      } else {
        if (!title.trim() || !content.trim()) return toast.error("Title and content required");
        const { data } = await api.post("/notes", { title, content, tags: tags.split(",").map(t=>t.trim()).filter(Boolean) });
        toast.success("Note created! ✅");
        onUploaded(data);
      }
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || "Upload failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:560 }}>
        <div className="flex-between" style={{ marginBottom:20 }}>
          <h2 style={{ fontWeight:800, fontSize:"1.2rem" }}>Add Note</h2>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        <div className="tabs" style={{ marginBottom:20 }}>
          <button className={`tab ${tab==="file"?"active":""}`} onClick={()=>setTab("file")}><Upload size={14}/> Upload File</button>
          <button className={`tab ${tab==="text"?"active":""}`} onClick={()=>setTab("text")}><FileText size={14}/> Write Note</button>
        </div>

        {tab === "file" ? (
          <>
            <div {...getRootProps()} style={{ border:`2px dashed ${isDragActive?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius)", padding:32, textAlign:"center", cursor:"pointer", marginBottom:16, background: isDragActive?"rgba(108,99,255,0.05)":"transparent", transition:"all 0.2s" }}>
              <input {...getInputProps()} />
              <Upload size={32} color={isDragActive?"var(--accent)":"var(--text-muted)"} style={{ margin:"0 auto 12px" }} />
              {file ? (
                <div>
                  <div style={{ fontWeight:700, color:"var(--accent)" }}>{file.name}</div>
                  <div style={{ color:"var(--text-muted)", fontSize:"0.8rem" }}>{(file.size/1024/1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight:600, marginBottom:4 }}>{isDragActive?"Drop it!":"Drop file or click to browse"}</div>
                  <div style={{ color:"var(--text-muted)", fontSize:"0.82rem" }}>PDF, DOCX, PPTX, XLSX, TXT, MD — up to 25MB</div>
                </>
              )}
            </div>
            <div style={{ marginBottom:16 }}>
              <label className="label">Title (optional)</label>
              <input className="input" placeholder="Note title…" value={title} onChange={e=>setTitle(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom:16 }}>
              <label className="label">Title</label>
              <input className="input" placeholder="Note title…" value={title} onChange={e=>setTitle(e.target.value)} required />
            </div>
            <div style={{ marginBottom:16 }}>
              <label className="label">Content</label>
              <textarea className="input" placeholder="Write your notes here…" value={content} onChange={e=>setContent(e.target.value)} style={{ minHeight:160 }} />
            </div>
          </>
        )}

        <div style={{ marginBottom:20 }}>
          <label className="label">Tags (comma separated)</label>
          <input className="input" placeholder="math, biology, chapter-1" value={tags} onChange={e=>setTags(e.target.value)} />
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading}>
            {loading ? "Processing…" : tab==="file" ? "Upload & Extract" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetch = () => { api.get("/notes").then(r=>setNotes(r.data)).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(fetch, []);

  const del = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    await api.delete(`/notes/${id}`);
    setNotes(p => p.filter(n => n.id !== id));
    toast.success("Note deleted");
  };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()));

  const fileIcon = (n) => {
    const ext = n.originalName?.split(".").pop()?.toLowerCase();
    const colors = { pdf:"#FF6363", docx:"#38B2FF", doc:"#38B2FF", pptx:"#FF6B9D", ppt:"#FF6B9D", xlsx:"#43E97B", xls:"#43E97B" };
    return colors[ext] || "var(--accent)";
  };

  return (
    <div className="page" style={{ paddingTop:32 }}>
      {showModal && <UploadModal onClose={()=>setShowModal(false)} onUploaded={n=>{setNotes(p=>[n,...p]);}} />}

      <div className="flex-between" style={{ marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontWeight:800, fontSize:"1.6rem", marginBottom:4 }}>My Notes</h1>
          <p style={{ color:"var(--text-secondary)", fontSize:"0.9rem" }}>{notes.length} note{notes.length!==1?"s":""} · Upload files or write notes</p>
        </div>
        <button onClick={()=>setShowModal(true)} className="btn btn-primary"><Plus size={18}/> Add Note</button>
      </div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:24 }}>
        <Search size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
        <input className="input" style={{ paddingLeft:40 }} placeholder="Search notes…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{height:160,borderRadius:16}} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:64 }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin:"0 auto 16px" }} />
          <h3 style={{ fontWeight:700, marginBottom:8 }}>{search?"No results found":"No notes yet"}</h3>
          <p style={{ color:"var(--text-muted)", fontSize:"0.9rem", marginBottom:24 }}>
            {search?"Try a different search term":"Upload a PDF, PPTX, DOCX or write your first note"}
          </p>
          {!search && <button onClick={()=>setShowModal(true)} className="btn btn-primary"><Plus size={16}/> Add Note</button>}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {filtered.map(note => (
            <Link key={note.id} to={`/notes/${note.id}`} className="card" style={{ textDecoration:"none", display:"flex", flexDirection:"column", transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="";e.currentTarget.style.transform="";}}>
              <div className="flex-between" style={{ marginBottom:12 }}>
                <div style={{ width:40, height:40, background:`${fileIcon(note)}18`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {note.type==="file" ? <File size={20} color={fileIcon(note)} /> : <FileText size={20} color="var(--accent)" />}
                </div>
                <button onClick={e=>del(note.id,e)} className="btn btn-danger btn-icon" style={{ opacity:0.6, padding:7 }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ fontWeight:700, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:"0.95rem" }}>{note.title}</div>
              <div style={{ color:"var(--text-muted)", fontSize:"0.8rem", flex:1, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginBottom:12 }}>
                {note.content?.slice(0,120) || "No preview"}
              </div>
              {note.tags?.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:12 }}>
                  {note.tags.slice(0,3).map(t=><span key={t} className="badge badge-accent" style={{ fontSize:"0.7rem" }}><Tag size={10}/>{t}</span>)}
                </div>
              )}
              <div className="flex-between" style={{ borderTop:"1px solid var(--border-light)", paddingTop:10 }}>
                <span style={{ fontSize:"0.72rem", color:"var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}>
                  <Clock size={11}/>{new Date(note.createdAt).toLocaleDateString()}
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ fontSize:"0.72rem", color:"var(--text-muted)", display:"flex", alignItems:"center", gap:3 }}>
                    <Eye size={11}/> View
                  </span>
                  {note.flashcards?.length > 0 && (
                    <span style={{ fontSize:"0.72rem", color:"var(--accent-2)", display:"flex", alignItems:"center", gap:3 }}>
                      <Layers size={11}/>{note.flashcards.length}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
