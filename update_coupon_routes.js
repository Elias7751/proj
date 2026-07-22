const fs = require('fs');
let code = fs.readFileSync('src/modules/coupons/coupon.routes.js', 'utf8');

code = code.replace(
    "    getStoreCoupons,\n    createStoreCoupon,\n    validateCoupon",
    "    getStoreCoupons,\n    createStoreCoupon,\n    updateStoreCoupon,\n    deleteStoreCoupon,\n    validateCoupon"
);

code = code.replace(
    "router.route('/store')\n    .get(protect, authorize('store_owner'), getStoreCoupons)\n    .post(protect, authorize('store_owner'), createStoreCoupon);",
    "router.route('/store')\n    .get(protect, authorize('store_owner'), getStoreCoupons)\n    .post(protect, authorize('store_owner'), createStoreCoupon);\n\nrouter.route('/store/:id')\n    .put(protect, authorize('store_owner'), updateStoreCoupon)\n    .delete(protect, authorize('store_owner'), deleteStoreCoupon);"
);

fs.writeFileSync('src/modules/coupons/coupon.routes.js', code);
console.log('Updated coupon.routes.js');
