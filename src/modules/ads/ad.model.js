const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Store = require('../stores/store.model');
const Category = require('../categories/category.model');

const Ad = sequelize.define('Ad', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    storeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true // رابط خارجي أو داخلي
    },
    placement: {
        type: DataTypes.ENUM('home_banner', 'search_top', 'category_inside', 'between_products'),
        allowNull: false
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true, // إذا كان الموضع category_inside
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    viewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    clicksCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'expired', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'ads'
});

// العلاقات
Store.hasMany(Ad, { foreignKey: 'storeId', as: 'ads' });
Ad.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Category.hasMany(Ad, { foreignKey: 'categoryId', as: 'ads' });
Ad.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = Ad;
