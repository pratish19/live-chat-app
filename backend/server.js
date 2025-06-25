const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage
const users = {};
const messages = [];

// REST endpoint for login
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username || users[username]) {
    return res.status(400).json({ error: "Invalid or already used username" });
  }
  users[username] = true;
  res.json({ username });
});

// Get chat history
app.get("/messages", (req, res) => {
  res.json(messages);
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (data) => {
    messages.push(data); // Save to memory
    io.emit("receiveMessage", data); // Broadcast
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
