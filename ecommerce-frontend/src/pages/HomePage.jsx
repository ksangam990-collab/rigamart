import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Star,
  CheckCircle2,
  Store
} from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';
import { Button, Badge } from '../components/ui';
import {
  staggerContainer,
  staggerItem
} from '../utils/animations.js';

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch catalog shelves on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products?sort=newest&limit=8');
        if (isMounted) {
          setTrendingProducts(res.data.data?.products || []);
        }
      } catch {
        // Silent fail — preserve clean homepage presentation
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
      tagline: 'Linens, Kurtas & Tailoring',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=mens-fashion',
      pill: 'New'
    },
    {
      name: "Women's Ethnic",
      tagline: 'Handloom Sarees & Anarkalis',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=womens-ethnic',
      pill: 'Curated'
    },
    {
      name: 'Smart Audio & Gear',
      tagline: 'Noise Cancelling & Wearables',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      link: '/search?category=electronics',
      pill: 'Verified'
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
      desc: 'Zero-friction pickups with instant refund guarantee.'
    },
    {
      icon: CreditCard,
      title: 'Escrow Protected Payments',
      desc: 'Encrypted Razorpay UPI, Cards, Net Banking & COD.'
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
    { label: 'Super Express (< 48h)', link: '/search?sort=fastest' },
    { label: 'Under ₹999 Deals', link: '/search?maxPrice=999' },
    { label: 'Studio Headphones', link: '/search?category=electronics' },
    { label: 'Handcrafted Cottons', link: '/search?category=womens-ethnic' },
    { label: 'Verified Sellers Only', link: '/search?verified=true' }
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 overflow-hidden font-sans bg-canvas text-ink">
      {/* ── 1. Sharp Minimal Hero Showcase ─────────────────────────────────── */}
      <section className="pt-4 sm:pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-surface border border-line overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14 items-center">
            {/* Left Column: Typographic Headline & Actions */}
            <motion.div
              variants={staggerContainer(0.06)}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6"
            >
              {/* Trust Badge Pill */}
              <motion.div variants={staggerItem}>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-n-50 text-ink border border-line text-xs font-medium tracking-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  <span>India's Premier Online Store</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={staggerItem}
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink leading-[1.08]"
              >
                Authentic commerce. <br className="hidden sm:inline" />
                Direct from verified makers.
              </motion.h1>

              {/* Editorial Subtitle */}
              <motion.p
                variants={staggerItem}
                className="text-muted text-base sm:text-lg max-w-xl leading-relaxed"
              >
                Electronics, fashion, and lifestyle essentials from certified Indian sellers. Transparent pricing, express 28-state delivery, and guaranteed buyer escrow protection.
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
                      className="text-xs px-3 py-1.5 rounded border border-line bg-n-50 hover:bg-n-100 text-ink transition-colors font-medium"
                    >
                      {pill.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Visual Card (4:5 Ratio, No Radius) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative bg-n-50 border border-line p-2 overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                    alt="Featured Studio Acoustics"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  {/* Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-ink text-canvas text-[11px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      Featured Item
                    </span>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-n-200">
                      Studio Gear
                    </span>
                    <h2 className="text-xl font-semibold text-white leading-tight">
                      Aura Studio Wireless ANC
                    </h2>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-2 tabular-nums">
                        <span className="text-lg font-semibold text-white font-mono">₹3,499</span>
                        <span className="text-xs text-white/70 line-through font-mono">₹5,999</span>
                      </div>
                      <Link
                        to="/search?category=electronics"
                        className="text-xs font-semibold text-white hover:underline flex items-center gap-1 transition-colors"
                      >
                        <span>View Details</span>
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

      {/* ── 2. Trust & Transparency Strip (Hairline Grid) ───────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-surface border border-line divide-y sm:divide-y-0 sm:divide-x divide-line">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="p-5 flex items-start gap-3.5">
                <div className="p-2 rounded bg-n-50 text-ink shrink-0">
                  <Icon strokeWidth={1.5} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-ink tracking-tight">
                    {badge.title}
                  </h3>
                  <p className="text-[12px] text-muted mt-0.5 leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Curated Department Tiles (0px Radius, 1px Hairlines) ──────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono block mb-1">
              Departments
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              Explore by Category
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-0.5">
              Handpicked merchandise from verified sellers and artisan workshops
            </p>
          </div>

          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1 group shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {curatedCategories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.link}
              className="group block bg-surface border border-line transition-colors hover:border-n-500 overflow-hidden"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-n-50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-medium bg-surface/90 text-ink px-1.5 py-0.5 rounded-sm border border-line uppercase tracking-wider">
                    {cat.pill}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-surface">
                <h3 className="text-sm font-semibold text-ink group-hover:underline transition-colors tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-muted truncate mt-0.5">
                  {cat.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. Shelf A: Trending Now (ProductCard Grid) ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono block mb-1">
              Curated Shelf
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              Trending Products
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-0.5">
              Verified items dispatched within 24 hours
            </p>
          </div>

          <Link
            to="/search?sort=newest"
            className="text-xs sm:text-sm font-semibold text-brand hover:underline flex items-center gap-1 group shrink-0"
          >
            <span>See All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Product Cards with Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface border border-line">
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

      {/* ── 5. Social Proof: Customer & Seller Reviews Wall ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono block mb-1">
            Trust &amp; Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Customer Experiences
          </h2>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Verified ratings and transaction feedback from across India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customerReviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-surface border border-line p-5 flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-3 text-ink">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} strokeWidth={1.5} className="w-3.5 h-3.5 fill-ink text-ink" />
                  ))}
                </div>

                <p className="text-sm text-ink leading-relaxed font-sans">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-line flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-ink">{rev.name}</h3>
                  <p className="text-[11px] text-muted">{rev.location}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted bg-n-50 px-1.5 py-0.5 rounded-sm">
                    <CheckCircle2 strokeWidth={1.5} className="w-3 h-3 text-success" />
                    {rev.role}
                  </span>
                  <p className="text-[10px] text-muted mt-0.5">{rev.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Seller Conversion Banner (Flat Surface, 1px Hairline) ────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-n-50 border border-line p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono block">
              Seller Program
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              Reach Customers Across 28 States
            </h2>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Zero listing fees, weekly automated payouts, and integrated delivery logistics.
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
