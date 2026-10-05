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
          className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full my-8 overflow-hidden z-10 flex flex-col max-h-[90vh] border border-gray-100"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  Request Return / Refund
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Order #{order.orderNumber || order._id?.slice(-8)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
            {/* Rigamart Buyer Protection Strip */}
            <div className="p-3.5 bg-brand-50/70 border border-brand-200/80 rounded-2xl flex items-start gap-3 text-brand-900">
              <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-brand-800">100% Buyer Protection Guaranteed</p>
                <p className="text-[11px] text-brand-700/90 mt-0.5 leading-relaxed">
                  Free doorstep pickup arranged within 48 hours. Full refund or replacement issued upon verification of returned goods.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Category Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
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
                      className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <span className={`font-bold ${isSelected ? 'text-brand-900' : 'text-gray-800'}`}>
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-1">
                        {cat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Reason / Summary */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Short Description / Issue Summary *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Sole detached after 1 day of light use"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>

            {/* Detailed Comments */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Additional Comments / Details
              </label>
              <textarea
                rows={3}
                placeholder="Share any details that can help the seller process your return faster..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 resize-none"
              />
            </div>

            {/* Photo Evidence Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-brand-600" />
                  2. Upload Photo Proof (Optional, Max 4)
                </label>
                <span className="text-[10px] text-gray-400 font-mono">
                  {photos.length}/4 uploaded
                </span>
              </div>

              {/* Photo preview gallery */}
              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                      <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
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
                    className="w-full py-4 border-2 border-dashed border-gray-200 hover:border-brand-400 bg-gray-50/70 hover:bg-brand-50/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    {uploadingPhotos ? (
                      <div className="flex items-center gap-2 text-brand-600 font-bold">
                        <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        <span>Uploading evidence photos...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="font-bold text-gray-700">Click to upload photo evidence</span>
                        <span className="text-[10px] text-gray-400">JPG, PNG, WebP up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Preferred Resolution */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                3. Preferred Resolution
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResolutionType('REFUND')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    resolutionType === 'REFUND'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className="font-black text-gray-900">Full Refund</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Credit to original payment method or bank account
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionType('REPLACEMENT')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    resolutionType === 'REPLACEMENT'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className="font-black text-gray-900">Replacement</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Exchange for a brand new identical unit
                  </p>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || uploadingPhotos}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
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
