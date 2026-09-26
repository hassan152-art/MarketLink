import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { MapView } from '../components/MapView';
import { MapPin, Calendar, Clock, Store, ArrowLeft, Navigation, ShieldCheck } from 'lucide-react';

export const MarketDetails = () => {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarket();
  }, [id]);

  const loadMarket = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI(`/markets/${id}`);
      setMarket(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading market details...</div>;
  }

  if (!market) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Market not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <Link to="/markets" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Markets
      </Link>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[320px] flex items-end p-8 sm:p-12 shadow-2xl">
        <img src={market.image_url} alt={market.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-block px-3 py-1 bg-brand-500 text-white font-extrabold text-xs rounded-full uppercase tracking-wider">
            Verified Farmers Market
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif">{market.name}</h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{market.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-emerald-300 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {market.address}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {market.operating_days?.join(', ')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> {market.operating_hours}
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Market Geolocation & Pickup Location</h3>
        <MapView markets={[market]} center={[market.latitude, market.longitude]} zoom={14} className="h-72" />
      </div>

      {/* Farmers Attending */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold font-serif text-slate-900">
          Local Farmers at {market.name} ({market.farmers?.length || 0})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {market.farmers?.map(farmer => (
            <div key={farmer.id} className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xl">
                  👨‍🌾
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{farmer.stall_name || farmer.name}</h4>
                  <span className="text-[11px] text-emerald-700 font-semibold">{farmer.name}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{farmer.bio || 'Family owned local organic farm.'}</p>
              <div className="text-[11px] text-slate-600 bg-amber-50 p-2.5 rounded-xl">
                <strong>Pickup Slot:</strong> {farmer.pickup_time_windows || '8:00 AM - 2:00 PM'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Weekly Produce */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold font-serif text-slate-900">
          Available Harvest at this Market ({market.products?.length || 0})
        </h3>

        {market.products?.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            No products listed for this market yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {market.products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
