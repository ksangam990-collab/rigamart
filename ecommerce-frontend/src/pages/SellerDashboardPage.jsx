import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  Package,
  Layers,
  AlertTriangle,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';
import api from '../utils/api.js';
import RestockModal from '../components/seller/RestockModal.jsx';
import AddProductModal from '../components/seller/AddProductModal.jsx';

export default function SellerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null); // { product, variant }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, prodRes, ordRes] = await Promise.all([
        api.get('/seller/dashboard').catch(() => ({ data: { data: null } })),
        api.get('/seller/products').catch(() => ({ data: { data: { products: [] } } })),
        api.get('/seller/orders').catch(() => ({ data: { data: { orders: [] } } }))
      ]);

      setDashboardData(dashRes.data.data?.metrics || null);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-xs text-gray-500 font-medium">Loading Seller Central dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-600" />
            Seller Central Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time sales analytics, catalog inventory control, and order fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-gray-600 hover:text-indigo-600 border border-gray-200 rounded-xl hover:bg-gray-50"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            List New Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{(dashboardData?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Gross seller sales volume</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfilled Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {dashboardData?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Customer orders received</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Listings</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {dashboardData?.totalProducts || products.length || 0}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Live marketplace products</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Low Stock Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {dashboardData?.lowStockCount ?? dashboardData?.lowStockProducts ?? 0}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">Items with &le; 5 units left</p>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="border-b border-gray-200 flex gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition-colors ${
            activeTab === 'products'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-indigo-600 text-indigo-600 font-black'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Seller Orders ({orders.length})
        </button>
      </div>

      {/* Products Table View */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Base Price</th>
                  <th className="py-3.5 px-4">Variants & Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400">
                      No products listed yet. Click "List New Product" to start selling.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const img =
                      prod.images?.[0]?.url ||
                      prod.images?.[0] ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';

                    return (
                      <tr key={prod._id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img
                            src={img}
                            alt={prod.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{prod.name}</div>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {prod._id.slice(-6)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">
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
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              prod.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {prod.isActive ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            {prod.variants?.map((v) => (
                              <button
                                key={v._id}
                                onClick={() => setRestockTarget({ product: prod, variant: v })}
                                className="px-2 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded transition-colors"
                              >
                                Restock {v.sku}
                              </button>
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
        </div>
      )}

      {/* Orders Table View */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
                    <tr key={ord._id} className="hover:bg-gray-50/50">
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
                        <span className="font-bold text-[10px] uppercase text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:border-indigo-600 font-medium"
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
        </div>
      )}

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
