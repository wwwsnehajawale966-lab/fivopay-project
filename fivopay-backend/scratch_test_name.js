import { query } from './config/db.js';

async function testUpdateName() {
  try {
    // Get the first card
    const cardRes = await query('SELECT id FROM cards LIMIT 1');
    if (cardRes.rows.length === 0) {
      console.log('No cards found to test.');
      process.exit(0);
    }
    const cardId = cardRes.rows[0].id;
    const testName = 'Test Name ' + Date.now();

    console.log(`Updating card ${cardId} with name: ${testName}`);
    
    // Simulate the updateCard logic
    const result = await query(
      `UPDATE cards 
       SET name = $1 
       WHERE id = $2 RETURNING *`,
      [testName, cardId]
    );

    console.log('Update Result:', result.rows[0]);
    
    if (result.rows[0].name === testName) {
      console.log('SUCCESS: Name was saved to database.');
    } else {
      console.log('FAILURE: Name was NOT saved.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testUpdateName();
