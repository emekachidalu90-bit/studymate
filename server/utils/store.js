// Simple in-memory store (production: replace with MongoDB/PostgreSQL)
const store = {
  users: [],
  notes: [],
  quizRooms: new Map(),
};

module.exports = store;
