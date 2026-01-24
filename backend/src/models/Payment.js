const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = require('./Customer');

const Payment = sequelize.define('Payment', {
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    method: { type: DataTypes.ENUM('Cash', 'UPI', 'Bank'), defaultValue: 'Cash' },
    notes: { type: DataTypes.STRING }
});

Payment.belongsTo(Customer);
Customer.hasMany(Payment);

module.exports = Payment;
