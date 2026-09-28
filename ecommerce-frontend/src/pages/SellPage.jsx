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
    title: '28-State Reach',
    desc: 'Nationwide delivery logistics handled for you.',
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
    title: 'Razorpay Payouts',
    desc: 'Fast, reliable payouts directly to your bank account.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    desc: 'Priority seller support 7 days a week.',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: BadgeCheck,
    title: 'Buyer Trust Signals',
    desc: 'Our verification badges build instant buyer confidence.',
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6"
          >
            Seller Program
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto"
          >
            Reach Crores of Customers.{' '}
            <span className="text-amber-400">Sell on Rigamart.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.16 }}
            className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join 840+ verified sellers already growing their business on India's most transparent multi-vendor marketplace.
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

            {STEPS.map((step, idx) => (
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Everything You Need to Succeed</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">Built for Indian sellers — from first-time entrepreneurs to established businesses.</p>
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

      {/* ── Testimonial ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="bg-brand-50 border border-brand-100 rounded-2xl p-8 sm:p-10 text-center shadow-sm"
          >
            <div className="text-5xl mb-4" aria-hidden="true">❝</div>
            <blockquote className="text-lg sm:text-xl text-gray-800 font-medium leading-relaxed mb-6">
              I was selling from a tiny store in Jaipur. Within 6 months on Rigamart, my monthly revenue crossed{' '}
              <span className="text-brand-600 font-bold">₹1.5 lakh</span>. The seller dashboard is better than anything
              I've used before.
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-sm">
                PM
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm">Priya M.</p>
                <p className="text-xs text-gray-500">Ethnic Fashion Seller, Jaipur</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Partner Programs: Wholesale, Supply Chain, Affiliate, Advertising ──────────────── */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Partner &amp; Enterprise Programs</h2>
            <p className="mt-2 text-sm text-gray-500">Accelerate your business with Rigamart's integrated commercial ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Wholesale */}
            <div id="wholesale" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Wholesale &amp; B2B Sourcing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connect directly with certified manufacturers for bulk inventory. Enjoy volume-tiered pricing, GST input tax credit invoices, and credit terms for qualified buyers.
              </p>
              <div className="pt-2">
                <a href="mailto:wholesale@rigamart.com?subject=Wholesale%20Inquiry" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                  Contact Wholesale Desk &rarr;
                </a>
              </div>
            </div>

            {/* Supply Chain */}
            <div id="supply-chain" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Supply Chain &amp; Fulfillment Hub</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Plug your inventory into Rigamart's automated logistics network. We partner with India's leading 3PL couriers to provide pan-India doorstep pick-up, automated tracking, and RTO reduction.
              </p>
              <div className="pt-2">
                <a href="mailto:logistics@rigamart.com?subject=Supply%20Chain%20Partnership" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                  Explore Logistics Integration &rarr;
                </a>
              </div>
            </div>

            {/* Affiliate */}
            <div id="affiliate" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Affiliate &amp; Creator Program</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Earn competitive commissions (up to 8%) by sharing curated Rigamart product links with your audience. Access real-time analytics, automated payouts, and exclusive campaign banners.
              </p>
              <div className="pt-2">
                <a href="mailto:affiliates@rigamart.com?subject=Affiliate%20Program" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                  Apply for Affiliate Access &rarr;
                </a>
              </div>
            </div>

            {/* Advertise */}
            <div id="advertise" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Brand Advertising &amp; Sponsored Ads</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Put your products at the top of category searches and buyer feeds. Rigamart Sponsored Listings deliver measurable ROI with keyword targeting and transparent CPC analytics.
              </p>
              <div className="pt-2">
                <a href="mailto:ads@rigamart.com?subject=Advertising%20Inquiry" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                  Launch Ad Campaign &rarr;
                </a>
              </div>
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
              Ready to Start Your Journey?
            </h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              It takes less than 5 minutes to set up your seller account. No credit card required.
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
