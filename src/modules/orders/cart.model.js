const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users/user.model');
const Store = require('../stores/store.model');

const Cart = sequelize.define('Cart', {
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
    storeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'carts'
});

// العلاقات
User.hasMany(Cart, { foreignKey: 'userId', as: 'carts', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Store.hasMany(Cart, { foreignKey: 'storeId', as: 'carts', onDelete: 'CASCADE' });
Cart.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = Cart;
