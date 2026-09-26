import express from 'express';
import { getMarkets, getMarketById, createMarket, updateMarket, deleteMarket, getMarketHeatmap } from '../controllers/marketController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/heatmap', getMarketHeatmap);
router.get('/', getMarkets);
router.get('/:id', getMarketById);
router.post('/', authenticateToken, requireRole('Admin'), createMarket);
router.put('/:id', authenticateToken, requireRole('Admin'), updateMarket);
router.delete('/:id', authenticateToken, requireRole('Admin'), deleteMarket);

export default router;
