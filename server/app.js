const express   = require("express");
const cors      = require("cors");
const http      = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running ✓" });
});

app.use("/api/auth",           require("./src/routes/auth"));
app.use("/api/users",          require("./src/routes/users"));
app.use("/api/listings",       require("./src/routes/listings"));
app.use("/api/upload",         require("./src/routes/upload"));
app.use("/api/saved-listings", require("./src/routes/savedListings"));
app.use("/api/messages",       require("./src/routes/messages"));

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join_conversation", ({ listingId, userId, otherUserId }) => {
    const roomId = [
      `listing_${listingId}`,
      `users_${[userId, otherUserId].sort().join("_")}`,
    ].join("_");
    socket.join(roomId);
    socket.data.roomId = roomId;
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", (message) => {
    const roomId = socket.data.roomId;
    if (roomId) {
      io.to(roomId).emit("receive_message", message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});