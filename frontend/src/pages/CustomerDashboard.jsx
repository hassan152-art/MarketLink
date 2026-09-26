import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ReviewModal } from '../components/ReviewModal';
import { QRModal } from '../components/QRModal';
import { NotificationsPanel } from '../components/NotificationsPanel';
import {
  Clock, CheckCircle2, AlertCircle, ShoppingBag, Star, RefreshCw, XCircle,
  QrCode, User, ShieldCheck, Sparkles, Bell, ArrowRight, Save, KeyRound,
  PackageCheck, AlertTriangle
} from 'lucide-react';
import { pageEntrance } from '../animations';


export const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('orders'); // orders, notifications, recommendations, profile, security
  const [orders, setOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviewOrder, setReviewOrder] = useState(null);
  const [selectedQROrderId, setSelectedQROrderId] = useState(null);
  const isSuccess = searchParams.get('success') === 'true';

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    contact_number: user?.contact_number || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        contact_number: user.contact_number || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [orderData, prodData] = await Promise.all([
        fetchAPI('/orders'),
        fetchAPI('/products').catch(() => [])
      ]);
      setOrders(orderData);
      setRecommendedProducts(prodData.slice(0, 4));

      // Fetch security logs
      fetchAPI('/auth/security-logs')
        .then(logs => setSecurityLogs(logs))
        .catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pre-order?')) return;
    try {
      await fetchAPI(`/orders/${orderId}/cancel`, { method: 'PUT' });
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addToCart({
        id: item.product_id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        farmer_id: order.farmer_id,
        market_id: order.market_id
      }, item.quantity);
    });
    navigate('/cart');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3500);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      const res = await fetchAPI('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: user?.email })
      });
      setOtpMessage(res.message + (res.devOtp ? ` (Dev Code: ${res.devOtp})` : ''));
    } catch (err) {
      alert(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) return;
    try {
      setOtpLoading(true);
      const res = await fetchAPI('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: user?.email, otp: otpCode })
      });
      alert(res.message);
      setOtpCode('');
      setOtpMessage('');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold text-[10px] uppercase">Placed (Pending Acceptance)</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] uppercase">Accepted & Harvest Confirmed</span>;
      case 'ready_for_pickup':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-brand-800 rounded-full font-bold text-[10px] uppercase inline-flex items-center gap-1 animate-pulse">
            <PackageCheck className="w-3.5 h-3.5" /> Ready for Pickup
          </span>
        );

      case 'completed':
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px] uppercase">Completed & Picked Up</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-[10px] uppercase">Cancelled</span>;
      default:
        return null;
    }
  };

  const getStepProgress = (status) => {
    const steps = ['placed', 'accepted', 'ready_for_pickup', 'completed'];
    const currentIdx = steps.indexOf(status);
    if (status === 'cancelled') return -1;
    return currentIdx !== -1 ? currentIdx : 0;
  };

  const stats = [
    { label: 'Total Pre-Orders', value: orders.length, icon: ShoppingBag, tone: 'bg-slate-900 text-white' },
    { label: 'Awaiting Pickup', value: orders.filter(o => o.order_status === 'ready_for_pickup').length, icon: Clock, tone: 'bg-emerald-50 text-brand-700' },
    { label: 'In Preparation', value: orders.filter(o => ['placed', 'accepted'].includes(o.order_status)).length, icon: AlertCircle, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Completed', value: orders.filter(o => o.order_status === 'completed').length, icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 sm:p-10 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Customer Personal Portal
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-white mt-1">Welcome back, {user?.name}!</h1>
          <p className="text-xs text-slate-300 mt-2 max-w-md">
            Manage your fresh market pre-orders, QR pickup codes, AI harvest recommendations, and account profile.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="relative px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((s) => (
          <div key={s.label} className="card-hover p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.tone}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold font-serif text-slate-900 leading-none">{s.value}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {isSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Pre-order successfully placed! Check your order progress and pickup QR code below.
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'orders' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> My Pre-Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'notifications' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'recommendations' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" /> Recommended For You & Restocks
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'profile' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" /> Profile & Contact Info
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'security' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Security & Activity Logs
        </button>
      </div>

      {/* TAB 1: PRE-ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold font-serif text-slate-900">
              Active & Past Pre-Orders <span className="text-slate-400 font-bold">({orders.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
              Loading your pre-orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-14 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No active pre-orders yet</p>
              <p className="text-xs text-slate-400">Discover fresh produce in your nearby farmers market and place your first pre-order!</p>
              <button
                onClick={() => navigate('/products')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Browse Fresh Produce</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map(order => {
                const stepIdx = getStepProgress(order.order_status);
                return (
                  <div key={order.id} className="card-hover bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-base">Order #{order.id}</span>
                          {getStatusBadge(order.order_status)}
                          {order.verification_code && (
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded-md font-bold">
                              Code: {order.verification_code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Stall: <strong className="text-slate-800">{order.farmer_name}</strong> • Market: <strong className="text-slate-800">{order.market_name}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Total at Pickup</p>
                        <p className="text-2xl font-extrabold font-serif text-slate-900">${order.total_amount?.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Real-time Order Tracking Visual Progress */}
                    {order.order_status !== 'cancelled' && (
                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                            <Clock className="w-4 h-4 text-brand-600" /> Live Stall Status Tracker:
                          </span>
                          <span className="text-[11px] bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-700">
                            Stall Queue: <strong>Position #{order.queue_position || 1}</strong>
                          </span>
                        </div>

                        {/* Progress Stepper Bar */}
                        <div className="grid grid-cols-4 gap-2 pt-2">
                          {[
                            { label: 'Placed', step: 0 },
                            { label: 'Harvest Accepted', step: 1 },
                            { label: 'Ready for Pickup', step: 2 },
                            { label: 'Picked Up', step: 3 },
                          ].map(s => {
                            const isDone = stepIdx >= s.step;
                            const isCurrent = stepIdx === s.step;
                            return (
                              <div key={s.label} className="text-center space-y-1">
                                <div className={`h-2 rounded-full transition-colors ${
                                  isDone ? 'bg-brand-600' : 'bg-slate-200'
                                } ${isCurrent ? 'ring-2 ring-brand-400 ring-offset-1 animate-pulse' : ''}`} />
                                <span className={`text-[10px] font-bold block truncate ${
                                  isDone ? 'text-brand-800' : 'text-slate-400'
                                }`}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pickup Window Info */}
                    <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                        <span><strong>Scheduled Pickup:</strong> {order.pickup_date} ({order.pickup_time_slot})</span>
                      </div>
                      <span className="font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                        {order.payment_method || 'Pay at Pickup (Cash/Card)'}
                      </span>
                    </div>

                    {/* Items breakdown */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Ordered Items</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50/70 rounded-xl text-xs flex justify-between">
                            <span className="font-semibold text-slate-800">{item.quantity}x {item.name}</span>
                            <span className="font-serif font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedQROrderId(order.id)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <QrCode className="w-4 h-4 text-emerald-400" /> Show Pickup QR Code
                      </button>

                      {/* 1-Click Reorder Button */}
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-emerald-200"
                        title="Add same harvest items back into your cart"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> 1-Click Reorder
                      </button>

                      {order.order_status !== 'completed' && order.order_status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel Pre-order
                        </button>
                      )}

                      {order.order_status === 'completed' && (
                        <button
                          onClick={() => setReviewOrder(order)}
                          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Leave Farmer Review
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <NotificationsPanel embedded />
        </div>
      )}

      {/* TAB 2: AI RECOMMENDATIONS & RESTOCKS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Smart Harvest Engine
            </span>
            <h2 className="text-2xl font-extrabold font-serif text-slate-900">Personalized Harvest Recommendations</h2>
            <p className="text-xs text-slate-500">Produce picked based on season, market popularity, and community favorites.</p>
          </div>

          {/* Restock Alerts Section */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Farmer Harvest Restock Alert
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                <strong>Green Acres Farm</strong> and <strong>Sun Valley Dairy</strong> restocked fresh Heirloom Tomatoes, Raw Clover Honey, and Artisan Cheese for the upcoming weekend market!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedProducts.map(p => (
              <div key={p.id} className="card-hover bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover rounded-2xl mb-3" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">{p.category}</span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{p.name}</h4>
                  <p className="text-xs text-slate-500">{p.farmer_name}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-extrabold font-serif text-base text-slate-900">${p.price} <span className="text-xs text-slate-400 font-normal">/{p.unit}</span></span>
                  <button
                    onClick={() => {
                      addToCart(p, 1);
                      alert(`Added ${p.name} to your basket!`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Add</span>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE & CONTACT */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-extrabold font-serif text-slate-900">Edit Customer Profile</h3>
            <p className="text-xs text-slate-500">Keep your pickup notification contact number and address up to date.</p>
          </div>

          {profileSaved && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email address cannot be changed directly.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone (for pickup reminders)</label>
              <input
                type="tel"
                value={profileForm.contact_number}
                onChange={e => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Home Address / Neighborhood</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Cityville, NY"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Personal Bio & Produce Preferences</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Love organic vegetables, heirloom fruit, and fresh farm eggs..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SECURITY & ACTIVITY LOGS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Account Security Overview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold font-serif text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" /> Account Verification Status
              </h3>
              
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user?.email}</p>
                  <p className="text-[11px] text-slate-500">
                    Status:{' '}
                    {user?.is_verified ? (
                      <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pending OTP Verification
                      </span>
                    )}
                  </p>
                </div>

                {!user?.is_verified && (
                  <button
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                  >
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>

              {otpMessage && (
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold">
                  {otpMessage}
                </div>
              )}

              {!user?.is_verified && (
                <form onSubmit={handleVerifyOtp} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-widest"
                  />
                  <button
                    type="submit"
                    disabled={otpLoading || !otpCode}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    Verify Code
                  </button>
                </form>
              )}
            </div>

            {/* Password Management */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold font-serif text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand-600" /> Password & Credential Security
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your account is protected with salted bcrypt hashing and JWT authorization tokens.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Request Password Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Security Logs List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold font-serif text-slate-900">Recent Login & Security Activity</h3>
            {securityLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No recent security events recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Action</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {securityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-semibold text-slate-800">{log.action}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{log.ip}</td>
                        <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {reviewOrder && (
        <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmitted={loadDashboardData} />
      )}

      {/* QR Code Dialog */}
      {selectedQROrderId && (
        <QRModal orderId={selectedQROrderId} onClose={() => setSelectedQROrderId(null)} />
      )}

    </div>
  );
};
