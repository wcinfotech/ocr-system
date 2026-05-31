/**
 * ============================================
 * MongoDB Connection Configuration
 * ============================================
 * Handles database connection with retry logic
 */

const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS only in local development to resolve MongoDB Atlas SRV records
// Fixes "querySrv ECONNREFUSED" when local DNS can't resolve Atlas hostnames
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🌐 Google DNS configured for development.');
  } catch (dnsErr) {
    console.warn('⚠️ Failed to set custom DNS servers:', dnsErr.message);
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern Mongoose 8.x uses default settings
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Retry connection after 5 seconds
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5040);
  }
};

module.exports = connectDB;
