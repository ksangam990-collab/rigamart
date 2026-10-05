import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  RotateCcw,
  MapPin,
  CreditCard,
  Download,
  AlertCircle,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import api from '../utils/api.js';
import ReturnRequestModal from '../components/order/ReturnRequestModal.jsx';
import LiveDeliveryTracker from '../components/order/LiveDeliveryTracker.jsx';
import { Button, Badge } from '../components/ui/index.js';
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  pageVariants,
  EASINGS,
} from '../utils/animations.js';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/* ─── Status Config ──────────────────────────────────── */
const STATUS_FLOW = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

const statusMeta = {
  Placed:             { badgeVariant: 'warning',   icon: Clock,        label: 'Order Placed' },
  Confirmed:          { badgeVariant: 'secondary', icon: Package,      label: 'Confirmed' },
  Shipped:            { badgeVariant: 'brand',     icon: Truck,        label: 'Out for Delivery' },
  Delivered:          { badgeVariant: 'success',   icon: CheckCircle2, label: 'Delivered' },
  Cancelled:          { badgeVariant: 'danger',    icon: XCircle,      label: 'Cancelled' },
  'Return Requested': { badgeVariant: 'warning',   icon: RotateCcw,    label: 'Return Requested' },
  Returned:           { badgeVariant: 'success',   icon: CheckCircle2, label: 'Returned & Refunded' },
};

