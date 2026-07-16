const express = require('express');
const { createAd, getAdsByPlacement, registerClick, approveAd } = require('./ad.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
    .post(protect, createAd);

router.route('/placements/:position')
    .get(getAdsByPlacement);

router.route('/:id/click')
    .post(registerClick);

router.route('/:id/approve')
    .put(protect, authorize('admin'), approveAd);

module.exports = router;
