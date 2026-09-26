const Category = require('../models/Category');
const Product = require('../models/Product');

/**
 * Generate a clean URL-friendly slug
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Helper to recursively build nested category tree
 */
const buildCategoryTree = (categories, parentId = null) => {
  const categoryTree = [];
  const children = categories.filter((cat) => {
    if (parentId === null) {
      return !cat.parent;
    }
    const catParentId = cat.parent?._id ? cat.parent._id.toString() : cat.parent?.toString();
    return catParentId === parentId.toString();
  });

  for (const cat of children) {
    categoryTree.push({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      isActive: cat.isActive,
      children: buildCategoryTree(categories, cat._id)
    });
  }

  return categoryTree;
};

/**
 * @desc    Get all categories (flat or hierarchical tree)
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const { tree = 'false', activeOnly = 'true' } = req.query;
    const filter = activeOnly === 'true' ? { isActive: true } : {};

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ name: 1 })
      .lean();

    if (tree === 'true') {
      const categoryTree = buildCategoryTree(categories);
      return res.status(200).json({
        success: true,
        message: 'Category tree retrieved successfully',
        data: {
          categories: categoryTree
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch categories: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:idOrSlug
 * @access  Public
 */
const getCategoryById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const category = await Category.findOne(query).populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch category: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
const createCategory = async (req, res) => {
  try {
    const { name, parent, image, isActive } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
        data: null
      });
    }

    let slug = generateSlug(name);

    // Ensure slug uniqueness
    const slugExists = await Category.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Validate parent if provided
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        return res.status(400).json({
          success: false,
          message: 'Specified parent category does not exist',
          data: null
        });
      }
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      parent: parent || null,
      image: image || { public_id: '', url: '' },
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create category: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Update existing category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent, image, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    // Prevent circular reference
    if (parent && parent.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'A category cannot be its own parent',
        data: null
      });
    }

    if (name) {
      category.name = name.trim();
      let newSlug = generateSlug(name);
      const duplicateSlug = await Category.findOne({ slug: newSlug, _id: { $ne: id } });
      if (duplicateSlug) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
      category.slug = newSlug;
    }

    if (parent !== undefined) {
      if (parent) {
        const parentCat = await Category.findById(parent);
        if (!parentCat) {
          return res.status(400).json({
            success: false,
            message: 'Parent category does not exist',
            data: null
          });
        }
      }
      category.parent = parent || null;
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update category: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Delete category (guarded against orphan subcategories or products)
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    // Guard: Prevent deletion if subcategories depend on this category
    const hasChildren = await Category.findOne({ parent: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that has child subcategories. Reassign or delete child categories first.',
        data: null
      });
    }

    // Guard: Prevent deletion if active products exist in this category
    const hasProducts = await Product.findOne({ category: id });
    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category containing active products. Reassign or delete products first.',
        data: null
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete category: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
