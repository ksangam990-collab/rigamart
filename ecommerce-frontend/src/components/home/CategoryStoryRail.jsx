import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, TrendingUp, MessageCircle } from 'lucide-react';

export default function CategoryStoryRail({ onOpenResellerModal }) {
  const scrollRef = useRef(null);

  const categories = [
    {
      id: 'deals',
      name: 'Top Deals',
      badge: '🔥 Hot',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80',
      link: '/search?sort=newest',
      gradient: 'from-amber-500 via-rose-500 to-brand',
      isSpecial: false
    },
    {
      id: 'mens',
      name: 'Men Sartorial',
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=mens-fashion',
      gradient: 'from-blue-500 to-indigo-600',
      isSpecial: false
    },
    {
      id: 'womens',
      name: 'Ethnic Luxe',
      badge: 'Festive',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=womens-ethnic',
      gradient: 'from-rose-400 to-pink-600',
      isSpecial: false
    },
    {
      id: 'tech',
      name: 'Smart Tech',
      badge: 'ANC',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=electronics',
      gradient: 'from-emerald-500 to-teal-600',
      isSpecial: false
    },
    {
      id: 'footwear',
      name: 'Sneakers & Kicks',
      badge: 'Trending',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=footwear',
      gradient: 'from-amber-400 to-orange-500',
      isSpecial: false
    },
    {
      id: 'home',
      name: 'Home & Craft',
      badge: 'Artisan',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=home-kitchen',
      gradient: 'from-cyan-400 to-blue-500',
      isSpecial: false
    },
    {
      id: 'reseller',
      name: 'Share & Earn',
      badge: '₹ Profit',
      isSpecial: true,
      gradient: 'from-emerald-500 to-green-600'
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-surface border-b border-line py-2 sm:py-3 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative group">
        
        {/* Left Arrow (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface/90 hover:bg-surface border border-line shadow-md items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Story Rail Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 sm:gap-6 overflow-x-auto scrollbar-none py-0.5 px-0.5 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat, idx) => {
            const content = (
              <motion.div
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group/bubble w-[64px] sm:w-auto"
              >
                {/* Circular Story Bubble */}
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full p-[2px] sm:p-[2.5px] bg-gradient-to-tr ${cat.gradient} shadow-subtle group-hover/bubble:shadow-md transition-shadow relative`}
                >
                  {cat.isSpecial ? (
                    <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <span className="font-mono text-lg sm:text-2xl font-black">₹</span>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface p-[1.5px] sm:p-[2px]">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Pulsing Dot or Pill on Bubble */}
                  {cat.badge && (
                    <span className="absolute -bottom-1 -right-0.5 bg-amber-400 text-amber-950 font-black text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded-full border border-surface shadow-2xs">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <span
                  className={`text-[10px] sm:text-xs font-bold text-center truncate max-w-[62px] sm:max-w-none leading-tight transition-colors ${
                    cat.isSpecial
                      ? 'text-emerald-600 group-hover/bubble:text-emerald-700'
                      : 'text-ink group-hover/bubble:text-brand'
                  }`}
                >
                  {cat.name}
                </span>
              </motion.div>
            );

            if (cat.isSpecial) {
              return (
                <div key={cat.id} onClick={onOpenResellerModal} className="shrink-0">
                  {content}
                </div>
              );
            }

            return (
              <Link key={cat.id} to={cat.link} className="shrink-0 no-underline">
                {content}
              </Link>
            );
          })}
        </div>

        {/* Right Arrow (Desktop) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface/90 hover:bg-surface border border-line shadow-md items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
