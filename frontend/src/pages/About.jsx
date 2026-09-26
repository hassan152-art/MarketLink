import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Users, MapPin, BarChart3, Recycle, Store, ShoppingBag, ArrowRight } from 'lucide-react';

export const About = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
              <Leaf className="w-3.5 h-3.5" /> About MarketLink
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif leading-tight mt-5">
              Making local markets easier to discover, plan and support.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-8 mt-6 max-w-3xl">
              MarketLink is a digital marketplace concept that brings farmers, local sellers and customers together in one organized experience. Instead of searching across different channels for weekly stock, market locations and pickup details, users can explore everything from a single platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/products" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors">
                Explore Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/markets" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-600 hover:bg-slate-800 text-white font-bold text-sm transition-colors">
                Browse Markets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Our Mission</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mt-2">Turn local market information into a useful digital experience.</h2>
          <p className="text-sm sm:text-base text-slate-600 leading-7 mt-5">
            The goal is not to replace the farmers market experience. It is to make the experience easier before customers arrive: clearer product discovery, organized pre-orders, useful market information and accessible location tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            [<ShoppingBag className="w-6 h-6" />, 'Better Discovery', 'Search and browse products by category, availability and market day so customers can make a more informed plan.'],
            [<Store className="w-6 h-6" />, 'Stronger Visibility', 'Give local farmers and sellers a dedicated digital storefront for their weekly products, schedules and market presence.'],
            [<Recycle className="w-6 h-6" />, 'Smarter Planning', 'Pre-order information can improve visibility of demand and help sellers prepare weekly stock with less uncertainty.'],
          ].map(([icon, title, text]) => (
            <div key={title} className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-5">{icon}</div>
              <h3 className="text-xl font-bold font-serif text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 leading-6 mt-3">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How the platform works */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">The MarketLink Model</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mt-2">One connected journey from discovery to pickup.</h2>
              <p className="text-sm text-slate-600 leading-7 mt-5">
                Farmers can publish products and availability, while customers can search the catalog, save favorites, place pre-orders and use market location information. Role-based dashboards keep the experience organized for customers, farmers and administrators.
              </p>
              <div className="space-y-4 mt-7">
                {[
                  ['01', 'Discover', 'Find products, sellers and nearby market information.'],
                  ['02', 'Choose', 'Review products, availability and pickup details.'],
                  ['03', 'Reserve', 'Create a pre-order and keep your shopping plan organized.'],
                  ['04', 'Collect', 'Visit the selected market stall and complete pickup.'],
                ].map(([n, title, text]) => (
                  <div key={n} className="flex gap-4">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-brand-700 text-white flex items-center justify-center text-xs font-bold">{n}</div>
                    <div>
                      <h3 className="font-bold text-slate-900">{title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?auto=format&fit=crop&w=1200&q=85"
                alt="Fresh vegetables and produce at a local market"
                className="w-full h-[480px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* For users */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Built for Multiple Roles</span>
          <h2 className="text-3xl font-extrabold font-serif text-slate-900 mt-2">A platform that grows with the marketplace</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            [Users, 'Customers', 'Search and filter products, save favorites, manage carts, place orders and view pickup information.'],
            [Store, 'Farmers', 'Manage products, availability, market information and incoming customer orders from a dedicated dashboard.'],
            [ShieldCheck, 'Administrators', 'Oversee users, products, markets and platform activity through centralized management tools.'],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <Icon className="w-7 h-7 text-brand-700 mb-5" />
              <h3 className="text-xl font-bold font-serif text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 leading-6 mt-3">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Platform Capabilities</span>
              <h2 className="text-3xl font-extrabold font-serif text-slate-900 mt-2">More than a product catalog.</h2>
              <p className="text-sm text-slate-600 leading-7 mt-4">
                MarketLink combines marketplace features with practical tools for local commerce, including role-based access, product management, order workflows, favorites, reviews, interactive maps, QR functionality and an AI assistant experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Product Discovery', 'Search & filters'],
                ['Market Maps', 'Location tools'],
                ['Pre-Orders', 'Pickup workflow'],
                ['Dashboards', 'Role-based access'],
                ['Reviews', 'Community feedback'],
                ['Waste Impact', 'Sustainability view'],
              ].map(([title, text]) => (
                <div key={title} className="p-4 bg-white rounded-2xl border border-emerald-100">
                  <p className="font-bold text-sm text-slate-900">{title}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-center text-white">
          <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">Explore the MarketLink experience</h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto mt-3 leading-6">
            Start with the product catalog, discover participating markets or create an account to access the platform's personalized features.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">
            <Link to="/products" className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-sm">Explore Products</Link>
            <Link to="/register" className="px-6 py-3 rounded-xl border border-slate-600 hover:bg-slate-800 font-bold text-sm">Create Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
