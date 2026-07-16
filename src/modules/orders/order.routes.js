const express = require('express');
const { addToCart, getCart, clearCart } = require('./cart.controller');
const { createOrder, getMyOrders, updateOrderStatus, getWhatsAppLink, getStoreOrders, getOrderById, createLead } = require('./order.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

// مسارات السلة
router.route('/cart')
    .get(protect, getCart)
    .post(protect, addToCart)
    .delete(protect, clearCart);

// مسارات الطلبات
router.route('/orders')
    .post(protect, createOrder);

router.route('/orders/lead')
    .post(protect, createLead);

router.route('/orders/my')
    .get(protect, getMyOrders);

router.route('/orders/store')
    .get(protect, getStoreOrders);

router.route('/orders/:id/whatsapp-link')
    .get(protect, getWhatsAppLink);

router.route('/orders/:id')
    .get(protect, getOrderById);

router.route('/orders/:id/status')
    .put(protect, updateOrderStatus);

module.exports = router;
