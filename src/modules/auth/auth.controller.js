const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const jwt = require('jsonwebtoken');

// دالة مساعدة لتوليد الـ JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
};

// @desc    تسجيل مستخدم جديد
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { fullName, phone, email, password, role, city, area, addressDetails } = req.body;

    // التحقق من أن رقم الهاتف غير مسجل مسبقاً
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
        return next(new ApiError(400, 'رقم الهاتف هذا مسجل بالفعل'));
    }

    // إذا تم إدخال بريد إلكتروني، نتحقق من عدم تكراره
    if (email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return next(new ApiError(400, 'البريد الإلكتروني هذا مسجل بالفعل'));
        }
    }

    // إنشاء المستخدم
    const user = await User.create({
        fullName,
        phone,
        email,
        password,
        role: role || 'customer',
        city,
        area,
        addressDetails
    });

    // توليد التوكن
    const token = generateToken(user.id);

    // تسجيل في السجلات
    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: user.id,
        action: 'تسجيل حساب جديد',
        targetType: 'user',
        targetId: user.id,
        details: `تم تسجيل حساب جديد باسم ${user.fullName} ودور ${user.role === 'store_owner' ? 'تاجر' : 'عميل'}`,
        req
    });

    // إزالة كلمة المرور من الكائن الراجع
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json(
        new ApiResponse(201, { user: userResponse, token }, 'تم تسجيل الحساب بنجاح')
    );
});

// @desc    تسجيل الدخول
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { phone, password } = req.body;

    // التحقق من المدخلات
    if (!phone || !password) {
        return next(new ApiError(400, 'يرجى إدخال رقم الهاتف وكلمة المرور'));
    }

    // البحث عن المستخدم بكلمة المرور (باستخدام scope مع كلمة المرور)
    const user = await User.scope('withPassword').findOne({ where: { phone } });

    if (!user || !(await user.comparePassword(password))) {
        return next(new ApiError(401, 'رقم الهاتف أو كلمة المرور غير صحيحة'));
    }

    if (user.status === 'blocked') {
        return next(new ApiError(403, 'هذا الحساب محظور، يرجى التواصل مع الدعم الفني'));
    }

    // توليد التوكن
    const token = generateToken(user.id);

    // تسجيل في السجلات
    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: user.id,
        action: 'تسجيل الدخول',
        targetType: 'user',
        targetId: user.id,
        details: `تم تسجيل الدخول بنجاح للمستخدم ${user.fullName}`,
        req
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json(
        new ApiResponse(200, { user: userResponse, token }, 'تم تسجيل الدخول بنجاح')
    );
});

// @desc    الحصول على بيانات المستخدم الحالي
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    res.status(200).json(
        new ApiResponse(200, user, 'تم جلب بيانات المستخدم بنجاح')
    );
});

// @desc    حذف الحساب
// @route   DELETE /api/v1/auth/delete-account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return next(new ApiError(404, 'المستخدم غير موجود'));
    }

    // تسجيل في السجلات
    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: user.id,
        action: 'حذف الحساب',
        targetType: 'user',
        targetId: user.id,
        details: `قام المستخدم ${user.fullName} بحذف حسابه نهائياً`,
        req
    });

    await user.destroy();

    res.status(200).json(
        new ApiResponse(200, null, 'تم حذف الحساب بنجاح')
    );
});
