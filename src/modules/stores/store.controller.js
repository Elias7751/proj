const Store = require('./store.model');
const User = require('../users/user.model');
const Category = require('../categories/category.model');
const City = require('../cities/city.model');
const Area = require('../cities/area.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// دالة مساعدة لتحويل النص إلى slug
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0621-\u064A-]+/g, '')
        .replace(/--+/g, '-');
};

// @desc    طلب إنشاء متجر جديد
// @route   POST /api/v1/stores
// @access  Private (Store Owner)
exports.createStore = asyncHandler(async (req, res, next) => {
    const {
        nameAr,
        nameEn,
        description,
        whatsappNumber,
        latitude,
        longitude,
        streetAddress,
        workingHours,
        deliveryPolicy,
        minOrderAmount,
        categoryId,
        cityId,
        areaId
    } = req.body;

    // التحقق من أن المستخدم هو صاحب متجر (store_owner) أو مسؤول (admin)
    if (req.user.role !== 'store_owner' && req.user.role !== 'admin') {
        return next(new ApiError(403, 'يجب أن يكون حسابك بصلاحية صاحب متجر لإنشاء متجر'));
    }

    const slug = slugify(nameEn);

    // التحقق من عدم تكرار الرابط المخصص (slug)
    const existingStore = await Store.findOne({ where: { slug } });
    if (existingStore) {
        return next(new ApiError(400, 'اسم المتجر باللغة الإنجليزية مستخدم بالفعل، يرجى اختيار اسم آخر'));
    }

    // التحقق من وجود التصنيف
    let category;
    if (categoryId) {
        category = await Category.findByPk(categoryId);
    } else {
        // جلب أول تصنيف متاح كافتراضي
        category = await Category.findOne();
        if (!category) {
            // إنشاء تصنيف افتراضي إذا لم يوجد أي تصنيف
            category = await Category.create({
                nameAr: 'عام',
                nameEn: 'General',
                slug: 'general',
                icon: 'store'
            });
        }
    }

    if (!category) {
        return next(new ApiError(404, 'التصنيف المحدد غير موجود'));
    }

    if (cityId) {
        const city = await City.findByPk(cityId);
        if (!city) {
            return next(new ApiError(404, 'المدينة المحددة غير موجودة'));
        }
    }

    if (areaId) {
        const area = await Area.findByPk(areaId);
        if (!area) {
            return next(new ApiError(404, 'المنطقة المحددة غير موجودة'));
        }
    }

    const store = await Store.create({
        nameAr,
        nameEn,
        slug,
        description,
        whatsappNumber,
        latitude,
        longitude,
        streetAddress,
        workingHours,
        deliveryPolicy,
        minOrderAmount: minOrderAmount || 0.00,
        ownerId: req.user.id,
        categoryId: category.id,
        cityId,
        areaId,
        status: req.user.role === 'admin' ? 'active' : 'pending' // المسؤول يتم تفعيل متجره فوراً، وصاحب المتجر ينتظر الموافقة
    });

    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: req.user.id,
        action: 'إنشاء متجر',
        targetType: 'store',
        targetId: store.id,
        details: `تم إنشاء متجر جديد باسم "${store.nameAr}" (حالة: ${store.status})`,
        req
    });

    res.status(201).json(
        new ApiResponse(201, store, req.user.role === 'admin' ? 'تم إنشاء وتفعيل المتجر بنجاح' : 'تم تقديم طلب إنشاء المتجر بنجاح وبانتظار مراجعة الإدارة')
    );
});

// @desc    جلب كل المتاجر النشطة (مع فلترة وبحث)
// @route   GET /api/v1/stores
// @access  Public
exports.getStores = asyncHandler(async (req, res, next) => {
    const { categoryId, cityId, search, isFeatured } = req.query;
    const { Op } = require('sequelize');

    const whereClause = { status: 'active' };

    if (categoryId) {
        whereClause.categoryId = categoryId;
    }
    if (isFeatured) {
        whereClause.isFeatured = isFeatured === 'true';
    }

    if (cityId) {
        whereClause.cityId = cityId;
    }

    if (search) {
        whereClause[Op.or] = [
            { nameAr: { [Op.like]: `%${search}%` } },
            { nameEn: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    const stores = await Store.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        include: [
            { model: Category, as: 'category', attributes: ['nameAr', 'nameEn'] },
            { model: City, as: 'city', attributes: ['nameAr', 'nameEn'] },
            { model: Area, as: 'area', attributes: ['nameAr', 'nameEn', 'deliveryFee'] }
        ]
    });

    res.status(200).json(new ApiResponse(200, stores, 'تم جلب المتاجر بنجاح'));
});

// @desc    جلب متجر بالرابط المخصص (slug)
// @route   GET /api/v1/stores/:slug
// @access  Public
exports.getStoreBySlug = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;

    const store = await Store.findOne({
        where: { slug, status: 'active' },
        include: [
            { model: Category, as: 'category', attributes: ['nameAr', 'nameEn'] },
            { model: City, as: 'city', attributes: ['nameAr', 'nameEn'] },
            { model: Area, as: 'area', attributes: ['nameAr', 'nameEn', 'deliveryFee'] },
            { model: User, as: 'owner', attributes: ['fullName', 'phone'] }
        ]
    });

    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود أو غير مفعل حالياً'));
    }

    res.status(200).json(new ApiResponse(200, store, 'تم جلب بيانات المتجر بنجاح'));
});

// @desc    تعديل بيانات المتجر
// @route   PUT /api/v1/stores/:id
// @access  Private (Store Owner / Admin)
exports.updateStore = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const store = await Store.findByPk(id);

    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    // التحقق من الصلاحية (يجب أن يكون المالك أو المسؤول)
    if (store.ownerId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بتعديل بيانات هذا المتجر'));
    }

    const updatedStore = await store.update(req.body);
    res.status(200).json(new ApiResponse(200, updatedStore, 'تم تحديث بيانات المتجر بنجاح'));
});

// @desc    جلب متجر التاجر المسجل حالياً
// @route   GET /api/v1/stores/my-store
// @access  Private (Store Owner)
exports.getMyStore = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({
        where: { ownerId: req.user.id },
        include: [
            { model: Category, as: 'category', attributes: ['nameAr', 'nameEn'] },
            { model: City, as: 'city', attributes: ['nameAr', 'nameEn'] },
            { model: Area, as: 'area', attributes: ['nameAr', 'nameEn', 'deliveryFee'] }
        ]
    });

    if (!store) {
        return next(new ApiError(404, 'لم يتم العثور على متجر مرتبط بحسابك'));
    }

    res.status(200).json(new ApiResponse(200, store, 'تم جلب بيانات متجرك بنجاح'));
});
