const express = require('express');
const { getCities, createCity, createArea } = require('./city.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getCities)
    .post(protect, authorize('admin'), createCity);

router.route('/:cityId/areas')
    .post(protect, authorize('admin'), createArea);

module.exports = router;
