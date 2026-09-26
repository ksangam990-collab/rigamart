# Rigamart | Production Multi-Vendor E-Commerce Platform

[![Production Status](https://img.shields.io/badge/Status-Live%20in%20Production-success?style=for-the-badge)](https://rigamart-frontend.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://rigamart-frontend.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://rigamart-backend.onrender.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

Rigamart is a scalable, production-grade multi-vendor e-commerce platform built on the MERN stack with Tailwind CSS and Redux Toolkit. Inspired by platforms like Flipkart, Myntra, and Meesho, Rigamart provides a seamless shopping experience for customers, a dedicated Seller Central portal for merchants, and a centralized moderation dashboard for platform administrators—engineered entirely within a ₹0 free-tier cloud budget.

---

## 🌐 Live Deployments

- **Customer Storefront (Vercel)**: [https://rigamart-frontend.vercel.app](https://rigamart-frontend.vercel.app)
- **REST API & Health Engine (Render)**: [https://rigamart-backend.onrender.com](https://rigamart-backend.onrender.com)
- **Health Check Endpoint**: [https://rigamart-backend.onrender.com/api/health](https://rigamart-backend.onrender.com/api/health)

---

## 🏛️ Architecture & Portals

```
                                  ┌────────────────────────┐
                                  │   Rigamart Frontend    │
                                  │ (React + Vite + Redux) │
                                  └───────────┬────────────┘
                                              │ HTTPS / JSON
                                              ▼
                                  ┌────────────────────────┐
                                  │    Rigamart Backend    │
                                  │    (Node.js/Express)   │
                                  └───────────┬────────────┘
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
                │ MongoDB Atlas  │   │   Cloudinary   │   │ Razorpay / COD │
                │   (Cluster0)   │   │  Media Storage │   │ Payment Gateway│
                └────────────────┘   └────────────────┘   └────────────────┘
```

1. **Customer Storefront**:
   - Product catalog with full-text search, category browsing, price filters, and multi-mode sorting (`newest`, `price-asc`, `price-desc`, `rating`).
   - Detailed product view with multi-variant selectors (size, color, real-time stock availability, and MRP discount calculations).
   - Dynamic reviews & ratings system with verified-buyer badges and helpful-voting toggles.
   - Synchronized persistent cart & wishlist with live inventory drift detection.
   - 256-bit encrypted checkout supporting Razorpay (UPI, Credit/Debit cards, Netbanking) and Cash on Delivery (COD).
   - Order history with live order tracking timelines and server-rendered itemized PDF invoices.
2. **Seller Central (`/seller`)**:
   - Real-time sales analytics, revenue metrics, and unit sales volume.
   - Product catalog management with dynamic multi-variant creation and image uploads.
   - Low-stock warnings ($\le 5$ units) and quick restocking modal.
   - Order fulfillment controller to transition orders across statuses (`Confirmed`, `Shipped`, `Delivered`).
3. **Platform Administration & Moderation (`/admin`)**:
   - Gross Merchandise Value (GMV) and transaction KPIs across all sellers.
   - User account management with real-time role promotion and suspension/ban controls.
   - Catalog moderation to review and toggle marketplace visibility for suspicious products.
   - Super-admin order overrides with atomic inventory restoral on cancellation.

---

## 📦 Monorepo Directory Structure

```text
rigamart/
├── ecommerce-backend/             # Express.js REST API Server
│   ├── config/                    # DB, Cloudinary, Razorpay, Nodemailer configs
│   ├── controllers/               # Route business logic (auth, cart, order, etc.)
│   ├── middleware/                # JWT auth, role validation, multer upload
│   ├── models/                    # Mongoose schemas (User, Product, Order, etc.)
│   ├── routes/                    # API endpoints router
│   ├── utils/                     # Test harnesses, PDF generator, email service
│   ├── server.js                  # Main server entrypoint with trust-proxy
│   ├── render.yaml                # Render Blueprint specification
│   └── package.json
│
├── ecommerce-frontend/            # React 18 + Vite Single Page Application
│   ├── src/
│   │   ├── components/            # UI components (Navbar, Footer, Modals, etc.)
│   │   ├── features/              # Redux Toolkit slices (auth, cart, wishlist)
│   │   ├── pages/                 # Route views (Catalog, ProductDetail, Cart, etc.)
│   │   ├── store/                 # Redux store configuration
│   │   ├── utils/                 # Axios API client with interceptors
│   │   ├── App.jsx                # Route definitions & protected guards
│   │   └── main.jsx               # Application entrypoint
│   ├── vercel.json                # Vercel SPA routing rewrite rules
│   ├── vite.config.js             # Vite bundler configuration
│   ├── tailwind.config.js         # Custom brand theme & styling
│   └── package.json
│
├── render.yaml                    # Root Render Blueprint (rootDir: ecommerce-backend)
├── .gitignore                     # Monorepo-wide security exclusions
└── README.md                      # Unified documentation
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Redux Toolkit, Tailwind CSS, Lucide Icons, React Router v6 |
| **Backend** | Node.js, Express.js, Mongoose, JWT, bcryptjs, Helmet, Morgan, PDFKit |
| **Database** | MongoDB Atlas (Free M0 Cluster) with atomic `$elemMatch` inventory updates |
| **Storage** | Cloudinary (Free Tier) with Multer memory storage |
| **Payments** | Razorpay (Test Mode with cryptographic HMAC-SHA256 verification) + COD |
| **Email** | Nodemailer with Gmail SMTP app passwords and branded HTML templates |
| **Deployment** | Vercel (Frontend Global CDN), Render (Backend Web Service), GitHub CI/CD |

---

## 🔒 Security & Data Integrity

- **Cryptographic Payment Verification**: All Razorpay transactions verify HMAC-SHA256 signatures server-side before confirming orders, preventing tampering or parameter injection.
- **Atomic Stock Decrements**: Inventory decrements use Mongoose `$elemMatch` and `$inc` with boundary guards (`stock >= quantity`), preventing negative inventory or overselling under high concurrency.
- **Session Protection**: Access tokens are stored in memory via Redux, with long-lived refresh tokens secured in `httpOnly`, `sameSite: 'none'`, `secure: true` cookies.
- **Reverse Proxy Compliance**: Configured with `app.set('trust proxy', 1)` to correctly inspect client IPs and TLS protocols behind Render load balancers.

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/ksangam990-collab/rigamart.git
cd rigamart
```

### 2. Configure Backend
```bash
cd ecommerce-backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas, Cloudinary, Razorpay, and Gmail credentials
npm run dev
# Backend starts on http://localhost:5000
```

### 3. Configure Frontend
```bash
cd ../ecommerce-frontend
npm install
cp .env.example .env
npm run dev
# Frontend starts on http://localhost:5173
```

---

## 🧪 Automated Test Suites

Rigamart includes automated contract and integration test harnesses verifying live endpoints:

```bash
# 1. Run full frontend contract & Razorpay HMAC-SHA256 suite:
cd ecommerce-frontend
node testStep14.js

# 2. Run cloud deployment preflight checks:
cd ../ecommerce-backend
node utils/testDeploymentPreflight.js
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
