const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');

let GoogleGenAI;
try {
  const genaiPkg = require('@google/genai');
  GoogleGenAI = genaiPkg.GoogleGenAI;
} catch (e) {
  GoogleGenAI = null;
}

/**
 * Intelligent heuristic fallback response generator when Gemini API key is missing or offline
 */
function generateHeuristicResponse(product, question, activeCoupons = []) {
  const q = (question || '').toLowerCase();
  const name = product.name;
  const brand = product.brand || 'Rigamart';
  const desc = product.description || '';
  const variants = product.variants || [];
  const minPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : product.basePrice || 0;
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  // 1. Coupons / Discount intent
  if (q.includes('coupon') || q.includes('discount') || q.includes('offer') || q.includes('promo') || q.includes('deal') || q.includes('code') || q.includes('cheaper')) {
    const applicable = activeCoupons.filter((c) => minPrice >= c.minCartValue);
    if (applicable.length > 0) {
      const best = applicable[0];
      const savings = best.discountType === 'percentage' 
        ? Math.min(Math.round((minPrice * best.discountValue) / 100), best.maxDiscount || Infinity)
        : best.discountValue;
      return `🎉 **Great news!** You can use code **${best.code}** to save approximately **₹${savings}** on this ${name}!\n\n` +
        `• **Code**: \`${best.code}\`\n` +
        `• **Offer**: ${best.description}\n` +
        `• **Min Order**: ₹${best.minCartValue.toLocaleString('en-IN')}\n\n` +
        `💡 *Tip: You can apply this code right in your Cart or in the Checkout drawer!*`;
    }
    const lowestMin = activeCoupons.sort((a, b) => a.minCartValue - b.minCartValue)[0];
    if (lowestMin) {
      const diff = lowestMin.minCartValue - minPrice;
      return `🏷️ Use code **${lowestMin.code}** for ${lowestMin.description}. It unlocks on cart totals of ₹${lowestMin.minCartValue.toLocaleString('en-IN')}` +
        (diff > 0 ? ` (add ₹${diff} more to your cart to qualify)!` : '!');
    }
    return `🏷️ Keep an eye on our promotional drawer during checkout! New users can also use code **FIRST50** for ₹50 off on orders above ₹299.`;
  }

  // 2. Sizing / Fit intent
  if (q.includes('size') || q.includes('fit') || q.includes('fitting') || q.includes('chart') || q.includes('measurement') || q.includes('dimension') || q.includes('large') || q.includes('small') || q.includes('medium')) {
    let sizeDetails = sizes.length > 0 ? `Available sizes: **${sizes.join(', ')}**.` : 'Standard size.';
    return `📏 **Size & Fit Guide for ${name}**:\n\n` +
      `• ${sizeDetails}\n` +
      `• **Fit recommendation**: This item is designed with a standard Indian fit. If you prefer a relaxed or layered feel, we recommend sizing up one size.\n` +
      `• **Hassle-Free Exchange**: In case the size isn't 100% right, Rigamart offers a **7-day free return/exchange window** from delivery date!`;
  }

  // 3. Material / Quality / Fabric intent
  if (q.includes('material') || q.includes('fabric') || q.includes('quality') || q.includes('made of') || q.includes('cotton') || q.includes('leather') || q.includes('durab') || q.includes('wash') || q.includes('care')) {
    return `🧵 **Material & Craftsmanship**:\n\n` +
      `• **Product Highlights**: ${desc.slice(0, 180)}...\n` +
      `• **Brand Quality**: Verified by ${brand} and inspected through Rigamart's multi-step merchant quality checklist.\n` +
      `• **Care Suggestion**: Handle according to the garment/product label; store in a dry environment and avoid abrasive cleaners to preserve longevity.`;
  }

  // 4. Returns / Refund / Exchange intent
  if (q.includes('return') || q.includes('refund') || q.includes('exchange') || q.includes('replacement') || q.includes('cancel')) {
    return `🛡️ **Rigamart Buyer Protection & Returns**:\n\n` +
      `• **7-Day Return Window**: You can request a return or exchange within **7 days** of delivery.\n` +
      `• **Condition**: Keep original tags, accessories, and unwashed/unaltered condition.\n` +
      `• **Doorstep Pickup**: Once initiated from your orders page, our courier partner arranges doorstep pickup within 48 hours.\n` +
      `• **Fast Refund**: Payout directly back to your source payment method or UPI.`;
  }

  // 5. Warranty / Guarantee intent
  if (q.includes('warranty') || q.includes('guarantee') || q.includes('repair') || q.includes('defect') || q.includes('broken')) {
    return `🔒 **Warranty & Authenticity**:\n\n` +
      `• **100% Genuine**: This ${brand} product is sourced directly from verified sellers and covered under genuine manufacturer specifications.\n` +
      `• **Warranty**: Comes with standard manufacturer warranty against manufacturing defects.\n` +
      `• **Rigamart Guarantee**: If an item arrives damaged or defective, report it within 48 hours for immediate priority replacement or full refund.`;
  }

  // 6. Delivery / Shipping intent
  if (q.includes('deliver') || q.includes('shipping') || q.includes('speed') || q.includes('pincode') || q.includes('when') || q.includes('track')) {
    return `⚡ **Delivery & Shipping Details**:\n\n` +
      `• **Delivery Timeline**: Estimated **3 to 5 business days** nationwide across 28 states.\n` +
      `• **Free Shipping**: Orders of ₹500 or more enjoy **FREE Express Delivery**!\n` +
      `• **Tracking**: Live GPS courier tracking is accessible directly under your Rigamart **My Orders** page as soon as shipped.`;
  }

  // 7. General inquiry
  return `✨ **About ${name} by ${brand}**:\n\n` +
    `• **Price**: Starting from ₹${minPrice.toLocaleString('en-IN')}\n` +
    (colors.length > 0 ? `• **Colors**: ${colors.join(', ')}\n` : '') +
    (sizes.length > 0 ? `• **Available Sizes**: ${sizes.join(', ')}\n` : '') +
    `• **Rating**: ⭐ ${product.avgRating ? product.avgRating.toFixed(1) : '4.8'}/5 (${product.numReviews || 12} verified ratings)\n` +
    `• **Key Details**: ${desc.slice(0, 200)}...\n\n` +
    `Feel free to ask about sizing, best coupons, material, or return policies!`;
}

