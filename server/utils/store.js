const fs   = require("fs");
const path = require("path");

const DATA_DIR  = process.env.NODE_ENV === "production" ? "/tmp" : path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "studymate-data.json");

if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("[store] Failed to load data file:", e.message);
  }
  return { users: [], notes: [] };
}

let saveTimer = null;
function persist(store) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const payload = { users: store.users, notes: store.notes };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
    } catch (e) {
      console.error("[store] Failed to save data file:", e.message);
    }
  }, 500);
}

const initial = load();
console.log(`[store] Loaded ${initial.users.length} users, ${initial.notes.length} notes from disk`);

const store = {
  users:     initial.users,
  notes:     initial.notes,
  quizRooms: new Map(),
  save() { persist(this); },
};

module.exports = store;
