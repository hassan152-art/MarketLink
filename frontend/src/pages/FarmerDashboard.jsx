import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRModal } from '../components/QRModal';
import ProfileShare from '../components/ProfileShare';
import {
  Store, Plus, Edit, Trash2, CheckCircle2, Clock, DollarSign, Package,
  Star, MessageSquare, AlertCircle, RefreshCw, X, QrCode, Sparkles,
  TrendingUp, Scan, Settings, Save, MapPin, Calendar, BarChart3,
  PackageCheck, Award, PieChart as PieChartIcon
} from 'lucide-react';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#2d6a4f', '#52b788', '#f59e0b', '#dc2626', '#6366f1', '#ec4899'];

export const FarmerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [farmerAnalytics, setFarmerAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // orders, products, forecast, analytics, reviews, stall_settings
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);


  // Quick Verification Code Input
  const [quickCodeInput, setQuickCodeInput] = useState('');
  const [quickVerifyMsg, setQuickVerifyMsg] = useState('');

  // Modal State for Add/Edit Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Organic Vegetables',
    price: '',
    unit: 'per lb',
    stock_quantity: '',
    description: '',
    image_url: ''
  });

  // Stall Settings Form
  const [stallForm, setStallForm] = useState({
    stall_name: user?.stall_name || '',
    bio: user?.bio || '',
    contact_number: user?.contact_number || '',
    pickup_time_windows: user?.pickup_time_windows || '8:00 AM - 2:00 PM',
    operating_days: user?.operating_days || ['Saturday', 'Sunday'],
    latitude: user?.latitude || 40.7829,
    longitude: user?.longitude || -73.9654
  });
  const [stallSaved, setStallSaved] = useState(false);

  const [farmerResponseText, setFarmerResponseText] = useState({});

  useEffect(() => {
    if (user) {
      setStallForm({
        stall_name: user.stall_name || '',
        bio: user.bio || '',
        contact_number: user.contact_number || '',
        pickup_time_windows: user.pickup_time_windows || '8:00 AM - 2:00 PM',
        operating_days: user.operating_days || ['Saturday', 'Sunday'],
        latitude: user.latitude || 40.7829,
        longitude: user.longitude || -73.9654
      });
    }
    loadFarmerData();
  }, [user]);

  const loadFarmerData = async () => {
    try {
      setLoading(true);
      const [pRes, oRes, rRes, fRes, anRes] = await Promise.all([
        fetchAPI(`/products?farmer_id=${user.id}`),
        fetchAPI('/orders'),
        fetchAPI(`/reviews?farmer_id=${user.id}`),
        fetchAPI(`/ai/forecast?farmer_id=${user.id}`).catch(() => []),
        fetchAPI('/orders/farmer/analytics').catch(() => null)
      ]);
      setProducts(pRes);
      setOrders(oRes);
      setReviews(rRes);
      setForecasts(fRes);
      setFarmerAnalytics(anRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetchAPI(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ order_status: newStatus })
      });
      loadFarmerData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickVerifyCode = async (e) => {
    e.preventDefault();
    if (!quickCodeInput.trim()) return;
    try {
      const res = await fetchAPI('/qr/verify', {
        method: 'POST',
        body: JSON.stringify({ qr_code_data: quickCodeInput.trim() })
      });
      setQuickVerifyMsg(`Verified: Order #${res.order_id} marked as picked up!`);
      setQuickCodeInput('');
      loadFarmerData();
      setTimeout(() => setQuickVerifyMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleQuickStockAdjust = async (productId, delta) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    const newQty = Math.max(0, (p.stock_quantity || 0) + delta);
    try {
      await fetchAPI(`/products/${productId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ stock_quantity: newQty })
      });
      loadFarmerData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApplyWeeklyTemplate = async () => {
    if (!window.confirm('Reset all listed products to weekly harvest batch stock (25 units each)?')) return;
    try {
      const updates = products.map(p => ({ id: p.id, stock_quantity: 25, status: 'available' }));
      await fetchAPI('/products/bulk-stock', {
        method: 'POST',
        body: JSON.stringify({ updates })
      });
      alert('Weekly harvest template applied successfully!');
      loadFarmerData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Select an image from the computer and store it as a data URL in image_url.
  // Keep images small because the existing API sends product data as JSON.
  const handleProductImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, or WebP).');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be 2 MB or smaller. Please resize it and try again.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProductForm(current => ({ ...current, image_url: reader.result }));
    };
    reader.onerror = () => alert('Could not read this image. Please select it again.');
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await fetchAPI(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productForm)
        });
      } else {
        await fetchAPI('/products', {
          method: 'POST',
          body: JSON.stringify(productForm)
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', category: 'Organic Vegetables', price: '', unit: 'per lb', stock_quantity: '', description: '', image_url: '' });
      loadFarmerData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product from your weekly stock?')) return;
    try {
      await fetchAPI(`/products/${productId}`, { method: 'DELETE' });
      loadFarmerData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveStallSettings = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(stallForm);
      setStallSaved(true);
      setTimeout(() => setStallSaved(false), 3500);
    } catch (err) {
      alert(err.message || 'Failed to save stall settings.');
    }
  };

  const handlePostReviewResponse = async (reviewId) => {
    const text = farmerResponseText[reviewId];
    if (!text) return;
    try {
      await fetchAPI(`/reviews/${reviewId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ farmer_response: text })
      });
      loadFarmerData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Metrics Calculations
  const pendingOrders = orders.filter(o => o.order_status === 'placed' || o.order_status === 'accepted');
  const readyOrders = orders.filter(o => o.order_status === 'ready_for_pickup');
  const completedOrders = orders.filter(o => o.order_status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 to-brand-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -top-20 -left-10 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Farmer Management Hub</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif mt-1">{user?.stall_name || user?.name}</h1>
          <p className="text-xs text-slate-200 mt-1">Pickup Window: {user?.pickup_time_windows || '8:00 AM - 2:00 PM'}</p>
        </div>

        <div className="relative flex flex-wrap items-center gap-3">
          <ProfileShare className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs" />
          <button
            onClick={() => setShowQRScanner(true)}
            className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <Scan className="w-4 h-4 text-brand-600" /> Digital QR Verifier
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({ name: '', category: 'Organic Vegetables', price: '', unit: 'per lb', stock_quantity: '25', description: '', image_url: '' });
              setShowProductModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-brand-500 hover:from-emerald-400 hover:to-brand-400 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Produce Product
          </button>
        </div>
      </div>

      {/* Quick Pickup Code Input Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Instant Customer Pickup Verification</h4>
            <p className="text-[11px] text-slate-500">Enter customer verification code (e.g., ML-AB12CD) or scan their pickup ticket.</p>
          </div>
        </div>

        <form onSubmit={handleQuickVerifyCode} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="e.g. ML-AB12CD or Order #101"
            value={quickCodeInput}
            onChange={e => setQuickCodeInput(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0"
          >
            Verify Pickup
          </button>
        </form>
      </div>

      {quickVerifyMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{quickVerifyMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed Revenue</p>
            <p className="text-2xl font-extrabold font-serif text-slate-900">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="card-hover p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Orders</p>
            <p className="text-2xl font-extrabold font-serif text-slate-900">{pendingOrders.length}</p>
          </div>
        </div>

        <div className="card-hover p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ready for Pickup</p>
            <p className="text-2xl font-extrabold font-serif text-slate-900">{readyOrders.length}</p>
          </div>
        </div>

        <div className="card-hover p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Listed Products</p>
            <p className="text-2xl font-extrabold font-serif text-slate-900">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/70 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Manage Pre-Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'products' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Weekly Stock & Quick Adjust ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'forecast' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Demand Forecast & Waste
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> My Analytics & Revenue
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'reviews' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Customer Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('stall_settings')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'stall_settings' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Stall & Schedule Settings
        </button>
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-14 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500">
              No incoming pre-orders yet — customer reservations will appear here.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="card-hover p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">Order #{order.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {order.order_status}
                      </span>
                      {order.verification_code && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold rounded">
                          QR: {order.verification_code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Customer: <strong className="text-slate-800">{order.customer_name}</strong> • Phone: {order.customer_contact || 'N/A'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Due</p>
                    <p className="text-2xl font-extrabold font-serif text-slate-900">${order.total_amount?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Pickup details */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span><strong>Pickup Window:</strong> {order.pickup_date} ({order.pickup_time_slot})</span>
                  </div>
                  <span className="font-bold text-slate-600">
                    Queue Position: #{order.queue_position || 1}
                  </span>
                </div>

                {/* Ordered Items */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Items to pack:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between">
                        <span className="font-semibold text-slate-800">{item.quantity}x {item.name}</span>
                        <span className="font-serif font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                  {order.order_status === 'placed' && (
                    <>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Accept Pre-Order
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {order.order_status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'ready_for_pickup')}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <PackageCheck className="w-4 h-4" /> Mark Packaged & Ready for Pickup
                    </button>
                  )}

                  {order.order_status === 'ready_for_pickup' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm Pickup & Payment Completed
                    </button>
                  )}

                  {order.order_status === 'completed' && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Picked up & Paid
                    </span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Products & Weekly Stock Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold font-serif text-slate-900">Weekly Harvest Stock Management</h3>
              <p className="text-xs text-slate-500">Quick adjust stock quantities or apply weekly harvest templates.</p>
            </div>

            <button
              onClick={handleApplyWeeklyTemplate}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors self-start"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Apply Weekly Harvest Template (25 units)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="card-hover p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover rounded-2xl bg-slate-100" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full">{p.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.stock_quantity > 0 ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{p.name}</h4>
                    <p className="text-xs text-slate-500">${p.price} / {p.unit}</p>
                  </div>
                </div>

                {/* Quick Stock Controls (+/- Stepper) */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Stock Quantity:</span>
                    <strong className="text-base font-extrabold text-slate-900">{p.stock_quantity} {p.unit}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickStockAdjust(p.id, -5)}
                      className="flex-1 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
                    >
                      -5 units
                    </button>
                    <button
                      onClick={() => handleQuickStockAdjust(p.id, 5)}
                      className="flex-1 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
                    >
                      +5 units
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setProductForm(p);
                      setShowProductModal(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Demand Forecast */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forecasts.map(fc => (
              <div key={fc.product_id} className="card-hover p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold font-serif text-slate-900 text-base">{fc.product_name}</h4>
                    <p className="text-[11px] text-slate-400">{fc.category}</p>
                  </div>
                  <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full font-bold text-[11px]">
                    {fc.confidence_score} AI Confidence
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Stock:</span>
                    <strong className="text-slate-900">{fc.current_stock}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Predicted Demand:</span>
                    <strong className="text-brand-700 font-serif">{fc.predicted_demand_range}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recommended Stock:</span>
                    <strong className="text-emerald-700 font-bold">{fc.recommended_stock} units</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                  <span>{fc.trend_label}</span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Farmer Analytics & Revenue Intelligence */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Revenue Earned</span>
              <p className="text-2xl font-extrabold font-serif text-brand-700 mt-1">
                ${farmerAnalytics ? farmerAnalytics.total_revenue.toFixed(2) : '0.00'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">From all fulfilled orders</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Pre-Orders</span>
              <p className="text-2xl font-extrabold font-serif text-slate-900 mt-1">
                {farmerAnalytics ? farmerAnalytics.total_orders : orders.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">All customer reservations</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Queue</span>
              <p className="text-2xl font-extrabold font-serif text-amber-600 mt-1">
                {farmerAnalytics ? farmerAnalytics.active_orders : 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Orders in prep / ready</p>
            </div>
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Completed Pickups</span>
              <p className="text-2xl font-extrabold font-serif text-emerald-600 mt-1">
                {farmerAnalytics ? farmerAnalytics.completed_orders : 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Verified & collected</p>
            </div>
          </div>

          {/* Charts Row 1: Daily Revenue Trend + Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-extrabold font-serif text-slate-900 text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> 7-Day Revenue Trend
                  </h4>
                  <p className="text-xs text-slate-400">Daily earnings from customer pre-orders</p>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={farmerAnalytics?.revenue_by_day || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="farmerRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2d6a4f" strokeWidth={2.5} fill="url(#farmerRevGrad)" dot={{ r: 3, fill: '#2d6a4f' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-brand-600" /> Order Status Share
              </h4>
              <p className="text-xs text-slate-400 mb-3">Breakdown by current fulfillment state</p>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={farmerAnalytics?.status_breakdown ? Object.entries(farmerAnalytics.status_breakdown).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })) : []}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    paddingAngle={3} dataKey="value"
                  >
                    {Object.keys(farmerAnalytics?.status_breakdown || {}).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2: Top Selling Products + Inventory Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Top Selling Harvest Items
              </h4>
              <p className="text-xs text-slate-400 mb-4">Ranked by gross sales volume ($)</p>
              {farmerAnalytics?.top_products?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={farmerAnalytics.top_products} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#52b788" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
                  No sales recorded yet. Once orders are placed, performance will appear here.
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" /> Harvest Stock & Reservation Status
              </h4>
              <p className="text-xs text-slate-400 mb-4">Available vs Reserved for pending customer orders</p>
              {farmerAnalytics?.stock_health?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={farmerAnalytics.stock_health.slice(0, 6)} margin={{ left: -15, right: 10, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="available" fill="#2d6a4f" radius={[4, 4, 0, 0]} name="Available Stock" />
                    <Bar dataKey="reserved_quantity" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Reserved (Pre-orders)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
                  No active products in inventory.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Customer Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-14 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500">
              No customer reviews submitted yet.
            </div>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="card-hover p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.customer_name}</span>
                    {rev.verified_purchase && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{rev.comment}</p>

                {rev.farmer_response ? (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl text-xs border border-emerald-100">
                    <strong>Your Response:</strong> {rev.farmer_response}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Type response to customer..."
                      value={farmerResponseText[rev.id] || ''}
                      onChange={e => setFarmerResponseText({ ...farmerResponseText, [rev.id]: e.target.value })}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      onClick={() => handlePostReviewResponse(rev.id)}
                      className="px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Stall & Schedule Settings */}
      {activeTab === 'stall_settings' && (
        <div className="max-w-2xl bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-extrabold font-serif text-slate-900">Stall & Pickup Schedule Settings</h3>
            <p className="text-xs text-slate-500">Configure your farm stall display, operating days, pickup time windows, and map pin location.</p>
          </div>

          {stallSaved && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Stall profile and pickup schedules updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveStallSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stall Display Name</label>
              <input
                type="text"
                value={stallForm.stall_name}
                onChange={e => setStallForm({ ...stallForm, stall_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Time Window</label>
              <input
                type="text"
                value={stallForm.pickup_time_windows}
                onChange={e => setStallForm({ ...stallForm, pickup_time_windows: e.target.value })}
                placeholder="e.g. 8:00 AM - 2:00 PM"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={stallForm.contact_number}
                onChange={e => setStallForm({ ...stallForm, contact_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stall Latitude (Map Pin)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={stallForm.latitude}
                  onChange={e => setStallForm({ ...stallForm, latitude: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stall Longitude (Map Pin)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={stallForm.longitude}
                  onChange={e => setStallForm({ ...stallForm, longitude: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stall Bio & Story</label>
              <textarea
                rows={3}
                value={stallForm.bio}
                onChange={e => setStallForm({ ...stallForm, bio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Save Stall Settings
            </button>
          </form>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold font-serif text-slate-900 text-lg">
                {editingProduct ? 'Edit Harvest Product' : 'Add New Harvest Item'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={productForm.category}
                  onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                >
                  <option value="Organic Vegetables">Organic Vegetables</option>
                  <option value="Fresh Fruits & Berries">Fresh Fruits & Berries</option>
                  <option value="Artisan Dairy & Cheese">Artisan Dairy & Cheese</option>
                  <option value="Fresh Bakery & Grains">Fresh Bakery & Grains</option>
                  <option value="Poultry & Eggs">Poultry & Eggs</option>
                  <option value="Honey, Jams & Preserves">Honey, Jams & Preserves</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Price ($)"
                  value={productForm.price}
                  onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Unit Type (per lb)"
                  value={productForm.unit}
                  onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                />
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={productForm.stock_quantity}
                  onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                />
              </div>

              <textarea
                placeholder="Description"
                value={productForm.description}
                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                rows="3"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Product Image</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleProductImageSelect}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-100 file:text-emerald-800 file:font-bold"
                />
                <p className="text-xs text-slate-500">Select an image from your computer. JPG, PNG, or WebP; maximum 2 MB.</p>
                {productForm.image_url && (
                  <div className="relative w-36">
                    <img src={productForm.image_url} alt="Product preview" className="w-36 h-28 object-cover rounded-xl border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setProductForm(current => ({ ...current, image_url: '' }))}
                      className="mt-2 text-xs font-bold text-red-600"
                    >Remove image</button>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-3.5 bg-brand-700 text-white font-bold rounded-2xl">
                Save Produce Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Verifier Dialog */}
      {showQRScanner && (
        <QRModal isFarmerScanner={true} onClose={() => setShowQRScanner(false)} onVerified={loadFarmerData} />
      )}

    </div>
  );
};
