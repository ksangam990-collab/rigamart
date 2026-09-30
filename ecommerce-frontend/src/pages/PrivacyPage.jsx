import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations.js';

// ─── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'data-collect',
    title: 'Data We Collect',
    content: `
When you use the Rigamart commerce platform, we collect information necessary to support marketplace operations, seller catalogs, and buyer checkouts:

**Account Information:** When you register, we collect a display name, email address, mobile number, and encrypted password (hashed with bcrypt).

**Order & Transaction Data:** We store order details, payment reference IDs, item variant selections, and delivery addresses to fulfill purchases and track delivery progress.

**Seller Product Listings:** Sellers upload product details, pricing, inventory stock counts, and product imagery stored securely on Cloudinary.

**Session Identifiers:** We use standard authentication tokens (JWT in secure cookies or headers) to manage session security across requests.
    `.trim(),
  },
  {
    id: 'how-use',
    title: 'How Data is Handled',
    content: `
Information collected on Rigamart is used strictly for core platform functionality:

**Order Processing:** Creating orders, calculating transparent price breakdowns (taxes, shipping), and managing order lifecycle states.

**Seller Catalog Tools:** Managing product records, dynamic size/color variants, and automated stock deductions.

**Notifications:** Generating automated order confirmation alerts and delivery status updates.

**Demonstration Scope:** This platform operates as an interactive demonstration using Razorpay (Test Mode), Cloudinary (Image CDN), and Gmail SMTP for transactional communications. While role-based access control and password hashing are implemented, please avoid submitting sensitive personal, card, or banking details.
    `.trim(),
  },
  {
    id: 'sharing',
    title: 'Integrated Services',
    content: `
The platform coordinates with trusted infrastructure providers to deliver services:

**Payment Processing:** Integrates with Razorpay for secure checkout payment capture and HMAC signature verification.

**Media CDN:** Uses Cloudinary for optimized delivery of product photography.

**Transactional Delivery:** Delivers transactional order notices and account lifecycle emails.

**Database Infrastructure:** Operates on secure MongoDB Atlas cloud database infrastructure with role-based access controls.
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
As a user of Rigamart, you have full control over the data associated with your account:

**Access & Correction:** You can view and modify your name, mobile number, and delivery addresses at any time directly through your My Profile dashboard.

**Order History:** Your placed orders, tracking logs, and tax invoice PDFs can be viewed and downloaded directly from the My Orders view.
    `.trim(),
  },
  {
    id: 'contact',
    title: 'Platform Contact',
    content: `
For inquiries, enterprise white-label deployment, or technical questions regarding this platform:

**Repository & Codebase:** https://github.com/ksangam990-collab/rigamart

This policy was last updated in **September 2026**.
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
          <div className="flex-1 min-w-0 space-y-8">
            {/* Demonstration Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 leading-relaxed shadow-sm">
              <strong className="font-bold block text-sm mb-1 text-amber-950">Demonstration Platform Notice</strong>
              Rigamart is a full-stack multi-vendor e-commerce platform demonstration. Real payment transactions are processed in <strong>Razorpay Test Mode</strong> (no actual currency is debited), media assets are hosted via <strong>Cloudinary CDN</strong>, and transactional notifications use <strong>Gmail SMTP</strong>. Because this is a portfolio demonstration environment, please do not submit sensitive personal, financial, or proprietary information.
            </div>

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
