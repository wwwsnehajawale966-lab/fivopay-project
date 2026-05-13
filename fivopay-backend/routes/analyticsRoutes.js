import express from 'express';
import {
  getBoardStats,
  getEmployeePerformance,
  getWeeklyProductivity,
  getTaskStatusDistribution,
  getDashboardAnalytics
} from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// Get complete dashboard analytics (all data in one call)
router.get('/dashboard/:boardId', getDashboardAnalytics);

// Get board statistics
router.get('/stats/:boardId', getBoardStats);

// Get employee performance data
router.get('/performance/:boardId', getEmployeePerformance);

// Get weekly productivity data
router.get('/weekly/:boardId', getWeeklyProductivity);

// Get task status distribution
router.get('/distribution/:boardId', getTaskStatusDistribution);

export default router;
