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
import {
  fadeInUp,
  staggerContainer,
  staggerItem
} from '../utils/animations.js';

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Fetch catalog shelves on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const [trendingRes, featuredRes] = await Promise.all([
          api.get('/products?sort=newest&limit=8').catch(() => ({ data: { data: { products: [] } } })),
          api.get('/products?isFeatured=true&limit=4').catch(() => ({ data: { data: { products: [] } } }))
        ]);

        if (isMounted) {
          setTrendingProducts(trendingRes.data.data?.products || []);
          setFeaturedProducts(featuredRes.data.data?.products || []);
        }
      } catch {
        // Silent fail — preserve pristine homepage presentation
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
      name: "Men's Sartorial",
      tagline: 'Linens, Kurtas & Tailoring',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=mens-fashion',
      pill: 'New Arrivals'
    },
    {
      name: "Women's Ethnic Luxe",
      tagline: 'Handloom Sarees & Anarkalis',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=womens-ethnic',
      pill: 'Handpicked'
    },
    {
      name: 'Smart Audio & Gear',
      tagline: 'Noise Cancelling & Wearables',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=electronics',
      pill: 'Verified Tech'
    },
    {
      name: 'Sneakers & Footwear',
      tagline: 'Everyday Comfort & Athletics',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=footwear',
      pill: 'Trending'
    }
  ];

  const trustBadges = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Guaranteed',
      desc: 'Direct authentication and verified Indian manufacturers.'
    },
    {
      icon: Truck,
      title: 'Express Nationwide Delivery',
      desc: 'Free logistics on orders above ₹500 across 28 states.'
    },
    {
      icon: RotateCcw,
      title: '7-Day Doorstep Returns',
      desc: 'Zero-friction pickups with instant escrow refund.'
    },
    {
      icon: CreditCard,
      title: 'Escrow Protected Payments',
      desc: 'Razorpay encrypted UPI, Cards, Net Banking & COD.'
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
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden font-sans">
      {/* ── 1. Editorial Hero Showcase ────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-surface border border-line shadow-card overflow-hidden">
          {/* Subtle warm ambient radial background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-soft/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14 items-center">
            {/* Left Column: Editorial Headline & Copy */}
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6"
            >
              {/* Trust Badge Pill */}
              <motion.div variants={staggerItem}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-soft text-brand-dark border border-brand/20 text-xs font-semibold tracking-tight shadow-subtle">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  <span>India&apos;s Premier Multi-Vendor Marketplace</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={staggerItem}
                className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-ink leading-[1.08]"
              >
                Curated commerce. <br className="hidden sm:inline" />
                <span className="text-brand">Photos first</span>, chrome second.
              </motion.h1>

              {/* Editorial Subtitle */}
              <motion.p
                variants={staggerItem}
                className="text-muted text-base sm:text-lg max-w-xl leading-relaxed"
              >
                A modern multi-vendor marketplace built for discerning shoppers across India. Authentic brands, verified artisans, direct pricing, and zero fake scarcity.
              </motion.p>

              {/* Action Buttons */}
              <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3 pt-2">
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

              {/* Quick Search Intent Pills */}
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

            {/* Right Column: Editorial Hero Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-2xl bg-canvas border border-line p-3 shadow-elevation group overflow-hidden">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-surface">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                    alt="Editorial Featured Tech: Studio Acoustics"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />

                  {/* Gradient Overlay for Typography Poise */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

                  {/* Floating Tag */}
                  <div className="absolute top-3.5 left-3.5">
                    <Badge color="accent" variant="solid" size="md">
                      FEATURED CURATION
                    </Badge>
                  </div>

                  {/* Bottom Editorial Caption */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                      Acoustic Engineering
                    </span>
                    <h2 className="text-xl font-bold font-display text-white leading-tight">
                      Aura Studio Wireless ANC
                    </h2>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-2 tabular-nums">
                        <span className="text-lg font-black text-white">₹3,499</span>
                        <span className="text-xs text-white/60 line-through">₹5,999</span>
                      </div>
                      <Link
                        to="/search?category=electronics"
                        className="text-xs font-semibold text-white hover:text-accent flex items-center gap-1 transition-colors"
                      >
                        <span>View Gear</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. Trust & Transparency Strip ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-surface rounded-card border border-line shadow-subtle"
        >
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-start gap-3.5 p-2">
                <div className="p-2.5 rounded-xl bg-brand-soft text-brand-dark shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink tracking-tight font-sans">
                    {badge.title}
                  </h3>
                  <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* ── 3. Curated Category Story Tiles ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand font-mono">
                COLLECTIONS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
              Explore by Curated Department
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-1">
              Handpicked merchandise from verified sellers and artisan workshops
            </p>
          </div>

          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1 group shrink-0"
          >
            <span>View All Departments</span>
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
          {curatedCategories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={cat.link}
                className="group block relative rounded-card bg-surface border border-line shadow-subtle hover:shadow-card transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold bg-surface/90 backdrop-blur-sm text-ink px-2 py-0.5 rounded-full border border-line shadow-subtle">
                      {cat.pill}
                    </span>
                  </div>
                </div>
                <div className="p-4 text-left bg-surface">
                  <h3 className="text-sm font-bold text-ink group-hover:text-brand transition-colors tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-muted truncate mt-0.5">
                    {cat.tagline}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── 4. Shelf A: Trending Now (ProductCard 2.0 Grid) ──────────────────── */}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
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

      {/* ── 5. Social Proof: Customer & Seller Reviews Wall ──────────────────── */}
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
              viewport={{ once: true }}
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
