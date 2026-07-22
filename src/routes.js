const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const cityRoutes = require('./modules/cities/city.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const storeRoutes = require('./modules/stores/store.routes');
const productRoutes = require('./modules/products/product.routes');
const orderRoutes = require('./modules/orders/order.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const offerRoutes = require('./modules/offers/offer.routes');
const adRoutes = require('./modules/ads/ad.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const settingRoutes = require('./modules/settings/setting.routes');
const supportRoutes = require('./modules/support/support.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const favoriteRoutes = require('./modules/favorites/favorite.routes');
const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');
const couponRoutes = require('./modules/coupons/coupon.routes');

const router = express.Router();

// ربط المسارات
router.use('/auth', authRoutes);
router.use('/cities', cityRoutes);
router.use('/categories', categoryRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes); // مسار عام للمنتجات (بحث وفلترة)
router.use('/', orderRoutes); // يحتوي على /cart و /orders
router.use('/reviews', reviewRoutes);
router.use('/offers', offerRoutes);
router.use('/ads', adRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingRoutes);
router.use('/support', supportRoutes);
router.use('/admin', adminRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/coupons', couponRoutes);

module.exports = router;
