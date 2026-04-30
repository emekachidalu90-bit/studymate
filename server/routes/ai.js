const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const store = require("../utils/store");

function getGroq() {
  const Groq = require("groq-sdk");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function groqChat(messages, model = "llama-3.1-8b-instant") {
  const groq = getGroq();
  const res = await groq.chat.completions.create({ model, messages, max_tokens: 2048 });
  return res.choices[0]?.message?.content || "";
}

// Summarize note
router.post("/summarize/:noteId", auth, async (req, res) => {
  try {
    const note = store.notes.find((n) => n.id === req.params.noteId && n.userId === req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const summary = await groqChat([
      { role: "system", content: "You are a study assistant. Summarize the content concisely, preserving key concepts, definitions, and important points. Format with bullet points for easy reading." },
      { role: "user", content: `Summarize this study material:\n\n${note.content.slice(0, 8000)}` },
    ]);

    note.summary = summary;
    note.updatedAt = new Date().toISOString();
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate flashcards
router.post("/flashcards/:noteId", auth, async (req, res) => {
  try {
    const note = store.notes.find((n) => n.id === req.params.noteId && n.userId === req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const count = req.body.count || 10;
    const raw = await groqChat([
      { role: "system", content: `Generate exactly ${count} flashcard pairs from the study material. Return ONLY valid JSON array: [{"front": "question/term", "back": "answer/definition"}]. No extra text.` },
      { role: "user", content: `Create ${count} flashcards from:\n\n${note.content.slice(0, 8000)}` },
    ]);

    let flashcards = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      flashcards = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch { flashcards = []; }

    note.flashcards = flashcards;
    note.updatedAt = new Date().toISOString();
    res.json({ flashcards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate quiz questions from note
router.post("/generate-quiz", auth, async (req, res) => {
  try {
    const { content, count = 10, difficulty = "medium" } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    const raw = await groqChat([
      {
        role: "system",
        content: `You are a quiz creator. Generate exactly ${count} multiple-choice questions at ${difficulty} difficulty. Return ONLY a valid JSON array:
[{
  "question": "Question text?",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "explanation": "Why this answer is correct"
}]
The "correct" field is the index (0-3) of the correct option. No extra text outside the JSON.`,
      },
      { role: "user", content: `Generate ${count} quiz questions from this material:\n\n${content.slice(0, 8000)}` },
    ]);

    let questions = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch { questions = []; }

    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Tutor chat
router.post("/tutor", auth, async (req, res) => {
  try {
    const { messages, noteContext } = req.body;
    const systemPrompt = noteContext
      ? `You are StudyMate AI, a friendly and knowledgeable study tutor. The student is studying the following material:\n\n${noteContext.slice(0, 4000)}\n\nAnswer questions, explain concepts, give examples, and help the student understand the material deeply. Be encouraging and clear.`
      : "You are StudyMate AI, a friendly and knowledgeable study tutor. Help students understand any topic, answer questions, and provide clear explanations with examples.";

    const reply = await groqChat([
      { role: "system", content: systemPrompt },
      ...messages.slice(-10),
    ]);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Explain concept
router.post("/explain", auth, async (req, res) => {
  try {
    const { term, context } = req.body;
    const reply = await groqChat([
      { role: "system", content: "You are a study assistant. Explain concepts clearly and concisely with examples. Use simple language." },
      { role: "user", content: `Explain "${term}"${context ? ` in the context of: ${context}` : ""}` },
    ]);
    res.json({ explanation: reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Study plan generator
router.post("/study-plan", auth, async (req, res) => {
  try {
    const { subject, duration, goals } = req.body;
    const reply = await groqChat([
      { role: "system", content: "You are a study coach. Create detailed, actionable study plans with time blocks, topics, and strategies." },
      { role: "user", content: `Create a study plan for: ${subject}\nAvailable time: ${duration}\nGoals: ${goals}` },
    ]);
    res.json({ plan: reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mind map outline
router.post("/mindmap/:noteId", auth, async (req, res) => {
  try {
    const note = store.notes.find((n) => n.id === req.params.noteId && n.userId === req.user.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const raw = await groqChat([
      {
        role: "system",
        content: `Generate a mind map structure as JSON. Return ONLY:
{"center": "Main Topic", "branches": [{"label": "Branch", "children": ["item1", "item2"]}]}`,
      },
      { role: "user", content: `Create a mind map for:\n\n${note.content.slice(0, 6000)}` },
    ]);

    let mindmap = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      mindmap = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch { mindmap = { center: note.title, branches: [] }; }

    res.json({ mindmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
