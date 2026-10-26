import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryStoryRail() {
  const scrollRef = useRef(null);

  const categories = [
    {
      id: 'deals',
      name: 'Top Deals',
      badge: '🔥 Hot',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
      link: '/search?sort=newest'
    },
    {
      id: 'mens',
      name: "Men's Wear",
      badge: null,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=mens-fashion'
    },
    {
      id: 'womens',
      name: 'Ethnic Wear',
      badge: null,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=womens-ethnic'
    },
    {
      id: 'tech',
      name: 'Electronics',
      badge: null,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=electronics'
    },
    {
      id: 'footwear',
      name: 'Footwear',
      badge: null,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=footwear'
    },
    {
      id: 'home',
      name: 'Home Decor',
      badge: null,
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=home-kitchen'
    },
    {
      id: 'beauty',
      name: 'Beauty',
      badge: null,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=beauty-health'
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      badge: null,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=home-kitchen'
    },
    {
      id: 'accessories',
      name: 'Watches',
      badge: null,
      image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=accessories'
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Product Categories" className="relative w-full bg-surface border-b border-line py-2 sm:py-2.5 select-none shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative group">
        
        {/* Left Arrow (Visible only on tablets when scrollable) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex lg:hidden absolute -left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface/95 hover:bg-surface border border-line shadow-md items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Story Rail Container: Evenly distributed across desktop, swipeable on mobile */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-1.5 px-3 scroll-smooth lg:justify-between lg:gap-2 lg:overflow-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => {
            const content = (
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group/bubble w-[72px] sm:w-[76px] lg:w-auto"
              >
                {/* Clean Circular Story Bubble with Uniform Studio Border */}
                <div className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] lg:w-[60px] lg:h-[60px] aspect-square rounded-full shrink-0 p-[2px] transition-all duration-200 relative bg-canvas border-2 border-line hover:border-brand shadow-2xs hover:shadow-subtle flex items-center justify-center">
                  <div className="w-full h-full aspect-square rounded-full overflow-hidden bg-surface p-[1px] flex items-center justify-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full aspect-square object-cover rounded-full group-hover/bubble:scale-108 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Pulsing Pill on Bubble */}
                  {cat.badge && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold text-[8px] sm:text-[8.5px] px-1.5 py-0.2 rounded-full border border-surface shadow-2xs whitespace-nowrap">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover/bubble:text-brand transition-colors text-center tracking-tight leading-tight truncate max-w-[70px] sm:max-w-none">
                  {cat.name}
                </span>
              </motion.div>
            );

            return (
              <Link key={cat.id} to={cat.link} className="focus:outline-none">
                {content}
              </Link>
            );
          })}
        </div>

        {/* Right Arrow (Visible only on tablets when scrollable) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex lg:hidden absolute -right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface/95 hover:bg-surface border border-line shadow-md items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
