import { query } from '../config/db.js';

// युजर्सची लिस्ट मिळवण्यासाठी
export const getUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, name, email FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// --- BOARD ACTIONS ---

export const getBoards = async (req, res) => {
  try {
    // आता आपण त्या बोर्ड्सना मिळवू जिथे हा युजर मेंबर आहे
    const result = await query(
      `SELECT b.* FROM boards b 
       INNER JOIN board_members bm ON b.id = bm.board_id 
       WHERE bm.user_id = $1 
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching boards' });
  }
};

export const createBoard = async (req, res) => {
  const { title } = req.body;
  try {
    // १. बोर्ड तयार करा
    const boardResult = await query(
      'INSERT INTO boards (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, req.user.id]
    );
    const newBoard = boardResult.rows[0];

    // २. तयार करणाऱ्या युजरला 'Member' म्हणून ॲड करा
    await query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
      [newBoard.id, req.user.id, 'admin']
    );

    res.status(201).json(newBoard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating board' });
  }
};

export const updateBoard = async (req, res) => {
  const { boardId, title } = req.body;
  try {
    const result = await query(
      'UPDATE boards SET title = $1 WHERE id = $2 RETURNING *',
      [title, boardId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating board' });
  }
};

// नवीन मेंबरला बोर्डमध्ये इन्व्हाईट करणे
export const inviteToBoard = async (req, res) => {
  const { boardId, userId } = req.body;
  try {
    // आधीच मेंबर आहे का तपासा
    const existing = await query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [boardId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    await query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
      [boardId, userId, 'member']
    );
    res.json({ message: 'User invited successfully' });
  } catch (error) {
    console.error('Invite Error:', error);
    res.status(500).json({ message: 'Error inviting user', details: error.message });
  }
};

// बोर्डचे मेंबर्स मिळवण्यासाठी
export const getBoardMembers = async (req, res) => {
  const { boardId } = req.params;
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, bm.role 
       FROM users u 
       JOIN board_members bm ON u.id = bm.user_id 
       WHERE bm.board_id = $1`,
      [boardId]
    );
    if (!res) return result.rows;
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    if (!res) throw error;
    res.status(500).json({ message: 'Error fetching board members' });
  }
};

// --- LIST ACTIONS ---

export const getBoardData = async (req, res) => {
  const { boardId } = req.params;
  const { date } = req.query || {};
  
  // Handle case where this is called from analytics controller (without res)
  if (!res) {
    const listsResult = await query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
      [boardId]
    );

    const lists = listsResult.rows;
    
    const listsWithCards = await Promise.all(lists.map(async (list) => {
      let cardsQuery = 'SELECT c.*, u.name as assignee_name FROM cards c LEFT JOIN users u ON c.assigned_to = u.id WHERE c.list_id = $1';
      let params = [list.id];

      if (date && date !== '' && date !== 'null' && date !== 'undefined') {
        cardsQuery += ' AND c.due_date::date = $2::date';
        params.push(date);
      }

      cardsQuery += ' ORDER BY c.position ASC';
      const cardsResult = await query(cardsQuery, params);
      
      const safeParse = (data) => {
        if (!data) return [];
        if (typeof data !== 'string') return data;
        try { return JSON.parse(data); } catch (e) { return []; }
      };
      
      const cards = cardsResult.rows.map(card => ({
        ...card,
        checklist: safeParse(card.checklist),
        labels: safeParse(card.labels)
      }));
      
      return { ...list, cards };
    }));

    return listsWithCards;
  }

  try {
    const listsResult = await query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
      [boardId]
    );

    const lists = listsResult.rows;

    const listsWithCards = await Promise.all(lists.map(async (list) => {
      let cardsQuery = 'SELECT c.*, u.name as assignee_name FROM cards c LEFT JOIN users u ON c.assigned_to = u.id WHERE c.list_id = $1';
      let params = [list.id];

      if (date && date !== '' && date !== 'null' && date !== 'undefined') {
        cardsQuery += ' AND c.due_date::date = $2::date';
        params.push(date);
      }

      cardsQuery += ' ORDER BY c.position ASC';
      const cardsResult = await query(cardsQuery, params);

      const safeParse = (data) => {
        if (!data) return [];
        if (typeof data !== 'string') return data;
        try { return JSON.parse(data); } catch (e) { return []; }
      };

      const cards = cardsResult.rows.map(card => ({
        ...card,
        labels: safeParse(card.labels),
        checklist: safeParse(card.checklist)
      }));

      return { ...list, cards };
    }));

    res.json(listsWithCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching board data' });
  }
};

