import { query } from './config/db.js';

async function testCreateBoard() {
  try {
    const userId = 1; // sneha jawale
    const title = 'Test Board ' + Date.now();
    
    console.log('Creating board...');
    const boardResult = await query(
      'INSERT INTO boards (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, userId]
    );
    const newBoard = boardResult.rows[0];
    console.log('Board created:', newBoard);

    console.log('Adding member...');
    await query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
      [newBoard.id, userId, 'admin']
    );
    console.log('Member added.');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testCreateBoard();
