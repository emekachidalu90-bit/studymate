const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");
const store = require("../utils/store");

// Create quiz room
router.post("/create", auth, (req, res) => {
  const { title, questions, isPublic, timePerQuestion } = req.body;
  if (!questions || !questions.length) return res.status(400).json({ error: "Questions required" });

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = {
    id: uuidv4(),
    code,
    title: title || "Study Quiz",
    hostId: req.user.id,
    hostName: req.user.name,
    questions,
    isPublic: isPublic || false,
    timePerQuestion: timePerQuestion || 20,
    status: "waiting",
    players: [],
    currentQuestion: -1,
    scores: {},
    chat: [],
    createdAt: new Date().toISOString(),
  };
  store.quizRooms.set(code, room);
  setTimeout(() => { if (store.quizRooms.get(code)?.status === "waiting") store.quizRooms.delete(code); }, 3600000);
  res.json({ room });
});

// Get room info
router.get("/room/:code", (req, res) => {
  const room = store.quizRooms.get(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });
  const { questions: _, ...safeRoom } = room;
  res.json(safeRoom);
});

// Get public rooms
router.get("/public", (req, res) => {
  const rooms = [];
  store.quizRooms.forEach((r) => {
    if (r.isPublic && r.status === "waiting") {
      const { questions: _, ...safe } = r;
      rooms.push(safe);
    }
  });
  res.json(rooms);
});

module.exports = router;
