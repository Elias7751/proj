const express = require('express');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification
} = require('./notification.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect); // جميع مسارات الإشعارات تتطلب تسجيل الدخول

router.route('/')
    .get(getNotifications);

router.route('/unread-count')
    .get(getUnreadCount);

router.route('/read-all')
    .put(markAllAsRead);

router.route('/:id/read')
    .put(markAsRead);

router.route('/:id')
    .delete(deleteNotification);

router.route('/send')
    .post(authorize('admin'), sendNotification);

module.exports = router;
