const fs = require('fs');
let code = fs.readFileSync('src/modules/reviews/review.routes.js', 'utf8');

code = code.replace(
    "const { protect } = require('../../middleware/auth');",
    "const { protect, authorize } = require('../../middleware/auth');"
);

code = code.replace(
    "const { createReview, getReviews, replyToReview } = require('./review.controller');",
    "const { createReview, getReviews, replyToReview, getAllReviews, updateReviewStatus } = require('./review.controller');"
);

code = code.replace(
    "module.exports = router;",
    "// مسارات الإدارة\nrouter.get('/admin/all', protect, authorize('admin'), getAllReviews);\nrouter.put('/admin/:id/status', protect, authorize('admin'), updateReviewStatus);\n\nmodule.exports = router;"
);

fs.writeFileSync('src/modules/reviews/review.routes.js', code);
console.log('Updated review.routes.js');
