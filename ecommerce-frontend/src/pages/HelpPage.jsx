import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations.js';
import { Button } from '../components/ui/index.js';

// ─── Data ────────────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
  {
    id: 'ordering',
    title: 'Ordering & Payments',
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
    faqs: [
      {
        q: 'How long does delivery take?',
        a: 'Most orders are delivered within 3–7 business days. Express delivery (1–2 days) is available in select metros.',
      },
      {
        q: 'How do I track my order?',
        a: "Log in, go to 'My Orders', and click on any order card to view the full delivery status timeline and live checkpoint tracker.",
      },
      {
        q: 'What if my order is delayed?',
        a: 'Orders can be tracked in real-time. If an order exceeds expected delivery timelines, our support team proactively investigates with the logistics courier.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
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
    faqs: [
      {
        q: 'How do I become a seller?',
        a: "Register an account, select 'I'm a Seller' during registration, complete your seller profile, and start listing your products. Approval takes less than 24 hours.",
      },
      {
        q: 'What are the fees for sellers?',
        a: 'There are no listing fees or monthly subscription charges. Rigamart charges only a transparent platform commission on completed sales.',
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
    faqs: [
      {
        q: 'How do I update my profile?',
        a: "Log in and go to 'My Profile' via the user menu. You can update your name, mobile number, and saved shipping destinations.",
      },
      {
        q: 'Can I check out without creating an account?',
        a: "Yes! Rigamart provides seamless guest checkout via mobile OTP verification with no prior password setup required.",
      },
      {
        q: 'How do I manage my saved addresses?',
        a: 'In your Profile page, you can add multiple delivery destinations with automatic GPS geolocation detection and default tagging.',
      },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-line last:border-0">
      <button
        className="w-full text-left py-4 flex items-center justify-between gap-4 group focus:outline-none rounded-lg"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors pr-4">
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted"
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
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-xs sm:text-sm text-muted leading-relaxed">{faq.a}</p>
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
      className={`bg-surface rounded-none border border-line overflow-hidden transition-colors duration-150 scroll-mt-28 ${
        isAnyOpen ? 'border-brand' : ''
      }`}
    >
      <div
        className={`border-l-2 border-brand px-6 py-4 transition-colors ${
          isAnyOpen ? 'bg-canvas' : 'bg-surface'
        }`}
      >
        <h2 className="font-bold text-ink text-sm sm:text-base">{section.title}</h2>
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
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-dark via-brand to-brand-dark text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3"
          >
            Help Center & FAQs
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.1 }}
            className="text-white/85 mb-8 max-w-lg mx-auto text-sm"
          >
            Find immediate answers regarding order status, express fulfillment, returns, and selling factory-direct.
          </motion.p>

          {/* Search Input */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.18 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search FAQs, e.g. 'track order' or 'refund'…"
              className="w-full pl-11 pr-4 py-3 rounded bg-surface text-ink text-sm border border-line focus:outline-none focus:border-brand placeholder:text-muted"
              aria-label="Search frequently asked questions"
            />
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Sections ─────────────────────────────────────────────────── */}
      <section className="py-12 bg-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-muted text-base">
                No answers found matching "<span className="font-semibold text-ink">{query}</span>".
              </p>
              <p className="text-xs text-muted mt-2">Try a different keyword or clear search to browse all categories.</p>
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

          {/* ── Contact Support ─────────────────────────────────────────── */}
          <div className="mt-12 bg-surface rounded-none border border-line p-8 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded bg-canvas border border-line flex items-center justify-center text-ink">
                <MessageCircle className="w-6 h-6 text-brand" />
              </div>
            </div>
            <h3 className="font-bold text-ink text-base sm:text-lg">Still need assistance?</h3>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              Our concierge team is available to assist with custom orders, seller inquiries, and order delivery resolutions.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com/ksangam990-collab/rigamart"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="md">
                  Contact Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
