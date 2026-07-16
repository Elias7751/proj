const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const City = sequelize.define('City', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nameAr: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nameEn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'cities'
});

module.exports = City;
