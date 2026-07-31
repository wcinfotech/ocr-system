/**
 * ============================================
 * Auth Routes
 * ============================================
 * Handles endpoints for user register, login, and profile
 */

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, forgotPassword, resetPassword, verifyOtp, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const Setting = require('../models/Setting');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOtp);

router.get('/public-settings', async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: 'system_settings' });
    if (!settings) {
      return res.json({
        success: true,
        data: {
          supportEmail: 'support@escannora.com',
          contactPhone: '+1 (800) 555-0199',
          contactAddress: '100 Pine Street, San Francisco, CA 94111',
        }
      });
    }
    res.json({
      success: true,
      data: {
        supportEmail: settings.value.supportEmail || 'support@escannora.com',
        contactPhone: settings.value.contactPhone || '+1 (800) 555-0199',
        contactAddress: settings.value.contactAddress || '100 Pine Street, San Francisco, CA 94111',
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message',
      });
    }

    // Generate random friendly Ticket ID: TKT-XXXX
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const Ticket = require('../models/Ticket');
    const ticket = await Ticket.create({
      ticketId,
      guestName: name,
      guestEmail: email,
      subject: `Contact Inquiry: ${message.substring(0, 40)}${message.length > 40 ? '...' : ''}`,
      category: 'General',
      priority: 'medium',
      message: message,
    });

    // Send confirmation email asynchronously (so it doesn't block the request)
    try {
      const { sendTicketConfirmationEmail } = require('../services/emailService');
      sendTicketConfirmationEmail(email, name, {
        id: ticketId,
        subject: ticket.subject,
        category: 'General',
        priority: 'medium',
        message: message,
      }).catch((err) => {
        console.error(`Contact confirmation email send error: ${err.message}`);
      });
    } catch (err) {
      console.error(`Failed to load email service: ${err.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted. Our support team will contact you shortly.',
      data: {
        ticketId: ticket.ticketId,
      }
    });
  } catch (error) {
    console.error(`Contact message creation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

module.exports = router;
