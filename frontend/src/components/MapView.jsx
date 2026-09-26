import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Store, Calendar, Clock, Navigation, UserCheck } from 'lucide-react';

// Custom Leaflet Markers with pure SVG icons (Zero Emojis)
const createCustomIcon = (color, svgPath) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2.5px solid white;
      ">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${svgPath}
        </svg>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Store icon for market
const marketIcon = createCustomIcon(
  '#16a34a',
  '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>'
);

// Sprout/farmer icon for stall
const farmerIcon = createCustomIcon(
  '#d97706',
  '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>'
);

export const MapView = ({ markets = [], farmers = [], center = [40.75, -73.98], zoom = 12, className = "h-96" }) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-lg border border-slate-200 ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Market Markers */}
        {markets.map(market => (
          <Marker
            key={`market-${market.id}`}
            position={[market.latitude || 40.7829, market.longitude || -73.9654]}
            icon={marketIcon}
          >
            <Popup className="rounded-2xl shadow-xl">
              <div className="p-1 max-w-xs">
                <div className="flex items-center gap-2 mb-1 text-brand-700 font-bold text-xs">
                  <Store className="w-4 h-4" /> Farmers Market
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{market.name}</h4>
                <p className="text-xs text-slate-600 mb-2">{market.address}</p>

                <div className="space-y-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>{market.operating_days?.join(', ') || 'Weekends'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>{market.operating_hours || '8:00 AM - 3:00 PM'}</span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${market.latitude},${market.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Farmer Stall Markers */}
        {farmers.map(farmer => (
          <Marker
            key={`farmer-${farmer.id}`}
            position={[farmer.latitude || 40.75, farmer.longitude || -73.98]}
            icon={farmerIcon}
          >
            <Popup>
              <div className="p-1 max-w-xs">
                <div className="flex items-center gap-1 text-amber-600 font-bold text-xs mb-1">
                  <UserCheck className="w-3.5 h-3.5" /> Farmer Stall Pickup Point
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{farmer.stall_name || farmer.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{farmer.address}</p>
                <div className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded-xl mb-2">
                  <span className="font-semibold text-amber-900">Pickup Window:</span> {farmer.pickup_time_windows || '8:00 AM - 2:00 PM'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
