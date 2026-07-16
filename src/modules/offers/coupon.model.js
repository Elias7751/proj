const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Store = require('../stores/store.model');

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    storeId: {
        type: DataTypes.UUID,
        allowNull: true, // إذا كان null، فهذا يعني أنه كوبون عام للمنصة (Admin)
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'percentage'
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // الحد الأقصى للخصم في حال كان نسبة مئوية
    },
    minOrderAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usageLimit: {
        type: DataTypes.INTEGER, // إجمالي عدد مرات الاستخدام المسموحة
        allowNull: true
    },
    usageCount: {
        type: DataTypes.INTEGER, // عدد مرات الاستخدام الفعلية
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'disabled'),
        defaultValue: 'active'
    }
}, {
    tableName: 'coupons'
});

// العلاقات
Store.hasMany(Coupon, { foreignKey: 'storeId', as: 'coupons' });
Coupon.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = Coupon;
