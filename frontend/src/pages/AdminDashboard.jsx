import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, Store, Package, DollarSign, CheckCircle2, XCircle,
  Plus, Trash2, Megaphone, BarChart3, Edit, RefreshCw, Terminal,
  AlertTriangle, Download, ArrowUpRight, Star, Tag, FileText, TrendingDown, TrendingUp,
  Award, PieChart as PieChartIcon
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#2d6a4f', '#52b788', '#b7e4c7', '#f59e0b', '#dc2626', '#6366f1'];


export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('farmers'); // farmers, customers, markets, analytics, categories, reviews, audit, announcements
  const [loading, setLoading] = useState(true);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Market Modal State
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [marketForm, setMarketForm] = useState({
    name: '',
    address: '',
    operating_days: ['Saturday', 'Sunday'],
    operating_hours: '8:00 AM - 3:00 PM',
    latitude: 40.7829,
    longitude: -73.9654,
    description: '',
    image_url: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, uRes, mRes, aRes, anRes, revRes, catRes] = await Promise.all([
        fetchAPI('/admin/stats'),
        fetchAPI('/admin/users'),
        fetchAPI('/markets'),
        fetchAPI('/audit/logs').catch(() => []),
        fetchAPI('/admin/analytics').catch(() => null),
        fetchAPI('/reviews').catch(() => []),
        fetchAPI('/admin/categories').catch(() => [])
      ]);
      setStats(sRes);
      setUsersList(uRes);
      setMarkets(mRes);
      setAuditLogs(aRes);
      setAnalytics(anRes);
      setReviews(revRes);
      setCategories(catRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await fetchAPI(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveMarket = async (e) => {
    e.preventDefault();
    try {
      await fetchAPI('/markets', {
        method: 'POST',
        body: JSON.stringify(marketForm)
      });
      setShowMarketModal(false);
      setMarketForm({ name: '', address: '', operating_days: ['Saturday', 'Sunday'], operating_hours: '8:00 AM - 3:00 PM', latitude: 40.7829, longitude: -73.9654, description: '', image_url: '' });
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMarket = async (marketId) => {
    if (!window.confirm('Are you sure you want to remove this market?')) return;
    try {
      await fetchAPI(`/markets/${marketId}`, { method: 'DELETE' });
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await fetchAPI('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      setNewCatName('');
      setNewCatDesc('');
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await fetchAPI(`/reviews/${reviewId}`, { method: 'DELETE' });
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    try {
      await fetchAPI('/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: annTitle, content: annContent })
      });
      setAnnTitle('');
      setAnnContent('');
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/export?format=csv', '_blank');
  };

  const handleExportJSON = () => {
    window.open('/api/admin/export?format=json', '_blank');
  };

  const farmers = usersList.filter(u => u.role === 'Farmer');
  const customers = usersList.filter(u => u.role === 'Customer');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="relative overflow-hidden bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> System Administration
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif mt-1">Admin Command Center</h1>
          <p className="text-xs text-slate-300 mt-1">Platform management, farmer approvals, analytics, moderation, and audit logs.</p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Orders CSV
          </button>
          <button
            onClick={loadAdminData}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card-hover p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Total Farmers</p>
              <p className="text-2xl font-extrabold font-serif text-slate-900">{stats.total_farmers}</p>
              <p className="text-[10px] text-amber-600 font-semibold">{stats.pending_farmers_count} Pending Review</p>
            </div>
          </div>

          <div className="card-hover p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Registered Customers</p>
              <p className="text-2xl font-extrabold font-serif text-slate-900">{stats.total_customers}</p>
            </div>
          </div>

          <div className="card-hover p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center"><Store className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Active Markets</p>
              <p className="text-2xl font-extrabold font-serif text-slate-900">{stats.total_markets}</p>
            </div>
          </div>

          <div className="card-hover p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center"><Package className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Listed Produce</p>
              <p className="text-2xl font-extrabold font-serif text-slate-900">{stats.total_products}</p>
            </div>
          </div>

          <div className="card-hover p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase">Platform Pre-Order Volume</p>
              <p className="text-2xl font-extrabold font-serif text-slate-900">${stats.total_revenue?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/70 overflow-x-auto">
        <button
          onClick={() => setActiveTab('farmers')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'farmers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Farmer Approvals ({farmers.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'customers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('markets')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'markets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Markets ({markets.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-brand-600" /> Advanced Analytics & Reports
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-blue-600" /> Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'reviews' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500" /> Content Moderation
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-brand-600" /> Security Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-white/70'
          }`}
        >
          Announcements
        </button>
      </div>

      {/* Tab 1: Farmer Registrations & Approvals */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="p-4">Farmer / Stall Name</th>
                <th className="p-4">Contact & Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {farmers.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{f.stall_name || f.name}</p>
                    <p className="text-[11px] text-slate-400">{f.name}</p>
                  </td>
                  <td className="p-4 text-slate-600">
                    <p>{f.email}</p>
                    <p className="text-[11px] text-slate-400">{f.contact_number}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      f.status === 'approved' ? 'bg-emerald-100 text-brand-800' :
                      f.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {f.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateUserStatus(f.id, 'approved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Approve Stall
                      </button>
                    )}
                    {f.status !== 'suspended' && (
                      <button
                        onClick={() => handleUpdateUserStatus(f.id, 'suspended')}
                        className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Customers Management */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{c.name}</td>
                  <td className="p-4 text-slate-600">{c.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      c.status === 'active' ? 'bg-emerald-100 text-brand-800' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {c.status === 'active' ? (
                      <button
                        onClick={() => handleUpdateUserStatus(c.id, 'deactivated')}
                        className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold text-xs"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateUserStatus(c.id, 'active')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Markets Management */}
      {activeTab === 'markets' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowMarketModal(true)}
            className="px-6 py-3 rounded-2xl bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add New Farmers Market
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {markets.map(m => (
              <div key={m.id} className="card-hover p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <img src={m.image_url} alt={m.name} className="w-full h-32 object-cover rounded-2xl bg-slate-100" />
                <h4 className="font-bold text-slate-900 text-base">{m.name}</h4>
                <p className="text-xs text-slate-500">{m.address}</p>
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  {m.operating_days?.join(', ')} • {m.operating_hours}
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteMarket(m.id)}
                    className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Advanced Analytics & Reports */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Avg Order Value', value: `$${analytics.average_order_value}`, color: 'text-slate-900' },
              { label: 'Repeat Purchase Rate', value: analytics.repeat_purchase_rate, color: 'text-emerald-700' },
              { label: 'Cancellation Rate', value: analytics.cancellation_rate, color: 'text-amber-700' },
              { label: 'Pickup Completion', value: analytics.pickup_completion_rate, color: 'text-blue-700' },
              { label: 'Total Revenue', value: `$${analytics.total_revenue?.toFixed(2)}`, color: 'text-brand-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                <p className={`text-xl font-extrabold font-serif mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Row 1: Revenue Trend + Order Status Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold font-serif text-slate-900 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Revenue Trend (7 Days)
                </h4>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics.sales_trend || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2d6a4f" fill="url(#revenueGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#2d6a4f' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-4 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-brand-600" /> Order Status
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analytics.order_status_breakdown ? Object.entries(analytics.order_status_breakdown).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })) : []}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {Object.keys(analytics.order_status_breakdown || {}).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Top Products + Revenue by Farmer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-4 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" /> Top Products (Units Sold)
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.top_products || []} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="units" fill="#52b788" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-4 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Top Farmer Revenue
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.revenue_by_farmer || []} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <YAxis dataKey="farmer_name" type="category" tick={{ fontSize: 9 }} width={90} />
                  <Tooltip formatter={v => [`$${v}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#2d6a4f" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Market Activity + Customer Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-4 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-indigo-500" /> Market Activity
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.market_activity || []} margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="market_name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="order_count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-extrabold font-serif text-slate-900 text-sm mb-4 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" /> New Customer Growth
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.customer_growth || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="new_customers" stroke="#6366f1" fill="url(#custGrad)" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Export */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="font-extrabold font-serif text-slate-900 text-base mb-1">Export Raw Reports</h4>
            <p className="text-xs text-slate-500 mb-3">Download formatted reports of pre-orders, farmer payouts, and pickup logs.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleExportCSV} className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4 text-emerald-400" /> Export CSV
              </button>
              <button onClick={handleExportJSON} className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors">
                <FileText className="w-4 h-4 text-brand-600" /> Export JSON
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Tab 5: Categories Management */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs max-w-xl space-y-3">
            <h4 className="font-extrabold font-serif text-slate-900 text-base">Add New Produce Category</h4>
            <input
              type="text"
              placeholder="Category Name (e.g. Organic Mushrooms & Herbs)"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newCatDesc}
              onChange={e => setNewCatDesc(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl">
              Add Category
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map(c => (
              <div key={c.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <h5 className="font-bold text-slate-900 text-sm">{c.name}</h5>
                <p className="text-xs text-slate-400 mt-0.5">{c.description || 'Produce Category'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Content & Review Moderation */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h4 className="font-extrabold font-serif text-slate-900 text-base">Customer Review Moderation</h4>
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No customer reviews to moderate.</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">{r.customer_name}</span>
                    <span className="text-amber-500 font-bold inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {r.rating}
                    </span>
                    {r.verified_purchase && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                    {r.is_flagged && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" /> Flagged Spam
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{r.comment}</p>
                </div>

                <button
                  onClick={() => handleDeleteReview(r.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl shrink-0"
                >
                  Remove Review
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 7: System Audit & Security Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="font-bold font-serif text-slate-900 text-base flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-600" /> Platform Security & Audit Trail
          </h3>

          <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 flex items-center justify-between transition-colors">
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <p className="text-[11px] text-slate-500 font-sans">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <form onSubmit={handlePublishAnnouncement} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl">
            <h3 className="font-bold font-serif text-slate-900 text-base flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-brand-600" /> Broadcast Platform Announcement
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title</label>
              <input
                type="text"
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                required
                placeholder="e.g. Fall Harvest Apple Festival This Weekend!"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
              <textarea
                value={annContent}
                onChange={e => setAnnContent(e.target.value)}
                required
                rows="3"
                placeholder="Type platform announcement details..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs">
              Publish Announcement
            </button>
          </form>
        </div>
      )}

      {/* Add Market Modal */}
      {showMarketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold font-serif text-slate-900 text-lg">Add Farmers Market</h3>
            <form onSubmit={handleSaveMarket} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Market Name"
                value={marketForm.name}
                onChange={e => setMarketForm({ ...marketForm, name: e.target.value })}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input
                type="text"
                placeholder="Address"
                value={marketForm.address}
                onChange={e => setMarketForm({ ...marketForm, address: e.target.value })}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input
                type="text"
                placeholder="Operating Hours (e.g. 8:00 AM - 3:00 PM)"
                value={marketForm.operating_hours}
                onChange={e => setMarketForm({ ...marketForm, operating_hours: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={marketForm.image_url}
                onChange={e => setMarketForm({ ...marketForm, image_url: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowMarketModal(false)} className="flex-1 py-3 bg-slate-100 rounded-2xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand-700 text-white rounded-2xl font-bold">
                  Create Market
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
