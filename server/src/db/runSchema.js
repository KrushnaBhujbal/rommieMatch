const pool = require("./pool");
const fs = require("fs");
const path = require("path");

async function runSchema() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf8"
    );
    await pool.query(sql);
    console.log("✓ All tables created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Schema error:", err.message);
    process.exit(1);
  }
}

runSchema();