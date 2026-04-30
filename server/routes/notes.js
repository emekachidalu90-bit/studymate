const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");
const store = require("../utils/store");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/plain",
      "text/markdown",
      "application/json",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|pptx|ppt|xlsx|xls|txt|md|json)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

async function extractText(filePath, mimetype, originalname) {
  const ext = path.extname(originalname).toLowerCase();
  try {
    if (ext === ".pdf" || mimetype === "application/pdf") {
      const pdfParse = require("pdf-parse");
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } else if ([".docx", ".doc"].includes(ext) || mimetype.includes("wordprocessingml") || mimetype.includes("msword")) {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if ([".pptx", ".ppt"].includes(ext) || mimetype.includes("presentationml")) {
      // Basic PPTX text extraction
      const AdmZip = require("adm-zip");
      try {
        const zip = new AdmZip(filePath);
        const entries = zip.getEntries();
        let text = "";
        entries.forEach((entry) => {
          if (entry.entryName.match(/ppt\/slides\/slide\d+\.xml/)) {
            const xml = entry.getData().toString("utf8");
            const matches = xml.match(/<a:t>(.*?)<\/a:t>/g) || [];
            matches.forEach((m) => {
              text += m.replace(/<[^>]*>/g, "") + " ";
            });
          }
        });
        return text || "Could not extract text from presentation.";
      } catch {
        return "Presentation file uploaded. Text extraction limited for this format.";
      }
    } else if ([".xlsx", ".xls"].includes(ext) || mimetype.includes("spreadsheetml") || mimetype.includes("ms-excel")) {
      const XLSX = require("xlsx");
      const wb = XLSX.readFile(filePath);
      let text = "";
      wb.SheetNames.forEach((name) => {
        text += `Sheet: ${name}\n`;
        text += XLSX.utils.sheet_to_csv(wb.Sheets[name]) + "\n";
      });
      return text;
    } else if ([".txt", ".md", ".json"].includes(ext) || mimetype.startsWith("text/")) {
      return fs.readFileSync(filePath, "utf8");
    }
    return "Could not extract text from this file type.";
  } catch (err) {
    return `Extraction error: ${err.message}`;
  }
}

// Upload file
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const content = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    const note = {
      id: uuidv4(),
      userId: req.user.id,
      title: req.body.title || req.file.originalname,
      content,
      filePath: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      type: "file",
      tags: req.body.tags ? req.body.tags.split(",") : [],
      summary: "",
      flashcards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.notes.push(note);

    // Update user XP
    const user = store.users.find((u) => u.id === req.user.id);
    if (user) { user.xp += 10; user.level = Math.floor(user.xp / 100) + 1; }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create text note
router.post("/", auth, (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content required" });
  const note = {
    id: uuidv4(),
    userId: req.user.id,
    title,
    content,
    type: "text",
    tags: tags || [],
    summary: "",
    flashcards: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.notes.push(note);
  const user = store.users.find((u) => u.id === req.user.id);
  if (user) { user.xp += 5; user.level = Math.floor(user.xp / 100) + 1; }
  res.json(note);
});

// Get user notes
router.get("/", auth, (req, res) => {
  const notes = store.notes.filter((n) => n.userId === req.user.id);
  res.json(notes);
});

// Get single note
router.get("/:id", auth, (req, res) => {
  const note = store.notes.find((n) => n.id === req.params.id && n.userId === req.user.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// Update note
router.put("/:id", auth, (req, res) => {
  const idx = store.notes.findIndex((n) => n.id === req.params.id && n.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Note not found" });
  store.notes[idx] = { ...store.notes[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json(store.notes[idx]);
});

// Delete note
router.delete("/:id", auth, (req, res) => {
  const idx = store.notes.findIndex((n) => n.id === req.params.id && n.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Note not found" });
  const [note] = store.notes.splice(idx, 1);
  if (note.filePath) {
    const fp = path.join(__dirname, "../uploads", note.filePath);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  res.json({ success: true });
});

module.exports = router;
