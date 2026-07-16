const Notification = require('./notification.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    جلب إشعارات المستخدم
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.findAll({
        where: { userId: req.user.id },
        order: [['created_at', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, notifications, 'تم جلب الإشعارات بنجاح'));
});

// @desc    جلب عدد الإشعارات غير المقروءة
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
    const count = await Notification.count({
        where: { userId: req.user.id, isRead: false }
    });

    res.status(200).json(new ApiResponse(200, { unreadCount: count }, 'تم جلب العدد بنجاح'));
});

// @desc    تحديد إشعار كمقروء
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const notification = await Notification.findOne({
        where: { id, userId: req.user.id }
    });

    if (!notification) {
        return next(new ApiError(404, 'الإشعار غير موجود'));
    }

    await notification.update({ isRead: true });

    res.status(200).json(new ApiResponse(200, notification, 'تم تحديد الإشعار كمقروء'));
});

// @desc    تحديد كل الإشعارات كمقروءة
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.update(
        { isRead: true },
        { where: { userId: req.user.id, isRead: false } }
    );

    res.status(200).json(new ApiResponse(200, null, 'تم تحديد جميع الإشعارات كمقروءة'));
});

// @desc    حذف إشعار
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const notification = await Notification.findOne({
        where: { id, userId: req.user.id }
    });

    if (!notification) {
        return next(new ApiError(404, 'الإشعار غير موجود'));
    }

    await notification.destroy();

    res.status(200).json(new ApiResponse(200, null, 'تم حذف الإشعار بنجاح'));
});

// @desc    إرسال إشعار (Admin)
// @route   POST /api/v1/notifications/send
// @access  Private (Admin)
exports.sendNotification = asyncHandler(async (req, res, next) => {
    const { userId, title, message, type, link } = req.body;

    const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        link
    });

    // هنا يمكن إضافة كود لإرسال الإشعار عبر Socket.io إذا كان المستخدم متصلاً

    res.status(201).json(new ApiResponse(201, notification, 'تم إرسال الإشعار بنجاح'));
});
