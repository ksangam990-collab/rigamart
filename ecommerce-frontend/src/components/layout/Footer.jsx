import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';

// ─── Payment pill ─────────────────────────────────────────────────────────────

function PaymentPill({ label }) {
  return (
    <span className="px-2.5 py-1 rounded-full border border-gray-700 text-gray-500 text-[10px] font-medium tracking-wide">
      {label}
    </span>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 text-sm mt-16 border-t border-gray-800 font-sans">
      {/* 4 E-Commerce Trust Badges */}
      <div className="border-b border-gray-800 py-8 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-brand-950/60 text-brand-400 rounded-2xl mb-2.5 border border-brand-900/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-xs sm:text-sm">100% Authentic Products</h4>
            <p className="text-[11px] text-gray-400 mt-1">Directly from verified manufacturers &amp; sellers</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-brand-950/60 text-brand-400 rounded-2xl mb-2.5 border border-brand-900/40">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-xs sm:text-sm">Free &amp; Fast Delivery</h4>
            <p className="text-[11px] text-gray-400 mt-1">Free shipping across India on orders &ge; ₹500</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-brand-950/60 text-brand-400 rounded-2xl mb-2.5 border border-brand-900/40">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-xs sm:text-sm">7-Day Free Returns</h4>
            <p className="text-[11px] text-gray-400 mt-1">Hassle-free doorstep pickup &amp; instant refund</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-brand-950/60 text-brand-400 rounded-2xl mb-2.5 border border-brand-900/40">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-xs sm:text-sm">Secure Payments</h4>
            <p className="text-[11px] text-gray-400 mt-1">UPI, Credit/Debit Cards &amp; Cash on Delivery</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Column 1 — Brand */}
        <div>
          <div className="mb-4">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity" aria-label="Rigamart Home">
              <Logo variant="full" size="md" wordmarkColor="white" />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            India's trusted multi-vendor marketplace connecting millions of customers to verified sellers nationwide.
          </p>

          {/* GitHub Repository Link */}
          <div className="mb-4">
            <a
              href="https://github.com/ksangam990-collab/rigamart"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700 text-xs font-medium transition-all group"
            >
              <svg className="w-3.5 h-3.5 fill-current text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Repository</span>
            </a>
          </div>

          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/about#architecture" className="hover:text-white transition-colors">Architecture</Link></li>
            <li><Link to="/help" className="hover:text-white transition-colors">Help Center &amp; FAQs</Link></li>
            <li><Link to="/sell" className="hover:text-white transition-colors">Sell on Rigamart</Link></li>
            <li>
              <Link to="/styleguide" className="text-brand-soft hover:text-white transition-colors font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
                <span>Design System v2.0</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2 — Customer Care */}
        <div>
          <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase mb-4">Customer Care</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/help" className="hover:text-white transition-colors">Help Center &amp; FAQs</Link></li>
            <li><Link to="/my-orders" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link to="/help#returns" className="hover:text-white transition-colors">Returns &amp; Refunds</Link></li>
            <li><Link to="/help#delivery" className="hover:text-white transition-colors">Shipping Policies</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Column 3 — Partner */}
        <div>
          <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase mb-4">Partner With Us</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/sell" className="hover:text-white transition-colors">Sell on Rigamart</Link></li>
            <li><Link to="/sell#wholesale" className="hover:text-white transition-colors">Wholesale Program</Link></li>
            <li><Link to="/sell#supply-chain" className="hover:text-white transition-colors">Supply Chain Hub</Link></li>
            <li><Link to="/sell#affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
            <li><Link to="/sell#advertise" className="hover:text-white transition-colors">Advertise Your Brand</Link></li>
          </ul>
        </div>

        {/* Column 4 — Platform Architecture */}
        <div>
          <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase mb-4">Platform Architecture</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Next-generation multi-vendor commerce platform engineered with modern React, Redux Toolkit, Node.js, and MongoDB.
          </p>
          <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
            <span className="text-gray-400">Platform Architect</span>
            <span className="font-semibold text-white">Sangam Kumar</span>
          </div>
        </div>
      </div>

      {/* Payment Methods Strip */}
      <div className="border-t border-gray-800/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-2">
          {['Visa', 'Mastercard', 'UPI', 'Razorpay', 'PhonePe', 'Google Pay'].map((method) => (
            <PaymentPill key={method} label={method} />
          ))}
        </div>
      </div>

      {/* Bottom Bar: Copyright & Developer Attribution */}
      <div className="border-t border-gray-800/80 py-6 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} Rigamart Platform &bull; All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-gray-400">
            <span>Designed &amp; Developed by</span>
            <a
              href="https://github.com/ksangam990-collab"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white hover:text-brand-400 transition-colors"
            >
              Sangam Kumar
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
