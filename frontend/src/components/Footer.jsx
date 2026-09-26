import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, MapPin, Phone, Mail, Heart, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';


export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Value Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Local & Seasonal</h4>
              <p className="text-xs text-slate-400">Discover products from participating local sellers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Market Pickup Locations</h4>
              <p className="text-xs text-slate-400">Select convenience pickup windows at nearby markets</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Transparent Pickup</h4>
              <p className="text-xs text-slate-400">Review your order and follow the seller's supported pickup process</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <BrandLogo dark />
            <p className="text-xs text-slate-400 leading-relaxed">
              Bridging the gap between local farmers and shoppers. Making local market discovery easier through product listings, pre-orders, market information and location tools.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-brand-400 transition-colors">Home Page</Link></li>
              <li><Link to="/markets" className="hover:text-brand-400 transition-colors">Farmers Markets Directory</Link></li>
              <li><Link to="/products" className="hover:text-brand-400 transition-colors">Fresh Harvest Produce</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">About Our Platform</Link></li>
              <li><Link to="/contact" className="hover:text-brand-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Col 3: User Portals */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">User Portals</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Customer Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Farmer Registration</Link></li>
              <li><Link to="/dashboard/customer" className="hover:text-brand-400 transition-colors">Customer Pre-Orders</Link></li>
              <li><Link to="/dashboard/farmer" className="hover:text-brand-400 transition-colors">Farmer Inventory Management</Link></li>
              <li><Link to="/dashboard/admin" className="hover:text-brand-400 transition-colors">Admin Command Center</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h5>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>100 Green Tech Plaza, Suite 400, New York, NY 10021</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+1 (555) 019-2831</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@marketlink.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 MarketLink. Developed for TechWiz 7 (Aptech SRS v1.0). All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Local Sustainable Agriculture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
