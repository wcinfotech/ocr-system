const { initializeApp, cert } = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let serviceAccount = null;

try {
  // 1. Check environment variable (JSON string or file path)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      if (fs.existsSync(filePath)) {
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    }
  }

  // 2. Search potential file paths if not loaded via env
  if (!serviceAccount) {
    const candidatePaths = [
      path.join(process.cwd(), 'escannora-dev-firebase-adminsdk-fbsvc-b30ea2f890.json'),
      path.join(process.cwd(), '../escannora-dev-firebase-adminsdk-fbsvc-b30ea2f890.json'),
      path.join(__dirname, '../../escannora-dev-firebase-adminsdk-fbsvc-b30ea2f890.json'),
      path.join(__dirname, '../../../escannora-dev-firebase-adminsdk-fbsvc-b30ea2f890.json'),
      path.join(__dirname, '../escannora-dev-firebase-adminsdk-fbsvc-b30ea2f890.json'),
      path.join(__dirname, '../../../escannova-development-firebase-adminsdk-fbsvc-0f437a5d0b.json'),
    ];

    for (const devPath of candidatePaths) {
      if (fs.existsSync(devPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(devPath, 'utf8'));
        break;
      }
    }
  }
} catch (error) {
  console.error('❌ Failed to parse Firebase Service Account JSON:', error.message);
}

let db = null;
let isInitialized = false;
let app = null;

try {
  if (serviceAccount) {
    app = initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
    isInitialized = true;
    console.log(`\n🔥 Firebase Admin SDK initialized with Service Account for project: ${serviceAccount.project_id || 'escannora-dev'}`);
  } else {
    // Initialize in default project mode (allows ID token verification without private key)
    const projectId = process.env.FIREBASE_PROJECT_ID || 'escannora-dev';
    app = initializeApp({
      projectId
    });
    isInitialized = true;
    console.log(`\n🔥 Firebase Admin SDK initialized in public token verification mode for project: ${projectId}`);
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
}

module.exports = {
  app,
  db,
  isInitialized
};
