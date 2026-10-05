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
} from 'lucide-react';
import api from '../utils/api.js';
import ReturnRequestModal from '../components/order/ReturnRequestModal.jsx';
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonTap,
  pageVariants,
  EASINGS,
} from '../utils/animations.js';

/* ─── Status Config ──────────────────────────────────── */
const STATUS_FLOW = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

const statusMeta = {
  Placed:             { color: 'amber',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: Clock,        label: 'Order Placed' },
  Confirmed:          { color: 'blue',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    icon: Package,      label: 'Confirmed' },
  Shipped:            { color: 'purple',  bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  icon: Truck,        label: 'Shipped' },
  Delivered:          { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, label: 'Delivered' },
  Cancelled:          { color: 'red',     bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     icon: XCircle,      label: 'Cancelled' },
  'Return Requested': { color: 'amber',   bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-300',   icon: RotateCcw,    label: 'Return Requested' },
  Returned:           { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', icon: CheckCircle2, label: 'Returned & Refunded' },
};

/* ─── Skeleton ────────────────────────────────────────── */
function OrderDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-28 h-8 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-100 rounded w-32" />
        </div>
        <div className="h-7 bg-gray-200 rounded-full w-24" />
      </div>
      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex justify-between">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-2.5 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
      {/* 2-col */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 h-56">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3.5 bg-gray-200 rounded w-20" />
                <div className="h-3.5 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 h-32 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
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
  const isFuture = state === 'future';

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: index * 0.12, duration: 0.3, ease: EASINGS.easeOutCubic },
    },
  };

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-2 flex-1 relative"
    >
      {/* Connector line — rendered between steps (not first) */}
      {index > 0 && (
        <div
          className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
            isDone || isCurrent ? 'bg-brand-600' : 'bg-gray-200'
          }`}
          style={{ zIndex: 0 }}
        />
      )}

      {/* Circle */}
      <motion.div
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          isDone
            ? 'bg-brand-600 text-white shadow-md shadow-brand-200'
            : isCurrent
            ? 'bg-white border-2 border-brand-600 text-brand-600 shadow-lg'
            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
        }`}
        animate={isCurrent ? { boxShadow: ['0 0 0 0px rgba(37,99,235,0.4)', '0 0 0 6px rgba(37,99,235,0)'] } : {}}
        transition={isCurrent ? { duration: 1.4, repeat: Infinity } : {}}
      >
        {isDone ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isCurrent ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <Package className="w-5 h-5" />
          </motion.div>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        )}
      </motion.div>

      {/* Label */}
      <div className="text-center">
        <p className={`text-xs font-bold ${isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
          {label}
        </p>
        {timestamp && (
          <p className="text-[10px] text-gray-400 mt-0.5 max-w-[80px]">
            {new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Vertical Timeline (mobile) ─────────────────────── */
function VerticalTimeline({ steps, currentStatus, isCancelledOrReturned }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const state = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'future';
        const stepVariants = {
          hidden: { opacity: 0, x: -16 },
          visible: { opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.3, ease: EASINGS.easeOutCubic } },
        };

        return (
          <motion.div
            key={step.label}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            className="flex items-stretch gap-4"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  state === 'done'
                    ? 'bg-brand-600 text-white'
                    : state === 'current'
                    ? 'bg-white border-2 border-brand-600 text-brand-600'
                    : 'bg-gray-100 text-gray-300 border-2 border-gray-200'
                }`}
              >
                {state === 'done' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : state === 'current' ? (
                  <Package className="w-4 h-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 ${state === 'done' ? 'bg-brand-600' : 'bg-gray-200'}`} style={{ minHeight: 24 }} />
              )}
            </div>
            <div className="pb-5 pt-1">
              <p className={`text-xs font-bold ${state !== 'future' ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
              {step.timestamp && (
                <p className="text-[10px] text-gray-400">
                  {new Date(step.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              {step.comment && <p className="text-[10px] text-gray-500 italic mt-0.5">{step.comment}</p>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  // Cancel
  const [cancelState, setCancelState] = useState('idle'); // idle | confirm | saving | done | error
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Return
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

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  /* Invoice download */
  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    setInvoiceError('');
    try {
      const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `Rigamart_Tax_Invoice_${order?.orderNumber || id.slice(-8)}.pdf`);
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

  /* Cancel */
  const handleCancelOrder = async () => {
    setCancelState('saving');
    setCancelError('');
    try {
      await api.put(`/orders/${id}/cancel`, { reason: cancelReason || 'Customer requested cancellation' });
      setCancelState('done');
      await fetchOrder();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order.');
      setCancelState('error');
    }
  };

  /* Derived */
  if (isLoading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-black text-gray-800">Order Not Found</h2>
        <p className="text-xs text-gray-500">We couldn't find this order. It may have been removed or the link is incorrect.</p>
        <Link to="/my-orders" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
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

  // For cancelled/returned, add terminal step
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
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* ── Header Bar ──────────────────────────────────── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            onClick={() => navigate('/my-orders')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors mt-1"
            aria-label="Back to My Orders"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Orders</span>
          </motion.button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{orderNum}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
          <StatusIcon className="w-4 h-4" />
          {statusInfo.label}
        </span>
      </motion.div>

      {/* ── Status Timeline ──────────────────────────────── */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        {/* Desktop horizontal */}
        <div className="hidden sm:flex justify-between gap-0 relative">
          {timelineSteps.map((step, i) => (
            <TimelineStep
              key={step.label}
              {...step}
              index={i}
            />
          ))}
        </div>

        {/* Mobile vertical */}
        <div className="sm:hidden">
          <VerticalTimeline
            steps={timelineSteps}
            currentStatus={order.status}
            isCancelledOrReturned={isCancelledOrReturned}
          />
        </div>
      </motion.div>

      {/* ── Return & Dispute Lifecycle Card ──────────────── */}
      {order.returnRequest && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-amber-200/90 shadow-sm overflow-hidden"
        >
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900">Return &amp; Refund Progress</h2>
                <p className="text-[11px] text-gray-500">
                  Requested on{' '}
                  {new Date(order.returnRequest.requestedAt || order.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Stage Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                order.returnRequest.status === 'Refunded'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : order.returnRequest.status === 'Rejected'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : order.returnRequest.status === 'Pickup_Scheduled'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : order.returnRequest.status === 'Approved'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : order.returnRequest.status === 'Item_Received'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {order.returnRequest.status === 'Requested' && 'Pending Seller Review'}
              {order.returnRequest.status === 'Approved' && 'Return Approved'}
              {order.returnRequest.status === 'Pickup_Scheduled' && 'Courier Pickup Scheduled'}
              {order.returnRequest.status === 'Item_Received' && 'Item Received at Hub'}
              {order.returnRequest.status === 'Refunded' && 'Refund Completed'}
              {order.returnRequest.status === 'Rejected' && 'Return Declined'}
            </span>
          </div>

          {/* Return Details Body */}
          <div className="p-5 space-y-4 text-xs">
            {/* Return Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-3 border-b border-gray-100">
              {[
                { key: 'Requested', label: '1. Requested', done: true },
                {
                  key: 'Approved',
                  label: '2. Approved / Pickup',
                  done: ['Approved', 'Pickup_Scheduled', 'Item_Received', 'Refunded'].includes(
                    order.returnRequest.status
                  )
                },
                {
                  key: 'Item_Received',
                  label: '3. Hub Verified',
                  done: ['Item_Received', 'Refunded'].includes(order.returnRequest.status)
                },
                { key: 'Refunded', label: '4. Refunded', done: order.returnRequest.status === 'Refunded' }
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    step.done
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <span className="font-bold text-[11px] truncate">{step.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Reason Category
                </span>
                <p className="font-bold text-gray-800 mt-0.5">
                  {order.returnRequest.reasonCategory?.replace(/_/g, ' ') || 'General Return'}
                </p>
                <p className="text-gray-600 mt-1 italic">"{order.returnRequest.reason}"</p>
                {order.returnRequest.comments && (
                  <p className="text-gray-500 mt-1 text-[11px] leading-relaxed">
                    Customer Note: {order.returnRequest.comments}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Resolution Preference
                </span>
                <p className="font-bold text-gray-800 mt-0.5">
                  {order.returnRequest.resolutionType === 'REPLACEMENT'
                    ? 'Replacement with identical unit'
                    : 'Full refund to original payment source'}
                </p>

                {order.returnRequest.pickupDate && (
                  <div className="mt-2 p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900">
                    <span className="font-bold">Scheduled Pickup Date:</span>{' '}
                    {new Date(order.returnRequest.pickupDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                )}

                {order.returnRequest.sellerNotes && (
                  <div className="mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                    <span className="font-bold text-gray-900">Seller Note:</span>{' '}
                    {order.returnRequest.sellerNotes}
                  </div>
                )}

                {order.returnRequest.status === 'Refunded' && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Refund of ₹
                      {(order.returnRequest.refundAmount || order.totalAmount || 0).toLocaleString(
                        'en-IN'
                      )}{' '}
                      Credited
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence photos */}
            {order.returnRequest.photos && order.returnRequest.photos.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Uploaded Proof Evidence ({order.returnRequest.photos.length} photos)
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {order.returnRequest.photos.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 hover:ring-2 hover:ring-brand-500 flex-shrink-0 shadow-2xs group"
                    >
                      <img
                        src={url}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── 2-Column Layout ──────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── LEFT: Order Items ───────────────────────────── */}
        <div className="flex-1 min-w-0">
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-gray-800">
                Order Items <span className="text-gray-400 font-normal">({order.items?.length || 0})</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {(order.items || []).map((item, idx) => {
                const product = item.product || {};
                const imageUrl =
                  item.image ||
                  product.images?.[0]?.url ||
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop';

                return (
                  <motion.div
                    key={idx}
                    variants={staggerItem}
                    className="flex items-start gap-4 p-5 hover:bg-gray-50/60 transition-colors"
                  >
                    <img
                      src={imageUrl}
                      alt={product.name || item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product._id || item.productId}`}
                        className="text-sm font-bold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2 block"
                      >
                        {product.name || item.name || 'Product'}
                      </Link>
                      {item.seller?.name && (
                        <p className="text-[11px] text-gray-400 mt-0.5">Sold by {item.seller.name}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {item.size && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            Color: {item.color}
                          </span>
                        )}
                        {item.sku && (
                          <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 tabular-nums">
                        Qty: <strong className="text-gray-800">{item.quantity}</strong>{' '}
                        × ₹{(item.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-gray-900 tabular-nums">
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: Summary + Actions ─────────────────────── */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* Price Breakdown */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Summary</h3>
            <div className="space-y-2.5 text-xs text-gray-600 tabular-nums">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="font-semibold text-gray-800">₹{(order.itemsPrice || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={`font-semibold ${order.shippingPrice === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                  {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toLocaleString('en-IN')}`}
                </span>
              </div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount {order.coupon?.code ? `(${order.coupon.code})` : ''}</span>
                  <span>-₹{order.discountPrice.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span className="font-semibold text-gray-800">₹{(order.taxPrice || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between tabular-nums">
                <span className="text-sm font-black text-gray-900">Total</span>
                <span className="text-sm font-black text-brand-700">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment badge */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Payment</p>
                <p className="text-xs font-bold text-gray-800 uppercase">
                  {order.paymentInfo?.method || 'N/A'}
                  <span className={`ml-2 text-[10px] font-bold ${order.paymentInfo?.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    • {order.paymentInfo?.status || 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" /> Delivery Address
              </h3>
              <div className="space-y-0.5 text-xs text-gray-700">
                <p className="font-bold text-gray-900 text-sm">{order.shippingAddress.name}</p>
                <p className="text-gray-500">{order.shippingAddress.mobile}</p>
                <p className="mt-1 text-gray-600 leading-relaxed">
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} — {order.shippingAddress.pincode}
                  {order.shippingAddress.landmark ? `, Near ${order.shippingAddress.landmark}` : ''}
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</h3>

            {/* Download Invoice */}
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
            >
              {downloadingInvoice ? (
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Invoice (PDF)
            </motion.button>

            {invoiceError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {invoiceError}
              </p>
            )}

            {/* Cancel Order */}
            {isCancellable && (
              <div className="border-t border-gray-100 pt-3">
                <AnimatePresence mode="wait">
                  {cancelState === 'done' ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-xs text-emerald-600 font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Cancellation request submitted.
                    </motion.div>
                  ) : cancelState === 'confirm' || cancelState === 'saving' || cancelState === 'error' ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-xs font-bold text-gray-700">Reason for cancellation</p>
                      <textarea
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 resize-none transition-all"
                        rows={3}
                        placeholder="Optional: Tell us why you're cancelling…"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      {cancelError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {cancelError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={buttonTap}
                          onClick={handleCancelOrder}
                          disabled={cancelState === 'saving'}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
                        >
                          {cancelState === 'saving' ? 'Processing…' : 'Confirm Cancel'}
                        </motion.button>
                        <motion.button
                          whileTap={buttonTap}
                          onClick={() => setCancelState('idle')}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-colors"
                        >
                          Go Back
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="idle"
                      whileHover={{ scale: 1.01 }}
                      whileTap={buttonTap}
                      onClick={() => setCancelState('confirm')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Cancel This Order
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Return Request Button */}
            {isReturnable && (
              <div className="border-t border-gray-100 pt-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={buttonTap}
                  onClick={() => setIsReturnModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Request Return / Refund</span>
                </motion.button>
              </div>
            )}
          </motion.div>
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
    </motion.div>
  );
}
