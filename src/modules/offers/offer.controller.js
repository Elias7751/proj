const { Offer, OfferProducts } = require('./offer.model');
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
