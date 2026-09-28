import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations.js';

// ─── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: `
By accessing or using the Rigamart demonstration platform, you confirm that you understand this application is an educational, full-stack portfolio showcase.

These Terms of Service provide an illustrative framework demonstrating standard e-commerce governance, user account rules, and multi-vendor agreements.

If you do not agree with any part of these demonstration terms, you may discontinue use of the platform at any time.
    `.trim(),
  },
  {
    id: 'accounts',
    title: 'User Accounts',
    content: `
To test features of Rigamart, you can create a test account. In this environment:

**Accurate Information:** You can use simulated credentials or test emails for registration.

**Account Security:** Maintain your test credentials responsibly. In this demonstration, mock sessions are authenticated via JWT tokens.

**Role Testing:** Users can register as Customers or Sellers to test their respective workflows and access the dedicated dashboards.

**Data Resets:** Test accounts and sample order histories in this database are periodically reset or re-seeded.
    `.trim(),
  },
  {
    id: 'seller-terms',
    title: 'Seller Terms',
    content: `
The Rigamart Seller Program simulates a multi-vendor marketplace model:

**Product Listings:** Demo sellers can create products, configure variant SKUs (size, color, price, stock), and upload imagery via Cloudinary.

**Order Processing:** Sellers receive simulated orders and can update dispatch and delivery statuses in real time.

**Commission & Pricing:** Platform commission calculations and payout schedules shown in the seller portal are architectural models for demonstration.

**Sandbox Environment:** All financial tracking reflects test transactions and does not represent real monetary earnings or liability.
    `.trim(),
  },
  {
    id: 'buyer-terms',
    title: 'Buyer Terms',
    content: `
As a simulated buyer on Rigamart:

**Delivery Addresses:** You can create and manage test delivery addresses within your profile to test the checkout address selector.

**Simulated Payment:** Checkout utilizes Razorpay in Test Mode or simulated Cash on Delivery. No actual charges are made to any real bank account or credit card.

**Order Tracking:** Live order updates (Placed, Confirmed, Shipped, Delivered) demonstrate real-time status transitions.

**Returns Simulation:** The 7-day return request workflow illustrates customer return management and inventory restock logic.
    `.trim(),
  },
  {
    id: 'prohibited',
    title: 'Prohibited Activities',
    content: `
When interacting with this demonstration platform, users agree not to:

- Attempt denial-of-service or destructive attacks against the demonstration infrastructure
- Inject malicious payloads, SQL/NoSQL injection vectors, or unauthorized scripts
- Attempt to harvest or scrape sensitive data from other demonstration test accounts
- Exploit test API endpoints for unintended automated spamming

Violations may result in IP-level blocking and account suspension.
    `.trim(),
  },
  {
    id: 'ip',
    title: 'Open Source & Intellectual Property',
    content: `
**Demonstration Codebase:** The Rigamart application is an open-source demonstration project published for educational and portfolio evaluation purposes.

**Third-Party Marks:** Any trademarks, product brand names, or logos referenced within sample seed data remain the property of their respective trademark owners and are used strictly as illustrative placeholders.

**Source Repository:** Full source code and documentation are available on GitHub under standard open-source licensing.
    `.trim(),
  },
  {
    id: 'liability',
    title: 'Disclaimer of Liability',
    content: `
Rigamart is provided strictly on an "as is" and "as available" basis for technical evaluation and portfolio demonstration:

- This application is not a licensed commercial business entity.
- The developers make no warranties, express or implied, regarding commercial merchantability or uninterrupted service availability.
- No commercial transactions, binding legal sales, or physical deliveries take place through this application.
    `.trim(),
  },
  {
    id: 'governing-law',
    title: 'Project Governance',
    content: `
This project is governed as an open-source technical demonstration.

For inquiries, feature requests, or technical bug reports, please submit an issue through the GitHub repository.

**Repository:** https://github.com/ksangam990-collab/rigamart
    `.trim(),
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    content: `
These demonstration terms may be updated as the underlying portfolio architecture evolves.

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
