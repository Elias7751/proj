const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users/user.model');
const Store = require('../stores/store.model');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
    status: {
        type: DataTypes.ENUM('pending', 'preparing', 'on_the_way', 'delivered', 'cancelled', 'new', 'contacted', 'in_progress', 'completed'),
        defaultValue: 'pending'
    },
    subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    deliveryAddress: {
        type: DataTypes.JSON, // { city, area, street, details, lat, lng }
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash_on_delivery', 'whatsapp_transfer'),
        defaultValue: 'cash_on_delivery'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    statusHistory: {
        type: DataTypes.JSON, // [{ status: 'pending', date: '...' }, ...]
        defaultValue: []
    }
}, {
    tableName: 'orders',
    hooks: {
        beforeCreate: (order) => {
            // توليد رقم طلب فريد (مثال: ORD-162839123)
            order.orderNumber = `ORD-${Math.floor(Math.random() * 1000000000)}`;
            order.statusHistory = [{ status: order.status, date: new Date() }];
        },
        beforeUpdate: (order) => {
            if (order.changed('status')) {
                let history = order.statusHistory || [];
                if (typeof history === 'string') {
                    try {
                        history = JSON.parse(history);
                    } catch (e) {
                        history = [];
                    }
                }
                history.push({ status: order.status, date: new Date() });
                order.statusHistory = history;
            }
        }
    }
});

// العلاقات
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Store.hasMany(Order, { foreignKey: 'storeId', as: 'orders' });
Order.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = Order;