export const createList = async (req, res) => {
  const { boardId, title, position } = req.body;
  try {
    const result = await query(
      'INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING *',
      [boardId, title, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating list' });
  }
};

export const updateList = async (req, res) => {
  const { listId, title } = req.body;
  try {
    const result = await query(
      'UPDATE lists SET title = $1 WHERE id = $2 RETURNING *',
      [title, listId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating list' });
  }
};

export const deleteList = async (req, res) => {
  const { listId } = req.params;
  try {
    await query('DELETE FROM cards WHERE list_id = $1', [listId]);
    await query('DELETE FROM lists WHERE id = $1', [listId]);
    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting list' });
  }
};

// --- CARD ACTIONS ---

export const createCard = async (req, res) => {
  const { listId, title, position, due_date, assigned_to, description, is_done, labels, name, checklist } = req.body;
  try {
    const result = await query(
      `INSERT INTO cards (list_id, title, position, due_date, assigned_to, description, is_done, labels, name, checklist) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        listId,
        title,
        position,
        due_date || null,
        assigned_to || null,
        description || '',
        is_done || false,
        JSON.stringify(labels || []),
        name || '',
        JSON.stringify(checklist || [])

      ]
    );

    // Parse arrays for response (defensive parsing)
    const card = result.rows[0];
    card.labels = Array.isArray(card.labels)
      ? card.labels
      : (typeof card.labels === 'string' && card.labels.trim() ? JSON.parse(card.labels) : (card.labels || []));
    card.checklist = Array.isArray(card.checklist)
      ? card.checklist
      : (typeof card.checklist === 'string' && card.checklist.trim() ? JSON.parse(card.checklist) : (card.checklist || []));

    res.status(201).json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating card' });
  }
};

export const updateCard = async (req, res) => {
  const { cardId, title, description, due_date, assigned_to, is_done, labels, name, checklist } = req.body;
  try {
    const result = await query(
      `UPDATE cards 
       SET title = $1, description = $2, due_date = $3, assigned_to = $4, is_done = $5, labels = $6, name = $7, checklist = $8 
       WHERE id = $9 RETURNING *`,
      [
        title,
        description,
        due_date || null,
        assigned_to || null,
        is_done || false,
        JSON.stringify(labels || []),
        name || '',
        JSON.stringify(checklist || []),
        cardId
      ]
    );

    // Parse arrays for response (defensive parsing)
    const card = result.rows[0];
    card.labels = Array.isArray(card.labels)
      ? card.labels
      : (typeof card.labels === 'string' && card.labels.trim() ? JSON.parse(card.labels) : (card.labels || []));
    card.checklist = Array.isArray(card.checklist)
      ? card.checklist
      : (typeof card.checklist === 'string' && card.checklist.trim() ? JSON.parse(card.checklist) : (card.checklist || []));

    res.json(card);
  } catch (error) {
    console.error('Update Card Error:', error);
    res.status(500).json({ message: 'Error updating card', details: error.message });
  }
};

export const moveCard = async (req, res) => {
  const { cardId, newListId, newPosition } = req.body;
  try {
    const result = await query(
      'UPDATE cards SET list_id = $1, position = $2 WHERE id = $3 RETURNING *',
      [newListId, newPosition, cardId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error moving card' });
  }
};

export const deleteCard = async (req, res) => {
  const { cardId } = req.params;
  try {
    await query('DELETE FROM cards WHERE id = $1', [cardId]);
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting card' });
  }
};
