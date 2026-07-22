const express = require('express');
const {
    createOffer,
    getActiveOffers,
    getMyOffers,
    updateOffer,
    deleteOffer
} = require('./offer.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

// مسارات العروض
router.get('/my-offers', protect, getMyOffers);

router.route('/')
    .get(getActiveOffers)
    .post(protect, createOffer);

router.route('/:id')
    .put(protect, updateOffer)
    .delete(protect, deleteOffer);

module.exports = router;
