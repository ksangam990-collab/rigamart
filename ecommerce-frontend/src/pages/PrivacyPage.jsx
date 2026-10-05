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

**Guest Wishlist & Cart:** Local storage used to persist guest wishlist selections and shopping preferences before user sign-in.
    `.trim(),
  },
  {
    id: 'security',
    title: 'Data Security Measures',
    content: `
We implement modern security practices across the application:

- Passwords hashed using bcrypt before storage.
- All network communications protected with HTTPS in production.
- Razorpay webhook verification with cryptographic HMAC SHA256 signatures.
- MongoDB injection prevention via Mongoose schema casting.
- Rate limiting on authentication routes to mitigate automated brute-force attempts.
    `.trim(),
  },
  {
    id: 'rights',
    title: 'Your Privacy Rights',
    content: `
You retain full control over your personal data:

- **Access:** View all saved addresses and personal information in your Profile dashboard.
- **Correction:** Edit your display name, contact mobile, and shipping addresses at any time.
- **Portability:** Export or download PDF invoices for all completed purchases.
    `.trim(),
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: `
For inquiries regarding this portfolio demonstration or architectural implementation:

- **Lead Engineer:** Sangam Kumar
- **GitHub Repository:** [github.com/ksangam990-collab/rigamart](https://github.com/ksangam990-collab/rigamart)

This policy was last updated in **September 2026**.
    `.trim(),
  },
];

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function RenderContent({ text }) {
  const paragraphs = text.split('\n\n');
  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => {
        if (para.startsWith('- ')) {
          const items = para.split('\n').filter((l) => l.startsWith('- '));
          return (
            <ul key={i} className="list-disc list-inside space-y-1.5 pl-2">
              {items.map((item, j) => (
                <li key={j} className="text-xs sm:text-sm text-muted leading-relaxed">
                  {item.slice(2)}
                </li>
              ))}
            </ul>
          );
        }
        const parts = para.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-xs sm:text-sm text-muted leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="text-ink font-semibold">
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
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark via-brand to-brand-dark text-white py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={{ delay: 0.1 }}
            className="text-white/80 text-xs sm:text-sm"
          >
            Last updated: <span className="text-white font-medium">September 2026</span>
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex gap-10 items-start">
          {/* Sticky Left Nav */}
          <nav
            className="hidden lg:block w-56 shrink-0 sticky top-24 self-start"
            aria-label="Privacy policy sections"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3 px-2">Table of Contents</p>
            <ul className="space-y-1">
              {SECTIONS.map(({ id, title }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-colors font-medium ${
                      activeId === id
                        ? 'bg-brand-soft text-brand-dark font-bold'
                        : 'text-muted hover:text-ink hover:bg-surface'
                    }`}
                  >
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            <div className="bg-accent-soft/40 border border-accent/20 rounded-2xl p-5 text-xs text-ink leading-relaxed shadow-subtle">
              <strong className="font-bold block text-sm mb-1 text-ink">Demonstration Environment Notice</strong>
              Rigamart is a full-stack multi-vendor e-commerce platform demonstration. Real payment transactions are captured in <strong>Razorpay Test Mode</strong> (no actual currency is debited), media assets are hosted via <strong>Cloudinary CDN</strong>, and transactional notifications use <strong>Gmail SMTP</strong>. Please do not submit real credit card details or confidential passwords.
            </div>

            {SECTIONS.map(({ id, title, content }) => (
              <section
                key={id}
                id={id}
                ref={(el) => (sectionRefs.current[id] = el)}
                className="bg-surface rounded-2xl shadow-subtle border border-line p-6 sm:p-8 scroll-mt-24"
              >
                <h2 className="text-base sm:text-lg font-bold text-ink mb-4 pb-3 border-b border-line">
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
