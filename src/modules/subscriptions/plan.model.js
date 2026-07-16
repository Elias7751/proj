const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nameAr: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nameEn: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descriptionAr: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    descriptionEn: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    durationDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30 // 30 days, 90 days, 365 days, etc.
    },
    maxProducts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50 // -1 for unlimited
    },
    features: {
        type: DataTypes.JSON, // Array of features e.g. ["إضافة منتجات غير محدودة", "دعم فني 24/7"]
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'subscription_plans'
});

module.exports = SubscriptionPlan;
