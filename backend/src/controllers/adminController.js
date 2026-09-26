import { getDB, saveDB, generateId } from '../config/db.js';

export const getDashboardStats = (req, res) => {
  const db = getDB();
  const farmers = db.users.filter(u => u.role === 'Farmer');
  const customers = db.users.filter(u => u.role === 'Customer');
  const markets = db.markets || [];
  const products = db.products || [];
  const orders = db.orders || [];

  const pendingFarmers = farmers.filter(f => f.status === 'pending');
  const totalRevenue = orders
    .filter(o => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Revenue breakdown by market
  const revenueByMarket = markets.map(m => {
    const marketOrders = orders.filter(o => o.market_id === m.id && o.order_status !== 'cancelled');
    const revenue = marketOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return {
      market_id: m.id,
      market_name: m.name,
      orders_count: marketOrders.length,
      revenue: Number(revenue.toFixed(2))
    };
  });

  res.json({
    total_farmers: farmers.length,
    pending_farmers_count: pendingFarmers.length,
    total_customers: customers.length,
    total_markets: markets.length,
    total_products: products.length,
    total_orders: orders.length,
    total_revenue: Number(totalRevenue.toFixed(2)),
    revenue_by_market: revenueByMarket,
    announcements: db.announcements || []
  });
};

export const getUsers = (req, res) => {
  const db = getDB();
  const { role } = req.query;
  let users = db.users.map(({ password_hash, ...u }) => u);

  if (role) {
    users = users.filter(u => u.role === role);
  }

  res.json(users);
};

export const updateUserStatus = (req, res) => {
  const db = getDB();
  const userId = Number(req.params.id);
  const { status } = req.body; // approved, suspended, active, deactivated

  const index = db.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  db.users[index].status = status;
  saveDB(db);

  const { password_hash: _, ...updatedUser } = db.users[index];
  res.json({ message: `User status updated to ${status}`, user: updatedUser });
};

export const getCategories = (req, res) => {
  const db = getDB();
  res.json(db.categories || []);
};

export const addCategory = (req, res) => {
  const db = getDB();
  const { name, icon, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const newCat = {
    id: generateId('categories'),
    name,
    icon: icon || 'Leaf',
    description: description || ''
  };

  db.categories.push(newCat);
  saveDB(db);

  res.status(201).json({ message: 'Category added', category: newCat });
};

export const createAnnouncement = (req, res) => {
  const db = getDB();
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newAnn = {
    id: generateId('announcements'),
    title,
    content,
    author: req.user.name || 'Admin',
    date: new Date().toISOString().split('T')[0]
  };

  db.announcements.push(newAnn);
  saveDB(db);

  res.status(201).json({ message: 'Announcement published', announcement: newAnn });
};

export const deleteAnnouncement = (req, res) => {
  const db = getDB();
  const annId = Number(req.params.id);
  db.announcements = db.announcements.filter(a => a.id !== annId);
  saveDB(db);
  res.json({ message: 'Announcement removed' });
};

export const getAdvancedAnalytics = (req, res) => {
  const db = getDB();
  const orders = db.orders || [];
  const users = db.users || [];
  const products = db.products || [];

  const nonCancelledOrders = orders.filter(o => o.order_status !== 'cancelled');
  const completedOrders = orders.filter(o => o.order_status === 'completed');
  const cancelledOrders = orders.filter(o => o.order_status === 'cancelled');

  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const aov = nonCancelledOrders.length > 0 ? (totalRevenue / nonCancelledOrders.length).toFixed(2) : '0.00';

  // Customer repeat purchase rate
  const customerOrderCounts = {};
  orders.forEach(o => {
    customerOrderCounts[o.customer_id] = (customerOrderCounts[o.customer_id] || 0) + 1;
  });
  const totalCustomersWithOrders = Object.keys(customerOrderCounts).length;
  const repeatCustomersCount = Object.values(customerOrderCounts).filter(c => c > 1).length;
  const repeatRate = totalCustomersWithOrders > 0
    ? `${((repeatCustomersCount / totalCustomersWithOrders) * 100).toFixed(1)}%`
    : '0.0%';

  const cancellationRate = orders.length > 0
    ? `${((cancelledOrders.length / orders.length) * 100).toFixed(1)}%`
    : '0.0%';

  const pickupCompletionRate = orders.length > 0
    ? `${((completedOrders.length / orders.length) * 100).toFixed(1)}%`
    : '0.0%';

  // Sales Trends (Daily aggregation for last 7 dates)
  const salesByDate = {};
  nonCancelledOrders.forEach(o => {
    const d = o.pickup_date || (o.created_at ? o.created_at.split('T')[0] : '2026-09-26');
    salesByDate[d] = (salesByDate[d] || 0) + o.total_amount;
  });

  const salesTrend = Object.keys(salesByDate).slice(-7).map(date => ({
    date,
    revenue: Number(salesByDate[date].toFixed(2))
  }));

  // Top selling products
  const productSales = {};
  nonCancelledOrders.forEach(o => {
    o.items?.forEach(i => {
      productSales[i.name] = (productSales[i.name] || 0) + i.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, units]) => ({ name, units }));

  // Order status breakdown for pie chart
  const order_status_breakdown = {
    placed: orders.filter(o => o.order_status === 'placed').length,
    accepted: orders.filter(o => o.order_status === 'accepted').length,
    ready_for_pickup: orders.filter(o => o.order_status === 'ready_for_pickup').length,
    completed: orders.filter(o => o.order_status === 'completed').length,
    cancelled: orders.filter(o => o.order_status === 'cancelled').length
  };

  // Revenue by farmer (top 5)
  const farmerRevenueMap = {};
  nonCancelledOrders.forEach(o => {
    const key = o.farmer_name || `Farmer #${o.farmer_id}`;
    if (!farmerRevenueMap[key]) farmerRevenueMap[key] = { farmer_name: key, revenue: 0, order_count: 0 };
    farmerRevenueMap[key].revenue += (o.total_amount || 0);
    farmerRevenueMap[key].order_count += 1;
  });
  const revenue_by_farmer = Object.values(farmerRevenueMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(f => ({ ...f, revenue: Number(f.revenue.toFixed(2)) }));

  // Revenue by category
  const categoryRevenueMap = {};
  nonCancelledOrders.forEach(o => {
    o.items?.forEach(item => {
      const prod = (db.products || []).find(p => p.id === item.product_id);
      const cat = prod?.category || 'Other';
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + (item.price * item.quantity);
    });
  });
  const revenue_by_category = Object.entries(categoryRevenueMap)
    .map(([category, revenue]) => ({ category, revenue: Number(revenue.toFixed(2)) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Customer growth (signups per month - last 6 months)
  const customerGrowthMap = {};
  const customers = (db.users || []).filter(u => u.role === 'Customer');
  customers.forEach(u => {
    if (u.created_at) {
      const month = u.created_at.substring(0, 7); // YYYY-MM
      customerGrowthMap[month] = (customerGrowthMap[month] || 0) + 1;
    }
  });
  const customer_growth = Object.entries(customerGrowthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, new_customers]) => ({ month, new_customers }));

  // Market activity
  const marketActivityMap = {};
  nonCancelledOrders.forEach(o => {
    const key = o.market_name || `Market #${o.market_id}`;
    if (!marketActivityMap[key]) marketActivityMap[key] = { market_name: key, order_count: 0, revenue: 0 };
    marketActivityMap[key].order_count += 1;
    marketActivityMap[key].revenue += (o.total_amount || 0);
  });
  const market_activity = Object.values(marketActivityMap)
    .sort((a, b) => b.order_count - a.order_count)
    .slice(0, 5)
    .map(m => ({ ...m, revenue: Number(m.revenue.toFixed(2)) }));

  res.json({
    total_revenue: Number(totalRevenue.toFixed(2)),
    average_order_value: Number(aov),
    total_orders: orders.length,
    completed_orders: completedOrders.length,
    cancelled_orders: cancelledOrders.length,
    repeat_purchase_rate: repeatRate,
    cancellation_rate: cancellationRate,
    pickup_completion_rate: pickupCompletionRate,
    sales_trend: salesTrend,
    top_products: topProducts,
    order_status_breakdown,
    revenue_by_farmer,
    revenue_by_category,
    customer_growth,
    market_activity
  });
};

export const exportPlatformReports = (req, res) => {
  const db = getDB();
  const { format = 'json' } = req.query;

  const exportPayload = {
    exported_at: new Date().toISOString(),
    platform: 'MarketLink',
    metrics: {
      users_count: (db.users || []).length,
      markets_count: (db.markets || []).length,
      products_count: (db.products || []).length,
      orders_count: (db.orders || []).length,
      revenue_usd: (db.orders || []).filter(o => o.order_status !== 'cancelled').reduce((acc, o) => acc + (o.total_amount || 0), 0)
    },
    orders: (db.orders || []).map(o => {
      const cust = (db.users || []).find(u => u.id === o.customer_id);
      const farm = (db.users || []).find(u => u.id === o.farmer_id);
      const mkt = (db.markets || []).find(m => m.id === o.market_id);
      return {
        id: o.id,
        customer: o.customer_name || cust?.name || `Customer #${o.customer_id}`,
        farmer: o.farmer_name || farm?.stall_name || farm?.name || `Farmer #${o.farmer_id}`,
        market: o.market_name || mkt?.name || `Market #${o.market_id}`,
        total: o.total_amount,
        status: o.order_status,
        date: o.pickup_date
      };
    })
  };

  if (format === 'csv') {
    let csv = 'Order ID,Customer,Farmer,Market,Total Amount,Status,Pickup Date\n';
    exportPayload.orders.forEach(o => {
      csv += `"${o.id}","${o.customer}","${o.farmer}","${o.market}",${o.total},"${o.status}","${o.date}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="marketlink-orders-report.csv"');
    return res.send(csv);
  }

  res.json(exportPayload);
};
