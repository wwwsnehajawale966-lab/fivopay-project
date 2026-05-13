import { query } from './config/db.js';

async function testUpdateChecklist() {
  try {
    const cardRes = await query('SELECT id FROM cards LIMIT 1');
    if (cardRes.rows.length === 0) {
      console.log('No cards to test.');
      process.exit(0);
    }
    const cardId = cardRes.rows[0].id;
    const testChecklist = [
      { text: 'Subtask 1', completed: true },
      { text: 'Subtask 2', completed: false }
    ];

    console.log(`Updating card ${cardId} with checklist...`);
    
    // Exact logic from controller
    const result = await query(
      `UPDATE cards 
       SET checklist = $1 
       WHERE id = $2 RETURNING *`,
      [JSON.stringify(testChecklist), cardId]
    );

    console.log('Update Result Checklist:', result.rows[0].checklist);
    process.exit(0);
  } catch (err) {
    console.error('ERROR DETECTED:', err);
    process.exit(1);
  }
}

testUpdateChecklist();