/**
 * @desc    Ask AI Product Specialist about a specific product
 * @route   POST /api/ai/ask-product
 * @access  Public
 */
const askProductAssistant = async (req, res) => {
  try {
    const { productId, question, chatHistory = [] } = req.body;

    if (!productId || !question) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and question are required',
        data: null
      });
    }

    const product = await Product.findById(productId)
      .populate('category', 'name slug')
      .populate('seller', 'name shopName')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    // Fetch active coupons to empower AI with promotional discount intelligence
    const now = new Date();
    const activeCoupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now }
    })
      .select('code description discountType discountValue maxDiscount minCartValue')
      .sort({ minCartValue: 1 })
      .lean();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // If Gemini API Key is available and GoogleGenAI initialized, query Gemini
    if (apiKey && GoogleGenAI) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const variantsSummary = (product.variants || [])
          .map((v) => `SKU: ${v.sku}, Size: ${v.size}, Color: ${v.color}, Price: ₹${v.price}, MRP: ₹${v.mrp}, Stock: ${v.stock}`)
          .join('\n');

        const couponsSummary = activeCoupons
          .map((c) => `Code: ${c.code}, Offer: ${c.description}, Min Cart: ₹${c.minCartValue}`)
          .join('\n');

        const systemInstruction = `You are Rigamart's AI Product Concierge — an expert shopping assistant for Indian e-commerce shoppers.
Your job is to provide direct, accurate, concise, and helpful answers about the product being viewed.

PRODUCT INFORMATION:
- Name: ${product.name}
- Brand: ${product.brand || 'Rigamart Verified'}
- Category: ${product.category?.name || 'General'}
- Description: ${product.description}
- Variants & Pricing:
${variantsSummary}
- Rating: ${product.avgRating || 4.8} / 5 (${product.numReviews || 0} reviews)

STORE POLICIES:
- Returns: 7-day hassle-free doorstep returns and exchanges.
- Warranty: Genuine manufacturer specifications and warranty.
- Delivery: 3 to 5 business days nationwide. Free shipping on orders ₹500 and above.
- Payment Methods: Cash on Delivery (COD) and Online via Razorpay (UPI, Google Pay, PhonePe, Cards, NetBanking).

ACTIVE STORE COUPONS:
${couponsSummary}

RESPONSE GUIDELINES:
1. Be concise, polite, helpful, and transparent. Keep answers to 2-4 clean paragraphs or bullet points with bold highlights.
2. Use Indian currency symbol (₹) and Indian numbering where appropriate.
3. If asked about coupons or deals, recommend the best matching coupon code from the list above and mention how much they can save.
4. If asked about sizes, reference the available sizes and suggest true-to-size or sizing up if between sizes.
5. If something isn't explicitly listed in the specs, offer helpful general knowledge while remaining realistic.`;

        // Format conversation history for multi-turn context
        let promptContent = '';
        if (Array.isArray(chatHistory) && chatHistory.length > 0) {
          promptContent += 'Previous conversation:\n';
          chatHistory.slice(-4).forEach((msg) => {
            promptContent += `${msg.sender === 'user' ? 'Customer' : 'Assistant'}: ${msg.text}\n`;
          });
          promptContent += '\n';
        }
        promptContent += `Customer Question: ${question}\n\nPlease provide a clear, helpful response:`;

        // Try gemini-3.8-flash first (per gemini-api-dev guidance)
        let responseText = null;
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptContent,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 600
            }
          });
          responseText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (mErr) {
          // Fallback to gemini-2.5-flash / gemini-3.5-flash-lite if 3.8 isn't available
          try {
            const fallbackResp = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: promptContent,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 600
              }
            });
            responseText = fallbackResp?.text || fallbackResp?.candidates?.[0]?.content?.parts?.[0]?.text;
          } catch (mErr2) {
            console.warn('[GEMINI SDK FALLBACK]', mErr2.message);
          }
        }

        if (responseText && responseText.trim()) {
          return res.status(200).json({
            success: true,
            message: 'AI response generated successfully',
            data: {
              answer: responseText.trim(),
              source: 'gemini-api'
            }
          });
        }
      } catch (geminiError) {
        console.warn('[GEMINI API CALL FAILED, USING HEURISTIC FALLBACK]:', geminiError.message);
      }
    }

    // Heuristic Fallback
    const fallbackAnswer = generateHeuristicResponse(product, question, activeCoupons);
    return res.status(200).json({
      success: true,
      message: 'Product response resolved',
      data: {
        answer: fallbackAnswer,
        source: 'rigamart-assistant'
      }
    });
  } catch (error) {
    console.error('[AI ASSISTANT ERROR]', error);
    res.status(500).json({
      success: false,
      message: `Failed to answer question: ${error.message}`,
      data: null
    });
  }
};

