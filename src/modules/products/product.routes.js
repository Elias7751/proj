const express = require('express');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getMyStoreProducts } = require('./product.controller');
const { protect } = require('../../middleware/auth');
const { cacheMiddleware } = require('../../middleware/cache');

const router = express.Router({ mergeParams: true }); // mergeParams يتيح الوصول لـ :storeId من مسارات المتاجر

// مسارات عامة
router.get('/', cacheMiddleware(300), getProducts); // Cache for 5 minutes
router.get('/:id', cacheMiddleware(300), getProductById);

// مسارات محمية
router.get('/store/my', protect, getMyStoreProducts);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
