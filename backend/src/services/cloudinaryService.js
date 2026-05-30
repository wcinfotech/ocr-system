/**
 * ============================================
 * Cloudinary Configuration
 * ============================================
 * Cloud storage for uploaded bills.
 * Files uploaded here get a permanent URL.
 */

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<{url: string, publicId: string, format: string}>}
 */
const uploadToCloudinary = async (filePath, folder = 'billscan') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto', // auto-detect (image or raw for PDF)
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error(`❌ Cloudinary upload failed: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    // Also try image resource type
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => {});
  } catch (error) {
    console.warn(`⚠️ Cloudinary delete failed: ${error.message}`);
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
