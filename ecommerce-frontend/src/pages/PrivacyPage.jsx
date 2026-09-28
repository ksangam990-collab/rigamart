import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations.js';

// ─── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'data-collect',
    title: 'Data We Collect',
    content: `
When you use Rigamart, we collect certain information to provide and improve our services. The categories of data we collect include:

**Account Information:** When you register, we collect your name, email address, mobile number, and password (stored as a bcrypt hash — never in plain text).

**Order & Transaction Data:** We store details of purchases, returns, and refund transactions associated with your account to fulfil orders and resolve disputes.

**Device & Usage Data:** We automatically collect device identifiers, IP address, browser type, operating system, pages visited, and interaction timestamps to monitor platform health and improve user experience.

**Location Data:** We collect your delivery address and, with your explicit permission, approximate location to provide delivery estimates and suggest nearby sellers.

**Communications:** If you contact our support team via email or chat, we retain those records to provide context in future interactions.

We do not collect sensitive personal data such as government IDs, caste, religion, or biometric data.
    `.trim(),
  },
  {
    id: 'how-use',
    title: 'How We Use Your Data',
    content: `
We use the information we collect only for the following purposes:

**Order Fulfilment:** Processing payments, coordinating with delivery partners, and notifying you of order status updates.

**Platform Personalisation:** Recommending products based on browse and purchase history to surface items most relevant to you.

**Security & Fraud Prevention:** Detecting unusual activity patterns, verifying seller identities, and protecting your account from unauthorised access.

**Legal Compliance:** Meeting obligations under the Information Technology Act, 2000 and other applicable Indian laws and regulations.

**Marketing (opt-in only):** Sending promotional emails, deal alerts, or notifications — but only if you have explicitly opted in. You can unsubscribe at any time.

We will never sell your data to third parties for their own marketing purposes.
    `.trim(),
  },
  {
    id: 'sharing',
    title: 'Data Sharing & Third Parties',
    content: `
Rigamart shares your data with trusted third parties only when necessary to provide our services:

**Delivery Partners:** Your name, phone number, and delivery address are shared with our logistics partners (e.g., Delhivery, DTDC) solely for order delivery.

**Payment Processors:** Order amount and transaction identifiers are shared with Razorpay under their PCI-DSS Level 1 compliant infrastructure. We do not share full card or UPI details.

**Cloud Infrastructure:** We use cloud servers (hosted in India) to store data. Our hosting providers are contractually bound to keep your data confidential.

**Legal Authorities:** We may disclose your data when required by law, court order, or to prevent fraud or illegal activity.

All third-party data sharing agreements include appropriate confidentiality and data protection clauses.
    `.trim(),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    content: `
We use cookies and similar tracking technologies to improve your experience on Rigamart.

**Essential Cookies:** Required for the platform to function — these include your session authentication token (stored as a secure, HttpOnly cookie) and cart state.

**Analytics Cookies:** We use privacy-respecting analytics tools to understand aggregated usage patterns, such as popular search terms and high-traffic pages. These do not identify you individually.

**Preference Cookies:** Used to remember your saved preferences such as currency, region, or display settings.

You can manage cookie preferences via your browser settings. Note that disabling essential cookies will prevent you from logging in or completing purchases.

We do not use cross-site tracking cookies or sell data to advertising networks.
    `.trim(),
  },
  {
    id: 'security',
    title: 'Data Security',
    content: `
We take the security of your personal data seriously and implement the following technical safeguards:

**Encryption in Transit:** All communication between your browser and our servers is encrypted via TLS 1.3. HTTP connections are automatically redirected to HTTPS.

**Encryption at Rest:** Sensitive database fields (e.g., OTP tokens, session identifiers) are encrypted at rest using AES-256.

**Password Hashing:** Passwords are never stored in plain text. We use bcrypt with a minimum cost factor of 12.

**Access Controls:** Data access within our team is role-restricted on a need-to-know basis. All access to production data is logged and audited.

**Incident Response:** In the event of a data breach affecting your personal data, we will notify you within 72 hours in accordance with applicable regulations.

Despite these measures, no system is completely secure. We encourage you to use a strong, unique password and enable two-factor authentication when available.
    `.trim(),
  },
  {
    id: 'rights',
    title: 'Your Rights',
    content: `
As a user of Rigamart, you have the following rights regarding your personal data:

**Access:** You may request a copy of the personal data we hold about you at any time by contacting support@rigamart.com.

**Correction:** If any of your data is inaccurate or incomplete, you can update it directly from your profile settings or request a correction from our team.

**Deletion:** You may request the deletion of your account and associated personal data. We will process such requests within 7 business days, subject to legal retention requirements.

**Data Portability:** You may request an export of your order history and account data in a machine-readable format (JSON/CSV).

**Opt-Out:** You may opt out of marketing communications at any time by clicking 'Unsubscribe' in any promotional email or updating your notification preferences in Account Settings.

To exercise any of these rights, email us at support@rigamart.com with the subject line 'Data Rights Request'.
    `.trim(),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: `
If you have any questions about this Privacy Policy or how we handle your personal data, you can reach our Data Protection team at:

**Email:** privacy@rigamart.com
**Postal Address:** Data Protection Officer, Rigamart Online Services Pvt. Ltd., Buildings Alyssa, Begonia & Clove, Embassy Tech Village, Outer Ring Road, Bengaluru – 560103, Karnataka, India.

We aim to respond to all privacy-related queries within 5 business days.

This Privacy Policy was last updated on **September 2026** and supersedes all previous versions. We reserve the right to update this policy at any time; material changes will be communicated to registered users via email.
    `.trim(),
  },
];

// ─── Markdown-lite renderer (bold only) ─────────────────────────────────────

function RenderContent({ text }) {
  const paragraphs = text.split('\n\n');
  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => {
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
