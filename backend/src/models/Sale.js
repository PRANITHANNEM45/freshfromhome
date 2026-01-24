const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = require('./Customer');
const Product = require('./Product');
const User = require('./User'); // Import User

const Sale = sequelize.define('Sale', {
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled', 'Delivered'), defaultValue: 'Pending' },
    paymentMethod: { type: DataTypes.STRING, defaultValue: 'Cash' },
    shippingAddress: { type: DataTypes.STRING, allowNull: true }
});

Sale.belongsTo(Customer);
Customer.hasMany(Sale);

Sale.belongsTo(User); // Link Sale to User (who placed the order)
User.hasMany(Sale);

const SaleItem = sequelize.define('SaleItem', {
    quantity: { type: DataTypes.FLOAT, allowNull: false },
    priceAtSale: { type: DataTypes.FLOAT, allowNull: false },
    subtotal: { type: DataTypes.FLOAT, allowNull: false }
});

Sale.hasMany(SaleItem);
SaleItem.belongsTo(Sale);
SaleItem.belongsTo(Product);

module.exports = { Sale, SaleItem };
