const { initializeApp, cert } = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let serviceAccount = null;

try {
  // Option 1: Load from environment variable (JSON string or file path)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      // If not JSON string, try reading it as file path
      const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      if (fs.existsSync(filePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    }
  } else {
    // Option 2: Default location in development (root of project)
    const newDevPath = path.join(__dirname, '../../../escannora-dev-firebase-adminsdk-fbsvc-b30ea2f890.json');
    const oldDevPath = path.join(__dirname, '../../../escannova-development-firebase-adminsdk-fbsvc-0f437a5d0b.json');
    const devPath = fs.existsSync(newDevPath) ? newDevPath : oldDevPath;
    
    if (fs.existsSync(devPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(devPath, 'utf8'));
    } else {
      console.warn('⚠️ Firebase Service Account JSON not found at:', devPath);
    }
  }
} catch (error) {
  console.error('❌ Failed to parse Firebase Service Account JSON:', error.message);
}

let db = null;
let isInitialized = false;
let app = null;

if (serviceAccount) {
  try {
    app = initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
    isInitialized = true;
    console.log(`\n🔥 Firebase Admin SDK initialized successfully for project: ${serviceAccount.project_id}`);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
} else {
  console.warn('⚠️ Firebase Admin SDK is NOT initialized because no valid service account credentials were found.');
}

module.exports = {
  app,
  db,
  isInitialized
};
