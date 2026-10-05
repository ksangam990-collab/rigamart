# Rigamart Feature Preservation Inventory Contract (v2)

This document is the **immutable inventory** of all existing routes, pages, state slices, APIs, and functional features across the Rigamart codebase. Under the **Design v2: Sharp Minimal System** specification, no feature listed here may be deleted, hidden, renamed, or broken. The agent may only restyle the markup and UI presentation layer.

---

## 1. Application Routes & Portals

### 1.1 Storefront & Customer Routes
| Route | Component | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage` | Public | Storefront hero, curated collections, trending products, trust signals |
| `/search`, `/catalog` | `CatalogPage` | Public | Full catalog, search query filter, price filter, category pills, mobile filter sheet |
| `/products/:id` | `ProductDetailPage` | Public | Product images, variant selector, price & tax calculation, size guide, pincode estimator, reviews, bundles, Gemini AI assistant, recently viewed ribbon |
| `/cart` | `CartPage` | Public / Hybrid | Persistent cart, quantity controls, line item remove, interactive coupon drawer, price summary |
| `/wishlist` | `WishlistPage` | Public / Hybrid | Wishlist grid, heart toggle, move to bag |
| `/login` | `LoginPage` | Guest | Email/password auth, instant Mobile OTP sign-in modal, Google sign-in |
| `/register` | `RegisterPage` | Guest | Customer/Seller role toggle, registration fields, Google sign-in |
| `/my-orders` | `MyOrdersPage` | Protected (Customer) | Order history cards, status badges, view details, PDF invoice download |
| `/orders/:id` | `OrderDetailPage` | Protected (Customer) | Order items, status stepper, Live GPS courier tracking radar, cancel order, return request modal, PDF invoice |
| `/profile` | `ProfilePage` | Protected (Customer) | Profile info, saved delivery address book (add, edit, delete, default) |
| `/about` | `AboutPage` | Public | Brand story, values, stats, team profiles |
| `/help` | `HelpPage` | Public | Real-time FAQ search, expandable category accordions, support concierge CTA |
| `/sell` | `SellPage` | Public | Seller landing page, 3-step onboarding, benefits, B2B wholesale concepts |
| `/privacy` | `PrivacyPage` | Public | Privacy policy documentation with sticky navigation |
| `/terms` | `TermsPage` | Public | Terms of service documentation with sticky navigation |
| `/styleguide` | `StyleguidePage` | Developer | Internal component living styleguide & design system lab (excluded from customer navigation) |
| `/unauthorized` | `UnauthorizedPage` | Public | Role permission barrier notice |
| `*` | `NotFoundPage` | Public | 404 error state with return home action |

### 1.2 Seller Portal (`/seller/*`)
| Route / Tab | Component | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/seller` | `SellerDashboardPage` | Protected (Seller / Admin) | Unified seller command center |
| Tab: Overview | Overview section | Seller | KPI stat cards (Gross sales, units sold, low-stock warnings), recent order list |
| Tab: Products | Products section | Seller | Product catalog table, multi-variant creation modal, Cloudinary image upload, quick restock modal |
| Tab: Orders | Orders section | Seller | Order fulfillment management (Mark Confirmed, Shipped, Delivered), customer address details |
| Tab: Analytics | `SellerAnalyticsTab` | Seller | Revenue and order volume charts, range filter (7d/30d/90d/1y), top products leaderboard |
| Tab: Returns | `SellerReturnsTab` | Seller | Customer return requests, proof photo lightbox, pickup date scheduler, automated refund settlement |

### 1.3 Admin Portal (`/admin/*`)
| Route / Tab | Component | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/admin` | `AdminDashboardPage` | Protected (Admin) | Platform administration dashboard |
| Section: Analytics | Analytics overview | Admin | Platform-wide GMV, transactions, order distribution |
| Section: Users | User management | Admin | User list, role promotion (Customer ↔ Seller ↔ Admin), ban/suspend controls |
| Section: Products | Catalog moderation | Admin | Toggle product visibility, delete inappropriate listings |
| Section: Orders | Orders desk | Admin | Super-admin order override, cancel order with atomic inventory restore |

---

## 2. Feature Classification Contract

### 2.1 Tier A: Existing Features (Protected — Never Remove, Hide or Break)
- **Search & Discovery**:
  - Full-text search with URL sync (`/search?q=...`)
  - Category browsing (`/search?category=...`)
  - Price filter range (`/search?minPrice=...&maxPrice=...`)
  - Sorting: newest, price low-to-high, price high-to-low, rating
  - Spotlight predictive search bar with recent searches in local storage
- **Product Experience**:
  - Multi-variant selector (Size, Color, SKU)
  - Real-time stock availability per variant (disabled struck options, low stock notes, Sold Out state)
  - MRP and discount percentage calculation
  - Customer ratings and review list with verified-buyer badges and helpful voting
  - Static Size Guide drawer
  - Static Pincode delivery estimator
  - Frequently Bought Together bundle engine with 1-click add and auto-discount
  - Floating Gemini AI product concierge assistant (`ProductAiAssistant`)
  - Recently Viewed products carousel ribbon
- **Cart & Checkout**:
  - Persistent cart synchronized with backend database
  - Real-time inventory drift detection and warning
  - Interactive Coupon Drawer with promo validation and discount subtraction
  - Guest Mobile OTP checkout modal (`GuestOtpModal`)
  - Dual payment gateways: Razorpay (Cards, UPI, Net Banking) and Cash on Delivery (COD)
- **Orders & Tracking**:
  - Customer order history with status filters
  - Live order tracking timeline with GPS waypoint simulation (`LiveDeliveryTracker`)
  - Branded PDF tax invoice download (`/orders/:id/invoice`)
  - Return request flow with photo evidence dropzone (`ReturnRequestModal`)
- **Seller & Admin Operations**:
  - Sales analytics (revenue, units sold, order status distribution)
  - Product management with variant matrices and Cloudinary upload (`AddProductModal`)
  - Low-stock alerts (<= 5 units) and quick restock dialog (`RestockModal`)
  - Order fulfillment state transitions (Confirmed → Shipped → Delivered)
  - Return dispute resolution desk with automated inventory restock on refund
  - Super-admin role permissions and moderation

### 2.2 Tier B: UI-Only Enhancements (Allowed — Zero Backend Changes Required)
- Zero-CLS skeleton loaders matching exact layout dimensions
- Ergonomic mobile bottom sheets for filters, size guide, and coupon drawer
- Sticky mobile bottom Add-to-Cart bar
- Active filter tags with 1-click dismissal
- Hairline dividers (1px `--n200`) and flat surfaces
- Strict 4px control radius and 0px card radius
- Dark mode semantic token mapping

### 2.3 Tier C: Parked Ideas (Do NOT Build in Redesign)
- Multi-photo review uploader (requires new review backend schema)
- Flash-deal countdown timers (requires server-side deal scheduler)
- "X bought in 24 hours" fake counters (forbidden — strictly truthful data only)
- Notification waitlists / Notify-Me (requires push notification backend)

---

## 3. Redux Slices & Logic Integrity
Under no circumstances may any of the following Redux slices or Axios client interceptors be modified or removed:
- `features/auth/authSlice.js`: `checkAuth`, `loginUser`, `registerUser`, `logoutUser`, `updateProfile`
- `features/cart/cartSlice.js`: `fetchCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart`
- `features/wishlist/wishlistSlice.js`: `fetchWishlist`, `toggleWishlist`, `toggleGuestWishlist`
- `features/notification/notificationSlice.js`: `fetchNotifications`, `fetchUnreadCount`
- `utils/api.js`: Axios instance, JWT in-memory bearer token interceptor, 401 refresh token queue handler
