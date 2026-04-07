const pool = require("../db/pool");

// ─────────────────────────────────────────
// SEND A MESSAGE
// POST /api/messages
// Any logged-in user can send
// ─────────────────────────────────────────
async function sendMessage(req, res) {
  const { receiver_id, listing_id, content } = req.body;
  const sender_id = req.user.userId;

  if (!receiver_id || !listing_id || !content?.trim()) {
    return res.status(400).json({ error: "receiver_id, listing_id and content are required" });
  }

  // Can't message yourself
  if (Number(receiver_id) === sender_id) {
    return res.status(400).json({ error: "You cannot message yourself" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, listing_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sender_id, receiver_id, listing_id, content.trim()]
    );

    // Get sender name to return with message
    const sender = await pool.query(
      "SELECT name FROM users WHERE id = $1",
      [sender_id]
    );

    const message = {
      ...result.rows[0],
      sender_name: sender.rows[0].name,
    };

    return res.status(201).json({ message });

  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// GET ALL CONVERSATIONS
// GET /api/messages/conversations
// Returns one entry per unique conversation
// ─────────────────────────────────────────
async function getConversations(req, res) {
  const userId = req.user.userId;

  try {
    // Get the most recent message from each unique conversation
    // A conversation = unique (listing_id, other_user_id) pair
    const result = await pool.query(
      `SELECT DISTINCT ON (l.id, other_user.id)
         m.id,
         m.content,
         m.created_at,
         m.is_read,
         m.sender_id,
         m.receiver_id,
         l.id         AS listing_id,
         l.title      AS listing_title,
         l.images     AS listing_images,
         other_user.id   AS other_user_id,
         other_user.name AS other_user_name
       FROM messages m
       JOIN listings l ON m.listing_id = l.id
       JOIN users other_user ON other_user.id = CASE
         WHEN m.sender_id = $1 THEN m.receiver_id
         ELSE m.sender_id
       END
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY l.id, other_user.id, m.created_at DESC`,
      [userId]
    );

    return res.status(200).json({ conversations: result.rows });

  } catch (err) {
    console.error("getConversations error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// GET MESSAGES IN A CONVERSATION
// GET /api/messages/:listingId/:otherUserId
// Returns all messages between current user
// and otherUser about a specific listing
// ─────────────────────────────────────────
async function getMessages(req, res) {
  const userId      = req.user.userId;
  const { listingId, otherUserId } = req.params;

  try {
    // Mark messages as read
    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE listing_id  = $1
         AND receiver_id = $2
         AND sender_id   = $3
         AND is_read     = false`,
      [listingId, userId, otherUserId]
    );

    // Fetch all messages in this conversation
    const result = await pool.query(
      `SELECT
         m.*,
         u.name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.listing_id = $1
         AND (
           (m.sender_id = $2 AND m.receiver_id = $3)
           OR
           (m.sender_id = $3 AND m.receiver_id = $2)
         )
       ORDER BY m.created_at ASC`,
      [listingId, userId, otherUserId]
    );

    return res.status(200).json({ messages: result.rows });

  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// GET UNREAD COUNT
// GET /api/messages/unread-count
// ─────────────────────────────────────────
async function getUnreadCount(req, res) {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM messages
       WHERE receiver_id = $1 AND is_read = false`,
      [userId]
    );

    return res.status(200).json({
      unreadCount: Number(result.rows[0].count)
    });

  } catch (err) {
    console.error("getUnreadCount error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { sendMessage, getConversations, getMessages, getUnreadCount };