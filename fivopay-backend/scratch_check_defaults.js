import { query } from './config/db.js';

async function checkDefaults() {
  try {
    console.log('--- BOARDS DEFAULTS ---');
    const boards = await query("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'boards'");
    console.table(boards.rows);

    console.log('--- LISTS DEFAULTS ---');
    const lists = await query("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'lists'");
    console.table(lists.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDefaults();
