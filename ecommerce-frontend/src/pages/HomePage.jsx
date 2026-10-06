import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Star,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Tag,
  Zap,
  Store
} from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';
import { Button, Badge } from '../components/ui';
import BankOfferTicker from '../components/home/BankOfferTicker.jsx';
import CategoryStoryRail from '../components/home/CategoryStoryRail.jsx';
import LightningDrop from '../components/home/LightningDrop.jsx';
import ScratchVoucherCard from '../components/home/ScratchVoucherCard.jsx';
import GeminiStylistCard from '../components/home/GeminiStylistCard.jsx';
import {
  fadeInUp,
  staggerContainer,
  staggerItem
} from '../utils/animations.js';

const CURATED_TRENDING_FALLBACKS = [
  {
    _id: 'curated-drop-1',
    name: 'Aura Studio ANC Wireless Over-Ear Headphones',
    brand: 'Aura Sound',
    category: 'electronics',
    basePrice: 2399,
    images: [
      { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80' }
    ],
    variants: [
      { _id: 'var-c1', price: 2399, mrp: 5999, stock: 18, color: 'Midnight Black' }
    ],
    ratings: { average: 4.8, count: 124 },
    badge: '🔥 Bestseller'
  },
  {
    _id: 'curated-drop-2',
    name: 'Chanderi Handloom Pure Silk Embroidered Kurta Set',
    brand: 'Jaipur Weaves',
    category: 'womens-ethnic',
    basePrice: 1899,
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80' }
    ],
    variants: [
      { _id: 'var-c2', price: 1899, mrp: 3499, stock: 12, size: 'M' }
    ],
    ratings: { average: 4.9, count: 86 },
    badge: 'Handloom'
  },
  {
    _id: 'curated-drop-3',
    name: 'Kravitz Handcrafted Italian Tan Leather Derby',
    brand: 'Kravitz Atelier',
    category: 'footwear',
    basePrice: 2999,
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80' }
    ],
    variants: [
      { _id: 'var-c3', price: 2999, mrp: 4999, stock: 8, size: 'UK 9' }
    ],
    ratings: { average: 4.7, count: 95 },
    badge: 'Pure Leather'
  },
  {
    _id: 'curated-drop-4',
    name: 'Minimalist Ceramic Matte Artisan Pour-Over Pot',
    brand: 'Clay & Kiln',
    category: 'home-kitchen',
    basePrice: 1199,
    images: [
      { url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' }
    ],
    variants: [
      { _id: 'var-c4', price: 1199, mrp: 2199, stock: 15, color: 'Stone Grey' }
    ],
    ratings: { average: 4.9, count: 64 },
    badge: 'Artisan Pick'
  }
];

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Fetch catalog shelves on mount with automatic grid balancing
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const [trendingRes, featuredRes] = await Promise.all([
          api.get('/products?sort=newest&limit=8').catch(() => ({ data: { data: { products: [] } } })),
          api.get('/products?isFeatured=true&limit=4').catch(() => ({ data: { data: { products: [] } } }))
        ]);

        if (isMounted) {
          const apiTrending = trendingRes.data.data?.products || [];
          if (apiTrending.length === 0) {
            setTrendingProducts(CURATED_TRENDING_FALLBACKS);
          } else if (apiTrending.length < 4) {
            const existingIds = new Set(apiTrending.map((p) => p._id));
            const additions = CURATED_TRENDING_FALLBACKS.filter((f) => !existingIds.has(f._id));
            setTrendingProducts([...apiTrending, ...additions].slice(0, 4));
          } else if (apiTrending.length % 2 !== 0) {
            const existingIds = new Set(apiTrending.map((p) => p._id));
            const addition = CURATED_TRENDING_FALLBACKS.find((f) => !existingIds.has(f._id));
            setTrendingProducts(addition ? [...apiTrending, addition] : apiTrending);
          } else {
            setTrendingProducts(apiTrending);
          }
          setFeaturedProducts(featuredRes.data.data?.products || []);
        }
      } catch {
        // Silent fail — preserve pristine homepage presentation
        if (isMounted) {
          setTrendingProducts(CURATED_TRENDING_FALLBACKS);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const curatedCategories = [
    {
      name: "Men's Fashion",
      offer: 'Starting ₹499',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=mens-fashion',
      pill: 'New Arrivals'
    },
    {
      name: "Women's Ethnic",
      offer: 'Up to 60% Off',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=womens-ethnic',
      pill: 'Festive Special'
    },
    {
      name: 'Audio & Gadgets',
      offer: 'Up to 70% Off',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=electronics',
      pill: 'Top Rated'
    },
    {
      name: 'Footwear & Kicks',
      offer: 'Min 40% Off',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=footwear',
      pill: 'Trending'
    }
  ];

  const trustBadges = [
    {
      icon: ShieldCheck,
      title: '100% Genuine',
      shortDesc: 'Verified Indian Makers'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      shortDesc: 'On Orders Above ₹500'
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      shortDesc: 'Doorstep Pickup & Refund'
    },
    {
      icon: CreditCard,
      title: 'Escrow Protected',
      shortDesc: 'UPI, Cards & COD'
    }
  ];

  const customerReviews = [
    {
      quote: "Finally an Indian marketplace that actually delivers what is shown in the catalog. Got my noise-cancelling headphones in 48 hours — authentic, sealed, and verified.",
      name: 'Ravi Krishnamurthy',
      location: 'Bengaluru, Karnataka',
      role: 'Verified Customer',
      rating: 5,
      date: 'Purchased 3 days ago'
    },
    {
      quote: "The seller portal and payout transparency is unparalleled. We scaled our Jaipur handloom store from zero to ₹1.8 lakh monthly sales in 4 months with zero hidden listing fees.",
      name: 'Priya Mehra',
      location: 'Jaipur, Rajasthan',
      role: 'Verified Merchant',
      rating: 5,
      date: 'Seller since 2025'
    },
    {
      quote: "UPI payment worked in 3 seconds. When I requested a size exchange for sneakers, doorstep pickup was done the next morning and new size delivered 2 days later.",
      name: 'Arjun Talreja',
      location: 'Mumbai, Maharashtra',
      role: 'Verified Customer',
      rating: 5,
      date: 'Purchased 1 week ago'
    }
  ];

  const quickFilterPills = [
    { label: '⚡ Super Express (< 48h)', link: '/search?sort=fastest' },
    { label: '₹ Under ₹999 Deals', link: '/search?maxPrice=999' },
    { label: '🎧 Studio Headphones', link: '/search?category=electronics' },
    { label: '✨ Handcrafted Cottons', link: '/search?category=womens-ethnic' },
    { label: '🛡️ Verified Sellers Only', link: '/search?verified=true' }
  ];

  return (
    <div className="space-y-6 sm:space-y-12 pb-16 sm:pb-20 overflow-hidden font-sans">
      {/* ── 0A. Top Bank Offer Ticker Ribbon (Desktop Only) ───────────────────── */}
      <BankOfferTicker />

      {/* ── 0B. Circular Category Story Rail ───────────────────────────────── */}
      <CategoryStoryRail />

      {/* ── 1. Hero Showcase (Desktop: 12-col festive banner, Mobile: Clean Flash Deal + Pills) ── */}
      <section className="relative pt-1 sm:pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Desktop Hero Showcase (12-col) */}
        <div className="hidden lg:block relative rounded-3xl bg-surface border border-line shadow-card overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-soft/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 grid grid-cols-12 gap-12 p-10 lg:p-14 items-center">
            {/* Left Column: Commercial Headline & Intent */}
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="visible"
              className="col-span-7 space-y-6"
            >
              <motion.div variants={staggerItem}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-soft text-brand-dark border border-brand/20 text-xs font-semibold tracking-tight shadow-subtle">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  <span>Mega Festive Season Live • Up to 70% Off</span>
                </div>
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-5xl lg:text-6xl font-black font-display tracking-tight text-ink leading-[1.08]"
              >
                Authentic Brands. <br />
                <span className="text-brand">Direct Pricing.</span> Verified Sellers.
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="text-muted text-base lg:text-lg max-w-xl leading-relaxed"
              >
                Shop thousands of verified products from top artisans, verified manufacturers, and trusted brands across India with 100% buyer protection.
              </motion.p>

              <motion.div variants={staggerItem} className="flex items-center gap-3 pt-2">
                <Link to="/catalog">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore All Collections
                  </Button>
                </Link>

                {!isAuthenticated && (
                  <Link to="/sell">
                    <Button variant="secondary" size="lg" leftIcon={<Store className="w-4 h-4 text-muted" />}>
                      Sell on Rigamart
                    </Button>
                  </Link>
                )}
              </motion.div>

              {/* Popular Searches Horizontal Row */}
              <motion.div variants={staggerItem} className="pt-4 border-t border-line">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2.5">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickFilterPills.map((pill) => (
                    <Link
                      key={pill.label}
                      to={pill.link}
                      className="text-xs px-3 py-1.5 rounded-xl bg-canvas hover:bg-brand-soft text-ink hover:text-brand-dark border border-line transition-all duration-150 font-medium"
                    >
                      {pill.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Lightning Drop Deal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="col-span-5 flex items-center justify-center"
            >
              <LightningDrop />
            </motion.div>
          </div>
        </div>

        {/* Mobile Hero: Streamlined Flash Deal + Horizontal Trending Searches (Zero clutter!) */}
        <div className="lg:hidden space-y-3">
          <LightningDrop />

          {/* Sleek Horizontal Trending Search Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 px-1 -mx-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted shrink-0 pl-1">
              Popular:
            </span>
            {quickFilterPills.map((pill) => (
              <Link
                key={pill.label}
                to={pill.link}
                className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-surface text-ink hover:text-brand border border-line shadow-2xs font-medium shrink-0 active:scale-95 transition-transform"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Featured Categories (Myntra-Style Categories To Bag) ──────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3.5 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="text-brand text-base sm:text-lg">🛍️</span>
            <h2 className="text-lg sm:text-2xl font-black font-display text-ink tracking-tight">
              Featured Categories
            </h2>
            <span className="hidden sm:inline-block text-[10px] font-bold bg-amber-400/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Hot Picks
            </span>
          </div>

          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-brand hover:text-brand-dark flex items-center gap-1 group shrink-0"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {curatedCategories.map((cat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={cat.link}
                className="group block relative rounded-2xl bg-surface border border-line shadow-subtle hover:shadow-card transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Floating Glassmorphic Pill */}
                  <div className="absolute top-2 right-2">
                    <span className="text-[9.5px] sm:text-[10px] font-bold bg-slate-950/75 backdrop-blur-md text-white px-2 py-0.5 rounded-full border border-white/10 shadow-xs">
                      {cat.pill}
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-4 text-left bg-surface">
                  <h3 className="text-xs sm:text-sm font-bold text-ink group-hover:text-brand transition-colors tracking-tight truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-black text-brand uppercase tracking-tight mt-0.5">
                    {cat.offer}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. Shelf A: Trending Now (ProductCard 2.0 Grid) ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent" aria-label="sparkles">🔥</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent font-mono">
                TRENDING NOW
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
              Fresh Arrivals &amp; Customer Favorites
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-1">
              Real-time favorites authenticated and dispatched within 24 hours
            </p>
          </div>

          <Link
            to="/search?sort=newest"
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1 group shrink-0"
          >
            <span>See All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards with Skeletons to prevent CLS */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "200px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6"
          >
            {trendingProducts.map((product) => (
              <motion.div key={product._id} variants={staggerItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="p-8 text-center bg-surface border border-line rounded-card">
            <p className="text-sm font-medium text-muted">
              Products are refreshing. Explore the full catalog below.
            </p>
            <div className="mt-4">
              <Link to="/catalog">
                <Button variant="secondary" size="sm">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── 4. Social Proof: Customer & Seller Reviews Wall ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold mb-2">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>4.9 / 5 Average Marketplace Rating</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
            Loved by Buyers. Trusted by Sellers.
          </h2>
          <p className="text-muted text-xs sm:text-sm mt-1">
            Genuine experiences from thousands of verified transactions across India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerReviews.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "200px" }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              className="bg-surface rounded-card border border-line p-6 shadow-subtle flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-4 text-accent">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-accent" />
                  ))}
                </div>

                <p className="text-sm text-ink leading-relaxed font-sans">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-ink">{rev.name}</h3>
                  <p className="text-[11px] text-muted">{rev.location}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand bg-brand-soft px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {rev.role}
                  </span>
                  <p className="text-[10px] text-muted mt-0.5">{rev.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5.5. Rigamart Tech Edge: Gold Scratch Card & Gemini AI Stylist ────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          <ScratchVoucherCard />
          <GeminiStylistCard />
        </div>
      </section>

      {/* ── 5.8. Trust & Confidence Bar (Like Amazon & Myntra) ──────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-5 bg-surface rounded-2xl border border-line shadow-subtle">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl bg-canvas/60">
                <div className="p-2 rounded-lg bg-brand-soft text-brand shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-ink truncate leading-tight">
                    {badge.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted truncate mt-0.5">
                    {badge.shortDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. Seller Conversion Banner ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-card bg-brand-soft border border-brand/20 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand font-mono">
              MERCHANT PARTNERSHIP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
              Reach Crores of Customers Across 28 States
            </h2>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Zero listing fees, weekly automated Razorpay payouts, and built-in logistics. Go live and start selling in under 24 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/sell">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Selling Free
              </Button>
            </Link>
            <Link to="/help">
              <Button variant="secondary" size="lg">
                Seller FAQs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
