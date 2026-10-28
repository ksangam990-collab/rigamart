import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import api from '../utils/api.js';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations.js';

const STEPS = [
  { key: 'Placed', label: 'Order Placed', desc: 'Received & logged in system' },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Seller verified & packed' },
  { key: 'Shipped', label: 'In Transit', desc: 'Handed to logistics partner' },
  { key: 'Delivered', label: 'Delivered', desc: 'Safely delivered to doorstep' }
];

export default function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  // Auto-search if query params are present in URL
  useEffect(() => {
    const qOrderId = searchParams.get('orderId');
    const qPhone = searchParams.get('phone');
    if (qOrderId && qPhone && !trackingData) {
      handleTrack(null, qOrderId, qPhone);
    }
  }, [searchParams]);

  const handleTrack = async (e, customOrderId, customPhone) => {
    if (e) e.preventDefault();
    const queryOrderId = (customOrderId !== undefined ? customOrderId : orderId).trim();
    const queryPhone = (customPhone !== undefined ? customPhone : phone).trim().replace(/\D/g, '').slice(-10);

    if (!queryOrderId) {
      setError('Please enter your Order ID or Order Number.');
      return;
    }
    if (!queryPhone || queryPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number associated with the order.');
      return;
    }

    setError('');
    setLoading(true);
    setTrackingData(null);

    // Update URL query parameters for shareability
    setSearchParams({ orderId: queryOrderId, phone: queryPhone });

    try {
      const response = await api.get('/orders/track/public', {
        params: { orderId: queryOrderId, phone: queryPhone }
      });

      if (response.data && response.data.success) {
        setTrackingData(response.data.data);
      } else {
        setError(response.data?.message || 'Order not found. Please verify your details.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to locate order. Please check your Order ID and Mobile number.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepKey, currentStatus) => {
    const sequence = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(stepKey);

    if (currentStatus === 'Cancelled') {
      return stepKey === 'Placed' ? 'complete' : 'cancelled';
    }
    if (currentStatus === 'Returned') {
      return 'returned';
    }

    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-canvas text-ink py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted" />
          <span className="text-ink font-medium">Track Order</span>
        </nav>

        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Public Shipment Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Check real-time dispatch, transit milestones, and estimated doorstep delivery across all pin codes in India.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-surface rounded-2xl border border-line shadow-xs p-5 sm:p-7 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order ID Input */}
              <div>
                <label htmlFor="orderIdInput" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Order ID / Order Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Package className="w-4 h-4" />
                  </div>
                  <input
                    id="orderIdInput"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. RM-20261025-9842"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">Found in your order confirmation SMS or email invoice.</p>
              </div>

              {/* Mobile Number Input */}
              <div>
                <label htmlFor="phoneInput" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  10-Digit Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-line bg-canvas/80 text-muted text-xs font-semibold">
                    +91
                  </span>
                  <input
                    id="phoneInput"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-mono"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">Mobile number provided during shipping checkout.</p>
              </div>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">
                    <span className="font-semibold">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand hover:bg-brand/90 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Locating Package...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tracking Details Display */}
        {trackingData && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Order Summary Header Card */}
            <div className="bg-surface rounded-2xl border border-line shadow-xs p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted">Order</span>
                    <span className="text-base sm:text-lg font-bold text-ink font-mono">{trackingData.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      trackingData.status === 'Delivered' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : trackingData.status === 'Cancelled' 
                        ? 'bg-red-500/10 text-red-600 border border-red-500/20' 
                        : 'bg-brand/10 text-brand border border-brand/20'
                    }`}>
                      {trackingData.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Placed on {new Date(trackingData.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted block">Total Order Amount</span>
                  <span className="text-lg sm:text-xl font-bold text-ink">
                    ₹{Number(trackingData.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-muted block mt-0.5">
                    {trackingData.paymentMethod} &bull; {trackingData.paymentStatus}
                  </span>
                </div>
              </div>

              {/* 4-Step Visual Progress Stepper */}
              {trackingData.status !== 'Cancelled' && trackingData.status !== 'Returned' ? (
                <div className="pt-6 pb-2">
                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-line -translate-y-1/2 z-0" />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                      {STEPS.map((step, idx) => {
                        const status = getStepStatus(step.key, trackingData.status);
                        const isDone = status === 'complete';
                        const isCurrent = status === 'current';

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isDone
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-brand text-white ring-4 ring-brand/20'
                                : 'bg-surface border-2 border-line text-muted'
                            }`}>
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : isCurrent ? (
                                <Truck className="w-5 h-5 animate-pulse" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <span className={`text-xs font-semibold mt-2 ${
                              isCurrent ? 'text-brand' : isDone ? 'text-ink' : 'text-muted'
                            }`}>
                              {step.label}
                            </span>
                            <span className="text-[10px] text-muted hidden sm:block mt-0.5">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Order {trackingData.status}</span>
                    <span className="text-muted block mt-0.5">
                      This order is no longer in transit. If you need assistance regarding refunds or status clarification, please reach out to our customer care.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Two-Column Grid: Delivery Destination & Milestone Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Destination & Contact Card (1 Column) */}
              <div className="bg-surface rounded-2xl border border-line shadow-xs p-5">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span>Delivery Destination</span>
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-muted block text-[11px]">Destination Region</span>
                    <span className="font-semibold text-ink">
                      {trackingData.destination?.city}, {trackingData.destination?.state}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted block text-[11px]">Postal Pincode</span>
                    <span className="font-semibold text-ink font-mono">
                      {trackingData.destination?.pincode}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted block text-[11px]">Recipient Contact</span>
                    <span className="font-semibold text-ink font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-muted" />
                      <span>+91 {trackingData.destination?.maskedMobile}</span>
                    </span>
                  </div>

                  <div className="pt-3 border-t border-line">
                    <span className="text-[11px] text-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Contact details partially masked for privacy protection.</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestones Log (2 Columns) */}
              <div className="md:col-span-2 bg-surface rounded-2xl border border-line shadow-xs p-5">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand" />
                  <span>Shipment Activity &amp; Checkpoints</span>
                </h3>

                {trackingData.statusTimeline && trackingData.statusTimeline.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                    {trackingData.statusTimeline.slice().reverse().map((item, index) => (
                      <div key={index} className="flex items-start gap-4 relative">
                        <div className="w-4 h-4 rounded-full bg-brand ring-4 ring-surface shrink-0 mt-0.5 z-10" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-xs font-bold text-ink">{item.status}</span>
                            <span className="text-[11px] text-muted">
                              {new Date(item.timestamp).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {item.comment && (
                            <p className="text-xs text-muted mt-0.5 leading-relaxed">
                              {item.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-muted">
                    <p>Status logged: <span className="font-semibold text-ink">{trackingData.status}</span></p>
                    <p className="text-[11px] mt-1">Detailed courier checkpoints are synced every 4 hours.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipment Items Card */}
            <div className="bg-surface rounded-2xl border border-line shadow-xs p-5">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand" />
                <span>Items in this Shipment ({trackingData.items?.length || 0})</span>
              </h3>

              <div className="divide-y divide-line">
                {(trackingData.items || []).map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-4 first:pt-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl border border-line bg-canvas shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-ink truncate">{item.name}</h4>
                      <p className="text-[11px] text-muted mt-0.5">
                        Qty: <span className="font-semibold text-ink">{item.quantity}</span>
                        {item.size && ` • Size: ${item.size}`}
                        {item.color && ` • Color: ${item.color}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-ink">
                        ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help Footer Banner */}
            <div className="bg-canvas rounded-2xl border border-line p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand/10 text-brand shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Have questions regarding this order?</h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Our dedicated customer grievance and support desk is available Mon–Sat (9 AM – 8 PM).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  to="/contact"
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  to="/catalog"
                  className="px-3.5 py-2 rounded-xl bg-brand text-white hover:bg-brand/90 text-xs font-semibold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Informational Help Sections (when no order is queried yet) */}
        {!trackingData && !loading && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-surface border border-line">
              <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h4 className="text-xs font-bold text-ink">Check Order Confirmation</h4>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Your Order ID (format <span className="font-mono text-ink">RM-xxxx</span>) is sent via SMS and email immediately upon checkout.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-line">
              <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h4 className="text-xs font-bold text-ink">Enter Mobile Number</h4>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Ensure you enter the exact 10-digit mobile number provided on the delivery address during checkout.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-line">
              <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h4 className="text-xs font-bold text-ink">Live Real-Time Updates</h4>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Tracking milestones update as our verified delivery partner scans your package at transit hubs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
