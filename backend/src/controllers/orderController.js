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
        upiId: process.env.MERCHANT_UPI_ID || 'annemnagapranitheswarreddy45-2@okicici',
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
        const { items, paymentMethod, shippingAddress, customerName, customerMobile, paymentRef, paymentStatus } = req.body;

        // 1. Validation of items
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one valid item' });
        }

        // 2. Validation of Customer Details
        if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
            return res.status(400).json({ error: 'Valid customer name is required' });
        }
        if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length < 10) {
            return res.status(400).json({ error: 'Complete shipping address is required (minimum 10 characters)' });
        }
        if (!customerMobile || typeof customerMobile !== 'string') {
            return res.status(400).json({ error: 'Valid customer mobile number is required' });
        }

        // Sanitize and validate mobile (10 digits Indian format)
        const cleanMobile = customerMobile.replace(/\D/g, '').slice(-10);
        if (cleanMobile.length !== 10) {
            return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
        }

        // 3. Prevent Payment Reference / UTR Duplicate / Replay Attack
        let sanitizedPaymentRef = null;
        if (paymentRef && typeof paymentRef === 'string') {
            sanitizedPaymentRef = paymentRef.trim().replace(/[<>/"';`]/g, ''); // strip potential XSS
            
            // Check if non-empty and not generic placeholder
            if (sanitizedPaymentRef.length >= 6 && !['DIRECT_APP_PAYMENT', 'DIRECT_UPI_APP', 'COD_ORDER'].includes(sanitizedPaymentRef)) {
                const existingRefSale = await Sale.findOne({
                    where: { paymentRef: sanitizedPaymentRef }
                });
                if (existingRefSale) {
                    return res.status(400).json({
                        error: 'Duplicate Transaction Reference: This UTR / Reference ID has already been used for another order.'
                    });
                }
            }
        }

        // 4. Server-Side Price Recalculation & Stock Check (ANTI-TAMPERING)
        let calculatedSubtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const count = parseInt(item.count, 10);
            if (isNaN(count) || count <= 0 || count > 50) {
                return res.status(400).json({ error: `Invalid item quantity for product ID ${item.id}` });
            }

            const product = await Product.findByPk(item.id);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.id} no longer exists` });
            }

            // Check stock availability
            if (product.stock < count) {
                return res.status(400).json({
                    error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
                });
            }

            const itemSubtotal = product.price * count;
            calculatedSubtotal += itemSubtotal;
            verifiedItems.push({
                product,
                count,
                itemSubtotal
            });
        }

        // Official Server-Side Total Calculation
        const deliveryCharge = calculatedSubtotal > 500 ? 0 : 40;
        const tax = Math.round(calculatedSubtotal * 0.05); // 5% GST
        const finalServerTotal = calculatedSubtotal + deliveryCharge + tax;

        // 5. Create Order with Server-Calculated Price
        const sanitizedMethod = ['UPI (Google Pay / PhonePe)', 'UPI (App Payment)', 'Credit / Debit Card', 'Credit/Debit Card (Online)', 'Cash on Delivery'].includes(paymentMethod)
            ? paymentMethod
            : 'Online / Card';

        const finalStatus = sanitizedMethod === 'Cash on Delivery' ? 'Pending' : (sanitizedPaymentRef ? 'Paid' : 'Pending');

        const sale = await Sale.create({
            totalAmount: finalServerTotal,
            status: 'Pending',
            paymentMethod: sanitizedMethod,
            shippingAddress: shippingAddress.trim().slice(0, 500),
            customerName: customerName.trim().slice(0, 100),
            customerMobile: cleanMobile,
            paymentRef: sanitizedPaymentRef,
            paymentStatus: finalStatus,
            UserId: req.user ? req.user.id : null
        });

        // 6. Record Sale Items and Decrement Stock Atomically
        for (const vItem of verifiedItems) {
            await SaleItem.create({
                SaleId: sale.id,
                ProductId: vItem.product.id,
                quantity: vItem.count,
                priceAtSale: vItem.product.price,
                subtotal: vItem.itemSubtotal
            });

            // Atomically decrement stock
            await vItem.product.decrement('stock', { by: vItem.count });
        }

        res.status(201).json({
            message: 'Order verified and placed securely! 🎉',
            orderId: sale.id,
            totalAmount: finalServerTotal
        });
    } catch (error) {
        console.error('Secure order creation error:', error);
        res.status(500).json({ error: 'Order processing failed. Please try again.' });
    }
};
