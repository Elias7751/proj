const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../users/user.model');

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    ticketNumber: {
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
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    }
}, {
    tableName: 'tickets',
    hooks: {
        beforeValidate: (ticket) => {
            if (!ticket.ticketNumber) {
                ticket.ticketNumber = `TCK-${Math.floor(Math.random() * 1000000)}`;
            }
        }
    }
});

const TicketMessage = sequelize.define('TicketMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'tickets',
            key: 'id'
        }
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'ticket_messages'
});

// العلاقات
User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Ticket.hasMany(TicketMessage, { foreignKey: 'ticketId', as: 'messages' });
TicketMessage.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

User.hasMany(TicketMessage, { foreignKey: 'senderId', as: 'sentMessages' });
TicketMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

module.exports = { Ticket, TicketMessage };
