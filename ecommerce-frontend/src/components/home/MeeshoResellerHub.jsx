import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Share2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

export default function MeeshoResellerHub({ onOpenResellerModal }) {
  const [wholesalePrice] = useState(1199);
  const [clientPrice, setClientPrice] = useState(1699);

  const profit = Math.max(0, clientPrice - wholesalePrice);

  const setPresetMargin = (marginAmount) => {
    setClientPrice(wholesalePrice + marginAmount);
  };

  const handleOpenReseller = () => {
    if (onOpenResellerModal) {
      onOpenResellerModal({
        title: 'Jaipur Handloom Festive Cottons (Set of 3 Kurti Tunics)',
        wholesalePrice: 1199,
        mrp: 2999,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
        category: "Women's Festive Ethnic"
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-emerald-500/10 via-surface to-teal-500/5 border border-emerald-500/25 rounded-3xl p-6 sm:p-10 shadow-card">
        
        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-3">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>MEESHO ZERO-CAPITAL RESELLER HUB</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Explainer & Live Profit Calculator (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
                Earn ₹25,000+ Monthly by Sharing on WhatsApp
              </h2>
              <p className="text-muted text-xs sm:text-sm mt-1.5 leading-relaxed">
                Start your zero-investment e-commerce business today. Pick authentic Indian artisanal products, set your custom profit margin, and share with family &amp; customers. Rigamart dispatches under your brand name and deposits profits directly into your UPI.
              </p>
            </div>

            {/* Live Interactive Profit Margin Simulator */}
            <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-line shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold text-ink uppercase tracking-wider">
                  Interactive Profit Margin Simulator
                </span>
                
                {/* Preset Margin Chips */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted font-medium">Quick Margin:</span>
                  {[300, 500, 800].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPresetMargin(m)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all cursor-pointer ${
                        profit === m
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                      }`}
                    >
                      +₹{m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                {/* 1. Wholesale Cost */}
                <div className="p-3 rounded-xl bg-canvas border border-line">
                  <span className="text-[11px] text-muted font-medium block mb-1">
                    Wholesale Base Price:
                  </span>
                  <span className="text-base font-black font-mono text-ink">
                    ₹{wholesalePrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* 2. Customer Price (Editable) */}
                <div className="p-3 rounded-xl bg-canvas border border-line">
                  <label htmlFor="reseller-client-price-input" className="text-[11px] text-muted font-medium block mb-1">
                    Your Customer Price:
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-muted font-mono">₹</span>
                    <input
                      id="reseller-client-price-input"
                      type="number"
                      min={wholesalePrice}
                      step={50}
                      value={clientPrice}
                      onChange={(e) => setClientPrice(Math.max(wholesalePrice, Number(e.target.value) || wholesalePrice))}
                      className="w-full bg-surface border border-emerald-300 dark:border-emerald-700 rounded-lg px-2 py-1 text-sm font-mono font-bold text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 3. Net Profit Display */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block mb-1">
                    Your Profit per Order:
                  </span>
                  <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{profit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payout Guarantee Note */}
              <p className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Sell just 2 orders a day with ₹{profit} margin = <strong className="text-ink font-bold">₹{(profit * 60).toLocaleString('en-IN')}/month</strong> deposited directly into your UPI ID.
                </span>
              </p>
            </div>

            {/* 3 Value Badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs text-ink font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Zero Platform Branding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Doorstep COD Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">24h Fast UPI Credit</span>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Wholesale Catalog Card (5 cols) */}
          <div className="lg:col-span-5 bg-surface border border-line rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-canvas">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
                alt="Jaipur Handloom Festive Cottons"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
                VERIFIED WHOLESALE DISPATCH
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Top Trending Reseller Catalog
              </span>
              <h3 className="text-base font-bold text-ink leading-snug mt-0.5">
                Jaipur Handloom Festive Cottons (Set of 3 Tunics)
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-muted">Wholesale:</span>
                <span className="text-base font-black font-mono text-ink">₹1,199</span>
                <span className="text-xs text-muted line-through font-mono">₹2,999</span>
                <span className="text-xs font-bold text-emerald-600">Save ₹1,800</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenReseller}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-card transition-all cursor-pointer active:scale-98"
            >
              <Share2 className="w-4 h-4 text-slate-950" />
              <span>Share Catalog on WhatsApp &amp; Earn ₹{profit}</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
