const pool = require("../db/pool");
 
// ─────────────────────────────────────────
// GET /api/users/me
// Returns full profile of the logged-in user
// ─────────────────────────────────────────
async function getMyProfile(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         id,
         name,
         email,
         role,
         avatar_url,
         is_verified,
         created_at
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
 
    return res.status(200).json({ user: result.rows[0] });
 
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
 
// ─────────────────────────────────────────
// GET /api/users/:id
// Returns public profile of any user by id
// ─────────────────────────────────────────
async function getUserById(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         id,
         name,
         role,
         avatar_url,
         is_verified,
         created_at
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
 
    // Note: no email returned — that's private
    return res.status(200).json({ user: result.rows[0] });
 
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
 
module.exports = { getMyProfile, getUserById };