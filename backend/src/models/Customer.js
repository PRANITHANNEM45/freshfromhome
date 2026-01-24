const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
    address: { type: DataTypes.STRING },
    milkType: { type: DataTypes.STRING, defaultValue: 'Cow' }, // Cow/Buffalo
    ratePerLiter: { type: DataTypes.FLOAT, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Customer;
