import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  ArrowRight,
  Download
} from 'lucide-react';
import api from '../utils/api.js';
import { staggerContainer, staggerItem } from '../utils/animations.js';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data?.orders || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingId(orderId);
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rigamart_Invoice_${orderId.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download PDF invoice.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation' });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Order Confirmed
          </span>
        );
      case 'Placed':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-300">
            <AlertCircle className="w-3.5 h-3.5" /> Returned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
            <Clock className="w-3.5 h-3.5" /> {status || 'Placed'}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center shadow-inner"
        >
          <Package className="w-10 h-10" />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">No Orders Placed Yet</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          You haven't completed any orders yet. Discover verified factory deals in our curated catalog!
        </p>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="pt-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Explore Catalog Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-600" />
          My Orders & Shipments
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track packages, download tax invoices, and manage post-purchase returns
        </p>
      </div>

      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {orders.map((order) => {
          const items = order.items || [];
          const isCancellable = ['Placed', 'Confirmed'].includes(order.status);
          const paymentMethod = order.paymentInfo?.method || order.paymentMethod || 'N/A';

          return (
            <motion.div
              key={order._id}
              variants={staggerItem}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Order Header Card */}
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Order ID</span>
                    <span className="font-mono font-bold text-gray-800">#{order._id.slice(-8)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Placed On</span>
                    <span className="font-medium text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Total Amount</span>
                    <span className="font-black text-gray-900">
                      ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">Payment</span>
                    <span className="font-bold text-brand-700 uppercase">{paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleDownloadInvoice(order._id)}
                    disabled={downloadingId === order._id}
                    className="p-2 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Download Tax Invoice (PDF)"
                  >
                    {downloadingId === order._id ? (
                      <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Invoice</span>
                  </motion.button>
                </div>
              </div>

              {/* Order Items List */}
              <div className="divide-y divide-gray-100 p-6 space-y-4">
                {items.map((item, idx) => {
                  const product = item.product || {};
                  const imageUrl =
                    product.images?.[0]?.url ||
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';

                  return (
                    <div key={idx} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                      <div className="flex items-center gap-4">
                        <img
                          src={imageUrl}
                          alt={product.name || 'Ordered Product'}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                        />
                        <div>
                          <Link
                            to={`/products/${product._id || item.productId}`}
                            className="text-xs font-bold text-gray-900 hover:text-brand-600 line-clamp-1 transition-colors"
                          >
                            {product.name || item.name || 'Product Item'}
                          </Link>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Qty: <strong className="text-gray-800">{item.quantity}</strong> &times; ₹
                            {(item.price || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-gray-900">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Footer & Actions */}
              {isCancellable && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCancelOrder(order._id)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
                  >
                    Cancel Order
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