/* ─── Skeleton ────────────────────────────────────────── */
function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-28 h-8 bg-line/60 rounded" />
          <div className="flex-1 space-y-1.5">
            <div className="h-5 bg-line/60 rounded-sm w-48" />
            <div className="h-3 bg-line/40 rounded-sm w-32" />
          </div>
          <div className="h-7 bg-line/60 rounded-sm w-24" />
        </div>
        {/* Timeline */}
        <div className="bg-surface rounded-none border border-line p-6">
          <div className="flex justify-between">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-9 h-9 rounded-full bg-line/60" />
                <div className="h-3 bg-line/60 rounded-sm w-16" />
                <div className="h-2.5 bg-line/40 rounded-sm w-20" />
              </div>
            ))}
          </div>
        </div>
        {/* 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface rounded-none border border-line p-6 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-20 bg-line/60 rounded-none shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-line/60 rounded-sm w-3/4" />
                  <div className="h-3 bg-line/40 rounded-sm w-1/2" />
                </div>
                <div className="h-5 bg-line/60 rounded-sm w-16" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface rounded-none border border-line p-5 space-y-3 h-56" />
            <div className="bg-surface rounded-none border border-line p-5 h-32 space-y-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline Step ───────────────────────────────────── */
function TimelineStep({ label, timestamp, state, index }) {
  const isCurrent = state === 'current';
  const isDone = state === 'done';

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: index * 0.1, duration: 0.3, ease: EASINGS.easeOutCubic },
    },
  };

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-2 flex-1 relative"
    >
      {/* Connector line */}
      {index > 0 && (
        <div
          className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
            isDone || isCurrent ? 'bg-brand' : 'bg-line'
          }`}
          style={{ zIndex: 0 }}
        />
      )}

      {/* Step Circle */}
      <div
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
          isDone
            ? 'bg-ink text-white'
            : isCurrent
            ? 'bg-surface border-2 border-brand text-brand'
            : 'bg-canvas text-muted border border-line'
        }`}
      >
        {isDone ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : isCurrent ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Package className="w-4 h-4" />
          </motion.div>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-muted/60" />
        )}
      </div>

      {/* Step Label & Date */}
      <div className="text-center">
        <p className={`text-xs font-semibold ${isDone || isCurrent ? 'text-ink' : 'text-muted'}`}>
          {label}
        </p>
        {timestamp && (
          <p className="text-[10px] text-muted mt-0.5 max-w-[84px] tabular-nums font-mono">
            {new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Vertical Timeline (Mobile) ─────────────────────── */
function VerticalTimeline({ steps, currentStatus }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const state = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'future';

        return (
          <div key={step.label} className="flex items-stretch gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  state === 'done'
                    ? 'bg-ink text-white'
                    : state === 'current'
                    ? 'bg-surface border-2 border-brand text-brand'
                    : 'bg-canvas text-muted border border-line'
                }`}
              >
                {state === 'done' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : state === 'current' ? (
                  <Package className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-muted/60" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 my-1 ${state === 'done' ? 'bg-brand' : 'bg-line'}`}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            <div className="pb-5 pt-1">
              <p className={`text-xs font-semibold ${state !== 'future' ? 'text-ink' : 'text-muted'}`}>
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-[10px] text-muted tabular-nums">
                  {new Date(step.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              {step.comment && <p className="text-[10px] text-muted italic mt-0.5">{step.comment}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  // Cancel state
  const [cancelState, setCancelState] = useState('idle'); // idle | confirm | saving | done | error
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Return state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data?.order || null);
    } catch {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    setInvoiceError('');
    try {
      const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `Rigamart_Invoice_${order?.orderNumber || id.slice(-8)}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setInvoiceError(err.response?.data?.message || 'Invoice download failed.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleCancelOrder = async () => {
    setCancelState('saving');
    setCancelError('');
    try {
      await api.put(`/orders/${id}/cancel`, {
        reason: cancelReason || 'Customer requested cancellation'
      });
      setCancelState('done');
      await fetchOrder();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order.');
      setCancelState('error');
    }
  };

  if (isLoading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="min-h-[75vh] bg-canvas flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-soft text-brand mx-auto flex items-center justify-center shadow-subtle">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-ink">Order Not Found</h2>
            <p className="text-xs text-muted max-w-sm mx-auto">
              We couldn't locate this order. It may have been removed or the link is invalid.
            </p>
          </div>
          <Link to="/my-orders">
            <Button variant="primary" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusMeta[order.status] || statusMeta.Placed;
  const StatusIcon = statusInfo.icon;
  const isCancellable = ['Placed', 'Confirmed'].includes(order.status);
  const isReturnable =
    order.status === 'Delivered' &&
    (!order.returnRequest || order.returnRequest.status === 'Rejected');
  const isCancelledOrReturned = ['Cancelled', 'Returned', 'Return Requested'].includes(order.status);
  const orderNum = order.orderNumber || `#RM-${order._id.slice(-8).toUpperCase()}`;
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  // Build timeline steps
  const timelineSteps = STATUS_FLOW.map((s) => {
    const timelineEntry = order.statusTimeline?.find((t) => t.status === s);
    return {
      label: statusMeta[s]?.label || s,
      timestamp: timelineEntry?.timestamp,
      comment: timelineEntry?.comment,
      state: STATUS_FLOW.indexOf(s) < currentIdx ? 'done' : STATUS_FLOW.indexOf(s) === currentIdx ? 'current' : 'future',
    };
  });

  if (isCancelledOrReturned) {
    const termEntry = order.statusTimeline?.find((t) => t.status === order.status);
    timelineSteps.push({
      label: statusMeta[order.status]?.label || order.status,
      timestamp: termEntry?.timestamp,
      comment: termEntry?.comment,
      state: 'current',
    });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/my-orders')}
              className="text-muted hover:text-ink -ml-2"
              aria-label="Back to My Orders"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back</span>
            </Button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-mono">
                  {orderNum}
                </h1>
                <Badge variant={statusInfo.badgeVariant} size="sm" className="gap-1">
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
            isLoading={downloadingInvoice}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Tax Invoice
          </Button>
        </div>

        {/* Status Timeline */}
        <div className="bg-surface rounded-none border border-line p-5 sm:p-6">
          {/* Desktop horizontal */}
          <div className="hidden sm:flex justify-between gap-0 relative">
            {timelineSteps.map((step, i) => (
              <TimelineStep key={step.label} {...step} index={i} />
            ))}
          </div>

          {/* Mobile vertical */}
          <div className="sm:hidden">
            <VerticalTimeline
              steps={timelineSteps}
              currentStatus={order.status}
            />
          </div>
        </div>

        {/* Live Courier Tracking */}
        {!isCancelledOrReturned && (
          <LiveDeliveryTracker order={order} onRefresh={fetchOrder} />
        )}

        {/* Return & Dispute Lifecycle */}
        {order.returnRequest && (
          <div className="bg-surface rounded-none border border-line overflow-hidden">
            <div className="p-4 bg-accent-soft/30 border-b border-line flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-accent text-white flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-ink">Return &amp; Refund Progress</h2>
                  <p className="text-[11px] text-muted">
                    Requested on{' '}
                    {new Date(order.returnRequest.requestedAt || order.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <Badge variant="warning" size="sm">
                {order.returnRequest.status === 'Requested' && 'Pending Seller Review'}
                {order.returnRequest.status === 'Approved' && 'Return Approved'}
                {order.returnRequest.status === 'Pickup_Scheduled' && 'Courier Pickup Scheduled'}
                {order.returnRequest.status === 'Item_Received' && 'Item Received at Hub'}
                {order.returnRequest.status === 'Refunded' && 'Refund Completed'}
                {order.returnRequest.status === 'Rejected' && 'Return Declined'}
              </Badge>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Reason Category
                  </span>
                  <p className="font-semibold text-ink mt-0.5">
                    {order.returnRequest.reasonCategory?.replace(/_/g, ' ') || 'General Return'}
                  </p>
                  <p className="text-muted mt-1 italic">"{order.returnRequest.reason}"</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Resolution Preference
                  </span>
                  <p className="font-semibold text-ink mt-0.5">
                    {order.returnRequest.resolutionType === 'REPLACEMENT'
                      ? 'Replacement with identical unit'
                      : 'Full refund to original payment source'}
                  </p>
                  {order.returnRequest.status === 'Refunded' && (
                    <div className="mt-2 p-2.5 bg-brand-soft border border-brand/20 rounded-sm text-brand font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                      <span>
                        Refund of {formatCurrency(order.returnRequest.refundAmount || order.totalAmount || 0)} Credited
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Order Items (8 cols) */}
          <div className="lg:col-span-8 bg-surface rounded-none border border-line overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-line flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand" />
                Ordered Items ({order.items?.length || 0})
              </h2>
            </div>

            <div className="divide-y divide-line/60">
              {(order.items || []).map((item, idx) => {
                const product = item.product || {};
                const imageUrl =
                  item.image ||
                  product.images?.[0]?.url ||
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120';
                const productId = product._id || item.productId;

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-canvas/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Link to={productId ? `/products/${productId}` : '#'} className="shrink-0">
                        <img
                          src={imageUrl}
                          alt={product.name || item.name}
                          className="w-18 h-22 sm:w-20 sm:h-24 object-cover rounded-none bg-canvas border border-line shrink-0 hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="space-y-1">
                        <Link
                          to={productId ? `/products/${productId}` : '#'}
                          className="text-sm font-bold text-ink hover:text-brand transition-colors line-clamp-2"
                        >
                          {product.name || item.name || 'Product'}
                        </Link>
                        {item.seller?.name && (
                          <p className="text-[11px] text-muted">Sold by {item.seller.name}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
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
                          {item.sku && (
                            <span className="font-mono text-[10px] text-muted">
                              SKU: {item.sku}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted pt-1 tabular-nums font-mono">
                          Qty: <strong className="text-ink">{item.quantity}</strong> &times; {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="text-sm font-bold text-ink tabular-nums font-mono">
                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Summary & Actions (4 cols, Sticky) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            {/* Price Breakdown */}
            <div className="bg-surface rounded-none border border-line p-5 sm:p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted pb-2 border-b border-line">
                Price Breakdown
              </h3>
              <div className="space-y-2.5 text-xs tabular-nums font-mono">
                <div className="flex justify-between text-muted font-sans">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-ink font-mono">{formatCurrency(order.itemsPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-muted font-sans">
                  <span>Express Delivery</span>
                  <span className="font-semibold font-mono">
                    {order.shippingPrice === 0 ? (
                      <span className="text-brand font-bold uppercase font-sans">Free</span>
                    ) : (
                      formatCurrency(order.shippingPrice || 0)
                    )}
                  </span>
                </div>
                {order.discountPrice > 0 && (
                  <div className="flex justify-between text-brand font-semibold font-sans">
                    <span>Coupon Discount</span>
                    <span className="font-mono">&minus;{formatCurrency(order.discountPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted font-sans">
                  <span>Taxes (GST)</span>
                  <span className="font-semibold text-ink font-mono">{formatCurrency(order.taxPrice || 0)}</span>
                </div>
                <div className="border-t border-line pt-2.5 flex justify-between text-base font-bold text-ink font-sans">
                  <span>Total Amount</span>
                  <span className="text-lg font-mono">{formatCurrency(order.totalAmount || 0)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center gap-2.5 bg-canvas rounded-none p-3 border border-line">
                <CreditCard className="w-4 h-4 text-muted shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted uppercase font-bold tracking-wide">Payment Method</p>
                  <p className="text-xs font-bold text-ink uppercase">
                    {order.paymentInfo?.method || 'N/A'}{' '}
                    <span className={`text-[10px] font-semibold ${order.paymentInfo?.status === 'Paid' ? 'text-brand' : 'text-accent'}`}>
                      &bull; {order.paymentInfo?.status || 'Pending'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            {order.shippingAddress && (
              <div className="bg-surface rounded-none border border-line p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" /> Delivery Address
                </h3>
                <div className="text-xs text-ink space-y-0.5">
                  <p className="font-bold">{order.shippingAddress.name}</p>
                  <p className="text-muted">{order.shippingAddress.mobile}</p>
                  <p className="text-muted leading-relaxed pt-1">
                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} &ndash; {order.shippingAddress.pincode}
                    {order.shippingAddress.landmark ? `, Near ${order.shippingAddress.landmark}` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Cancellation & Return Actions */}
            <div className="bg-surface rounded-none border border-line p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Order Actions</h3>

              {/* Cancel Button */}
              {isCancellable && (
                <div>
                  <AnimatePresence mode="wait">
                    {cancelState === 'done' ? (
                      <div className="flex items-center gap-2 text-xs text-brand font-semibold p-2 bg-brand-soft rounded-sm border border-brand/20">
                        <CheckCircle2 className="w-4 h-4 text-brand" /> Cancellation submitted.
                      </div>
                    ) : cancelState === 'confirm' || cancelState === 'saving' || cancelState === 'error' ? (
                      <div className="space-y-3 p-3 bg-danger-soft/40 border border-danger/20 rounded-none">
                        <p className="text-xs font-bold text-ink">Reason for cancellation</p>
                        <textarea
                          className="w-full border border-line rounded px-3 py-2 text-xs text-ink bg-surface focus:outline-none focus:border-brand resize-none"
                          rows={2}
                          placeholder="Optional: Reason for cancelling…"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                        {cancelError && (
                          <p className="text-xs text-danger flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {cancelError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            className="flex-1"
                            onClick={handleCancelOrder}
                            isLoading={cancelState === 'saving'}
                          >
                            Confirm Cancel
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelState('idle')}
                          >
                            Back
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelState('confirm')}
                        className="w-full text-danger hover:text-danger hover:bg-danger-soft text-xs"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" /> Cancel Order
                      </Button>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Return Request Button */}
              {isReturnable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReturnModalOpen(true)}
                  className="w-full text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-accent" />
                  Request Return / Refund
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Return Request Modal */}
        <ReturnRequestModal
          order={order}
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          onSuccess={(updatedOrder) => {
            setOrder(updatedOrder);
            fetchOrder();
          }}
        />
      </div>
    </div>
  );
}
