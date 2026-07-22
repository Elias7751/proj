const fs = require('fs');
let code = fs.readFileSync('src/modules/orders/order.controller.js', 'utf8');

code = code.replace(
    "where: { code: couponCode.toUpperCase(), status: 'active' }",
    "where: { code: couponCode.toUpperCase(), isActive: true }"
);

code = code.replace(
    "if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {",
    "if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {"
);

code = code.replace(
    "if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) {",
    "if (coupon.maxDiscountAmount && discount > parseFloat(coupon.maxDiscountAmount)) {"
);

code = code.replace(
    "discount = parseFloat(coupon.maxDiscount);",
    "discount = parseFloat(coupon.maxDiscountAmount);"
);

code = code.replace(
    "await coupon.increment('usageCount');",
    "await coupon.increment('usedCount');"
);

fs.writeFileSync('src/modules/orders/order.controller.js', code);
console.log('Updated order.controller.js for new Coupon model');
