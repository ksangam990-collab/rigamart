import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Handshake, Search, Zap, ShieldCheck } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, buttonHover, buttonTap } from '../utils/animations.js';
import { Button } from '../components/ui/index.js';

// ─── Data ────────────────────────────────────────────────────────────────────

const VALUE_PILLARS = [
  {
    icon: Handshake,
    title: 'Zero Hidden Fees',
    desc: 'Transparent multi-vendor pricing architecture with zero surprise deductions.',
  },
  {
    icon: Search,
    title: 'Verified Catalog Engine',
    desc: 'Structured product validation with size and color SKU variant support.',
  },
  {
    icon: Zap,
    title: 'Instant Inventory Sync',
    desc: 'Atomic inventory deduction at checkout to prevent overselling across sessions.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Sandbox Checkout',
    desc: 'Razorpay test mode integration with real-time signature verification.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-dark text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="inline-block text-xs font-bold tracking-widest uppercase bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-6"
          >
            Calm Editorial Marketplace
          </motion.span>
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight"
          >
            About Rigamart
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.16 }}
            className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            A full-stack multi-vendor e-commerce platform engineered for factory-direct transparency, velocity, and reliability.
          </motion.p>
        </div>
      </section>

      {/* ── Mission Statement ────────────────────────────────────────────── */}
      <section className="py-20 bg-surface border-b border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <span className="block text-brand font-bold text-xs tracking-widest uppercase mb-4">Our Vision</span>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-snug">
              "Delivering end-to-end multi-vendor commerce infrastructure — from{' '}
              <span className="text-brand">instant seller onboarding</span> to atomic checkout and automated fulfillment —
              on one modern, unified stack."
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* ── Why Rigamart — Value Pillars ─────────────────────────────────── */}
      <section className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Architecture Highlights</h2>
            <p className="mt-3 text-muted text-sm max-w-xl mx-auto">
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
            {VALUE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={staggerItem}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-surface rounded-none p-6 border border-line flex flex-col hover:border-ink transition-colors duration-150"
                >
                  <div className="w-10 h-10 rounded bg-canvas border border-line flex items-center justify-center mb-4 text-brand">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink text-base mb-2">{pillar.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Engineering & Architecture Section ───────────────────────────── */}
      <section id="architecture" className="py-20 bg-surface border-t border-line scroll-mt-24">
        <div id="team" className="scroll-mt-24" />
        <div id="careers" className="scroll-mt-24" />
        <div id="press" className="scroll-mt-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand-soft border border-brand/20 px-3 py-1 rounded-sm">
              Engineering Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-3 tracking-tight">Platform Architecture</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted max-w-xl mx-auto">
              Technical components and design patterns implemented in this portfolio application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-canvas rounded-none p-6 border border-line">
              <h3 className="font-bold text-ink text-sm sm:text-base mb-2">Frontend</h3>
              <p className="text-xs text-muted leading-relaxed">
                React 18 SPA built with Vite, Redux Toolkit for cart and auth state, Tailwind CSS with semantic design tokens, code-splitting via React.lazy/Suspense, and Framer Motion transitions.
              </p>
            </div>
            <div className="bg-canvas rounded-none p-6 border border-line">
              <h3 className="font-bold text-ink text-sm sm:text-base mb-2">Backend &amp; Database</h3>
              <p className="text-xs text-muted leading-relaxed">
                RESTful API built with Node.js and Express. MongoDB Atlas with Mongoose schemas, atomic inventory deduction transactions, and role-based access control.
              </p>
            </div>
            <div className="bg-canvas rounded-none p-6 border border-line">
              <h3 className="font-bold text-ink text-sm sm:text-base mb-2">Integrations</h3>
              <p className="text-xs text-muted leading-relaxed">
                Razorpay payment gateway in test/sandbox mode, Cloudinary CDN for product image storage, and Nodemailer via Gmail SMTP for order confirmation alerts.
              </p>
            </div>
          </div>

          {/* Creator & Developer Profile Card */}
          <div className="mt-8 bg-canvas rounded-none p-6 sm:p-8 border border-line flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded bg-surface border border-line flex items-center justify-center font-bold text-xl text-ink shrink-0">
                SK
              </div>
              <div>
                <span className="text-[11px] font-bold text-brand uppercase tracking-widest block mb-1">
                  Architecture &amp; Development
                </span>
                <h3 className="text-xl font-bold text-ink tracking-tight">Sangam Kumar</h3>
                <p className="text-xs text-muted mt-1 max-w-xl leading-relaxed">
                  Engineered end-to-end with modern multi-vendor commerce design patterns, state management via Redux Toolkit, atomic MongoDB transactions, and responsive micro-interactions.
                </p>
              </div>
            </div>
            <a
              href="https://github.com/ksangam990-collab"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded bg-surface hover:bg-canvas border border-line text-ink font-semibold text-xs transition-colors shrink-0 flex items-center gap-2"
            >
              <span>GitHub Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="bg-surface py-16 border-t border-line text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4 tracking-tight">
              Explore Our Curated Catalog
            </h2>
            <p className="text-muted mb-8 max-w-lg mx-auto text-sm">
              Discover verified factory-direct pieces and everyday essentials with express pan-India delivery.
            </p>
            <div>
              <Link to="/search">
                <Button variant="primary" size="lg">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
