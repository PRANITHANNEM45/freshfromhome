const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING }, // Milk, Curd, Ghee, etc.
    price: { type: DataTypes.FLOAT, allowNull: false },
    unit: { type: DataTypes.STRING, defaultValue: 'L' }, // L, kg, pack
    image: { type: DataTypes.STRING }, // URL or placeholder path
    stock: { type: DataTypes.FLOAT, defaultValue: 0 },
    description: { type: DataTypes.STRING }
});

module.exports = Product;
