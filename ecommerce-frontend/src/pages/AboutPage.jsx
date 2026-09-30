import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Handshake, Search, Zap, ShieldCheck } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, buttonHover, buttonTap } from '../utils/animations.js';

// ─── Data ────────────────────────────────────────────────────────────────────

const VALUE_PILLARS = [
  {
    emoji: '🤝',
    icon: Handshake,
    title: 'Zero Hidden Fees',
    desc: 'Transparent multi-vendor pricing architecture with zero surprise deductions.',
  },
  {
    emoji: '🔍',
    icon: Search,
    title: 'Verified Catalog Engine',
    desc: 'Structured product validation with size and color SKU variant support.',
  },
  {
    emoji: '⚡',
    icon: Zap,
    title: 'Instant Inventory Sync',
    desc: 'Atomic inventory deduction at checkout to prevent overselling across sessions.',
  },
  {
    emoji: '🛡️',
    icon: ShieldCheck,
    title: 'Secure Sandbox Checkout',
    desc: 'Razorpay test mode integration with real-time signature verification.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="font-sans">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-indigo-800 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6"
          >
            Enterprise Commerce
          </motion.span>
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          >
            About Rigamart
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.16 }}
            className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
          >
            A Full-Stack Multi-Vendor E-Commerce Platform engineered for speed, reliability, and scale.
          </motion.p>
        </div>
      </section>

      {/* ── Mission Statement ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <span className="block text-brand-600 font-semibold text-xs tracking-widest uppercase mb-6">Our Vision</span>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
              "Delivering end-to-end multi-vendor commerce infrastructure — from{' '}
              <span className="text-brand-600">instant seller onboarding</span> to atomic checkout and automated fulfillment —
              on one modern, unified stack."
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* ── Why Rigamart — Value Pillars ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Architecture Highlights</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Built on production principles that ensure data integrity, responsive UX, and scalable vendor management.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {VALUE_PILLARS.map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
              >
                <span className="text-3xl mb-4" aria-hidden="true">{pillar.emoji}</span>
                <h3 className="font-bold text-gray-900 text-base mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Engineering & Architecture Section (replaces fake stats/team/careers/press) ── */}
      <section id="architecture" className="py-20 bg-white border-t border-gray-100 scroll-mt-24">
        {/* Anchors for legacy footer navigation links */}
        <div id="team" className="scroll-mt-24" />
        <div id="careers" className="scroll-mt-24" />
        <div id="press" className="scroll-mt-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
              Engineering Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Platform Architecture</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
              Technical components and design patterns implemented in this portfolio application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-2">Frontend</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                React 18 SPA built with Vite, Redux Toolkit for cart and auth state, Tailwind CSS, code-splitting via React.lazy/Suspense, and Framer Motion for route transitions.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-2">Backend &amp; Database</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                RESTful API built with Node.js and Express. MongoDB Atlas with Mongoose schemas, atomic inventory deduction transactions, and role-based access control.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-2">Integrations</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Razorpay payment gateway in test/sandbox mode, Cloudinary CDN for product image storage, and Nodemailer via Gmail SMTP for order confirmation alerts.
              </p>
            </div>
          </div>

          {/* Creator & Developer Profile Card */}
          <div className="mt-8 bg-gradient-to-r from-gray-900 via-brand-950 to-gray-900 rounded-2xl p-6 sm:p-8 text-white border border-gray-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center font-black text-xl text-brand-300 shrink-0 shadow-inner">
                SK
              </div>
              <div>
                <span className="text-[11px] font-bold text-brand-400 uppercase tracking-widest block mb-1">
                  Architecture &amp; Development
                </span>
                <h3 className="text-xl font-black text-white tracking-tight">Sangam Kumar</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                  Engineered end-to-end with modern multi-vendor commerce design patterns, state management via Redux Toolkit, atomic MongoDB transactions, and responsive micro-interactions.
                </p>
              </div>
            </div>
            <a
              href="https://github.com/ksangam990-collab"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-2"
            >
              <span>GitHub Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="bg-brand-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Launch Your Marketplace
            </h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              Empower independent sellers, manage dynamic catalogs, and deliver seamless buyer checkouts.
            </p>
            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Get Started Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
