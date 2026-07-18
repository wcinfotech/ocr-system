const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { logEvent, getEventStats } = require('../services/firebaseService');

// Helper middleware for optional user identification
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforbillscanpro123!');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Quietly fall through if token is expired or invalid
    }
  }
  next();
};

/**
 * @route   POST /api/v1/analytics/log
 * @desc    Log frontend event to Firebase
 * @access  Public / Authenticated
 */
router.post('/log', optionalProtect, async (req, res) => {
  try {
    const { name, params = {} } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Event name is required' });
    }

    // Attach authenticated user metadata if available
    const eventParams = {
      ...params,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
      deviceType: req.headers['sec-ch-ua-platform'] || 'Web',
    };

    if (req.user) {
      eventParams.userId = req.user._id.toString();
      eventParams.userEmail = req.user.email;
      eventParams.userName = req.user.name;
    }

    await logEvent(name, eventParams);

    res.status(200).json({ success: true, message: 'Event logged successfully' });
  } catch (error) {
    console.error('Failed to log client event:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/v1/analytics/stats
 * @desc    Get tracking statistics and event counts from Firestore
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // Only allow admin roles or standard authenticated users for this dashboard
    const stats = await getEventStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
