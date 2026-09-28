import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations.js';

// ─── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'data-collect',
    title: 'Data We Collect',
    content: `
When you test the Rigamart demonstration, we collect certain information to support simulated shopping and seller features:

**Account Information:** When you register, we collect a display name, test email address, mobile number, and password (hashed with bcrypt).

**Order & Transaction Data:** We store mock purchase records, simulated delivery statuses, and test payment references to demonstrate the fulfillment pipeline.

**Media & Product Listings:** Sellers can upload product photography stored securely on Cloudinary.

**Session Identifiers:** We use standard authentication tokens (JWT in secure cookies or headers) to persist session state between requests.
    `.trim(),
  },
  {
    id: 'how-use',
    title: 'How Data is Handled',
    content: `
Information collected in this demonstration application is used solely for project functionality:

**Simulated Checkout:** Creating mock orders, calculating price breakdowns (tax, shipping), and tracking order statuses.

**Seller Catalog Tools:** Storing product records, sizes, color variants, and stock counts.

**Transactional Test Alerts:** Generating mock order confirmation and status update emails via Gmail SMTP.

As an educational portfolio demonstration, data submitted is stored in a test database and not utilized for commercial marketing.
    `.trim(),
  },
  {
    id: 'sharing',
    title: 'Third-Party Services & Integrations',
    content: `
This demonstration platform integrates with the following external services:

**Razorpay (Sandbox / Test Mode):** Processes test transactions using simulated UPI and card credentials. No real funds are transferred or processed.

**Cloudinary CDN:** Hosts and delivers uploaded product catalog images.

**Gmail SMTP / Nodemailer:** Delivers automated transaction test notification emails to registered test accounts.

**MongoDB Atlas:** Provides managed database storage for user accounts, products, reviews, and order records.
    `.trim(),
  },
  {
    id: 'cookies',
    title: 'Cookies & Storage',
    content: `
We use essential cookies and browser storage strictly required for application functionality:

**Authentication Tokens:** Secure tokens stored to authenticate API requests for customer, seller, and admin routes.

**Local State:** Cart items and interface preferences stored locally in memory and browser state.

We do not embed third-party advertising tracking cookies or ad networks.
    `.trim(),
  },
  {
    id: 'security',
    title: 'Technical Security Measures',
    content: `
We implement modern security best practices across the application architecture:

**Password Hashing:** Passwords are never stored in plain text and are hashed with bcrypt.

**Role-Based Access Control:** API routes enforce strict role checks (Customer, Seller, Admin) to prevent unauthorized access.

**Sanitization & Validation:** Request inputs are validated and sanitized to guard against injection attacks.

**Signature Verification:** Razorpay payment webhooks and capture callbacks require cryptographic HMAC SHA-256 signature verification.
    `.trim(),
  },
  {
    id: 'rights',
    title: 'Your Rights & Data Access',
    content: `
As a demonstration user of Rigamart, you have full control over the test data associated with your session:

**Access & Correction:** You can view and modify your name, mobile number, and delivery addresses at any time directly through your My Profile dashboard.

**Deletion:** You can reset demo accounts or re-register at any time. Test database records are periodically refreshed.

**Order History:** Your placed test orders, tracking logs, and sample invoice PDFs can be downloaded directly from the My Orders and Order Detail views.
    `.trim(),
  },
  {
    id: 'contact',
    title: 'Project Contact',
    content: `
Rigamart is an open-source demonstration application built for portfolio showcase purposes.

For questions, code review, or technical inquiries regarding this implementation, please visit the project repository on GitHub:

**Repository:** https://github.com/ksangam990-collab/rigamart

This demonstration policy was last updated in **September 2026**.
    `.trim(),
  },
];

// ─── Markdown-lite renderer (bold only) ─────────────────────────────────────

function RenderContent({ text }) {
  const paragraphs = text.split('\n\n');
  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => {
        // Handle bullet lists
        if (para.startsWith('- ')) {
          const items = para.split('\n').filter((l) => l.startsWith('- '));
          return (
            <ul key={i} className="list-disc list-inside space-y-1.5 pl-2">
              {items.map((item, j) => (
                <li key={j} className="text-sm text-gray-600 leading-relaxed">
                  {item.slice(2)}
                </li>
              ))}
            </ul>
          );
        }
        // Bold replacement
        const parts = para.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="text-gray-800 font-semibold">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const sectionRefs = useRef({});

  // Intersection observer to sync left nav with scroll position
  useEffect(() => {
    const observers = [];
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function scrollTo(id) {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl font-extrabold mb-2"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.1 }}
            className="text-gray-400 text-sm"
          >
            Last updated: <span className="text-gray-200 font-medium">September 2026</span>
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Demonstration Disclaimer Alert Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed">
          <strong className="block text-sm font-bold text-amber-900 mb-1">
            ⚠️ Demonstration Project Notice (Not Legal Advice)
          </strong>
          <p className="text-gray-700">
            Rigamart is an educational, non-commercial portfolio project. Third-party integrations in this demo are limited to:
          </p>
          <ul className="list-disc pl-5 mt-1.5 space-y-0.5 text-gray-700">
            <li><strong>Razorpay:</strong> Running exclusively in test/sandbox mode (no real money transactions).</li>
            <li><strong>Cloudinary:</strong> Used for hosting uploaded product photos.</li>
            <li><strong>Gmail SMTP:</strong> Used for sending transactional test notifications.</li>
          </ul>
          <p className="mt-2 text-gray-600 text-xs">
            This page is an illustrative template for demonstration completeness and does not constitute a binding legal policy.
          </p>
        </div>

        <div className="flex gap-10 items-start">
          {/* ── Sticky Left Nav (desktop) ───────────────────────────────── */}
          <nav
            className="hidden lg:block w-56 flex-shrink-0 sticky top-20 self-start"
            aria-label="Privacy policy sections"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 px-2">Contents</p>
            <ul className="space-y-1">
              {SECTIONS.map(({ id, title }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors font-medium ${
                      activeId === id
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Content ─────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-10">
            {SECTIONS.map(({ id, title, content }) => (
              <section
                key={id}
                id={id}
                ref={(el) => (sectionRefs.current[id] = el)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 scroll-mt-24"
              >
                <h2 className="text-lg font-extrabold text-gray-900 mb-5 pb-4 border-b border-gray-100">
                  {title}
                </h2>
                <RenderContent text={content} />
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
