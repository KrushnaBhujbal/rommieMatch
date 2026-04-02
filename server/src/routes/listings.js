const express    = require("express");
const router     = express.Router();
const verifyToken   = require("../middleware/verifyToken");
const requireRole   = require("../middleware/requireRole");
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} = require("../controllers/listingsController");
 
// Public — no token needed
router.get("/",    getListings);
router.get("/:id", getListingById);
 
// Lister only — token + role check
router.post(  "/",    verifyToken, requireRole("lister"), createListing);
router.patch( "/:id", verifyToken, requireRole("lister"), updateListing);
router.delete("/:id", verifyToken, requireRole("lister"), deleteListing);
 
module.exports = router;
 