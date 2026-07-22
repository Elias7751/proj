const fs = require('fs');
let code = fs.readFileSync('src/modules/offers/offer.routes.js', 'utf8');

code = code.replace(
    "    createCoupon,\n    validateCoupon,\n    getMyCoupons,\n    updateCoupon,\n    deleteCoupon\n",
    ""
);

code = code.replace(
    "// مسارات الكوبونات\nrouter.get('/coupons/my-coupons', protect, getMyCoupons);\n\nrouter.route('/coupons')\n    .post(protect, createCoupon);\n\nrouter.route('/coupons/validate')\n    .post(protect, validateCoupon);\n\nrouter.route('/coupons/:id')\n    .put(protect, updateCoupon)\n    .delete(protect, deleteCoupon);",
    ""
);

fs.writeFileSync('src/modules/offers/offer.routes.js', code);
console.log('Updated offer.routes.js');
