import express from 'express';
import { getPublicAnnouncements } from '../controllers/adminController.js';

const router = express.Router();

router.get('/', getPublicAnnouncements);

export default router;
