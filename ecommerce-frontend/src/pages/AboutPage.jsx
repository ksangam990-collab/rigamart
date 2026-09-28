import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Handshake, Search, Zap, ShieldCheck, Briefcase, Newspaper, Mail } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, buttonHover, buttonTap } from '../utils/animations.js';

// ─── Data ────────────────────────────────────────────────────────────────────

const VALUE_PILLARS = [
  {
    emoji: '🤝',
    icon: Handshake,
    title: 'Zero Hidden Fees',
    desc: 'Sellers keep more of what they earn. Transparent pricing, no surprise deductions.',
  },
  {
    emoji: '🔍',
    icon: Search,
    title: 'Verified Products Only',
    desc: 'Every product and every seller goes through a verification process before going live.',
  },
  {
    emoji: '⚡',
    icon: Zap,
    title: 'Express Nationwide Delivery',
    desc: 'Logistics integration with last-mile delivery partners across 28 states.',
  },
  {
    emoji: '🛡️',
    icon: ShieldCheck,
    title: 'Buyer & Seller Protection',
    desc: 'Escrow-style payments mean money only releases once the buyer confirms delivery.',
  },
];

const STATS = [
  { value: '12,000+', label: 'Products Listed' },
  { value: '840+', label: 'Verified Sellers' },
  { value: '2.4 Lakh+', label: 'Happy Customers' },
  { value: '99.2%', label: 'On-Time Delivery' },
];

const TEAM = [
  { name: 'Aryan Kapoor', role: 'Co-Founder & CEO', initials: 'AK', color: 'bg-brand-600' },
  { name: 'Sneha Rao', role: 'Co-Founder & CTO', initials: 'SR', color: 'bg-violet-600' },
  { name: 'Vikram Joshi', role: 'Head of Seller Success', initials: 'VJ', color: 'bg-emerald-600' },
  { name: 'Meera Nair', role: 'Head of Buyer Experience', initials: 'MN', color: 'bg-amber-500' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="font-sans">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10"
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
            Our Story
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
            Connecting India's Buyers and Sellers — Transparently, Efficiently, Affordably.
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
            <span className="block text-brand-600 font-semibold text-xs tracking-widest uppercase mb-6">Our Purpose</span>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
              "Our mission is to democratize e-commerce for every seller in India, from a{' '}
              <span className="text-brand-600">small artisan in Jaipur</span> to a tech reseller in Bengaluru —
              on one trusted, transparent platform."
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Why Rigamart?</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Built on principles that put both buyers and sellers first — every single time.
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

      {/* ── Stats Strip ──────────────────────────────────────────────────── */}
      <section className="bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={staggerItem}>
                <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team Section ─────────────────────────────────────────────────── */}
      <section id="team" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Meet the Team</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              The people behind India's most transparent marketplace.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-16 h-16 ${member.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                  aria-hidden="true"
                >
                  <span className="text-white font-bold text-lg">{member.initials}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Careers Section ──────────────────────────────────────────────── */}
      <section id="careers" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>We're Hiring</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Careers at Rigamart</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
              Help us build India's premier multi-vendor commerce platform. Explore high-impact roles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Senior Frontend Engineer',
                team: 'Engineering · React / Vite',
                location: 'Bengaluru / Hybrid',
                desc: 'Craft snappy, motion-rich shopping interfaces and seller dashboard tools.'
              },
              {
                title: 'Merchant Success Lead',
                team: 'Operations · Seller Growth',
                location: 'Jaipur / Remote',
                desc: 'Onboard and accelerate regional apparel, footwear, and lifestyle manufacturers.'
              },
              {
                title: 'Backend Systems Architect',
                team: 'Platform · Node.js / Mongo',
                location: 'Bengaluru / Hybrid',
                desc: 'Scale atomic inventory deduction, payment gateways, and order fulfillment pipes.'
              }
            ].map((job, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block mb-1">{job.team}</span>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{job.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{job.desc}</p>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{job.location}</span>
                  <a
                    href="mailto:careers@rigamart.com?subject=Job%20Application"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Apply Now &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Press & Media Section ────────────────────────────────────────── */}
      <section id="press" className="py-20 bg-white border-t border-gray-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-brand-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-bold">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Media Relations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">Press &amp; Media Kit</h2>
              <p className="text-gray-300 text-sm max-w-lg leading-relaxed">
                For brand assets, executive bios, spokesperson quotes, and marketplace data requests, reach out directly to our communications team.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0">
              <a
                href="mailto:press@rigamart.com?subject=Media%20Inquiry"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-center text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                press@rigamart.com
              </a>
              <span className="text-[11px] text-gray-400 text-center">Fast response within 24 hours</span>
            </div>
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
              Start Selling on Rigamart Today
            </h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              Join 840+ verified sellers and reach crores of buyers across India.
            </p>
            <motion.div whileHover={buttonHover} whileTap={buttonTap}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
