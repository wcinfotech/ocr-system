/**
 * ============================================
 * Auth Controller
 * ============================================
 * Handles user registration, login, and profile fetching
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendOtpEmail } = require('../services/emailService');
const { logEvent } = require('../services/firebaseService');

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

    // Sync user creation with Firebase Auth if Admin SDK is initialized
    const { isInitialized } = require('../config/firebase');
    if (isInitialized) {
      const { getAuth } = require('firebase-admin/auth');
      try {
        const fbUser = await getAuth().createUser({
          email: user.email,
          password: password,
          displayName: user.name,
        });
        if (fbUser && fbUser.uid) {
          user.googleId = fbUser.uid;
          await user.save();
        }
        console.log(`🔥 Synced new user to Firebase Auth: ${user.email}`);
      } catch (fbErr) {
        if (fbErr.code !== 'auth/email-already-exists') {
          console.warn(`⚠️ Firebase Auth user creation warning for ${user.email}:`, fbErr.message);
        }
      }
    }

    // Send registration welcome email in the background
    sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error(`Welcome email send error: ${err.message}`);
    });

    // Generate token
    const token = generateToken(user._id);

    // Log registration event to Firebase
    logEvent('user_register', {
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      authProvider: 'local',
    }).catch(err => console.error('Register logEvent error:', err));

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

    // Background sync to Firebase Auth if Admin SDK is initialized and user is missing from Firebase
    const { isInitialized } = require('../config/firebase');
    if (isInitialized) {
      const { getAuth } = require('firebase-admin/auth');
      getAuth().getUserByEmail(user.email).catch(async (err) => {
        if (err.code === 'auth/user-not-found') {
          try {
            const fbUser = await getAuth().createUser({
              email: user.email,
              password: password,
              displayName: user.name,
            });
            if (fbUser && fbUser.uid && !user.googleId) {
              user.googleId = fbUser.uid;
              await user.save();
            }
            console.log(`🔥 Synced existing user to Firebase Auth on login: ${user.email}`);
          } catch (syncErr) {
            console.warn(`⚠️ Firebase Auth login sync warning for ${user.email}:`, syncErr.message);
          }
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Log login event to Firebase
    logEvent('user_login', {
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      authProvider: 'local',
    }).catch(err => console.error('Login logEvent error:', err));

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

    // Log profile update event to Firebase
    logEvent('user_update_profile', {
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      updatedFields: Object.keys(req.body).filter(k => k !== 'password'),
    }).catch(err => console.error('Profile update logEvent error:', err));

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

    // Send email asynchronously in the background to prevent blocking/hanging
    sendOtpEmail(user.email, user.name, otp)
      .then((emailRes) => {
        if (!emailRes.success) {
          console.error(`Background OTP email delivery failed for ${user.email}: ${emailRes.error}`);
        } else {
          console.log(`Background OTP email sent successfully to ${user.email}`);
        }
      })
      .catch((err) => {
        console.error(`Background OTP email crashed for ${user.email}: ${err.message}`);
      });

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

    // Sync updated password to Firebase Auth
    const { isInitialized } = require('../config/firebase');
    if (isInitialized) {
      const { getAuth } = require('firebase-admin/auth');
      getAuth().getUserByEmail(user.email).then(async (fbUser) => {
        await getAuth().updateUser(fbUser.uid, { password: password });
        console.log(`🔥 Updated password in Firebase Auth for: ${user.email}`);
      }).catch(err => {
        console.warn(`⚠️ Could not sync password reset to Firebase Auth for ${user.email}:`, err.message);
      });
    }

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

/**
 * @desc    Authenticate / Register user with Google ID token
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid Google ID token',
      });
    }

    let decodedToken = null;

    // Verify token using Firebase Admin SDK
    const { isInitialized } = require('../config/firebase');
    if (isInitialized) {
      const { getAuth } = require('firebase-admin/auth');
      try {
        decodedToken = await getAuth().verifyIdToken(idToken);
      } catch (tokenErr) {
        console.error('Firebase Admin verifyIdToken error:', tokenErr.message);
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired Google authentication token',
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        error: 'Backend Firebase Admin SDK is not initialized. Unable to verify Google token.',
      });
    }

    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Google account does not provide a verified email address',
      });
    }

    const cleanEmail = email.toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // User exists, link Google ID and avatar if missing
      let modified = false;
      if (!user.googleId) {
        user.googleId = uid;
        modified = true;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Create new user for Google Sign-In
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId: uid,
        avatar: picture || '',
        authProvider: 'google',
      });

      // Send welcome email asynchronously
      sendWelcomeEmail(user.email, user.name).catch((err) => {
        console.error(`Welcome email send error: ${err.message}`);
      });

      // Log registration event
      logEvent('user_register', {
        userId: user._id.toString(),
        userName: user.name,
        userEmail: user.email,
        authProvider: 'google',
      }).catch((err) => console.error('Register logEvent error:', err));
    }

    // Generate token
    const token = generateToken(user._id);

    // Log login event
    logEvent('user_login', {
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      authProvider: 'google',
    }).catch((err) => console.error('Login logEvent error:', err));

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    console.error(`Google login controller error: ${error.message}`);
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
  googleLogin,
};
