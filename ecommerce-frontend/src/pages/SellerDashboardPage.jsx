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
  BarChart3,
  RotateCcw
} from 'lucide-react';
import api from '../utils/api.js';
import RestockModal from '../components/seller/RestockModal.jsx';
import AddProductModal from '../components/seller/AddProductModal.jsx';
import SellerAnalyticsTab from '../components/seller/SellerAnalyticsTab.jsx';
import SellerReturnsTab from '../components/seller/SellerReturnsTab.jsx';
import { Button, Badge } from '../components/ui/index.js';
import { staggerContainer, staggerItem } from '../utils/animations.js';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export default function SellerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, prodRes, ordRes, retRes] = await Promise.all([
        api.get('/seller/dashboard').catch(() => ({ data: { data: null } })),
        api.get('/seller/products').catch(() => ({ data: { data: { products: [] } } })),
        api.get('/seller/orders').catch(() => ({ data: { data: { orders: [] } } })),
        api.get('/seller/returns').catch(() => ({ data: { data: { returns: [] } } }))
      ]);

      setDashboardData(dashRes.data.data?.metrics || null);
      setStatusCounts(dashRes.data.data?.statusCounts || {});
      setProducts(prodRes.data.data?.products || []);
      setOrders(ordRes.data.data?.orders || []);
      setReturns(retRes.data.data?.returns || []);
    } catch (e) {
      // Graceful fallback
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

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
          <div className="flex justify-between items-center pb-4 border-b border-line">
            <div className="space-y-2">
              <div className="h-7 bg-line/60 rounded-lg w-64" />
              <div className="h-3.5 bg-line/40 rounded w-96" />
            </div>
            <div className="h-9 bg-line/60 rounded-xl w-36" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface p-5 rounded-none border border-line space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 bg-line/40 rounded-sm w-20" />
                  <div className="w-8 h-8 bg-line/40 rounded-sm" />
                </div>
                <div className="h-7 bg-line/60 rounded-sm w-28" />
                <div className="h-2.5 bg-line/40 rounded-sm w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Sales Volume',
      value: formatCurrency(dashboardData?.totalRevenue || 0),
      desc: 'Gross merchant revenue',
      icon: DollarSign,
      iconBg: 'bg-brand-soft text-brand-dark',
      badge: 'Verified'
    },
    {
      title: 'Customer Orders',
      value: (dashboardData?.totalOrders || 0).toLocaleString('en-IN'),
      desc: 'Orders placed with your store',
      icon: Package,
      iconBg: 'bg-brand-soft text-brand-dark',
      badge: 'Live'
    },
    {
      title: 'Active Listings',
      value: (dashboardData?.totalProducts || products.length || 0).toLocaleString('en-IN'),
      desc: 'Published items in catalog',
      icon: Layers,
      iconBg: 'bg-canvas text-ink',
      badge: 'Catalog'
    },
    {
      title: 'Low Stock Warnings',
      value: (dashboardData?.lowStockCount ?? dashboardData?.lowStockProducts ?? 0).toLocaleString('en-IN'),
      desc: 'SKUs with ≤ 5 units left',
      icon: AlertTriangle,
      iconBg: 'bg-accent-soft text-accent',
      badge: 'Attention',
      isWarning: (dashboardData?.lowStockCount ?? dashboardData?.lowStockProducts ?? 0) > 0
    }
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight flex items-center gap-2.5">
              <Store className="w-6 h-6 text-brand" />
              Seller Central Dashboard
            </h1>
            <p className="text-xs text-muted mt-1">
              Real-time merchant sales performance, inventory control, and fulfillment operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              title="Refresh metrics"
              className="text-muted hover:text-ink"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className=""
            >
              <Plus className="w-4 h-4 mr-1.5" />
              List New Product
            </Button>
          </div>
        </div>

        {/* KPI Metrics Grid */}
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
                <div
                  className={`text-2xl font-bold tracking-tight tabular-nums font-mono ${
                    kpi.isWarning ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-line/60">
                  <p className="text-[11px] text-muted">{kpi.desc}</p>
                  <Badge variant={kpi.isWarning ? 'warning' : 'secondary'} size="sm">
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
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'text-brand font-black'
                : 'text-muted hover:text-ink'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Sales & Analytics
            {activeTab === 'analytics' && (
              <motion.div
                layoutId="sellerTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'text-brand font-black'
                : 'text-muted hover:text-ink'
            }`}
          >
            My Products ({products.length})
            {activeTab === 'products' && (
              <motion.div
                layoutId="sellerTab"
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
            Store Orders ({orders.length})
            {activeTab === 'orders' && (
              <motion.div
                layoutId="sellerTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'returns'
                ? 'text-brand font-black'
                : 'text-muted hover:text-ink'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Returns &amp; Disputes
            {returns.length > 0 && (
              <Badge variant="warning" size="sm">
                {returns.length}
              </Badge>
            )}
            {activeTab === 'returns' && (
              <motion.div
                layoutId="sellerTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
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
              className="bg-surface rounded-none border border-line overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-canvas text-muted uppercase tracking-wider font-bold border-b border-line text-[10px] font-mono">
                    <tr>
                      <th className="py-3 px-5">Product Details</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Variants & Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Inventory Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-muted">
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
                          <tr key={prod._id} className="hover:bg-canvas/50 transition-colors h-14">
                            <td className="py-3 px-5 flex items-center gap-3">
                              <img
                                src={img}
                                alt={prod.name}
                                className="w-12 h-14 object-cover rounded-none border border-line shrink-0 bg-canvas"
                              />
                              <div>
                                <div className="font-bold text-ink">{prod.name}</div>
                                <span className="text-[10px] text-muted font-mono">ID: #{prod._id.slice(-6)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold text-ink tabular-nums font-mono">
                              {formatCurrency(prod.basePrice || 0)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                {prod.variants?.map((v) => (
                                   <div key={v._id} className="flex items-center gap-2 text-[11px]">
                                     <span className="font-mono text-muted">{v.sku}:</span>
                                     <span
                                       className={`font-semibold tabular-nums font-mono ${
                                         v.stock <= 5 ? 'text-accent font-bold' : 'text-ink'
                                       }`}
                                     >
                                       {v.stock} units
                                     </span>
                                   </div>
                                 ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={prod.isActive ? 'success' : 'danger'} size="sm">
                                {prod.isActive ? 'Active' : 'Archived'}
                              </Badge>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                {prod.variants?.map((v) => (
                                  <Button
                                    key={v._id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRestockTarget({ product: prod, variant: v })}
                                    className="text-[10px] py-1 px-2.5 h-auto"
                                  >
                                    Restock {v.sku}
                                  </Button>
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
              className="bg-surface rounded-none border border-line overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-canvas text-muted uppercase tracking-wider font-bold border-b border-line text-[10px] font-mono">
                    <tr>
                      <th className="py-3 px-5">Order ID</th>
                      <th className="py-3 px-4">Customer Destination</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-5 text-right">Fulfillment Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-muted">
                          No incoming customer orders yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-canvas/50 transition-colors h-14">
                          <td className="py-3 px-5 font-mono font-bold text-ink">
                            #{ord.orderNumber || ord._id.slice(-8)}
                          </td>
                          <td className="py-3 px-4 text-ink">
                            <div className="font-semibold">{ord.shippingAddress?.name}</div>
                            <div className="text-[11px] text-muted">
                              {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-ink tabular-nums font-mono">
                            {formatCurrency(ord.totalAmount || 0)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" size="sm">
                              {ord.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                              className="bg-surface border border-line rounded px-2.5 py-1 text-xs text-ink outline-none focus:border-brand font-medium cursor-pointer"
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

          {activeTab === 'returns' && (
            <motion.div
              key="returns"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SellerReturnsTab
                returns={returns}
                isLoading={isLoading}
                onRefresh={fetchData}
              />
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
    </div>
  );
}
