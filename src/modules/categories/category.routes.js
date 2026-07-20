const express = require('express');
const { getCategories, createCategory } = require('./category.controller');
const { protect, authorize } = require('../../middleware/auth');
const { cacheMiddleware } = require('../../middleware/cache');

const router = express.Router();

router.route('/')
    .get(cacheMiddleware(300), getCategories)
    .post(protect, authorize('admin'), createCategory);

module.exports = router;
