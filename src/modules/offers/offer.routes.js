const express = require('express');
const {
    createOffer,
    getActiveOffers,
    getMyOffers,
    updateOffer,
    deleteOffer,
    createCoupon,
    validateCoupon,
    getMyCoupons,
    updateCoupon,
    deleteCoupon
} = require('./offer.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

// مسارات العروض
router.get('/my-offers', protect, getMyOffers);

router.route('/')
    .get(getActiveOffers)
    .post(protect, createOffer);

router.route('/:id')
    .put(protect, updateOffer)
    .delete(protect, deleteOffer);

// مسارات الكوبونات
router.get('/coupons/my-coupons', protect, getMyCoupons);

router.route('/coupons')
    .post(protect, createCoupon);

router.route('/coupons/validate')
    .post(protect, validateCoupon);

router.route('/coupons/:id')
    .put(protect, updateCoupon)
    .delete(protect, deleteCoupon);

module.exports = router;
