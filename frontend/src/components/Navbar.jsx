import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchAPI } from '../services/api';
import { BrandLogo } from './BrandLogo';
import { navbarEntrance } from '../animations';
import {
  ShoppingBag, User, LogOut, Store, LayoutDashboard, Shield, Heart, Menu, X,
  Globe, Sparkles, Terminal, Award, Bell, TrendingUp, Search, Activity, ChevronDown
} from 'lucide-react';


export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const headerRef = useRef(null);

  const langLabels = { en: 'EN', ur: 'اردو', romanUrdu: 'Roman' };

  // Close any open dropdown when clicking outside the header.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
        setMoreMenuOpen(false);
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Just the unread badge count here — the full list lives on the
  // dedicated /notifications page (see NotificationsPanel).
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetchAPI('/notifications');
      setUnreadCount(res.unread_count || 0);
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    navbarEntrance(headerRef.current);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header ref={headerRef} className="sticky top-0 z-50 glass-nav border-b border-emerald-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-20">
          
          {/* Brand Logo */}
          <div className="shrink-0">
            <BrandLogo />
          </div>


          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner shrink-0">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive('/') ? 'bg-white text-brand-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('home')}
            </Link>
            <Link
              to="/markets"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive('/markets') ? 'bg-white text-brand-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('markets')}
            </Link>
            <Link
              to="/products"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive('/products') ? 'bg-white text-brand-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('produce')}
            </Link>
            <Link
              to="/compare"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                isActive('/compare') ? 'bg-white text-brand-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Compare
            </Link>

            {/* "More" dropdown — keeps secondary links from crowding the bar */}
            <div className="relative">
              <button
                onClick={() => { setMoreMenuOpen(v => !v); setLangMenuOpen(false); setUserDropdownOpen(false); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  moreMenuOpen || ['/waste-impact', '/api-docs', '/market-heatmap'].includes(location.pathname)
                    ? 'bg-white text-brand-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                More <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <Link
                    to="/waste-impact"
                    onClick={() => setMoreMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-brand-700 rounded-xl transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-500" /> Food Waste Impact
                  </Link>
                  <Link
                    to="/market-heatmap"
                    onClick={() => setMoreMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-brand-700 rounded-xl transition-colors"
                  >
                    <Activity className="w-4 h-4 text-amber-500" /> Market Heatmap
                  </Link>
                 
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => { setLangMenuOpen(v => !v); setMoreMenuOpen(false); setUserDropdownOpen(false); }}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/70 py-2 px-2.5 rounded-full border border-slate-200 text-[11px] font-bold text-slate-700 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                {langLabels[language]}
                <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white shadow-2xl border border-slate-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  {Object.entries(langLabels).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code); setLangMenuOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        language === code ? 'bg-emerald-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Center — takes you straight to the notifications page */}
            <Link
              to="/notifications"
              className="relative shrink-0 p-2.5 rounded-full text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-all border border-slate-200/80 bg-white"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>


            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative shrink-0 p-2.5 rounded-full text-slate-700 hover:text-brand-700 hover:bg-brand-50 transition-all border border-slate-200/80 bg-white"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown or Login Button */}
            {user ? (
              <div className="relative shrink-0 max-w-[180px]">
                <button
                  onClick={() => { setUserDropdownOpen(!userDropdownOpen); setMoreMenuOpen(false); setLangMenuOpen(false); }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white border border-emerald-200 hover:border-brand-500 transition-all shadow-sm w-full min-w-0"
                >
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-400 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left leading-tight min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-brand-800 capitalize">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-2 space-y-1">
                      {user.role === 'Customer' && (
                        <>
                          <Link
                            to="/dashboard/customer"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-brand-700 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> My Customer Dashboard
                          </Link>
                          <Link
                            to="/favorites"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-brand-700 rounded-xl transition-colors"
                          >
                            <Heart className="w-4 h-4 text-red-500" /> Favorite Farmers & Items
                          </Link>
                        </>
                      )}

                      {user.role === 'Farmer' && (
                        <Link
                          to="/dashboard/farmer"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <Store className="w-4 h-4" /> Farmer Stall Dashboard
                        </Link>
                      )}

                      {user.role === 'Admin' && (
                        <Link
                          to="/dashboard/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <Shield className="w-4 h-4 text-brand-600" /> Admin Command Center
                        </Link>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-emerald-50 transition-all"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-brand-700 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 shadow-md shadow-brand-600/20 transition-all"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link to="/cart" className="relative p-2 text-slate-700">
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Language
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ur')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${language === 'ur' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                اردو
              </button>
              <button
                onClick={() => setLanguage('romanUrdu')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${language === 'romanUrdu' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                Roman
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100">
              {t('home')}
            </Link>
            <Link to="/markets" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100">
              {t('markets')}
            </Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100">
              {t('produce')}
            </Link>
            <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Compare
            </Link>
            <Link to="/market-heatmap" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100">
              <Activity className="w-4 h-4 text-amber-500" /> Market Heatmap
            </Link>
            <Link to="/waste-impact" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100">
              <Award className="w-4 h-4 text-amber-500" /> Food Waste Impact
            </Link>
            <Link to="/api-docs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100">
              <Terminal className="w-4 h-4 text-brand-600" /> API Documentation
            </Link>
          </div>

          {/* User Auth Section on Mobile */}
          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
                  <div className="w-9 h-9 rounded-full bg-brand-700 text-white font-bold flex items-center justify-center text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{user.role}</p>
                  </div>
                </div>

                <Link
                  to={user.role === 'Admin' ? '/dashboard/admin' : user.role === 'Farmer' ? '/dashboard/farmer' : '/dashboard/customer'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-800 text-white text-xs font-bold shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>

                {user.role === 'Customer' && (
                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <Heart className="w-4 h-4 text-red-500" /> Saved Stalls & Produce
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-brand-800 text-white text-xs font-bold shadow-xs hover:bg-brand-900"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
