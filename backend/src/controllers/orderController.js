const { Sale, SaleItem } = require('../models/Sale');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) return null;
    return new Razorpay({ key_id, key_secret });
};

exports.getPaymentConfig = (req, res) => {
    res.json({
        upiId: process.env.MERCHANT_UPI_ID || '7893260269@okaxis',
        payeeName: process.env.MERCHANT_PAYEE_NAME || 'ANNEM NAGA PRANITHESWARREDDY',
        merchantMobile: '7893260269',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
        razorpayEnabled: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    });
};

exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const razorpay = getRazorpayInstance();
        if (!razorpay) {
            return res.status(400).json({
                error: 'Razorpay keys not configured on server',
                configured: false
            });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
};

exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(400).json({ error: 'Secret not configured' });
        }

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            res.json({ success: true, message: 'Payment verified' });
        } else {
            res.status(400).json({ success: false, error: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { items, paymentMethod, shippingAddress, customerName, customerMobile, totalAmount, paymentRef, paymentStatus } = req.body;

        const sale = await Sale.create({
            totalAmount,
            status: 'Pending',
            paymentMethod,
            shippingAddress,
            customerName: customerName || null,
            customerMobile: customerMobile || null,
            paymentRef: paymentRef || null,
            paymentStatus: paymentStatus || (paymentMethod === 'cod' ? 'Pending' : (paymentRef ? 'Paid' : 'Pending')),
            UserId: req.user ? req.user.id : null
        });

        for (const item of items) {
            const product = await Product.findByPk(item.id);
            if (product) {
                await SaleItem.create({
                    SaleId: sale.id,
                    ProductId: product.id,
                    quantity: item.count,
                    priceAtSale: product.price,
                    subtotal: product.price * item.count
                });
            }
        }

        res.status(201).json({ message: 'Order placed successfully', orderId: sale.id });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Order creation failed' });
    }
};
