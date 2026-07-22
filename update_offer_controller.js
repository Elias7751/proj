const fs = require('fs');
let code = fs.readFileSync('src/modules/offers/offer.controller.js', 'utf8');

code = code.replace("const Coupon = require('./coupon.model');\n", "");

const splitIndex = code.indexOf('// ==========================================\r\n// الكوبونات (Coupons)');
if (splitIndex !== -1) {
    code = code.substring(0, splitIndex);
} else {
    const splitIndexLF = code.indexOf('// ==========================================\n// الكوبونات (Coupons)');
    if (splitIndexLF !== -1) {
        code = code.substring(0, splitIndexLF);
    }
}

fs.writeFileSync('src/modules/offers/offer.controller.js', code);
console.log('Updated offer.controller.js');
