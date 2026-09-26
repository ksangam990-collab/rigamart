const Product = require('../models/Product');
const Category = require('../models/Category');
const { getPagination } = require('../utils/paginate');

/**
 * @desc    Get products with multi-attribute filtering, sorting & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      seller,
      sort = 'newest',
      includeInactive = 'false'
    } = req.query;

    const filter = {};

    // Filter by active status (unless specifically requesting all)
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Filter by category (handles both ObjectId and slug, includes subcategories)
    if (category) {
      let targetCategoryId = category;
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);

      if (!isObjectId) {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          targetCategoryId = catDoc._id;
        }
      }

      if (targetCategoryId) {
        // Find subcategories of this category to include child products
        const subcategories = await Category.find({ parent: targetCategoryId }).select('_id');
        const categoryIds = [targetCategoryId, ...subcategories.map((c) => c._id)];
        filter.category = { $in: categoryIds };
      }
    }

    // Filter by brand (case-insensitive)
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      filter.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    // Filter by price range against indexed basePrice
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.basePrice = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.basePrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.basePrice.$lte = Number(maxPrice);
      }
    }

    // Filter by minimum average customer rating
    if (rating !== undefined && !isNaN(Number(rating))) {
      filter.avgRating = { $gte: Number(rating) };
    }

    // Filter by in-stock availability
    if (inStock === 'true') {
      filter['variants.stock'] = { $gt: 0 };
    }

    // Filter by specific seller
    if (seller && /^[0-9a-fA-F]{24}$/.test(seller)) {
      filter.seller = seller;
    }

    // Sorting strategy
    let sortOptions = {};
    switch (sort) {
      case 'price-asc':
        sortOptions = { basePrice: 1 };
        break;
      case 'price-desc':
        sortOptions = { basePrice: -1 };
        break;
      case 'rating':
        sortOptions = { avgRating: -1, numReviews: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Pagination
    const { page, limit, skip, getPaginationMeta } = getPagination(req.query, 12);

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('seller', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch products: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
        data: null
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name slug parent')
      .populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: {
        product
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch product: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Search products using full-text search with fuzzy regex fallback
 * @route   GET /api/products/search?q=
 * @access  Public
 */
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter (q) cannot be empty',
        data: null
      });
    }

    const queryTerm = q.trim();
    const { limit, skip, getPaginationMeta } = getPagination(req.query, 12);

    // Try MongoDB Full-Text Index search first
    let filter = {
      $text: { $search: queryTerm },
      isActive: true
    };

    let [products, totalCount] = await Promise.all([
      Product.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('seller', 'name')
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Fallback: If text index returns 0 hits (common with partial keywords or typos),
    // perform forgiving regex search across name, brand, and tags
    if (totalCount === 0) {
      const regexPattern = new RegExp(queryTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      filter = {
        isActive: true,
        $or: [
          { name: regexPattern },
          { brand: regexPattern },
          { tags: regexPattern },
          { description: regexPattern }
        ]
      };

      [products, totalCount] = await Promise.all([
        Product.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('category', 'name slug')
          .populate('seller', 'name')
          .lean(),
        Product.countDocuments(filter)
      ]);
    }

    res.status(200).json({
      success: true,
      message: `Found ${totalCount} results for '${queryTerm}'`,
      data: {
        query: queryTerm,
        products,
        pagination: getPaginationMeta(totalCount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Search failed: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Create a new product with variants
 * @route   POST /api/products
 * @access  Private (Seller or Admin)
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, brand, category, images, variants, tags, isActive } = req.body;

    // Validate inputs
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and category are required',
        data: null
      });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required',
        data: null
      });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product variant (size/color/price/stock) is required',
        data: null
      });
    }

    // Validate variant properties
    for (const v of variants) {
      if (!v.sku || !v.size || !v.color || v.price === undefined || v.mrp === undefined || v.stock === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Each variant must contain sku, size, color, price, mrp, and stock',
          data: null
        });
      }
      if (v.price < 0 || v.mrp < 0 || v.stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Variant price, MRP, and stock cannot be negative numbers',
          data: null
        });
      }
    }

    // Verify category existence
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Category does not exist',
        data: null
      });
    }

    // Compute base price as lowest variant price
    const minPrice = Math.min(...variants.map((v) => Number(v.price)));

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      brand: brand ? brand.trim() : 'Generic',
      category,
      seller: req.user._id,
      images,
      variants,
      basePrice: minPrice,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      isActive: isActive !== undefined ? isActive : true
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('seller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: populatedProduct
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create product: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Update existing product
 * @route   PUT /api/products/:id
 * @access  Private (Owner Seller or Admin)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    // Authorization guard: Only product seller or admin can edit
    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this product',
        data: null
      });
    }

    const { name, description, brand, category, images, variants, tags, isActive } = req.body;

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (brand) product.brand = brand.trim();
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category does not exist',
          data: null
        });
      }
      product.category = category;
    }
    if (Array.isArray(images) && images.length > 0) product.images = images;
    if (Array.isArray(variants) && variants.length > 0) {
      product.variants = variants;
      product.basePrice = Math.min(...variants.map((v) => Number(v.price)));
    }
    if (Array.isArray(tags)) product.tags = tags.map((t) => t.trim().toLowerCase());
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    const updatedProduct = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('seller', 'name email');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update product: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Owner Seller or Admin)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    // Authorization guard: Only product seller or admin can delete
    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this product',
        data: null
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete product: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
