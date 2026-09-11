const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Global Crash Prevention (Prevents server crash on unexpected runtime errors)
process.on('uncaughtException', (err) => {
    console.error('🔥 CRASH PREVENTED - Uncaught Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 CRASH PREVENTED - Unhandled Promise Rejection:', reason);
});

dotenv.config();

const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const { Sale, SaleItem } = require('./models/Sale');
const authController = require('./controllers/authController');
const orderController = require('./controllers/orderController');
const { verifyToken, verifyAdmin, verifyMasterAdmin } = require('./middleware/auth');

const app = express();

// High-Throughput HTTP Compression (Reduces payload size by up to 75%)
app.use(compression());

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration (Permits Vercel production frontend, previews, and custom domains)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : '*';

app.use(cors({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Strict Request Payload Limit (prevents memory exhaustion / DoS)
app.use(express.json({ limit: '50kb' }));

// Anti-DDoS & Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', globalLimiter);

// Brute-force protection on Auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // max 15 attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

// Transaction protection on Order creation
const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Order submission limit reached. Please wait before placing more orders.' }
});

// Health Check Endpoint (Used by Cloud Platforms like Render/Railway for 24/7 uptime monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'FreshFromFarm Backend API is running 24/7 in the cloud.' });
});

// Auth Routes
app.post('/api/auth/register', authLimiter, authController.register);
app.post('/api/auth/login', authLimiter, authController.login);

// Admin User Management (Strictly licensed to Master Admin: pranith)
app.post('/api/admin/users', verifyToken, verifyMasterAdmin, authController.createStaff);
app.get('/api/admin/users', verifyToken, verifyMasterAdmin, authController.getStaffUsers);
app.delete('/api/admin/users/:id', verifyToken, verifyMasterAdmin, authController.deleteStaffUser);

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.put('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { price, stock, description } = req.body;
        await Product.update({ price, stock, description }, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

app.post('/api/products', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, category, price, unit, stock, description, image } = req.body;
        const newProduct = await Product.create({
            name, category, price, unit, stock, description,
            image: image || 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=400&q=80' // Default placeholder
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.delete('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await Product.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Payment Routes
app.get('/api/payment/config', orderController.getPaymentConfig);
app.post('/api/payment/razorpay/create-order', verifyToken, orderController.createRazorpayOrder);
app.post('/api/payment/razorpay/verify', verifyToken, orderController.verifyRazorpayPayment);

// Order Routes
app.post('/api/orders', verifyToken, orderLimiter, orderController.createOrder); // Customer creates order

app.get('/api/orders/my', verifyToken, async (req, res) => {
    try {
        const orders = await Sale.findAll({
            where: { UserId: req.user.id },
            include: [{ model: SaleItem, include: [Product] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your orders' });
    }
});

app.get('/api/admin/orders', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const orders = await Sale.findAll({
            include: [
                {
                    model: SaleItem,
                    include: [Product]
                },
                {
                    model: User,
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.put('/api/admin/orders/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await Sale.update({ status }, { where: { id: req.params.id } });
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ error: 'Status update failed' });
    }
});

app.put('/api/admin/orders/:id/confirm', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await Sale.update({ status: 'Confirmed' }, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

app.get('/api/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalOrders = await Sale.count();
        const pendingOrders = await Sale.count({ where: { status: 'Pending' } });
        const confirmedOrders = await Sale.count({ where: { status: 'Confirmed' } });
        const totalRevenue = await Sale.sum('totalAmount') || 0;
        const totalProducts = await Product.count();
        const totalCustomers = await User.count({ where: { role: 'customer' } });

        res.json({
            totalOrders,
            pendingOrders,
            confirmedOrders,
            totalRevenue: Math.round(totalRevenue),
            totalProducts,
            totalCustomers
        });
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

const PORT = process.env.PORT || 5000;

const seedData = async () => {
    // Seed Master Admin (pranith / pranith123)
    const hash = await bcrypt.hash('pranith123', 10);
    const adminExists = await User.findOne({ where: { username: 'pranith' } });
    if (!adminExists) {
        await User.create({ username: 'pranith', password: hash, role: 'admin' });
    } else {
        await User.update({ password: hash, role: 'admin' }, { where: { username: 'pranith' } });
    }

    // Seed Products with Images
    const count = await Product.count();
    if (count === 0) {
        await Product.bulkCreate([
            {
                name: 'Cow Milk',
                category: 'Milk',
                price: 60,
                unit: 'L',
                stock: 100,
                description: 'Fresh raw cow milk, delivered daily.',
                image: '/milk_bottle.jpg'
            },
            {
                name: 'Buffalo Milk',
                category: 'Milk',
                price: 80,
                unit: 'L',
                stock: 80,
                description: 'Rich and creamy buffalo milk.',
                image: '/milk_bottle.jpg'
            },
            {
                name: 'Desi Ghee',
                category: 'Ghee',
                price: 1200,
                unit: 'kg',
                stock: 50,
                description: 'Pure traditional desi ghee.',
                image: '/ghee.png'
            },
            {
                name: 'Fresh Paneer',
                category: 'Paneer',
                price: 380,
                unit: 'kg',
                stock: 30,
                description: 'Soft homemade fresh paneer.',
                image: '/paneer.png'
            },
            {
                name: 'Farm Curd',
                category: 'Curd',
                price: 70,
                unit: 'kg',
                stock: 40,
                description: 'Thick and natural set curd.',
                image: '/curd.png'
            },
            {
                name: 'Fresh Tomato',
                category: 'Vegetable',
                price: 40,
                unit: 'kg',
                stock: 100,
                description: 'Red ripe farm tomatoes.',
                image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Potato',
                category: 'Vegetable',
                price: 30,
                unit: 'kg',
                stock: 150,
                description: 'Fresh soil-grown potatoes.',
                image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Onion',
                category: 'Vegetable',
                price: 35,
                unit: 'kg',
                stock: 120,
                description: 'Fresh red onions.',
                image: 'https://images.unsplash.com/photo-1508747703725-7197771e4125?auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Carrot',
                category: 'Vegetable',
                price: 60,
                unit: 'kg',
                stock: 80,
                description: 'Crunchy orange carrots.',
                image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80'
            },
            {
                name: 'Green Chilli',
                category: 'Vegetable',
                price: 80,
                unit: 'kg',
                stock: 30,
                description: 'Spicy fresh green chillies.',
                image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80'
            }
        ]);
        console.log('Products seeded with images!');
    }
};

// Centralized Error Handling Middleware (Prevents server crashes from unhandled route errors)
app.use((err, req, res, next) => {
    console.error('Handled API Error:', err.message);
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).json({
        error: 'A server error occurred. Please try again.',
        code: 'INTERNAL_ERROR'
    });
});

sequelize.sync()
    .then(async () => {
        await seedData();

        // Update images to use real photos (Customer Request)
        await Product.update({ image: '/real_onion.png' }, { where: { name: 'Onion' } });
        await Product.update({ image: '/real_green_chilli.png' }, { where: { name: 'Green Chilli' } });

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // High-concurrency socket configuration
        server.keepAliveTimeout = 65000; // 65 seconds
        server.headersTimeout = 66000;
    })
    .catch(err => console.error('Database initialization error:', err));
