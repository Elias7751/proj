const User = require('../users/user.model');
const Store = require('../stores/store.model');
const Order = require('../orders/order.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// ==========================================
// الإحصائيات (Dashboard)
// ==========================================

// @desc    جلب إحصائيات لوحة القيادة
// @route   GET /api/v1/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const { Op } = require('sequelize');
    const usersCount = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
    const storesCount = await Store.count();
    const productsCount = await Product.count();
    const ordersCount = await Order.count();

    // إحصائيات إضافية (أكثر المنتجات مشاهدة)
    const topProducts = await Product.findAll({
        order: [['viewsCount', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'viewsCount', 'price', 'images']
    });

    res.status(200).json(new ApiResponse(200, {
        counts: {
            users: usersCount,
            stores: storesCount,
            products: productsCount,
            orders: ordersCount
        },
        topProducts
    }, 'تم جلب الإحصائيات بنجاح'));
});

// ==========================================
// إدارة المستخدمين
// ==========================================

// @desc    جلب جميع المستخدمين
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
    const { Op } = require('sequelize');
    const users = await User.findAll({
        where: { role: { [Op.ne]: 'admin' } },
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, users, 'تم جلب المستخدمين بنجاح'));
});

// @desc    حظر/إلغاء حظر مستخدم
// @route   PUT /api/v1/admin/users/:id/block
// @access  Private (Admin)
exports.toggleUserBlock = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
        return next(new ApiError(404, 'المستخدم غير موجود'));
    }

    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    await user.update({ status: newStatus });

    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: req.user.id,
        action: newStatus === 'blocked' ? 'حظر' : 'إلغاء حظر',
        targetType: 'user',
        targetId: user.id,
        details: `تم ${newStatus === 'blocked' ? 'حظر' : 'إلغاء حظر'} المستخدم ${user.fullName} (${user.phone})`,
        req
    });

    res.status(200).json(new ApiResponse(200, user, `تم ${newStatus === 'blocked' ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح`));
});

// @desc    تعديل بيانات مستخدم
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { fullName, email, phone, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
        return next(new ApiError(404, 'المستخدم غير موجود'));
    }

    // التحقق من عدم تكرار الهاتف أو البريد الإلكتروني
    if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
            return next(new ApiError(400, 'رقم الهاتف هذا مسجل بالفعل لمستخدم آخر'));
        }
    }

    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return next(new ApiError(400, 'البريد الإلكتروني هذا مسجل بالفعل لمستخدم آخر'));
        }
    }

    await user.update({ fullName, email, phone, status });

    res.status(200).json(new ApiResponse(200, user, 'تم تحديث بيانات المستخدم بنجاح'));
});

// @desc    حذف مستخدم
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
        return next(new ApiError(404, 'المستخدم غير موجود'));
    }

    await user.destroy();

    res.status(200).json(new ApiResponse(200, null, 'تم حذف المستخدم بنجاح'));
});

// ==========================================
// إدارة المتاجر
// ==========================================

// @desc    جلب جميع المتاجر
// @route   GET /api/v1/admin/stores
// @access  Private (Admin)
exports.getStores = asyncHandler(async (req, res, next) => {
    const stores = await Store.findAll({
        include: [{ model: User, as: 'owner', attributes: ['fullName', 'phone'] }]
    });
    res.status(200).json(new ApiResponse(200, stores, 'تم جلب المتاجر بنجاح'));
});

// @desc    جلب جميع التجار (المستخدمين بدور تاجر) مع متاجرهم
// @route   GET /api/v1/admin/merchants
// @access  Private (Admin)
exports.getMerchants = asyncHandler(async (req, res, next) => {
    const merchants = await User.findAll({
        where: { role: 'store_owner' },
        include: [{ model: Store, as: 'stores' }],
        order: [['created_at', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, merchants, 'تم جلب التجار بنجاح'));
});

// @desc    الموافقة على متجر
// @route   PUT /api/v1/admin/stores/:id/approve
// @access  Private (Admin)
exports.approveStore = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const store = await Store.findByPk(id);

    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    await store.update({ status: 'active' });

    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: req.user.id,
        action: 'قبول',
        targetType: 'store',
        targetId: store.id,
        details: `تمت الموافقة على متجر "${store.nameAr}"`,
        req
    });

    res.status(200).json(new ApiResponse(200, store, 'تم الموافقة على المتجر بنجاح'));
});

