const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users/user.model');
const Order = require('../orders/order.model');

const Review = sequelize.define('Review', {
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
    orderId: {
        type: DataTypes.UUID,
        allowNull: false, // يجب أن يكون التقييم مرتبطاً بطلب تم توصيله
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    targetType: {
        type: DataTypes.ENUM('store', 'product'),
        allowNull: false
    },
    targetId: {
        type: DataTypes.UUID, // ID المتجر، أو المنتج، أو المندوب
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    images: {
        type: DataTypes.JSON, // مصفوفة من مسارات الصور
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('active', 'hidden', 'reported'),
        defaultValue: 'active'
    },
    storeReply: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    storeReplyDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'reviews',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'order_id', 'target_type', 'target_id'],
            name: 'unique_review_per_order_target'
        }
    ]
});

// العلاقات
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = Review;
