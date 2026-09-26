import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { ShoppingBag, Heart, Star, Store, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { animateAddToCart, iconPop } from '../animations';


export const ProductCard = ({ product, isFavoritedInitial = false }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [added, setAdded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitial);
  const buttonRef = useRef(null);
  const heartRef = useRef(null);

  const handleAddToCart = (e) => {
    e.preventDefault();
    animateAddToCart(buttonRef.current);
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to save favorites.');
      return;
    }
    iconPop(heartRef.current);
    try {
      const res = await fetchAPI('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, farmer_id: product.farmer_id })
      });
      setIsFavorited(res.isFavorited);
    } catch (err) {
      console.error(err);
    }
  };


  const isSoldOut = product.stock_quantity === 0 || product.status === 'sold_out';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden card-hover">
      
      {/* Thumbnail & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category & Seasonal Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className="bg-white/95 backdrop-blur-md text-slate-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
            {product.category}
          </span>
          {product.seasonal_tag && (
            <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-xs">
              {product.seasonal_tag}
            </span>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <span className="bg-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> Only {product.stock_quantity} left!
            </span>
          )}
        </div>

        {/* Heart Favorite Button */}
        <button
          ref={heartRef}
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            isFavorited
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 text-slate-600 hover:text-red-500 hover:bg-white'
          }`}
          title="Save Favorite"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Sold out overlay tag */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Farmer Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-1 text-emerald-700 font-semibold truncate max-w-[170px]">
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{product.farmer_name || 'Local Farmer'}</span>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{product.rating || '5.0'}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold text-slate-900 font-serif">
              ${Number(product.price).toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {product.unit} • <span className="text-emerald-700 font-semibold">{product.stock_quantity} left</span>
            </span>
          </div>

          <button
            ref={buttonRef}
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
              isSoldOut
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : added
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-brand-700 text-white hover:bg-brand-800 shadow-brand-600/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 animate-bounce" /> Added!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
