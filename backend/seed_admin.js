const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Admin = require('./src/models/Admin');
const Plan = require('./src/models/Plan');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');

    // 1. Seed Super Admin
    const adminEmail = 'admin@local.dev';
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('Seeding default Super Admin account...');
      await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'SUPER_ADMIN',
        permissions: ['*'],
      });
      console.log(`✅ Super Admin created: Email: ${adminEmail}, Password: adminpassword123`);
    } else {
      console.log('ℹ️ Super Admin account already exists.');
    }

    // 2. Seed Default Plans if none exist
    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      console.log('Seeding default subscription plans...');
      const defaultPlans = [
        {
          name: 'Starter',
          price: 0,
          currency: 'INR',
          ocrLimit: 50,
          storageMb: 100,
          durationDays: 30,
          benefits: ['50 scans/mo', 'Email support', '100MB storage'],
          status: 'active',
        },
        {
          name: 'Pro',
          price: 999,
          currency: 'INR',
          ocrLimit: 1000,
          storageMb: 1024,
          durationDays: 30,
          benefits: ['1000 scans/mo', 'Priority support', '1GB storage', 'Multi-item extraction'],
          status: 'active',
        },
        {
          name: 'Enterprise',
          price: 5000,
          currency: 'INR',
          ocrLimit: 10000,
          storageMb: 10240,
          durationDays: 30,
          benefits: ['Unlimited scans/mo', 'Dedicated support', '10GB storage', 'Platform analytics'],
          status: 'active',
        },
      ];
      await Plan.insertMany(defaultPlans);
      console.log('✅ Subscription plans seeded!');
    } else {
      console.log('ℹ️ Subscription plans already exist in database.');
    }

    // 3. Seed Default Blogs if none exist
    const Blog = require('./src/models/Blog');
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      console.log('Seeding default blogs...');
      const defaultBlogs = [
        {
          title: 'How Layout parsing is replacing manual invoice keying',
          excerpt: 'Discover how modern structured parsing algorithms read document layouts, extract tables, and map cells automatically.',
          category: 'Document Automation',
          content: '<p>Manual keying of invoice fields is slow and prone to errors. With layout-aware document structure extraction, OCR systems can extract GST breakdowns, vendor details, and item lists in milliseconds...</p>',
          author: 'Escannora Team',
          isPublished: true,
        },
        {
          title: '5 Best practices for warehouse dispatch barcode verification',
          excerpt: 'Learn how to construct error-proof shipping checkpoints using 1D/2D scanning and automate order verification workflows.',
          category: 'Logistics Operations',
          content: '<p>Integrating barcode verifiers into your packing stations significantly reduces return rates. Always cross-match label SKUs against order databases in real-time...</p>',
          author: 'Escannora Team',
          isPublished: true,
        },
        {
          title: 'Optimizing GST billing extraction for Indian eCommerce marketplaces',
          excerpt: 'A comprehensive guide to automated parser matching of tax, CGST, SGST, IGST totals from Amazon and Flipkart seller bills.',
          category: 'Taxes & Compliance',
          content: '<p>E-commerce sellers in India handle high volumes of tax invoices. Automatic extraction of CGST, SGST, and IGST components simplifies compliance and monthly ledger matching...</p>',
          author: 'Escannora Team',
          isPublished: true,
        }
      ];
      await Blog.insertMany(defaultBlogs);
      console.log('✅ Default blogs seeded!');
    } else {
      console.log('ℹ️ Blogs already exist in database.');
    }

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
