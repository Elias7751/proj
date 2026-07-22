const fs = require('fs');
let code = fs.readFileSync('src/modules/offers/offer.controller.js', 'utf8');

code = code.replace("const Coupon = require('./coupon.model');\r\n", "");
code = code.replace("const Coupon = require('./coupon.model');\n", "");

function removeFunction(code, funcName) {
    const startIdx = code.indexOf(`exports.${funcName} =`);
    if (startIdx === -1) return code;

    // Find the previous comment block
    let commentStart = code.lastIndexOf('// @desc', startIdx);
    if (commentStart === -1) commentStart = startIdx;

    // Find the end of the function
    const endIdx = code.indexOf('});', startIdx);
    if (endIdx === -1) return code;

    return code.substring(0, commentStart) + code.substring(endIdx + 3);
}

code = removeFunction(code, 'createCoupon');
code = removeFunction(code, 'validateCoupon');
code = removeFunction(code, 'getMyCoupons');
code = removeFunction(code, 'updateCoupon');
code = removeFunction(code, 'deleteCoupon');

// Remove the section headers
code = code.replace(/\/\/ ==========================================\r?\n\/\/ الكوبونات \(Coupons\)\r?\n\/\/ ==========================================/g, '');

fs.writeFileSync('src/modules/offers/offer.controller.js', code);
console.log('Cleaned up offer.controller.js');
