const AuditLog = require('./auditLog.model');

exports.logAction = async ({ userId, action, targetType, targetId, details, req }) => {
    try {
        let ipAddress = null;
        if (req) {
            ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        }
        await AuditLog.create({
            userId,
            action,
            targetType,
            targetId,
            details: typeof details === 'object' ? JSON.stringify(details) : details,
            ipAddress
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
};
