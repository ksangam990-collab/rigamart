import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  XCircle,
  Camera,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X
} from 'lucide-react';
import api from '../../utils/api.js';
import { staggerContainer, staggerItem } from '../../utils/animations.js';

export default function SellerReturnsTab({
  returns = [],
  isLoading = false,
  onRefresh
}) {
  const [filter, setFilter] = useState('all'); // all | requested | active | completed | rejected
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [activeActionModal, setActiveActionModal] = useState(null); // { order, targetStatus }
  const [sellerNote, setSellerNote] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Counts
  const requestedCount = returns.filter((r) => r.returnRequest?.status === 'Requested').length;
  const activeCount = returns.filter((r) =>
    ['Approved', 'Pickup_Scheduled', 'Item_Received'].includes(r.returnRequest?.status)
  ).length;
  const refundedCount = returns.filter((r) => r.returnRequest?.status === 'Refunded').length;
  const rejectedCount = returns.filter((r) => r.returnRequest?.status === 'Rejected').length;

  const filteredReturns = returns.filter((ord) => {
    const s = ord.returnRequest?.status || 'Requested';
    if (filter === 'requested') return s === 'Requested';
    if (filter === 'active') return ['Approved', 'Pickup_Scheduled', 'Item_Received'].includes(s);
    if (filter === 'completed') return s === 'Refunded';
    if (filter === 'rejected') return s === 'Rejected';
    return true;
  });

  const openActionModal = (order, targetStatus) => {
    setActiveActionModal({ order, targetStatus });
    setSellerNote('');
    // Default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPickupDate(tomorrow.toISOString().split('T')[0]);
    setActionError('');
  };

  const handleConfirmAction = async () => {
    if (!activeActionModal) return;
    const { order, targetStatus } = activeActionModal;

    if (targetStatus === 'Rejected' && !sellerNote.trim()) {
      setActionError('Please provide a reason explaining why the return request is declined.');
      return;
    }

    setIsSubmitting(true);
    setActionError('');

    try {
      await api.put(`/seller/orders/${order._id}/return-status`, {
        status: targetStatus,
        sellerNotes: sellerNote.trim(),
        pickupDate: targetStatus === 'Pickup_Scheduled' ? pickupDate : undefined
      });

      setActiveActionModal(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update return status. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Action Needed</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{requestedCount}</div>
          <p className="text-[10px] text-gray-500">Pending review &amp; approval</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{activeCount}</div>
          <p className="text-[10px] text-gray-500">Pickup or hub inspection</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settled &amp; Refunded</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{refundedCount}</div>
          <p className="text-[10px] text-gray-500">Inventory restocked</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Declined</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{rejectedCount}</div>
          <p className="text-[10px] text-gray-500">Policy non-compliant</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All Returns (${returns.length})` },
            { id: 'requested', label: `Pending (${requestedCount})`, highlight: requestedCount > 0 },
            { id: 'active', label: `In Transit (${activeCount})` },
            { id: 'completed', label: `Refunded (${refundedCount})` },
            { id: 'rejected', label: `Declined (${rejectedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } ${tab.highlight && filter !== tab.id ? 'ring-2 ring-amber-400/70 font-black' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="text-xs font-bold text-gray-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Returns List */}
      {filteredReturns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 mx-auto flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-gray-800">No return requests found</h4>
          <p className="text-xs text-gray-400">
            {filter === 'all'
              ? 'Your customers have not filed any return or replacement requests.'
              : `No return cases match the "${filter}" filter.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((ord) => {
            const req = ord.returnRequest || {};
            const status = req.status || 'Requested';

            return (
              <motion.div
                key={ord._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-gray-900">
                      #{ord.orderNumber || ord._id.slice(-8)}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Requested{' '}
                      {new Date(req.requestedAt || ord.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        status === 'Refunded'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : status === 'Pickup_Scheduled'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : status === 'Item_Received'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : status === 'Approved'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {status === 'Requested' && 'Action Required'}
                      {status === 'Approved' && 'Approved (Pickup Pending)'}
                      {status === 'Pickup_Scheduled' && 'Pickup Scheduled'}
                      {status === 'Item_Received' && 'Hub Received & Verified'}
                      {status === 'Refunded' && 'Refund Settled'}
                      {status === 'Rejected' && 'Declined'}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer info */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Buyer &amp; Shipping Node
                    </span>
                    <p className="font-bold text-gray-800">{ord.shippingAddress?.name || 'Customer'}</p>
                    <p className="text-gray-500">
                      {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                    </p>
                    <p className="text-[11px] text-gray-400">Mobile: +91-{ord.shippingAddress?.mobile}</p>
                    <p className="font-black text-gray-900 pt-1">
                      Order Amount: ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Return reason & comments */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Issue Category:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-bold text-gray-700 text-[10px]">
                        {req.reasonCategory?.replace(/_/g, ' ') || 'GENERAL'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        • Preference:{' '}
                        <strong>{req.resolutionType === 'REPLACEMENT' ? 'Replacement' : 'Full Refund'}</strong>
                      </span>
                    </div>

                    <p className="font-bold text-gray-900 mt-1">"{req.reason}"</p>
                    {req.comments && (
                      <p className="text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-1 italic leading-relaxed">
                        "{req.comments}"
                      </p>
                    )}

                    {req.sellerNotes && (
                      <div className="mt-2 p-2 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                        <strong>Your Note:</strong> {req.sellerNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence Photos */}
                {req.photos && req.photos.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3 h-3 text-brand-600" />
                      Photo Proofs:
                    </span>
                    <div className="flex gap-2">
                      {req.photos.map((photoUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhoto(photoUrl)}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-brand-500 shadow-2xs transition-all group"
                          title="Click to view full photo"
                        >
                          <img
                            src={photoUrl}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons bar */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-gray-400">
                    {req.pickupDate && (
                      <span className="text-purple-700 font-bold">
                        Pickup Date: {new Date(req.pickupDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'Requested' && (
                      <>
                        <button
                          onClick={() => openActionModal(ord, 'Rejected')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors border border-rose-200"
                        >
                          Decline Request
                        </button>

                        <button
                          onClick={() => openActionModal(ord, 'Approved')}
                          className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Return</span>
                        </button>
                      </>
                    )}

                    {status === 'Approved' && (
                      <>
                        <button
                          onClick={() => openActionModal(ord, 'Pickup_Scheduled')}
                          className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors border border-purple-200 flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Pickup</span>
                        </button>

                        <button
                          onClick={() => openActionModal(ord, 'Item_Received')}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
                        >
                          Mark Item Received
                        </button>
                      </>
                    )}

                    {status === 'Pickup_Scheduled' && (
                      <button
                        onClick={() => openActionModal(ord, 'Item_Received')}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Received at Hub</span>
                      </button>
                    )}

                    {status === 'Item_Received' && (
                      <button
                        onClick={() => openActionModal(ord, 'Refunded')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Issue Refund &amp; Restock</span>
                      </button>
                    )}

                    {status === 'Refunded' && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Refund Processed &amp; Inventory Restocked
                      </span>
                    )}

                    {status === 'Rejected' && (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Return Dispute Closed
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Evidence Photo Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={selectedPhoto}
                alt="Return evidence"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {activeActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-brand-600" />
                  <span>Update Return Status</span>
                </h3>
                <button
                  onClick={() => setActiveActionModal(null)}
                  disabled={isSubmitting}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <p className="text-xs text-gray-600">
                You are changing the return status for Order{' '}
                <strong>#{activeActionModal.order.orderNumber || activeActionModal.order._id.slice(-8)}</strong>{' '}
                to <span className="font-bold text-brand-600">'{activeActionModal.targetStatus.replace(/_/g, ' ')}'</span>.
              </p>

              {activeActionModal.targetStatus === 'Pickup_Scheduled' && (
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-700">Scheduled Courier Pickup Date *</label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-brand-600"
                  />
                </div>
              )}

              {activeActionModal.targetStatus === 'Refunded' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">Automated Settlement:</p>
                  <p className="text-[11px]">
                    This will credit a full refund of ₹{activeActionModal.order.totalAmount?.toLocaleString('en-IN')} to the buyer and automatically restock variant inventory.
                  </p>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-700">
                  {activeActionModal.targetStatus === 'Rejected'
                    ? 'Reason for Declining (Required for buyer) *'
                    : 'Seller Note for Customer (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={sellerNote}
                  onChange={(e) => setSellerNote(e.target.value)}
                  placeholder={
                    activeActionModal.targetStatus === 'Rejected'
                      ? 'e.g., Photos show item has been altered or missing security tags...'
                      : 'Add any delivery instructions or updates for the customer...'
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-600 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                    activeActionModal.targetStatus === 'Rejected'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : activeActionModal.targetStatus === 'Refunded'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Confirm Update</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
