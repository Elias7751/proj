const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Store = require('../stores/store.model');
const Category = require('../categories/category.model');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.00
        }
    },
    discountPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0.00
        }
    },
    images: {
        type: DataTypes.JSON, // مصفوفة من روابط الصور
        defaultValue: []
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    unit: {
        type: DataTypes.STRING, // قطعة، كيلو، لتر، إلخ
        defaultValue: 'قطعة'
    },
    status: {
        type: DataTypes.ENUM('active', 'out_of_stock', 'hidden'),
        defaultValue: 'active'
    },
    weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    salesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    viewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 5.00
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    storeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    }
}, {
    tableName: 'products'
});

// العلاقات
Store.hasMany(Product, { foreignKey: 'storeId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = Product;
