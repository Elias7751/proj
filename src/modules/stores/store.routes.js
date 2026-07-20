const express = require('express');
const { createStore, getStores, getStoreBySlug, updateStore, getMyStore, updateMyStore } = require('./store.controller');
const { protect } = require('../../middleware/auth');
const { cacheMiddleware } = require('../../middleware/cache');
const productRoutes = require('../products/product.routes');

const router = express.Router();

// ربط مسار المنتجات المتداخل
router.use('/:storeId/products', productRoutes);

router.route('/')
    .get(cacheMiddleware(300), getStores)
    .post(protect, createStore);

// يجب وضع هذا المسار قبل :slug لتجنب تعارضه مع المعرفات
router.route('/my-store')
    .get(protect, getMyStore)
    .put(protect, updateMyStore);

router.route('/:slug')
    .get(cacheMiddleware(300), getStoreBySlug);

router.route('/:id')
    .put(protect, updateStore);

module.exports = router;
