const Setting = require('./setting.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

// @desc    جلب جميع الإعدادات
// @route   GET /api/v1/settings
// @access  Public
exports.getSettings = asyncHandler(async (req, res, next) => {
    const settings = await Setting.findAll();

    // تحويل المصفوفة إلى كائن (Object) لسهولة الاستخدام في الواجهة الأمامية
    const settingsObject = {};
    settings.forEach(setting => {
        let value = setting.value;
        if (setting.type === 'number') value = Number(value);
        if (setting.type === 'boolean') value = value === 'true';
        if (setting.type === 'json') value = JSON.parse(value);

        settingsObject[setting.key] = value;
    });

    res.status(200).json(new ApiResponse(200, settingsObject, 'تم جلب الإعدادات بنجاح'));
});

// @desc    تحديث الإعدادات
// @route   PUT /api/v1/settings
// @access  Private (Admin)
exports.updateSettings = asyncHandler(async (req, res, next) => {
    const settingsData = req.body; // يتوقع أن يكون كائن { key: value, ... }

    for (const [key, value] of Object.entries(settingsData)) {
        let stringValue = value;
        if (typeof value === 'object') stringValue = JSON.stringify(value);
        else stringValue = String(value);

        await Setting.upsert({
            key,
            value: stringValue,
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : typeof value === 'object' ? 'json' : 'string'
        });
    }

    res.status(200).json(new ApiResponse(200, null, 'تم تحديث الإعدادات بنجاح'));
});
