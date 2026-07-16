const express = require('express');
const { createOffer, getActiveOffers, createCoupon, validateCoupon } = require('./offer.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

// مسارات العروض
router.route('/')
    .get(getActiveOffers)
    .post(protect, createOffer);

// مسارات الكوبونات
router.route('/coupons')
    .post(protect, createCoupon);

router.route('/coupons/validate')
    .post(protect, validateCoupon);

module.exports = router;
