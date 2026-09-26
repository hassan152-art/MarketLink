import React, { useState } from 'react';
import { fetchAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { Search, Package, Store, CheckCircle2, Star, ShoppingCart, Tag, AlertCircle } from 'lucide-react';

const COLORS = ['bg-emerald-50 text-emerald-700', 'bg-blue-50 text-blue-700', 'bg-purple-50 text-purple-700',
  'bg-orange-50 text-orange-700', 'bg-pink-50 text-pink-700'];

export const PriceComparison = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await fetchAPI(`/compare?name=${encodeURIComponent(query.trim())}`);
      setResults(res.products || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (p) => {
    addToCart(p, 1);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const cheapest = results.find(p => p.best_value);
  const inStockCount = results.filter(p => p.available_quantity > 0).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Smart Shopping</span>
        <h1 className="text-3xl font-extrabold font-serif text-slate-900 mt-1">Price & Availability Comparison</h1>
        <p className="text-sm text-slate-500 mt-1">Compare fresh produce prices across all local stalls and markets — find the best deal instantly.</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search produce: tomatoes, honey, eggs, bread..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-400/20 outline-none text-sm bg-white shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 rounded-2xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm shadow-sm disabled:opacity-60 transition-colors whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Compare'}
        </button>
      </form>

      {/* Quick search pills */}
      <div className="flex flex-wrap gap-2">
        {['Tomatoes', 'Honey', 'Eggs', 'Spinach', 'Carrots', 'Sourdough'].map(item => (
          <button
            key={item}
            onClick={() => { setQuery(item); }}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-brand-100 hover:text-brand-800 text-slate-600 text-xs font-semibold transition-colors"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Summary bar */}
      {searched && results.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm text-xs">
          <span className="font-semibold text-slate-700">
            <span className="text-brand-700 text-base font-extrabold">{results.length}</span> options found for "{query}"
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">{inStockCount} in stock</span>
          {cheapest && (
            <>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Best: ${cheapest.price.toFixed(2)}/{cheapest.unit} at {cheapest.farmer_name}
              </span>
            </>
          )}
        </div>
      )}

      {/* No results */}
      {searched && results.length === 0 && !loading && (
        <div className="text-center py-14 text-slate-400">
          <Package className="w-14 h-14 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600 text-lg">No products found for "{query}"</p>
          <p className="text-sm mt-1">Try a different search term or browse by category</p>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((p, i) => (
            <div
              key={p.id}
              className={`relative bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-md ${
                p.best_value ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
              }`}
            >
              {/* Best value badge */}
              {p.best_value && (
                <div className="absolute -top-2.5 left-4 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> BEST VALUE
                </div>
              )}

              {/* Rank */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${COLORS[Math.min(i, COLORS.length - 1)]}`}>
                #{i + 1}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-base">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Store className="w-3 h-3" /> {p.farmer_name}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{p.market_name}</span>
                      {p.farmer_rating && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.farmer_rating}
                          </span>
                        </>
                      )}
                    </div>
                    {p.market_operating_days?.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-0.5">📅 Open: {p.market_operating_days.join(', ')}</p>
                    )}
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-2xl font-extrabold text-slate-900">${p.price.toFixed(2)}</p>
                    <p className="text-[11px] text-slate-400">per {p.unit || 'unit'}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                    p.available_quantity > 10 ? 'bg-emerald-50 text-emerald-700' :
                    p.available_quantity > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {p.available_quantity > 0 ? `✅ ${p.available_quantity} available` : '❌ Out of Stock'}
                  </span>
                  {p.seasonal_tag && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg text-[11px] font-bold">
                      🌿 {p.seasonal_tag}
                    </span>
                  )}
                  {p.category && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> {p.category}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                {p.available_quantity > 0 ? (
                  <button
                    onClick={() => handleAddToCart(p)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
                      addedId === p.id
                        ? 'bg-emerald-500 text-white scale-95'
                        : 'bg-brand-700 hover:bg-brand-800 text-white'
                    }`}
                  >
                    {addedId === p.id ? (
                      <><CheckCircle2 className="w-4 h-4" /> Added!</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4" /> Unavailable
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
