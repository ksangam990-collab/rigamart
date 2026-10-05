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
        <div className="bg-surface p-4 rounded-2xl border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Action Needed</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning font-mono">{requestedCount}</div>
          <p className="text-[10px] text-muted">Pending review &amp; approval</p>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <Truck className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-bold text-brand font-mono">{activeCount}</div>
          <p className="text-[10px] text-muted">Pickup or hub inspection</p>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Settled &amp; Refunded</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-success font-mono">{refundedCount}</div>
          <p className="text-[10px] text-muted">Inventory restocked</p>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-line shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Declined</span>
            <XCircle className="w-4 h-4 text-danger" />
          </div>
          <div className="text-2xl font-bold text-danger font-mono">{rejectedCount}</div>
          <p className="text-[10px] text-muted">Policy non-compliant</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-line">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-brand text-white shadow-2xs font-bold'
                  : 'bg-canvas hover:bg-surface border border-line text-muted hover:text-ink'
              } ${tab.highlight && filter !== tab.id ? 'ring-2 ring-warning/40 font-bold' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="text-xs font-semibold text-muted hover:text-brand flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Returns List */}
      {filteredReturns.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-line p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-canvas text-muted mx-auto flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-ink">No return requests found</h4>
          <p className="text-xs text-muted">
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
                className="bg-surface rounded-2xl border border-line p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-ink">
                      #{ord.orderNumber || ord._id.slice(-8)}
                    </span>
                    <span className="text-[11px] text-muted font-medium">
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
                          ? 'bg-success-soft text-success border-success/30'
                          : status === 'Rejected'
                          ? 'bg-danger-soft text-danger border-danger/30'
                          : status === 'Pickup_Scheduled'
                          ? 'bg-brand/10 text-brand border-brand/20'
                          : status === 'Item_Received'
                          ? 'bg-brand/10 text-brand border-brand/20'
                          : status === 'Approved'
                          ? 'bg-brand/10 text-brand border-brand/20'
                          : 'bg-warning-soft text-warning border-warning/30'
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
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                      Buyer &amp; Shipping Node
                    </span>
                    <p className="font-bold text-ink">{ord.shippingAddress?.name || 'Customer'}</p>
                    <p className="text-muted">
                      {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                    </p>
                    <p className="text-[11px] text-muted">Mobile: +91-{ord.shippingAddress?.mobile}</p>
                    <p className="font-bold text-ink pt-1 font-mono">
                      Order Amount: ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Return reason & comments */}
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                        Issue Category:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-canvas border border-line font-bold text-ink text-[10px]">
                        {req.reasonCategory?.replace(/_/g, ' ') || 'GENERAL'}
                      </span>
                      <span className="text-[10px] text-muted">
                        • Preference:{' '}
                        <strong className="text-ink">{req.resolutionType === 'REPLACEMENT' ? 'Replacement' : 'Full Refund'}</strong>
                      </span>
                    </div>

                    <p className="font-bold text-ink mt-1">"{req.reason}"</p>
                    {req.comments && (
                      <p className="text-ink bg-canvas p-2.5 rounded-xl border border-line mt-1 italic leading-relaxed">
                        "{req.comments}"
                      </p>
                    )}

                    {req.sellerNotes && (
                      <div className="mt-2 p-2 bg-brand/10 border border-brand/20 rounded-xl text-ink text-[11px]">
                        <strong>Your Note:</strong> {req.sellerNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence Photos */}
                {req.photos && req.photos.length > 0 && (
                  <div className="pt-2 border-t border-line flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                      <Camera className="w-3 h-3 text-brand" />
                      Photo Proofs:
                    </span>
                    <div className="flex gap-2">
                      {req.photos.map((photoUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhoto(photoUrl)}
                          className="relative w-12 h-12 rounded-lg overflow-hidden border border-line hover:border-brand shadow-2xs transition-all group"
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
                <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-muted">
                    {req.pickupDate && (
                      <span className="text-brand font-bold">
                        Pickup Date: {new Date(req.pickupDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'Requested' && (
                      <>
                        <button
                          onClick={() => openActionModal(ord, 'Rejected')}
                          className="px-3 py-1.5 bg-danger-soft hover:bg-danger/20 text-danger font-bold text-xs rounded-xl transition-colors border border-danger/30"
                        >
                          Decline Request
                        </button>

                        <button
                          onClick={() => openActionModal(ord, 'Approved')}
                          className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
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
                          className="px-3.5 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand font-bold text-xs rounded-xl transition-colors border border-brand/20 flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Pickup</span>
                        </button>

                        <button
                          onClick={() => openActionModal(ord, 'Item_Received')}
                          className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-xl transition-colors"
                        >
                          Mark Item Received
                        </button>
                      </>
                    )}

                    {status === 'Pickup_Scheduled' && (
                      <button
                        onClick={() => openActionModal(ord, 'Item_Received')}
                        className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Received at Hub</span>
                      </button>
                    )}

                    {status === 'Item_Received' && (
                      <button
                        onClick={() => openActionModal(ord, 'Refunded')}
                        className="px-4 py-1.5 bg-success hover:bg-success/90 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Issue Refund &amp; Restock</span>
                      </button>
                    )}

                    {status === 'Refunded' && (
                      <span className="text-xs font-bold text-success flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Refund Processed &amp; Inventory Restocked
                      </span>
                    )}

                    {status === 'Rejected' && (
                      <span className="text-xs font-bold text-danger flex items-center gap-1">
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
              className="relative max-w-2xl w-full bg-surface rounded-2xl overflow-hidden shadow-2xl p-2 border border-line"
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
              className="relative max-w-md w-full bg-surface rounded-3xl p-6 shadow-2xl space-y-4 border border-line"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-brand" />
                  <span>Update Return Status</span>
                </h3>
                <button
                  onClick={() => setActiveActionModal(null)}
                  disabled={isSubmitting}
                  className="p-1 rounded-full text-muted hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {actionError && (
                <div className="p-3 bg-danger-soft border border-danger/30 text-danger rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <p className="text-xs text-muted">
                You are changing the return status for Order{' '}
                <strong className="text-ink">#{activeActionModal.order.orderNumber || activeActionModal.order._id.slice(-8)}</strong>{' '}
                to <span className="font-bold text-brand">'{activeActionModal.targetStatus.replace(/_/g, ' ')}'</span>.
              </p>

              {activeActionModal.targetStatus === 'Pickup_Scheduled' && (
                <div className="space-y-1 text-xs">
                  <label className="block font-semibold text-muted">Scheduled Courier Pickup Date *</label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-line text-ink rounded-xl text-xs outline-none focus:border-brand"
                  />
                </div>
              )}

              {activeActionModal.targetStatus === 'Refunded' && (
                <div className="p-3 bg-success-soft border border-success/30 rounded-xl text-xs text-success space-y-1">
                  <p className="font-bold">Automated Settlement:</p>
                  <p className="text-[11px]">
                    This will credit a full refund of ₹{activeActionModal.order.totalAmount?.toLocaleString('en-IN')} to the buyer and automatically restock variant inventory.
                  </p>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <label className="block font-semibold text-muted">
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
                  className="w-full p-2.5 bg-canvas border border-line text-ink placeholder:text-muted/60 rounded-xl text-xs focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-line text-muted font-bold rounded-xl hover:bg-canvas hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                    activeActionModal.targetStatus === 'Rejected'
                      ? 'bg-danger hover:bg-danger/90'
                      : activeActionModal.targetStatus === 'Refunded'
                      ? 'bg-success hover:bg-success/90'
                      : 'bg-brand hover:bg-brand-dark'
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
