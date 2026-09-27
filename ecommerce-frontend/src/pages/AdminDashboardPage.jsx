import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Store,
  Package,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import api from '../utils/api.js';
import { staggerContainer, staggerItem } from '../utils/animations.js';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, usersRes, prodRes, ordRes] = await Promise.all([
        api.get('/admin/dashboard').catch(() => ({ data: { data: null } })),
        api.get(`/admin/users?search=${encodeURIComponent(userSearch)}`).catch(() => ({ data: { data: { users: [] } } })),
        api.get('/admin/products').catch(() => ({ data: { data: { products: [] } } })),
        api.get('/admin/orders').catch(() => ({ data: { data: { orders: [] } } }))
      ]);

      setMetrics(dashRes.data.data || null);
      setUsers(usersRes.data.data?.users || []);
      setProducts(prodRes.data.data?.products || []);
      setOrders(ordRes.data.data?.orders || []);
    } catch (e) {
      // Gracefully handle initial loads
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userSearch]);

  const handleToggleBan = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/ban`, { isBanned: !user.isBanned });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ban status');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleProductStatus = async (product) => {
    try {
      await api.patch(`/admin/products/${product._id}/status`, { isActive: !product.isActive });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle product status');
    }
  };

  const handleOrderOverride = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to override order status');
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-72" />
            <div className="h-3 bg-gray-200 rounded w-96" />
          </div>
          <div className="h-9 bg-gray-200 rounded-xl w-10" />
        </div>

        {/* KPI Overview Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-7 bg-gray-200 rounded w-32" />
              <div className="h-2.5 bg-gray-200 rounded w-40" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-64 mb-6" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Gross Platform GMV',
      value: `₹${(metrics?.financials?.totalGMV || 0).toLocaleString('en-IN')}`,
      desc: 'All marketplace transactions',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'Financials'
    },
    {
      title: 'Platform Orders',
      value: metrics?.orders?.total || 0,
      desc: 'Placed across verified merchants',
      icon: Package,
      iconBg: 'bg-brand-50 text-brand-600',
      badge: 'Orders'
    },
    {
      title: 'Registered Users',
      value: metrics?.users?.total || users.length || 0,
      desc: 'Customer & merchant accounts',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'Accounts'
    },
    {
      title: 'Active Merchants',
      value: metrics?.users?.breakdown?.seller || 0,
      desc: 'Verified multi-vendor stores',
      icon: Store,
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'Sellers'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            Platform Administration & Moderation
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Platform GMV, marketplace users, catalog moderation, and administrative overrides
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={fetchAdminData}
          className="p-2.5 text-gray-600 hover:text-brand-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs self-start sm:self-auto"
          title="Refresh platform KPIs"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Stripe-Grade KPI Overview Cards */}
      <motion.div
        variants={staggerContainer(0.05)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              variants={staggerItem}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{kpi.value}</div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <p className="text-[11px] text-gray-500 font-medium">{kpi.desc}</p>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {kpi.badge}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tabs Controller */}
      <div className="border-b border-gray-200 flex gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'users'
              ? 'text-brand-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          User Moderation ({users.length})
          {activeTab === 'users' && (
            <motion.div
              layoutId="adminTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'catalog'
              ? 'text-brand-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Catalog Moderation ({products.length})
          {activeTab === 'catalog' && (
            <motion.div
              layoutId="adminTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'orders'
              ? 'text-brand-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Platform Orders ({orders.length})
          {activeTab === 'orders' && (
            <motion.div
              layoutId="adminTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
            />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* User Search Input */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-500 shadow-sm transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Email Address</th>
                      <th className="py-3.5 px-4">Account Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-gray-400">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900">{u.name}</td>
                          <td className="py-3.5 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase text-gray-700 outline-none focus:border-brand-500 cursor-pointer"
                            >
                              <option value="customer">customer</option>
                              <option value="seller">seller</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isBanned
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                              {u.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={() => handleToggleBan(u)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors shadow-2xs ${
                                u.isBanned
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {u.isBanned ? 'Unban Account' : 'Ban User'}
                            </motion.button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Brand</th>
                    <th className="py-3.5 px-4">Seller Attribution</th>
                    <th className="py-3.5 px-4">Base Price</th>
                    <th className="py-3.5 px-4">Marketplace Status</th>
                    <th className="py-3.5 px-4 text-right">Toggle Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">
                        No products found in marketplace catalog.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{p.name}</td>
                        <td className="py-3.5 px-4 text-gray-500">{p.brand}</td>
                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {p.seller?.name || 'Verified Merchant'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          ₹{(p.basePrice || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {p.isActive ? 'Active Publicly' : 'Suspended / Hidden'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleToggleProductStatus(p)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors shadow-2xs ${
                              p.isActive
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {p.isActive ? 'Deactivate' : 'Publish Live'}
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Buyer Name</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">
                        No platform orders recorded.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                          #{ord._id.slice(-8)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 font-medium">
                          {ord.user?.name || ord.shippingAddress?.name || 'Customer'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-brand-600 uppercase">
                          {ord.paymentInfo?.method || ord.paymentMethod || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-800">{ord.status}</td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) => handleOrderOverride(ord._id, e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-brand-600 font-medium cursor-pointer"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Returned">Returned</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
