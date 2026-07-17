const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users/user.model');
const Category = require('../categories/category.model');
const City = require('../cities/city.model');
const Area = require('../cities/area.model');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nameAr: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nameEn: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cover: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    streetAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    workingHours: {
        type: DataTypes.JSON, // لتخزين أوقات العمل مثل { sat: "9am-10pm", ... }
        allowNull: true
    },
    deliveryPolicy: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    socialLinks: {
        type: DataTypes.JSON, // لتخزين روابط التواصل الاجتماعي مثل { facebook: "...", instagram: "..." }
        allowNull: true
    },
    minOrderAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 5.00
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'blocked', 'closed'),
        defaultValue: 'pending'
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
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
    },
    cityId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'cities',
            key: 'id'
        }
    },
    areaId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'areas',
            key: 'id'
        }
    }
}, {
    tableName: 'stores'
});

// العلاقات
User.hasMany(Store, { foreignKey: 'ownerId', as: 'stores' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Category.hasMany(Store, { foreignKey: 'categoryId', as: 'stores' });
Store.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

City.hasMany(Store, { foreignKey: 'cityId', as: 'stores' });
Store.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

Area.hasMany(Store, { foreignKey: 'areaId', as: 'stores' });
Store.belongsTo(Area, { foreignKey: 'areaId', as: 'area' });

module.exports = Store;
