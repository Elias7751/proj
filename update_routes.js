const fs = require('fs');
let code = fs.readFileSync('src/routes.js', 'utf8');

code = code.replace(
    "const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');",
    "const subscriptionRoutes = require('./modules/subscriptions/subscription.routes');\nconst couponRoutes = require('./modules/coupons/coupon.routes');"
);

code = code.replace(
    "router.use('/subscriptions', subscriptionRoutes);",
    "router.use('/subscriptions', subscriptionRoutes);\nrouter.use('/coupons', couponRoutes);"
);

fs.writeFileSync('src/routes.js', code);
console.log('Updated routes.js');
