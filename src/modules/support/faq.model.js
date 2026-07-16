const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const FAQ = sequelize.define('FAQ', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    questionAr: {
        type: DataTypes.STRING,
        allowNull: false
    },
    questionEn: {
        type: DataTypes.STRING,
        allowNull: false
    },
    answerAr: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    answerEn: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'general'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'faqs'
});

module.exports = FAQ;
