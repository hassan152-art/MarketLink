import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, quickUpdateStock, bulkUpdateStock } from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/bulk-stock', authenticateToken, requireRole('Farmer', 'Admin'), bulkUpdateStock);
router.put('/:id/stock', authenticateToken, requireRole('Farmer', 'Admin'), quickUpdateStock);
router.post('/', authenticateToken, requireRole('Farmer', 'Admin'), createProduct);
router.put('/:id', authenticateToken, requireRole('Farmer', 'Admin'), updateProduct);
router.delete('/:id', authenticateToken, requireRole('Farmer', 'Admin'), deleteProduct);

export default router;
