/**
 * ============================================
 * Admin Routes
 * ============================================
 * Defines administrative and RBAC endpoints for the admin panel.
 */

const express = require('express');
const router = express.Router();
const { protectAdmin, restrictTo, checkPermission } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// ── Authentication (Public) ──
router.post('/auth/login', adminController.loginAdmin);
router.post('/auth/refresh', adminController.refreshAdminToken);
router.post('/auth/forgot-password', adminController.forgotPasswordAdmin);

// ── Authentication (Protected) ──
router.post('/auth/logout', protectAdmin, adminController.logoutAdmin);
router.get('/auth/me', protectAdmin, adminController.getMeAdmin);

// ── Dashboard / Analytics ──
router.get('/dashboard/stats', protectAdmin, checkPermission('dashboard:view'), adminController.getDashboardStats);
router.get('/dashboard/charts', protectAdmin, checkPermission('dashboard:view'), adminController.getDashboardCharts);
router.get('/dashboard/recent-users', protectAdmin, checkPermission('dashboard:view'), adminController.getRecentUsers);
router.get('/dashboard/recent-bills', protectAdmin, checkPermission('dashboard:view'), adminController.getRecentBills);

// ── Users Management ──
router.get('/users', protectAdmin, checkPermission('users:view'), adminController.getUsers);
router.get('/users/:id', protectAdmin, checkPermission('users:view'), adminController.getUserDetail);
router.patch('/users/:id', protectAdmin, checkPermission('users:edit'), adminController.updateUser);
router.post('/users/:id/suspend', protectAdmin, checkPermission('users:suspend'), adminController.suspendUser);
router.post('/users/:id/activate', protectAdmin, checkPermission('users:suspend'), adminController.activateUser);
router.delete('/users/:id', protectAdmin, checkPermission('users:delete'), adminController.deleteUser);

// ── Subscription Plans ──
router.get('/plans', protectAdmin, checkPermission('plans:view'), adminController.getPlans);
router.post('/plans', protectAdmin, checkPermission('plans:manage'), adminController.createPlan);
router.put('/plans/:id', protectAdmin, checkPermission('plans:manage'), adminController.updatePlan);
router.delete('/plans/:id', protectAdmin, checkPermission('plans:manage'), adminController.deletePlan);

// ── Subscriptions ──
router.get('/subscriptions', protectAdmin, checkPermission('subscriptions:view'), adminController.getSubscriptions);
router.post('/subscriptions/assign', protectAdmin, checkPermission('subscriptions:manage'), adminController.assignSubscription);
router.post('/subscriptions/:id/renew', protectAdmin, checkPermission('subscriptions:manage'), adminController.renewSubscription);
router.post('/subscriptions/:id/expire', protectAdmin, checkPermission('subscriptions:manage'), adminController.expireSubscription);
router.post('/subscriptions/:id/cancel', protectAdmin, checkPermission('subscriptions:manage'), adminController.cancelSubscription);

// ── Bills / Documents ──
router.get('/bills', protectAdmin, checkPermission('bills:view'), adminController.getBills);
router.get('/bills/:id', protectAdmin, checkPermission('bills:view'), adminController.getBillDetail);
router.post('/bills/:id/restore', protectAdmin, checkPermission('bills:manage'), adminController.restoreBill);
router.delete('/bills/:id', protectAdmin, checkPermission('bills:manage'), adminController.deleteBill);

// ── Payments / Billing Invoices ──
router.get('/payments', protectAdmin, checkPermission('payments:view'), adminController.getPayments);
router.post('/payments/:id/refund', protectAdmin, checkPermission('payments:manage'), adminController.refundPayment);

// ── Support Tickets ──
router.get('/tickets', protectAdmin, checkPermission('support:view'), adminController.getTickets);
router.get('/tickets/:id', protectAdmin, checkPermission('support:view'), adminController.getTicketDetail);
router.post('/tickets/:id/reply', protectAdmin, checkPermission('support:manage'), adminController.replyTicket);

// ── System Configuration Settings ──
router.get('/settings', protectAdmin, checkPermission('settings:view'), adminController.getSettings);
router.put('/settings', protectAdmin, checkPermission('settings:manage'), adminController.updateSettings);

// ── Activity & Audit Logging ──
router.get('/activity-logs', protectAdmin, checkPermission('activity_logs:view'), adminController.getActivityLogs);
router.get('/audit-logs', protectAdmin, checkPermission('audit_logs:view'), adminController.getAuditLogs);

// ── Admin Staff Management ──
router.get('/admins', protectAdmin, restrictTo('SUPER_ADMIN'), adminController.getAdmins);
router.post('/admins', protectAdmin, restrictTo('SUPER_ADMIN'), adminController.createAdmin);
router.get('/admins/:id', protectAdmin, restrictTo('SUPER_ADMIN'), adminController.getAdminDetail);
router.patch('/admins/:id', protectAdmin, restrictTo('SUPER_ADMIN'), adminController.updateAdmin);
router.delete('/admins/:id', protectAdmin, restrictTo('SUPER_ADMIN'), adminController.deleteAdmin);

// ── Roles & Permissions Catalog ──
router.get('/roles', protectAdmin, checkPermission('roles:view'), adminController.getRoles);
router.get('/permissions', protectAdmin, checkPermission('permissions:view'), adminController.getPermissions);

module.exports = router;
