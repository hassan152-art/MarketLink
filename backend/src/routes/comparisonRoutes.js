import express from 'express';
import { compareProducts } from '../controllers/comparisonController.js';

const router = express.Router();

router.get('/', compareProducts);

export default router;
