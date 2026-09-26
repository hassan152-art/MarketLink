import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDay, setSelectedDay] = useState(searchParams.get('day') || '');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, selectedDay, maxPrice, onlyAvailable]);

  const loadCategories = async () => {
    try {
      const data = await fetchAPI('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedCategory) query.append('category', selectedCategory);
      if (selectedDay) query.append('day', selectedDay);
      if (maxPrice) query.append('max_price', maxPrice);
      if (onlyAvailable) query.append('status', 'available');

      const data = await fetchAPI(`/products?${query.toString()}`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedDay('');
    setMaxPrice('');
    setOnlyAvailable(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Farm Fresh Inventory</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900">Explore Fresh Produce</h1>
        </div>

        <button
          onClick={resetFilters}
          className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search organic tomatoes, raw honey, sourdough bread..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-brand-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.name
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sub-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Market Day</label>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="">Any Market Day</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Max Price ($)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="e.g. 15.00"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>

        </div>
      </div>

      {/* Product List */}
      <div>
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-semibold">Loading fresh harvest...</div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 text-slate-500">
            No products match your filters. Try resetting search criteria!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>


      {/* Product Discovery Guide */}
      <section className="mt-16 bg-slate-900 rounded-3xl p-8 sm:p-10 text-white">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Shopping Guide</span>
          <h2 className="text-3xl font-extrabold font-serif mt-2">Find the right products for your next market visit</h2>
          <p className="text-sm text-slate-300 leading-6 mt-3">
            MarketLink brings weekly market inventory into one searchable catalog. Use categories and filters to narrow down what you need, then open a product to review seller and availability details before adding it to your cart.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            ['01', 'Search & Filter', 'Start with a product name or category, then refine results by market day, price and availability.'],
            ['02', 'Review Details', 'Check product information and the associated seller or market before placing your order.'],
            ['03', 'Plan Pickup', 'Add your selected items to the cart and continue through the supported pickup workflow.'],
          ].map(([n,t,d]) => (
            <div key={n} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <span className="text-xs font-bold text-emerald-300">{n}</span>
              <h3 className="font-bold mt-2">{t}</h3>
              <p className="text-xs text-slate-400 leading-5 mt-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
