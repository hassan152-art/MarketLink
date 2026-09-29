import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import docsRoutes from './routes/docsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import comparisonRoutes from './routes/comparisonRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import { getOrderQR, verifyQR } from './controllers/qrController.js';
import { getAuditLogs, getFoodWasteMetrics, logAuditEvent } from './controllers/auditController.js';
import { getAIForecast, getAIWasteAlerts } from './controllers/aiController.js';
import { authenticateToken, requireRole } from './middleware/authMiddleware.js';
import { connectDB, loadDB, getDB } from './config/db.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
// Vercel (and most hosts) sit behind a reverse proxy, so Express needs this to
// read the real client IP from X-Forwarded-For (used by the rate limiters
// below and by req.ip in the audit log). Without it, express-rate-limit
// throws in production.
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// Global: 300 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Strict: 15 requests per 15 minutes per IP for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login/signup attempts. Please wait 15 minutes before trying again.' }
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ─── Audit Logging Middleware ─────────────────────────────────────────────────
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    logAuditEvent(`${req.method} ${req.path}`, `API Invocation by IP ${req.ip}`);
  }
  next();
});

// ─── Connect Database ─────────────────────────────────────────────────────────
await connectDB();
await loadDB();

const db = getDB();
if (!db.users || db.users.length === 0) {
  console.log('🌱 Initializing & seeding MarketLink database...');
  await seedDatabase();
}

// ─── Mounted Express Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/announcements', announcementRoutes);

// ─── Advanced Endpoints ───────────────────────────────────────────────────────
app.get('/api/qr/:id', getOrderQR);
app.post('/api/qr/verify', authenticateToken, requireRole('Farmer', 'Customer', 'Admin'), verifyQR);
app.get('/api/ai/forecast', authenticateToken, getAIForecast);
app.get('/api/ai/waste-alerts', getAIWasteAlerts);
app.get('/api/audit/logs', authenticateToken, requireRole('Admin'), getAuditLogs);
app.get('/api/impact/food-waste', getFoodWasteMetrics);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MarketLink API Server is running smoothly!',
    timestamp: new Date(),
    features: ['notifications', 'sse', 'rate-limiting', 'compression', 'helmet', 'comparison', 'heatmap']
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 MarketLink Server running on http://localhost:${port}`);
    console.log(`📖 API Documentation available at http://localhost:${port}/api/docs`);
    console.log(`🔔 Notifications: /api/notifications`);
    console.log(`🔍 Price Compare: /api/compare?name=tomato`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is busy. Retrying on ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

// Vercel's newer "Services" deployment model runs this as a persistent Web
// Service (not a serverless function), so it must always bind to a port —
// Vercel injects the PORT environment variable for the service to listen on.
startServer(PORT);

export default app;
