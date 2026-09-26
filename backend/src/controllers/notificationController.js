import { getDB, saveDB, generateId } from '../config/db.js';

// ─── SSE Client Registry ──────────────────────────────────────────────────────
// Maps userId (number) → express response object
export const sseClients = new Map();

/**
 * Push a real-time notification to a connected SSE client
 */
export const pushRealTimeNotification = (userId, notification) => {
  const client = sseClients.get(Number(userId));
  if (client && !client.writableEnded) {
    client.write(`data: ${JSON.stringify(notification)}\n\n`);
  }
};

/**
 * GET /api/notifications/stream
 * Server-Sent Events stream for the logged-in user
 */
export const streamNotifications = (req, res) => {
  const userId = Number(req.user.id);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  sseClients.set(userId, res);

  // Keep-alive ping every 25 seconds
  const pingInterval = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(pingInterval);
      sseClients.delete(userId);
      return;
    }
    res.write(':ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(userId);
  });
};

/**
 * Creates a notification for a specific user and pushes it in real-time if connected
 */
export const createNotification = (userId, title, message, type = 'general', link = '') => {
  try {
    const db = getDB();
    if (!db.notifications) db.notifications = [];

    const newNotification = {
      id: generateId('notifications'),
      user_id: userId ? Number(userId) : null,
      title,
      message,
      type,
      link,
      read: false,
      created_at: new Date().toISOString()
    };

    db.notifications.unshift(newNotification);

    // Cap at 500 notifications total
    if (db.notifications.length > 500) {
      db.notifications = db.notifications.slice(0, 500);
    }

    saveDB(db);

    // Push real-time to SSE client if connected
    if (userId) {
      pushRealTimeNotification(userId, { type: 'notification', notification: newNotification });
    }

    return newNotification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

/**
 * GET /api/notifications
 * Returns notifications for the logged-in user + broadcasts
 */
export const getNotifications = (req, res) => {
  const db = getDB();
  const userId = req.user.id;

  const allNotifications = db.notifications || [];
  const userNotifications = allNotifications.filter(
    n => n.user_id === userId || n.user_id === null
  );

  const unreadCount = userNotifications.filter(n => !n.read).length;

  res.json({
    unread_count: unreadCount,
    notifications: userNotifications.slice(0, 30)
  });
};

/**
 * PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = (req, res) => {
  const db = getDB();
  const notifId = Number(req.params.id);
  const userId = req.user.id;

  const notif = (db.notifications || []).find(
    n => n.id === notifId && (n.user_id === userId || n.user_id === null)
  );
  if (!notif) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notif.read = true;
  saveDB(db);

  res.json({ message: 'Marked as read', notification: notif });
};

/**
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = (req, res) => {
  const db = getDB();
  const userId = req.user.id;

  (db.notifications || []).forEach(n => {
    if (n.user_id === userId || n.user_id === null) {
      n.read = true;
    }
  });

  saveDB(db);
  res.json({ message: 'All notifications marked as read' });
};

/**
 * DELETE /api/notifications/:id
 */
export const deleteNotification = (req, res) => {
  const db = getDB();
  const notifId = Number(req.params.id);
  const userId = req.user.id;

  db.notifications = (db.notifications || []).filter(
    n => !(n.id === notifId && (n.user_id === userId || req.user.role === 'Admin'))
  );

  saveDB(db);
  res.json({ message: 'Notification removed' });
};
