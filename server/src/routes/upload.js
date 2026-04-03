const express      = require("express");
const router       = express.Router();
const verifyToken  = require("../middleware/verifyToken");
const requireRole  = require("../middleware/requireRole");
const { upload }   = require("../config/cloudinary");
const { uploadImage } = require("../controllers/uploadController");

// POST /api/upload
// Only listers can upload images
// upload.single("image") processes ONE file with field name "image"
router.post(
  "/",
  verifyToken,
  requireRole("lister"),
  upload.single("image"),
  uploadImage
);

module.exports = router;