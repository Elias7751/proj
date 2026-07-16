const express = require('express');
const { toggleFavorite, getMyFavorites } = require('./favorite.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMyFavorites);

router.route('/:productId')
    .post(toggleFavorite);

module.exports = router;
