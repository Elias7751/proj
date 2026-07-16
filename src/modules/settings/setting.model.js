const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
        defaultValue: 'string'
    },
    group: {
        type: DataTypes.STRING,
        defaultValue: 'general' // general, social, legal, financial
    }
}, {
    tableName: 'settings'
});

module.exports = Setting;
