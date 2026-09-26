import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getCategories,
  addCategory,
  createAnnouncement,
  deleteAnnouncement,
  getAdvancedAnalytics,
  exportPlatformReports
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken, requireRole('Admin'));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAdvancedAnalytics);
router.get('/export', exportPlatformReports);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

export default router;
