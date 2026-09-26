const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [60, 'Category name cannot exceed 60 characters']
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null // null indicates a top-level category (e.g., Men, Women, Electronics)
    },
    image: {
      public_id: {
        type: String,
        default: ''
      },
      url: {
        type: String,
        default: ''
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for hierarchical parent queries (slug index is auto-created by unique: true)
categorySchema.index({ parent: 1 });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
