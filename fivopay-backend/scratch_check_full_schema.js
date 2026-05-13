import { query } from './config/db.js';

async function checkAllSchemas() {
  const tables = ['users', 'boards', 'board_members', 'lists', 'cards'];
  for (const table of tables) {
    console.log(`--- Schema for ${table} ---`);
    const result = await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
    console.table(result.rows);
  }
  process.exit(0);
}

checkAllSchemas().catch(err => {
  console.error(err);
  process.exit(1);
});
