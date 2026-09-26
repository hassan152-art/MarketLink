import { getDB, saveDB } from '../config/db.js';

export const getFavorites = (req, res) => {
  const db = getDB();
  const customerId = req.user.id;
  const favorites = (db.favorites || []).filter(f => f.customer_id === customerId);

  // Enriched favorite products & farmers
  const favFarmers = db.users.filter(u => u.role === 'Farmer' && favorites.some(f => f.farmer_id === u.id));
  const favProducts = db.products.filter(p => favorites.some(f => f.product_id === p.id));

  res.json({
    favorites,
    farmers: favFarmers.map(({ password_hash, ...f }) => f),
    products: favProducts
  });
};

export const toggleFavorite = (req, res) => {
  const db = getDB();
  const customerId = req.user.id;
  const { farmer_id, product_id } = req.body;

  if (!farmer_id && !product_id) {
    return res.status(400).json({ message: 'Farmer ID or Product ID is required.' });
  }

  const existingIndex = (db.favorites || []).findIndex(
    f => f.customer_id === customerId &&
      (farmer_id ? f.farmer_id === Number(farmer_id) : true) &&
      (product_id ? f.product_id === Number(product_id) : true)
  );

  let isFavorited = false;
  if (existingIndex > -1) {
    db.favorites.splice(existingIndex, 1);
    isFavorited = false;
  } else {
    db.favorites.push({
      customer_id: customerId,
      farmer_id: farmer_id ? Number(farmer_id) : null,
      product_id: product_id ? Number(product_id) : null,
      created_at: new Date().toISOString()
    });
    isFavorited = true;
  }

  saveDB(db);
  res.json({
    message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
    isFavorited
  });
};
