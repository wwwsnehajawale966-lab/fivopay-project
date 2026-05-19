import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function check() {
  try {
    const timeResult = await pool.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ CONNECTED to DB:', timeResult.rows[0].db);

    const tablesResult = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('\n📋 Tables:', tablesResult.rows.map(t => t.tablename));

    if (tablesResult.rows.length === 0) {
      console.log('\n⚠️ No tables found! Creating tables...');
      await createTables(pool);
      console.log('✅ Tables created successfully!');
    } else {
      // Check if users table exists
      const hasUsers = tablesResult.rows.some(t => t.tablename === 'users');
      if (hasUsers) {
        const usersResult = await pool.query('SELECT id, name, email FROM users');
        console.log('\n👥 Users:', usersResult.rows.length);
        usersResult.rows.forEach(u => console.log('  -', u.id, '|', u.name, '|', u.email));
      }
    }
  } catch (err) {
    if (err.code === '3D000') {
      console.error('❌ Database "fivopay_db" does not exist!');
      console.log('➡️  Run this command first: createdb -U postgres fivopay_db');
    } else {
      console.error('❌ ERROR:', err.message, '| Code:', err.code);
    }
  } finally {
    await pool.end();
    process.exit(0);
  }
}

async function createTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS boards (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS board_members (
      id SERIAL PRIMARY KEY,
      board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'member',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(board_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS lists (
      id SERIAL PRIMARY KEY,
      board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      position INTEGER DEFAULT 0,
      due_date TIMESTAMP,
      assigned_to INTEGER REFERENCES users(id),
      is_done BOOLEAN DEFAULT false,
      labels JSONB DEFAULT '[]',
      name VARCHAR(255) DEFAULT '',
      checklist JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS planner_tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      priority VARCHAR(50) DEFAULT 'Medium',
      estimated_time VARCHAR(50) DEFAULT '',
      block VARCHAR(50) DEFAULT 'Morning',
      status VARCHAR(50) DEFAULT 'Pending',
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES planner_tasks(id) ON DELETE SET NULL,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP,
      duration_minutes INTEGER DEFAULT 0,
      productivity_score INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

check();
