const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
    date: { type: DataTypes.DATEONLY, unique: true, allowNull: false, defaultValue: DataTypes.NOW },
    morningMilk: { type: DataTypes.FLOAT, defaultValue: 0 },
    eveningMilk: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalStock: { type: DataTypes.FLOAT, defaultValue: 0 },
    sold: { type: DataTypes.FLOAT, defaultValue: 0 },
    remaining: { type: DataTypes.FLOAT, defaultValue: 0 }
});

module.exports = Inventory;
