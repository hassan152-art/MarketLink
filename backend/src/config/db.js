import mongoose from 'mongoose';

/**
 * MarketLink is now backed by MongoDB instead of a flat db.json file.
 *
 * Every controller in this project was written against a simple synchronous
 * API: `const db = getDB(); ... saveDB(db);`. Rather than rewrite every
 * route handler to be async (79+ call sites across 10+ controllers), this
 * module keeps that exact same synchronous API while genuinely persisting
 * everything to MongoDB underneath:
 *
 *   1. On boot, connectDB() opens a Mongoose connection and loadDB() pulls
 *      the single "app state" document out of MongoDB into an in-memory
 *      cache (or creates an empty one if this is a fresh database).
 *   2. getDB() simply returns that in-memory cache — synchronous, no change
 *      needed in any controller.
 *   3. saveDB(data) updates the in-memory cache immediately (so the very
 *      next getDB() call sees it) and persists the same object to MongoDB
 *      in the background.
 *
 * Set MONGODB_URI in your .env to point at a real MongoDB instance
 * (local, Docker, or Atlas). Falls back to mongodb://127.0.0.1:27017/marketlink.
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/marketlink';

// A single flexible document holds the whole app state (users, markets,
// products, orders, ...) so no per-collection schema migration is needed.
const appStateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'marketlink_state' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { minimize: false, timestamps: true }
);

const AppState = mongoose.models.AppState || mongoose.model('AppState', appStateSchema);

const initialData = {
  users: [],
  markets: [],
  products: [],
  orders: [],
  reviews: [],
  favorites: [],
  categories: [],
  announcements: [],
  reports: [],
  audit_logs: [],
};

// In-memory cache. This is what getDB()/saveDB() actually read and write.
let cache = null;
let connected = false;
let saveQueue = Promise.resolve();

export const connectDB = async () => {
  if (connected) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI);
  connected = true;
  console.log(`🍃 Connected to MongoDB (${MONGODB_URI})`);
};

export const loadDB = async () => {
  const doc = await AppState.findById('marketlink_state').lean();
  if (doc && doc.data) {
    cache = { ...initialData, ...doc.data };
  } else {
    cache = { ...initialData };
    await AppState.findByIdAndUpdate(
      'marketlink_state',
      { _id: 'marketlink_state', data: cache },
      { upsert: true }
    );
  }
  return cache;
};

/** Synchronous read — same signature as the old JSON-file version. */
export const getDB = () => {
  if (!cache) {
    // Defensive fallback: should not happen if connectDB()/loadDB() ran at
    // boot (see server.js), but avoids crashing on an unexpected early call.
    console.warn('getDB() called before the database finished loading — returning an empty in-memory DB.');
    cache = { ...initialData };
  }
  return cache;
};

/**
 * Synchronous write — updates the cache immediately, then persists to
 * MongoDB. Writes are queued so concurrent saveDB() calls (e.g. two quick
 * requests) don't race each other while hitting the database.
 */
export const saveDB = (data) => {
  cache = data;
  saveQueue = saveQueue
    .then(() =>
      AppState.findByIdAndUpdate(
        'marketlink_state',
        { data },
        { upsert: true, new: true }
      )
    )
    .catch((err) => console.error('Error persisting database to MongoDB:', err));
  return cache;
};

/**
 * Resolves once every saveDB() call queued so far has finished persisting
 * to MongoDB. Controllers don't need this (the server process stays alive),
 * but standalone scripts (like seed.js run directly) should await it before
 * exiting, or the process can quit before the write actually lands.
 */
export const flush = () => saveQueue;

export const generateId = (collectionName) => {
  const db = getDB();
  const items = db[collectionName] || [];
  if (items.length === 0) return 1;
  const maxId = Math.max(...items.map((item) => Number(item.id || item[`${collectionName.slice(0, -1)}_id`] || 0)));
  return maxId + 1;
};
