const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary with your credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tell multer to store files directly in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "roomiematch",       // folder name in your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }], // resize large images
  },
});

// File filter — reject files that aren't images
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);   // accept
  } else {
    cb(new Error("Only jpg, png, and webp images are allowed"), false); // reject
  }
}

// Create the multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

module.exports = { upload, cloudinary };