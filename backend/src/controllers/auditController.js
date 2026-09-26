import { getDB, saveDB, generateId } from '../config/db.js';

export const logAuditEvent = (action, details, userId = null, role = 'System') => {
  const db = getDB();
  if (!db.audit_logs) db.audit_logs = [];

  const newLog = {
    id: generateId('audit_logs'),
    action,
    details,
    user_id: userId,
    role,
    ip_address: '127.0.0.1',
    timestamp: new Date().toISOString()
  };

  db.audit_logs.unshift(newLog);
  // keep max 100 logs
  if (db.audit_logs.length > 100) db.audit_logs = db.audit_logs.slice(0, 100);
  saveDB(db);
};

export const getAuditLogs = (req, res) => {
  const db = getDB();
  res.json(db.audit_logs || []);
};

export const getFoodWasteMetrics = (req, res) => {
  const db = getDB();
  const products = db.products || [];
  const orders = db.orders || [];

  // Calculate environmental impact metrics
  const completedOrders = orders.filter(o => o.order_status === 'completed');
  let totalItemsSaved = 0;
  completedOrders.forEach(o => {
    o.items?.forEach(i => { totalItemsSaved += i.quantity; });
  });

  const foodSavedKG = Number((totalItemsSaved * 0.45).toFixed(1)); // avg 0.45kg per produce item
  const co2PreventedKG = Number((foodSavedKG * 2.5).toFixed(1)); // 2.5kg CO2 per kg food saved
  const farmerRevenuePreserved = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  res.json({
    total_food_saved_kg: foodSavedKG,
    co2_emissions_prevented_kg: co2PreventedKG,
    farmer_revenue_preserved: Number(farmerRevenuePreserved.toFixed(2)),
    pre_orders_completed: completedOrders.length,
    excess_stock_flash_promotions_active: products.filter(p => p.stock_quantity > 30).length
  });
};
