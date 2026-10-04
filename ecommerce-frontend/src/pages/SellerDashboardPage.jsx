import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  DollarSign,
  Package,
  Layers,
  AlertTriangle,
  Plus,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import api from '../utils/api.js';
import RestockModal from '../components/seller/RestockModal.jsx';
import AddProductModal from '../components/seller/AddProductModal.jsx';
import SellerAnalyticsTab from '../components/seller/SellerAnalyticsTab.jsx';
import { staggerContainer, staggerItem } from '../utils/animations.js';

export default function SellerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, prodRes, ordRes] = await Promise.all([
        api.get('/seller/dashboard').catch(() => ({ data: { data: null } })),
        api.get('/seller/products').catch(() => ({ data: { data: { products: [] } } })),
        api.get('/seller/orders').catch(() => ({ data: { data: { orders: [] } } }))
      ]);

      setDashboardData(dashRes.data.data?.metrics || null);
      setStatusCounts(dashRes.data.data?.statusCounts || {});
      setProducts(prodRes.data.data?.products || []);
      setOrders(ordRes.data.data?.orders || []);
    } catch (e) {
      // Gracefully handle initial loads
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleStockUpdated = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-64" />
            <div className="h-3 bg-gray-200 rounded w-96" />
          </div>
          <div className="h-9 bg-gray-200 rounded-xl w-36" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-7 bg-gray-200 rounded w-28" />
              <div className="h-2.5 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Sales Volume',
      value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString('en-IN')}`,
      desc: 'Gross merchant revenue',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: '+Verified'
    },
    {
      title: 'Customer Orders',
      value: dashboardData?.totalOrders || 0,
      desc: 'Orders placed with your store',
      icon: Package,
      iconBg: 'bg-brand-50 text-brand-600',
      badge: 'Live'
    },
    {
      title: 'Active Listings',
      value: dashboardData?.totalProducts || products.length || 0,
      desc: 'Published products in catalog',
      icon: Layers,
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'Catalog'
    },
    {
      title: 'Low Stock Warnings',
      value: dashboardData?.lowStockCount ?? dashboardData?.lowStockProducts ?? 0,
      desc: 'SKUs with ≤ 5 units remaining',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'Urgent',
      isWarning: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-600" />
            Seller Central Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time merchant sales performance, inventory management, and order fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={fetchData}
            className="p-2.5 text-gray-600 hover:text-brand-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            List New Product
          </motion.button>
        </div>
      </div>

      {/* Stripe-Grade KPI Metrics Grid */}
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
              <div
                className={`text-2xl font-black ${
                  kpi.isWarning ? 'text-amber-600' : 'text-gray-900'
                }`}
              >
                {kpi.value}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <p className="text-[11px] text-gray-500 font-medium">{kpi.desc}</p>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    kpi.isWarning
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
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
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'text-brand-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Sales & Analytics
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="sellerTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'products'
              ? 'text-brand-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My Products ({products.length})
          {activeTab === 'products' && (
            <motion.div
              layoutId="sellerTab"
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
          Seller Orders ({orders.length})
          {activeTab === 'orders' && (
            <motion.div
              layoutId="sellerTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
            />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div
            key="products"
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
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Base Price</th>
                    <th className="py-3.5 px-4">Variants & Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Inventory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400">
                        No products listed yet. Click "List New Product" above to publish your first item.
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => {
                      const img =
                        prod.images?.[0]?.url ||
                        prod.images?.[0] ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';

                      return (
                        <tr key={prod._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-4 flex items-center gap-3">
                            <img
                              src={img}
                              alt={prod.name}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-900">{prod.name}</div>
                              <span className="text-[10px] text-gray-400 font-mono">ID: #{prod._id.slice(-6)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-black text-gray-900">
                            ₹{(prod.basePrice || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              {prod.variants?.map((v) => (
                                <div key={v._id} className="flex items-center gap-2 text-[11px]">
                                  <span className="font-mono text-gray-600">{v.sku}:</span>
                                  <span
                                    className={`font-bold ${
                                      v.stock <= 5 ? 'text-amber-600' : 'text-emerald-700'
                                    }`}
                                  >
                                    {v.stock} units
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${prod.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {prod.isActive ? 'Active' : 'Archived'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              {prod.variants?.map((v) => (
                                <motion.button
                                  key={v._id}
                                  whileTap={{ scale: 0.94 }}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => setRestockTarget({ product: prod, variant: v })}
                                  className="px-2.5 py-1 text-[10px] font-bold bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-lg transition-colors shadow-2xs"
                                >
                                  Restock {v.sku}
                                </motion.button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
                    <th className="py-3.5 px-4">Customer Destination</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-right">Update Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400">
                        No incoming customer orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-gray-800">
                          #{ord._id.slice(-8)}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          <div className="font-bold text-gray-900">{ord.shippingAddress?.name}</div>
                          <div className="text-[11px] text-gray-400">
                            {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-black text-gray-900">
                          ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-[10px] uppercase text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-brand-600 font-medium cursor-pointer"
                          >
                            <option value="Placed" disabled>Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
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

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <SellerAnalyticsTab statusCounts={statusCounts} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Restock Modal */}
      <RestockModal
        isOpen={Boolean(restockTarget)}
        onClose={() => setRestockTarget(null)}
        product={restockTarget?.product}
        variant={restockTarget?.variant}
        onStockUpdated={handleStockUpdated}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onProductCreated={fetchData}
      />
    </div>
  );
}
