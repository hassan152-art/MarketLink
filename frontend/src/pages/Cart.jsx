import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-brand-600 flex items-center justify-center mx-auto text-3xl">
          🥬
        </div>
        <h2 className="text-3xl font-extrabold font-serif text-slate-900">Your Basket is Empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore our local farmers market harvest and add fresh organic produce, sourdough, or dairy to your pre-order basket!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md transition-all"
        >
          <span>Browse Fresh Harvest</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Market Pre-Orders</span>
          <h1 className="text-3xl font-extrabold font-serif text-slate-900">Your Harvest Basket</h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Empty Basket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map(item => (
            <div
              key={item.product_id}
              className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{item.name}</h3>
                  <p className="text-xs text-emerald-700 font-semibold mb-1">{item.farmer_name || 'Local Farmer'}</p>
                  <p className="text-xs font-serif font-extrabold text-slate-900">
                    ${Number(item.price).toFixed(2)} <span className="font-sans font-normal text-slate-400">/ {item.unit}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Subtotal</p>
                  <p className="font-serif font-extrabold text-slate-900 text-base">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-bold font-serif text-slate-900 text-lg">Order Summary</h3>

            <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Produce Total</span>
                <span className="font-bold text-slate-900 font-serif">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Market Pickup Fee</span>
                <span>FREE</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900 font-serif">
              <span>Total Due at Pickup</span>
              <span className="text-xl text-brand-700">${cartTotal.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Payment is settled in person (Cash/Card) when picking up at the market stall.</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-700 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Schedule Pickup Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
