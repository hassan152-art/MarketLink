import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  googleAuth,
  forgotPassword,
  resetPassword,
  refreshToken,
  sendOTP,
  verifyOTP,
  resetPasswordWithOTP,
  getSecurityLogs
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/reset-password-with-otp', resetPasswordWithOTP);
router.post('/refresh', refreshToken);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/security-logs', authenticateToken, getSecurityLogs);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

export default router;
