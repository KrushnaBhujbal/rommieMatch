const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth",  require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/users"));

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running ✓" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});