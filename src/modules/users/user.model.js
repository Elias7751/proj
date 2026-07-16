const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            is: /^[0-9+]{7,15}$/ // التحقق من صيغة أرقام الهواتف
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100]
        }
    },
    role: {
        type: DataTypes.ENUM('customer', 'store_owner', 'admin'),
        defaultValue: 'customer'
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    area: {
        type: DataTypes.STRING,
        allowNull: true
    },
    addressDetails: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'blocked', 'pending'),
        defaultValue: 'active'
    },
    isPhoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    },
    defaultScope: {
        attributes: { exclude: ['password'] } // إخفاء كلمة المرور افتراضياً عند جلب البيانات
    },
    scopes: {
        withPassword: {
            attributes: {} // لجلب كلمة المرور عند الحاجة (مثل تسجيل الدخول)
        }
    }
});

// دالة للتحقق من كلمة المرور
User.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
