const { Offer, OfferProducts } = require('./offer.model');
const Coupon = require('./coupon.model');
const Store = require('../stores/store.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { Op } = require('sequelize');

// ==========================================
// العروض (Offers)
// ==========================================

// @desc    إنشاء عرض جديد
// @route   POST /api/v1/offers
// @access  Private (Store Owner)
exports.createOffer = asyncHandler(async (req, res, next) => {
    const { title, description, image, discountType, discountValue, startDate, endDate, productIds } = req.body;
    const storeId = req.body.storeId || req.user.storeId; // نفترض أن المتجر مرتبط بالمستخدم

    // التحقق من الصلاحية
    const store = await Store.findByPk(storeId);
    if (!store || (store.ownerId !== req.user.id && req.user.role !== 'admin')) {
        return next(new ApiError(403, 'غير مصرح لك بإنشاء عرض لهذا المتجر'));
    }

    const offer = await Offer.create({
        storeId,
        title,
        description,
        image,
        discountType,
        discountValue,
        startDate,
        endDate
    });

    // ربط المنتجات بالعرض إذا تم تحديدها
    if (productIds && productIds.length > 0) {
        await offer.setProducts(productIds);
    }

    res.status(201).json(new ApiResponse(201, offer, 'تم إنشاء العرض بنجاح'));
});

// @desc    جلب العروض النشطة
// @route   GET /api/v1/offers
// @access  Public
exports.getActiveOffers = asyncHandler(async (req, res, next) => {
    const currentDate = new Date();

    const offers = await Offer.findAll({
        where: {
            status: 'active',
            startDate: { [Op.lte]: currentDate },
            endDate: { [Op.gte]: currentDate }
        },
        include: [
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn', 'logo'] },
            { model: Product, as: 'products', attributes: ['id', 'name', 'price', 'images'] }
        ]
    });

    res.status(200).json(new ApiResponse(200, offers, 'تم جلب العروض بنجاح'));
});

// ==========================================
// الكوبونات (Coupons)
// ==========================================

// @desc    إنشاء كوبون جديد
// @route   POST /api/v1/coupons
// @access  Private (Store Owner / Admin)
exports.createCoupon = asyncHandler(async (req, res, next) => {
    const { code, discountType, discountValue, maxDiscount, minOrderAmount, startDate, endDate, usageLimit, storeId } = req.body;

    // إذا كان المستخدم ليس أدمن، يجب أن يكون الكوبون لمتجره فقط
    let targetStoreId = storeId;
    if (req.user.role !== 'admin') {
        const store = await Store.findOne({ where: { ownerId: req.user.id } });
        if (!store) {
            return next(new ApiError(404, 'لم يتم العثور على متجر لك'));
        }
        targetStoreId = store.id;
    }

    const existingCoupon = await Coupon.findOne({ where: { code } });
    if (existingCoupon) {
        return next(new ApiError(400, 'كود الكوبون موجود مسبقاً'));
    }

    const coupon = await Coupon.create({
        storeId: targetStoreId,
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxDiscount,
        minOrderAmount,
        startDate,
        endDate,
        usageLimit
    });

    res.status(201).json(new ApiResponse(201, coupon, 'تم إنشاء الكوبون بنجاح'));
});

// @desc    التحقق من صلاحية الكوبون وحساب الخصم
// @route   POST /api/v1/coupons/validate
// @access  Private (Customer)
exports.validateCoupon = asyncHandler(async (req, res, next) => {
    const { code, orderAmount, storeId } = req.body;

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

    if (!coupon) {
        return next(new ApiError(404, 'كود الكوبون غير صحيح'));
    }

    if (coupon.status !== 'active') {
        return next(new ApiError(400, 'هذا الكوبون غير مفعل'));
    }

    const currentDate = new Date();
    if (currentDate < coupon.startDate || currentDate > coupon.endDate) {
        return next(new ApiError(400, 'هذا الكوبون منتهي الصلاحية أو لم يبدأ بعد'));
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return next(new ApiError(400, 'تم الوصول للحد الأقصى لاستخدام هذا الكوبون'));
    }

    if (parseFloat(orderAmount) < parseFloat(coupon.minOrderAmount)) {
        return next(new ApiError(400, `الحد الأدنى للطلب لاستخدام هذا الكوبون هو ${coupon.minOrderAmount}`));
    }

    // التحقق من أن الكوبون يتبع للمتجر الحالي (إلا إذا كان كوبون عام من المنصة)
    if (coupon.storeId && coupon.storeId !== storeId) {
        return next(new ApiError(400, 'هذا الكوبون غير صالح لهذا المتجر'));
    }

    // حساب الخصم
    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
        discountAmount = parseFloat(coupon.discountValue);
    } else if (coupon.discountType === 'percentage') {
        discountAmount = (parseFloat(orderAmount) * parseFloat(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountAmount > parseFloat(coupon.maxDiscount)) {
            discountAmount = parseFloat(coupon.maxDiscount);
        }
    }

    res.status(200).json(new ApiResponse(200, {
        couponId: coupon.id,
        code: coupon.code,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: (parseFloat(orderAmount) - discountAmount).toFixed(2)
    }, 'الكوبون صالح'));
});

// @desc    جلب عروض المتجر الخاص بالتاجر
// @route   GET /api/v1/offers/my-offers
// @access  Private (Store Owner)
exports.getMyOffers = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'لم يتم العثور على متجر لك'));
    }

    const offers = await Offer.findAll({
        where: { storeId: store.id },
        include: [{ model: Product, as: 'products', attributes: ['id', 'name', 'price', 'images'] }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, offers, 'تم جلب العروض بنجاح'));
});

