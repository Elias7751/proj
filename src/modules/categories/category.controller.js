const Category = require('./category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// دالة مساعدة لتحويل النص إلى slug متوافق مع الروابط
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // استبدال المسافات بـ -
        .replace(/[^\w\u0621-\u064A-]+/g, '') // السماح بالحروف العربية والإنجليزية والـ - فقط
        .replace(/--+/g, '-');          // منع تكرار الـ -
};

// @desc    جلب كل التصنيفات
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.findAll({
        where: { isActive: true, parentId: null }, // جلب التصنيفات الرئيسية فقط
        include: [{ model: Category, as: 'subcategories', where: { isActive: true }, required: false }],
        order: [['sortOrder', 'ASC']]
    });
    res.status(200).json(new ApiResponse(200, categories, 'تم جلب التصنيفات بنجاح'));
});

// @desc    إنشاء تصنيف جديد
// @route   POST /api/v1/categories
// @access  Private (Admin)
exports.createCategory = asyncHandler(async (req, res, next) => {
    const { nameAr, nameEn, parentId, sortOrder, image } = req.body;

    const slug = slugify(nameEn);

    // التحقق من عدم تكرار الـ slug
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
        return next(new ApiError(400, 'التصنيف موجود بالفعل (الاسم الإنجليزي مكرر)'));
    }

    // إذا كان هناك parentId، نتحقق من وجود التصنيف الأب
    if (parentId) {
        const parent = await Category.findByPk(parentId);
        if (!parent) {
            return next(new ApiError(404, 'التصنيف الرئيسي المحدد غير موجود'));
        }
    }

    const category = await Category.create({
        nameAr,
        nameEn,
        slug,
        parentId,
        sortOrder: sortOrder || 0,
        image
    });

    res.status(201).json(new ApiResponse(201, category, 'تم إنشاء التصنيف بنجاح'));
});
