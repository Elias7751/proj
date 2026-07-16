const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Store = require('../stores/store.model');
const Product = require('../products/product.model');

const Offer = sequelize.define('Offer', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'percentage'
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'disabled'),
        defaultValue: 'active'
    }
}, {
    tableName: 'offers'
});

// جدول وسيط لربط العروض بالمنتجات المحددة (إذا كان العرض ليس لكل المتجر)
const OfferProducts = sequelize.define('OfferProducts', {
    offerId: {
        type: DataTypes.UUID,
        references: {
            model: 'offers',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        references: {
            model: 'products',
            key: 'id'
        }
    }
}, {
    tableName: 'offer_products',
    timestamps: false
});

// العلاقات
Store.hasMany(Offer, { foreignKey: 'storeId', as: 'offers' });
Offer.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Offer.belongsToMany(Product, { through: OfferProducts, as: 'products', foreignKey: 'offerId' });
Product.belongsToMany(Offer, { through: OfferProducts, as: 'offers', foreignKey: 'productId' });

module.exports = { Offer, OfferProducts };
