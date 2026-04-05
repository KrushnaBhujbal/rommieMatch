const express    = require("express");
const router     = express.Router();
const verifyToken  = require("../middleware/verifyToken");
const requireRole  = require("../middleware/requireRole");
const {
  saveListing,
  unsaveListing,
  getSavedListings,
  getSavedIds,
} = require("../controllers/savedListingsController");

// All routes — seeker only
router.get(   "/ids",         verifyToken, requireRole("seeker"), getSavedIds);
router.get(   "/",            verifyToken, requireRole("seeker"), getSavedListings);
router.post(  "/:listingId",  verifyToken, requireRole("seeker"), saveListing);
router.delete("/:listingId",  verifyToken, requireRole("seeker"), unsaveListing);

module.exports = router;