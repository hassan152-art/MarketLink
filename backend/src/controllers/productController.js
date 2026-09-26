import { getDB, saveDB, generateId } from '../config/db.js';

export const getProducts = (req, res) => {
  const db = getDB();
  const { search, category, farmer_id, market_id, min_price, max_price, day, status } = req.query;

  let products = db.products || [];

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }

  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (farmer_id) {
    products = products.filter(p => p.farmer_id === Number(farmer_id));
  }

  if (market_id) {
    const mId = Number(market_id);
    products = products.filter(p => {
      if (p.market_id === mId) return true;
      const farmer = db.users.find(u => u.id === p.farmer_id);
      return farmer && Array.isArray(farmer.markets_attended) && farmer.markets_attended.includes(mId);
    });
  }

  if (min_price) {
    products = products.filter(p => p.price >= Number(min_price));
  }

  if (max_price) {
    products = products.filter(p => p.price <= Number(max_price));
  }

  if (status) {
    products = products.filter(p => p.status === status);
  }

  // Enrich with Farmer details, Market details, and average review ratings
  const enriched = products.map(product => {
    const farmer = db.users.find(u => u.id === product.farmer_id);
    const market = db.markets.find(m => m.id === product.market_id);
    const productReviews = db.reviews?.filter(r => r.product_id === product.id) || [];
    const avgRating = productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : 5.0;

    const reserved = product.reserved_quantity || 0;
    const available = Math.max(0, (product.stock_quantity || 0) - reserved);

    return {
      ...product,
      reserved_quantity: reserved,
      available_quantity: available,
      farmer_name: farmer ? (farmer.stall_name || farmer.name) : 'Local Farmer',
      farmer_location: farmer ? farmer.address : '',
      market_name: market ? market.name : 'Farmers Market',
      rating: Number(avgRating),
      review_count: productReviews.length
    };
  });

  res.json(enriched);
};

export const getProductById = (req, res) => {
  const db = getDB();
  const productId = Number(req.params.id);
  const product = db.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const farmer = db.users.find(u => u.id === product.farmer_id);
  const market = db.markets.find(m => m.id === product.market_id);
  const reviews = db.reviews?.filter(r => r.product_id === productId) || [];

  res.json({
    ...product,
    farmer,
    market,
    reviews
  });
};

export const createProduct = (req, res) => {
  const db = getDB();
  const { name, category, price, unit, stock_quantity, description, image_url, images, seasonal_tag, market_id } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, category, and price are required.' });
  }

  const primaryImage = image_url || (images && images[0]) || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
  const galleryImages = images && images.length > 0 ? images : [primaryImage];
  const stockNum = Number(stock_quantity || 0);
  const priceNum = Number(price);

  const newProduct = {
    id: generateId('products'),
    farmer_id: req.user.id,
    market_id: market_id ? Number(market_id) : 1,
    name,
    category,
    price: priceNum,
    unit: unit || 'per item',
    stock_quantity: stockNum,
    status: stockNum > 0 ? 'available' : 'sold_out',
    description: description || '',
    image_url: primaryImage,
    images: galleryImages,
    seasonal_tag: seasonal_tag || '🌱 In Season',
    demand_score: 85,
    price_history: [
      { date: new Date().toISOString().split('T')[0], price: priceNum }
    ],
    stock_history: [
      { date: new Date().toISOString().split('T')[0], stock: stockNum }
    ],
    moderation_status: 'approved',
    created_at: new Date().toISOString()
  };

  db.products.push(newProduct);
  saveDB(db);

  res.status(201).json({ message: 'Product created successfully', product: newProduct });
};

export const updateProduct = (req, res) => {
  const db = getDB();
  const productId = Number(req.params.id);
  const index = db.products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (req.user.role !== 'Admin' && db.products[index].farmer_id !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized to edit this product.' });
  }

  const current = db.products[index];
  const updatedStock = req.body.stock_quantity !== undefined ? Number(req.body.stock_quantity) : current.stock_quantity;
  const updatedStatus = req.body.status || (updatedStock > 0 ? 'available' : 'sold_out');
  const updatedPrice = req.body.price !== undefined ? Number(req.body.price) : current.price;

  const priceHistory = current.price_history || [];
  if (updatedPrice !== current.price) {
    priceHistory.push({ date: new Date().toISOString().split('T')[0], price: updatedPrice });
  }

  const stockHistory = current.stock_history || [];
  if (updatedStock !== current.stock_quantity) {
    stockHistory.push({ date: new Date().toISOString().split('T')[0], stock: updatedStock });
  }

  db.products[index] = {
    ...current,
    ...req.body,
    price: updatedPrice,
    stock_quantity: updatedStock,
    status: updatedStatus,
    price_history: priceHistory,
    stock_history: stockHistory,
    images: req.body.images || current.images || [current.image_url]
  };

  saveDB(db);
  res.json({ message: 'Product updated successfully', product: db.products[index] });
};

export const quickUpdateStock = (req, res) => {
  const db = getDB();
  const productId = Number(req.params.id);
  const index = db.products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (req.user.role !== 'Admin' && db.products[index].farmer_id !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized.' });
  }

  const { stock_quantity, status } = req.body;
  const current = db.products[index];
  const newStock = stock_quantity !== undefined ? Number(stock_quantity) : current.stock_quantity;
  const newStatus = status || (newStock > 0 ? 'available' : 'sold_out');

  current.stock_quantity = newStock;
  current.status = newStatus;
  saveDB(db);

  res.json({ message: 'Stock updated', product: current });
};

export const bulkUpdateStock = (req, res) => {
  const db = getDB();
  const { updates } = req.body; // array of { id, stock_quantity, status }

  if (!Array.isArray(updates)) {
    return res.status(400).json({ message: 'updates must be an array.' });
  }

  let updatedCount = 0;
  updates.forEach(u => {
    const targetId = Number(u.id || u.product_id);
    const idx = db.products.findIndex(p => p.id === targetId);
    if (idx !== -1 && (req.user.role === 'Admin' || db.products[idx].farmer_id === req.user.id)) {
      if (u.stock_quantity !== undefined) {
        db.products[idx].stock_quantity = Number(u.stock_quantity);
        db.products[idx].status = Number(u.stock_quantity) > 0 ? 'available' : 'sold_out';
      }
      if (u.status) {
        db.products[idx].status = u.status;
      }
      updatedCount++;
    }
  });

  saveDB(db);
  res.json({ message: `Successfully updated ${updatedCount} products in bulk.` });
};

export const deleteProduct = (req, res) => {
  const db = getDB();
  const productId = Number(req.params.id);
  const product = db.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (req.user.role !== 'Admin' && product.farmer_id !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized to delete this product.' });
  }

  db.products = db.products.filter(p => p.id !== productId);
  saveDB(db);
  res.json({ message: 'Product deleted successfully' });
};
