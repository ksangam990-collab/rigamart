import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations.js';

// ─── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: `
By accessing or using the Rigamart platform (available at rigamart.com and associated mobile applications), you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.

If you do not agree with any part of these Terms, you must immediately discontinue use of the platform. These Terms constitute a legally binding agreement between you and Rigamart Online Services Pvt. Ltd. ("Rigamart", "we", "our", or "us").

We reserve the right to update or modify these Terms at any time without prior notice. Continued use of the platform after any such changes constitutes acceptance of the new Terms. We will make reasonable efforts to notify registered users of material changes via email.

You must be at least 18 years of age to use this platform. By using Rigamart, you represent and warrant that you meet this age requirement.
    `.trim(),
  },
  {
    id: 'accounts',
    title: 'User Accounts',
    content: `
To access most features of Rigamart, you must create an account. You agree to:

**Accurate Information:** Provide truthful, accurate, and current information during registration and keep your profile updated at all times.

**Account Security:** Maintain the confidentiality of your login credentials. You are solely responsible for all activities that occur under your account. Notify us immediately at support@rigamart.com if you suspect any unauthorised access.

**Single Account:** Each individual may maintain only one buyer account. Sellers may maintain one seller account in addition to a buyer account, subject to our Seller Program terms.

**No Transfer:** Your account is personal to you and may not be sold, transferred, or assigned to another party.

We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or remain inactive for more than 24 consecutive months.
    `.trim(),
  },
  {
    id: 'seller-terms',
    title: 'Seller Terms',
    content: `
By joining the Rigamart Seller Program, you agree to the following additional obligations:

**Product Authenticity:** You warrant that all products listed on Rigamart are genuine, accurately described, legally owned by you, and fit for their intended purpose. Listing counterfeit, illegal, or prohibited goods is strictly forbidden and may result in immediate account termination and legal action.

**Accurate Listings:** Product titles, descriptions, images, and prices must accurately represent the item being sold. Misleading listings are a violation of these Terms.

**Order Fulfilment:** You are obligated to fulfil all accepted orders within the dispatch timeframe specified during listing. Repeated cancellations or non-fulfilment may result in account penalties.

**Commission & Payouts:** Rigamart charges a platform commission on each successful sale. Payout rates and schedules are defined in the Seller Commission Schedule, which may be updated periodically. Payouts are released 7 days after delivery confirmation.

**Tax Compliance:** Sellers are independently responsible for collecting and remitting GST and any other applicable taxes. Rigamart may collect GST on its commission as required by law.
    `.trim(),
  },
  {
    id: 'buyer-terms',
    title: 'Buyer Terms',
    content: `
As a buyer on Rigamart, you agree to the following:

**Accurate Delivery Information:** You are responsible for providing a complete and correct delivery address. Rigamart and its logistics partners cannot be held liable for failed deliveries caused by incorrect address information.

**Payment Obligations:** By placing an order, you authorise the total amount (including applicable taxes and delivery charges) to be charged to your selected payment method. In case of payment failure, your order will not be processed.

**Return Policy Compliance:** Returns must be initiated within the 7-day return window and must meet the eligibility criteria defined in our Returns Policy. Abuse of the return system (e.g., wardrobing, returning used items as unused) may result in account restrictions.

**Reviews & Feedback:** Product reviews must be genuine, based on your own experience, and free from offensive or defamatory language. Fake reviews, whether positive or negative, are prohibited.

Rigamart is a marketplace platform. While we verify sellers, we are not the direct seller of most items. Liability for product quality rests primarily with the listing seller.
    `.trim(),
  },
  {
    id: 'prohibited',
    title: 'Prohibited Activities',
    content: `
You agree not to engage in any of the following activities while using Rigamart:

- Listing, selling, or promoting counterfeit, stolen, or illegal goods
- Using automated bots, scrapers, or scripts to access the platform without written permission
- Attempting to reverse-engineer, decompile, or access the platform's source code
- Manipulating product reviews, seller ratings, or order counts through artificial means
- Impersonating any person, business, or Rigamart employee
- Engaging in phishing, spreading malware, or attempting to compromise user accounts
- Using the platform to launder money or conduct fraudulent transactions
- Circumventing or attempting to bypass our payment or commission systems by conducting transactions off-platform
- Sending unsolicited commercial messages (spam) to other users

Violations may result in immediate account suspension, permanent banning, and civil or criminal legal proceedings.
    `.trim(),
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    content: `
**Rigamart's Content:** All content on the Rigamart platform — including logos, brand marks, UI design, software, text, and original photography — is the exclusive intellectual property of Rigamart Online Services Pvt. Ltd. and is protected under Indian and international copyright law.

**Seller Content:** By uploading product images, descriptions, and other content to Rigamart, you grant us a non-exclusive, royalty-free, worldwide license to display, reproduce, and distribute that content for the purpose of operating and marketing the platform.

**User-Generated Content:** Reviews, ratings, and comments submitted by users are licensed to Rigamart under the same terms. You represent that you have the right to submit such content.

**Restrictions:** You may not copy, reproduce, distribute, publish, or create derivative works from any Rigamart content without explicit written permission. Unauthorised use constitutes copyright infringement.

Rigamart respects third-party intellectual property rights. If you believe your copyrighted work has been infringed on our platform, contact us at legal@rigamart.com.
    `.trim(),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content: `
To the fullest extent permitted by applicable law, Rigamart, its directors, employees, and affiliates shall not be liable for:

- Any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform
- Loss of profits, revenue, data, goodwill, or other intangible losses
- Damages arising from unauthorised access to or alteration of your transmissions or data
- Conduct or content of third parties, including sellers and delivery partners, on the platform

In no event shall Rigamart's total cumulative liability to you exceed the total amount paid by you for transactions processed through the platform in the three (3) months preceding the event giving rise to the claim.

These limitations apply regardless of the legal theory on which the claim is based, whether contract, tort, negligence, or any other basis, even if Rigamart has been advised of the possibility of such damages.
    `.trim(),
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    content: `
These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.

Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India.

**Dispute Resolution:** Before initiating any legal proceedings, you agree to first attempt to resolve any dispute informally by contacting our support team at support@rigamart.com. We will make reasonable efforts to resolve disputes within 30 days.

If informal resolution fails, disputes shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996, with the seat of arbitration in Bengaluru, Karnataka.

These Terms do not affect any statutory rights you may have as a consumer under applicable Indian law, including under the Consumer Protection Act, 2019.
    `.trim(),
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    content: `
Rigamart reserves the right to modify these Terms of Service at any time at our sole discretion.

**Notification:** For material changes, we will provide at least 14 days' prior notice via email to your registered email address, or by displaying a prominent notice on the platform.

**Continued Use:** Your continued use of Rigamart following the effective date of any changes constitutes your binding acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the platform and may request account deletion.

**Versioning:** The current version of these Terms is always available at rigamart.com/terms. We recommend reviewing this page periodically.

These Terms were last updated in **September 2026**.
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