/**
 * @desc    Get suggested dynamic starter questions for a product
 * @route   GET /api/ai/suggested-questions
 * @access  Public
 */
const getSuggestedQuestions = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        data: null
      });
    }

    const product = await Product.findById(productId).populate('category', 'name slug').lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null
      });
    }

    const catName = (product.category?.name || '').toLowerCase();
    const hasSizes = (product.variants || []).some((v) => v.size && v.size !== 'Default' && v.size !== 'Free Size');

    let questions = [];

    if (catName.includes('fashion') || catName.includes('clothing') || catName.includes('apparel') || hasSizes) {
      questions = [
        '📏 What size should I choose?',
        '🧵 What fabric and material is this?',
        '💰 What is the best discount coupon for this?',
        '📦 What is the return policy if size doesn\'t fit?'
      ];
    } else if (catName.includes('footwear') || catName.includes('shoes')) {
      questions = [
        '👟 Is this true to Indian shoe sizes?',
        '🏃 Is this comfortable for daily walking/running?',
        '🏷️ Any promo code to get maximum savings?',
        '🔄 How easy is it to exchange sizes?'
      ];
    } else if (catName.includes('electronics') || catName.includes('gadget') || catName.includes('mobile')) {
      questions = [
        '⚡ What are the key specs and features?',
        '🔒 Does this come with brand warranty?',
        '📦 What accessories are included in the box?',
        '🏷️ What coupon code can I apply on this?'
      ];
    } else {
      questions = [
        '✨ What are the main highlights of this product?',
        '💰 Which coupon code gives the biggest discount?',
        '🚚 How fast is delivery to my pincode?',
        '🛡️ How does the 7-day return policy work?'
      ];
    }

    res.status(200).json({
      success: true,
      message: 'Suggested questions fetched successfully',
      data: {
        questions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

module.exports = {
  askProductAssistant,
  getSuggestedQuestions
};
