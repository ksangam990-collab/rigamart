const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Helper to compute live cart totals, stock availability, and price drift
 */
const calculateLiveCart = (cartDoc) => {
  let itemsPrice = 0;
  let totalMrp = 0;
  let totalQuantity = 0;
  const sanitizedItems = [];

  for (const item of cartDoc.items) {
    const product = item.product;

    // Handle deleted or deactivated products
    if (!product || !product.isActive) {
      sanitizedItems.push({
        _id: item._id,
        product: product ? { _id: product._id, name: product.name } : null,
        variantId: item.variantId,
        sku: item.sku,
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
        currentPrice: 0,
        currentMrp: 0,
        isAvailable: false,
        unavailableReason: 'Product is no longer available'
      });
      continue;
    }

    // Locate the exact variant inside the product
    const variant = product.variants.id(item.variantId);
    if (!variant) {
      sanitizedItems.push({
        _id: item._id,
        product: { _id: product._id, name: product.name },
        variantId: item.variantId,
        sku: item.sku,
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
        currentPrice: 0,
        currentMrp: 0,
        isAvailable: false,
        unavailableReason: 'Selected variant is discontinued'
      });
      continue;
    }

    const isAvailable = variant.stock >= item.quantity;
    const hasPriceChanged = variant.price !== item.priceAtAddition;

    itemsPrice += variant.price * item.quantity;
    totalMrp += variant.mrp * item.quantity;
    totalQuantity += item.quantity;

    sanitizedItems.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        images: product.images,
        category: product.category
      },
      variantId: variant._id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      priceAtAddition: item.priceAtAddition,
      currentPrice: variant.price,
      currentMrp: variant.mrp,
      stock: variant.stock,
      isAvailable,
      hasPriceChanged,
      unavailableReason: !isAvailable ? `Only ${variant.stock} units in stock` : null
    });
  }

  // E-commerce business logic: Free shipping on orders >= ₹500, otherwise ₹40 delivery fee
  const shippingPrice = itemsPrice >= 500 || itemsPrice === 0 ? 0 : 40;
  const discount = Math.max(0, totalMrp - itemsPrice);
  const totalAmount = itemsPrice + shippingPrice;

  return {
    _id: cartDoc._id,
    user: cartDoc.user,
    items: sanitizedItems,
    summary: {
      totalQuantity,
      totalMrp,
      itemsPrice,
      discount,
      shippingPrice,
      totalAmount
    }
  };
};

/**
 * @desc    Get user's persistent cart with live inventory & price checks
 * @route   GET /api/cart
 * @access  Private (Customer/User)
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name brand images category isActive variants'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const liveCart = calculateLiveCart(cart);

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        cart: liveCart
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch cart: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Add item to cart or increment quantity
 * @route   POST /api/cart/add
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Variant ID are required',
        data: null
      });
    }

    const numQty = Math.max(1, parseInt(quantity, 10));

    // Verify product & variant existence
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is unavailable or does not exist',
        data: null
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Selected product variant was not found',
        data: null
      });
    }

    // Check inventory stock
    if (variant.stock < numQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${variant.stock} units available.`,
        data: null
      });
    }

    // Fetch or initialize cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item variant already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId.toString() &&
        item.variantId.toString() === variantId.toString()
    );

    if (existingItemIndex > -1) {
      const newTotalQty = cart.items[existingItemIndex].quantity + numQty;

      if (newTotalQty > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum limit of 10 units per item reached',
          data: null
        });
      }

      if (newTotalQty > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${variant.stock} units available in total.`,
          data: null
        });
      }

      cart.items[existingItemIndex].quantity = newTotalQty;
      cart.items[existingItemIndex].priceAtAddition = variant.price;
    } else {
      if (numQty > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 units allowed per item',
          data: null
        });
      }

      cart.items.push({
        product: productId,
        variantId: variant._id,
        sku: variant.sku,
        quantity: numQty,
        priceAtAddition: variant.price
      });
    }

    await cart.save();

    // Re-populate and return live calculated cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand images category isActive variants'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: calculateLiveCart(cart)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to add item to cart: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Update quantity of a specific cart item
 * @route   PUT /api/cart/update
 * @access  Private
 */
const updateCartItem = async (req, res) => {
  try {
    const { itemId, variantId, quantity } = req.body;

    if ((!itemId && !variantId) || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Cart itemId (or variantId) and updated quantity are required',
        data: null
      });
    }

    const newQuantity = parseInt(quantity, 10);

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        data: null
      });
    }

    // Locate item
    const itemIndex = cart.items.findIndex((item) => {
      if (itemId) return item._id.toString() === itemId.toString();
      if (variantId) return item.variantId.toString() === variantId.toString();
      return false;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
        data: null
      });
    }

    // If quantity is set to 0 or less, remove the item
    if (newQuantity <= 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name brand images category isActive variants'
      });

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: {
          cart: calculateLiveCart(populatedCart)
        }
      });
    }

    // Enforce 10 units maximum purchase restriction
    if (newQuantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit of 10 units per item allowed',
        data: null
      });
    }

    // Verify stock availability
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists. Removed from cart.',
        data: null
      });
    }

    const variant = product.variants.id(cart.items[itemIndex].variantId);
    if (!variant || variant.stock < newQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant ? variant.stock : 0} units available in stock`,
        data: null
      });
    }

    // Update quantity and refresh price
    cart.items[itemIndex].quantity = newQuantity;
    cart.items[itemIndex].priceAtAddition = variant.price;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand images category isActive variants'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        cart: calculateLiveCart(populatedCart)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update cart: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Remove an item from cart by itemId
 * @route   DELETE /api/cart/remove/:itemId
 * @access  Private
 */
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
        data: null
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
        data: null
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name brand images category isActive variants'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: calculateLiveCart(populatedCart)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to remove item: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Clear all items from user's cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: {
          _id: cart._id,
          user: cart.user,
          items: [],
          summary: {
            totalQuantity: 0,
            totalMrp: 0,
            itemsPrice: 0,
            discount: 0,
            shippingPrice: 0,
            totalAmount: 0
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to clear cart: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
