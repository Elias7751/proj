const Product = require('./product.model');
const ProductVariant = require('./variant.model');
const Store = require('../stores/store.model');
const Category = require('../categories/category.model');
const StoreSubscription = require('../subscriptions/storeSubscription.model');
const SubscriptionPlan = require('../subscriptions/plan.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    إضافة منتج جديد
// @route   POST /api/v1/stores/:storeId/products
// @access  Private (Store Owner)
exports.createProduct = asyncHandler(async (req, res, next) => {
    const { storeId } = req.params;
    const {
        name,
        description,
        price,
        discountPrice,
        images,
        stock,
        unit,
        weight,
        categoryId,
        isFeatured,
        variants // مصفوفة تحتوي على الخصائص المتغيرة إن وجدت
    } = req.body;

    let store;
    if (storeId) {
        store = await Store.findByPk(storeId);
    } else {
        store = await Store.findOne({ where: { ownerId: req.user.id } });
    }

    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    if (store.ownerId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بإضافة منتجات لهذا المتجر'));
    }

    // التحقق من وجود التصنيف
    let category;
    if (categoryId) {
        category = await Category.findByPk(categoryId);
    } else {
        category = await Category.findOne();
        if (!category) {
            category = await Category.create({
                nameAr: 'عام',
                nameEn: 'General',
                slug: 'general',
                icon: 'category'
            });
        }
    }

    if (!category) {
        return next(new ApiError(404, 'التصنيف المحدد غير موجود'));
    }

    // التحقق من باقة الاشتراك والحد الأقصى للمنتجات
    const { Op } = require('sequelize');
    const activeSubscription = await StoreSubscription.findOne({
        where: {
            storeId: store.id,
            status: 'active',
            endDate: { [Op.gt]: new Date() }
        },
        include: [{ model: SubscriptionPlan, as: 'plan' }]
    });

    let maxProducts = 20; // الباقة المجانية الافتراضية
    if (activeSubscription && activeSubscription.plan) {
        maxProducts = activeSubscription.plan.maxProducts;
    }

    if (maxProducts !== -1) {
        const currentProductsCount = await Product.count({ where: { storeId: store.id } });
        if (currentProductsCount >= maxProducts) {
            return next(new ApiError(403, `لقد وصلت للحد الأقصى للمنتجات (${maxProducts}). يرجى ترقية باقتك لإضافة المزيد.`));
        }
    }

    // إنشاء المنتج
    const product = await Product.create({
        name,
        description,
        price,
        discountPrice,
        images: images || [],
        stock: stock !== undefined ? stock : 999,
        unit: unit || 'قطعة',
        weight,
        isFeatured: isFeatured || false,
        storeId: store.id,
        categoryId: category.id
    });

    // إضافة الخصائص المتغيرة (Variants) إن وجدت
    if (variants && Array.isArray(variants) && variants.length > 0) {
        const variantsData = variants.map(v => ({
            productId: product.id,
            attributeName: v.attributeName,
            attributeValue: v.attributeValue,
            additionalPrice: v.additionalPrice || 0.00,
            stock: v.stock !== undefined ? v.stock : 999
        }));
        await ProductVariant.bulkCreate(variantsData);
    }

    // جلب المنتج مع الخصائص المتغيرة بعد الإنشاء
    const productWithVariants = await Product.findByPk(product.id, {
        include: [{ model: ProductVariant, as: 'variants' }]
    });

    res.status(201).json(new ApiResponse(201, productWithVariants, 'تم إضافة المنتج بنجاح'));
});

// @desc    جلب كل المنتجات (مع بحث وفلترة)
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    const { storeId, categoryId, search, minPrice, maxPrice, sort, isFeatured } = req.query;
    const { Op } = require('sequelize');

    const whereClause = { status: 'active' };

    if (storeId) whereClause.storeId = storeId;
    if (categoryId) whereClause.categoryId = categoryId;
    if (isFeatured) whereClause.isFeatured = isFeatured === 'true';

    if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    if (search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    // الترتيب
    let orderClause = [['created_at', 'DESC']]; // الافتراضي: الأحدث أولاً
    if (sort) {
        if (sort === 'price_asc') orderClause = [['price', 'ASC']];
        else if (sort === 'price_desc') orderClause = [['price', 'DESC']];
        else if (sort === 'sales') orderClause = [['salesCount', 'DESC']];
        else if (sort === 'rating') orderClause = [['rating', 'DESC']];
    }

    const products = await Product.findAll({
        where: whereClause,
        order: orderClause,
        include: [
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn', 'slug', 'whatsappNumber'] },
            { model: Category, as: 'category', attributes: ['nameAr', 'nameEn'] },
            { model: ProductVariant, as: 'variants' }
        ]
    });

    res.status(200).json(new ApiResponse(200, products, 'تم جلب المنتجات بنجاح'));
});

// @desc    جلب تفاصيل منتج بالمعرف (ID)
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
        include: [
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn', 'slug', 'whatsappNumber'] },
            { model: Category, as: 'category', attributes: ['nameAr', 'nameEn'] },
            { model: ProductVariant, as: 'variants' }
        ]
    });

    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    // زيادة عدد المشاهدات
    await product.increment('viewsCount');

    // إعادة جلب المنتج لتحديث الرقم في الاستجابة (اختياري، لكن يفضل)
    await product.reload();

    res.status(200).json(new ApiResponse(200, product, 'تم جلب تفاصيل المنتج بنجاح'));
});

// @desc    تعديل منتج
// @route   PUT /api/v1/products/:id
// @access  Private (Store Owner)
exports.updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
        include: [{ model: Store, as: 'store' }]
    });

    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    // التحقق من الصلاحية
    if (product.store.ownerId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بتعديل هذا المنتج'));
    }

    const { variants } = req.body;
    const updatedProduct = await product.update(req.body);

    if (variants && Array.isArray(variants)) {
        await ProductVariant.destroy({ where: { productId: product.id } });
        if (variants.length > 0) {
            const variantsData = variants.map(v => ({
                productId: product.id,
                attributeName: v.attributeName,
                attributeValue: v.attributeValue,
                additionalPrice: v.additionalPrice || 0.00,
                stock: v.stock !== undefined ? v.stock : 999
            }));
            await ProductVariant.bulkCreate(variantsData);
        }
    }

    // Get product with updated variants
    const productWithVariants = await Product.findByPk(product.id, {
        include: [{ model: ProductVariant, as: 'variants' }]
    });

    res.status(200).json(new ApiResponse(200, productWithVariants, 'تم تحديث المنتج بنجاح'));
});

// @desc    حذف منتج
// @route   DELETE /api/v1/products/:id
// @access  Private (Store Owner)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
        include: [{ model: Store, as: 'store' }]
    });

    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    // التحقق من الصلاحية
    if (product.store.ownerId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بحذف هذا المنتج'));
    }

    await product.destroy();
    res.status(200).json(new ApiResponse(200, null, 'تم حذف المنتج بنجاح'));
});

// @desc    جلب منتجات المتجر الخاص بالتاجر المسجل
// @route   GET /api/v1/products/store/my
// @access  Private (Store Owner)
exports.getMyStoreProducts = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'لم يتم العثور على متجر مرتبط بحسابك'));
    }

    const products = await Product.findAll({
        where: { storeId: store.id },
        order: [['created_at', 'DESC']],
        include: [
            { model: Category, as: 'category', attributes: ['nameAr', 'nameEn'] },
            { model: ProductVariant, as: 'variants' }
        ]
    });

    res.status(200).json(new ApiResponse(200, products, 'تم جلب منتجات متجرك بنجاح'));
});
