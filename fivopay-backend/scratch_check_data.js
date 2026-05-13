import { query } from './config/db.js';

async function checkData() {
  try {
    console.log('--- USERS ---');
    const users = await query("SELECT id, name, email FROM users LIMIT 5");
    console.table(users.rows);

    console.log('--- BOARDS ---');
    const boards = await query("SELECT id, title, user_id FROM boards LIMIT 5");
    console.table(boards.rows);

    console.log('--- BOARD_MEMBERS ---');
    const members = await query("SELECT * FROM board_members LIMIT 10");
    console.table(members.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
