# 🥛 FreshFromFarm (freshfromhome)

> **Full-Stack E-Commerce & Dairy Sales Management Platform**  
> Built with Next.js 16 (React 19), TypeScript, Express.js, Sequelize (SQLite WAL Mode), and Automated Direct UPI Gateway.

---

## 🌟 Key Features

### 🛒 Customer Experience
- **Responsive Mobile-First Interface**: Hamburger slide-out drawer, touch targets (≥44px), glassmorphism design.
- **Store & Product Catalog**: Milk, Desi Ghee, Paneer, Curd, and Fresh Vegetables with high-resolution imagery.
- **Dynamic Shopping Cart**: Real-time quantity adjustments, GST tax calculation, and free delivery thresholds.
- **Automated Direct UPI Payment**: Dynamic QR code generation, 1-tap PhonePe/Google Pay/Paytm links, and automatic verification without manual buttons.
- **Secure Card Gateway**: Integrated credit/debit card and net banking payment workflow.
- **Order Tracking**: Real-time delivery status updates for customer orders.

### 🔐 Admin & Staff Management
- **Dark Blue Mobile Top Bar**: Dedicated mobile admin header to manage business on smartphones.
- **Dashboard & Analytics**: Live revenue stats, pending orders counter, and total customer metrics.
- **Orders Queue**: Live order pipeline with customer contact, delivery address, payment method, and verification.
- **Inventory & Pricing**: Add products, adjust prices, edit stock counts, and delete items.
- **Staff User Accounts**: Create and manage staff/admin user access.

---

## 📁 Repository Structure

```
freshfromfarm/
├── docs/                      # Comprehensive Guides
│   ├── WALKTHROUGH.md         # Complete Architecture & Feature Walkthrough
│   ├── PUBLISHING_GUIDE.md    # Free hosting setup (Cloudflare, Vercel, Render)
│   ├── PAYMENT_SETUP.md       # Merchant UPI ID & gateway config
│   └── API_DOCUMENTATION.md   # Complete REST API reference
├── frontend/                  # Next.js 16 Web Application
│   ├── src/
│   │   ├── app/               # Next.js App Router (shop, checkout, admin, orders)
│   │   ├── components/        # Reusable UI components
│   │   ├── config/            # API configuration
│   │   └── context/           # AuthContext & CartContext
│   ├── public/                # Product & brand imagery
│   └── package.json
├── backend/                   # Express.js API Server
│   ├── src/
│   │   ├── config/            # Database connection (SQLite WAL mode)
│   │   ├── controllers/       # Auth, Product, Order controllers
│   │   ├── middleware/        # JWT auth & security
│   │   ├── models/            # Sequelize models (User, Product, Sale)
│   │   └── server.js          # Express entry point
│   └── package.json
└── README.md
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **npm**: v9+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/PRANITHANNEM45/freshfromhome.git
cd freshfromhome

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration
- Copy `.env.example` files:
  - `backend/.env.example` -> `backend/.env`
  - `frontend/.env.example` -> `frontend/.env`

### 4. Running the Servers
```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend App (Port 3000)
cd frontend
npm run dev
```

---

## 🌐 Free Public Publishing

See [docs/PUBLISHING_GUIDE.md](docs/PUBLISHING_GUIDE.md) for full instructions:
- **Instant Live Tunnel**: `.\cloudflared.exe tunnel --url http://localhost:3000`
- **Permanent Frontend**: Deploy to [Vercel](https://vercel.com)
- **Permanent Backend**: Deploy to [Render.com](https://render.com)
