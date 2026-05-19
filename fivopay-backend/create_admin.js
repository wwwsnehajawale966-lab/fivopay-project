import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
  try {
    // Check if admin already exists
    const existing = await pool.query("SELECT id, name, email FROM users WHERE email = 'fivopay@gmail.com'");
    if (existing.rows.length > 0) {
      console.log('✅ Admin already exists:', existing.rows[0]);
      process.exit(0);
      return;
    }

    // Create admin user with password fivopay9156@
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('fivopay9156@', salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      ['Admin FivoPay', 'fivopay@gmail.com', hashedPassword]
    );

    console.log('✅ Admin user created successfully!');
    console.log('   ID:', result.rows[0].id);
    console.log('   Name:', result.rows[0].name);
    console.log('   Email:', result.rows[0].email);
    console.log('   Password: fivopay9156@');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAdmin();
