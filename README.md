# FreshFromFarm – Dairy Sales & Management System

A modern full-stack web application for managing dairy sales, subscriptions, and customer relationships.

## 🚀 Technology Stack

### Frontend
- **Next.js 16.1.4** - React framework for production
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe development
- **ESLint** - Code quality and consistency

### Backend
- **Express.js 5.2.1** - Web application framework
- **Node.js** - JavaScript runtime
- **Sequelize 6.37.7** - ORM for database operations
- **SQLite 5.1.7** - Lightweight database

### Security & Authentication
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
freshfromfarm/
├── frontend/          # Next.js application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express.js API
│   ├── src/
│   └── package.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd d:\pranithannem-projects\freshfromfarm
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

### Development

**Start Frontend** (runs on http://localhost:3000)
```bash
cd frontend
npm run dev
```

**Start Backend** (check backend configuration for port)
```bash
cd backend
npm run dev
```

### Production Build

**Frontend**
```bash
cd frontend
npm run build
npm start
```

**Backend**
```bash
cd backend
npm start
```

## 📝 Features

- User Authentication & Authorization
- Customer Management
- Daily Milk Sales Tracking
- Subscription Management
- Payment Tracking
- Inventory Management
- Reports & Analytics
- Dashboard

## 🔧 Configuration

Create `.env` files in both frontend and backend directories with necessary environment variables:

**Backend `.env` example:**
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=./database.sqlite
```

**Frontend `.env.local` example:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📄 License

This project is private and proprietary.

## 👨‍💻 Development Status

- ✅ Frontend: Active development
- ✅ Backend: Active development
- ✅ Database: SQLite configured
- ✅ Authentication: JWT implemented

---

**Last Updated**: 2026-01-22
