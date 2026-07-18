import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { buySubscription, getInvoices, downloadInvoice, getSubscriptionPlans, logAnalyticsEvent } from '../services/api';
import {
  HiOutlineCheck,
  HiOutlineCreditCard,
  HiOutlineSparkles,
  HiOutlineDownload,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlineArrowRight,
} from 'react-icons/hi';

const SubscriptionPage = () => {
  const { user, refreshUser } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [activeFaq, setActiveFaq] = useState(null);
  const [buying, setBuying] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const userPlan = user?.subscription?.plan || 'Starter';

  // State initialized with fallback defaults while database loads
  const [plans, setPlans] = useState([
    {
      name: 'Starter',
      price: { monthly: 0, yearly: 0 },
      description: 'Ideal for small businesses starting out with invoice scanning.',
      features: [
        '50 bills/invoices per month',
        'Standard OCR engine',
        'Basic search and history logs',
        'Single-user account access',
        'Email support (within 48 hours)',
      ],
      icon: HiOutlineShieldCheck,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
    },
    {
      name: 'Pro',
      price: { monthly: 999, yearly: 799 },
      description: 'Advanced features and high-speed processing for growing teams.',
      features: [
        '1,500 bills/invoices per month',
        'Priority high-speed OCR pipeline',
        'Full line-items (SKUs, description, qty) parsing',
        'Bulk uploads (up to 20 files at once)',
        'Advanced analytics & spent distribution charts',
        'Export history to CSV / Excel',
        'Priority support (within 6 hours)',
      ],
      popular: true,
      icon: HiOutlineSparkles,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-200',
    },
    {
      name: 'Enterprise',
      price: { monthly: 5000, yearly: 4000 },
      description: 'Maximum capabilities, volume, security, and dedicated SLA.',
      features: [
        'Unlimited bills/invoices',
        'Dedicated custom parsing rules & templates',
        'Webhooks & API integration endpoints',
        'Multi-user team workspaces with role management',
        'Custom SSO & enhanced security guidelines',
        'Dedicated account manager & training',
        '15-minute response time SLA',
      ],
      icon: HiOutlineOfficeBuilding,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
    },
  ]);

  useEffect(() => {
    fetchInvoices();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await getSubscriptionPlans();
      if (data.success) {
        const mapped = data.data.map((p) => {
          let icon = HiOutlineShieldCheck;
          let color = 'text-slate-600';
          let bg = 'bg-slate-50';
          let border = 'border-slate-200';
          let popular = false;

          if (p.name === 'Pro') {
            icon = HiOutlineSparkles;
            color = 'text-indigo-600';
            bg = 'bg-indigo-50/50';
            border = 'border-indigo-200';
            popular = true;
          } else if (p.name === 'Enterprise') {
            icon = HiOutlineOfficeBuilding;
            color = 'text-emerald-600';
            bg = 'bg-emerald-50/50';
            border = 'border-emerald-200';
          }

          // Format benefits or fallback
          const features = p.benefits && p.benefits.length > 0
            ? p.benefits
            : p.name === 'Starter'
            ? [
                '50 bills/invoices per month',
                'Standard OCR engine',
                'Basic search and history logs',
                'Single-user account access',
                'Email support (within 48 hours)',
              ]
            : p.name === 'Pro'
            ? [
                '1,500 bills/invoices per month',
                'Priority high-speed OCR pipeline',
                'Full line-items (SKUs, description, qty) parsing',
                'Bulk uploads (up to 20 files at once)',
                'Advanced analytics & spent distribution charts',
                'Export history to CSV / Excel',
                'Priority support (within 6 hours)',
              ]
            : [
                'Unlimited bills/invoices',
                'Dedicated custom parsing rules & templates',
                'Webhooks & API integration endpoints',
                'Multi-user team workspaces with role management',
                'Custom SSO & enhanced security guidelines',
                'Dedicated account manager & training',
                '15-minute response time SLA',
              ];

          const description = p.name === 'Starter'
            ? 'Ideal for small businesses starting out with invoice scanning.'
            : p.name === 'Pro'
            ? 'Advanced features and high-speed processing for growing teams.'
            : 'Maximum capabilities, volume, security, and dedicated SLA.';

          return {
            name: p.name,
            price: {
              monthly: p.price,
              yearly: Math.round(p.price * 0.8),
            },
            description,
            features,
            popular,
            icon,
            color,
            bg,
            border,
          };
        });

        // Ensure Starter, Pro, Enterprise sorting order
        const order = { 'Starter': 1, 'Pro': 2, 'Enterprise': 3 };
        mapped.sort((a, b) => (order[a.name] || 99) - (order[b.name] || 99));

        setPlans(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const { data } = await getInvoices();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      setDownloadingId(invoiceId);
      const { data } = await downloadInvoice(invoiceId);
      
      // Create download link for PDF blob
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Receipt for ${invoiceId} downloaded.`);

      logAnalyticsEvent('subscription_download_invoice', {
        invoiceId,
      });
    } catch (err) {
      console.error('Failed to download invoice:', err);
      toast.error('Failed to download receipt PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const faqs = [
    {
      q: 'How does the billing cycles work?',
      a: 'We offer monthly and yearly subscription billing options. Selecting a yearly subscription grants you up to a 20% discount on the premium plans. You can upgrade, downgrade, or cancel your subscription at any time.',
    },
    {
      q: 'What is the "Line-Items Parsing" feature?',
      a: 'Line-Items Parsing runs an advanced parser model that goes beyond general invoice headers. It detects tabular data inside the document to extract SKU codes, descriptions, tax categories, unit prices, and quantities per product, listing them as individual line items.',
    },
    {
      q: 'Are my scanned invoices secure?',
      a: 'Absolutely. We store your uploaded invoice data and documents with enterprise-grade encryption. We strictly comply with GDPR, and your invoice files are never shared with outside parties or used for system training without permission.',
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Yes, you can cancel your subscription directly from your billing tab. You will continue to have access to your plan benefits until the end of your current billing cycle.',
    },
  ];

  const handlePlanSelect = async (planName) => {
    if (planName === userPlan) {
      toast.success(`You are already on the ${planName} plan.`);
      return;
    }

    setBuying(true);
    try {
      const { data } = await buySubscription({ plan: planName, billingPeriod });
      if (data.success) {
        toast.success(`Subscription upgraded to ${planName} successfully! Invoice sent to your email.`);
        
        logAnalyticsEvent('subscription_upgrade_success', {
          oldPlan: userPlan,
          newPlan: planName,
          billingPeriod,
        });

        await refreshUser();
        await fetchInvoices(); // Refresh invoice list dynamically!
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update subscription. Please try again.';
      toast.error(errMsg);
    } finally {
      setBuying(false);
    }
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-10">
      {/* Title Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Subscription & Plans
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Scale your invoice processing workflow with powerful OCR scanning features, custom parsing pipelines, and priority support.
        </p>

        {/* Toggle Monthly/Yearly */}
        <div className="inline-flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`relative px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              billingPeriod === 'yearly'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Yearly Billing
            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold tracking-wide uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => {
          const PlanIcon = p.icon;
          const isCurrent = userPlan === p.name;
          const cta = isCurrent ? 'Current Plan' : p.name === 'Starter' ? 'Downgrade to Starter' : `Upgrade to ${p.name}`;
          const displayPrice =
            typeof p.price[billingPeriod] === 'number'
              ? `₹${p.price[billingPeriod].toLocaleString('en-IN')}`
              : p.price[billingPeriod];

          return (
            <div
              key={p.name}
              className={`glass-card relative flex flex-col justify-between p-8 bg-white border ${
                p.popular ? 'border-2 border-indigo-600 ring-4 ring-indigo-50/50 shadow-md' : p.border
              } rounded-3xl transition-all duration-300 hover:-translate-y-1`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-md shadow-indigo-600/10">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${p.bg} flex items-center justify-center`}>
                    <PlanIcon className={`w-5 h-5 ${p.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{isCurrent ? 'Current Plan' : 'SaaS Tier'}</p>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {displayPrice}
                    </span>
                    {typeof p.price[billingPeriod] === 'number' && (
                      <span className="text-slate-400 text-xs font-semibold ml-1">/ month</span>
                    )}
                  </div>
                  {billingPeriod === 'yearly' && typeof p.price.yearly === 'number' && (
                    <p className="text-emerald-600 text-[10px] font-bold mt-1 uppercase tracking-wide">
                      Billed ₹{(p.price.yearly * 12).toLocaleString('en-IN')} annually
                    </p>
                  )}
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">{p.description}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100" />

                {/* Features List */}
                <div className="space-y-3.5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Features included:</p>
                  <ul className="space-y-3">
                    {p.features.map((f, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-full ${p.popular ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'} flex items-center justify-center shrink-0 mt-0.5`}>
                          <HiOutlineCheck className="w-3.5 h-3.5 font-bold" />
                        </div>
                        <span className="text-slate-600 text-xs font-medium leading-normal">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePlanSelect(p.name)}
                disabled={isCurrent || buying}
                className={`w-full mt-8 py-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : p.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/10 active:scale-[0.98]'
                    : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]'
                }`}
              >
                {buying && !isCurrent ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-500/30 border-t-indigo-600 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {cta}
                    {!isCurrent && <HiOutlineArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Grid: FAQ & Billing History */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-8">
        {/* FAQs */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineCreditCard className="w-5 h-5 text-indigo-600" />
            Frequently Asked Questions
          </h3>
          <div className="glass-card bg-white border border-slate-200 rounded-3xl p-5 divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-slate-800 hover:text-indigo-600 text-xs transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 font-semibold ml-4 text-base leading-none">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="text-slate-500 text-xs mt-2.5 leading-relaxed pl-1 transition-all duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineCreditCard className="w-5 h-5 text-indigo-600" />
            Billing History
          </h3>
          <div className="glass-card bg-white border border-slate-200 rounded-3xl p-4 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {loadingInvoices ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Loading history...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-semibold">No invoice history found.</p>
                </div>
              ) : (
                invoices.map((bill) => (
                  <div key={bill.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{bill.plan}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {bill.date} &bull; <span className="font-mono">{bill.id}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-900">
                        {bill.amount > 0 ? `₹${bill.amount.toLocaleString('en-IN')}` : 'Free'}
                      </span>
                      {bill.amount > 0 ? (
                        <button
                          onClick={() => handleDownloadInvoice(bill.id)}
                          disabled={downloadingId === bill.id}
                          className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 hover:text-indigo-600 text-slate-400 transition-colors disabled:opacity-50"
                          title="Download Receipt"
                        >
                          {downloadingId === bill.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                          ) : (
                            <HiOutlineDownload className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-200/50">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
