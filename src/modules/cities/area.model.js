const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const City = require('./city.model');

const Area = sequelize.define('Area', {
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
    cityId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'cities',
            key: 'id'
        }
    },
    deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'areas',
    indexes: [
        {
            unique: true,
            fields: ['city_id', 'name_ar']
        }
    ]
});

// العلاقات
City.hasMany(Area, { foreignKey: 'cityId', as: 'areas' });
Area.belongsTo(City, { foreignKey: 'cityId', as: 'city' });

module.exports = Area;