// @desc    رفض متجر
// @route   PUT /api/v1/admin/stores/:id/reject
// @access  Private (Admin)
exports.rejectStore = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const store = await Store.findByPk(id);

    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    await store.update({ status: 'rejected' });

    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: req.user.id,
        action: 'رفض',
        targetType: 'store',
        targetId: store.id,
        details: `تم رفض متجر "${store.nameAr}"`,
        req
    });

    res.status(200).json(new ApiResponse(200, store, 'تم رفض المتجر بنجاح'));
});

// @desc    تمييز/إلغاء تمييز متجر
// @route   PUT /api/v1/admin/stores/:id/featured
// @access  Private (Admin)
exports.toggleStoreFeatured = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const store = await Store.findByPk(id);

    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    const newFeatured = !store.isFeatured;
    await store.update({ isFeatured: newFeatured });

    const { logAction } = require('../auditLogs/auditLog.service');
    await logAction({
        userId: req.user.id,
        action: newFeatured ? 'تمييز' : 'إلغاء تمييز',
        targetType: 'store',
        targetId: store.id,
        details: `تم ${newFeatured ? 'تمييز' : 'إلغاء تمييز'} متجر "${store.nameAr}"`,
        req
    });

    res.status(200).json(new ApiResponse(200, store, `تم ${newFeatured ? 'تمييز' : 'إلغاء تمييز'} المتجر بنجاح`));
});

// ==========================================
// إدارة المنتجات
// ==========================================

// @desc    جلب جميع المنتجات
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
exports.getAllProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.findAll({
        include: [
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn'] },
            { model: require('../categories/category.model'), as: 'category', attributes: ['nameAr', 'nameEn'] }
        ],
        order: [['created_at', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, products, 'تم جلب المنتجات بنجاح'));
});

// @desc    تغيير حالة المنتج (إخفاء/إظهار)
// @route   PUT /api/v1/admin/products/:id/status
// @access  Private (Admin)
exports.toggleProductStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    await product.update({ status: newStatus });

    res.status(200).json(new ApiResponse(200, product, `تم ${newStatus === 'active' ? 'إظهار' : 'إخفاء'} المنتج بنجاح`));
});

// @desc    تمييز/إلغاء تمييز منتج
// @route   PUT /api/v1/admin/products/:id/featured
// @access  Private (Admin)
exports.toggleProductFeatured = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
        return next(new ApiError(404, 'المنتج غير موجود'));
    }

    const newFeatured = !product.isFeatured;
    await product.update({ isFeatured: newFeatured });

    res.status(200).json(new ApiResponse(200, product, `تم ${newFeatured ? 'تمييز' : 'إلغاء تمييز'} المنتج بنجاح`));
});

// ==========================================
// إدارة الطلبات
// ==========================================

// @desc    جلب جميع الطلبات
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
exports.getAllOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.findAll({
        include: [
            { model: User, as: 'user', attributes: ['fullName', 'phone'] },
            { model: Store, as: 'store', attributes: ['nameAr', 'nameEn'] }
        ],
        order: [['created_at', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, orders, 'تم جلب الطلبات بنجاح'));
});

// @desc    تحديث حالة الطلب
// @route   PUT /api/v1/admin/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
        return next(new ApiError(404, 'الطلب غير موجود'));
    }

    await order.update({ status });

    res.status(200).json(new ApiResponse(200, order, 'تم تحديث حالة الطلب بنجاح'));
});

// ==========================================
// إدارة المشرفين (Admins)
// ==========================================

// @desc    جلب جميع المشرفين
// @route   GET /api/v1/admin/admins
// @access  Private (Admin)
exports.getAdmins = asyncHandler(async (req, res, next) => {
    const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, admins, 'تم جلب المشرفين بنجاح'));
});

