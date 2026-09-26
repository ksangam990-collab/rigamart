import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Store,
  Package,
  RefreshCw,
  Loader2,
  Search
} from 'lucide-react';
import api from '../utils/api.js';

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-xs text-gray-500 font-medium">Loading Platform Administration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Platform Administration & Moderation
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Platform GMV, marketplace users, catalog moderation, and order status overrides
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2 text-gray-600 hover:text-emerald-600 border border-gray-200 rounded-xl hover:bg-gray-50 self-start sm:self-auto"
          title="Refresh platform KPIs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross GMV</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{(metrics?.financials?.totalGMV || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">All platform transactions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {metrics?.orders?.total || 0}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Orders placed across sellers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {metrics?.users?.total || users.length || 0}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Customer & seller accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Sellers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">
            {metrics?.users?.breakdown?.seller || 0}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Verified platform merchants</p>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="border-b border-gray-200 flex gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors ${
            activeTab === 'users'
              ? 'border-b-2 border-emerald-600 text-emerald-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          User Moderation ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 transition-colors ${
            activeTab === 'catalog'
              ? 'border-b-2 border-emerald-600 text-emerald-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Catalog Moderation ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-emerald-600 text-emerald-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Platform Orders ({orders.length})
        </button>
      </div>

      {/* Users Tab View */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search Input */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search user name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-white pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 shadow-sm"
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
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{u.name}</td>
                        <td className="py-3.5 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-[11px] font-bold uppercase text-gray-700 outline-none"
                          >
                            <option value="customer">customer</option>
                            <option value="seller">seller</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.isBanned
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleBan(u)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                              u.isBanned
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {u.isBanned ? 'Unban Account' : 'Ban User'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Tab View */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
                    <tr key={p._id} className="hover:bg-gray-50/50">
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
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {p.isActive ? 'Active Publicly' : 'Suspended / Hidden'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleProductStatus(p)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                            p.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {p.isActive ? 'Deactivate' : 'Publish Live'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab View */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
                    <tr key={ord._id} className="hover:bg-gray-50/50">
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
                          className="bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-emerald-600 font-medium"
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
        </div>
      )}
    </div>
  );
}
