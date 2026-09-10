# 🥛 FreshFromFarm (freshfromhome)

> **Full-Stack E-Commerce & Dairy Sales Management Platform**  
> Built with Next.js 16 (React 19), TypeScript, Express.js, Sequelize (SQLite), and Direct UPI Gateway.

---

## 🌟 Key Features

### 🛒 Customer Experience
- **Responsive Mobile-First Interface**: Hamburger slide-out drawer, touch targets (≥44px), glassmorphism design.
- **Store & Product Catalog**: Milk, Desi Ghee, Paneer, Curd, and Fresh Vegetables with high-resolution imagery.
- **Dynamic Shopping Cart**: Real-time quantity adjustments, GST tax calculation, and free delivery thresholds.
- **Instant UPI Payment**: Dynamic QR code generation, 1-tap PhonePe/Google Pay/Paytm links, and UTR tracking.
- **Secure Card Gateway**: Integrated credit/debit card and net banking payment workflow.
- **Order Tracking**: Real-time delivery status updates for customer orders.

### 🔐 Admin & Staff Management
- **Mobile Top Bar**: Dedicated mobile admin header to manage business on smartphones.
- **Dashboard & Analytics**: Live revenue stats, pending orders counter, and total customer metrics.
- **Orders Queue**: Live order pipeline with customer contact, delivery address, payment method, and UTR verification.
- **Inventory & Pricing**: Add products, adjust prices, edit stock counts, and delete items.
- **Staff User Accounts**: Create and manage staff/admin user access.

---

## 📁 Repository Structure

`
freshfromfarm/
├── docs/                      # Comprehensive Guides
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
│   │   ├── config/            # Database connection
│   │   ├── controllers/       # Auth, Product, Order controllers
│   │   ├── models/            # Sequelize models (User, Product, Sale)
│   │   └── server.js          # Express entry point
│   └── package.json
└── README.md
`

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: 18+ or 20+
- **npm**: 9+

### 2. Installation
`ash
# Clone the repository
git clone https://github.com/PRANITHANNEM08/freshfromhome.git
cd freshfromhome

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
`

### 3. Environment Configuration
- Copy .env.example files:
  - ackend/.env.example -> ackend/.env
  - rontend/.env.example -> rontend/.env

### 4. Running the Servers
`ash
# Terminal 1: Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend App (Port 3000)
cd frontend
npm run dev
`

---

## 🌐 Free Public Publishing

See [docs/PUBLISHING_GUIDE.md](docs/PUBLISHING_GUIDE.md) for full instructions:
- **Instant Live Tunnel**: cloudflared tunnel --url http://localhost:3000
- **Permanent Frontend**: Deploy to [Vercel](https://vercel.com) (reshfromfarm.vercel.app)
- **Permanent Backend**: Deploy to [Render.com](https://render.com)

---

## 💳 Payment Gateway

- **Merchant Name**: ANNEM NAGA PRANITHESWARREDDY
- **Merchant UPI ID**: nnemnagapranitheswarreddy45-2@okicici
- Configured in ackend/.env under MERCHANT_UPI_ID.

---

## 🔐 Credentials (Default)

- **Admin Login**: [http://localhost:3000/login](http://localhost:3000/login)
  - **Username**: pranith
  - **Password**: pranith123
- **Customer Login**:
  - **Username**: customer
  - **Password**: customer123

---

## 📄 License & Author

**Author**: ANNEM NAGA PRANITHESWARREDDY  
**Repository**: [https://github.com/PRANITHANNEM08/freshfromhome](https://github.com/PRANITHANNEM08/freshfromhome)
