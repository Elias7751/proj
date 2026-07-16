const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'خطأ داخلي في الخادم';
        error = new ApiError(statusCode, message, false, err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };

    // معالجة أخطاء Sequelize الشائعة
    if (err.name === 'SequelizeUniqueConstraintError') {
        response.message = 'البيانات المدخلة موجودة بالفعل (رقم الهاتف أو البريد الإلكتروني مستخدم)';
        error.statusCode = 400;
    } else if (err.name === 'SequelizeValidationError') {
        response.message = err.errors.map(e => e.message).join(', ');
        error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
