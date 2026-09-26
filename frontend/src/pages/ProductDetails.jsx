import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag, Star, Store, MapPin, ArrowLeft, Check, Heart, ShieldCheck,
  Sparkles, Calendar, Clock, Flame, Tag, TrendingUp
} from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI(`/products/${id}`);
      setProduct(data);
      setSelectedImage(data.image_url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-semibold">Loading harvest product...</div>;
  if (!product) return <div className="text-center py-20 text-slate-500 font-semibold">Product not found.</div>;

  const isSoldOut = product.stock_quantity === 0 || product.status === 'sold_out';
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image_url, product.image_url];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Fresh Produce
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm">
        
        {/* Product Images & Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-xs">
            <img src={selectedImage || product.image_url} alt={product.name} className="w-full h-full object-cover transition-all duration-300" />
            
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              <span className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                {product.category}
              </span>
              {product.seasonal_tag && (
                <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-sm">
                  {product.seasonal_tag}
                </span>
              )}
            </div>

            {isSoldOut && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-red-600 text-white font-extrabold text-sm uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Image Gallery Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-brand-600 ring-2 ring-brand-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Angle ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-brand-700 uppercase tracking-widest">{product.category}</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                product.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-extrabold font-serif text-slate-900">${Number(product.price).toFixed(2)}</div>
              <span className="text-sm text-slate-500 font-medium">/{product.unit}</span>
              
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{product.rating || '5.0'}</span>
                <span className="text-slate-400 font-normal">({product.reviews?.length || 0})</span>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> High Demand
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">{product.description}</p>

            {/* Farmer Stall Badge */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-brand-800 flex items-center justify-center font-bold text-lg">
                  👨‍🌾
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{product.farmer?.stall_name || product.farmer?.name || 'Local Farmer'}</h4>
                  <p className="text-[11px] text-slate-500">{product.farmer?.address || 'Community Market Stall'}</p>
                </div>
              </div>
              <Link to={`/markets/${product.market_id || 1}`} className="text-xs font-bold text-brand-700 hover:underline">
                View Market Stall
              </Link>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 rounded-2xl border border-slate-200 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-white font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-sm text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                  className="w-10 h-10 rounded-xl bg-white font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={isSoldOut}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isSoldOut
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-700 hover:bg-brand-800 text-white shadow-brand-600/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" /> Added to Basket!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Reserve {quantity} for Pickup (${(product.price * quantity).toFixed(2)})
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <span>💳 Pre-orders are reserved online with zero upfront payment. Pay the farmer directly at pickup!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-xl font-extrabold font-serif text-slate-900">
          Customer Reviews & Ratings ({product.reviews?.length || 0})
        </h3>

        {(!product.reviews || product.reviews.length === 0) ? (
          <p className="text-xs text-slate-500">No customer reviews yet for this harvest produce item.</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map(rev => (
              <div key={rev.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Verified Purchase ✅
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                {rev.farmer_response && (
                  <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                    <strong>Farmer Reply:</strong> {rev.farmer_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
