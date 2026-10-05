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
import { Button, Badge } from '../components/ui/index.js';
import { staggerContainer, staggerItem } from '../utils/animations.js';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

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
      // Graceful fallback
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
      <div className="min-h-screen bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
          <div className="flex justify-between items-center pb-4 border-b border-line">
            <div className="space-y-2">
              <div className="h-7 bg-line/60 rounded-lg w-72" />
              <div className="h-3.5 bg-line/40 rounded w-96" />
            </div>
            <div className="h-9 bg-line/60 rounded-xl w-10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface p-5 rounded-none border border-line space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 bg-line/40 rounded-sm w-24" />
                  <div className="w-8 h-8 bg-line/40 rounded-sm" />
                </div>
                <div className="h-7 bg-line/60 rounded-sm w-32" />
                <div className="h-2.5 bg-line/40 rounded-sm w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Gross Platform GMV',
      value: formatCurrency(metrics?.financials?.totalGMV || 0),
      desc: 'All platform sales volume',
      icon: TrendingUp,
      iconBg: 'bg-brand-soft text-brand-dark',
      badge: 'Financials'
    },
    {
      title: 'Platform Orders',
      value: (metrics?.orders?.total || orders.length || 0).toLocaleString('en-IN'),
      desc: 'Placed across verified merchants',
      icon: Package,
      iconBg: 'bg-brand-soft text-brand-dark',
      badge: 'Orders'
    },
    {
      title: 'Registered Users',
      value: (metrics?.users?.total || users.length || 0).toLocaleString('en-IN'),
      desc: 'Customer & merchant accounts',
      icon: Users,
      iconBg: 'bg-canvas text-ink',
      badge: 'Accounts'
    },
    {
      title: 'Active Merchants',
      value: (metrics?.users?.breakdown?.seller || 0).toLocaleString('en-IN'),
      desc: 'Verified multi-vendor stores',
      icon: Store,
      iconBg: 'bg-canvas text-ink',
      badge: 'Sellers'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-brand" />
              Platform Administration
            </h1>
            <p className="text-xs text-muted mt-1">
              Marketplace gross revenue, account access moderation, catalog management, and order overrides.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            title="Refresh platform KPIs"
            className="text-muted hover:text-ink self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* KPI Overview Cards */}
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="bg-surface p-5 rounded-none border border-line space-y-3 hover:border-ink transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                    {kpi.title}
                  </span>
                  <div className={`w-8 h-8 rounded-sm ${kpi.iconBg} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-ink tabular-nums font-mono">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-line/60">
                  <p className="text-[11px] text-muted">{kpi.desc}</p>
                  <Badge variant="secondary" size="sm">
                    {kpi.badge}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs Controller */}
        <div className="border-b border-line flex gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'text-brand font-black'
                : 'text-muted hover:text-ink'
            }`}
          >
            User Moderation ({users.length})
            {activeTab === 'users' && (
              <motion.div
                layoutId="adminTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'text-brand font-black'
                : 'text-muted hover:text-ink'
            }`}
          >
            Catalog Moderation ({products.length})
            {activeTab === 'catalog' && (
              <motion.div
                layoutId="adminTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'text-brand font-black'
                : 'text-muted hover:text-ink'
            }`}
          >
            Platform Orders ({orders.length})
            {activeTab === 'orders' && (
              <motion.div
                layoutId="adminTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
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
                  className="w-full bg-surface pl-9 pr-4 py-2 border border-line rounded text-xs text-ink outline-none focus:border-brand transition-all placeholder:text-muted"
                />
                <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              </div>

              <div className="bg-surface rounded-none border border-line overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-canvas text-muted uppercase tracking-wider font-bold border-b border-line text-[10px] font-mono">
                      <tr>
                        <th className="py-3 px-5">User</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Account Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-5 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-muted">
                            No users found matching query.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id} className="hover:bg-canvas/50 transition-colors h-14">
                            <td className="py-3 px-5 font-bold text-ink">{u.name}</td>
                            <td className="py-3 px-4 text-muted">{u.email}</td>
                            <td className="py-3 px-4">
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                className="bg-surface border border-line rounded px-2 py-1 text-[11px] font-bold uppercase text-ink outline-none focus:border-brand cursor-pointer"
                              >
                                <option value="customer">customer</option>
                                <option value="seller">seller</option>
                                <option value="admin">admin</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={u.isBanned ? 'danger' : 'success'} size="sm">
                                {u.isBanned ? 'Banned' : 'Active'}
                              </Badge>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <Button
                                variant={u.isBanned ? 'outline' : 'danger'}
                                size="sm"
                                onClick={() => handleToggleBan(u)}
                                className="text-xs font-bold"
                              >
                                {u.isBanned ? 'Unban Account' : 'Ban User'}
                              </Button>
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
              className="bg-surface rounded-none border border-line overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-canvas text-muted uppercase tracking-wider font-bold border-b border-line text-[10px] font-mono">
                    <tr>
                      <th className="py-3 px-5">Product Name</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Seller Attribution</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Marketplace Status</th>
                      <th className="py-3 px-5 text-right">Toggle Visibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-muted">
                          No products found in marketplace catalog.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p._id} className="hover:bg-canvas/50 transition-colors h-14">
                          <td className="py-3 px-5 font-bold text-ink">{p.name}</td>
                          <td className="py-3 px-4 text-muted">{p.brand}</td>
                          <td className="py-3 px-4 text-ink font-medium">
                            {p.seller?.name || 'Verified Merchant'}
                          </td>
                          <td className="py-3 px-4 font-bold text-ink tabular-nums font-mono">
                            {formatCurrency(p.basePrice || 0)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={p.isActive ? 'success' : 'danger'} size="sm">
                              {p.isActive ? 'Active Publicly' : 'Suspended'}
                            </Badge>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <Button
                              variant={p.isActive ? 'danger' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleProductStatus(p)}
                              className="text-xs"
                            >
                              {p.isActive ? 'Deactivate' : 'Publish Live'}
                            </Button>
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
              className="bg-surface rounded-none border border-line overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-canvas text-muted uppercase tracking-wider font-bold border-b border-line text-[10px] font-mono">
                    <tr>
                      <th className="py-3 px-5">Order ID</th>
                      <th className="py-3 px-4">Buyer Name</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Admin Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-muted">
                          No platform orders recorded.
                        </td>
                      </tr>
                    ) : (
                      orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-canvas/50 transition-colors h-14">
                          <td className="py-3 px-5 font-mono font-bold text-ink">
                            #{ord.orderNumber || ord._id.slice(-8)}
                          </td>
                          <td className="py-3 px-4 text-ink font-medium">
                            {ord.user?.name || ord.shippingAddress?.name || 'Customer'}
                          </td>
                          <td className="py-3 px-4 font-bold text-ink tabular-nums font-mono">
                            {formatCurrency(ord.totalAmount || 0)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" size="sm">
                              {ord.paymentInfo?.method || ord.paymentMethod || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" size="sm">
                              {ord.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderOverride(ord._id, e.target.value)}
                              className="bg-surface border border-line rounded px-2.5 py-1 text-xs text-ink outline-none focus:border-brand font-medium cursor-pointer"
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
    </div>
  );
}
