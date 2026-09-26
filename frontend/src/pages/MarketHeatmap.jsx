import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAPI } from '../services/api';
import { Activity, TrendingUp, Package, MapPin, RefreshCw, CheckCircle2, DollarSign, Calendar, ShoppingCart } from 'lucide-react';


export const MarketHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);

  const loadData = () => {
    setLoading(true);
    fetchAPI('/markets/heatmap')
      .then(data => {
        setHeatmapData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const getColor = (intensity) => {
    if (intensity > 0.6) return '#dc2626';
    if (intensity > 0.3) return '#f59e0b';
    return '#22c55e';
  };

  const getRadius = (count) => Math.max(400, count * 200);

  // Compute map center from data or use default NYC
  const center = heatmapData.length > 0
    ? [
        heatmapData.reduce((s, m) => s + (m.latitude || 40.7128), 0) / heatmapData.length,
        heatmapData.reduce((s, m) => s + (m.longitude || -74.006), 0) / heatmapData.length
      ]
    : [40.7128, -74.006];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Live Intelligence</span>
          <h1 className="text-3xl font-extrabold font-serif text-slate-900 mt-1">Market Activity Heatmap</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time order density and revenue distribution across all farmers markets.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      {heatmapData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {heatmapData.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarket(selectedMarket?.id === m.id ? null : m)}
              className={`text-left p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                selectedMarket?.id === m.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200 hover:border-brand-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getColor(m.intensity) }} />
                <p className="text-[11px] font-bold text-slate-500 uppercase truncate">{m.name}</p>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{m.order_count}</p>
              <p className="text-[11px] text-slate-500">Orders • <span className="font-semibold">${m.revenue.toFixed(0)}</span> revenue</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.product_count} products</p>
            </button>
          ))}
        </div>
      )}

      {/* Selected market detail */}
      {selectedMarket && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-brand-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-brand-900">{selectedMarket.name}</p>
              <p className="text-brand-700 text-xs mt-0.5">{selectedMarket.address}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-brand-700" /> {selectedMarket.order_count} orders
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {selectedMarket.completed_orders} completed
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> ${selectedMarket.revenue.toFixed(2)} revenue
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {selectedMarket.operating_days?.join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '480px' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse text-brand-400" />
              <p className="text-sm font-medium">Loading market data...</p>
            </div>
          </div>
        ) : heatmapData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-slate-200" />
              <p className="font-semibold text-slate-600">No market data available</p>
              <p className="text-xs mt-1">Markets need coordinates to appear on the map</p>
            </div>
          </div>
        ) : (
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {heatmapData.map(market => (
              <Circle
                key={market.id}
                center={[market.latitude, market.longitude]}
                radius={getRadius(market.order_count)}
                pathOptions={{
                  fillColor: getColor(market.intensity),
                  fillOpacity: 0.35,
                  color: getColor(market.intensity),
                  weight: 2,
                  opacity: 0.8
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <h4 className="font-bold text-sm">{market.name}</h4>
                    <p className="text-xs text-slate-600">{market.address}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs mt-1">
                      <span>🛒 <strong>{market.order_count}</strong> orders</span>
                      <span>✅ <strong>{market.completed_orders}</strong> done</span>
                      <span>💰 <strong>${market.revenue}</strong></span>
                      <span>📦 <strong>{market.product_count}</strong> products</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Open: {market.operating_days?.join(', ') || 'N/A'}</p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span>High Activity (&gt;60% capacity)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /><span>Medium Activity (30–60%)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Normal Activity (&lt;30%)</span></div>
        <span className="text-slate-400 ml-auto">Bubble size = order volume</span>
      </div>
    </div>
  );
};
