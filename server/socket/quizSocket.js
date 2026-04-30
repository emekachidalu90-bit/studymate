const store = require("../utils/store");

function setupSocketHandlers(io) {
  const QUESTION_TIME = 20000; // ms

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join quiz room
    socket.on("quiz:join", ({ code, playerName, userId }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room) return socket.emit("error", "Room not found");
      if (room.status !== "waiting" && room.status !== "playing") return socket.emit("error", "Game already ended");

      const player = { id: socket.id, userId, name: playerName, score: 0, answers: [], joinedAt: Date.now() };
      room.players = room.players.filter((p) => p.id !== socket.id);
      room.players.push(player);
      room.scores[socket.id] = 0;

      socket.join(code.toUpperCase());
      socket.data.roomCode = code.toUpperCase();
      socket.data.playerName = playerName;

      io.to(code.toUpperCase()).emit("quiz:playerJoined", { players: room.players, player });
      socket.emit("quiz:joined", { room: sanitizeRoom(room), playerId: socket.id });
    });

    // Host starts game
    socket.on("quiz:start", ({ code }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room) return socket.emit("error", "Room not found");
      if (room.hostId !== socket.data?.userId && room.players.find(p => p.id === socket.id)?.name !== room.hostName) {
        // Allow host socket
      }
      room.status = "playing";
      room.currentQuestion = 0;
      io.to(code.toUpperCase()).emit("quiz:started", { totalQuestions: room.questions.length });
      setTimeout(() => sendQuestion(io, code.toUpperCase()), 1000);
    });

    // Player submits answer
    socket.on("quiz:answer", ({ code, questionIndex, answerIndex, timeLeft }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room || room.status !== "playing") return;
      if (room.currentQuestion !== questionIndex) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      // Check if already answered
      if (player.answers[questionIndex] !== undefined) return;

      const question = room.questions[questionIndex];
      const correct = answerIndex === question.correct;
      const points = correct ? Math.max(500, Math.round(1000 * (timeLeft / (room.timePerQuestion || 20)))) : 0;

      player.answers[questionIndex] = { answerIndex, correct, points };
      player.score += points;
      room.scores[socket.id] = player.score;

      socket.emit("quiz:answerResult", {
        correct,
        points,
        correctAnswer: question.correct,
        explanation: question.explanation,
        totalScore: player.score,
      });

      // Check if all answered
      const answered = room.players.filter((p) => p.answers[questionIndex] !== undefined).length;
      if (answered === room.players.length) {
        clearTimeout(room._questionTimer);
        sendLeaderboard(io, room, code.toUpperCase());
      }
    });

    // Chat message
    socket.on("quiz:chat", ({ code, message }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room) return;
      const player = room.players.find((p) => p.id === socket.id);
      const msg = {
        id: Date.now(),
        playerId: socket.id,
        playerName: player?.name || "Anonymous",
        message: message.slice(0, 200),
        timestamp: new Date().toISOString(),
      };
      room.chat.push(msg);
      io.to(code.toUpperCase()).emit("quiz:chat", msg);
    });

    // Next question (host only)
    socket.on("quiz:next", ({ code }) => {
      const room = store.quizRooms.get(code?.toUpperCase());
      if (!room) return;
      clearTimeout(room._questionTimer);
      sendQuestion(io, code.toUpperCase());
    });

    // Disconnect
    socket.on("disconnect", () => {
      const code = socket.data?.roomCode;
      if (!code) return;
      const room = store.quizRooms.get(code);
      if (!room) return;
      room.players = room.players.filter((p) => p.id !== socket.id);
      io.to(code).emit("quiz:playerLeft", { playerId: socket.id, players: room.players });
    });
  });

  function sendQuestion(io, code) {
    const room = store.quizRooms.get(code);
    if (!room) return;

    if (room.currentQuestion >= room.questions.length) {
      endGame(io, room, code);
      return;
    }

    const q = room.questions[room.currentQuestion];
    const safeQ = { question: q.question, options: q.options, index: room.currentQuestion, total: room.questions.length };
    io.to(code).emit("quiz:question", { question: safeQ, timeLimit: room.timePerQuestion || 20 });

    room._questionTimer = setTimeout(() => {
      sendLeaderboard(io, room, code);
    }, (room.timePerQuestion || 20) * 1000 + 1000);
  }

  function sendLeaderboard(io, room, code) {
    const leaderboard = room.players
      .map((p) => ({ id: p.id, name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);

    const q = room.questions[room.currentQuestion];
    io.to(code).emit("quiz:leaderboard", {
      leaderboard,
      correctAnswer: q.correct,
      explanation: q.explanation,
      questionIndex: room.currentQuestion,
    });

    room.currentQuestion++;
    if (room.currentQuestion >= room.questions.length) {
      setTimeout(() => endGame(io, room, code), 5000);
    } else {
      setTimeout(() => sendQuestion(io, code), 5000);
    }
  }

  function endGame(io, room, code) {
    room.status = "ended";
    const finalLeaderboard = room.players
      .map((p) => ({ id: p.id, name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);
    io.to(code).emit("quiz:ended", { leaderboard: finalLeaderboard });
  }

  function sanitizeRoom(room) {
    const { questions, ...safe } = room;
    return { ...safe, totalQuestions: questions.length };
  }
}

module.exports = { setupSocketHandlers };
