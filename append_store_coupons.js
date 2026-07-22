const fs = require('fs');
const code = `
// @desc    تحديث كوبون للمتجر
// @route   PUT /api/v1/coupons/store/:id
// @access  Private (Store Owner)
exports.updateStoreCoupon = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    const coupon = await Coupon.findOne({ where: { id: req.params.id, storeId: store.id } });
    if (!coupon) {
        return next(new ApiError(404, 'الكوبون غير موجود أو لا تملك صلاحية تعديله'));
    }

    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, startDate, endDate, usageLimit, isActive } = req.body;

    if (code && code.toUpperCase().trim() !== coupon.code) {
        const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase().trim() } });
        if (existingCoupon) {
            return next(new ApiError(400, 'رمز الكوبون مستخدم مسبقاً'));
        }
    }

    await coupon.update({
        code: code ? code.toUpperCase().trim() : undefined,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        isActive
    });

    res.status(200).json(new ApiResponse(200, coupon, 'تم تحديث الكوبون بنجاح'));
});

// @desc    حذف كوبون للمتجر
// @route   DELETE /api/v1/coupons/store/:id
// @access  Private (Store Owner)
exports.deleteStoreCoupon = asyncHandler(async (req, res, next) => {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) {
        return next(new ApiError(404, 'المتجر غير موجود'));
    }

    const coupon = await Coupon.findOne({ where: { id: req.params.id, storeId: store.id } });
    if (!coupon) {
        return next(new ApiError(404, 'الكوبون غير موجود أو لا تملك صلاحية حذفه'));
    }

    await coupon.destroy();
    res.status(200).json(new ApiResponse(200, null, 'تم حذف الكوبون بنجاح'));
});
`;
const fileContent = fs.readFileSync('src/modules/coupons/coupon.controller.js', 'utf8');
const splitIndex = fileContent.indexOf('// ==========================================\r\n// العملاء (Customers)');
const splitIndex2 = fileContent.indexOf('// ==========================================\n// العملاء (Customers)');
const targetIndex = splitIndex !== -1 ? splitIndex : splitIndex2;

if (targetIndex !== -1) {
    const newContent = fileContent.substring(0, targetIndex) + code + '\n' + fileContent.substring(targetIndex);
    fs.writeFileSync('src/modules/coupons/coupon.controller.js', newContent);
    console.log('Added update and delete store coupon functions');
}
