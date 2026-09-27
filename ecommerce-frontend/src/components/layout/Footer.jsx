import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 text-sm mt-16 border-t border-gray-800 font-sans">
      {/* 4 E-Commerce Trust Badges */}
      <div className="border-b border-gray-800 py-8 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-8 h-8 text-brand-500 mb-2" />
            <h4 className="text-white font-semibold text-sm">100% Authentic Products</h4>
            <p className="text-xs text-gray-400 mt-1">Directly from verified manufacturers & sellers</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="w-8 h-8 text-brand-500 mb-2" />
            <h4 className="text-white font-semibold text-sm">Free & Fast Delivery</h4>
            <p className="text-xs text-gray-400 mt-1">Free shipping across India on orders &ge; ₹500</p>
          </div>
          <div className="flex flex-col items-center">
            <RotateCcw className="w-8 h-8 text-brand-500 mb-2" />
            <h4 className="text-white font-semibold text-sm">7-Day Free Returns</h4>
            <p className="text-xs text-gray-400 mt-1">Hassle-free doorstep pickup & instant refund</p>
          </div>
          <div className="flex flex-col items-center">
            <CreditCard className="w-8 h-8 text-brand-500 mb-2" />
            <h4 className="text-white font-semibold text-sm">Secure Payments</h4>
            <p className="text-xs text-gray-400 mt-1">UPI, Credit/Debit Cards & Cash on Delivery</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <Logo variant="full" size="md" wordmarkColor="white" />
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            India's trusted multi-vendor marketplace connecting millions of customers to verified sellers nationwide.
          </p>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Press & Media</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Wholesale Program</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Customer Care</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-white transition-colors">Help Center & FAQs</Link></li>
            <li><Link to="/my-orders" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Shipping Policies</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Partner With Us</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/register" className="hover:text-white transition-colors">Sell on Rigamart</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Supply Chain Hub</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Affiliate Program</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Advertise Your Brand</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Registered Office</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Rigamart Online Services Pvt. Ltd.<br />
            Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
            Outer Ring Road, Bengaluru - 560103, Karnataka, India<br />
            CIN: U51109KA2025PTC123456
          </p>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Rigamart.com. Crafted for portfolio excellence with MERN Stack + Tailwind CSS.
      </div>
    </footer>
  );
}
