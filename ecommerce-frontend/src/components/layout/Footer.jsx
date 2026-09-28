import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';

// ─── Social icon squares ──────────────────────────────────────────────────────

function SocialButton({ label, href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-brand-600 border border-gray-700 hover:border-brand-500 flex items-center justify-center text-gray-300 hover:text-white text-xs font-bold transition-all duration-200"
    >
      {children}
    </a>
  );
}

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

          {/* Portfolio Repository Link */}
          <div className="flex items-center gap-2 mb-4">
            <SocialButton label="GitHub Repository" href="https://github.com/ksangam990-collab/rigamart">gh</SocialButton>
          </div>

          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/about#architecture" className="hover:text-white transition-colors">Architecture</Link></li>
            <li><Link to="/help" className="hover:text-white transition-colors">Help Center &amp; FAQs</Link></li>
            <li><Link to="/sell" className="hover:text-white transition-colors">Sell on Rigamart</Link></li>
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

        {/* Column 4 — Project Notice */}
        <div>
          <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase mb-4">Project Notice</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Rigamart is an educational, full-stack multi-vendor e-commerce demonstration engineered with React, Redux, Node.js, and MongoDB.
          </p>
          <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
            Portfolio Demonstration &bull; Not a commercial business
          </p>
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

      {/* Copyright Notice */}
      <div className="border-t border-gray-800/80 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Rigamart.com. Crafted with passion for modern e-commerce engineering.
      </div>
    </footer>
  );
}
