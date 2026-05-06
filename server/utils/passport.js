const passport   = require("passport");
const { v4: uuidv4 } = require("uuid");
const store      = require("./store");

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = store.users.find(u => u.id === id);
  done(null, user || false);
});

function upsertOAuthUser({ provider, providerId, name, email, avatar }) {
  let user = store.users.find(u => u.oauth?.[provider] === String(providerId));
  if (!user && email) {
    user = store.users.find(u => u.email === email);
  }
  if (user) {
    if (!user.oauth) user.oauth = {};
    user.oauth[provider] = String(providerId);
    if (!user.avatarUrl && avatar) user.avatarUrl = avatar;
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (user.lastLogin !== today) {
      user.streak    = user.lastLogin === yesterday ? (user.streak || 0) + 1 : 1;
      user.lastLogin = today;
    }
  } else {
    user = {
      id:        uuidv4(),
      name:      name || "StudyMate User",
      email:     email || null,
      password:  null,
      avatar:    (name || "S").charAt(0).toUpperCase(),
      avatarUrl: avatar || null,
      oauth:     { [provider]: String(providerId) },
      streak:    1,
      xp:        0,
      level:     1,
      lastLogin: new Date().toDateString(),
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  }
  store.save();
  return user;
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${BASE_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const user = upsertOAuthUser({
          provider:   "google",
          providerId: profile.id,
          name:       profile.displayName,
          email:      profile.emails?.[0]?.value,
          avatar:     profile.photos?.[0]?.value,
        });
        done(null, user);
      } catch (err) { done(err); }
    }
  ));
  console.log("[passport] ✅ Google strategy registered");
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const { Strategy: GitHubStrategy } = require("passport-github2");
  passport.use(new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  `${BASE_URL}/api/auth/github/callback`,
      scope:        ["user:email"],
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.find(e => e.primary)?.value ||
          profile.emails?.[0]?.value;
        const user = upsertOAuthUser({
          provider:   "github",
          providerId: String(profile.id),
          name:       profile.displayName || profile.username,
          email,
          avatar:     profile.photos?.[0]?.value,
        });
        done(null, user);
      } catch (err) { done(err); }
    }
  ));
  console.log("[passport] ✅ GitHub strategy registered");
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  const { Strategy: DiscordStrategy } = require("passport-discord");
  passport.use(new DiscordStrategy(
    {
      clientID:     process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL:  `${BASE_URL}/api/auth/discord/callback`,
      scope:        ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : null;
        const user = upsertOAuthUser({
          provider:   "discord",
          providerId: profile.id,
          name:       profile.global_name || profile.username,
          email:      profile.email,
          avatar:     avatarUrl,
        });
        done(null, user);
      } catch (err) { done(err); }
    }
  ));
  console.log("[passport] ✅ Discord strategy registered");
}

module.exports = passport;
