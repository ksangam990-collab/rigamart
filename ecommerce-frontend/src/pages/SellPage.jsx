import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee, Globe, LayoutDashboard, Wallet, Headphones, BadgeCheck, PackageCheck, Truck, Sparkles, Megaphone } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, buttonHover, buttonTap } from '../utils/animations.js';

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Create Account',
    desc: "Sign up free, choose 'Seller' role during registration.",
  },
  {
    num: '02',
    title: 'List Your Products',
    desc: 'Upload photos, set prices, and add variants. Go live in minutes.',
  },
  {
    num: '03',
    title: 'Get Paid',
    desc: 'Receive orders, ship products, get payouts every 7 days.',
  },
];

const BENEFITS = [
  {
    icon: IndianRupee,
    title: '₹0 Listing Fees',
    desc: 'No charges to list. Pay only when you sell.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Globe,
    title: 'Multi-Vendor Logistics',
    desc: 'Automated tracking and simulated delivery status pipeline.',
    color: 'text-brand-600 bg-brand-50',
  },
  {
    icon: LayoutDashboard,
    title: 'Seller Dashboard',
    desc: 'Real-time analytics, inventory, and order management.',
    color: 'text-violet-600 bg-violet-50',
  },
  {
    icon: Wallet,
    title: 'Razorpay Integration',
    desc: 'Test mode payment flow and settlement tracking architecture.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Headphones,
    title: 'Support Channels',
    desc: 'Built-in notification alerts and order inquiry management.',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: BadgeCheck,
    title: 'Buyer Trust Signals',
    desc: 'Verification badges build instant buyer confidence.',
    color: 'text-teal-600 bg-teal-50',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SellPage() {
  return (
    <div className="font-sans">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-400/10 blur-2xl" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6"
          >
            Seller Architecture Demo
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto"
          >
            Multi-Vendor Architecture.{' '}
            <span className="text-amber-400">Sell on Rigamart.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.16 }}
            className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Explore seller onboarding, catalog creation, SKU variant management, and live order tracking.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.24 }}
          >
            <motion.div whileHover={buttonHover} whileTap={buttonTap} className="inline-block">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-amber-400 text-gray-900 font-bold px-8 py-4 rounded-full shadow-xl hover:bg-amber-300 transition-colors text-base"
              >
                Start Selling for Free <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-500">Three simple steps to start selling.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200"
              aria-hidden="true"
            />

            {STEPS.map((step) => (
              <motion.div key={step.num} variants={staggerItem} className="text-center relative">
                <div className="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg ring-4 ring-brand-100">
                  <span className="text-2xl font-black">{step.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Benefits Grid ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Platform Capabilities</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">Engineered to support modern e-commerce workflows and vendor independence.</p>
          </motion.div>

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
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-4"
                >
                  <div className={`p-3 rounded-xl flex-shrink-0 ${benefit.color}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Partner Programs: Wholesale, Supply Chain, Affiliate, Advertising ──────────────── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Marketplace Service Concepts</h2>
            <p className="mt-2 text-sm text-gray-500">Illustrative marketplace extensions designed for this demonstration architecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Wholesale */}
            <div id="wholesale" className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 border border-amber-200 px-2.5 py-0.5 rounded-full inline-block">
                Concept — Not available in this demo
              </span>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Wholesale &amp; B2B Sourcing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connect directly with certified manufacturers for bulk inventory. Volume-tiered pricing, GST input tax credit invoices, and credit terms for qualified buyers.
              </p>
            </div>

            {/* Supply Chain */}
            <div id="supply-chain" className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block">
                Concept — Not available in this demo
              </span>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Supply Chain &amp; Fulfillment Hub</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Plug your inventory into Rigamart's automated logistics network. Doorstep pick-up, automated tracking, and RTO reduction workflows.
              </p>
            </div>

            {/* Affiliate */}
            <div id="affiliate" className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
                Concept — Not available in this demo
              </span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Affiliate &amp; Creator Program</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Earn commissions by sharing curated Rigamart product links with your audience. Access real-time analytics, automated payouts, and campaign assets.
              </p>
            </div>

            {/* Advertise */}
            <div id="advertise" className="bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 border border-purple-200 px-2.5 py-0.5 rounded-full inline-block">
                Concept — Not available in this demo
              </span>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Brand Advertising &amp; Sponsored Ads</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Put products at the top of category searches and buyer feeds with keyword targeting and transparent CPC analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-brand-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Ready to Explore Seller Features?
            </h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              Register a demo seller account to test product creation and dashboard metrics.
            </p>
            <motion.div whileHover={buttonHover} whileTap={buttonTap} className="inline-block">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Create Seller Account <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
