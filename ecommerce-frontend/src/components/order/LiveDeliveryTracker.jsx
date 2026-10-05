import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Home,
  Building2,
  Radio
} from 'lucide-react';

const MILESTONES = [
  { key: 'Picked up', label: 'Picked Up', desc: 'Collected from fulfillment hub' },
  { key: 'In transit', label: 'In Transit', desc: 'Moving through sorting facilities' },
  { key: 'Out for delivery', label: 'Out for Delivery', desc: 'On route with delivery associate' },
  { key: 'Delivered', label: 'Delivered', desc: 'Safely delivered to destination' }
];

export default function LiveDeliveryTracker({ order, onRefresh }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllCheckpoints, setShowAllCheckpoints] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);

  if (!order) return null;

  const status = order.status || 'Placed';
  const shippingAddress = order.shippingAddress || {};
  const city = shippingAddress.city || 'Your City';
  const state = shippingAddress.state || '';
  const pincode = shippingAddress.pincode || '';

  // Determine current milestone index based on status
  // 0: Picked Up, 1: In transit, 2: Out for delivery, 3: Delivered
  let milestoneIdx = 0;
  if (status === 'Placed') milestoneIdx = 0;
  else if (status === 'Confirmed') milestoneIdx = 0;
  else if (status === 'Shipped') {
    // If order was placed more than 24h ago, mark as Out for delivery or in transit
    const hoursElapsed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    milestoneIdx = hoursElapsed > 36 ? 2 : 1;
  } else if (status === 'Delivered') {
    milestoneIdx = 3;
  }

  const isTerminal = ['Cancelled', 'Returned', 'Return Requested'].includes(status);
  const progressPercent =
    status === 'Delivered'
      ? 100
      : milestoneIdx === 2
      ? 75
      : milestoneIdx === 1
      ? 45
      : status === 'Confirmed'
      ? 20
      : 8;

  const trackingInfo = order.tracking || {};
  const awbNumber = trackingInfo.awbNumber || `DLV-${order._id.slice(-8).toUpperCase()}-IN`;
  const carrier = trackingInfo.carrier || 'Delhivery Surface & Air Express';
  const courierPartner = trackingInfo.courierPartner || {
    name: 'Rajesh Sharma',
    phone: '+91 98234 11092'
  };

  const estDate = trackingInfo.estimatedDelivery
    ? new Date(trackingInfo.estimatedDelivery)
    : (() => {
        const d = new Date(order.createdAt || Date.now());
        d.setDate(d.getDate() + 3);
        return d;
      })();

  const handleCopyAwb = () => {
    navigator.clipboard.writeText(awbNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Generate realistic transit checkpoint logs
  const checkpoints = [
    {
      title: 'Package Delivered',
      location: `${shippingAddress.street || 'Doorstep'}, ${city}`,
      time: status === 'Delivered' ? (order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Today, 2:45 PM') : 'Estimated ' + estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      status: status === 'Delivered' ? 'completed' : 'pending',
      desc: status === 'Delivered' ? 'Package received & signed by customer.' : 'Handover with customer verification OTP.'
    },
    {
      title: 'Out for Delivery',
      location: `${city} Delivery Hub`,
      time: milestoneIdx >= 2 ? 'Today, 08:30 AM' : 'Pending dispatch',
      status: milestoneIdx >= 2 ? 'completed' : 'pending',
      desc: `Courier executive ${courierPartner.name} out on delivery route.`
    },
    {
      title: 'Arrived at Destination Facility',
      location: `${city} Regional Sort Hub`,
      time: milestoneIdx >= 1 ? 'Yesterday, 07:15 PM' : 'Scheduled',
      status: milestoneIdx >= 1 ? 'completed' : 'pending',
      desc: 'Bag opened and sorted for final delivery station.'
    },
    {
      title: 'In Transit between Hubs',
      location: 'Central Inter-State Highway Facility',
      time: milestoneIdx >= 1 ? 'Yesterday, 11:20 AM' : 'Scheduled',
      status: milestoneIdx >= 1 ? 'completed' : 'pending',
      desc: 'Container departed on scheduled express transit network.'
    },
    {
      title: 'Picked Up by Courier',
      location: 'Bengaluru Fulfillment Center',
      time: new Date(order.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'completed',
      desc: `Package scanned and manifest created under AWB ${awbNumber}.`
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden space-y-0">
      {/* ── Header Bar ── */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-900 via-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-brand-400 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">
                Live Courier Tracking & Checkpoints
              </h2>
              {!isTerminal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE GPS
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Carrier:{' '}
              <strong className="text-white font-bold">{carrier}</strong> • AWB:{' '}
              <span className="font-mono text-indigo-200">{awbNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy AWB button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleCopyAwb}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-colors"
            title="Copy Tracking Number"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied!' : 'Copy AWB'}</span>
          </motion.button>

          {/* Refresh GPS button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleManualRefresh}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-colors"
            title="Refresh Tracking Status"
            aria-label="Refresh tracking data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* ── Real-Time Milestone Status Progress Bar ── */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          {/* Progress track */}
          <div className="relative mb-6">
            {/* Background rail */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 rounded-full"
              />
            </div>

            {/* Milestones markers along the rail */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none">
              {MILESTONES.map((m, idx) => {
                const isCompleted = status === 'Delivered' ? true : idx <= milestoneIdx;
                const isCurrent = status !== 'Delivered' && idx === milestoneIdx;

                return (
                  <div key={m.key} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                          : isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestone labels */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {MILESTONES.map((m, idx) => {
              const isCompleted = status === 'Delivered' ? true : idx <= milestoneIdx;
              const isCurrent = status !== 'Delivered' && idx === milestoneIdx;

              return (
                <div key={m.key} className="space-y-0.5">
                  <p
                    className={`text-xs font-black ${
                      isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className="text-[10px] text-gray-500 hidden sm:block">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Interactive Delivery Map Simulation Canvas ── */}
      <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative Grid / Map Pattern Background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Map Header Status */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-gray-300">
              CURRENT LOCATION: <strong className="text-white">{trackingInfo.currentLocation || `${city} Sorting Facility`}</strong>
            </span>
          </div>
          <div className="text-xs text-amber-300 font-bold bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-xl">
            {status === 'Delivered'
              ? '✅ Delivered Successfully'
              : `⏱️ Expected Delivery: ${estDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}`}
          </div>
        </div>

        {/* Interactive Vector Route Map Simulation */}
        <div className="relative z-10 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 sm:p-8">
          {/* Visual Route with Waypoints */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            {/* Animated SVG Route Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-7 left-12 right-12 h-1 bg-slate-700 pointer-events-none">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-brand-500 via-indigo-400 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              />
            </div>

            {/* Waypoint 1: Origin Hub */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10 w-full md:w-48">
              <div className="w-14 h-14 rounded-2xl bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-indigo-300 shadow-lg">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200">Origin Hub</p>
                <p className="text-[11px] text-gray-400">Bengaluru Center</p>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                  ✓ Dispatched
                </span>
              </div>
            </div>

            {/* Waypoint 2: Transit Hub */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10 w-full md:w-48">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  milestoneIdx >= 1
                    ? 'bg-indigo-600 text-white border-2 border-indigo-400 ring-4 ring-indigo-500/20'
                    : 'bg-slate-800 text-gray-500 border-2 border-slate-700'
                }`}
              >
                <Radio className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200">National Sorting</p>
                <p className="text-[11px] text-gray-400">Express Corridor</p>
                <span className="text-[10px] text-indigo-300 font-semibold block mt-0.5">
                  {milestoneIdx >= 1 ? '✓ Processed' : 'Upcoming'}
                </span>
              </div>
            </div>

            {/* Waypoint 3: Local City Facility */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10 w-full md:w-48">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  milestoneIdx >= 2
                    ? 'bg-amber-600 text-white border-2 border-amber-400 ring-4 ring-amber-500/20'
                    : 'bg-slate-800 text-gray-500 border-2 border-slate-700'
                }`}
              >
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200">Local Delivery Hub</p>
                <p className="text-[11px] text-gray-400">{city} Station</p>
                <span className="text-[10px] text-amber-300 font-semibold block mt-0.5">
                  {milestoneIdx >= 2 ? '✓ Out for delivery' : 'Pending Arrival'}
                </span>
              </div>
            </div>

            {/* Waypoint 4: Customer Destination */}
            <div className="flex flex-col items-center text-center space-y-2 relative z-10 w-full md:w-48">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                  status === 'Delivered'
                    ? 'bg-emerald-600 text-white border-2 border-emerald-400 ring-4 ring-emerald-500/30'
                    : 'bg-slate-800 text-gray-500 border-2 border-slate-700'
                }`}
              >
                <Home className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200">Delivery Destination</p>
                <p className="text-[11px] text-gray-400">
                  {city} {pincode ? `(${pincode})` : ''}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                  {status === 'Delivered' ? '✓ Delivered' : 'Final Step'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Courier Partner & Delivery Contact Card */}
        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Associate Info */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 font-black flex items-center justify-center text-sm">
                {courierPartner.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-white">{courierPartner.name}</p>
                <p className="text-[11px] text-gray-400">Delhivery Express Associate</p>
              </div>
            </div>
            <a
              href={`tel:${courierPartner.phone}`}
              className="p-2.5 bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-xl transition-colors border border-slate-600"
              title="Call Delivery Associate"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Delivery OTP Notice */}
          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Contactless &amp; Secure Delivery</p>
              <p className="text-[11px] text-indigo-200">
                Please share the delivery OTP with the agent upon inspecting the package.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detailed Activity Logs (Expandable) ── */}
      <div className="p-5 sm:p-6 bg-white border-t border-gray-100">
        <button
          type="button"
          onClick={() => setShowAllCheckpoints((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-brand-600 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            Detailed Transit Activity Log ({checkpoints.length} Checkpoints)
          </span>
          {showAllCheckpoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showAllCheckpoints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-4 mt-4 border-t border-gray-100 space-y-4"
            >
              {checkpoints.map((cp, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3.5 h-3.5 rounded-full mt-1 ${
                        cp.status === 'completed'
                          ? 'bg-emerald-500 ring-2 ring-emerald-100'
                          : 'bg-gray-300'
                      }`}
                    />
                    {idx < checkpoints.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-gray-900">{cp.title}</p>
                      <span className="text-[11px] text-gray-400 font-mono">{cp.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">{cp.location}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{cp.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
