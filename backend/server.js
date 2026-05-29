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

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Database Connection
// ============================================
connectDB();

// ============================================
// Middleware
// ============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
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
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Bill Scanner API running on http://localhost:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI}\n`);
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

module.exports = app;
