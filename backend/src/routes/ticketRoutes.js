/**
 * ============================================
 * Ticket Routes
 * ============================================
 * Handles endpoints for creating and viewing support tickets
 */

const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, getTicketDetail, replyTicketUser } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTicket);
router.get('/', protect, getMyTickets);
router.get('/:id', protect, getTicketDetail);
router.post('/:id/reply', protect, replyTicketUser);

module.exports = router;
