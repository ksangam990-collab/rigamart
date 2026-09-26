const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'Variant SKU is required'],
      trim: true,
      uppercase: true
    },
    size: {
      type: String,
      required: [true, 'Size is required (e.g. S, M, L, Free Size, 128GB)'],
      trim: true
    },
    color: {
      type: String,
      required: [true, 'Color is required (e.g. Black, Navy Blue, Silver)'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative']
    },
    mrp: {
      type: Number,
      required: [true, 'MRP (Maximum Retail Price) is required'],
      min: [0, 'MRP cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    }
  },
  { _id: true }
);

const productImageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic'
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required']
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required']
    },
    images: {
      type: [productImageSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one image'
      }
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one variant'
      }
    },
    // Indexed lowest price among variants for fast sorting and range queries
    basePrice: {
      type: Number,
      min: 0,
      default: 0
    },
    avgRating: {
      type: Number,
      min: [0, 'Rating cannot be lower than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    numReviews: {
      type: Number,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Pre-save hook: auto-compute basePrice from variants before persisting
productSchema.pre('save', function (next) {
  if (this.variants && this.variants.length > 0) {
    const minPrice = Math.min(...this.variants.map((v) => v.price));
    this.basePrice = isFinite(minPrice) ? minPrice : 0;
  }
  next();
});

// Indexes for high-throughput listing, filtering, and search
productSchema.index({ category: 1, basePrice: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ avgRating: -1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
