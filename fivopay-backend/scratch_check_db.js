import { query } from './config/db.js';

async function checkSchema() {
  try {
    console.log('--- USERS ---');
    const users = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
    console.table(users.rows);

    console.log('--- BOARDS ---');
    const boards = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'boards'");
    console.table(boards.rows);

    console.log('--- BOARD_MEMBERS ---');
    const members = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'board_members'");
    console.table(members.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
