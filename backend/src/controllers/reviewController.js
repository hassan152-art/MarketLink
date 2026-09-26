import { getDB, saveDB, generateId } from '../config/db.js';
import { analyzeReviewSentiment } from '../services/aiEngine.js';

export const getReviews = (req, res) => {
  const db = getDB();
  const { farmer_id, product_id } = req.query;

  let reviews = db.reviews || [];

  if (farmer_id) {
    reviews = reviews.filter(r => r.farmer_id === Number(farmer_id));
  }

  if (product_id) {
    reviews = reviews.filter(r => r.product_id === Number(product_id));
  }

  // Filter out flagged spam unless request is by an Admin
  if (req.user?.role !== 'Admin') {
    reviews = reviews.filter(r => !r.is_flagged);
  }

  reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(reviews);
};

export const createReview = (req, res) => {
  const db = getDB();
  const { farmer_id, product_id, rating, comment } = req.body;

  if (!farmer_id || !rating || !comment) {
    return res.status(400).json({ message: 'Farmer ID, rating, and comment are required.' });
  }

  // Check for verified purchase history
  const hasPurchased = (db.orders || []).some(
    o => o.customer_id === req.user.id &&
         o.farmer_id === Number(farmer_id) &&
         o.order_status !== 'cancelled'
  );

  const { sentiment, score, isSpam } = analyzeReviewSentiment(comment);

  const newReview = {
    id: generateId('reviews'),
    farmer_id: Number(farmer_id),
    product_id: product_id ? Number(product_id) : null,
    customer_id: req.user.id,
    customer_name: req.user.name,
    rating: Number(rating),
    comment,
    sentiment: sentiment || 'Positive',
    sentiment_score: score || 0.85,
    verified_purchase: hasPurchased,
    is_flagged: isSpam,
    farmer_response: '',
    created_at: new Date().toISOString()
  };

  db.reviews.push(newReview);
  saveDB(db);

  res.status(201).json({ message: 'Review posted successfully!', review: newReview });
};

export const respondToReview = (req, res) => {
  const db = getDB();
  const reviewId = Number(req.params.id);
  const { farmer_response } = req.body;

  const index = db.reviews.findIndex(r => r.id === reviewId);
  if (index === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }

  if (req.user.role !== 'Admin' && db.reviews[index].farmer_id !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized to respond to this review.' });
  }

  db.reviews[index].farmer_response = farmer_response;
  saveDB(db);

  res.json({ message: 'Response added to review', review: db.reviews[index] });
};

export const deleteReview = (req, res) => {
  const db = getDB();
  const reviewId = Number(req.params.id);

  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only admin can remove reviews.' });
  }

  db.reviews = db.reviews.filter(r => r.id !== reviewId);
  saveDB(db);

  res.json({ message: 'Review deleted by admin.' });
};
