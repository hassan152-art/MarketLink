import { getDB, saveDB, generateId } from '../config/db.js';
import { calculateDistanceKM } from '../services/aiEngine.js';

export const getMarkets = (req, res) => {
  const db = getDB();
  const { search, day, lat, lng, radius_km } = req.query;
  let markets = db.markets || [];

  if (search) {
    const q = search.toLowerCase();
    markets = markets.filter(m => m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q));
  }

  if (day) {
    markets = markets.filter(m => m.operating_days.includes(day));
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = daysOfWeek[new Date().getDay()];

  // Attach farmer counts, product counts, distance, open status, and activity indicator
  let enrichedMarkets = markets.map(market => {
    const farmers = db.users.filter(u => u.role === 'Farmer' && (u.markets_attended?.includes(market.id) || u.status === 'approved'));
    const marketProducts = (db.products || []).filter(p => p.market_id === market.id || farmers.some(f => f.id === p.farmer_id));

    const isOpenToday = market.operating_days?.includes(currentDayName) || false;
    const distance = (lat && lng) ? calculateDistanceKM(Number(lat), Number(lng), market.latitude, market.longitude) : null;

    let activityLevel = 'Normal';
    if (farmers.length >= 2 && marketProducts.length >= 6) {
      activityLevel = 'High (Bustling Harvest)';
    } else if (farmers.length >= 1) {
      activityLevel = 'Moderate';
    }

    return {
      ...market,
      farmer_count: farmers.length,
      available_products_count: marketProducts.length,
      is_open_today: isOpenToday,
      current_status: isOpenToday ? 'Open Today 🟢' : 'Opens Next Market Day ⚪',
      distance_km: distance,
      activity_level: activityLevel,
      directions_url: `https://www.google.com/maps/dir/?api=1&destination=${market.latitude},${market.longitude}`,
      farmers: farmers.map(f => ({
        id: f.id,
        name: f.name,
        stall_name: f.stall_name || f.name,
        pickup_time_windows: f.pickup_time_windows,
        latitude: f.latitude,
        longitude: f.longitude
      }))
    };
  });

  if (radius_km && lat && lng) {
    enrichedMarkets = enrichedMarkets.filter(m => m.distance_km !== null && m.distance_km <= Number(radius_km));
  }

  if (lat && lng) {
    enrichedMarkets.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
  }

  res.json(enrichedMarkets);
};

export const getMarketById = (req, res) => {
  const db = getDB();
  const marketId = Number(req.params.id);
  const market = db.markets.find(m => m.id === marketId);

  if (!market) {
    return res.status(404).json({ message: 'Market not found' });
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = daysOfWeek[new Date().getDay()];

  const farmers = db.users.filter(u => u.role === 'Farmer' && (u.markets_attended?.includes(marketId) || u.status === 'approved'));
  const products = db.products.filter(p => p.market_id === marketId || farmers.some(f => f.id === p.farmer_id));

  res.json({
    ...market,
    is_open_today: market.operating_days?.includes(currentDayName) || false,
    current_status: market.operating_days?.includes(currentDayName) ? 'Open Today 🟢' : 'Opens Next Scheduled Day',
    available_products_count: products.length,
    directions_url: `https://www.google.com/maps/dir/?api=1&destination=${market.latitude},${market.longitude}`,
    farmers,
    products
  });
};

export const createMarket = (req, res) => {
  const db = getDB();
  const { name, address, operating_days, operating_hours, latitude, longitude, description, image_url } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: 'Name and address are required' });
  }

  const newMarket = {
    id: generateId('markets'),
    name,
    address,
    operating_days: operating_days || ['Saturday'],
    operating_hours: operating_hours || '8:00 AM - 2:00 PM',
    latitude: latitude || 40.7128,
    longitude: longitude || -74.0060,
    description: description || '',
    map_provider: 'OpenStreetMap',
    image_url: image_url || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80'
  };

  db.markets.push(newMarket);
  saveDB(db);

  res.status(201).json({ message: 'Market created successfully', market: newMarket });
};

export const updateMarket = (req, res) => {
  const db = getDB();
  const marketId = Number(req.params.id);
  const index = db.markets.findIndex(m => m.id === marketId);

  if (index === -1) {
    return res.status(404).json({ message: 'Market not found' });
  }

  db.markets[index] = {
    ...db.markets[index],
    ...req.body
  };

  saveDB(db);
  res.json({ message: 'Market updated successfully', market: db.markets[index] });
};

export const deleteMarket = (req, res) => {
  const db = getDB();
  const marketId = Number(req.params.id);
  db.markets = db.markets.filter(m => m.id !== marketId);
  saveDB(db);
  res.json({ message: 'Market deleted successfully' });
};

/**
 * GET /api/markets/heatmap
 * Returns market activity data for the heatmap visualization
 */
export const getMarketHeatmap = (req, res) => {
  const db = getDB();
  const markets = db.markets || [];
  const orders = db.orders || [];
  const products = db.products || [];

  const heatmapData = markets.map(m => {
    const marketOrders = orders.filter(o => o.market_id === m.id && o.order_status !== 'cancelled');
    const marketProducts = products.filter(p => p.market_id === m.id);
    const revenue = marketOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const completedOrders = marketOrders.filter(o => o.order_status === 'completed').length;
    const intensity = Math.min(1.0, marketOrders.length / Math.max(10, 1));

    return {
      id: m.id,
      name: m.name,
      address: m.address,
      latitude: m.latitude || 40.7128,
      longitude: m.longitude || -74.006,
      order_count: marketOrders.length,
      completed_orders: completedOrders,
      revenue: Number(revenue.toFixed(2)),
      product_count: marketProducts.length,
      operating_days: m.operating_days || [],
      intensity
    };
  });

  res.json(heatmapData);
};

