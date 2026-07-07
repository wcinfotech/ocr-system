const ActivityLog = require('../models/ActivityLog');
const Setting = require('../models/Setting');

const activityLogger = async (req, res, next) => {
  const startTime = Date.now();
  const path = req.originalUrl || req.url;

  // Prevent infinite loops by ignoring logging routes, health checks, static files, and notifications
  if (
    path.includes('/activity-logs') ||
    path.includes('/audit-logs') ||
    path.includes('/logs') ||
    path.includes('/health') ||
    path.includes('/uploads') ||
    path.includes('/notifications')
  ) {
    return next();
  }

  // Capture response payload
  let responseBody = null;
  const oldSend = res.send;
  const oldJson = res.json;

  res.send = function (chunk) {
    if (chunk) {
      try {
        if (typeof chunk === 'string') {
          responseBody = JSON.parse(chunk);
        } else if (Buffer.isBuffer(chunk)) {
          responseBody = JSON.parse(chunk.toString('utf8'));
        } else {
          responseBody = chunk;
        }
      } catch (e) {
        responseBody = String(chunk);
      }
    }
    return oldSend.apply(res, arguments);
  };

  res.json = function (chunk) {
    responseBody = chunk;
    return oldJson.apply(res, arguments);
  };

  // Wait for the response to finish
  res.on('finish', async () => {
    try {
      const settingsDoc = await Setting.findOne({ key: 'system_settings' });
      const settings = settingsDoc ? settingsDoc.value : {};

      const savePayload = settings.activityLogSavePayload === true;

      // Extract performer context from request
      const admin = req.admin || null;
      const user = req.user || null;
      const adminName = admin ? admin.name : (user ? user.name : 'Guest');

      let details = `${req.method} request to ${req.originalUrl} returned status ${res.statusCode}`;
      if (admin) {
        details = `Admin ${admin.name} performed ${req.method} ${req.originalUrl} (Status: ${res.statusCode})`;
      } else if (user) {
        details = `User ${user.name} performed ${req.method} ${req.originalUrl} (Status: ${res.statusCode})`;
      }

      const logData = {
        admin: admin ? admin._id : null,
        adminName,
        action: `${req.method} ${req.originalUrl.split('?')[0]}`,
        details,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
      };

      if (savePayload) {
        let reqBody = req.body;
        if (reqBody && typeof reqBody === 'object') {
          reqBody = JSON.parse(JSON.stringify(reqBody));
          // Redact sensitive credentials
          if (reqBody.password) reqBody.password = '[REDACTED]';
          if (reqBody.token) reqBody.token = '[REDACTED]';
          if (reqBody.refreshToken) reqBody.refreshToken = '[REDACTED]';
        }
        logData.requestBody = reqBody;
        logData.responseBody = responseBody;
      }

      await ActivityLog.create(logData);
    } catch (err) {
      console.error('Failed to log API request activity:', err.message);
    }
  });

  next();
};

module.exports = activityLogger;
