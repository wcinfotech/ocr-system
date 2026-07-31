const { db, isInitialized } = require('../config/firebase');
const https = require('https');

let isFirestoreDisabled = false;

/**
 * Log an analytics event to Firestore and optionally Google Analytics 4 (GA4)
 * @param {string} eventName - Name of the event (snake_case, e.g., 'user_login')
 * @param {Object} params - Event parameters (payload)
 * @returns {Promise<boolean>}
 */
const logEvent = async (eventName, params = {}) => {
  const timestamp = new Date();
  
  // Format parameters with system-level metadata
  const eventParams = {
    ...params,
    timestamp: timestamp.toISOString(),
    env: process.env.NODE_ENV || 'development'
  };

  // Clean undefined values from parameters for Firestore compatibility
  Object.keys(eventParams).forEach(key => {
    if (eventParams[key] === undefined) {
      eventParams[key] = null;
    }
  });

  // 1. Console log for audit and debugging
  console.log(`📊 [Analytics Event] ${eventName}:`, JSON.stringify(eventParams));

  // 2. Log to Firestore Database (if enabled)
  if (isInitialized && db && !isFirestoreDisabled) {
    try {
      await db.collection('analytics_events').add({
        eventName,
        params: eventParams,
        createdAt: timestamp
      });
    } catch (error) {
      if (error.message && (error.message.includes('PERMISSION_DENIED') || error.message.includes('disabled'))) {
        isFirestoreDisabled = true;
        console.warn(`⚠️ Cloud Firestore database is disabled or not yet created in project "escannora-dev". Backend Firestore event persistence is paused. Enable Firestore in Firebase Console if desired.`);
      } else {
        console.error(`❌ Failed to write event "${eventName}" to Firestore:`, error.message);
      }
    }
  }

  // 3. Log to GA4 Measurement Protocol (if client credentials are set in .env)
  const gaMeasurementId = process.env.GA_MEASUREMENT_ID;
  const gaApiSecret = process.env.GA_API_SECRET;

  if (gaMeasurementId && gaApiSecret) {
    try {
      // Map user id or anonymous client id
      const clientId = params.userId || params.adminId || 'anonymous_user';
      const payload = JSON.stringify({
        client_id: clientId,
        events: [
          {
            name: eventName,
            params: eventParams
          }
        ]
      });

      const options = {
        hostname: 'www.google-analytics.com',
        port: 443,
        path: `/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode !== 204) {
          console.warn(`⚠️ GA4 Measurement Protocol returned status code: ${res.statusCode}`);
        }
      });

      req.on('error', (error) => {
        console.error('❌ GA4 Measurement Protocol Request Error:', error.message);
      });

      req.write(payload);
      req.end();
    } catch (gaError) {
      console.error('❌ Failed to forward event to GA4:', gaError.message);
    }
  }

  return true;
};

/**
 * Get summary stats of logged events from Firestore
 * @returns {Promise<Object>}
 */
const getEventStats = async () => {
  if (!isInitialized || !db) {
    return { success: false, error: 'Firebase Admin SDK is not initialized' };
  }

  try {
    const snapshot = await db.collection('analytics_events').get();
    const totalEvents = snapshot.size;
    const eventCounts = {};
    const recentEvents = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const name = data.eventName;
      eventCounts[name] = (eventCounts[name] || 0) + 1;
      
      if (recentEvents.length < 10) {
        recentEvents.push({
          id: doc.id,
          eventName: data.eventName,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
          params: data.params
        });
      }
    });

    return {
      success: true,
      totalEvents,
      eventCounts,
      recentEvents
    };
  } catch (error) {
    console.error('❌ Failed to fetch event stats from Firestore:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  logEvent,
  getEventStats
};
