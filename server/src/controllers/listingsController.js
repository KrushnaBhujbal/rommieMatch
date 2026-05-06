const pool = require("../db/pool");
const { Client } = require("@googlemaps/google-maps-services-js");
const mapsClient = new Client({});

async function geocodeAddress(address, city) {
  if (!process.env.GOOGLE_MAPS_API_KEY) return { lat: null, lng: null };
  
  try {
    const response = await mapsClient.geocode({
      params: {
        address: `${address}, ${city}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    }
    return { lat: null, lng: null };
  } catch {
    return { lat: null, lng: null };
  }
}

// ─────────────────────────────────────────
// CREATE LISTING
// POST /api/listings
// Lister only
// ─────────────────────────────────────────
async function createListing(req, res) {
  const {
    title,
    description,
    rent,
    city,
    address,
    available_from,
    bedrooms,
    bathrooms,
    furnished,
    pets_allowed,
    images,
  } = req.body;

  // Validation
  if (!title || !rent || !city || !available_from) {
    return res.status(400).json({
      error: "title, rent, city and available_from are required",
    });
  }

  if (isNaN(rent) || Number(rent) <= 0) {
    return res.status(400).json({ error: "rent must be a positive number" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings
         (lister_id, title, description, rent, city, address,
          available_from, bedrooms, bathrooms, furnished, pets_allowed, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        req.user.userId,
        title,
        description || null,
        Number(rent),
        city,
        address || null,
        available_from,
        bedrooms || 1,
        bathrooms || 1,
        furnished || false,
        pets_allowed || false,
        images || [],
      ]
    );

    return res.status(201).json({ listing: result.rows[0] });
  } catch (err) {
    console.error("createListing error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// GET ALL LISTINGS
// GET /api/listings
// Public — no token needed
// Supports ?city=&maxRent=&available_from=
// ─────────────────────────────────────────
async function getListings(req, res) {
  const { city, maxRent, available_from } = req.query;

  // Build query dynamically based on filters
  let query  = `
    SELECT
      l.*,
      u.name  AS lister_name,
      u.is_verified AS lister_verified
    FROM listings l
    JOIN users u ON l.lister_id = u.id
    WHERE l.is_active = true
  `;
  const values = [];
  let   paramCount = 1;

  if (city) {
    query += ` AND LOWER(l.city) LIKE LOWER($${paramCount})`;
    values.push(`%${city}%`);
    paramCount++;
  }

  if (maxRent) {
    query += ` AND l.rent <= $${paramCount}`;
    values.push(Number(maxRent));
    paramCount++;
  }

  if (available_from) {
    query += ` AND l.available_from >= $${paramCount}`;
    values.push(available_from);
    paramCount++;
  }

  query += ` ORDER BY l.created_at DESC`;

try {
  // Geocode the address if provided
  let latitude  = null;
  let longitude = null;

  if (address || city) {
    const coords = await geocodeAddress(address || city, city);
    latitude  = coords.lat;
    longitude = coords.lng;
  }

  const result = await pool.query(
    `INSERT INTO listings
       (lister_id, title, description, rent, city, address,
        available_from, bedrooms, bathrooms, furnished, pets_allowed,
        images, latitude, longitude)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      req.user.userId,
      title,
      description || null,
      Number(rent),
      city,
      address || null,
      available_from,
      bedrooms || 1,
      bathrooms || 1,
      furnished || false,
      pets_allowed || false,
      images || [],
      latitude,
      longitude,
    ]
  );

  return res.status(201).json({ listing: result.rows[0] });
} catch (err) {
  console.error("createListing error:", err);
  return res.status(500).json({ error: "Server error" });
}
}

// ─────────────────────────────────────────
// GET ONE LISTING
// GET /api/listings/:id
// Public
// ─────────────────────────────────────────
async function getListingById(req, res) {
  try {
    // JOIN to get lister info alongside listing
    const result = await pool.query(
      `SELECT
         l.*,
         u.name        AS lister_name,
         u.is_verified AS lister_verified,
         u.created_at  AS lister_since
       FROM listings l
       JOIN users u ON l.lister_id = u.id
       WHERE l.id = $1 AND l.is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    return res.status(200).json({ listing: result.rows[0] });
  } catch (err) {
    console.error("getListingById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// UPDATE LISTING
// PATCH /api/listings/:id
// Lister only — must own the listing
// ─────────────────────────────────────────
async function updateListing(req, res) {
  try {
    // First check the listing exists and belongs to this lister
    const check = await pool.query(
      "SELECT id, lister_id FROM listings WHERE id = $1 AND is_active = true",
      [req.params.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (check.rows[0].lister_id !== req.user.userId) {
      return res.status(403).json({ error: "You can only edit your own listings" });
    }

    // Only update fields that were actually sent
    const {
      title, description, rent, city, address,
      available_from, bedrooms, bathrooms,
      furnished, pets_allowed, images,
    } = req.body;

    const result = await pool.query(
      `UPDATE listings SET
         title          = COALESCE($1,  title),
         description    = COALESCE($2,  description),
         rent           = COALESCE($3,  rent),
         city           = COALESCE($4,  city),
         address        = COALESCE($5,  address),
         available_from = COALESCE($6,  available_from),
         bedrooms       = COALESCE($7,  bedrooms),
         bathrooms      = COALESCE($8,  bathrooms),
         furnished      = COALESCE($9,  furnished),
         pets_allowed   = COALESCE($10, pets_allowed),
         images         = COALESCE($11, images)
       WHERE id = $12
       RETURNING *`,
      [
        title, description, rent ? Number(rent) : null,
        city, address, available_from,
        bedrooms, bathrooms, furnished, pets_allowed, images,
        req.params.id,
      ]
    );

    return res.status(200).json({ listing: result.rows[0] });
  } catch (err) {
    console.error("updateListing error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ─────────────────────────────────────────
// DELETE LISTING (soft delete)
// DELETE /api/listings/:id
// Lister only — must own the listing
// ─────────────────────────────────────────
async function deleteListing(req, res) {
  try {
    const check = await pool.query(
      "SELECT id, lister_id FROM listings WHERE id = $1 AND is_active = true",
      [req.params.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (check.rows[0].lister_id !== req.user.userId) {
      return res.status(403).json({ error: "You can only delete your own listings" });
    }

    // Soft delete — set is_active = false, don't actually delete the row
    await pool.query(
      "UPDATE listings SET is_active = false WHERE id = $1",
      [req.params.id]
    );

    return res.status(200).json({ message: "Listing removed successfully" });
  } catch (err) {
    console.error("deleteListing error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
};