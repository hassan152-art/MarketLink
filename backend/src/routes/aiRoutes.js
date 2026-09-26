import express from 'express';
import { handleAIChat } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', handleAIChat);

export default router;
