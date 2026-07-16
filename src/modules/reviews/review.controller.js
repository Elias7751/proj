const Review = require('./review.model');
const Order = require('../orders/order.model');
const Store = require('../stores/store.model');
const Product = require('../products/product.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const sequelize = require('../../config/database');

// دالة مساعدة لتحديث التقييم المتوسط
const updateAverageRating = async (targetType, targetId) => {
    const result = await Review.findOne({
        where: { targetType, targetId, status: 'active' },
        attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
        ],
        raw: true
    });

    const avgRating = result.avgRating ? parseFloat(result.avgRating).toFixed(2) : 5.00;

    if (targetType === 'store') {
        await Store.update({ rating: avgRating }, { where: { id: targetId } });
    } else if (targetType === 'product') {
        await Product.update({ rating: avgRating }, { where: { id: targetId } });
    }
};

// @desc    إضافة تقييم
// @route   POST /api/v1/reviews
// @access  Private (Customer)
exports.createReview = asyncHandler(async (req, res, next) => {
    const { orderId, targetType, targetId, rating, comment, images } = req.body;
    const userId = req.user.id;

    // التحقق من الطلب
    const order = await Order.findByPk(orderId);
    if (!order) {
        return next(new ApiError(404, 'الطلب غير موجود'));
    }

    if (order.userId !== userId) {
        return next(new ApiError(403, 'غير مصرح لك بتقييم هذا الطلب'));
    }

    if (order.status !== 'delivered') {
        return next(new ApiError(400, 'لا يمكن تقييم الطلب إلا بعد استلامه'));
    }

    // التحقق من الهدف
    if (targetType === 'store' && order.storeId !== targetId) {
        return next(new ApiError(400, 'هذا المتجر غير مرتبط بالطلب'));
    }

    // إنشاء التقييم
    try {
        const review = await Review.create({
            userId,
            orderId,
            targetType,
            targetId,
            rating,
            comment,
            images: images || []
        });

        // تحديث التقييم المتوسط
        await updateAverageRating(targetType, targetId);

        res.status(201).json(new ApiResponse(201, review, 'تم إضافة التقييم بنجاح'));
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return next(new ApiError(400, 'لقد قمت بتقييم هذا العنصر في هذا الطلب مسبقاً'));
        }
        next(error);
    }
});

// @desc    جلب تقييمات هدف معين (متجر، منتج، مندوب)
// @route   GET /api/v1/reviews/:targetType/:targetId
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    const { targetType, targetId } = req.params;

    const reviews = await Review.findAll({
        where: { targetType, targetId, status: 'active' },
        order: [['created_at', 'DESC']],
        include: [
            { model: User, as: 'user', attributes: ['fullName', 'avatar'] }
        ]
    });

    res.status(200).json(new ApiResponse(200, reviews, 'تم جلب التقييمات بنجاح'));
});

// @desc    رد المتجر على التقييم
// @route   POST /api/v1/reviews/:id/reply
// @access  Private (Store Owner)
exports.replyToReview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
        return next(new ApiError(404, 'التقييم غير موجود'));
    }

    // التحقق من الصلاحية (يجب أن يكون صاحب المتجر)
    let storeId;
    if (review.targetType === 'store') {
        storeId = review.targetId;
    } else if (review.targetType === 'product') {
        const product = await Product.findByPk(review.targetId);
        storeId = product.storeId;
    } else {
        return next(new ApiError(400, 'لا يمكن الرد على هذا النوع من التقييمات'));
    }

    const store = await Store.findByPk(storeId);
    if (store.ownerId !== req.user.id && req.user.role !== 'admin') {
        return next(new ApiError(403, 'غير مصرح لك بالرد على هذا التقييم'));
    }

    await review.update({
        storeReply: reply,
        storeReplyDate: new Date()
    });

    res.status(200).json(new ApiResponse(200, review, 'تم إضافة الرد بنجاح'));
});
