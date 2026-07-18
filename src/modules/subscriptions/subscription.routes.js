const express = require('express');
const {
    createPlan,
    getPlans,
    updatePlan,
    deletePlan,
    subscribeToPlan,
    getMySubscription,
    assignPlanToStore
} = require('./subscription.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// مسارات عامة (للتجار والأدمن)
router.get('/plans', protect, getPlans);

// مسارات التاجر
router.post('/subscribe', protect, authorize('store_owner'), subscribeToPlan);
router.get('/my', protect, authorize('store_owner'), getMySubscription);

// مسارات الأدمن
router.post('/plans', protect, authorize('admin'), createPlan);
router.put('/plans/:id', protect, authorize('admin'), updatePlan);
router.delete('/plans/:id', protect, authorize('admin'), deletePlan);
router.post('/assign', protect, authorize('admin'), assignPlanToStore);

module.exports = router;
