# 📚 StudyMate AI — Full-Stack AI Study Platform

> An advanced, PWA-ready, fully deployable AI-powered study platform with multiplayer quizzes, flashcards, AI tutoring, and more.

![StudyMate Banner](https://via.placeholder.com/1200x400/6C63FF/FFFFFF?text=StudyMate+AI)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT-based sign up / sign in / sign out |
| 📄 **Smart Notes** | Upload PDF, DOCX, PPTX, XLSX, TXT, MD — AI extracts text automatically |
| 🤖 **AI Summary** | One-click AI summaries of any note via Groq LLaMA3 |
| 🃏 **Flashcards** | AI-generates flip-card sets from any document |
| 🧠 **Mind Maps** | Auto-generate visual mind maps from your notes |
| 🎯 **Solo Quiz** | AI-generated MCQ quizzes from any content |
| 🎮 **Multiplayer Quiz** | Kahoot-style live quiz battles via Socket.io with real-time chat |
| 💬 **AI Tutor** | Conversational AI tutor with document context awareness |
| 📅 **Study Plan** | Personalized AI-crafted study schedules |
| 🏆 **Leaderboard** | Global XP-based rankings with streaks |
| 🎖️ **Achievements** | Unlock badges as you study |
| 📱 **PWA** | Installable on any device (iOS, Android, Desktop) |

---

## 🚀 Quick Start (Local Dev)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/studymate.git
cd studymate

# Install root (server) deps
npm install

# Install client deps
cd client && npm install && cd ..
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
GROQ_API_KEY=gsk_your_groq_api_key_here
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Get your free Groq API key:** https://console.groq.com

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend (in /client)
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## 🌐 Deploy to Render (Free)

### Option A — One-Click with render.yaml

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and configures everything
5. Add your `GROQ_API_KEY` in the Environment Variables section
6. Click **Deploy** 🚀

### Option B — Manual Deploy

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Set these options:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** 18+
4. Add Environment Variables:
   ```
   NODE_ENV=production
   GROQ_API_KEY=your_groq_key
   JWT_SECRET=random_secret_string_here
   PORT=3001
   ```
5. Deploy!

### Notes on Free Tier
- Render free tier **spins down after 15 min of inactivity** — first request may take ~30s
- Upgrade to Starter ($7/mo) for always-on
- Data is **in-memory** by default — add MongoDB/PostgreSQL for persistence (see below)

---

## 🗄️ Adding a Real Database (Optional)

The app uses in-memory storage by default. For production persistence:

### MongoDB Atlas (Free)

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. `npm install mongoose`
3. Add `MONGODB_URI=mongodb+srv://...` to `.env`
4. Replace `server/utils/store.js` with Mongoose models

### PostgreSQL (Render provides free PostgreSQL)

1. Add a Render PostgreSQL instance
2. `npm install pg sequelize`
3. Add `DATABASE_URL=postgres://...` to `.env`

---

## 📁 Project Structure

```
studymate/
├── server/                    # Express + Socket.io backend
│   ├── index.js               # Main server entry
│   ├── routes/
│   │   ├── auth.js            # Register, login, JWT
│   │   ├── notes.js           # File upload + text extraction
│   │   ├── ai.js              # Groq AI endpoints
│   │   └── quiz.js            # Quiz room management
│   ├── socket/
│   │   └── quizSocket.js      # Real-time multiplayer logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   └── utils/
│       └── store.js           # In-memory data store
│
├── client/                    # React + Vite frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons/             # PWA icons (all sizes)
│   │   └── apple-touch-icon.png
│   ├── src/
│   │   ├── App.jsx            # Router + auth guards
│   │   ├── index.css          # Full design system
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── api.js         # Axios instance
│   │   │   └── socket.js      # Socket.io client
│   │   ├── components/
│   │   │   └── Layout.jsx     # Sidebar + nav
│   │   └── pages/
│   │       ├── Landing.jsx    # Public home page
│   │       ├── Auth.jsx       # Login / Register
│   │       ├── Dashboard.jsx  # Home dashboard
│   │       ├── Notes.jsx      # Note list + upload
│   │       ├── NoteView.jsx   # Note detail + AI tools
│   │       ├── Flashcards.jsx # Flashcard study mode
│   │       ├── QuizLobby.jsx  # Create/join quiz
│   │       ├── QuizGame.jsx   # Live quiz game
│   │       ├── Tutor.jsx      # AI chat tutor
│   │       ├── StudyPlan.jsx  # Study plan generator
│   │       ├── Profile.jsx    # User profile + achievements
│   │       └── Leaderboard.jsx
│   └── vite.config.js         # Vite + PWA config
│
├── render.yaml                # Render deploy config
├── .env.example               # Environment template
└── package.json               # Root scripts
```

---

## 🎮 Multiplayer Quiz — How It Works

1. **Host** creates a quiz (from notes, uploaded file, or written content)
2. AI generates MCQ questions via Groq
3. Host gets a **6-character room code** (e.g. `A3K9PX`)
4. **Players** join via code — no account needed for guests
5. Host starts the game → real-time questions appear for all players
6. 20-second countdown timer per question
7. **Points** awarded based on speed + correctness (like Kahoot)
8. Live **leaderboard** between questions
9. **Chat** available throughout the game

---

## 🔧 Supported File Types

| Type | Extensions | Notes |
|---|---|---|
| PDF | `.pdf` | Full text extraction |
| Word | `.docx`, `.doc` | Full text + formatting |
| PowerPoint | `.pptx`, `.ppt` | Slide text extraction |
| Excel | `.xlsx`, `.xls` | Sheet data as CSV |
| Text | `.txt`, `.md`, `.json` | Raw text |

Max file size: **25MB**

---

## 🤖 AI Models Used (via Groq)

- **Quiz/Flashcard generation:** `llama3-8b-8192` (fast, efficient)
- **Tutor chat:** `llama3-8b-8192`
- **Summaries & study plans:** `llama3-8b-8192`

To use a smarter model, change `model` in `server/routes/ai.js`:
```js
// Options: llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768
async function groqChat(messages, model = "llama3-70b-8192") {
```

---

## 📱 PWA Installation

### iOS (Safari)
1. Open StudyMate in Safari
2. Tap **Share** → **Add to Home Screen**
3. Tap **Add**

### Android (Chrome)
1. Open StudyMate in Chrome
2. Tap the **⋮ menu** → **Install app**
3. Or tap the install banner at the bottom

### Desktop (Chrome/Edge)
1. Look for the **install icon** (⊕) in the address bar
2. Click **Install**

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite 5
- React Router 6
- Socket.io Client
- Framer Motion (animations)
- React Dropzone (file upload)
- React Hot Toast (notifications)
- React Markdown (AI responses)
- Vite PWA Plugin (service worker)

**Backend**
- Node.js + Express 4
- Socket.io 4 (WebSocket multiplayer)
- Groq SDK (AI via LLaMA3)
- Multer (file uploads)
- pdf-parse (PDF extraction)
- Mammoth (DOCX extraction)
- xlsx (Excel extraction)
- bcryptjs + JWT (auth)
- uuid (ID generation)

---

## 📜 License

MIT — free for personal and commercial use.

---

Made with ❤️ for students everywhere. StudyMate AI — Study smarter, not harder.
