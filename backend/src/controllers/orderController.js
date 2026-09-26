import { getDB, saveDB, generateId } from '../config/db.js';
import { sendOrderPlacedEmail, sendOrderReadyEmail, sendOrderCompletedEmail } from '../utils/email.js';
import { createNotification } from './notificationController.js';

export const createOrder = (req, res) => {
  const db = getDB();
  const { farmer_id, market_id, items, pickup_date, pickup_time_slot, notes } = req.body;

  if (!items || items.length === 0 || !pickup_date) {
    return res.status(400).json({ message: 'Order items and pickup date are required.' });
  }

  // Pre-validate stock for all requested items
  for (const item of items) {
    const pId = Number(item.product_id || item.id);
    const product = db.products.find(p => p.id === pId);
    if (!product) {
      return res.status(400).json({ message: `Product ID ${pId} not found.` });
    }
    const available = (product.stock_quantity || 0) - (product.reserved_quantity || 0);
    if (available < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}. Only ${available} available (${product.stock_quantity} total, ${product.reserved_quantity || 0} reserved).`
      });
    }
  }

  // Group items by farmer for automatic Order Splitting
  const farmerGroups = {};
  for (const item of items) {
    const pId = Number(item.product_id || item.id);
    const product = db.products.find(p => p.id === pId);
    const fId = Number(item.farmer_id || product.farmer_id || farmer_id || 2);
    const mId = Number(item.market_id || product.market_id || market_id || 1);

    if (!farmerGroups[fId]) {
      farmerGroups[fId] = { farmer_id: fId, market_id: mId, items: [] };
    }

    farmerGroups[fId].items.push({
      product_id: pId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit
    });
  }

  const createdOrders = [];

  for (const fId of Object.keys(farmerGroups)) {
    const group = farmerGroups[fId];
    let total_amount = 0;

    // Reserve stock (deduct from stock, add to reserved)
    for (const item of group.items) {
      const pIdx = db.products.findIndex(p => p.id === item.product_id);
      if (pIdx !== -1) {
        db.products[pIdx].stock_quantity -= item.quantity;
        db.products[pIdx].reserved_quantity = (db.products[pIdx].reserved_quantity || 0) + item.quantity;
        if (db.products[pIdx].stock_quantity === 0) {
          db.products[pIdx].status = 'sold_out';
        }
      }
      total_amount += item.price * item.quantity;
    }

    const farmer = db.users.find(u => u.id === Number(fId));
    const market = db.markets.find(m => m.id === Number(group.market_id));

    const existingOrdersInSlot = (db.orders || []).filter(
      o => o.farmer_id === Number(fId) &&
           o.pickup_date === pickup_date &&
           o.order_status !== 'cancelled' &&
           o.order_status !== 'completed'
    );
    const queuePosition = existingOrdersInSlot.length + 1;
    const verificationCode = `ML-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newOrder = {
      id: generateId('orders') + Math.floor(Math.random() * 50),
      customer_id: req.user.id,
      customer_name: req.user.name,
      customer_email: req.user.email,
      customer_contact: req.user.contact_number || '',
      farmer_id: Number(fId),
      farmer_name: farmer ? (farmer.stall_name || farmer.name) : 'Local Market Stall',
      market_id: Number(group.market_id),
      market_name: market ? market.name : 'Farmers Market',
      items: group.items,
      total_amount: Number(total_amount.toFixed(2)),
      pickup_date,
      pickup_time_slot: pickup_time_slot || '10:00 AM - 12:00 PM',
      queue_position: queuePosition,
      verification_code: verificationCode,
      order_status: 'placed',
      payment_method: 'Pay on Pickup (Cash/Card)',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    db.orders.push(newOrder);
    createdOrders.push(newOrder);
  }

  saveDB(db);

  // Send emails + in-app notifications
  createdOrders.forEach(ord => {
    const custEmail = ord.customer_email || req.user.email;
    sendOrderPlacedEmail(ord, custEmail).catch(() => {});
    createNotification(
      ord.customer_id,
      '🌱 Pre-Order Confirmed!',
      `Your order #${ord.id} from ${ord.farmer_name} at ${ord.market_name} is confirmed for ${ord.pickup_date}.`,
      'order_placed',
      '/dashboard/customer'
    );
  });

  if (createdOrders.length === 1) {
    res.status(201).json({ message: 'Pre-order placed successfully!', order: createdOrders[0] });
  } else {
    res.status(201).json({
      message: `Pre-orders placed with ${createdOrders.length} farmers! Orders split for seamless stall pickup.`,
      orders: createdOrders,
      order: createdOrders[0]
    });
  }
};

export const getOrders = (req, res) => {
  const db = getDB();
  const { role, id } = req.user;

  let orders = db.orders || [];

  if (role === 'Customer') {
    orders = orders.filter(o => o.customer_id === id);
  } else if (role === 'Farmer') {
    orders = orders.filter(o => o.farmer_id === id);
  }

  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(orders);
};

export const updateOrderStatus = (req, res) => {
  const db = getDB();
  const orderId = Number(req.params.id);
  const { order_status } = req.body;

  const validStatuses = ['placed', 'accepted', 'ready_for_pickup', 'completed', 'cancelled'];
  if (!validStatuses.includes(order_status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const index = db.orders.findIndex(o => o.id === orderId);
  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const order = db.orders[index];
  const previousStatus = order.order_status;

  // Restore reserved stock if cancelled
  if (order_status === 'cancelled' && previousStatus !== 'cancelled') {
    for (const item of order.items) {
      const pIdx = db.products.findIndex(p => p.id === item.product_id);
      if (pIdx !== -1) {
        db.products[pIdx].stock_quantity += item.quantity;
        db.products[pIdx].reserved_quantity = Math.max(0, (db.products[pIdx].reserved_quantity || 0) - item.quantity);
        db.products[pIdx].status = 'available';
      }
    }
  }

  // Release reservation on completion
  if (order_status === 'completed' && previousStatus !== 'completed') {
    for (const item of order.items) {
      const pIdx = db.products.findIndex(p => p.id === item.product_id);
      if (pIdx !== -1) {
        db.products[pIdx].reserved_quantity = Math.max(0, (db.products[pIdx].reserved_quantity || 0) - item.quantity);
      }
    }
  }

  db.orders[index].order_status = order_status;
  db.orders[index].updated_at = new Date().toISOString();
  saveDB(db);

  const updatedOrder = db.orders[index];
  const customerUser = (db.users || []).find(u => u.id === updatedOrder.customer_id);
  const customerEmail = updatedOrder.customer_email || customerUser?.email;
  const customerId = updatedOrder.customer_id;

  if (order_status === 'ready_for_pickup' && previousStatus !== 'ready_for_pickup') {
    sendOrderReadyEmail(updatedOrder, customerEmail).catch(() => {});
    createNotification(
      customerId,
      '🧺 Your Order is Ready!',
      `${updatedOrder.farmer_name} has packed your fresh harvest — head over to ${updatedOrder.market_name} for pickup!`,
      'order_ready',
      '/dashboard/customer'
    );
  } else if (order_status === 'completed' && previousStatus !== 'completed') {
    sendOrderCompletedEmail(updatedOrder, customerEmail).catch(() => {});
    createNotification(
      customerId,
      '✅ Order Picked Up!',
      `Thank you for shopping local! Your order #${updatedOrder.id} from ${updatedOrder.farmer_name} is complete. Enjoy your fresh produce!`,
      'order_completed',
      '/dashboard/customer'
    );
  } else if (order_status === 'cancelled' && previousStatus !== 'cancelled') {
    createNotification(
      customerId,
      '❌ Order Cancelled',
      `Your pre-order #${updatedOrder.id} from ${updatedOrder.farmer_name} has been cancelled. Stock has been restored.`,
      'order_cancelled',
      '/dashboard/customer'
    );
  } else if (order_status === 'accepted' && previousStatus !== 'accepted') {
    createNotification(
      customerId,
      '👍 Order Accepted!',
      `${updatedOrder.farmer_name} has accepted your pre-order #${updatedOrder.id}. Get ready for pickup on ${updatedOrder.pickup_date}!`,
      'order_accepted',
      '/dashboard/customer'
    );
  }

  res.json({ message: `Order status updated to ${order_status}`, order: db.orders[index] });
};

export const cancelOrder = (req, res) => {
  const db = getDB();
  const orderId = Number(req.params.id);
  const index = db.orders.findIndex(o => o.id === orderId);

  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const order = db.orders[index];

  if (req.user.role === 'Customer' && order.customer_id !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized to cancel this order.' });
  }

  if (order.order_status === 'completed' || order.order_status === 'cancelled') {
    return res.status(400).json({ message: `Cannot cancel order with status '${order.order_status}'.` });
  }

  // Restore inventory + release reservation
  for (const item of order.items) {
    const pIdx = db.products.findIndex(p => p.id === item.product_id);
    if (pIdx !== -1) {
      db.products[pIdx].stock_quantity += item.quantity;
      db.products[pIdx].reserved_quantity = Math.max(0, (db.products[pIdx].reserved_quantity || 0) - item.quantity);
      db.products[pIdx].status = 'available';
    }
  }

  db.orders[index].order_status = 'cancelled';
  saveDB(db);

  createNotification(
    order.customer_id,
    '❌ Order Cancelled',
    `Your pre-order #${order.id} from ${order.farmer_name} has been cancelled. Your stock reservation has been released.`,
    'order_cancelled',
    '/dashboard/customer'
  );

  res.json({ message: 'Order cancelled successfully and stock restored.' });
};

export const modifyOrder = (req, res) => {
  const db = getDB();
  const orderId = Number(req.params.id);
  const index = db.orders.findIndex(o => o.id === orderId);

  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const order = db.orders[index];
  if (req.user.role === 'Customer' && order.customer_id !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized to modify this order.' });
  }

  if (['completed', 'cancelled', 'ready_for_pickup'].includes(order.order_status)) {
    return res.status(400).json({ message: `Cannot modify order once status is '${order.order_status}'.` });
  }

  const { pickup_date, pickup_time_slot, notes } = req.body;
  if (pickup_date) order.pickup_date = pickup_date;
  if (pickup_time_slot) order.pickup_time_slot = pickup_time_slot;
  if (notes !== undefined) order.notes = notes;
  order.updated_at = new Date().toISOString();

  saveDB(db);
  res.json({ message: 'Pre-order pickup schedule updated successfully!', order });
};

/**
 * GET /api/orders/farmer/analytics
 * Detailed analytics for the authenticated farmer
 */
export const getFarmerAnalytics = (req, res) => {
  const db = getDB();
  const farmerId = req.user.id;

  const myOrders = (db.orders || []).filter(o => o.farmer_id === farmerId);
  const myProducts = (db.products || []).filter(p => p.farmer_id === farmerId);

  // Revenue over last 7 days
  const today = new Date();
  const revenueByDay = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    revenueByDay[d.toISOString().split('T')[0]] = 0;
  }
  myOrders.filter(o => o.order_status !== 'cancelled').forEach(o => {
    const d = o.pickup_date || o.created_at?.split('T')[0];
    if (d && revenueByDay[d] !== undefined) {
      revenueByDay[d] += (o.total_amount || 0);
    }
  });

  // Status breakdown
  const statusBreakdown = { placed: 0, accepted: 0, ready_for_pickup: 0, completed: 0, cancelled: 0 };
  myOrders.forEach(o => {
    if (statusBreakdown[o.order_status] !== undefined) statusBreakdown[o.order_status]++;
  });

  // Top selling products
  const productSales = {};
  myOrders.filter(o => o.order_status !== 'cancelled').forEach(o => {
    (o.items || []).forEach(item => {
      if (!productSales[item.name]) productSales[item.name] = { name: item.name, units: 0, revenue: 0 };
      productSales[item.name].units += item.quantity;
      productSales[item.name].revenue += (item.price * item.quantity);
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Stock health
  const stockHealth = myProducts.map(p => ({
    name: p.name,
    stock_quantity: p.stock_quantity || 0,
    reserved_quantity: p.reserved_quantity || 0,
    available: Math.max(0, (p.stock_quantity || 0) - (p.reserved_quantity || 0)),
    status: p.status
  }));

  const totalRevenue = myOrders.filter(o => o.order_status !== 'cancelled').reduce((s, o) => s + (o.total_amount || 0), 0);

  res.json({
    total_orders: myOrders.length,
    total_revenue: Number(totalRevenue.toFixed(2)),
    completed_orders: myOrders.filter(o => o.order_status === 'completed').length,
    active_orders: myOrders.filter(o => ['placed', 'accepted', 'ready_for_pickup'].includes(o.order_status)).length,
    revenue_by_day: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) })),
    status_breakdown: statusBreakdown,
    top_products: topProducts,
    stock_health: stockHealth
  });
};
