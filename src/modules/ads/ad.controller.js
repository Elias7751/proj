const Ad = require('./ad.model');
const Store = require('../stores/store.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { Op } = require('sequelize');

// @desc    طلب إعلان جديد
// @route   POST /api/v1/ads
// @access  Private (Store Owner)
exports.createAd = asyncHandler(async (req, res, next) => {
    const { title, image, link, placement, categoryId, startDate, endDate, storeId } = req.body;

    let targetStoreId = storeId;
    if (req.user.role !== 'admin') {
        const store = await Store.findOne({ where: { ownerId: req.user.id } });
        if (!store) {
            return next(new ApiError(404, 'لم يتم العثور على متجر لك'));
        }
        targetStoreId = store.id;
    }

    // حساب التكلفة (مثال بسيط: 1000 ريال لليوم)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const cost = diffDays * 1000;

    const ad = await Ad.create({
        storeId: targetStoreId,
        title,
        image,
        link,
        placement,
        categoryId,
        startDate,
        endDate,
        cost
    });

    res.status(201).json(new ApiResponse(201, ad, 'تم تقديم طلب الإعلان بنجاح وهو قيد المراجعة'));
});

// @desc    جلب الإعلانات حسب الموضع
// @route   GET /api/v1/ads/placements/:position
// @access  Public
exports.getAdsByPlacement = asyncHandler(async (req, res, next) => {
    const { position } = req.params;
    const { categoryId } = req.query;

    const currentDate = new Date();
    const whereClause = {
        placement: position,
        status: 'active',
        startDate: { [Op.lte]: currentDate },
        endDate: { [Op.gte]: currentDate }
    };

    if (position === 'category_inside' && categoryId) {
        whereClause.categoryId = categoryId;
    }

    const ads = await Ad.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
    });

    // تسجيل مشاهدة للإعلانات التي تم جلبها
    if (ads.length > 0) {
        const adIds = ads.map(ad => ad.id);
        await Ad.increment('viewsCount', { by: 1, where: { id: adIds } });
    }

    res.status(200).json(new ApiResponse(200, ads, 'تم جلب الإعلانات بنجاح'));
});

// @desc    تسجيل نقرة على إعلان
// @route   POST /api/v1/ads/:id/click
// @access  Public
exports.registerClick = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const ad = await Ad.findByPk(id);
    if (!ad) {
        return next(new ApiError(404, 'الإعلان غير موجود'));
    }

    await ad.increment('clicksCount', { by: 1 });

    res.status(200).json(new ApiResponse(200, null, 'تم تسجيل النقرة'));
});

// @desc    موافقة على إعلان
// @route   PUT /api/v1/ads/:id/approve
// @access  Private (Admin)
exports.approveAd = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // active أو rejected

    const ad = await Ad.findByPk(id);
    if (!ad) {
        return next(new ApiError(404, 'الإعلان غير موجود'));
    }

    await ad.update({ status });

    res.status(200).json(new ApiResponse(200, ad, `تم تحديث حالة الإعلان إلى ${status}`));
});
