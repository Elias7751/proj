const SubscriptionPlan = require('./plan.model');
const StoreSubscription = require('./storeSubscription.model');
const Store = require('../stores/store.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    إنشاء خطة اشتراك جديدة
// @route   POST /api/v1/subscriptions/plans
// @access  Private (Admin)
exports.createPlan = asyncHandler(async (req, res, next) => {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json(new ApiResponse(201, plan, 'تم إنشاء الخطة بنجاح'));
});

// @desc    جلب جميع الخطط
// @route   GET /api/v1/subscriptions/plans
// @access  Public (Store Owners & Admin)
exports.getPlans = asyncHandler(async (req, res, next) => {
    const plans = await SubscriptionPlan.findAll({
        where: req.user && req.user.role === 'admin' ? {} : { status: 'active' },
        order: [['price', 'ASC']]
    });
    res.status(200).json(new ApiResponse(200, plans, 'تم جلب الخطط بنجاح'));
});

// @desc    تحديث خطة
// @route   PUT /api/v1/subscriptions/plans/:id
// @access  Private (Admin)
exports.updatePlan = asyncHandler(async (req, res, next) => {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return next(new ApiError(404, 'الخطة غير موجودة'));

    await plan.update(req.body);
    res.status(200).json(new ApiResponse(200, plan, 'تم تحديث الخطة بنجاح'));
});

// @desc    حذف خطة
// @route   DELETE /api/v1/subscriptions/plans/:id
// @access  Private (Admin)
exports.deletePlan = asyncHandler(async (req, res, next) => {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return next(new ApiError(404, 'الخطة غير موجودة'));

    await plan.destroy();
    res.status(200).json(new ApiResponse(200, null, 'تم حذف الخطة بنجاح'));
});

// @desc    اشتراك متجر في خطة
// @route   POST /api/v1/subscriptions/subscribe
// @access  Private (Store Owner)
exports.subscribeToPlan = asyncHandler(async (req, res, next) => {
    const { planId } = req.body;
    const store = await Store.findOne({ where: { ownerId: req.user.id } });

    if (!store) return next(new ApiError(404, 'لم يتم العثور على متجرك'));

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan || plan.status !== 'active') return next(new ApiError(404, 'الخطة غير متاحة'));

    // حساب تاريخ الانتهاء
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await StoreSubscription.create({
        storeId: store.id,
        planId: plan.id,
        endDate,
        paymentStatus: 'pending' // يمكن تغييره إلى paid بعد الدفع
    });

    res.status(201).json(new ApiResponse(201, subscription, 'تم تسجيل الاشتراك بنجاح، بانتظار الدفع'));
});

// @desc    جلب اشتراك المتجر الحالي
// @route   GET /api/v1/subscriptions/my
// @access  Private (Store Owner)
exports.getMySubscription = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) return next(new ApiError(404, 'لم يتم العثور على متجرك'));

    const subscription = await StoreSubscription.findOne({
        where: { storeId: store.id, status: 'active' },
        include: [{ model: SubscriptionPlan, as: 'plan' }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, subscription, 'تم جلب الاشتراك بنجاح'));
});