// @desc    تحديث عرض
// @route   PUT /api/v1/offers/:id
// @access  Private (Store Owner)
exports.updateOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) {
        return next(new ApiError(404, 'العرض غير موجود'));
    }

    const store = await Store.findByPk(offer.storeId);
    if (!store || (store.ownerId !== req.user.id && req.user.role !== 'admin')) {
        return next(new ApiError(403, 'غير مصرح لك بتعديل هذا العرض'));
    }

    const { title, description, image, discountType, discountValue, startDate, endDate, status, productIds } = req.body;

    await offer.update({
        title,
        description,
        image,
        discountType,
        discountValue,
        startDate,
        endDate,
        status
    });

    if (productIds) {
        await offer.setProducts(productIds);
    }

    res.status(200).json(new ApiResponse(200, offer, 'تم تحديث العرض بنجاح'));
});

// @desc    حذف عرض
// @route   DELETE /api/v1/offers/:id
// @access  Private (Store Owner)
exports.deleteOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) {
        return next(new ApiError(404, 'العرض غير موجود'));
    }

    const store = await Store.findByPk(offer.storeId);
    if (!store || (store.ownerId !== req.user.id && req.user.role !== 'admin')) {
        return next(new ApiError(403, 'غير مصرح لك بحذف هذا العرض'));
    }

    await offer.destroy();
    res.status(200).json(new ApiResponse(200, null, 'تم حذف العرض بنجاح'));
});

// @desc    جلب كوبونات المتجر الخاص بالتاجر
// @route   GET /api/v1/offers/coupons/my-coupons
// @access  Private (Store Owner)
exports.getMyCoupons = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'لم يتم العثور على متجر لك'));
    }

    const coupons = await Coupon.findAll({
        where: { storeId: store.id },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, coupons, 'تم جلب الكوبونات بنجاح'));
});

// @desc    تحديث كوبون
// @route   PUT /api/v1/offers/coupons/:id
// @access  Private (Store Owner)
exports.updateCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
        return next(new ApiError(404, 'الكوبون غير موجود'));
    }

    const store = await Store.findByPk(coupon.storeId);
    if (!store || (store.ownerId !== req.user.id && req.user.role !== 'admin')) {
        return next(new ApiError(403, 'غير مصرح لك بتعديل هذا الكوبون'));
    }

    const { code, discountType, discountValue, maxDiscount, minOrderAmount, startDate, endDate, usageLimit, status } = req.body;

    if (code && code.toUpperCase() !== coupon.code) {
        const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
        if (existingCoupon) {
            return next(new ApiError(400, 'كود الكوبون موجود مسبقاً'));
        }
    }

    await coupon.update({
        code: code ? code.toUpperCase() : undefined,
        discountType,
        discountValue,
        maxDiscount,
        minOrderAmount,
        startDate,
        endDate,
        usageLimit,
        status
    });

    res.status(200).json(new ApiResponse(200, coupon, 'تم تحديث الكوبون بنجاح'));
});

// @desc    حذف كوبون
// @route   DELETE /api/v1/offers/coupons/:id
// @access  Private (Store Owner)
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
        return next(new ApiError(404, 'الكوبون غير موجود'));
    }

    const store = await Store.findByPk(coupon.storeId);
    if (!store || (store.ownerId !== req.user.id && req.user.role !== 'admin')) {
        return next(new ApiError(403, 'غير مصرح لك بحذف هذا الكوبون'));
    }

    await coupon.destroy();
    res.status(200).json(new ApiResponse(200, null, 'تم حذف الكوبون بنجاح'));
});
