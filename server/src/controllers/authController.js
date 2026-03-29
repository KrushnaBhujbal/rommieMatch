const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
 
// ─────────────────────────────────────────
// REGISTER
// POST /api/auth/register
// ─────────────────────────────────────────
async function register(req, res) {
  // 1. Pull data out of the request body
  const { name, email, password, role } = req.body;
 
  // 2. Basic validation — check required fields exist
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
 
  if (!["lister", "seeker"].includes(role)) {
    return res.status(400).json({ error: "Role must be lister or seeker" });
  }
 
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
 
  try {
    // 3. Check if email already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
 
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already in use" });
    }
 
    // 4. Hash the password — NEVER store plain text
    // 10 = salt rounds (how much work bcrypt does — higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // 5. Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );
 
    const newUser = result.rows[0];
 
    // 6. Create a JWT token
    const token = jwt.sign(
      // Payload — what gets encoded into the token
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      // Secret key from .env
      process.env.JWT_SECRET,
      // Options
      { expiresIn: "7d" }
    );
 
    // 7. Send back the token and user info (never send the password)
    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
 
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
}
 
// ─────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
 
  try {
    // 1. Find user by email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
 
    if (result.rows.length === 0) {
      // Don't reveal whether it's the email or password that's wrong
      return res.status(401).json({ error: "Invalid email or password" });
    }
 
    const user = result.rows[0];
 
    // 2. Compare the submitted password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
 
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
 
    // 3. Sign a new JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
 
    // 4. Return token and safe user data
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
 
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
}
 
// ─────────────────────────────────────────
// GET ME
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────
async function getMe(req, res) {
  try {
    // req.user was attached by verifyToken middleware
    const result = await pool.query(
      "SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
 
    return res.status(200).json({ user: result.rows[0] });
 
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
 
module.exports = { register, login, getMe };