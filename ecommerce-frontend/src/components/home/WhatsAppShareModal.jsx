import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Check, Copy, Share2, Sparkles, TrendingUp } from 'lucide-react';

const DEFAULT_PRODUCT = {
  title: 'Aura Studio ANC Wireless Headphones',
  wholesalePrice: 2399,
  mrp: 5999,
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  category: 'Electronics & Audio'
};

export default function WhatsAppShareModal({
  isOpen,
  onClose,
  product: rawProduct
}) {
  const product = rawProduct || DEFAULT_PRODUCT;
  const wholesale = product.wholesalePrice || 2399;
  const [clientPrice, setClientPrice] = useState(wholesale + 400);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync clientPrice when product changes
  React.useEffect(() => {
    if (product?.wholesalePrice) {
      setClientPrice(product.wholesalePrice + 400);
    }
  }, [product?.wholesalePrice]);

  if (!isOpen) return null;

  const profit = Math.max(0, clientPrice - (product.wholesalePrice || 0));
  const shareMessage = `🔥 *Special Direct Deal: ${product.title}*\n\nPrice: *₹${clientPrice.toLocaleString('en-IN')}* (MRP: ~₹${product.mrp?.toLocaleString('en-IN') || ''}~)\n\n✅ 100% Brand Sealed & Verified\n⚡ 24h Express Dispatch\n💵 Cash on Delivery Available\n🔄 7-Day Doorstep Returns\n\nOrder via WhatsApp or tap here to view details: ${window.location.origin}/search?q=${encodeURIComponent(product.title)}`;

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(shareMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-surface border border-line rounded-3xl shadow-elevation overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-line bg-gradient-to-r from-emerald-500/10 via-surface to-surface">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-1.5">
                  <span>Meesho-Style WhatsApp Reselling</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Zero Capital</span>
                </h3>
                <p className="text-xs text-muted">Add your custom margin. We ship and collect COD under your name.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted hover:text-ink hover:bg-canvas transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Product Item Bar */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-canvas border border-line">
              <img
                src={product.image}
                alt={product.title}
                className="w-14 h-14 rounded-xl object-cover border border-line shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  {product.category || 'Curated Catalog'}
                </span>
                <h4 className="text-xs font-bold text-ink truncate leading-snug">
                  {product.title}
                </h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs text-muted">Wholesale Cost:</span>
                  <strong className="text-xs font-bold text-ink font-mono">₹{product.wholesalePrice?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Profit Margin Calculator */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Your Customer Final Price:
                </span>
                <span className="text-[11px] text-emerald-700">Enter what buyer pays</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">₹</span>
                  <input
                    type="number"
                    value={clientPrice}
                    onChange={(e) => setClientPrice(Math.max(product.wholesalePrice, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-surface border border-emerald-300 rounded-xl font-mono text-sm font-bold text-ink outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white shrink-0 text-center">
                  <span className="text-[9px] uppercase tracking-wider block font-semibold text-emerald-100">Your Profit</span>
                  <strong className="text-sm font-black font-mono">₹{profit.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <p className="text-[11px] text-emerald-800 leading-normal">
                💰 When your client pays ₹{clientPrice.toLocaleString('en-IN')}, Rigamart dispatches the order with zero platform branding. Your <strong>₹{profit.toLocaleString('en-IN')} profit</strong> is credited directly to your UPI ID within 24 hours of delivery.
              </p>
            </div>

            {/* Message Preview Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted flex items-center justify-between">
                <span>WhatsApp Message Preview:</span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-[11px] text-brand hover:underline flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                </button>
              </label>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto border border-slate-800">
                {shareMessage}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-line bg-canvas flex items-center gap-2.5">
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Share on WhatsApp & Start Earning</span>
            </button>
            <button
              onClick={handleCopyText}
              className="px-4 py-3 rounded-xl border border-line bg-surface hover:bg-canvas text-ink text-xs font-bold transition-colors"
            >
              Copy
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
