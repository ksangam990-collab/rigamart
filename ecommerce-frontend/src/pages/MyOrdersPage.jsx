import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  ArrowRight,
  Download,
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import api from '../utils/api.js';
import { staggerContainer, staggerItem } from '../utils/animations.js';
import { Button, Badge } from '../components/ui/index.js';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

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

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    setDownloadingId(orderId);
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rigamart_Invoice_${orderNumber || orderId.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download tax invoice.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      await api.put(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation' });
      setConfirmCancelId(null);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </Badge>
        );
      case 'Shipped':
        return (
          <Badge variant="brand" size="sm" className="gap-1">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </Badge>
        );
      case 'Confirmed':
        return (
          <Badge variant="secondary" size="sm" className="gap-1">
            <Clock className="w-3.5 h-3.5" /> Confirmed
          </Badge>
        );
      case 'Placed':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge variant="danger" size="sm" className="gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </Badge>
        );
      case 'Return Requested':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Return Requested
          </Badge>
        );
      case 'Returned':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Returned & Refunded
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm" className="gap-1">
            <Clock className="w-3.5 h-3.5" /> {status || 'Placed'}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
          <div className="h-8 bg-line/60 rounded-lg w-52" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-surface rounded-2xl border border-line" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calm Editorial Empty State
  if (orders.length === 0) {
    return (
      <div className="min-h-[75vh] bg-canvas flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-full bg-brand-soft text-brand mx-auto flex items-center justify-center shadow-subtle"
          >
            <Package className="w-9 h-9" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-ink tracking-tight">No orders placed yet</h1>
            <p className="text-sm text-muted leading-relaxed max-w-sm mx-auto">
              You haven't completed any orders yet. Discover verified factory deals and everyday essentials in our catalog.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/catalog">
              <Button variant="primary" size="lg" className="px-8 shadow-subtle">
                Explore Catalog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
              <span>My Orders</span>
              <Badge variant="secondary">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </Badge>
            </h1>
            <p className="text-xs text-muted mt-1">
              Track live shipments, download tax invoices, and manage post-purchase requests.
            </p>
          </div>

          <Link to="/catalog">
            <Button variant="outline" size="sm">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Orders List */}
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {orders.map((order) => {
            const items = order.items || [];
            const isCancellable = ['Placed', 'Confirmed'].includes(order.status);
            const paymentMethod = order.paymentInfo?.method || order.paymentMethod || 'N/A';
            const orderNumber = order.orderNumber || order._id.slice(-8);

            return (
              <motion.div
                key={order._id}
                variants={staggerItem}
                className="bg-surface rounded-2xl border border-line shadow-subtle overflow-hidden hover:border-muted/30 transition-all duration-300"
              >
                {/* Order Header Ribbon */}
                <div className="bg-canvas px-5 sm:px-6 py-4 border-b border-line flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-xs tabular-nums">
                    <div>
                      <span className="text-muted block uppercase font-bold text-[10px] tracking-wider">
                        Order ID
                      </span>
                      <Link
                        to={`/orders/${order._id}`}
                        className="font-mono font-bold text-brand hover:underline"
                      >
                        #{orderNumber}
                      </Link>
                    </div>

                    <div>
                      <span className="text-muted block uppercase font-bold text-[10px] tracking-wider">
                        Placed On
                      </span>
                      <span className="font-semibold text-ink">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted block uppercase font-bold text-[10px] tracking-wider">
                        Total Amount
                      </span>
                      <span className="font-bold text-ink">
                        {formatCurrency(order.totalAmount || 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted block uppercase font-bold text-[10px] tracking-wider">
                        Payment
                      </span>
                      <span className="font-semibold text-brand uppercase text-[11px]">
                        {paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Status & Quick Actions */}
                  <div className="flex items-center gap-2.5">
                    {renderStatusBadge(order.status)}

                    <Link to={`/orders/${order._id}`}>
                      <Button variant="ghost" size="sm" className="text-brand hover:text-brand hover:bg-brand-soft text-xs">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(order._id, orderNumber)}
                      isLoading={downloadingId === order._id}
                      className="text-xs"
                      title="Download Tax Invoice"
                    >
                      <Download className="w-3.5 h-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">Invoice</span>
                    </Button>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="divide-y divide-line/60 px-5 sm:px-6 py-4">
                  {items.map((item, idx) => {
                    const product = item.product || {};
                    const imageUrl =
                      product.images?.[0]?.url ||
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                    const productId = product._id || item.productId;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1"
                      >
                        <div className="flex items-center gap-4">
                          <Link to={productId ? `/products/${productId}` : '#'} className="shrink-0">
                            <img
                              src={imageUrl}
                              alt={product.name || item.name || 'Product'}
                              className="w-16 h-18 sm:w-18 sm:h-20 object-cover rounded-xl bg-canvas border border-line shrink-0 hover:opacity-90 transition-opacity"
                            />
                          </Link>
                          <div className="space-y-1">
                            <Link
                              to={productId ? `/products/${productId}` : '#'}
                              className="text-xs sm:text-sm font-bold text-ink hover:text-brand line-clamp-1 transition-colors"
                            >
                              {product.name || item.name || 'Ordered Item'}
                            </Link>

                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              {item.size && (
                                <Badge variant="secondary" size="sm">
                                  Size: {item.size}
                                </Badge>
                              )}
                              {item.color && (
                                <Badge variant="secondary" size="sm">
                                  Color: {item.color}
                                </Badge>
                              )}
                              <span className="text-muted tabular-nums text-[11px]">
                                Qty: <strong className="text-ink">{item.quantity}</strong> &times; {formatCurrency(item.price || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-sm font-bold text-ink block tabular-nums">
                            {formatCurrency((item.price || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cancellable Order Action Ribbon with Inline Confirm */}
                {isCancellable && (
                  <div className="bg-canvas px-5 sm:px-6 py-3 border-t border-line flex items-center justify-between text-xs">
                    <span className="text-muted">
                      Need to modify or cancel this shipment before dispatch?
                    </span>

                    {confirmCancelId === order._id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-danger font-semibold">Confirm cancel?</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelOrder(order._id)}
                          isLoading={cancellingId === order._id}
                        >
                          Yes, Cancel Order
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmCancelId(null)}
                        >
                          Keep Order
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmCancelId(order._id)}
                        className="text-danger hover:text-danger hover:bg-danger-soft text-xs font-semibold"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
