const fs = require('fs');
const code = `
// ==========================================
// الإدارة (Admin)
// ==========================================

// @desc    جلب جميع التقييمات (للإدارة)
// @route   GET /api/v1/reviews/admin/all
// @access  Private (Admin)
exports.getAllReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.findAll({
        include: [
            { model: User, as: 'user', attributes: ['fullName', 'email'] },
            { model: Order, as: 'order', attributes: ['orderNumber'] }
        ],
        order: [['created_at', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, reviews, 'تم جلب جميع التقييمات بنجاح'));
});

// @desc    تحديث حالة التقييم (إخفاء/إظهار)
// @route   PUT /api/v1/reviews/admin/:id/status
// @access  Private (Admin)
exports.updateReviewStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
        return next(new ApiError(404, 'التقييم غير موجود'));
    }

    await review.update({ status });
    
    // تحديث التقييم المتوسط للمتجر أو المنتج بعد تغيير الحالة
    await updateAverageRating(review.targetType, review.targetId);

    res.status(200).json(new ApiResponse(200, review, 'تم تحديث حالة التقييم بنجاح'));
});
`;
fs.appendFileSync('src/modules/reviews/review.controller.js', code);
console.log('Appended admin review functions');
