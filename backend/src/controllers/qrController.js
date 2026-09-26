import { getDB, saveDB } from '../config/db.js';
import { sendOrderCompletedEmail } from '../utils/email.js';

export const getOrderQR = (req, res) => {
  const db = getDB();
  const orderId = Number(req.params.id);
  const order = db.orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Generate unique verification code string
  const qrCodeData = `MARKETLINK-ORDER-${order.id}-${order.customer_id}-${order.total_amount}`;

  res.json({
    order_id: order.id,
    qr_code_data: qrCodeData,
    order_status: order.order_status,
    customer_name: order.customer_name,
    total_amount: order.total_amount,
    pickup_date: order.pickup_date,
    pickup_time_slot: order.pickup_time_slot,
    items_count: order.items?.length || 0
  });
};

export const verifyQR = (req, res) => {
  const db = getDB();
  const { qr_code_data } = req.body;

  if (!qr_code_data || typeof qr_code_data !== 'string') {
    return res.status(400).json({ message: 'Verification code or QR code string is required.' });
  }

  const rawInput = qr_code_data.trim();
  let index = -1;

  // Case 1: Standard QR format (MARKETLINK-ORDER-{id}-...)
  if (rawInput.startsWith('MARKETLINK-ORDER-')) {
    const parts = rawInput.split('-');
    const orderId = Number(parts[2]);
    index = db.orders.findIndex(o => o.id === orderId);
  }
  // Case 2: Short alphanumeric verification code (e.g. ML-IRZ933 or IRZ933)
  else if (rawInput.toUpperCase().startsWith('ML-') || rawInput.length >= 6) {
    const code = rawInput.toUpperCase();
    index = db.orders.findIndex(o => (o.verification_code && o.verification_code.toUpperCase() === code) || o.verification_code === `ML-${code}`);
  }
  // Case 3: Direct numeric order ID
  if (index === -1 && !isNaN(Number(rawInput))) {
    const numId = Number(rawInput);
    index = db.orders.findIndex(o => o.id === numId);
  }

  if (index === -1) {
    return res.status(404).json({ message: 'Pre-order record not found with that code or order ID.' });
  }

  const order = db.orders[index];

  // Ownership check: a Farmer can only verify/complete their own orders.
  // Customers and Admins are unrestricted.
  if (req.user?.role === 'Farmer' && Number(order.farmer_id) !== Number(req.user.id)) {
    return res.status(403).json({
      message: 'Not Available - This order belongs to another farmer\'s stall.',
      notAvailable: true
    });
  }

  if (order.order_status === 'completed') {
    return res.status(400).json({ message: 'Order has already been picked up & verified previously!', order });
  }

  // Update order status to completed upon QR scan
  db.orders[index].order_status = 'completed';
  db.orders[index].verified_at = new Date().toISOString();
  db.orders[index].verified_by = req.user?.name || 'Farmer Stall Verifier';

  saveDB(db);

  const customerUser = (db.users || []).find(u => u.id === order.customer_id);
  const customerEmail = db.orders[index].customer_email || customerUser?.email;
  sendOrderCompletedEmail(db.orders[index], customerEmail).catch(() => {});

  res.json({
    verified: true,
    message: `✅ Pre-Order #${order.id} verified successfully! Hand over produce to ${order.customer_name}.`,
    order: db.orders[index]
  });
};
