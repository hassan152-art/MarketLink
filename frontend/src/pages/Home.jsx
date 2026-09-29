import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { MapView } from '../components/MapView';
import { CommunityImpact } from '../components/CommunityImpact';
import {
  Search, MapPin, Calendar, ArrowRight, ShieldCheck, Heart, Sparkles,
  Store, Leaf, CheckCircle2, ChevronRight, Salad, Apple, Milk, Wheat, Egg,
  Handshake, ShoppingBag, Star, Award
} from 'lucide-react';
import { pageEntrance, textReveal, fadeUp, cardStaggerReveal, createAnimationContext, setupScrollReveal } from '../animations';


export const Home = () => {
  const [markets, setMarkets] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // Scroll-reveal every top-level section (GSAP + ScrollTrigger). Elements
  // tagged with [data-reveal] inside a section stagger in individually;
  // sections without any get a single fade/slide-up as a whole.
  useEffect(() => {
    if (!pageRef.current) return;
    const sections = pageRef.current.querySelectorAll(':scope > section');
    const cleanups = Array.from(sections).map((section) => setupScrollReveal(section));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [featuredProducts, markets]);

  const loadData = async () => {
    try {
      const [mRes, pRes, anRes] = await Promise.all([
        fetchAPI('/markets'),
        fetchAPI('/products'),
        fetchAPI('/announcements').catch(() => [])
      ]);
      setMarkets(mRes);
      setFeaturedProducts(pRes.slice(0, 6));
      setAnnouncements(anRes.slice(0, 3));

      // Extract unique farmers from products & markets
      const uniqueFarmers = [];
      mRes.forEach(m => {
        if (m.farmers) {
          m.farmers.forEach(f => {
            if (!uniqueFarmers.some(uf => uf.id === f.id)) {
              uniqueFarmers.push(f);
            }
          });
        }
      });
      setFarmers(uniqueFarmers);
    } catch (err) {
      console.error('Error loading home data:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery || selectedDay) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}&day=${selectedDay}`);
    }
  };

  return (
    <div className="space-y-20 pb-20" ref={pageRef}>
      
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">MarketLink Announcement</p>
                {announcements.map((announcement) => (
                  <div key={announcement.id}>
                    <h2 className="font-bold text-slate-900 text-sm">{announcement.title}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-12 pb-20 border-b border-emerald-100">
        {/* Floating parallax blobs */}
        <div className="floating-blob w-72 h-72 bg-emerald-300/40 -top-10 -left-16" data-parallax="0.25" style={{ animationDelay: '0s' }} aria-hidden="true" />
        <div className="floating-blob w-56 h-56 bg-amber-200/40 top-24 right-0" data-parallax="0.4" style={{ animationDelay: '1.5s' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Search Form */}
            <div className="lg:col-span-7 space-y-6">
              
              <div data-reveal className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 text-brand-800 text-xs font-extrabold shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>TechWiz 7 eGreen Basket Winner Platform</span>
              </div>

              <h1 data-reveal className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-slate-900 leading-[1.15]">
                Farm Fresh <br />
                <span className="gradient-text">Just a Click Away</span>
              </h1>

              <p data-reveal className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Connect directly with your local farmers markets. Pre-order weekly organic harvest, reserve artisan sourdough & farm dairy, and skip the sell-out rush!
              </p>

              {/* Search & Filter Bar */}
              <form data-reveal onSubmit={handleSearchSubmit} className="bg-white p-3 rounded-3xl shadow-xl border border-slate-200/80 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search organic tomatoes, raw honey, sourdough..."
                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="sm:w-48 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <select
                    value={selectedDay}
                    onChange={e => setSelectedDay(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">Any Market Day</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-700 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Harvest</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Trust Metrics */}
              <div data-reveal className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Family Farmers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No Payment Gateway Required (Pay at Pickup)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Harvest Waste</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div data-reveal className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1000&q=80"
                    alt="Farmers Market Harvest"
                    className="w-full h-[440px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/10 to-transparent flex flex-col justify-end p-6 pb-8 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Central Park Market</span>
                    <h3 className="text-2xl font-bold font-serif mb-1">Weekend Harvest Festival</h3>
                    <p className="text-xs text-slate-200 max-w-[85%]">Over 35 local stalls ready for weekend pickup pre-orders!</p>
                  </div>

                  {/* Floating Badge — pinned to the top so it never collides with the caption below */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 whitespace-nowrap">Fresh Raw Honey</p>
                      <p className="text-[10px] text-emerald-700 font-semibold whitespace-nowrap">25 jars reserved today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Fresh Categories</span>
            <h2 className="text-3xl font-extrabold font-serif text-slate-900">Browse Harvest by Category</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800 transition-colors">
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Organic Veggies', Icon: Salad, category: 'Organic Vegetables', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', iconColor: 'text-emerald-700' },
            { title: 'Fresh Fruits', Icon: Apple, category: 'Fresh Fruits & Berries', bg: 'bg-rose-50 text-rose-900 border-rose-200', iconColor: 'text-rose-600' },
            { title: 'Artisan Dairy', Icon: Milk, category: 'Artisan Dairy & Cheese', bg: 'bg-blue-50 text-blue-900 border-blue-200', iconColor: 'text-blue-600' },
            { title: 'Bakery & Grains', Icon: Wheat, category: 'Fresh Bakery & Grains', bg: 'bg-amber-50 text-amber-900 border-amber-200', iconColor: 'text-amber-600' },
            { title: 'Poultry & Eggs', Icon: Egg, category: 'Poultry & Eggs', bg: 'bg-yellow-50 text-yellow-900 border-yellow-200', iconColor: 'text-yellow-700' },
            { title: 'Honey & Jams', Icon: Sparkles, category: 'Honey, Jams & Preserves', bg: 'bg-orange-50 text-orange-900 border-orange-200', iconColor: 'text-orange-600' },
          ].map((cat, idx) => (
            <Link
              key={idx}
              data-reveal
              to={`/products?category=${encodeURIComponent(cat.category)}`}
              className={`p-5 rounded-3xl border ${cat.bg} text-center flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xs`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center mb-1">
                <cat.Icon className={`w-6 h-6 ${cat.iconColor}`} />
              </div>
              <span className="font-bold text-xs">{cat.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Carousel/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Weekly Stock</span>
            <h2 className="text-3xl font-extrabold font-serif text-slate-900">Featured Local Harvest</h2>
          </div>
          <Link to="/products" className="flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800 transition-colors">
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <div key={product.id} data-reveal>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Discovery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white overflow-hidden relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-5 z-10">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30">
                Interactive OpenStreetMap
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight">
                Locate Markets & Farmer Pickup Stalls
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Find exactly where your local farmer stall is setup on market day. View interactive pin markers, operating schedules, and turn-by-turn pickup route directions!
              </p>

              <div className="space-y-3 pt-2">
                {markets.map(m => (
                  <div key={m.id} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{m.name}</p>
                      <p className="text-slate-400">{m.operating_days?.join(', ')} • {m.operating_hours}</p>
                    </div>
                    <Link to={`/markets/${m.id}`} className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold">
                      View Stall Pins
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 h-[400px]">
              <MapView markets={markets} farmers={farmers} className="h-full" />
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Simple & Convenient</span>
          <h2 className="text-3xl font-extrabold font-serif text-slate-900">How MarketLink Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center text-2xl font-bold mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Browse Local Stalls</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore participating farmers markets, view farmer profiles, and filter real-time weekly stock.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center text-2xl font-bold mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Select Pickup Window</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add products to your cart and choose your preferred pickup date and slot at the farmer's market stall.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center text-2xl font-bold mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Pay at Pickup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Visit the market stall on pickup day, inspect your fresh harvest, and pay directly to the farmer!
            </p>
          </div>
        </div>
      </section>

      <CommunityImpact />

      {/* Platform Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: 'Local', label: 'Farmer-first marketplace', Icon: Leaf, color: 'text-emerald-700 bg-emerald-50' },
            { value: 'Weekly', label: 'Fresh inventory updates', Icon: Calendar, color: 'text-blue-700 bg-blue-50' },
            { value: 'Direct', label: 'Customer-to-farmer connection', Icon: Handshake, color: 'text-amber-700 bg-amber-50' },
            { value: 'Smart', label: 'Search, maps & pre-orders', Icon: Sparkles, color: 'text-purple-700 bg-purple-50' },
          ].map((item) => (
            <div key={item.label} data-reveal className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center mb-3`}>
                <item.Icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">{item.value}</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why MarketLink */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=85"
              alt="Fresh produce growing on a local farm"
              className="w-full h-[380px] object-cover"
            />
          </div>
          <div className="space-y-5">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Why MarketLink?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 leading-tight">
              A simpler way to discover, reserve and collect local food.
            </h2>
            <p className="text-sm text-slate-600 leading-7">
              Local markets often have great products but limited visibility before market day. MarketLink brings that weekly information into one organized digital experience, so customers can discover sellers, review available products and plan their pickup before they arrive.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ['Discover', 'Find markets, farmers and seasonal products in one place.'],
                ['Reserve', 'Build a cart and communicate your intended pickup before stock runs out.'],
                ['Navigate', 'Use interactive market locations to plan where you need to go.'],
                ['Reduce Waste', 'Better visibility of demand can help sellers plan weekly stock more efficiently.'],
              ].map(([title, text]) => (
                <div key={title} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for both sides */}
      <section className="bg-emerald-50/70 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">One Platform, Two Communities</span>
            <h2 className="text-3xl font-extrabold font-serif text-slate-900 mt-2">Designed for Customers and Farmers</h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              MarketLink keeps the experience useful on both sides of the marketplace: customers get clarity before visiting, while farmers get a structured place to showcase their weekly stock.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-7 border border-emerald-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-700 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900">For Customers</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Search products by category, market day and availability.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Explore farmer and market information before you travel.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Save favorite products and farmers for quick access.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Create pre-orders and choose a convenient pickup plan.</span></li>
              </ul>
            </div>
            <div className="bg-white rounded-3xl p-7 border border-emerald-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-700 flex items-center justify-center mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900">For Farmers</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Publish weekly products, prices and available quantities.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Present your stall location and market schedule clearly.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Manage orders and inventory from a dedicated dashboard.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>Build direct relationships with returning local customers.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Freshness Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">From Farm to Pickup</span>
          <h2 className="text-3xl font-extrabold font-serif text-slate-900 mt-2">A Clearer Weekly Market Journey</h2>
          <p className="text-sm text-slate-500 mt-3">
            A structured flow helps customers know what is available and helps sellers prepare for the market day.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            ['01', 'Farmer Updates', 'Farmers publish their latest stock, pricing and pickup information.'],
            ['02', 'Customer Discovery', 'Customers search, filter and compare products across participating markets.'],
            ['03', 'Pre-Order', 'Customers add items to their cart and submit a planned pickup order.'],
            ['04', 'Market Pickup', 'Customers visit the selected stall, confirm their order and complete pickup.'],
          ].map(([number, title, text]) => (
            <div key={number} className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-extrabold text-brand-700">{number}</span>
              <h3 className="font-bold text-slate-900 mt-3">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Community Experience</span>
            <h2 className="text-3xl font-extrabold font-serif mt-2">Built Around Local Connections</h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              MarketLink is designed to make local food shopping more predictable without taking away the personal experience of visiting a farmers market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              ['“I can plan my market visit before leaving home.”', 'Customer experience', 'Better visibility'],
              ['“My weekly products are easier to organize and showcase.”', 'Farmer experience', 'Simple inventory'],
              ['“The map and pickup details make market day easier to navigate.”', 'Community experience', 'Clear locations'],
            ].map(([quote, role, benefit]) => (
              <div key={role} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white leading-relaxed">{quote}</p>
                <div className="mt-5 pt-4 border-t border-white/10">
                  <p className="text-xs font-bold text-emerald-300">{role}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Common Questions</span>
          <h2 className="text-3xl font-extrabold font-serif text-slate-900 mt-2">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {[
            ['What is MarketLink?', 'MarketLink is a digital marketplace concept that connects local farmers and market sellers with customers through product discovery, pre-orders, market information and location tools.'],
            ['Do I pay online?', 'The platform is designed around pay-at-pickup workflows, so customers can review their order and complete payment directly at the selected stall when supported by the seller.'],
            ['Can farmers manage their own products?', 'Yes. Registered farmers can use the farmer dashboard to manage their listings, availability and order information.'],
            ['How does MarketLink help reduce waste?', 'Better visibility of expected demand can help sellers plan quantities and prepare products more efficiently, while customers can reserve items before market day.'],
            ['How do I find a market?', 'Use the Markets directory or the interactive map to review market locations, operating days and available stall information.'],
          ].map(([q, a]) => (
            <details key={q} className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <summary className="cursor-pointer list-none font-bold text-sm text-slate-900 flex items-center justify-between gap-4">
                {q}
                <span className="text-brand-700 text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-slate-500 leading-6 mt-3 pr-6">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-emerald-600 p-8 sm:p-12 text-white text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">Ready to Explore Your Local Harvest?</h2>
          <p className="max-w-2xl mx-auto text-sm text-emerald-50 mt-3 leading-relaxed">
            Discover participating markets, explore fresh inventory and build your next pickup order with MarketLink.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">
            <Link to="/products" className="px-6 py-3 rounded-xl bg-white text-brand-800 font-bold text-sm hover:bg-emerald-50 transition-colors">Browse Products</Link>
            <Link to="/markets" className="px-6 py-3 rounded-xl bg-slate-900/20 border border-white/30 text-white font-bold text-sm hover:bg-slate-900/30 transition-colors">Find a Market</Link>
          </div>
        </div>
      </section>

    </div>
  );
};
