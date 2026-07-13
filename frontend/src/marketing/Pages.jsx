import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicSettings, getBlogs } from '../services/api';
import {
  Navbar,
  Footer,
  PricingCard,
  FAQ,
  CTA,
  Breadcrumb,
  BlogTemplate
} from './Templates';
import SEO from '../components/SEO';
import {
  Check,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Zap,
  ShieldCheck,
  Star,
  Users,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  Cpu,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

/* =========================================================================
   ABOUT US PAGE
   ========================================================================= */
export const AboutUs = () => {
  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <SEO
        title="About Us — Our OCR Document Parsing Mission"
        description="Learn how Escannora is automating back-office shipping and logistics data extraction using advanced deep learning layout OCR."
      />
      <Navbar />
      <Breadcrumb items={[{ name: 'About Us', path: '' }]} />

      <section className="py-20 text-center relative max-w-4xl mx-auto px-6 space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/50 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
          <Building className="w-3.5 h-3.5" /> Our Company
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Automating physical paper workflows for e-commerce
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
          At Escannora, we build intelligent layout-aware OCR extraction engines that help high-growth eCommerce brands and logistics teams automate invoice processing.
        </p>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We strive to eliminate manual data entry. By training advanced neural nets to understand document layout structures, we turn raw images into instantly queryable database records.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Security First</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Serving enterprise customers means adhering to strict security. Escannora operates with SOC-2 guidelines, AES-256 encryption, and complete user data retention management.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Global Reach</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              With servers spread across major clouds, we scan barcode labels, packing lists, and commercial bills globally in under 300 milliseconds.
            </p>
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
};

/* =========================================================================
   PRICING PAGE
   ========================================================================= */
export const PricingPage = () => {
  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <SEO
        title="Pricing Plans — OCR Scanning Subscriptions"
        description="Choose the right document volume package for your eCommerce store. Starter, Pro, and Enterprise options available with a 14-day free trial."
      />
      <Navbar />
      <Breadcrumb items={[{ name: 'Pricing', path: '' }]} />
      <PricingCard />
      <FAQ />
      <Footer />
    </div>
  );
};

/* =========================================================================
   FEATURES PAGE
   ========================================================================= */
