/**
 * ============================================
 * Bill Scanner Backend - Entry Point
 * ============================================
 * Production-level Express server with MongoDB
 * Handles bill upload, OCR processing, and data extraction
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const billRoutes = require('./src/routes/billRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { startCleanupScheduler } = require('./src/services/cleanupService');

const app = express();
const PORT = process.env.PORT || 5041;

// ============================================
// Database Connection
// ============================================
connectDB();

// ============================================
// Middleware
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, true); // Allow all in dev; tighten in production if needed
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically (fallback for local dev)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API Routes
// ============================================
app.use('/api', billRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Bill Scanner API is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Error Handling
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// Server Start
// ============================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Bill Scanner API running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI}\n`);

  // Start auto-cleanup scheduler (deletes files older than 2 days)
  startCleanupScheduler();
});

// Handle port-in-use error gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run: Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`);
    console.error(`   Then restart the server.\n`);
    process.exit(1);
  }
  throw err;
});

// ============================================
// Production Stability — Never crash server
// ============================================
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

module.exports = app;
