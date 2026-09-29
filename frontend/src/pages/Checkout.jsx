import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import confetti from 'canvas-confetti';
import { Calendar, Clock, CheckCircle2, AlertCircle, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);
  const maxPickupDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }, []);
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [pickupTimeSlot, setPickupTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in as a Customer to complete pre-orders.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const slotStart = pickupTimeSlot.split(' - ')[0].trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!slotStart) throw new Error('Please choose a valid pickup time.');
      let slotHour = Number(slotStart[1]);
      if (slotStart[3].toUpperCase() === 'AM' && slotHour === 12) slotHour = 0;
      if (slotStart[3].toUpperCase() === 'PM' && slotHour !== 12) slotHour += 12;
      const pickupStart = new Date(`${pickupDate}T${String(slotHour).padStart(2, '0')}:${slotStart[2]}:00`);
      if (Number.isNaN(pickupStart.getTime()) || pickupStart.getTime() <= Date.now() + 2 * 60 * 60 * 1000) {
        throw new Error('Please choose a pickup time at least 2 hours from now.');
      }

      // Calculate unique farmers in basket
      const uniqueFarmers = [...new Set(cart.map(c => c.farmer_id || 2))];

      const orderPayload = {
        farmer_id: cart[0].farmer_id || 2,
        market_id: cart[0].market_id || 1,
        items: cart,
        pickup_date: pickupDate,
        pickup_time_slot: pickupTimeSlot,
        notes
      };

      const res = await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      // Fire festive confetti animation!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      clearCart();
      navigate('/dashboard/customer?success=true');
    } catch (err) {
      setError(err.message || 'Failed to place pre-order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Final Step</span>
        <h1 className="text-3xl font-extrabold font-serif text-slate-900">Schedule Market Pickup</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Form Details */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-bold font-serif text-slate-900 text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" /> Pickup Time Slot
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={e => setPickupDate(e.target.value)}
              min={today}
              max={maxPickupDate}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">Pickup can be scheduled from today up to 30 days ahead. Changes/cancellation close 2 hours before pickup.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Pickup Time Window</label>
            <select
              value={pickupTimeSlot}
              onChange={e => setPickupTimeSlot(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500"
            >
              <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
              <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
              <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
              <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Special Instructions for Farmer (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows="3"
              placeholder="e.g. Please pick firm tomatoes or cut fresh sourdough loaf..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
            <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pay at Pickup Notice
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Payment functionality is not included online per SRS specifications. You will inspect your order and settle payment directly with the farmer at their stall.
            </p>
          </div>
        </div>

        {/* Right Summary */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold font-serif text-slate-900 text-base">Basket Items ({cart.length})</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-slate-400">{item.quantity} x ${item.price}</p>
                  </div>
                  <span className="font-bold font-serif text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between font-bold text-sm">
              <span>Total Amount</span>
              <span className="font-serif text-lg text-brand-700">${cartTotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-700 to-emerald-600 hover:from-brand-800 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Placing Pre-order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Confirm Pre-Order
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
