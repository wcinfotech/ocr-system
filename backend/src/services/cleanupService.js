/**
 * ============================================
 * Cleanup Service - Auto-delete uploaded files
 * ============================================
 * Removes original uploaded files (PDF, images) from
 * local disk and Cloudinary after 2 days.
 * Only extracted data stays in MongoDB.
 */

const fs = require('fs');
const path = require('path');
const Bill = require('../models/Bill');
const { deleteFromCloudinary } = require('./cloudinaryService');

const FILE_RETENTION_MS = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

/**
 * Clean up files older than 2 days
 * - Deletes local file from disk
 * - Deletes from Cloudinary (if uploaded)
 * - Clears file references from the bill record
 */
const cleanupOldFiles = async () => {
  const cutoffDate = new Date(Date.now() - FILE_RETENTION_MS);

  try {
    // Find completed bills older than 2 days that still have file references
    const bills = await Bill.find({
      status: 'completed',
      createdAt: { $lt: cutoffDate },
      $or: [
        { originalFile: { $exists: true, $ne: null, $ne: '' } },
        { cloudinaryPublicId: { $exists: true, $ne: null, $ne: '' } },
      ],
    }).limit(100); // Process in batches of 100

    if (bills.length === 0) {
      return { cleaned: 0, errors: 0 };
    }

    console.log(`🧹 Cleanup: Found ${bills.length} bill(s) with files older than 2 days.`);

    let cleaned = 0;
    let errors = 0;

    for (const bill of bills) {
      try {
        // 1. Delete local file from disk
        if (bill.originalFile && fs.existsSync(bill.originalFile)) {
          fs.unlinkSync(bill.originalFile);
          console.log(`🗑️  Deleted local file: ${path.basename(bill.originalFile)}`);
        }

        // 2. Delete from Cloudinary
        if (bill.cloudinaryPublicId) {
          await deleteFromCloudinary(bill.cloudinaryPublicId);
          console.log(`☁️  Deleted from Cloudinary: ${bill.cloudinaryPublicId}`);
        }

        // 3. Clear file references from DB (keep extracted data)
        await Bill.findByIdAndUpdate(bill._id, {
          $set: {
            originalFile: null,
            cloudinaryUrl: null,
            cloudinaryPublicId: null,
          },
        });

        cleaned++;
      } catch (err) {
        console.error(`⚠️  Cleanup error for bill ${bill._id}: ${err.message}`);
        errors++;
      }
    }

    console.log(`🧹 Cleanup complete: ${cleaned} cleaned, ${errors} errors.`);
    return { cleaned, errors };
  } catch (err) {
    console.error(`❌ Cleanup service error: ${err.message}`);
    return { cleaned: 0, errors: 1 };
  }
};

/**
 * Also clean up orphaned files in the uploads directory
 * that don't have a matching bill record
 */
const cleanupOrphanedFiles = async () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) return { cleaned: 0 };

  const cutoffTime = Date.now() - FILE_RETENTION_MS;
  let cleaned = 0;

  try {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stat = fs.statSync(filePath);

      // Skip directories and recent files
      if (stat.isDirectory()) continue;
      if (stat.mtimeMs > cutoffTime) continue;

      // Check if any bill still references this file
      const bill = await Bill.findOne({ originalFile: filePath });
      if (!bill || bill.status === 'completed') {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Cleaned orphaned file: ${file}`);
          cleaned++;
        } catch { /* ignore */ }
      }
    }
  } catch (err) {
    console.error(`⚠️  Orphan cleanup error: ${err.message}`);
  }

  return { cleaned };
};

/**
 * Start the cleanup scheduler (runs every 6 hours)
 */
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

const startCleanupScheduler = () => {
  console.log('🧹 File cleanup scheduler started (runs every 6 hours, retention: 2 days)');

  // Run once on startup after a short delay
  setTimeout(async () => {
    console.log('🧹 Running initial cleanup check...');
    await cleanupOldFiles();
    await cleanupOrphanedFiles();
  }, 30000); // 30 seconds after server start

  // Then run periodically
  setInterval(async () => {
    console.log('🧹 Running scheduled cleanup...');
    await cleanupOldFiles();
    await cleanupOrphanedFiles();
  }, CLEANUP_INTERVAL_MS);
};

module.exports = {
  cleanupOldFiles,
  cleanupOrphanedFiles,
  startCleanupScheduler,
};
