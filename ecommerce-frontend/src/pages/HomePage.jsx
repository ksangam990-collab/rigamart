import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, ShoppingBag, Zap, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../utils/api.js';

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

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Showcase Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>India's Most Transparent Multi-Vendor Marketplace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Elevate Your Shopping Experience.
            </h1>
            <p className="text-blue-100 text-base sm:text-lg max-w-xl">
              Authentic brands, direct factory prices, and guaranteed express delivery across India.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/search"
                className="px-6 py-3 bg-white text-brand-600 hover:bg-gray-100 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Explore Catalog
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white/10 font-bold rounded-lg transition-all"
                >
                  Join as Seller
                </Link>
              )}
            </div>
          </div>

          {/* Live System Diagnostic Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-300" />
              Platform Live Health Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <span className="text-blue-200">Active User Session:</span>
                <span className="font-semibold text-white">
                  {isAuthenticated ? `${user.name} (${user.role})` : 'Guest Visitor'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <span className="text-blue-200">REST API Gateway:</span>
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {healthStatus?.status || 'Connecting...'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <span className="text-blue-200">Database Engine:</span>
                <span className="font-semibold text-emerald-300 capitalize">
                  MongoDB Atlas ({healthStatus?.database || 'Connecting...'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shop by Top Categories</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked collections across verified sellers</p>
          </div>
          <Link
            to="/search"
            className="text-brand-600 hover:text-brand-700 font-semibold text-sm flex items-center gap-1 group"
          >
            View All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.link}
              className="group block relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-bold text-gray-800 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
