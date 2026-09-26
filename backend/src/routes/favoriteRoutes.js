import express from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoriteController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

export default router;
