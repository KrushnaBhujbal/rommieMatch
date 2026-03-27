const pool = require("./pool");

async function seed() {
  try {
    // Clear existing data (order matters — delete children before parents)
    await pool.query("DELETE FROM messages");
    await pool.query("DELETE FROM saved_listings");
    await pool.query("DELETE FROM listings");
    await pool.query("DELETE FROM users");

    // Insert 2 test users
    // Password is "password123" hashed with bcrypt (we'll do real hashing on Day 3)
    const usersResult = await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Alex Johnson', 'alex@test.com', 'hashed_later', 'lister'),
        ('Sam Rivera',   'sam@test.com',  'hashed_later', 'seeker')
      RETURNING id, name, role
    `);

    console.log("✓ Users inserted:");
    usersResult.rows.forEach(u =>
      console.log(`  → ${u.name} (${u.role}) — id: ${u.id}`)
    );

    // Get lister's id
    const listerId = usersResult.rows[0].id;

    // Insert 2 test listings
    const listingsResult = await pool.query(`
      INSERT INTO listings (lister_id, title, description, rent, city, available_from) VALUES
        ($1, 'Cozy room near UT Arlington', 'Great natural light, quiet neighborhood', 750.00,  'Arlington', '2025-05-01'),
        ($1, 'Modern studio downtown',      'Gym access included, walk to campus',     1100.00, 'Arlington', '2025-06-01')
      RETURNING id, title, rent
    `, [listerId]);

    console.log("✓ Listings inserted:");
    listingsResult.rows.forEach(l =>
      console.log(`  → "${l.title}" — $${l.rent}/mo — id: ${l.id}`)
    );

    console.log("\n✓ Seed complete — database is ready for Day 3");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();