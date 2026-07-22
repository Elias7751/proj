const express = require('express');
const { createReview, getReviews, replyToReview, getAllReviews, updateReviewStatus } = require('./review.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, createReview);

router.route('/:targetType/:targetId')
    .get(getReviews);

router.route('/:id/reply')
    .post(protect, replyToReview);

// مسارات الإدارة
router.get('/admin/all', protect, authorize('admin'), getAllReviews);
router.put('/admin/:id/status', protect, authorize('admin'), updateReviewStatus);

module.exports = router;
