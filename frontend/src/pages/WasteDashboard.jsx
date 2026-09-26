import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { FoodWasteImpact } from '../components/FoodWasteImpact';
import { ProductCard } from '../components/ProductCard';
import { Leaf, AlertTriangle, Sparkles, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WasteDashboard = () => {
  const [wasteAlerts, setWasteAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWasteAlerts();
  }, []);

  const loadWasteAlerts = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/ai/waste-alerts');
      setWasteAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl">
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <span className="relative text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
          <Leaf className="w-4 h-4" /> Sustainability & Impact
        </span>
        <h1 className="relative text-3xl sm:text-4xl font-extrabold font-serif mt-1">Food Waste Reduction Center</h1>
      </div>

      {/* Environmental Impact Widget */}
      <FoodWasteImpact />

      {/* AI Excess Harvest & Flash Promotions */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Flash Stock Protection
          </span>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Excess Harvest Promotions</h2>
          <p className="text-xs text-slate-500">Preventing farm food waste by connecting shoppers with surplus seasonal harvest.</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
            Scanning inventory for food waste risks...
          </div>
        ) : wasteAlerts.length === 0 ? (
          <div className="p-14 text-center bg-white rounded-3xl border border-dashed border-emerald-200 text-slate-500 font-semibold">
            🌱 All market stalls have optimal inventory levels with zero wasted produce risk!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wasteAlerts.map(alert => (
              <div key={alert.product_id} className="card-hover p-6 bg-white rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">{alert.product_name}</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase">
                    Excess Stock ({alert.current_stock} left)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-amber-50 p-3 rounded-2xl border border-amber-100">
                  {alert.recommendation}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-2">${alert.original_price}</span>
                    <span className="text-lg font-extrabold font-serif text-brand-700">${alert.suggested_flash_price}</span>
                  </div>

                  <Link
                    to={`/products/${alert.product_id}`}
                    className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Reserve Surplus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
