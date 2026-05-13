import { query } from './config/db.js';

async function checkAllData() {
  try {
    console.log('--- USERS ---');
    const users = await query("SELECT id, name, email FROM users");
    console.table(users.rows);

    console.log('--- BOARDS ---');
    const boards = await query("SELECT id, title, user_id FROM boards");
    console.table(boards.rows);

    console.log('--- BOARD_MEMBERS ---');
    const members = await query("SELECT * FROM board_members");
    console.table(members.rows);

    console.log('--- LISTS ---');
    const lists = await query("SELECT * FROM lists");
    console.table(lists.rows);

    console.log('--- CARDS ---');
    const cards = await query("SELECT * FROM cards");
    console.table(cards.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAllData();
