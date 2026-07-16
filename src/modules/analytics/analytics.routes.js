const express = require('express');
const { getStoreSummary, getStoreTopProducts, getAdminSummary } = require('./analytics.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

// مسارات تحليلات المتجر
router.route('/store/summary')
    .get(getStoreSummary);

router.route('/store/top-products')
    .get(getStoreTopProducts);

// مسارات تحليلات المنصة (Admin)
router.route('/admin/summary')
    .get(authorize('admin'), getAdminSummary);

module.exports = router;
