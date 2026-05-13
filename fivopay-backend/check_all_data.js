import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkData() {
  try {
    const boards = await pool.query('SELECT * FROM boards');
    console.log('--- BOARDS ---');
    console.table(boards.rows);

    const members = await pool.query('SELECT * FROM board_members');
    console.log('--- BOARD MEMBERS ---');
    console.table(members.rows);

    const users = await pool.query('SELECT id, name, email FROM users');
    console.log('--- USERS ---');
    console.table(users.rows);

    const cards = await pool.query('SELECT id, title, list_id FROM cards');
    console.log('--- CARDS ---');
    console.table(cards.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkData();