export const FeaturesPage = () => {
  const categories = [
    {
      title: 'Invoice Scanning & Extraction',
      desc: 'Process PDF, PNG, or JPG bills. Extract vendor details, line items, CGST/SGST taxes, total due, and invoice date.',
      features: ['Automated field matching', 'Layout-aware neural nets', 'JSON/CSV export logs', 'Multi-currency parsing']
    },
    {
      title: 'Barcode & Shipping Validation',
      desc: 'Verify barcode labels on incoming packing slips against catalog orders to ensure dispatch correctness.',
      features: ['1D & 2D code recognition', 'AWB verification checks', 'Warehouse list sync', 'Discrepancy alerting']
    },
    {
      title: 'Integrations & Developer APIs',
      desc: 'Connect your storefront directly. We support WooCommerce, Shopify, Amazon, Meesho, Flipkart, and custom webhooks.',
      features: ['REST API endpoints', 'Instant webhooks', 'Encrypted connection keys', 'Detailed logging analytics']
    }
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <SEO
        title="Features — Intelligent OCR Capabilities"
        description="Explore Escannora features including automated billing parsing, barcode scanning, order sync, and developer APIs."
      />
      <Navbar />
      <Breadcrumb items={[{ name: 'Features', path: '' }]} />

      <section className="py-20 text-center max-w-4xl mx-auto px-6 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Everything you need for document automation
        </h1>
        <p className="text-base text-slate-500 max-w-2xl mx-auto">
          Scale your e-commerce operations by replacing physical checking and manual invoice logging with automated layout classification.
        </p>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          {categories.map((cat, idx) => (
            <div key={idx} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="space-y-6 text-left">
                <h2 className="text-2xl font-extrabold text-slate-900">{cat.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{cat.desc}</p>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {cat.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 aspect-video flex flex-col justify-between shadow-inner">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extraction Logs</span>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase">99.9% Match</span>
                </div>
                <div className="flex-1 py-6 space-y-3 font-mono text-[10px] text-slate-600">
                  <div>&#123;</div>
                  <div className="pl-4">"vendor": "Amazon Retail India",</div>
                  <div className="pl-4">"gst_number": "29AABCX1234F1ZA",</div>
                  <div className="pl-4">"total_amount": 14250.00,</div>
                  <div className="pl-4">"items_count": 8</div>
                  <div>&#125;</div>
                </div>
                <div className="h-2 w-full bg-blue-600/10 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-blue-600 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
};

/* =========================================================================
   CONTACT US PAGE
   ========================================================================= */
export const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    supportEmail: 'support@escannora.com',
    contactPhone: '+1 (800) 555-0199',
    contactAddress: '100 Pine Street, San Francisco, CA 94111',
  });

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const { data } = await getPublicSettings();
        if (data.success && data.data) {
          setContactInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching dynamic contact details:', error);
      }
    };
    fetchContactDetails();
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Your message has been sent! Our support team will write back shortly.');
      setName('');
      setEmail('');
      setMsg('');
      setSending(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <SEO
        title="Contact Us — Get in Touch with Escannora Support"
        description="Have questions about custom invoice parser setup or enterprise subscription pricing? Message our logistics specialists today."
      />
      <Navbar />
      <Breadcrumb items={[{ name: 'Contact Us', path: '' }]} />

      <section className="py-16 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Info */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Talk to our product specialists</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              We help e-commerce operations structure document indexing. Get in touch to schedule custom billing integrations or API sandbox configuration.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Email Sales & Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">{contactInfo.supportEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Phone Hotline</h4>
                <p className="text-xs text-slate-500 mt-0.5">{contactInfo.contactPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Corporate HQ</h4>
                <p className="text-xs text-slate-500 mt-0.5">{contactInfo.contactAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lead Form Card */}
        <div className="lg:col-span-7">
          <div className="glass-card bg-white p-8 sm:p-10 border border-slate-200 shadow-xl rounded-3xl text-left">
            <form onSubmit={handleSend} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Message</label>
                <textarea
                  rows={4}
                  required
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                  placeholder="Tell us about your document volume and storefront platforms..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-xl shadow-lg"
              >
                {sending ? 'Sending Message...' : 'Send Message'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* =========================================================================
   BLOG PAGE
   ========================================================================= */
export const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await getBlogs();
        if (data.success && data.data) {
          const mapped = data.data.map(p => ({
            title: p.title,
            excerpt: p.excerpt,
            category: p.category,
            content: p.content,
            date: new Date(p.publishedAt || p.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            slug: p.slug,
          }));
          setPosts(mapped);
        }
      } catch (err) {
        console.error('Failed to load dynamic blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return <BlogTemplate posts={posts} loading={loading} />;
};

/* =========================================================================
   BOOK DEMO PAGE
   ========================================================================= */
export const BookDemo = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <SEO
        title="Book a Demo — Schedule Escannora Walkthrough"
        description="Schedule a 1-on-1 session with our engineers to configure your custom OCR parser layout rules."
      />
      <Navbar />
      
      <section className="py-20 max-w-xl mx-auto px-6 text-center">
        <div className="glass-card bg-white p-10 border border-slate-200 shadow-xl rounded-3xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <Calendar className="w-7 h-7" />
          </div>
          
          {!submitted ? (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book a live 1:1 demo</h1>
                <p className="text-xs text-slate-500">See how Escannora extracts invoices, checks barcode shipping sheets, and syncs products.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="name@company.com"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-xl shadow-lg"
                >
                  Schedule Setup Call <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 py-6 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Request Submitted!</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                We've sent an invitation link to <strong>{email}</strong> to pick a slot on our product calendar. Speak soon!
              </p>
              <div className="pt-4">
                <Link to="/" className="text-xs font-bold text-blue-600 hover:underline">Return to Home</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* =========================================================================
   FREE TRIAL PAGE
   ========================================================================= */
export const FreeTrial = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // Redirect to register with email as state or query param
    navigate('/register', { state: { email } });
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <SEO
        title="Start Your 14-Day Free Trial"
        description="Try Escannora free for 14 days. Extract documents, scan barcodes, and sync inventories instantly."
      />
      <Navbar />

      <section className="py-20 max-w-xl mx-auto px-6 text-center">
        <div className="glass-card bg-white p-10 border border-slate-200 shadow-xl rounded-3xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your trial account</h1>
            <p className="text-xs text-slate-500">14 days free. Scan up to 50 bills. Access all marketplace connectors.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="text-left">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-xl shadow-lg"
            >
              Continue to Registration <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
            <div className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-blue-600" /> Secure Processing</div>
            <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> No Card Needed</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
