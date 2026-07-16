const express = require('express');
const { createReview, getReviews, replyToReview } = require('./review.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, createReview);

router.route('/:targetType/:targetId')
    .get(getReviews);

router.route('/:id/reply')
    .post(protect, replyToReview);

module.exports = router;
