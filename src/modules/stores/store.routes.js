const express = require('express');
const { createStore, getStores, getStoreBySlug, updateStore, getMyStore } = require('./store.controller');
const { protect } = require('../../middleware/auth');
const productRoutes = require('../products/product.routes');

const router = express.Router();

// ربط مسار المنتجات المتداخل
router.use('/:storeId/products', productRoutes);

router.route('/')
    .get(getStores)
    .post(protect, createStore);

// يجب وضع هذا المسار قبل :slug لتجنب تعارضه مع المعرفات
router.get('/my-store', protect, getMyStore);

router.route('/:slug')
    .get(getStoreBySlug);

router.route('/:id')
    .put(protect, updateStore);

module.exports = router;
