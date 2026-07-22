const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Store = require('../stores/store.model');

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage'
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    minOrderAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    maxDiscountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Only applicable for percentage
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true // null means unlimited
    },
    usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    storeId: {
        type: DataTypes.UUID,
        allowNull: true, // If null, it's a global platform coupon
        references: {
            model: 'stores',
            key: 'id'
        }
    }
}, {
    tableName: 'coupons',
    hooks: {
        beforeValidate: (coupon) => {
            if (coupon.code) {
                coupon.code = coupon.code.toUpperCase().trim();
            }
        }
    }
});

// العلاقات
Store.hasMany(Coupon, { foreignKey: 'storeId', as: 'coupons' });
Coupon.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = Coupon;
