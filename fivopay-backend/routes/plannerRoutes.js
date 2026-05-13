import express from 'express';
import { 
  getPlannerTasks, 
  createPlannerTask, 
  updatePlannerTask, 
  deletePlannerTask,
  saveFocusSession,
  getDailyStats
} from '../controllers/plannerController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// सर्व रूट्सना ऑथेंटिकेशन लागेल
router.use(auth);

// Task Routes
router.get('/tasks', getPlannerTasks);
router.post('/tasks', createPlannerTask);
router.put('/tasks/:id', updatePlannerTask);
router.delete('/tasks/:id', deletePlannerTask);

// Focus & Stats Routes
router.post('/focus-session', saveFocusSession);
router.get('/stats/daily', getDailyStats);

export default router;
