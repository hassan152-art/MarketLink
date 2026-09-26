import express from 'express';
import { createOrder, getOrders, updateOrderStatus, cancelOrder, modifyOrder, getFarmerAnalytics } from '../controllers/orderController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/farmer/analytics', requireRole('Farmer', 'Admin'), getFarmerAnalytics);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/modify', modifyOrder);

export default router;