// @desc    إنشاء مشرف جديد
// @route   POST /api/v1/admin/admins
// @access  Private (Admin)
exports.createAdmin = asyncHandler(async (req, res, next) => {
    const { fullName, email, phone, password } = req.body;

    // التحقق من عدم تكرار الهاتف
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
        return next(new ApiError(400, 'رقم الهاتف هذا مسجل بالفعل'));
    }

    if (email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return next(new ApiError(400, 'البريد الإلكتروني هذا مسجل بالفعل'));
        }
    }

    const admin = await User.create({
        fullName,
        email,
        phone,
        password,
        role: 'admin',
        status: 'active'
    });

    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.status(201).json(new ApiResponse(201, adminResponse, 'تم إنشاء المشرف بنجاح'));
});

// @desc    تعديل بيانات مشرف
// @route   PUT /api/v1/admin/admins/:id
// @access  Private (Admin)
exports.updateAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { fullName, email, phone, status, password } = req.body;

    const admin = await User.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
        return next(new ApiError(404, 'المشرف غير موجود'));
    }

    if (phone && phone !== admin.phone) {
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
            return next(new ApiError(400, 'رقم الهاتف هذا مسجل بالفعل لمستخدم آخر'));
        }
    }

    if (email && email !== admin.email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return next(new ApiError(400, 'البريد الإلكتروني هذا مسجل بالفعل لمستخدم آخر'));
        }
    }

    const updateData = { fullName, email, phone, status };
    if (password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
    }

    await admin.update(updateData);

    res.status(200).json(new ApiResponse(200, admin, 'تم تحديث بيانات المشرف بنجاح'));
});

// @desc    حذف مشرف
// @route   DELETE /api/v1/admin/admins/:id
// @access  Private (Admin)
exports.deleteAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // منع الأدمن من حذف نفسه
    if (id === req.user.id) {
        return next(new ApiError(400, 'لا يمكنك حذف حسابك الشخصي'));
    }

    const admin = await User.findOne({ where: { id, role: 'admin' } });
    if (!admin) {
        return next(new ApiError(404, 'المشرف غير موجود'));
    }

    await admin.destroy();

    res.status(200).json(new ApiResponse(200, null, 'تم حذف المشرف بنجاح'));
});

// ==========================================
// إدارة الإعلانات والبنرات
// ==========================================

// @desc    جلب جميع الإعلانات
// @route   GET /api/v1/admin/ads
// @access  Private (Admin)
exports.getAllAds = asyncHandler(async (req, res, next) => {
    const Ad = require('../ads/ad.model');
    const ads = await Ad.findAll({
        include: [{ model: Store, as: 'store', attributes: ['nameAr', 'nameEn'] }],
        order: [['createdAt', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, ads, 'تم جلب الإعلانات بنجاح'));
});

// @desc    إنشاء إعلان جديد (Admin)
// @route   POST /api/v1/admin/ads
// @access  Private (Admin)
exports.createAdminAd = asyncHandler(async (req, res, next) => {
    const Ad = require('../ads/ad.model');
    const { title, image, link, placement, categoryId, startDate, endDate, storeId, cost } = req.body;

    const ad = await Ad.create({
        storeId,
        title,
        image,
        link,
        placement,
        categoryId,
        startDate,
        endDate,
        cost: cost || 0.00,
        status: 'active'
    });

    res.status(201).json(new ApiResponse(201, ad, 'تم إنشاء الإعلان بنجاح'));
});

// @desc    تعديل إعلان
// @route   PUT /api/v1/admin/ads/:id
// @access  Private (Admin)
exports.updateAdminAd = asyncHandler(async (req, res, next) => {
    const Ad = require('../ads/ad.model');
    const { id } = req.params;
    const ad = await Ad.findByPk(id);

    if (!ad) {
        return next(new ApiError(404, 'الإعلان غير موجود'));
    }

    await ad.update(req.body);
    res.status(200).json(new ApiResponse(200, ad, 'تم تحديث الإعلان بنجاح'));
});

// @desc    حذف إعلان
// @route   DELETE /api/v1/admin/ads/:id
// @access  Private (Admin)
exports.deleteAdminAd = asyncHandler(async (req, res, next) => {
    const Ad = require('../ads/ad.model');
    const { id } = req.params;
    const ad = await Ad.findByPk(id);

    if (!ad) {
        return next(new ApiError(404, 'الإعلان غير موجود'));
    }

    await ad.destroy();
    res.status(200).json(new ApiResponse(200, null, 'تم حذف الإعلان بنجاح'));
});
