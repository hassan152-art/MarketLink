import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Heart, Store, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Favorites = () => {
  const [data, setData] = useState({ farmers: [], products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await fetchAPI('/favorites');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Saved Collection</span>
        <h1 className="text-3xl font-extrabold font-serif text-slate-900 flex items-center gap-2">
          Your Favorite Farmers & Produce <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading your favorites...</div>
      ) : (
        <div className="space-y-8">
          
          {/* Saved Farmers */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Saved Local Farmers ({data.farmers?.length || 0})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.farmers?.map(f => (
                <div key={f.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xl">
                    👨‍🌾
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{f.stall_name || f.name}</h4>
                    <p className="text-xs text-slate-500">{f.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Saved Harvest Produce ({data.products?.length || 0})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.products?.map(p => (
                <ProductCard key={p.id} product={p} isFavoritedInitial={true} />
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
