import { getDB } from '../config/db.js';

/**
 * GET /api/compare?name=tomato&category=vegetables
 * Compare products across all farmers and markets
 */
export const compareProducts = (req, res) => {
  const db = getDB();
  const { name, category } = req.query;

  if (!name && !category) {
    return res.status(400).json({ message: 'Provide a "name" or "category" query parameter.' });
  }

  let products = db.products || [];

  if (name) {
    const q = name.trim().toLowerCase();
    products = products.filter(
      p => p.name?.toLowerCase().includes(q) ||
           p.description?.toLowerCase().includes(q)
    );
  }
  if (category) {
    products = products.filter(
      p => p.category?.toLowerCase().includes(category.toLowerCase())
    );
  }

  const enriched = products.map(p => {
    const farmer = (db.users || []).find(u => u.id === p.farmer_id);
    const market = (db.markets || []).find(m => m.id === p.market_id);
    const available = Math.max(0, (p.stock_quantity || 0) - (p.reserved_quantity || 0));

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: Number(p.price) || 0,
      unit: p.unit,
      stock_quantity: p.stock_quantity || 0,
      reserved_quantity: p.reserved_quantity || 0,
      available_quantity: available,
      status: p.status,
      image_url: p.image_url,
      seasonal_tag: p.seasonal_tag,
      farmer_id: p.farmer_id,
      farmer_name: farmer?.stall_name || farmer?.name || 'Unknown Stall',
      farmer_rating: farmer?.rating || null,
      market_id: p.market_id,
      market_name: market?.name || 'Unknown Market',
      market_operating_days: market?.operating_days || [],
      market_location: market?.location || '',
      best_value: false
    };
  });

  // Only compare price within the same unit. A "best value" flag is otherwise
  // misleading (for example, $2/lb vs $1/item).
  const inStock = enriched.filter(p => p.available_quantity > 0);
  const byUnit = new Map();
  inStock.forEach((product) => {
    const unitKey = String(product.unit || 'unit').trim().toLowerCase();
    if (!byUnit.has(unitKey)) byUnit.set(unitKey, []);
    byUnit.get(unitKey).push(product);
  });

  byUnit.forEach((unitProducts) => {
    const minPrice = Math.min(...unitProducts.map(p => p.price));
    unitProducts.forEach(p => {
      if (p.price === minPrice) p.best_value = true;
    });
  });

  // Sort by price ascending
  enriched.sort((a, b) => a.price - b.price);

  res.json({
    query: { name, category },
    count: enriched.length,
    products: enriched
  });
};
