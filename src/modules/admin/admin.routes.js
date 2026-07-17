const express = require('express');
const {
    getUsers,
    toggleUserBlock,
    updateUser,
    deleteUser,
    getStores,
    approveStore,
    rejectStore,
    toggleStoreFeatured,
    getAllProducts,
    toggleProductStatus,
    getAllOrders,
    updateOrderStatus,
    getDashboardStats,
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAllAds,
    createAdminAd,
    updateAdminAd,
    deleteAdminAd,
    toggleProductFeatured,
    getMerchants
} = require('./admin.controller');
const { protect, authorize } = require('../../middleware/auth');
const { getAuditLogs } = require('../auditLogs/auditLog.controller');

const router = express.Router();

// جميع مسارات الإدارة تتطلب تسجيل الدخول وصلاحية أدمن
router.use(protect, authorize('admin'));

// مسارات الإحصائيات
router.route('/dashboard/stats')
    .get(getDashboardStats);

// مسارات السجلات
router.route('/logs')
    .get(getAuditLogs);

// مسارات المستخدمين
router.route('/users')
    .get(getUsers);
router.route('/users/:id')
    .put(updateUser)
    .delete(deleteUser);
router.route('/users/:id/block')
    .put(toggleUserBlock);

// مسارات المتاجر والتجار
router.route('/stores')
    .get(getStores);
router.route('/merchants')
    .get(getMerchants);
router.route('/stores/:id/approve')
    .put(approveStore);
router.route('/stores/:id/reject')
    .put(rejectStore);
router.route('/stores/:id/featured')
    .put(toggleStoreFeatured);

// مسارات المنتجات
router.route('/products')
    .get(getAllProducts);
router.route('/products/:id/status')
    .put(toggleProductStatus);
router.route('/products/:id/featured')
    .put(toggleProductFeatured);

// مسارات الطلبات
router.route('/orders')
    .get(getAllOrders);
router.route('/orders/:id/status')
    .put(updateOrderStatus);

// مسارات المشرفين (Admins)
router.route('/admins')
    .get(getAdmins)
    .post(createAdmin);
router.route('/admins/:id')
    .put(updateAdmin)
    .delete(deleteAdmin);

// مسارات الإعلانات والبنرات
router.route('/ads')
    .get(getAllAds)
    .post(createAdminAd);
router.route('/ads/:id')
    .put(updateAdminAd)
    .delete(deleteAdminAd);

module.exports = router;
