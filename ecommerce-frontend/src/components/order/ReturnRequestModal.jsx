import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Camera,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../../utils/api.js';
import { modalBackdropVariants, modalPanelVariants } from '../../utils/animations.js';

const REASON_CATEGORIES = [
  { id: 'DEFECTIVE_DAMAGED', label: 'Defective or Damaged Item', desc: 'Item arrived broken, torn, or non-functional' },
  { id: 'WRONG_ITEM', label: 'Wrong Item or Size Sent', desc: 'Different product, color, or size delivered' },
  { id: 'NOT_AS_DESCRIBED', label: 'Not as Described', desc: 'Product differs materially from catalog photos or specifications' },
  { id: 'SIZE_FIT_ISSUE', label: 'Size / Fit Issue', desc: 'Too tight, too loose, or incorrect dimensions' },
  { id: 'QUALITY_UNSATISFACTORY', label: 'Quality Below Expectation', desc: 'Fabric, material, or finish not satisfactory' },
  { id: 'OTHER', label: 'Other Inquiries', desc: 'Ordered by mistake or changed mind' }
];

export default function ReturnRequestModal({
  order,
  isOpen,
  onClose,
  onSuccess
}) {
  const [category, setCategory] = useState('DEFECTIVE_DAMAGED');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [resolutionType, setResolutionType] = useState('REFUND');
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > 4) {
      setErrorMessage('You can upload a maximum of 4 photos as return proof.');
      return;
    }

    setUploadingPhotos(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));

      const res = await api.post('/upload/return-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedUrls = (res.data.data?.images || res.data.data || []).map((img) =>
        typeof img === 'string' ? img : img.url
      );

      setPhotos((prev) => [...prev, ...uploadedUrls].slice(0, 4));
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to upload photo evidence. Please try again.'
      );
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const finalReason = reason.trim() || REASON_CATEGORIES.find((c) => c.id === category)?.label;
    if (!finalReason) {
      setErrorMessage('Please state the primary reason for returning this item.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/orders/${order._id}/return`, {
        reason: finalReason,
        reasonCategory: category,
        comments: comments.trim(),
        photos,
        resolutionType
      });

      if (onSuccess) {
        onSuccess(res.data.data?.order || res.data.data);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Unable to submit return request. Please try again later.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={!submitting ? onClose : undefined}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          variants={modalPanelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-surface rounded-none sm:rounded-sm shadow-overlay max-w-xl w-full my-8 overflow-hidden z-10 flex flex-col max-h-[90vh] border border-line"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-line flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-sm bg-brand/10 border border-brand/20 text-brand flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink leading-tight">
                  Request Return / Refund
                </h3>
                <p className="text-xs text-muted font-mono mt-0.5">
                  Order #{order.orderNumber || order._id?.slice(-8)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 text-muted hover:text-ink rounded hover:bg-canvas transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs bg-surface">
            {/* Rigamart Buyer Protection Strip */}
            <div className="p-3.5 bg-canvas border border-line rounded-none flex items-start gap-3 text-ink">
              <ShieldCheck className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">100% Buyer Protection Guaranteed</p>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  Free doorstep pickup arranged within 48 hours. Full refund or replacement issued upon verification of returned goods.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-danger-soft border border-danger/20 text-danger rounded-sm flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Category Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                1. Select Reason Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REASON_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`text-left p-3 rounded-sm border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand bg-brand/5 ring-1 ring-brand'
                          : 'border-line hover:border-line/80 bg-surface'
                      }`}
                    >
                      <span className={`font-bold ${isSelected ? 'text-brand' : 'text-ink'}`}>
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-muted mt-1 leading-tight line-clamp-1">
                        {cat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Reason / Summary */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted">
                Short Description / Issue Summary *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Sole detached after 1 day of light use"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-line rounded text-xs text-ink placeholder-muted/60 focus:outline-none focus:border-brand"
              />
            </div>

            {/* Detailed Comments */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted">
                Additional Comments / Details
              </label>
              <textarea
                rows={3}
                placeholder="Share any details that can help the seller process your return faster..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-line rounded text-xs text-ink placeholder-muted/60 focus:outline-none focus:border-brand resize-none"
              />
            </div>

            {/* Photo Evidence Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-brand" />
                  2. Upload Photo Proof (Optional, Max 4)
                </label>
                <span className="text-[10px] text-muted font-mono">
                  {photos.length}/4 uploaded
                </span>
              </div>

              {/* Photo preview gallery */}
              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-none overflow-hidden border border-line group bg-canvas">
                      <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-danger text-white rounded transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload trigger */}
              {photos.length < 4 && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="return-photo-input"
                  />
                  <label
                    htmlFor="return-photo-input"
                    className="w-full py-4 border border-dashed border-line hover:border-brand bg-canvas hover:bg-surface rounded-none flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    {uploadingPhotos ? (
                      <div className="flex items-center gap-2 text-brand font-semibold">
                        <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                        <span>Uploading evidence photos...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-muted mb-1" />
                        <span className="font-semibold text-ink">Click to upload photo evidence</span>
                        <span className="text-[10px] text-muted">JPG, PNG, WebP up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Preferred Resolution */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                3. Preferred Resolution
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResolutionType('REFUND')}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    resolutionType === 'REFUND'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand'
                      : 'border-line bg-surface hover:border-line/80'
                  }`}
                >
                  <p className="font-bold text-ink">Full Refund</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Credit to original payment method or bank account
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionType('REPLACEMENT')}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    resolutionType === 'REPLACEMENT'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand'
                      : 'border-line bg-surface hover:border-line/80'
                  }`}
                >
                  <p className="font-bold text-ink">Replacement</p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Exchange for a brand new identical unit
                  </p>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded border border-line text-muted font-semibold hover:bg-canvas hover:text-ink transition-colors disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || uploadingPhotos}
                className="px-6 py-2 bg-ink hover:bg-black text-white font-bold rounded transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Return Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
