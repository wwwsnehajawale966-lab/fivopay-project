import { query } from './config/db.js';

async function listTables() {
  try {
    const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.table(result.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listTables();
