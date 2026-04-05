const pool = require("../db/pool");

// ─────────────────────────────────────────
// SAVE A LISTING
// POST /api/saved-listings/:listingId
// Seeker only
// ─────────────────────────────────────────
async function saveListing(req, res) {
  const { listingId } = req.params;
  const seekerId = req.user.userId;

  try {
    // Check listing exists and is active
    const listing = await pool.query(
      "SELECT id FROM listings WHERE id = $1 AND is_active = true",
      [listingId]
    );

    if (listing.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Insert — ON CONFLICT DO NOTHING handles duplicate saves gracefully
    await pool.query(
      `INSERT INTO saved_listings (seeker_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (seeker_id, listing_id) DO NOTHING`,
      [seekerId, listingId]
    );

    return res.status(200).json({ saved: true, listingId: Number(listingId) });

  } catch (err) {
    console.error("saveListing error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// UNSAVE A LISTING
// DELETE /api/saved-listings/:listingId
// Seeker only
// ─────────────────────────────────────────
async function unsaveListing(req, res) {
  const { listingId } = req.params;
  const seekerId = req.user.userId;

  try {
    await pool.query(
      "DELETE FROM saved_listings WHERE seeker_id = $1 AND listing_id = $2",
      [seekerId, listingId]
    );

    return res.status(200).json({ saved: false, listingId: Number(listingId) });

  } catch (err) {
    console.error("unsaveListing error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// GET ALL SAVED LISTINGS
// GET /api/saved-listings
// Seeker only — returns full listing objects
// ─────────────────────────────────────────
async function getSavedListings(req, res) {
  const seekerId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT
         l.*,
         u.name        AS lister_name,
         u.is_verified AS lister_verified,
         sl.created_at AS saved_at
       FROM saved_listings sl
       JOIN listings l ON sl.listing_id = l.id
       JOIN users    u ON l.lister_id   = u.id
       WHERE sl.seeker_id = $1
         AND l.is_active  = true
       ORDER BY sl.created_at DESC`,
      [seekerId]
    );

    return res.status(200).json({
      savedListings: result.rows,
      count: result.rowCount,
    });

  } catch (err) {
    console.error("getSavedListings error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// GET SAVED LISTING IDs ONLY
// GET /api/saved-listings/ids
// Seeker only — lightweight, just the IDs
// Used to check which listings are saved
// ─────────────────────────────────────────
async function getSavedIds(req, res) {
  const seekerId = req.user.userId;

  try {
    const result = await pool.query(
      "SELECT listing_id FROM saved_listings WHERE seeker_id = $1",
      [seekerId]
    );

    const ids = result.rows.map(r => r.listing_id);
    return res.status(200).json({ savedIds: ids });

  } catch (err) {
    console.error("getSavedIds error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = { saveListing, unsaveListing, getSavedListings, getSavedIds };