/**
 * ============================================
 * Admin Authentication & RBAC Middleware
 * ============================================
 * Handles JWT verification and role/permission checks for admins
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Protect admin routes by verifying the JWT access token.
 */
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforbillscanpro123!');
      
      req.admin = await Admin.findById(decoded.id).select('+role +permissions');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized as admin, user not found',
        });
      }

      next();
    } catch (error) {
      console.error(`Admin auth error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, session expired or invalid token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

/**
 * Restrict access to specific admin roles.
 * @param {...string} allowedRoles - List of allowed roles (e.g. 'SUPER_ADMIN', 'ADMIN')
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (req.admin.role === 'SUPER_ADMIN') {
      return next(); // SUPER_ADMIN bypasses all role restrictions
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have the required role to access this resource',
      });
    }

    next();
  };
};

const ROLE_PERMISSION_FALLBACK = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'dashboard:view',
    'users:view', 'users:create', 'users:edit', 'users:delete', 'users:suspend',
    'subscriptions:view', 'subscriptions:manage',
    'plans:view', 'plans:manage',
    'bills:view', 'bills:manage',
    'payments:view', 'payments:manage',
    'support:view', 'support:manage',
    'notifications:view', 'notifications:send',
    'analytics:view',
    'roles:view', 'roles:manage',
    'permissions:view', 'permissions:manage',
    'admins:view', 'admins:manage',
    'activity_logs:view', 'audit_logs:view',
    'settings:view', 'settings:manage'
  ],
  MANAGER: [
    'dashboard:view',
    'users:view', 'users:edit',
    'subscriptions:view', 'subscriptions:manage',
    'plans:view',
    'bills:view',
    'analytics:view',
    'support:view'
  ],
  SUPPORT: [
    'dashboard:view',
    'users:view',
    'support:view', 'support:manage',
    'bills:view'
  ],
  ACCOUNTANT: [
    'dashboard:view',
    'payments:view', 'payments:manage',
    'bills:view',
    'analytics:view',
    'subscriptions:view'
  ],
  VIEWER: [
    'dashboard:view',
    'users:view',
    'bills:view',
    'analytics:view'
  ]
};

/**
 * Restrict access to specific permission key.
 * @param {string} permission - The permission key (e.g. 'users:delete')
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (req.admin.role === 'SUPER_ADMIN') {
      return next(); // SUPER_ADMIN bypasses permission checks
    }

    const effectivePermissions = req.admin.permissions && req.admin.permissions.length > 0
      ? req.admin.permissions
      : (ROLE_PERMISSION_FALLBACK[req.admin.role] || []);

    if (effectivePermissions.includes('*') || effectivePermissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Requires permission '${permission}'`,
    });
  };
};

module.exports = { protectAdmin, restrictTo, checkPermission };
