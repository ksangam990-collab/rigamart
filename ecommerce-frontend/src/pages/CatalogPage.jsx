import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles, X, ChevronRight } from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';
import {
  staggerContainer,
  staggerItem,
  modalBackdropVariants
} from '../utils/animations.js';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const keyword = searchParams.get('q') || searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedSort = searchParams.get('sort') || 'newest';
  const selectedRating = searchParams.get('rating') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);

  // Fetch categories for sidebar
  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data.data?.categories || []))
      .catch(() => {});
  }, []);

  // Fetch products matching filters or search
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let res;
      if (keyword && keyword.trim()) {
        const page = searchParams.get('page') || '1';
        res = await api.get(`/products/search?q=${encodeURIComponent(keyword.trim())}&page=${page}`);
      } else {
        const params = new URLSearchParams(searchParams);
        res = await api.get(`/products?${params.toString()}`);
      }
      setProducts(res.data.data?.products || []);
      setPagination(
        res.data.data?.pagination || { page: 1, pages: 1, total: res.data.data?.products?.length || 0 }
      );
    } catch (e) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePriceFilterApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (tempMinPrice) newParams.set('minPrice', tempMinPrice);
    else newParams.delete('minPrice');
    if (tempMaxPrice) newParams.set('maxPrice', tempMaxPrice);
    else newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setTempMinPrice('');
    setTempMaxPrice('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Results Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Marketplace Catalog</span>
            {keyword && (
              <span className="text-gray-500 font-normal text-lg">
                &mdash; Results for <span className="font-bold text-brand-600">"{keyword}"</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isLoading ? 'Searching catalog...' : `Showing ${products.length} of ${pagination.total} verified products`}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={selectedSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 py-2 px-3 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Column (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              Filter By
            </h2>
            {(keyword || selectedCategory || minPrice || maxPrice || selectedRating) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Categories</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => updateFilter('category', c.slug || c._id)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-md font-medium transition-colors truncate ${
                    selectedCategory === (c.slug || c._id)
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Price Range (₹)</h3>
            <form onSubmit={handlePriceFilterApply} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none focus:bg-white focus:border-brand-500"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="w-full py-1.5 bg-gray-900 hover:bg-brand-600 text-white text-xs font-semibold rounded transition-colors"
              >
                Apply Range
              </motion.button>
            </form>
          </div>

          {/* Customer Rating Filter */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Customer Rating</h3>
            <div className="space-y-1.5">
              {['4', '3', '2'].map((star) => (
                <button
                  key={star}
                  onClick={() => updateFilter('rating', selectedRating === star ? '' : star)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                    selectedRating === star
                      ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-amber-500 font-bold">★ {star}★ & above</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Product Grid Column */}
        <main className="lg:col-span-3 space-y-8">
          {isLoading ? (
            /* Skeleton Loading Grid matching real layout */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 space-y-4 shadow-sm"
            >
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No matching products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find any products matching your active filters or keywords. Try expanding your search or clearing filters.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={clearAllFilters}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          ) : (
            /* Staggered Animated Products Grid */
            <motion.div
              variants={staggerContainer(0.04)}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
            >
              {products.map((p) => (
                <motion.div key={p._id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', String(pagination.page - 1))}
                className="px-3.5 py-2 border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </motion.button>
              <span className="text-xs font-bold text-gray-700 px-3">
                Page {pagination.page} of {pagination.pages}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={pagination.page >= pagination.pages}
                onClick={() => updateFilter('page', String(pagination.page + 1))}
                className="px-3.5 py-2 border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </motion.button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer with Smooth AnimatePresence */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-white w-full max-w-xs h-full p-6 space-y-6 overflow-y-auto shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  Filters
                </h2>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Category</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateFilter('category', '');
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left text-xs py-2 px-2 rounded-md font-medium ${
                      !selectedCategory ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        updateFilter('category', c.slug || c._id);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-2 rounded-md font-medium truncate ${
                        selectedCategory === (c.slug || c._id) ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
              >
                Reset All Filters
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
