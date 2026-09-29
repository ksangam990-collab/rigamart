import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations.js';

// ─── Data ────────────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
  {
    id: 'ordering',
    title: 'Ordering & Payments',
    color: 'border-brand-500',
    faqs: [
      {
        q: 'How do I place an order?',
        a: "Browse our catalog, select a product, choose your variant, and click 'Add to Cart'. Then go to cart, choose your delivery address, and pick Razorpay or Cash on Delivery.",
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, Credit/Debit Cards, Net Banking via Razorpay, and Cash on Delivery (COD) across all serviceable pincodes.',
      },
      {
        q: 'Is my payment information secure?',
        a: "Yes. We use Razorpay's PCI-DSS Level 1 compliant gateway. We never store your card or UPI details on our servers.",
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery & Tracking',
    color: 'border-emerald-500',
    faqs: [
      {
        q: 'How long does delivery take?',
        a: 'Most orders are delivered within 3–7 business days. Express delivery (1–2 days) is available in select metros.',
      },
      {
        q: 'How do I track my order?',
        a: "Log in, go to 'My Orders', and click on any order card to view the full delivery status timeline.",
      },
      {
        q: 'What if my order is delayed?',
        a: 'This is a demonstration project — for simulated orders, review the real-time status timeline on your My Orders page.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    color: 'border-amber-500',
    faqs: [
      {
        q: "What is Rigamart's return policy?",
        a: 'We offer a 7-day return window from the date of delivery for most product categories. Item must be in original, unused condition with all original tags.',
      },
      {
        q: 'How do I initiate a return?',
        a: "Go to 'My Orders', find the order, and click 'Request Return'. Fill in your reason and a pickup will be arranged within 2 business days.",
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5–7 business days after the returned item is received and verified at our fulfillment center.',
      },
    ],
  },
  {
    id: 'seller',
    title: 'Seller Program',
    color: 'border-violet-500',
    faqs: [
      {
        q: 'How do I become a seller?',
        a: "Register an account, select 'Join as Seller', complete your seller profile, and start listing your products. Approval takes less than 24 hours.",
      },
      {
        q: 'What are the fees for sellers?',
        a: 'There are no listing fees or monthly subscription charges. Rigamart charges only a small platform commission on successful sales.',
      },
      {
        q: 'How do I receive payouts?',
        a: 'Seller payouts are processed every 7 days to your registered bank account after successful order delivery confirmation.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Security',
    color: 'border-rose-500',
    faqs: [
      {
        q: 'How do I update my profile?',
        a: "Log in and go to 'My Profile' via the user menu. You can update your name, mobile number, and saved addresses.",
      },
      {
        q: 'I forgot my password. What should I do?',
        a: "On the Login page, click 'Forgot Password' to receive a reset link on your registered email address.",
      },
      {
        q: 'How do I delete my account?',
        a: 'In this demonstration project, test accounts can be reset or re-registered anytime through the database seed scripts.',
      },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full text-left py-4 flex items-center justify-between gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors pr-4">
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-gray-400"
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqSection({ section, openKey, onToggle }) {
  const isAnyOpen = section.faqs.some((_, i) => openKey === `${section.id}-${i}`);
  return (
    <motion.div
      id={section.id}
      variants={staggerItem}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 scroll-mt-28 ${
        isAnyOpen ? 'ring-2 ring-brand-200' : ''
      }`}
    >
      <div
        className={`border-l-4 ${section.color} px-6 py-5`}
        style={{ backgroundColor: isAnyOpen ? '#EFF6FF' : 'white' }}
      >
        <h2 className="font-bold text-gray-900 text-base">{section.title}</h2>
      </div>
      <div className="px-6 divide-y-0">
        {section.faqs.map((faq, i) => {
          const key = `${section.id}-${i}`;
          return (
            <FaqItem
              key={key}
              faq={faq}
              isOpen={openKey === key}
              onToggle={() => onToggle(key)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [openKey, setOpenKey] = useState(null);
  const [query, setQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) {
      const match = FAQ_SECTIONS.find((s) => s.id === hash);
      if (match) {
        setOpenKey(`${match.id}-0`);
        setTimeout(() => {
          document.getElementById(match.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash]);

  function handleToggle(key) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  const filteredSections = useMemo(() => {
    if (!query.trim()) return FAQ_SECTIONS;
    const q = query.toLowerCase();
    return FAQ_SECTIONS.map((section) => ({
      ...section,
      faqs: section.faqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q)
      ),
    })).filter((s) => s.faqs.length > 0);
  }, [query]);

  return (
    <div className="font-sans">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-700 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl font-extrabold mb-3"
          >
            Help Center & FAQs
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.1 }}
            className="text-blue-100 mb-8 max-w-lg mx-auto"
          >
            Find answers to the most common questions about ordering, delivery, returns, and selling on Rigamart.
          </motion.p>

          {/* Search Input */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.18 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search FAQs, e.g. 'track order' or 'refund'…"
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white text-gray-900 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-400"
              aria-label="Search frequently asked questions"
            />
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Sections ─────────────────────────────────────────────────── */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-500 text-base">
                No results found for "<span className="font-semibold text-gray-700">{query}</span>".
              </p>
              <p className="text-sm text-gray-400 mt-2">Try a different keyword or browse all sections below.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer(0.05)}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {filteredSections.map((section) => (
                <FaqSection
                  key={section.id}
                  section={section}
                  openKey={openKey}
                  onToggle={handleToggle}
                />
              ))}
            </motion.div>
          )}

          {/* ── Still have questions? ───────────────────────────────────── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-full">
                <MessageCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Have questions about this project?</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              Rigamart is an open-source demonstration application developed by <strong className="text-gray-700 font-semibold">Sangam Kumar</strong>. Explore the source code or report issues on GitHub.
            </p>
            <a
              href="https://github.com/ksangam990-collab/rigamart"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-brand-700 transition-colors"
            >
              View on GitHub
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
