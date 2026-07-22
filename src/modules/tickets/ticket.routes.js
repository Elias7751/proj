const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const { protect, authorize } = require('../../middleware/auth');

// مسارات المستخدمين
router.post('/', protect, ticketController.createTicket);
router.get('/my', protect, ticketController.getMyTickets);
router.get('/:id', protect, ticketController.getTicketById);
router.post('/:id/messages', protect, ticketController.replyToTicket);

// مسارات الإدارة
router.get('/', protect, authorize('admin'), ticketController.getAllTickets);
router.put('/:id/status', protect, authorize('admin'), ticketController.updateTicketStatus);

module.exports = router;
