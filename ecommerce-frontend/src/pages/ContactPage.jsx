import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  HelpCircle,
  FileText,
  Building,
  UserCheck
} from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations.js';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Order Delivery & Tracking',
    orderNumber: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setError('');
    setSubmitting(true);

    // Simulate ticket creation and SLA tracking
    setTimeout(() => {
      const ticketId = `RM-TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket({
        id: ticketId,
        name: formData.name,
        email: formData.email,
        category: formData.category,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      });
      setSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'Order Delivery & Tracking',
        orderNumber: '',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted" />
          <span className="text-ink font-medium">Contact &amp; Grievance Redressal</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consumer Protection Compliance &amp; Customer Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Contact Us &amp; Grievance Redressal
          </h1>
          <p className="text-sm text-muted mt-2.5 leading-relaxed">
            We are committed to delivering swift, transparent resolution for all our customers and sellers.
            Reach out via phone, email, or lodge an official grievance under Indian E-Commerce Rules, 2020.
          </p>
        </div>

        {/* Quick Contact Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Card 1: Customer Helpline */}
          <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs">
            <div className="p-2.5 rounded-xl bg-brand/10 text-brand w-fit mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Customer Helpline</h3>
            <p className="text-base font-bold text-ink mt-1">+91 1800 123 4567</p>
            <p className="text-[11px] text-muted mt-1">Toll-free across India &bull; Mon–Sat (9 AM – 8 PM)</p>
          </div>

          {/* Card 2: Support Email */}
          <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs">
            <div className="p-2.5 rounded-xl bg-brand/10 text-brand w-fit mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Customer Support</h3>
            <a href="mailto:support@rigamart.com" className="text-base font-bold text-ink hover:text-brand transition-colors mt-1 block truncate">
              support@rigamart.com
            </a>
            <p className="text-[11px] text-muted mt-1">Typical reply time: within 4 business hours</p>
          </div>

          {/* Card 3: Grievance Desk */}
          <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Grievance Officer</h3>
            <a href="mailto:grievance@rigamart.com" className="text-base font-bold text-ink hover:text-brand transition-colors mt-1 block truncate">
              grievance@rigamart.com
            </a>
            <p className="text-[11px] text-muted mt-1">Designated legal officer &bull; SLA &lt; 48h</p>
          </div>

          {/* Card 4: Operating Hub */}
          <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Registered Office</h3>
            <p className="text-xs font-semibold text-ink mt-1">Bengaluru, Karnataka</p>
            <p className="text-[11px] text-muted mt-1">Brigade Gateway, Malleshwaram 560055</p>
          </div>
        </div>

        {/* Two Column Layout: Support Form & Legal Grievance Mandate Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column: Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-surface rounded-2xl border border-line shadow-xs p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-line">
              <MessageSquare className="w-5 h-5 text-brand" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-ink">Send Us an Inquiry or Feedback</h2>
                <p className="text-xs text-muted">Fill out the form below and our support team will get back to you promptly.</p>
              </div>
            </div>

            {submittedTicket ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-ink">Inquiry Submitted Successfully!</h3>
                <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-ink">{submittedTicket.name}</span>. Your ticket has been logged with reference ID:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-surface border border-line font-mono font-bold text-sm text-brand">
                  {submittedTicket.id}
                </div>
                <p className="text-[11px] text-muted">
                  A confirmation has been sent to <span className="text-ink font-semibold">{submittedTicket.email}</span>. Our team will review and reply within 24–48 hours.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-4 py-2 rounded-xl bg-surface hover:bg-canvas border border-line text-xs font-semibold text-ink cursor-pointer transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sangam Kumar"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-line bg-canvas text-muted text-xs font-semibold">
                        +91
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 rounded-r-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Inquiry Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all cursor-pointer"
                    >
                      <option value="Order Delivery & Tracking">Order Delivery &amp; Tracking</option>
                      <option value="Returns, Exchanges & Refunds">Returns, Exchanges &amp; Refunds</option>
                      <option value="Payment or Billing Inquiry">Payment or Billing Inquiry</option>
                      <option value="Seller Onboarding / Partnership">Seller Onboarding / Partnership</option>
                      <option value="Grievance Redressal Escalation">Grievance Redressal Escalation</option>
                      <option value="Other Feedback or Query">Other Feedback or Query</option>
                    </select>
                  </div>
                </div>

                {/* Optional Order ID */}
                <div>
                  <label htmlFor="orderNumber" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Order Number <span className="text-muted font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="orderNumber"
                    name="orderNumber"
                    type="text"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    placeholder="e.g. RM-20261025-XXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all font-mono"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Detailed Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your query or issue in detail..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all resize-y"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand hover:bg-brand/90 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Consumer Protection Grievance Officer & Statutory Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Grievance Redressal Officer Card */}
            <div className="bg-surface rounded-2xl border border-brand/30 shadow-xs p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-brand/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
              
              <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Compliance</span>
              </div>
              
              <h3 className="text-base font-bold text-ink">Grievance Redressal Mechanism</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000, details of our designated Grievance Officer are set forth below:
              </p>

              <div className="mt-4 p-4 rounded-xl bg-canvas border border-line space-y-2.5 text-xs">
                <div>
                  <span className="text-muted block text-[11px]">Designated Grievance Officer</span>
                  <span className="font-bold text-ink">Mr. Sangam Kumar</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Designation</span>
                  <span className="font-medium text-ink">Head of Customer Operations &amp; Regulatory Grievance</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Official Grievance Email</span>
                  <a href="mailto:grievance@rigamart.com" className="font-semibold text-brand hover:underline font-mono">
                    grievance@rigamart.com
                  </a>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Direct Legal Helpline</span>
                  <span className="font-mono text-ink font-semibold">+91 (080) 4120-7890</span>
                </div>
                <div className="pt-2 border-t border-line">
                  <span className="text-[11px] text-muted block">
                    <span className="font-semibold text-ink">Statutory SLAs:</span> Acknowledgment within 48 hours; final dispute resolution within 30 days from date of receipt.
                  </span>
                </div>
              </div>
            </div>

            {/* Corporate Registered Office Card */}
            <div className="bg-surface rounded-2xl border border-line shadow-xs p-6">
              <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider mb-3">
                <MapPin className="w-4 h-4 text-brand" />
                <span>Registered Office Address</span>
              </div>
              <div className="text-xs space-y-1.5 text-muted leading-relaxed">
                <p className="font-semibold text-ink">Rigamart E-Commerce Technologies Private Limited</p>
                <p>Brigade Gateway, Level 12, Tower B</p>
                <p>26/1 Dr. Rajkumar Road, Malleshwaram-Rajajinagar</p>
                <p>Bengaluru, Karnataka &ndash; 560055, India</p>
                <p className="pt-1 font-mono text-[11px] text-ink">CIN: U72900KA2026PTC189421</p>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-surface rounded-2xl border border-line shadow-xs p-5">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Looking for Quick Answers?</h4>
              <ul className="space-y-2 text-xs text-muted">
                <li>
                  <Link to="/help" className="flex items-center justify-between hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-canvas">
                    <span>Help Center &amp; Frequently Asked Questions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link to="/track-order" className="flex items-center justify-between hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-canvas">
                    <span>Track Your Package in Real-Time</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="flex items-center justify-between hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-canvas">
                    <span>Terms of Service &amp; Buyer Protection</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
