const fs = require('fs');
let code = fs.readFileSync('src/modules/offers/offer.controller.js', 'utf8');

code = code.replace("const Coupon = require('./coupon.model');\n", "");

// We will use regex to remove the specific functions.
// exports.createCoupon
code = code.replace(/\/\/ @desc    إنشاء كوبون جديد[\s\S]*?res\.status\(201\)\.json\(new ApiResponse\(201, coupon, 'تم إنشاء الكوبون بنجاح'\)\);\n}\);/g, '');

// exports.validateCoupon
code = code.replace(/\/\/ @desc    التحقق من صحة الكوبون[\s\S]*?\}, 'الكوبون صالح'\)\);\n}\);/g, '');

// exports.getMyCoupons
code = code.replace(/\/\/ @desc    جلب كوبونات المتجر الخاص بالتاجر[\s\S]*?res\.status\(200\)\.json\(new ApiResponse\(200, coupons, 'تم جلب الكوبونات بنجاح'\)\);\n}\);/g, '');

// exports.updateCoupon
code = code.replace(/\/\/ @desc    تحديث كوبون[\s\S]*?res\.status\(200\)\.json\(new ApiResponse\(200, coupon, 'تم تحديث الكوبون بنجاح'\)\);\n}\);/g, '');

// exports.deleteCoupon
code = code.replace(/\/\/ @desc    حذف كوبون[\s\S]*?res\.status\(200\)\.json\(new ApiResponse\(200, null, 'تم حذف الكوبون بنجاح'\)\);\n}\);/g, '');

// Remove the section header
code = code.replace(/\/\/ ==========================================\r?\n\/\/ الكوبونات \(Coupons\)\r?\n\/\/ ==========================================/g, '');

fs.writeFileSync('src/modules/offers/offer.controller.js', code);
console.log('Updated offer.controller.js safely');
