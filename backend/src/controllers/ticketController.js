/**
 * ============================================
 * Ticket Controller
 * ============================================
 * Handles creating support tickets and fetching a user's tickets
 */

const Ticket = require('../models/Ticket');
const { sendTicketConfirmationEmail } = require('../services/emailService');

/**
 * @desc    Create a new support ticket
 * @route   POST /api/v1/tickets
 * @access  Private
 */
const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a subject and a description of the issue',
      });
    }

    // Generate random friendly Ticket ID: TKT-XXXX
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await Ticket.create({
      user: req.user._id,
      ticketId,
      subject,
      category,
      priority: priority || 'medium',
      message,
    });

    // Send confirmation email asynchronously (so it doesn't block the request)
    sendTicketConfirmationEmail(req.user.email, req.user.name, {
      id: ticketId,
      subject,
      category,
      priority: priority || 'medium',
      message,
    }).catch((err) => {
      console.error(`Ticket confirmation email send error: ${err.message}`);
    });

    res.status(201).json({
      success: true,
      data: {
        id: ticket.ticketId,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        date: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error(`Create ticket error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's support tickets
 * @route   GET /api/v1/tickets
 * @access  Private
 */
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });

    const formattedTickets = tickets.map((t) => ({
      id: t.ticketId,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      date: new Date(t.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }));

    res.json({
      success: true,
      data: formattedTickets,
    });
  } catch (error) {
    console.error(`Get tickets error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get single support ticket detail
 * @route   GET /api/v1/tickets/:id
 * @access  Private
 */
const getTicketDetail = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.id, user: req.user._id });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: ticket.ticketId,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        message: ticket.message,
        date: new Date(ticket.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        replies: ticket.replies || [],
      },
    });
  } catch (error) {
    console.error(`Get ticket detail error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Reply to a support ticket
 * @route   POST /api/v1/tickets/:id/reply
 * @access  Private
 */
const replyTicketUser = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide message content',
      });
    }

    const ticket = await Ticket.findOne({ ticketId: req.params.id, user: req.user._id });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot reply to a closed ticket',
      });
    }

    ticket.replies.push({
      sender: 'user',
      senderName: req.user.name,
      message: message.trim(),
      createdAt: new Date(),
    });

    await ticket.save();

    res.json({
      success: true,
      data: ticket.replies[ticket.replies.length - 1],
    });
  } catch (error) {
    console.error(`Reply ticket user error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketDetail,
  replyTicketUser,
};
