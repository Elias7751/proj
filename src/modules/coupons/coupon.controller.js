const Coupon = require('./coupon.model');
const Store = require('../stores/store.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { Op } = require('sequelize');

// ==========================================
// الإدارة (Admin)
// ==========================================

// @desc    جلب جميع الكوبونات (للإدارة)
// @route   GET /api/v1/coupons/admin
// @access  Private (Admin)
exports.getAllCoupons = asyncHandler(async (req, res, next) => {
    const coupons = await Coupon.findAll({
        include: [{ model: Store, as: 'store', attributes: ['nameAr', 'nameEn'] }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, coupons, 'تم جلب الكوبونات بنجاح'));
});

// @desc    إنشاء كوبون جديد (عام للمنصة أو لمتجر محدد)
// @route   POST /api/v1/coupons/admin
// @access  Private (Admin)
exports.createCouponAdmin = asyncHandler(async (req, res, next) => {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, storeId } = req.body;

    const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase().trim() } });
    if (existingCoupon) {
        return next(new ApiError(400, 'رمز الكوبون مستخدم مسبقاً'));
    }

    const coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        storeId: storeId || null
    });

    res.status(201).json(new ApiResponse(201, coupon, 'تم إنشاء الكوبون بنجاح'));
});

// @desc    تحديث كوبون
// @route   PUT /api/v1/coupons/admin/:id
// @access  Private (Admin)
exports.updateCouponAdmin = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
        return next(new ApiError(404, 'الكوبون غير موجود'));
    }

    await coupon.update(req.body);
    res.status(200).json(new ApiResponse(200, coupon, 'تم تحديث الكوبون بنجاح'));
});

// @desc    حذف كوبون
// @route   DELETE /api/v1/coupons/admin/:id
// @access  Private (Admin)
exports.deleteCouponAdmin = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
        return next(new ApiError(404, 'الكوبون غير موجود'));
    }

    await coupon.destroy();
    res.status(200).json(new ApiResponse(200, null, 'تم حذف الكوبون بنجاح'));
});

// ==========================================
// التجار (Store Owners)
// ==========================================

// @desc    جلب كوبونات المتجر
// @route   GET /api/v1/coupons/store
// @access  Private (Store Owner)
exports.getStoreCoupons = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    const coupons = await Coupon.findAll({
        where: { storeId: store.id },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, coupons, 'تم جلب كوبونات المتجر بنجاح'));
});

// @desc    إنشاء كوبون للمتجر
// @route   POST /api/v1/coupons/store
// @access  Private (Store Owner)
exports.createStoreCoupon = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase().trim() } });
    if (existingCoupon) {
        return next(new ApiError(400, 'رمز الكوبون مستخدم مسبقاً'));
    }

    const coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        storeId: store.id
    });

    res.status(201).json(new ApiResponse(201, coupon, 'تم إنشاء الكوبون بنجاح'));
});

// ==========================================
// العملاء (Customers)
// ==========================================

// @desc    التحقق من صحة الكوبون
// @route   POST /api/v1/coupons/validate
// @access  Public
exports.validateCoupon = asyncHandler(async (req, res, next) => {
    const { code, storeId, orderAmount } = req.body;

    if (!code || !orderAmount) {
        return next(new ApiError(400, 'يرجى توفير رمز الكوبون وقيمة الطلب'));
    }

    const coupon = await Coupon.findOne({
        where: {
            code: code.toUpperCase().trim(),
            isActive: true
        }
    });

    if (!coupon) {
        return next(new ApiError(404, 'الكوبون غير صالح أو غير موجود'));
    }

    // التحقق من تاريخ الصلاحية
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
        return next(new ApiError(400, 'الكوبون لم يبدأ بعد'));
    }
    if (coupon.endDate && now > coupon.endDate) {
        return next(new ApiError(400, 'الكوبون منتهي الصلاحية'));
    }

    // التحقق من حد الاستخدام
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return next(new ApiError(400, 'تم الوصول للحد الأقصى لاستخدام الكوبون'));
    }

    // التحقق من الحد الأدنى للطلب
    if (orderAmount < coupon.minOrderAmount) {
        return next(new ApiError(400, \`يجب أن تكون قيمة الطلب ${coupon.minOrderAmount} على الأقل لاستخدام الكوبون\`));
    }

    // التحقق من ارتباط الكوبون بمتجر معين
    if (coupon.storeId && coupon.storeId !== storeId) {
        return next(new ApiError(400, 'هذا الكوبون غير صالح لهذا المتجر'));
    }

    // حساب قيمة الخصم
    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
        discountAmount = parseFloat(coupon.discountValue);
    } else if (coupon.discountType === 'percentage') {
        discountAmount = (orderAmount * parseFloat(coupon.discountValue)) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = parseFloat(coupon.maxDiscountAmount);
        }
    }

    // التأكد من أن الخصم لا يتجاوز قيمة الطلب
    if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
    }

    res.status(200).json(new ApiResponse(200, {
        couponId: coupon.id,
        code: coupon.code,
        discountAmount: discountAmount.toFixed(2),
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
    }, 'الكوبون صالح للاستخدام'));
});
