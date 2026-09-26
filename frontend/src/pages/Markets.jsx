import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { MapView } from '../components/MapView';
import { MapPin, Calendar, Clock, Store, ArrowRight, Search, Navigation, Compass, Flame, Package } from 'lucide-react';

export const Markets = () => {
  const [markets, setMarkets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [radiusKm, setRadiusKm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, [search, selectedDay, radiusKm, userLocation]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedDay) query.append('day', selectedDay);
      if (radiusKm) query.append('radius_km', radiusKm);
      if (userLocation) {
        query.append('lat', userLocation.lat);
        query.append('lng', userLocation.lng);
      }

      const data = await fetchAPI(`/markets?${query.toString()}`);
      setMarkets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setRadiusKm('10');
        },
        () => {
          // Fallback to demo NYC location coordinates
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          setRadiusKm('10');
        }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
      setRadiusKm('10');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-brand-900 to-emerald-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Regional Neighborhood Hubs</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif mt-2 mb-4">Farmers Markets Directory</h1>
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl">
          Discover local weekend markets, live open status, stall counts, interactive map navigation, and verified regional family farms.
        </p>

        {/* Filter Controls */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-3 max-w-4xl">
          <div className="sm:col-span-5 flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
            <Search className="w-5 h-5 text-emerald-200 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search market name or address..."
              className="w-full bg-transparent text-sm placeholder:text-slate-300 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
            <Calendar className="w-5 h-5 text-emerald-200 shrink-0" />
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-none cursor-pointer text-slate-900 font-semibold sm:text-white"
            >
              <option value="" className="text-slate-900">All Days</option>
              <option value="Saturday" className="text-slate-900">Saturday</option>
              <option value="Sunday" className="text-slate-900">Sunday</option>
              <option value="Wednesday" className="text-slate-900">Wednesday</option>
              <option value="Thursday" className="text-slate-900">Thursday</option>
              <option value="Friday" className="text-slate-900">Friday</option>
            </select>
          </div>

          <div className="sm:col-span-4 flex gap-2">
            <select
              value={radiusKm}
              onChange={e => {
                setRadiusKm(e.target.value);
                if (e.target.value && !userLocation) {
                  handleDetectLocation();
                }
              }}
              className="flex-1 px-3 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-semibold text-slate-900 sm:text-white focus:outline-none"
            >
              <option value="" className="text-slate-900">All Distances</option>
              <option value="5" className="text-slate-900">Within 5 KM</option>
              <option value="10" className="text-slate-900">Within 10 KM</option>
              <option value="25" className="text-slate-900">Within 25 KM</option>
            </select>

            <button
              onClick={handleDetectLocation}
              title="Detect Nearby Markets"
              className="px-3.5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>

        {userLocation && (
          <p className="text-xs text-emerald-200 mt-3 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Distance search active from your coordinates
          </p>
        )}
      </div>

      {/* Map Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" /> Interactive Map View
        </h3>
        <MapView markets={markets} className="h-80" />
      </div>

      {/* Markets Cards Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold font-serif text-slate-900">
            Available Markets <span className="text-slate-400 font-bold">({markets.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading markets...</div>
        ) : markets.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
            <p className="text-slate-600 font-medium">No markets match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map(market => (
              <div key={market.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between card-hover">
                
                <div className="relative h-48 bg-slate-100">
                  <img src={market.image_url} alt={market.name} className="w-full h-full object-cover" />
                  
                  {/* Status & Distance Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-slate-900 shadow-xs">
                      {market.current_status || 'Scheduled Market'}
                    </span>
                    {market.distance_km !== null && market.distance_km !== undefined && (
                      <span className="bg-slate-900/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                        📍 {market.distance_km} KM away
                      </span>
                    )}
                  </div>

                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-800 shadow-sm">
                    {market.farmer_count || 0} Farmers Present
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-lg">{market.name}</h4>
                      {market.activity_level && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" /> {market.activity_level}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 flex items-start gap-1.5 mb-3">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{market.address}</span>
                    </p>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                        <span><strong>Operating Days:</strong> {market.operating_days?.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                        <span><strong>Hours:</strong> {market.operating_hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-700 font-semibold">
                        <Package className="w-4 h-4 text-brand-600 shrink-0" />
                        <span><strong>Produce Available:</strong> {market.available_products_count || 6}+ fresh harvest items</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${market.latitude},${market.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Directions
                    </a>

                    <Link
                      to={`/markets/${market.id}`}
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Explore Stalls</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
