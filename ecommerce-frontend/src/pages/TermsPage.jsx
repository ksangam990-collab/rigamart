import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations.js';

// ─── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: `
By accessing or using the Rigamart commerce platform, you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.

These Terms govern your use of the Rigamart website, marketplace services, customer accounts, seller tools, and transaction processing.

If you do not agree with any part of these Terms, you may discontinue use of the platform at any time.
    `.trim(),
  },
  {
    id: 'accounts',
    title: 'User Accounts',
    content: `
To access shopping and seller features on Rigamart, you can register an account. As an account holder:

**Accurate Information:** Maintain accurate and up-to-date profile details, contact numbers, and delivery addresses.

**Account Security:** You are responsible for safeguarding your login credentials. Sessions are securely authenticated using encrypted JWT tokens.

**Role Permissions:** Users may operate customer accounts for purchases or register verified seller accounts to manage commercial catalogs.
    `.trim(),
  },
  {
    id: 'seller-terms',
    title: 'Seller Terms',
    content: `
The Rigamart Seller Program powers independent vendors operating on the platform:

**Product Listings:** Verified sellers can publish products, configure variant SKUs (size, color, pricing, inventory stock), and upload product media via secure CDN.

**Order Processing:** Sellers receive real-time order alerts and must fulfill and update dispatch and delivery timelines in accordance with platform standards.

**Platform Settlement:** Platform commission rates and payout tracking are managed through the automated seller financial dashboard.
    `.trim(),
  },
  {
    id: 'buyer-terms',
    title: 'Buyer Terms',
    content: `
As a customer purchasing through Rigamart:

**Delivery Addresses:** Complete and accurate delivery information is required at checkout to ensure reliable last-mile fulfillment.

**Payment Processing:** Orders can be paid via integrated payment gateways (Cards, NetBanking, UPI) or Cash on Delivery where serviceable.

**Order Tracking:** Live order milestones (Placed, Confirmed, Shipped, Delivered) are tracked in real-time within your account dashboard.

**Returns & Refunds:** Eligible returns can be requested through the My Orders dashboard within the designated return window.
    `.trim(),
  },
  {
    id: 'prohibited',
    title: 'Prohibited Activities',
    content: `
Users and sellers agree to maintain platform integrity and refrain from:

- Uploading unlawful, counterfeit, or infringing merchandise
- Attempting unauthorized access, reverse-engineering, or scraping platform databases
- Manipulating pricing, reviews, or transaction records through automated bots
- Interfering with normal checkout processing or security protocols

Violations may result in immediate suspension of account privileges and seller stores.
    `.trim(),
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    content: `
**Platform Architecture:** The Rigamart platform codebase, design system, UI components, and logos are proprietary assets protected under applicable copyright and intellectual property laws.

**Merchant Content:** Sellers retain ownership of their trademarked product imagery and brand collateral while granting Rigamart display rights to feature products across the marketplace.
    `.trim(),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content: `
Rigamart provides a marketplace platform connecting independent merchants with retail customers.

To the extent permitted by law, Rigamart is not liable for indirect, incidental, or consequential damages resulting from vendor shipping delays, product defects, or third-party service interruptions.
    `.trim(),
  },
  {
    id: 'governing-law',
    title: 'Platform Governance',
    content: `
These Terms of Service are governed by and construed in accordance with applicable commercial and e-commerce laws.

For enterprise deployment, technical inquiries, or platform governance questions:

**Repository & Codebase:** https://github.com/ksangam990-collab/rigamart
    `.trim(),
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    content: `
Rigamart reserves the right to update or modify these Terms to reflect operational or regulatory improvements.

These terms were last updated in **September 2026**.
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

export default function TermsPage() {
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
            Terms of Service
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
            aria-label="Terms of service sections"
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
