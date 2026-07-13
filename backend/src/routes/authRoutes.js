/**
 * ============================================
 * Auth Routes
 * ============================================
 * Handles endpoints for user register, login, and profile
 */

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, forgotPassword, resetPassword, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const Setting = require('../models/Setting');

router.post('/register', registerUser);
router.post('/login', loginUser);
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

module.exports = router;
