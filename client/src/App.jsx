import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import InstallPWA from "./components/InstallPWA";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import NoteView from "./pages/NoteView";
import Flashcards from "./pages/Flashcards";
import QuizLobby from "./pages/QuizLobby";
import QuizGame from "./pages/QuizGame";
import Tutor from "./pages/Tutor";
import StudyPlan from "./pages/StudyPlan";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import OAuthCallback from "./pages/OAuthCallback";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, border:"3px solid rgba(108,99,255,0.2)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <span style={{ color:"var(--text-secondary)", fontSize:"0.9rem" }}>Loading StudyMate…</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <InstallPWA />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", fontFamily: "var(--font)", fontSize: "0.875rem" },
            success: { iconTheme: { primary: "var(--accent-3)", secondary: "var(--bg-card)" } },
            error: { iconTheme: { primary: "#FF6363", secondary: "var(--bg-card)" } },
          }}
        />
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Auth mode="login" /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Auth mode="register" /></PublicRoute>} />
          <Route path="/quiz/join/:code?" element={<QuizGame />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/:id" element={<NoteView />} />
            <Route path="/flashcards/:id?" element={<Flashcards />} />
            <Route path="/quiz" element={<QuizLobby />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
