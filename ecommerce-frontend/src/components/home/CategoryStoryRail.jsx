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
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80',
      link: '/search?sort=newest',
      gradient: 'from-amber-500 via-rose-500 to-brand',
    },
    {
      id: 'mens',
      name: "Men's Wear",
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=mens-fashion',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'womens',
      name: 'Ethnic Wear',
      badge: 'Festive',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=womens-ethnic',
      gradient: 'from-rose-400 to-pink-600',
    },
    {
      id: 'tech',
      name: 'Gadgets & Tech',
      badge: 'ANC',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=electronics',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'footwear',
      name: 'Sneakers & Kicks',
      badge: 'Trending',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=footwear',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      id: 'home',
      name: 'Home Decor',
      badge: 'Artisan',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=home-kitchen',
      gradient: 'from-cyan-400 to-blue-500',
    },
    {
      id: 'beauty',
      name: 'Beauty & Care',
      badge: 'Glow',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=beauty-health',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      id: 'kitchen',
      name: 'Kitchen & Dining',
      badge: 'Smart',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80',
      link: '/search?category=home-kitchen',
      gradient: 'from-teal-400 to-emerald-600',
    },
    {
      id: 'offers',
      name: 'All Offers',
      badge: '🏷️ Deals',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=200&auto=format&fit=crop&q=80',
      link: '/search?sort=newest',
      gradient: 'from-purple-500 to-indigo-600',
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Product Categories" className="relative w-full bg-surface border-b border-line py-2.5 sm:py-3.5 select-none shadow-xs">
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
          className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth lg:justify-between lg:gap-2 lg:overflow-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => {
            const content = (
              <motion.div
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group/bubble w-[68px] sm:w-[76px] lg:w-auto"
              >
                {/* Circular Story Bubble */}
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px] rounded-full p-[2px] sm:p-[2.5px] bg-gradient-to-tr ${cat.gradient} shadow-subtle group-hover/bubble:shadow-md transition-shadow relative`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface p-[1.5px] sm:p-[2px]">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover/bubble:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Pulsing Dot or Pill on Bubble */}
                  {cat.badge && (
                    <span className="absolute -bottom-1 -right-0.5 bg-amber-400 text-amber-950 font-black text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded-full border border-surface shadow-2xs whitespace-nowrap">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <span className="text-[10px] sm:text-xs font-semibold text-center line-clamp-1 max-w-[72px] sm:max-w-[90px] lg:max-w-none leading-tight text-ink group-hover/bubble:text-brand transition-colors">
                  {cat.name}
                </span>
              </motion.div>
            );

            return (
              <Link key={cat.id} to={cat.link} className="shrink-0 no-underline">
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
