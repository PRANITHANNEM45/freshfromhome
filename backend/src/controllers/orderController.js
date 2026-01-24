const { Sale, SaleItem } = require('../models/Sale');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
    try {
        const { items, paymentMethod, shippingAddress, totalAmount } = req.body;

        const sale = await Sale.create({
            totalAmount,
            status: 'Pending',
            paymentMethod,
            shippingAddress,
            UserId: req.user.id
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
        console.error(error);
        res.status(500).json({ error: 'Order creation failed' });
    }
};
