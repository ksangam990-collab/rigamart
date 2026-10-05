import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee, Globe, LayoutDashboard, Wallet, Headphones, BadgeCheck, PackageCheck, Truck, Sparkles, Megaphone } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, buttonHover, buttonTap } from '../utils/animations.js';
import { Button, Badge } from '../components/ui/index.js';

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Create Account',
    desc: "Sign up free, choose 'I'm a Seller' during registration.",
  },
  {
    num: '02',
    title: 'List Your Products',
    desc: 'Upload photos, set prices, and add variant inventory. Go live in minutes.',
  },
  {
    num: '03',
    title: 'Fulfill & Get Paid',
    desc: 'Receive customer orders, ship products, and receive scheduled payouts.',
  },
];

const BENEFITS = [
  {
    icon: IndianRupee,
    title: '₹0 Listing Fees',
    desc: 'No upfront charges to list. Pay transparent commission only when you sell.',
    color: 'text-brand bg-brand-soft',
  },
  {
    icon: Globe,
    title: 'Multi-Vendor Logistics',
    desc: 'Automated tracking, live courier milestones, and simulated status pipeline.',
    color: 'text-brand bg-brand-soft',
  },
  {
    icon: LayoutDashboard,
    title: 'Seller Dashboard',
    desc: 'Real-time sales analytics, low-stock warnings, and order management.',
    color: 'text-brand bg-brand-soft',
  },
  {
    icon: Wallet,
    title: 'Razorpay Integration',
    desc: 'Secure payment captures and settlement tracking architecture.',
    color: 'text-accent bg-accent-soft',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    desc: 'Built-in notification alerts and order inquiry resolution tools.',
    color: 'text-brand bg-brand-soft',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Merchant Trust',
    desc: 'Verification badges build instant buyer confidence across the catalog.',
    color: 'text-brand bg-brand-soft',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SellPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-dark text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="inline-block text-xs font-mono font-bold tracking-widest uppercase bg-white/10 border border-white/20 rounded-sm px-3.5 py-1 mb-6"
          >
            Seller Central
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto tracking-tight"
          >
            Reach Discerning Buyers.{' '}
            <span className="text-white/90">Sell on Rigamart.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.16 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Empower your brand with direct catalog ownership, multi-variant SKU inventory management, and pan-India fulfillment.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.24 }}
          >
            <Link to="/register">
              <button className="inline-flex items-center gap-2 bg-surface text-ink font-bold px-8 py-3.5 rounded hover:bg-canvas transition-colors text-xs uppercase tracking-wider border border-white/20">
                <span>Start Selling for Free</span>
                <ArrowRight className="w-4 h-4 text-brand" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">How It Works</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">Three simple steps to publish and sell factory-direct.</p>
          </div>

          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {STEPS.map((step) => (
              <motion.div key={step.num} variants={staggerItem} className="text-center relative">
                <div className="w-14 h-14 rounded-none bg-canvas text-brand border border-line flex items-center justify-center mx-auto mb-5">
                  <span className="text-xl font-bold font-mono text-ink">{step.num}</span>
                </div>
                <h3 className="font-bold text-ink text-base mb-2">{step.title}</h3>
                <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Benefits Grid ────────────────────────────────────────────────── */}
      <section className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Platform Capabilities</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted max-w-lg mx-auto">
              Engineered to support modern merchant workflows and complete catalog independence.
            </p>
          </div>

          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={staggerItem}
                  className="bg-surface rounded-none p-6 border border-line hover:border-muted/50 transition-all flex gap-4"
                >
                  <div className={`p-3 rounded shrink-0 ${benefit.color}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Partner Programs ─────────────────────────────────────────────── */}
      <section className="py-20 bg-surface border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Marketplace Ecosystem</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted">Extensions designed for scalable multi-vendor operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div id="wholesale" className="bg-canvas rounded-none p-7 border border-line scroll-mt-24 space-y-3">
              <Badge variant="secondary" size="sm">
                Wholesale Architecture
              </Badge>
              <div className="w-12 h-12 rounded bg-brand-soft text-brand flex items-center justify-center font-bold">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Wholesale &amp; B2B Sourcing</h3>
              <p className="text-xs text-muted leading-relaxed">
                Connect directly with certified manufacturers for bulk inventory. Volume-tiered pricing, GST input tax credit invoices, and credit terms for qualified buyers.
              </p>
            </div>

            <div id="supply-chain" className="bg-canvas rounded-none p-7 border border-line scroll-mt-24 space-y-3">
              <Badge variant="secondary" size="sm">
                Logistics Core
              </Badge>
              <div className="w-12 h-12 rounded bg-brand-soft text-brand flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Supply Chain &amp; Fulfillment Hub</h3>
              <p className="text-xs text-muted leading-relaxed">
                Plug your inventory into Rigamart's automated logistics network. Doorstep pick-up, automated tracking, and RTO reduction workflows.
              </p>
            </div>

            <div id="affiliate" className="bg-canvas rounded-none p-7 border border-line scroll-mt-24 space-y-3">
              <Badge variant="secondary" size="sm">
                Creator Network
              </Badge>
              <div className="w-12 h-12 rounded bg-brand-soft text-brand flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Affiliate &amp; Creator Program</h3>
              <p className="text-xs text-muted leading-relaxed">
                Earn commissions by sharing curated Rigamart product links with your audience. Access real-time analytics, automated payouts, and campaign assets.
              </p>
            </div>

            <div id="advertise" className="bg-canvas rounded-none p-7 border border-line scroll-mt-24 space-y-3">
              <Badge variant="secondary" size="sm">
                Brand Discovery
              </Badge>
              <div className="w-12 h-12 rounded bg-brand-soft text-brand flex items-center justify-center font-bold">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Brand Advertising &amp; Sponsored Spots</h3>
              <p className="text-xs text-muted leading-relaxed">
                Promote products at the top of category searches and buyer feeds with keyword targeting and transparent CPC analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-brand py-16 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
              Ready to Launch Your Vendor Store?
            </h2>
            <p className="text-white/85 mb-8 max-w-lg mx-auto text-sm">
              Complete seller onboarding, publish items, and manage fulfillment operations in real time.
            </p>
            <div>
              <Link to="/register">
                <button className="inline-flex items-center gap-2 bg-surface text-ink font-bold px-8 py-3.5 rounded hover:bg-canvas transition-colors text-xs uppercase tracking-wider border border-white/20">
                  <span>Create Seller Account</span>
                  <ArrowRight className="w-4 h-4 text-brand" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
