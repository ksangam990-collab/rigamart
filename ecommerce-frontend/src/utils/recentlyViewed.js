/**
 * Utility for persisting and retrieving recently viewed products in localStorage
 */

const STORAGE_KEY = 'rigamart_recently_viewed';
const MAX_RECENT_ITEMS = 10;

/**
 * Get the list of recently viewed products from localStorage
 * @returns {Array} Array of product summary objects
 */
export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse recently viewed items:', err);
    return [];
  }
};

/**
 * Record a product into recently viewed storage
 * @param {Object} product - Full or partial product object
 */
export const recordRecentlyViewed = (product) => {
  if (!product || !product._id) return;

  try {
    const current = getRecentlyViewed();
    // Exclude existing instance if present
    const filtered = current.filter((p) => p._id !== product._id);

    const defaultVariant = product.variants?.[0] || {};
    const price = defaultVariant.price || product.basePrice || 0;
    const mrp = defaultVariant.mrp || (product.basePrice ? product.basePrice * 1.3 : price);
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 10;

    const summary = {
      _id: product._id,
      name: product.name,
      brand: product.brand || '',
      price,
      mrp,
      image:
        product.images?.[0]?.url ||
        product.images?.[0] ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      category:
        typeof product.category === 'object' && product.category !== null
          ? product.category.name || product.category.slug
          : product.category || '',
      avgRating: product.avgRating || 0,
      numReviews: product.numReviews || 0,
      totalStock,
      timestamp: Date.now()
    };

    const updated = [summary, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch a custom window event so other open components can reactively update
    window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
  } catch (err) {
    console.error('Failed to record recently viewed item:', err);
  }
};

/**
 * Remove an individual product from recently viewed list
 * @param {string} productId
 */
export const removeRecentlyViewed = (productId) => {
  try {
    const current = getRecentlyViewed();
    const updated = current.filter((p) => p._id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
  } catch (err) {
    console.error('Failed to remove recently viewed item:', err);
  }
};

/**
 * Clear all recently viewed products
 */
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
  } catch (err) {
    console.error('Failed to clear recently viewed items:', err);
  }
};
