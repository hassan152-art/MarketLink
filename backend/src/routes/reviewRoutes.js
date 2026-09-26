import express from 'express';
import { getReviews, createReview, respondToReview, deleteReview } from '../controllers/reviewController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', authenticateToken, requireRole('Customer'), createReview);
router.put('/:id/respond', authenticateToken, requireRole('Farmer', 'Admin'), respondToReview);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteReview);

export default router;
