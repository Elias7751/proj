const City = require('./city.model');
const Area = require('./area.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    جلب كل المدن
// @route   GET /api/v1/cities
// @access  Public
exports.getCities = asyncHandler(async (req, res, next) => {
    const cities = await City.findAll({
        where: { isActive: true },
        include: [{ model: Area, as: 'areas', where: { isActive: true }, required: false }]
    });
    res.status(200).json(new ApiResponse(200, cities, 'تم جلب المدن بنجاح'));
});

// @desc    إنشاء مدينة جديدة
// @route   POST /api/v1/cities
// @access  Private (Admin)
exports.createCity = asyncHandler(async (req, res, next) => {
    const { nameAr, nameEn } = req.body;

    const city = await City.create({ nameAr, nameEn });
    res.status(201).json(new ApiResponse(201, city, 'تم إنشاء المدينة بنجاح'));
});

// @desc    إضافة منطقة لمدينة
// @route   POST /api/v1/cities/:cityId/areas
// @access  Private (Admin)
exports.createArea = asyncHandler(async (req, res, next) => {
    const { cityId } = req.params;
    const { nameAr, nameEn, deliveryFee } = req.body;

    const city = await City.findByPk(cityId);
    if (!city) {
        return next(new ApiError(404, 'المدينة غير موجودة'));
    }

    const area = await Area.create({
        nameAr,
        nameEn,
        cityId,
        deliveryFee: deliveryFee || 0.00
    });

    res.status(201).json(new ApiResponse(201, area, 'تم إضافة المنطقة بنجاح'));
});
