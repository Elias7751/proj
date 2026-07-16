const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../modules/users/user.model');

// حماية الـ Routes والتحقق من تسجيل الدخول
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // التحقق من وجود التوكن في الـ Headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError(401, 'غير مصرح لك بالوصول، يرجى تسجيل الدخول أولاً'));
    }

    try {
        // التحقق من صحة التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // البحث عن المستخدم المرتبط بالتوكن
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return next(new ApiError(401, 'المستخدم المرتبط بهذا التوكن لم يعد موجوداً'));
        }

        if (user.status === 'blocked') {
            return next(new ApiError(403, 'هذا الحساب محظور حالياً'));
        }

        // تعيين المستخدم في الطلب
        req.user = user;
        next();
    } catch (err) {
        return next(new ApiError(401, 'توكن غير صالح أو منتهي الصلاحية'));
    }
});

// التحقق من صلاحيات الأدوار (Roles)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    `الدور (${req.user.role}) غير مصرح له بالوصول إلى هذا الإجراء`
                )
            );
        }
        next();
    };
};
