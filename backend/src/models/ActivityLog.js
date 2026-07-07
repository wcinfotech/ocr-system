/**
 * ============================================
 * ActivityLog Model - MongoDB Schema
 * ============================================
 * Records admin actions for compliance, auditing, and log viewing
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
      index: true,
    },
    adminName: {
      type: String,
      default: 'System',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    method: {
      type: String,
    },
    url: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
    },
    responseTime: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
