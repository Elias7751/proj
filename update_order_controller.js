const fs = require('fs');
let code = fs.readFileSync('src/modules/orders/order.controller.js', 'utf8');

code = code.replace(
    "const Coupon = require('../offers/coupon.model');",
    "const Coupon = require('../coupons/coupon.model');"
);

fs.writeFileSync('src/modules/orders/order.controller.js', code);
console.log('Updated order.controller.js');
