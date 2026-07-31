/**
 * ============================================
 * Email Service
 * ============================================
 * Handles sending emails using Nodemailer with SMTP
 */

const nodemailer = require('nodemailer');

// Create reusable transporter object using the SMTP config from environment variables
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const isGmail = host.toLowerCase().includes('gmail');
  const user = process.env.SMTP_USER || 'contact.kitchenbazaar@gmail.com';
  const pass = process.env.SMTP_PASS || 'huymugqwnbdfnona';

  if (isGmail) {
    // Gmail service configuration uses port 465 (SSL) automatically
    // which bypasses port 587 firewall blocks enforced on live cloud providers
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  // Custom SMTP server configuration
  const port = parseInt(process.env.SMTP_PORT || '465');
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const transporter = createTransporter();

/**
 * Send an email helper function
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'BillScan Pro Support'}" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'contact.kitchenbazaar@gmail.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully to ${options.email} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service] Primary SMTP send failed for ${options.email}: ${error.message}`);
    
    // Fallback retry using direct Gmail service if standard send failed
    try {
      console.log(`[Email Service] Attempting retry via fallback Gmail SSL transporter...`);
      const fallbackTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || 'contact.kitchenbazaar@gmail.com',
          pass: process.env.SMTP_PASS || 'huymugqwnbdfnona',
        },
        tls: { rejectUnauthorized: false },
      });
      const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[Email Service] Fallback email sent successfully to ${options.email} (MessageId: ${fallbackInfo.messageId})`);
      return { success: true, messageId: fallbackInfo.messageId };
    } catch (fallbackError) {
      console.error(`[Email Service] Fallback email delivery also failed: ${fallbackError.message}`);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Send Welcome Email to registered user
 * @param {string} email - User email
 * @param {string} name - User name
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to BillScan Pro! 🚀 Account Created Successfully';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.05em; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #0f172a; font-size: 20px; margin-top: 0; }
        .content p { color: #475569; font-size: 15px; margin-bottom: 24px; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; margin-top: 10px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
        .feature-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
        .feature-title { font-weight: 700; color: #334155; margin-bottom: 4px; font-size: 14px; }
        .feature-desc { font-size: 13px; color: #64748b; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BillScan Pro</h1>
        </div>
        <div class="content">
          <h2>Welcome, ${name}!</h2>
          <p>We are absolutely thrilled to welcome you to <strong>BillScan Pro</strong>. Your account has been registered successfully!</p>
          
          <p>BillScan Pro is designed to help you automate invoice details extraction with 99.9% accuracy using state-of-the-art AI-powered OCR tools. Here is what you can do right now:</p>
          
          <div class="feature-card">
            <div class="feature-title">⚡ Instant Uploads & Scans</div>
            <p class="feature-desc">Drag & drop your invoices in PDF, PNG, JPG, or ZIP format and let our AI parser extract items instantly.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-title">📊 Analytics Dashboard</div>
            <p class="feature-desc">Monitor your expenses, inspect vendor spend distributions, and review billing trends in real-time.</p>
          </div>

          <div style="text-align: center; margin: 30px 0 10px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 BillScan Pro. All rights reserved.</p>
          <p style="margin-top: 5px;">If you have any questions, feel free to reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ email, subject, html });
};

/**
 * Send Support Ticket Confirmation Email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Object} ticket - Ticket details
 * @param {string} ticket.id - Ticket ID
 * @param {string} ticket.subject - Ticket Subject
 * @param {string} ticket.category - Ticket Category
 * @param {string} ticket.priority - Ticket Priority
 * @param {string} ticket.message - Ticket Message details
 */
const sendTicketConfirmationEmail = async (email, name, ticket) => {
  const subject = `[BillScan Pro Support] Ticket Raised Successfully: #${ticket.id}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #0f172a; font-size: 18px; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
        .content p { color: #475569; font-size: 14px; margin-bottom: 20px; }
        .ticket-details { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .ticket-row { display: flex; margin-bottom: 10px; font-size: 13px; }
        .ticket-row:last-child { margin-bottom: 0; }
        .ticket-label { font-weight: 700; color: #64748b; width: 120px; shrink: 0; }
        .ticket-value { color: #1e293b; font-weight: 500; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid; }
        .badge-high { background-color: #fef2f2; color: #991b1b; border-color: #fca5a5; }
        .badge-medium { background-color: #fffbeb; color: #92400e; border-color: #fcd34d; }
        .badge-low { background-color: #f8fafc; color: #334155; border-color: #cbd5e1; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
        .highlight-notice { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #1e40af; font-weight: 600; text-align: center; margin: 24px 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Support Ticket Confirmation</h1>
        </div>
        <div class="content">
          <h2>Ticket Raised: #${ticket.id}</h2>
          <p>Hello ${name},</p>
          <p>Thank you for reaching out to BillScan Pro Support. We have successfully registered your support ticket under ID <strong>#${ticket.id}</strong>.</p>
          
          <div class="ticket-details">
            <div class="ticket-row">
              <span class="ticket-label">Ticket ID:</span>
              <span class="ticket-value" style="font-family: monospace; font-weight: 700;">#${ticket.id}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Subject:</span>
              <span class="ticket-value">${ticket.subject}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Category:</span>
              <span class="ticket-value">${ticket.category}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Priority:</span>
              <span>
                <span class="badge badge-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
              </span>
            </div>
            <div class="ticket-row" style="margin-top: 15px; flex-direction: column;">
              <span class="ticket-label" style="width: 100%; margin-bottom: 5px;">Description:</span>
              <span class="ticket-value" style="display: block; font-style: italic; background-color: #ffffff; padding: 10px; border-radius: 6px; border: 1px dashed #cbd5e1; white-space: pre-wrap;">${ticket.message}</span>
            </div>
          </div>

          <div class="highlight-notice">
            🕒 Our support team is reviewing your ticket and will reach out to you within 24 hours.
          </div>
        </div>
        <div class="footer">
          <p>© 2026 BillScan Pro. All rights reserved.</p>
          <p style="margin-top: 5px;">This is an automated confirmation of your request. Please do not reply directly to this email unless updating the ticket details.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ email, subject, html });
};

/**
 * Send Subscription Invoice/Purchase Confirmation Email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Object} subscription - Subscription details
 * @param {string} subscription.plan - Plan Name (e.g. Pro, Enterprise)
 * @param {string} subscription.billingPeriod - Billing Period (monthly or yearly)
 * @param {number} subscription.price - Cost in rupees
 * @param {string} subscription.invoiceId - Invoice ID (e.g. INV-2026-X)
 * @param {string} subscription.date - Purchase date
 */
const sendSubscriptionInvoiceEmail = async (email, name, subscription) => {
  const subject = `🎉 Subscription Invoice for BillScan Pro: ${subscription.plan} Plan - #${subscription.invoiceId}`;
  
  // Calculate total, tax, and details
  const price = subscription.price;
  const tax = Math.round(price * 0.18); // 18% GST mock
  const total = price + tax;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #0f172a; font-size: 18px; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
        .content p { color: #475569; font-size: 14px; margin-bottom: 20px; }
        .invoice-box { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0; }
        .invoice-header { background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #64748b; }
        .invoice-body { padding: 20px; }
        .invoice-table { w-full; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .invoice-table th { text-align: left; padding: 8px; border-bottom: 2px solid #f1f5f9; color: #64748b; font-weight: 700; }
        .invoice-table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .total-row { font-weight: 700; color: #0f172a; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
        .cta-btn { display: inline-block; background-color: #10b981; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 13px; margin-top: 15px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Subscription Purchased!</h1>
        </div>
        <div class="content">
          <h2>Invoice #${subscription.invoiceId}</h2>
          <p>Dear ${name},</p>
          <p>Thank you for upgrading! Your subscription to <strong>BillScan Pro (${subscription.plan} Plan)</strong> has been successfully processed.</p>
          <p>Below is your payment receipt and subscription breakdown details. Your limits have been instantly updated in your account.</p>
          
          <div class="invoice-box">
            <div class="invoice-header">
              <span>DATE: ${subscription.date}</span>
              <span style="float: right;">INVOICE ID: #${subscription.invoiceId}</span>
            </div>
            <div class="invoice-body">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                    <th style="padding: 10px 0; color: #475569; font-size: 12px;">Plan Description</th>
                    <th style="padding: 10px 0; text-align: right; color: #475569; font-size: 12px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 0; font-size: 13px; font-weight: 600; color: #1e293b;">
                      BillScan Pro - ${subscription.plan} Subscription (${subscription.billingPeriod})
                      <br/>
                      <span style="font-size: 11px; font-weight: 400; color: #64748b;">Includes 1,500 scans/month, bulk uploads, SKU extraction, and priority support.</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right; font-size: 13px; font-weight: 600; color: #1e293b;">₹${price.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 0; font-size: 12px; color: #64748b;">Subtotal</td>
                    <td style="padding: 12px 0; text-align: right; font-size: 12px; color: #1e293b;">₹${price.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0; font-size: 12px; color: #64748b;">Tax (GST 18%)</td>
                    <td style="padding: 12px 0; text-align: right; font-size: 12px; color: #1e293b;">₹${tax.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style="font-weight: 700;">
                    <td style="padding: 15px 0; font-size: 14px; color: #0f172a;">Grand Total (Paid)</td>
                    <td style="padding: 15px 0; text-align: right; font-size: 16px; color: #10b981;">₹${total.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="text-align: center; margin: 15px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="cta-btn">Access Your Pro Features</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 BillScan Pro. All rights reserved.</p>
          <p style="margin-top: 5px;">If you need to change your billing info, please go to your subscription settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ email, subject, html });
};

/**
 * Send Support Ticket Reply/Status Update Email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Object} ticket - Ticket details
 * @param {string} ticket.id - Ticket ID
 * @param {string} ticket.subject - Ticket Subject
 * @param {string} ticket.status - Ticket status
 * @param {string} ticket.reply - The reply text from admin
 */
const sendTicketReplyEmail = async (email, name, ticket) => {
  const subject = `[BillScan Pro Support] New Reply to Support Ticket #${ticket.id}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .content h2 { color: #0f172a; font-size: 18px; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
        .content p { color: #475569; font-size: 14px; margin-bottom: 20px; }
        .reply-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .reply-header { font-weight: 700; color: #1e40af; margin-bottom: 10px; font-size: 13px; text-transform: uppercase; }
        .reply-message { color: #1e293b; font-size: 14px; white-space: pre-wrap; font-style: italic; }
        .ticket-info { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 20px; font-size: 13px; }
        .ticket-row { display: flex; margin-bottom: 6px; }
        .ticket-row:last-child { margin-bottom: 0; }
        .ticket-label { font-weight: 700; color: #64748b; width: 100px; shrink: 0; }
        .ticket-value { color: #1e293b; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid; }
        .badge-open { background-color: #eef2ff; color: #4338ca; border-color: #c7d2fe; }
        .badge-closed { background-color: #ecfdf5; color: #047857; border-color: #a7f3d0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Customer Support Update</h1>
        </div>
        <div class="content">
          <h2>Support Update: Ticket #${ticket.id}</h2>
          <p>Hello ${name},</p>
          <p>Our support team has posted a new update to your support ticket <strong>#${ticket.id}</strong>.</p>
          
          <div class="reply-box">
            <div class="reply-header">💬 Message from Support:</div>
            <div class="reply-message">${ticket.reply}</div>
          </div>

          <div class="ticket-info">
            <div class="ticket-row">
              <span class="ticket-label">Subject:</span>
              <span class="ticket-value">${ticket.subject}</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Status:</span>
              <span>
                <span class="badge badge-${ticket.status.toLowerCase()}">${ticket.status}</span>
              </span>
            </div>
          </div>

          <p>You can review this ticket's status on your dashboard under the Support section.</p>
        </div>
        <div class="footer">
          <p>© 2026 BillScan Pro. All rights reserved.</p>
          <p style="margin-top: 5px;">This is an automated notification. If you have further queries, you can raise a follow-up ticket in the customer portal.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ email, subject, html });
};

/**
 * Send OTP for Password Change/Reset
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @param {string} otp - OTP Code
 */
const sendOtpEmail = async (email, name, otp) => {
  const subject = `🔐 Your OTP Verification Code: ${otp}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
        .content { padding: 40px 30px; text-align: center; line-height: 1.6; }
        .content h2 { color: #0f172a; font-size: 20px; margin-top: 0; }
        .content p { color: #475569; font-size: 14px; margin-bottom: 24px; }
        .otp-code { display: inline-block; background-color: #f1f5f9; color: #4f46e5; padding: 12px 30px; border-radius: 12px; font-weight: 800; font-size: 32px; letter-spacing: 6px; border: 1px solid #e2e8f0; margin: 10px 0; }
        .expiry-text { font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 15px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BillScan Pro</h1>
        </div>
        <div class="content">
          <h2>Verification Required</h2>
          <p>Hello ${name},</p>
          <p>We received a request to verify your identity for updating your account password. Please use the following One-Time Password (OTP) to complete the flow:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p class="expiry-text">⚠️ This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 BillScan Pro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return await sendEmail({ email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTicketConfirmationEmail,
  sendSubscriptionInvoiceEmail,
  sendTicketReplyEmail,
  sendOtpEmail,
};
