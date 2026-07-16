const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users/user.model');
const Product = require('../products/product.model');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    }
}, {
    tableName: 'favorites',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'product_id'],
            name: 'unique_user_product_favorite'
        }
    ]
});

// العلاقات
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Favorite, { foreignKey: 'productId', as: 'favorites' });
Favorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = Favorite;
