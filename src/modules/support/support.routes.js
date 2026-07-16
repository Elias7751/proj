const express = require('express');
const {
    createTicket,
    getMyTickets,
    getTicketDetails,
    replyToTicket,
    getFAQs,
    createFAQ
} = require('./support.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// مسارات التذاكر
router.route('/tickets')
    .post(protect, createTicket)
    .get(protect, getMyTickets);

router.route('/tickets/:id')
    .get(protect, getTicketDetails);

router.route('/tickets/:id/reply')
    .post(protect, replyToTicket);

// مسارات الأسئلة الشائعة
router.route('/faq')
    .get(getFAQs)
    .post(protect, authorize('admin'), createFAQ);

module.exports = router;
