const express = require('express');
const {
    getAllCoupons,
    createCouponAdmin,
    updateCouponAdmin,
    deleteCouponAdmin,
    getStoreCoupons,
    createStoreCoupon,
    validateCoupon
} = require('./coupon.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// مسارات الإدارة (Admin)
router.route('/admin')
    .get(protect, authorize('admin'), getAllCoupons)
    .post(protect, authorize('admin'), createCouponAdmin);

router.route('/admin/:id')
    .put(protect, authorize('admin'), updateCouponAdmin)
    .delete(protect, authorize('admin'), deleteCouponAdmin);

// مسارات التاجر (Store Owner)
router.route('/store')
    .get(protect, authorize('store_owner'), getStoreCoupons)
    .post(protect, authorize('store_owner'), createStoreCoupon);

// مسارات عامة (Customers)
router.post('/validate', validateCoupon);

module.exports = router;
