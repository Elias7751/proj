const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Store = require('../stores/store.model');
const SubscriptionPlan = require('./plan.model');

const StoreSubscription = sequelize.define('StoreSubscription', {
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
    planId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'subscription_plans',
            key: 'id'
        }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'cancelled'),
        defaultValue: 'active'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'store_subscriptions'
});

// العلاقات
Store.hasMany(StoreSubscription, { foreignKey: 'storeId', as: 'subscriptions' });
StoreSubscription.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

SubscriptionPlan.hasMany(StoreSubscription, { foreignKey: 'planId', as: 'storeSubscriptions' });
StoreSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });

module.exports = StoreSubscription;
