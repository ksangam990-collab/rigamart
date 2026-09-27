import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShoppingBag,
  Zap,
  Shield,
  Sparkles,
  CheckCircle2,
  Truck,
  RotateCcw,
  CreditCard
} from 'lucide-react';
import api from '../utils/api.js';
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonTap
} from '../utils/animations.js';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealthStatus(res.data.data);
      } catch (e) {
        setHealthStatus({ status: 'disconnected', database: 'offline' });
      }
    };
    fetchHealth();
  }, []);

  const categories = [
    { name: "Men's Fashion", image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', link: '/search?category=mens-fashion' },
    { name: "Women's Ethnic", image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500', link: '/search?category=womens-ethnic' },
    { name: "Smart Electronics", image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', link: '/search?category=electronics' },
    { name: "Footwear & Sneakers", image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', link: '/search?category=footwear' }
  ];

  const trustBadges = [
    { icon: Truck, title: 'Express Delivery', desc: 'Free across India on ₹500+' },
    { icon: Shield, title: '100% Genuine', desc: 'Verified multi-vendor products' },
    { icon: RotateCcw, title: '7-Day Easy Returns', desc: 'Hassle-free instant refund' },
    { icon: CreditCard, title: 'Secure Razorpay', desc: 'Cards, UPI & Net Banking' }
  ];

  return (
    <div className="space-y-12 pb-16 overflow-hidden">
      {/* Hero Showcase Section */}
      <section className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background glow circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-80 h-80 bg-brand-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
          {/* Hero Copy (Staggered entrance) */}
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>India's Most Transparent Multi-Vendor Marketplace</span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
            >
              Elevate Your <br className="hidden sm:inline" />
              Shopping Experience<span className="text-amber-400">.</span>
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-blue-100 text-base sm:text-lg max-w-xl leading-relaxed"
            >
              Authentic brands, direct factory prices, and guaranteed express delivery across India.
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-4 pt-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/search"
                  className="px-6 py-3.5 bg-white text-brand-600 hover:bg-gray-50 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 text-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-600" />
                  Explore Catalog
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {!isAuthenticated && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm font-bold rounded-xl transition-all text-sm flex items-center gap-2"
                  >
                    Join as Seller
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Live System Diagnostic Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-300" />
                Platform Live Health Status
              </h3>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl border border-white/5">
                <span className="text-blue-200 text-xs">Active Session:</span>
                <span className="font-semibold text-white text-xs truncate max-w-[200px]">
                  {isAuthenticated ? `${user.name} (${user.role})` : 'Guest Visitor'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl border border-white/5">
                <span className="text-blue-200 text-xs">REST API Gateway:</span>
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {healthStatus?.status || 'Connecting...'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl border border-white/5">
                <span className="text-blue-200 text-xs">Database Engine:</span>
                <span className="font-semibold text-emerald-300 capitalize text-xs">
                  MongoDB Atlas ({healthStatus?.database || 'Connecting...'})
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges Strip (Scroll reveal) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-2">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{badge.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Featured Categories Grid (Scroll reveal + stagger) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shop by Top Categories</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Handpicked collections across verified sellers</p>
          </div>
          <Link
            to="/search"
            className="text-brand-600 hover:text-brand-700 font-bold text-xs sm:text-sm flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={cat.link}
                className="group block relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
