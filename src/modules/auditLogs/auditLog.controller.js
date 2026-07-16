const AuditLog = require('./auditLog.model');
const User = require('../users/user.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

// @desc    جلب جميع السجلات
// @route   GET /api/v1/admin/logs
// @access  Private (Admin)
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
    const logs = await AuditLog.findAll({
        include: [
            { model: User, as: 'user', attributes: ['fullName', 'phone', 'role'] }
        ],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json(new ApiResponse(200, logs, 'تم جلب السجلات بنجاح'));
});
