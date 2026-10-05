import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  X,
  ChevronRight,
  LayoutGrid,
  List,
  Star,
  Check,
  RotateCcw
} from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton.jsx';
import Breadcrumb from '../components/common/Breadcrumb.jsx';
import RecentlyViewedRibbon from '../components/product/RecentlyViewedRibbon.jsx';
import { Button, Badge, Sheet, Input } from '../components/ui';
import {
  staggerContainer,
  staggerItem
} from '../utils/animations.js';

const PRICE_PRESETS = [
  { label: 'Under ₹999', min: '', max: '999' },
  { label: '₹1,000 – ₹2,499', min: '1000', max: '2499' },
  { label: '₹2,500 – ₹4,999', min: '2500', max: '4999' },
  { label: '₹5,000+', min: '5000', max: '' },
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter query parameters
  const keyword = searchParams.get('q') || searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedSort = searchParams.get('sort') || 'newest';
  const selectedRating = searchParams.get('rating') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);

  // Sync temp price states when URL params change
  useEffect(() => {
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Fetch categories for sidebar
  useEffect(() => {
    api
      .get('/categories')
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
        res = await api.get(
          `/products/search?q=${encodeURIComponent(keyword.trim())}&page=${page}`
        );
      } else {
        const params = new URLSearchParams(searchParams);
        res = await api.get(`/products?${params.toString()}`);
      }
      const fetchedProducts = res.data.data?.products || [];
      const rawPag = res.data.data?.pagination || {};
      setProducts(fetchedProducts);
      setPagination({
        page: rawPag.currentPage || rawPag.page || 1,
        pages: rawPag.totalPages || rawPag.pages || 1,
        total: rawPag.totalCount ?? rawPag.total ?? fetchedProducts.length,
      });
    } catch {
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

  const handlePricePreset = (min, max) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('minPrice', min);
    else newParams.delete('minPrice');

    if (max) newParams.set('maxPrice', max);
    else newParams.delete('maxPrice');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCustomPriceSubmit = (e) => {
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

  // Determine active filters count
  const activeFiltersCount = [
    keyword,
    selectedCategory,
    minPrice,
    maxPrice,
    selectedRating,
    inStockOnly ? 'inStock' : null,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 font-sans">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          {
            label: selectedCategory
              ? selectedCategory.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              : 'Marketplace Catalog',
          },
        ]}
      />

      {/* Header & Results Count & Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight flex items-center gap-2">
            <span>Marketplace Catalog</span>
            {keyword && (
              <span className="text-muted font-normal text-base sm:text-lg">
                &mdash; for <span className="font-bold text-brand">&ldquo;{keyword}&rdquo;</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-muted mt-1 tabular-nums">
            {isLoading
              ? 'Searching authentic catalog...'
              : `Displaying ${products.length} of ${pagination.total} verified products`}
          </p>
        </div>

        {/* View Mode & Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile Filter Sheet Trigger */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden"
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center ml-1">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Grid / List View Switcher (Desktop) */}
          <div className="hidden sm:flex items-center border border-line rounded-xl p-0.5 bg-surface shadow-subtle">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-canvas text-brand font-bold shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-canvas text-brand font-bold shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
              title="Compact View"
              aria-label="Compact View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-surface border border-line text-xs font-semibold text-ink py-2 px-3 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer shadow-subtle"
              aria-label="Sort products by"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Strip */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-semibold text-muted tracking-tight">Active:</span>

          {keyword && (
            <Badge color="neutral" variant="subtle" size="sm">
              Keyword: &ldquo;{keyword}&rdquo;
              <button
                type="button"
                onClick={() => updateFilter('q', '')}
                className="ml-1 text-muted hover:text-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedCategory && (
            <Badge color="brand" variant="subtle" size="sm">
              Category: {selectedCategory.replace(/-/g, ' ')}
              <button
                type="button"
                onClick={() => updateFilter('category', '')}
                className="ml-1 text-brand-dark hover:text-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {(minPrice || maxPrice) && (
            <Badge color="accent" variant="subtle" size="sm">
              Price: ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
              <button
                type="button"
                onClick={() => {
                  handlePricePreset('', '');
                }}
                className="ml-1 text-ink hover:text-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedRating && (
            <Badge color="warning" variant="subtle" size="sm">
              ★ {selectedRating}★ & above
              <button
                type="button"
                onClick={() => updateFilter('rating', '')}
                className="ml-1 text-warning hover:text-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {inStockOnly && (
            <Badge color="success" variant="subtle" size="sm">
              In Stock Only
              <button
                type="button"
                onClick={() => updateFilter('inStock', '')}
                className="ml-1 text-success hover:text-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-danger hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Catalog Layout (Sidebar + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter Column (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-surface p-5 rounded-card border border-line shadow-subtle h-fit sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5 font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
              Filter By
            </h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-danger hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Categories
            </h3>
            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-brand-soft text-brand-dark font-bold'
                    : 'text-ink hover:bg-canvas'
                }`}
              >
                All Departments
              </button>
              {categories.map((c) => {
                const slug = c.slug || c._id;
                const isSelected = selectedCategory === slug;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => updateFilter('category', slug)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-medium transition-colors truncate flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-soft text-brand-dark font-bold'
                        : 'text-ink hover:bg-canvas'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Presets & Inputs */}
          <div className="pt-4 border-t border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Price Range
            </h3>
            <div className="space-y-1 mb-3">
              {PRICE_PRESETS.map((p) => {
                const isSelected = minPrice === p.min && maxPrice === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePricePreset(p.min, p.max)}
                    className={`w-full text-left text-xs py-1 px-2 rounded-lg transition-colors font-medium ${
                      isSelected
                        ? 'bg-accent/20 text-ink font-bold'
                        : 'text-muted hover:text-ink hover:bg-canvas'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max inputs */}
            <form onSubmit={handleCustomPriceSubmit} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-canvas border border-line rounded-lg text-xs text-ink outline-none focus:border-brand tabular-nums"
                />
                <span className="text-muted text-xs">&ndash;</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-canvas border border-line rounded-lg text-xs text-ink outline-none focus:border-brand tabular-nums"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="w-full h-8 text-xs">
                Apply Price
              </Button>
            </form>
          </div>

          {/* Customer Rating Filter */}
          <div className="pt-4 border-t border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Customer Rating
            </h3>
            <div className="space-y-1">
              {['4', '3'].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateFilter('rating', selectedRating === star ? '' : star)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    selectedRating === star
                      ? 'bg-accent/15 text-ink font-bold'
                      : 'text-ink hover:bg-canvas'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span>{star} Stars &amp; above</span>
                  </span>
                  {selectedRating === star && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-4 border-t border-line">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs font-medium text-ink">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                className="accent-brand w-4 h-4 rounded"
              />
            </label>
          </div>
        </aside>

        {/* Main Product Showcase Grid Column */}
        <main className="lg:col-span-3 space-y-8">
          {isLoading ? (
            /* Skeleton Loading Grid matching exact aspect ratio */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Calm Editorial Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center py-20 bg-surface rounded-card border border-line p-8 space-y-4 shadow-subtle"
            >
              <div className="w-14 h-14 rounded-full bg-brand-soft text-brand-dark mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">No matching products found</h3>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                We couldn&rsquo;t find items matching your active criteria. Try broadening your keywords or clearing selected filters.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="md" onClick={clearAllFilters} leftIcon={<RotateCcw className="w-4 h-4" />}>
                  Reset All Filters
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Products Grid with Framer Motion Stagger */
            <motion.div
              variants={staggerContainer(0.04)}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'
                  : 'grid grid-cols-1 gap-4'
              }
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
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-line">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', String(pagination.page - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-ink px-3 tabular-nums">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => updateFilter('page', String(pagination.page + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Recently Viewed Products Ribbon */}
      <RecentlyViewedRibbon
        title="Recently Viewed Products"
        subtitle="Pick up right where you left off"
      />

      {/* Mobile Filters Sheet (Thumb-reachable Bottom Sheet) */}
      <Sheet
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Products"
        description="Refine catalog results by department, price, and ratings."
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearAllFilters();
                setMobileFilterOpen(false);
              }}
            >
              Reset All
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Category
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left text-xs py-2 px-3 rounded-lg font-medium ${
                  !selectedCategory
                    ? 'bg-brand-soft text-brand-dark font-bold'
                    : 'text-ink hover:bg-canvas'
                }`}
              >
                All Departments
              </button>
              {categories.map((c) => {
                const slug = c.slug || c._id;
                const isSelected = selectedCategory === slug;
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => updateFilter('category', slug)}
                    className={`w-full text-left text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-soft text-brand-dark font-bold'
                        : 'text-ink hover:bg-canvas'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Presets */}
          <div className="pt-4 border-t border-line">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Price Range
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {PRICE_PRESETS.map((p) => {
                const isSelected = minPrice === p.min && maxPrice === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePricePreset(p.min, p.max)}
                    className={`text-xs py-2 px-3 rounded-xl border font-medium text-center transition-colors ${
                      isSelected
                        ? 'bg-brand-soft border-brand text-brand-dark font-bold'
                        : 'border-line text-ink hover:bg-canvas'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="pt-4 border-t border-line">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs font-medium text-ink">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                className="accent-brand w-4 h-4 rounded"
              />
            </label>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
