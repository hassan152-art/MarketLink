import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Leaf, ShieldCheck, TrendingDown, Sparkles, Award } from 'lucide-react';

export const FoodWasteImpact = () => {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    loadImpact();
  }, []);

  const loadImpact = async () => {
    try {
      const data = await fetchAPI('/impact/food-waste');
      setImpact(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!impact) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Food Waste Reduction Impact
          </span>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">Zero Waste Local Harvest</h3>
        </div>

        <div className="px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Real-Time Platform Impact
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-3xl font-extrabold font-serif text-emerald-400">{impact.total_food_saved_kg} KG</span>
          <p className="text-xs text-slate-300 font-semibold mt-1">Organic Harvest Saved</p>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-3xl font-extrabold font-serif text-teal-300">{impact.co2_emissions_prevented_kg} KG</span>
          <p className="text-xs text-slate-300 font-semibold mt-1">CO₂ Emissions Prevented</p>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-3xl font-extrabold font-serif text-amber-400">${impact.farmer_revenue_preserved}</span>
          <p className="text-xs text-slate-300 font-semibold mt-1">Farmer Revenue Saved</p>
        </div>
      </div>
    </div>
  );
};
