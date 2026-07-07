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

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOtp);

module.exports = router;
