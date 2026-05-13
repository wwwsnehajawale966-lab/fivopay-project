import { query } from '../config/db.js';

// --- PLANNER TASK ACTIONS ---

// सर्व टास्क मिळवण्यासाठी
export const getPlannerTasks = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM planner_tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching planner tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// नवीन टास्क तयार करण्यासाठी
export const createPlannerTask = async (req, res) => {
  const { title, priority, estimated_time, block, status } = req.body;
  try {
    const result = await query(
      `INSERT INTO planner_tasks (user_id, title, priority, estimated_time, block, status, completed) 
       VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
      [req.user.id, title, priority || 'Medium', estimated_time || '', block || 'Morning', status || 'Pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating planner task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// टास्क अपडेट करण्यासाठी (Title, Completion, etc.)
export const updatePlannerTask = async (req, res) => {
  const { id } = req.params;
  const { title, priority, estimated_time, block, status, completed } = req.body;
  try {
    const result = await query(
      `UPDATE planner_tasks 
       SET title = $1, priority = $2, estimated_time = $3, block = $4, status = $5, completed = $6 
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, priority, estimated_time, block, status, completed, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating planner task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// टास्क डिलीट करण्यासाठी
export const deletePlannerTask = async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM planner_tasks WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting planner task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};

// --- FOCUS SESSION ACTIONS ---

// फोकस सेशन सेव्ह करण्यासाठी
export const saveFocusSession = async (req, res) => {
  const { task_id, start_time, end_time, duration_minutes, productivity_score } = req.body;
  try {
    const result = await query(
      `INSERT INTO focus_sessions (user_id, task_id, start_time, end_time, duration_minutes, productivity_score) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, task_id || null, start_time, end_time || new Date(), duration_minutes, productivity_score || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving focus session:', error);
    res.status(500).json({ message: 'Error saving focus session' });
  }
};

// आजचे स्टॅट्स मिळवण्यासाठी
export const getDailyStats = async (req, res) => {
  try {
    // १. आजचे पूर्ण झालेले टास्क
    const tasksResult = await query(
      'SELECT COUNT(*) as completed_count FROM planner_tasks WHERE user_id = $1 AND completed = true AND created_at::date = CURRENT_DATE',
      [req.user.id]
    );
    
    // २. आजचा एकूण फोकस टाईम
    const focusResult = await query(
      'SELECT SUM(duration_minutes) as total_minutes FROM focus_sessions WHERE user_id = $1 AND start_time::date = CURRENT_DATE',
      [req.user.id]
    );

    res.json({
      completedTasks: parseInt(tasksResult.rows[0].completed_count),
      totalFocusMinutes: parseInt(focusResult.rows[0].total_minutes || 0)
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};
