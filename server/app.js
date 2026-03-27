const express = require("express");
const cors = require("cors");
require("dotenv").config();
 
const app = express();
 
// ── Middleware ──────────────────────────────────────────
// Allow requests from your React app (port 5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
 
// Parse incoming JSON bodies (so req.body works)
app.use(express.json());
 
// ── Routes ─────────────────────────────────────────────
// Health check — visit http://localhost:5000/api/health
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running ✓", timestamp: new Date() });
});
 
// We'll add auth routes here in Day 3:
// app.use("/api/auth", require("./src/routes/auth"));
 
// ── 404 handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});
 
// ── Global error handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server" });
});
 
// ── Start server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});