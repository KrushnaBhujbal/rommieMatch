const express = require("express");
const router = express.Router();
const { getMyProfile, getUserById } = require("../controllers/usersController");
const verifyToken = require("../middleware/verifyToken");
 
// All user routes require a valid token
router.get("/me",  verifyToken, getMyProfile);
router.get("/:id", verifyToken, getUserById);
 
module.exports = router;