import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/api.js';
import { modalBackdropVariants, modalContentVariants } from '../../utils/animations.js';

export default function AddProductModal({ isOpen, onClose, onProductCreated }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');

  // Variants state
  const [variants, setVariants] = useState([
    { sku: '', price: '', mrp: '', stock: 10, size: 'M', color: 'Black' }
  ]);

  // Images state
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/categories')
        .then((res) => {
          setCategories(res.data.data?.categories || []);
          if (res.data.data?.categories?.[0]?._id) {
            setCategoryId(res.data.data.categories[0]._id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: '', price: basePrice || '', mrp: '', stock: 10, size: 'L', color: 'White' }
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImages(true);
    setError(null);

    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));

    try {
      const res = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imagesData = res.data.data?.images || [];
      setUploadedImages((prev) => [...prev, ...imagesData]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image(s)');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formattedVariants = variants.map((v) => ({
        sku: v.sku.trim(),
        price: parseFloat(v.price) || parseFloat(basePrice) || 0,
        mrp: parseFloat(v.mrp) || (parseFloat(v.price) || parseFloat(basePrice) || 0) * 1.25,
        stock: parseInt(v.stock, 10) || 0,
        size: v.size || 'Standard',
        color: v.color || 'Standard'
      }));

      const payload = {
        name,
        brand,
        description,
        category: categoryId,
        basePrice: parseFloat(basePrice),
        images: uploadedImages.length > 0 ? uploadedImages : [
          {
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            public_id: 'sample_placeholder',
            isPrimary: true
          }
        ],
        variants: formattedVariants
      };

      await api.post('/products', payload);
      if (onProductCreated) onProductCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 my-8 z-10 border border-line"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-muted hover:text-ink rounded-lg hover:bg-canvas transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

        <div>
          <h2 className="text-xl font-bold text-ink">List New Product on Rigamart</h2>
          <p className="text-xs text-muted mt-1">
            Provide details, high-resolution imagery, and variant inventory.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger-soft text-danger text-xs rounded-xl border border-danger/20">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Product Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Slim Fit Cotton Oxford Shirt"
                className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-lg text-sm text-ink outline-none focus:bg-surface focus:border-brand placeholder:text-muted/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Brand Name
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Raymond / Roadster"
                className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-lg text-sm text-ink outline-none focus:bg-surface focus:border-brand placeholder:text-muted/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Category
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-lg text-sm text-ink outline-none focus:bg-surface focus:border-brand"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Base Price (₹)
              </label>
              <input
                type="number"
                min="1"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="1499"
                className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-lg text-sm text-ink outline-none focus:bg-surface focus:border-brand placeholder:text-muted/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Description & Specifications
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Material, fit, wash care instructions, etc."
              className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-lg text-sm text-ink outline-none focus:bg-surface focus:border-brand placeholder:text-muted/60"
            />
          </div>

          {/* Cloudinary Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Product Images (Cloudinary CDN)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 border-2 border-dashed border-line hover:border-brand rounded-xl text-xs font-semibold text-muted hover:text-brand flex items-center gap-2 bg-canvas hover:bg-surface transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Media</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
              {uploadingImages && (
                <span className="text-xs text-brand flex items-center gap-1 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading to Cloudinary...
                </span>
              )}
            </div>

            {uploadedImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-2">
                {uploadedImages.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt="Upload thumbnail"
                    className="w-16 h-16 object-cover rounded-lg border border-line"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Variants Builder */}
          <div className="space-y-3 pt-2 border-t border-line">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Product Variants & Inventory Stock
              </label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-canvas rounded-xl border border-line grid grid-cols-2 sm:grid-cols-6 gap-2 items-center"
                >
                  <input
                    type="text"
                    required
                    placeholder="SKU (e.g. SHT-M-BLK)"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    className="px-2 py-1.5 bg-surface border border-line rounded text-xs text-ink placeholder:text-muted/60"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Price ₹"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                    className="px-2 py-1.5 bg-surface border border-line rounded text-xs text-ink placeholder:text-muted/60"
                  />
                  <input
                    type="number"
                    placeholder="MRP ₹"
                    value={v.mrp}
                    onChange={(e) => handleVariantChange(idx, 'mrp', e.target.value)}
                    className="px-2 py-1.5 bg-surface border border-line rounded text-xs text-ink placeholder:text-muted/60"
                  />
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    className="px-2 py-1.5 bg-surface border border-line rounded text-xs text-ink placeholder:text-muted/60"
                  />
                  <input
                    type="text"
                    placeholder="Size"
                    value={v.size}
                    onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                    className="px-2 py-1.5 bg-surface border border-line rounded text-xs text-ink placeholder:text-muted/60"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Color"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                      className="w-full px-2 py-1.5 bg-surface border border-line rounded text-xs text-ink placeholder:text-muted/60"
                    />
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 text-danger hover:text-danger/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-line text-muted text-xs font-semibold rounded-lg hover:bg-canvas hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Publish Product Listing
            </button>
          </div>
        </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
