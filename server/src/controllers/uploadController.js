// ─────────────────────────────────────────
// UPLOAD IMAGE
// POST /api/upload
// Lister only — token required
// ─────────────────────────────────────────
async function uploadImage(req, res) {
  try {
    // multer + cloudinary already processed the file
    // req.file is populated by the upload middleware
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Cloudinary gives us the URL in req.file.path
    return res.status(200).json({
      url:       req.file.path,        // the Cloudinary URL
      public_id: req.file.filename,    // Cloudinary's internal ID (useful for deletion later)
    });

  } catch (err) {
    console.error("uploadImage error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}

module.exports = { uploadImage };