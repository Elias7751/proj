const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Product = require('./product.model');

const ProductVariant = sequelize.define('ProductVariant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    attributeName: {
        type: DataTypes.STRING, // حجم، لون، نكهة، إلخ
        allowNull: false
    },
    attributeValue: {
        type: DataTypes.STRING, // كبير، أحمر، شوكولاتة، إلخ
        allowNull: false
    },
    additionalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00 // السعر الإضافي الذي يضاف للسعر الأصلي للمنتج
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'product_variants',
    indexes: [
        {
            unique: true,
            fields: ['product_id', 'attribute_name', 'attribute_value']
        }
    ]
});

// العلاقات
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = ProductVariant;
