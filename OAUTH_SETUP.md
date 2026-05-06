# 🔐 OAuth Setup Guide — StudyMate AI

This guide walks you through setting up **Google**, **GitHub**, and **Discord** social login for StudyMate.

> **All three are optional.** The app works perfectly with email/password alone. Add whichever providers you want.

---

## How it works

```
User clicks "Continue with Google"
     ↓
Browser → GET /api/auth/google  (your server)
     ↓
Server → Redirects to Google's consent screen
     ↓
User approves → Google → GET /api/auth/google/callback  (your server)
     ↓
Server creates/updates user, mints a JWT
     ↓
Server → Redirects to /oauth/callback?token=JWT  (your React app)
     ↓
React stores JWT in localStorage, fetches user profile, goes to /dashboard
```

---

## 1. Google OAuth

### Create credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add **Authorized redirect URIs**:
   - Dev:  `http://localhost:3001/api/auth/google/callback`
   - Prod: `https://your-app.onrender.com/api/auth/google/callback`
7. Click **Create** → Copy the **Client ID** and **Client Secret**

### Also enable the People API
- Go to **APIs & Services → Library**
- Search "Google+ API" or "People API" → Enable it

### Add to `.env`
```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
```

### OAuth consent screen (required)
1. Go to **APIs & Services → OAuth consent screen**
2. User Type: **External** (for public apps)
3. Fill in App name (`StudyMate AI`), support email, developer email
4. Scopes: add `email` and `profile`
5. Test users: add your email while in development
6. Submit for verification when ready for production

---

## 2. GitHub OAuth

### Create OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps → New OAuth App**
3. Fill in:
   - **Application name:** `StudyMate AI`
   - **Homepage URL:** `http://localhost:5173` (or your prod URL)
   - **Authorization callback URL:**
     - Dev:  `http://localhost:3001/api/auth/github/callback`
     - Prod: `https://your-app.onrender.com/api/auth/github/callback`
4. Click **Register application**
5. Click **Generate a new client secret**
6. Copy **Client ID** and **Client Secret**

### Add to `.env`
```env
GITHUB_CLIENT_ID=Ov23liAbCdEfGhIjKlMn
GITHUB_CLIENT_SECRET=your_github_secret_here
```

---

## 3. Discord OAuth

### Create application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it `StudyMate AI`
3. Go to the **OAuth2** tab → **General**
4. Under **Redirects**, click **Add Redirect**:
   - Dev:  `http://localhost:3001/api/auth/discord/callback`
   - Prod: `https://your-app.onrender.com/api/auth/discord/callback`
5. Copy **Client ID** and **Client Secret** from the top of the page

### Add to `.env`
```env
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_CLIENT_SECRET=your_discord_secret_here
```

---

## Setting up for Production (Render)

When deployed on Render, your callback URLs will use your live domain. Make sure to:

1. **Update all callback/redirect URLs** in each provider's dashboard to use your Render URL:
   ```
   https://your-app-name.onrender.com/api/auth/google/callback
   https://your-app-name.onrender.com/api/auth/github/callback
   https://your-app-name.onrender.com/api/auth/discord/callback
   ```

2. **Set these Render environment variables:**
   ```
   BASE_URL=https://your-app-name.onrender.com
   CLIENT_URL=https://your-app-name.onrender.com
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   DISCORD_CLIENT_ID=...
   DISCORD_CLIENT_SECRET=...
   ```

3. **For Google:** go back to the OAuth consent screen and add your Render domain to "Authorized domains"

---

## Testing locally

1. Copy `.env.example` to `.env`
2. Fill in at least one provider's credentials
3. Run `npm run dev` (starts both server + Vite)
4. Open `http://localhost:5173`
5. Click **"Continue with Google/GitHub/Discord"** on the login page
6. You should be redirected through the OAuth flow and land on `/dashboard`

The login page automatically detects which providers are configured (via `GET /api/auth/providers`) and only shows buttons for enabled ones.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `redirect_uri_mismatch` | Make sure the callback URL in your provider dashboard exactly matches `BASE_URL` in `.env` |
| Social button doesn't appear | Check that the env var is set and the server was restarted |
| `503 OAuth not configured` | The env var is missing or empty on the server |
| User created but no email | Some providers (GitHub) don't expose email unless you request the right scope — already handled |
| Works locally but not on Render | Update the redirect URIs in provider dashboards to your Render URL |

---

## Security notes

- **JWT_SECRET** must be a long random string in production — never use the default
- OAuth tokens are exchanged server-side; the browser only ever receives your app's JWT
- Sessions are used only during the OAuth redirect dance (10 min max), not for app auth
- User passwords are bcrypt-hashed; OAuth users have no password stored
