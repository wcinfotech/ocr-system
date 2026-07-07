/**
 * ============================================
 * Subscription Controller
 * ============================================
 * Handles subscription updates, invoice listing, and PDF invoice downloads
 */

const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const { sendSubscriptionInvoiceEmail } = require('../services/emailService');
const { generateInvoicePDF } = require('../services/pdfService');

/**
 * @desc    Buy / Upgrade a subscription
 * @route   POST /api/v1/subscription/buy
 * @access  Private
 */
const buySubscription = async (req, res) => {
  try {
    const { plan, billingPeriod } = req.body;

    // Fetch plan from database dynamically
    const dbPlan = await Plan.findOne({ name: plan, status: 'active' });
    if (!dbPlan) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid plan (Starter, Pro, Enterprise)',
      });
    }

    const validBillingPeriod = billingPeriod === 'yearly' ? 'yearly' : 'monthly';

    // Find user and update subscription
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    user.subscription = {
      plan: dbPlan.name,
      billingPeriod: validBillingPeriod,
      status: 'active',
      startDate: new Date(),
    };

    await user.save();

    // Deactivate previous active subscriptions for this user
    await Subscription.updateMany({ user: user._id, status: 'active' }, { status: 'canceled' });

    // Calculate dynamic duration days
    const durationDays = validBillingPeriod === 'yearly' ? 365 : dbPlan.durationDays;

    // Create Subscription record in database
    await Subscription.create({
      user: user._id,
      userName: user.name,
      plan: dbPlan._id,
      planName: dbPlan.name,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      autoRenew: true,
    });

    // Determine price dynamically based on plan and cycle
    let price = dbPlan.price;
    if (validBillingPeriod === 'yearly') {
      price = Math.round(dbPlan.price * 0.8);
    }

    // Generate dynamic invoice details
    const invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    // Create Invoice record in database
    await Invoice.create({
      user: user._id,
      invoiceId,
      plan: plan,
      amount: price,
      billingPeriod: validBillingPeriod === 'yearly' ? 'Yearly' : 'Monthly',
      status: price > 0 ? 'paid' : 'free',
    });

    // Send invoice email asynchronously
    sendSubscriptionInvoiceEmail(user.email, user.name, {
      plan,
      billingPeriod: validBillingPeriod === 'yearly' ? 'Yearly Billing' : 'Monthly Billing',
      price,
      invoiceId,
      date: formattedDate,
    }).catch((err) => {
      console.error(`Subscription email send error: ${err.message}`);
    });

    res.json({
      success: true,
      message: `Successfully subscribed to ${plan} plan!`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(`Buy subscription error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's invoices
 * @route   GET /api/v1/subscription/invoices
 * @access  Private
 */
const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id }).sort({ createdAt: -1 });

    const formattedInvoices = invoices.map((inv) => ({
      id: inv.invoiceId,
      date: new Date(inv.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      plan: `${inv.plan} Plan - ${inv.billingPeriod}`,
      amount: inv.amount,
      status: inv.status,
    }));

    res.json({
      success: true,
      data: formattedInvoices,
    });
  } catch (error) {
    console.error(`Get invoices error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Download invoice PDF
 * @route   GET /api/v1/subscription/invoices/:invoiceId/download
 * @access  Private
 */
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId, user: req.user._id });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    const user = req.user;
    const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const pdfBuffer = await generateInvoicePDF({
      invoiceId: invoice.invoiceId,
      date: formattedDate,
      userName: user.name,
      userEmail: user.email,
      plan: invoice.plan,
      billingPeriod: invoice.billingPeriod === 'Yearly' ? 'Yearly Billing' : 'Monthly Billing',
      price: invoice.amount,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(`Download invoice error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * @desc    Get active subscription plans
 * @route   GET /api/v1/subscription/plans
 * @access  Private
 */
const getActivePlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'active' });
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error(`Get active plans error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  buySubscription,
  getMyInvoices,
  downloadInvoice,
  getActivePlans,
};
