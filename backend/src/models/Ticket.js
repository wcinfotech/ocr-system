/**
 * ============================================
 * Ticket Model - MongoDB Schema
 * ============================================
 * Handles support tickets created by users
 */

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    guestName: {
      type: String,
    },
    guestEmail: {
      type: String,
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    message: {
      type: String,
      required: [true, 'Please provide a description of the issue'],
    },
    replies: [
      {
        sender: {
          type: String,
          enum: ['user', 'admin'],
          required: true,
        },
        senderName: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
