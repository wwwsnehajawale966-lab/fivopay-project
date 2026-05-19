import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function update() {
  try {
    const hash = await bcrypt.hash('fivopay@', 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = 'fivopay@gmail.com'", [hash]);
    console.log("Admin password updated to fivopay@ successfully!");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

update();
