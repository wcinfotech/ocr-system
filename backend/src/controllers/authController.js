/**
 * ============================================
 * Auth Controller
 * ============================================
 * Handles user registration, login, and profile fetching
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendOtpEmail } = require('../services/emailService');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforbillscanpro123!', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Send registration welcome email in the background
    sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error(`Welcome email send error: ${err.message}`);
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`Register error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check if user exists & select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error(`GetMe error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/me
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const { name, email, password } = req.body;

    if (name) user.name = name;
    
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      // Check if email already exists
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use by another account',
        });
      }
      user.email = email.toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long',
        });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(`UpdateProfile error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Send verification OTP for password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "You haven't account. Please sign up or check your email.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[OTP Verification] Generated OTP ${otp} for email ${user.email}`);

    // Store OTP in database with 10 min expiration
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    const emailRes = await sendOtpEmail(user.email, user.name, otp);
    if (!emailRes.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP verification email. Please try again later.',
      });
    }

    res.json({
      success: true,
      message: 'Verification OTP sent to your email address',
    });
  } catch (error) {
    console.error(`Forgot password error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Verify OTP and reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, OTP code, and new password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "You haven't account. Please sign up or check your email.",
      });
    }

    // Verify OTP
    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== otp ||
      user.resetPasswordOTPExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP verification code',
      });
    }

    // Verify if same as old password
    const isSamePassword = await user.matchPassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: "It's your old password. Make a new and strong one.",
      });
    }

    // Update password and clear OTP fields
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully! You can now log in.',
    });
  } catch (error) {
    console.error(`Reset password error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Verify OTP code
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP code',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "You haven't account. Please sign up or check your email.",
      });
    }

    // Verify OTP
    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== otp ||
      user.resetPasswordOTPExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP verification code',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error(`Verify OTP error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyOtp,
};
