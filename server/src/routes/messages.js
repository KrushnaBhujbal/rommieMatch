const express     = require("express");
const router      = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
} = require("../controllers/messagesController");

// All routes require auth — any role can message
router.get("/unread-count",           verifyToken, getUnreadCount);
router.get("/conversations",          verifyToken, getConversations);
router.get("/:listingId/:otherUserId", verifyToken, getMessages);
router.post("/",                      verifyToken, sendMessage);

module.exports = router;