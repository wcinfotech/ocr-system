import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  Check,
  Play,
  ArrowRight,
  Clock,
  Cpu,
  FileText,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
  BarChart3,
  Database,
  Mail,
  Search,
  Barcode,
  Activity,
  FileSpreadsheet,
  Boxes,
  Users,
  TrendingUp,
  Printer,
  Globe,
  Settings,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import heroImage from '../assets/image-1.png';
import { getSubscriptionPlans, getTestimonials } from '../services/api';

const Twitter = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const Linkedin = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

const Github = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

/* =========================================================================
   NAVBAR COMPONENT
   ========================================================================= */
export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const handleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const marketplaceLinks = [
    { name: 'Amazon Seller integration', path: '/amazon-seller-management-software' },
    { name: 'Meesho Automation', path: '/meesho-seller-management-software' },
    { name: 'Flipkart Integration', path: '/flipkart-seller-management-software' },
    { name: 'Shopify Connector', path: '/shopify-order-management-software' },
    { name: 'WooCommerce Sync', path: '/woocommerce-order-management-software' },
    { name: 'Magento Link', path: '/magento-order-management-software' },
    { name: 'AJIO Automated Extraction', path: '/ajio-seller-management-software' },
    { name: 'Myntra OCR Parsing', path: '/myntra-seller-management-software' },
  ];

  const featureLinks = [
    { name: 'Barcode Scanning', path: '/barcode-scanning-software' },
    { name: 'Barcode Verification', path: '/barcode-verification-software' },
    { name: 'Order Management', path: '/order-management-software' },
    { name: 'AWB Verification', path: '/awb-verification-software' },
    { name: 'Warehouse Automation', path: '/warehouse-order-management-software' },
    { name: 'Invoice Printing', path: '/invoice-printing-software' },
  ];

  const industryLinks = [
    { name: 'Fashion & Clothing', path: '/fashion-order-management-software' },
    { name: 'Electronics Retail', path: '/electronics-order-management-software' },
    { name: 'Grocery & FMCG', path: '/grocery-order-management-software' },
    { name: 'D2C Brands', path: '/d2c-order-management-software' },
    { name: 'Wholesalers & Distributors', path: '/wholesalers-order-management-software' },
  ];

  const isHomeActive = location.pathname === '/';
  const isFeaturesActive = location.pathname === '/features' || featureLinks.some(link => location.pathname === link.path);
  const isMarketplaceActive = marketplaceLinks.some(link => location.pathname === link.path);
  const isSolutionsActive = industryLinks.some(link => location.pathname === link.path) || location.pathname === '/about-us';
  const isPricingActive = location.pathname === '/pricing';
  const isBlogActive = location.pathname === '/blog';
  const isContactActive = location.pathname === '/contact-us';

  const getLinkClass = (isActive) => {
    return `text-sm font-semibold transition-all relative py-1 ${
      isActive
        ? 'text-blue-600 after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full'
        : 'text-slate-600 hover:text-blue-600'
    }`;
  };

  const getMobileLinkClass = (isActive) => {
    return `text-base font-bold transition-all duration-200 px-3 py-2 rounded-xl flex items-center ${
      isActive
        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-2'
        : 'text-slate-800 hover:text-blue-600 hover:bg-slate-50'
    }`;
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-4'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={closeDropdowns} className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Escannora Logo" className="h-[58px] object-contain group-hover:scale-102 transition-transform duration-200" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className={getLinkClass(isHomeActive)}>
            Home
          </Link>
          
          {/* Features Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdown('features')}
              className={`flex items-center gap-1 transition-all relative py-1 ${
                isFeaturesActive
                  ? 'text-blue-600 after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full font-semibold'
                  : 'text-slate-600 hover:text-blue-600 font-semibold'
              }`}
            >
              Features <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'features' ? 'rotate-185' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'features' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeDropdowns} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-3 z-20"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-100">
                      Core Operations
                    </div>
                    <div className="grid gap-1 mt-2">
                      {featureLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={closeDropdowns}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                            }`}
                          >
                            {link.name}
                          </Link>
                        );
                      })}
                      <Link
                        to="/features"
                        onClick={closeDropdowns}
                        className={`px-3 py-2 mt-1 rounded-xl text-xs font-bold text-center transition-all ${
                          location.pathname === '/features'
                            ? 'text-blue-600 bg-blue-100/50 hover:bg-blue-100'
                            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        View All Features
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Marketplace Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdown('marketplace')}
              className={`flex items-center gap-1 transition-all relative py-1 ${
                isMarketplaceActive
                  ? 'text-blue-600 after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full font-semibold'
                  : 'text-slate-600 hover:text-blue-600 font-semibold'
              }`}
            >
              Marketplace <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'marketplace' ? 'rotate-185' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'marketplace' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeDropdowns} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 z-20"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                      Platform Integrations
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {marketplaceLinks.slice(0, 8).map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={closeDropdowns}
                            className={`px-2.5 py-2 rounded-xl text-xs font-medium transition-all truncate ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                            }`}
                          >
                            {link.name.split(' ')[0]}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex">
                      <Link
                        to="/pricing"
                        onClick={closeDropdowns}
                        className="w-full py-2 text-center text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
                      >
                        Explore Marketplace integrations
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Solutions Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleDropdown('solutions')}
              className={`flex items-center gap-1 transition-all relative py-1 ${
                isSolutionsActive
                  ? 'text-blue-600 after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full font-semibold'
                  : 'text-slate-600 hover:text-blue-600 font-semibold'
              }`}
            >
              Solutions <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'solutions' ? 'rotate-185' : ''}`} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'solutions' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeDropdowns} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-3 z-20"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-100">
                      Industries We Serve
                    </div>
                    <div className="grid gap-1 mt-2">
                      {industryLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={closeDropdowns}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                            }`}
                          >
                            {link.name}
                          </Link>
                        );
                      })}
                      <Link
                        to="/about-us"
                        onClick={closeDropdowns}
                        className={`px-3 py-2 mt-1 rounded-xl text-xs font-bold text-center transition-all ${
                          location.pathname === '/about-us'
                            ? 'text-blue-600 bg-blue-100/50 hover:bg-blue-100'
                            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        About Our Solutions
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Link to="/pricing" className={getLinkClass(isPricingActive)}>
            Pricing
          </Link>
          <Link to="/blog" className={getLinkClass(isBlogActive)}>
            Blog
          </Link>
          <Link to="/contact-us" className={getLinkClass(isContactActive)}>
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/app/dashboard"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2.5"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn-primary py-2.5 px-5 bg-gradient-to-r from-red-600 to-red-500 shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/25"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                Sign In
              </Link>
              <Link
                to="/book-demo"
                className="text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Book Demo
              </Link>
              <Link to="/free-trial" className="btn-primary py-2.5 px-5 shadow-lg shadow-blue-600/10">
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={toggleMobile} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
          {mobileOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeDropdowns}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 z-50 p-6 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="text-lg font-extrabold text-slate-900">Menu</span>
                  <button onClick={closeDropdowns} className="p-1 rounded-lg hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <nav className="flex flex-col gap-4">
                  <Link to="/" onClick={closeDropdowns} className={getMobileLinkClass(isHomeActive)}>
                    Home
                  </Link>
                  <Link to="/features" onClick={closeDropdowns} className={getMobileLinkClass(isFeaturesActive)}>
                    Features
                  </Link>
                  <Link to="/pricing" onClick={closeDropdowns} className={getMobileLinkClass(isPricingActive)}>
                    Pricing
                  </Link>
                  <Link to="/about-us" onClick={closeDropdowns} className={getMobileLinkClass(location.pathname === '/about-us')}>
                    About Us
                  </Link>
                  <Link to="/blog" onClick={closeDropdowns} className={getMobileLinkClass(isBlogActive)}>
                    Blog
                  </Link>
                  <Link to="/contact-us" onClick={closeDropdowns} className={getMobileLinkClass(isContactActive)}>
                    Contact
                  </Link>
                </nav>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/app/dashboard"
                      onClick={closeDropdowns}
                      className="w-full btn-primary py-3 flex items-center justify-center font-bold"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeDropdowns}
                      className="w-full py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/book-demo"
                      onClick={closeDropdowns}
                      className="w-full py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center transition-all"
                    >
                      Book Demo
                    </Link>
                    <Link
                      to="/free-trial"
                      onClick={closeDropdowns}
                      className="w-full btn-primary py-3 flex items-center justify-center font-bold"
                    >
                      Start Free Trial
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

/* =========================================================================
   FOOTER COMPONENT
   ========================================================================= */
export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800">
        {/* Brand */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Escannora Logo" className="h-[54px] object-contain opacity-90" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Escannora is the leading automated document extraction and OCR processing engine. We automate structured data extraction from GST invoices, bills, labels, and purchase orders for high-growth e-commerce sellers and logistics teams.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links: Company */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Latest Blog</Link></li>
            <li><Link to="/contact-us" className="hover:text-white transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Links: Marketplace */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Marketplaces</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/amazon-seller-management-software" className="hover:text-white transition-colors">Amazon Seller</Link></li>
            <li><Link to="/flipkart-seller-management-software" className="hover:text-white transition-colors">Flipkart Sync</Link></li>
            <li><Link to="/meesho-seller-management-software" className="hover:text-white transition-colors">Meesho Automation</Link></li>
            <li><Link to="/shopify-order-management-software" className="hover:text-white transition-colors">Shopify App</Link></li>
            <li><Link to="/woocommerce-order-management-software" className="hover:text-white transition-colors">WooCommerce</Link></li>
          </ul>
        </div>

        {/* Links: Legal & Resources */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resources</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            <li><Link to="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Escannora Inc. All rights reserved.</p>
        <p>Built with enterprise security. SOC-2 and GDPR compliant invoice scanning engine.</p>
      </div>
    </footer>
  );
};

/* =========================================================================
   HERO COMPONENT
   ========================================================================= */
export const Hero = ({ onOpenVideo }) => {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-slate-50/50">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-sky-100/30 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left: Content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/50 text-[11px] font-bold text-blue-600 uppercase tracking-wider animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" /> Introducing Escannora OCR 4.0
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] animate-slideUp">
            Smart OCR. <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 bg-clip-text text-transparent">
              Smarter Extraction.
            </span>
          </h1>

          <p className="text-lg text-slate-500 max-w-xl leading-relaxed animate-slideUp">
            Automated Invoice & Document Processing Platform. Extract structured data from invoices, purchase orders, shipping labels, GST bills, AWB labels, and business documents in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 animate-slideUp">
            <Link to="/free-trial" className="btn-primary py-3.5 px-7 text-base shadow-xl shadow-blue-600/20">
              Start Free Trial
            </Link>
            <Link
              to="/book-demo"
              className="px-6 py-3.5 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Book Demo
            </Link>
            <button
              onClick={onOpenVideo}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-blue-600" />
              </div>
              Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-8 pt-6 border-t border-slate-200/50 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> SOC-2 Certified
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" /> 14-Day Trial
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" /> No Card Needed
            </div>
          </div>
        </div>

        {/* Right: Floating 3D Image & Glass Effect */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-sky-500/5 rounded-3xl blur-2xl -z-10" />
          
          {/* Float animation Wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ 
              opacity: { duration: 0.8 }, 
              scale: { duration: 0.8 }, 
              y: { repeat: Infinity, duration: 6, ease: 'easeInOut' } 
            }}
            className="relative max-w-lg w-full"
          >
            <img
              src={heroImage}
              alt="Escannora Advanced 3D Interface"
              loading="lazy"
              className="w-full h-auto object-contain rounded-3xl shadow-lg hover:scale-[1.01] transition-transform duration-300"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   FEATURE GRID COMPONENT
   ========================================================================= */
export const FeatureGrid = () => {
  const features = [
    {
      title: 'Automated Document Parsing',
      desc: 'Our advanced parsers process invoices, bills, shipping sheets, and extract JSON schema fields with high precision.',
      icon: Cpu,
    },
    {
      title: 'Barcode & SKU Scanning',
      desc: 'Scan barcodes directly from shipping labels and match them against purchase orders automatically.',
      icon: Barcode,
    },
    {
      title: 'Real-time Verification',
      desc: 'Instantly check packing and dispatch correctness, flagging discrepancies before delivery.',
      icon: ShieldCheck,
    },
    {
      title: 'GST & Invoice Printing',
      desc: 'Print tax-compliant bills, carrier labels, and customized invoices directly from the dashboard.',
      icon: Printer,
    },
    {
      title: 'Cloud Dashboard Analytics',
      desc: 'Get holistic insights on scanning metrics, item throughput, parsing success rate, and subscription logs.',
      icon: BarChart3,
    },
    {
      title: 'ERP & Store Synced',
      desc: 'Direct integrations with WooCommerce, Shopify, Amazon, Meesho, Flipkart, and Custom API endpoints.',
      icon: Database,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Advanced Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for high-performance extraction and label processing
          </p>
          <p className="text-slate-500 text-sm">
            Escannora handles the complexity of physical document and digital OCR pipeline automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card p-8 bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 text-left rounded-3xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   STATS COMPONENT
   ========================================================================= */
export const Stats = () => {
  const stats = [
    { value: '15M+', label: 'Documents Processed' },
    { value: '99.93%', label: 'OCR Field Accuracy' },
    { value: '250ms', label: 'Processing Speed' },
    { value: '3.5x', label: 'Warehouse Efficiency' },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-900/10 blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold text-blue-500 tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* =========================================================================
   TIMELINE COMPONENT
   ========================================================================= */
export const Timeline = () => {
  const steps = [
    {
      step: '01',
      title: 'Import Documents',
      desc: 'Upload files via browser interface, batch dropzone, email forwarding, or connect live API endpoints.',
    },
    {
      step: '02',
      title: 'Automated Processing & Extraction',
      desc: 'Our proprietary OCR system runs OCR text recognition, parses labels, and classifies values into items.',
    },
    {
      step: '03',
      title: 'Verification & Formatting',
      desc: 'Check confidence parameters, auto-verify barcode authenticity, and validate GST totals.',
    },
    {
      step: '04',
      title: 'Direct Sync to Channels',
      desc: 'Directly sync parsed structured data into your ecommerce platform, shipping software, or databases.',
    },
  ];

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">The Workflow</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Escannora automates document pipelines
          </p>
          <p className="text-slate-500 text-sm">
            Four simple phases to fully automate invoice manual indexing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left relative">
          {steps.map((item, idx) => (
            <div key={idx} className="bg-white p-8 border border-slate-100 rounded-3xl relative shadow-sm hover:shadow-md transition-shadow">
              <span className="text-5xl font-black text-blue-100/50 absolute top-4 right-6">{item.step}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   TESTIMONIALS COMPONENT
   ========================================================================= */
export const Testimonials = () => {
  const [reviews, setReviews] = useState([
    {
      quote: "Escannora cut our invoice manual data entry down to zero. We process over 10,000 marketplace orders daily across Amazon and Shopify, and Escannora extracts all our GST bills perfectly.",
      author: "Rajesh K.",
      role: "Operations Director, Fashion Hub",
    },
    {
      quote: "The API integration was incredibly smooth. The accuracy of the OCR scanner on packing labels and barcode verification is better than any tool we've tested.",
      author: "Aditi S.",
      role: "Technical Lead, ElectroCart",
    },
    {
      quote: "Outstanding product. Moving from manual keying to OCR automation helped us scale wholesalers distribution by 300% without adding headcount.",
      author: "Manoj D.",
      role: "Founder, D2C Apparel",
    },
  ]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await getTestimonials();
        if (response.data && response.data.success && response.data.data.length > 0) {
          setReviews(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  // Build marquee items list. Make sure we have at least 8 items for a smooth scroll on wide screens.
  let marqueeReviews = [...reviews];
  while (marqueeReviews.length < 8 && reviews.length > 0) {
    marqueeReviews = [...marqueeReviews, ...reviews];
  }
  const duplicatedReviews = [...marqueeReviews, ...marqueeReviews];

  // Duration scales with the number of unique items to keep a consistent scroll speed
  const baseDuration = 12; // seconds per item set
  const duration = Math.max(25, marqueeReviews.length * 4.5);

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      {/* Subtle background gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center space-y-4 relative z-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">User Reviews</h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Trusted by top eCommerce operators & sellers
        </p>
      </div>

      {/* Infinite scrolling marquee row */}
      <div className="relative mt-16 flex overflow-x-hidden py-4 z-10">
        {/* Left and Right fades for premium glass/fade look */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 sm:w-1/6 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 sm:w-1/6 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

        {reviews.length > 0 && (
          <motion.div
            className="flex gap-8 pr-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: duration,
              repeat: Infinity,
            }}
            style={{ display: "flex", width: "max-content" }}
          >
            {duplicatedReviews.map((rev, idx) => (
              <div
                key={idx}
                className="w-[340px] sm:w-[380px] shrink-0 glass-card p-8 bg-slate-50/50 border border-slate-100 hover:border-blue-500/20 hover:bg-white text-left rounded-3xl flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer group"
              >
                <p className="text-xs italic text-slate-500 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors">
                  "{rev.quote}"
                </p>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {rev.author}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">{rev.role}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

/* =========================================================================
   PRICING CARD COMPONENT
   ========================================================================= */
export const PricingCard = () => {
  const [billing, setBilling] = useState('monthly');
  const [plans, setPlans] = useState([
    {
      name: 'Starter',
      price: billing === 'monthly' ? '₹0' : '₹0',
      period: billing === 'monthly' ? '/mo' : '/mo, billed annually',
      desc: 'Great for small sellers automating basic PDF invoices.',
      features: [
        '50 parsed documents/mo',
        'Standard OCR pipeline',
        'PDF, JPG, PNG formats',
        'CSV Export logs',
        'E-mail support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Pro',
      price: billing === 'monthly' ? '₹999' : '₹799',
      period: billing === 'monthly' ? '/mo' : '/mo, billed annually',
      desc: 'Optimized for high-volume multichannel retail brands.',
      features: [
        '1,500 parsed documents/mo',
        'Advanced structured data parser',
        'Barcode verification sync',
        'AWB label verification',
        'Shopify, WooCommerce, Amazon links',
        'Priority 24/7 support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: billing === 'monthly' ? '₹5,000' : '₹4,000',
      period: billing === 'monthly' ? '/mo' : '/mo, billed annually',
      desc: 'For wholesalers and large manufacturing distributors.',
      features: [
        'Unlimited parsed documents',
        'Custom template rules mapping',
        'Dedicated webhook endpoint',
        'SLA guaranteed server Uptime',
        'Account manager support',
      ],
      cta: 'Book Demo',
      popular: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await getSubscriptionPlans();
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map(p => {
            const monthlyPrice = p.price;
            const yearlyPrice = Math.round(p.price * 0.8);
            const priceValue = billing === 'monthly' ? monthlyPrice : yearlyPrice;
            const displayPrice = typeof priceValue === 'number' ? `₹${priceValue.toLocaleString('en-IN')}` : priceValue;
            
            const defaultFeatures = p.name === 'Starter'
              ? [
                  '50 parsed documents/mo',
                  'Standard OCR pipeline',
                  'PDF, JPG, PNG formats',
                  'CSV Export logs',
                  'E-mail support',
                ]
              : p.name === 'Pro'
              ? [
                  '1,500 parsed documents/mo',
                  'Advanced structured data parser',
                  'Barcode verification sync',
                  'AWB label verification',
                  'Shopify, WooCommerce, Amazon links',
                  'Priority 24/7 support',
                ]
              : [
                  'Unlimited parsed documents',
                  'Custom template rules mapping',
                  'Dedicated webhook endpoint',
                  'SLA guaranteed server Uptime',
                  'Account manager support',
                ];

            return {
              name: p.name,
              price: displayPrice,
              period: billing === 'monthly' ? '/mo' : '/mo, billed annually',
              desc: p.name === 'Starter'
                ? 'Great for small sellers automating basic PDF invoices.'
                : p.name === 'Pro'
                ? 'Optimized for high-volume multichannel retail brands.'
                : 'For wholesalers and large manufacturing distributors.',
              features: p.benefits && p.benefits.length > 0 ? p.benefits : defaultFeatures,
              cta: p.name === 'Enterprise' ? 'Book Demo' : 'Start Free Trial',
              popular: p.name === 'Pro',
            };
          });

          const order = { 'Starter': 1, 'Pro': 2, 'Enterprise': 3 };
          mapped.sort((a, b) => (order[a.name] || 99) - (order[b.name] || 99));
          setPlans(mapped);
        }
      } catch (err) {
        console.error('Failed to load dynamic pricing plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [billing]);

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
        <div className="space-y-6 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Pricing Models</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Flexible pricing suited to your document volume
          </p>
          <p className="text-slate-500 text-sm">
            Get started for free. 14-day trial on all premium plans. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billing === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                billing === 'annual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Annual (Save 30%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-card p-8 bg-white border text-left rounded-3xl flex flex-col justify-between relative transition-all duration-300 hover:translate-y-[-4px] ${
                plan.popular ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xl' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular Plan
                </span>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs font-semibold text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-500 border-t border-slate-100 pt-6">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to={plan.cta === 'Book Demo' ? '/book-demo' : '/free-trial'}
                  className={`w-full py-3 flex items-center justify-center font-bold text-sm rounded-xl transition-all ${
                    plan.popular
                      ? 'btn-primary'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   FAQ COMPONENT
   ========================================================================= */
export const FAQ = () => {
  const faqs = [
    {
      q: 'How accurate is the Escannora OCR automated extraction?',
      a: 'Escannora OCR uses an advanced layout-aware text recognition engine. Our platform regularly achieves 99.9% accuracy on standardized invoices, shipping labels, and GST documents, even with minor physical folds or noise.',
    },
    {
      q: 'Can I connect Escannora to my Shopify or Amazon seller accounts?',
      a: 'Yes! Escannora features native pre-built connectors for Amazon Seller, Meesho, Shopify, WooCommerce, Ajio, Flipkart, and Myntra. Parsing and inventory sync happen in near real-time.',
    },
    {
      q: 'Do you store copies of our uploaded invoices or customer documents?',
      a: 'Your data security is our priority. We are SOC-2 compliant. Files are processed securely, and you can configure custom data retention policies to automatically purge files from our servers after verification.',
    },
    {
      q: 'What is the processing time per bill document?',
      a: 'A single page PDF invoice or barcode image is usually parsed and converted into structured JSON within 200ms to 400ms.',
    },
  ];

  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Got Questions?</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-slate-200 pb-4">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between py-3 text-left font-bold text-slate-800 hover:text-blue-600 transition-colors text-sm"
              >
                <span>{faq.q}</span>
                <span className="text-lg text-slate-400 font-normal">{openIdx === idx ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden text-xs text-slate-500 leading-relaxed mt-1"
                  >
                    <p className="pb-3">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   CTA COMPONENT
   ========================================================================= */
export const CTA = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-gradient-to-tr from-blue-700 to-blue-500 rounded-[32px] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-sky-300/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative space-y-8 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to automate your document workflow?
            </h2>
            <p className="text-base text-blue-100/90 leading-relaxed">
              Start extracting structured invoice data, verifying barcodes, and synchronizing orders in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/free-trial"
                className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 font-extrabold text-base rounded-2xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/book-demo"
                className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white font-extrabold text-base rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                Schedule Demo
              </Link>
            </div>
            <p className="text-xs text-blue-200">No credit card required. Cancel during trial with one click.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   BREADCRUMB COMPONENT
   ========================================================================= */
export const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex py-4 text-xs text-slate-400 font-medium max-w-7xl mx-auto px-6">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <span className="text-slate-300">/</span>
            {item.path ? (
              <Link to={item.path} className="hover:text-blue-600 transition-colors capitalize">
                {item.name.replace(/-/g, ' ')}
              </Link>
            ) : (
              <span className="text-slate-600 capitalize">{item.name.replace(/-/g, ' ')}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/* =========================================================================
   MARKETPLACE TEMPLATE
   ========================================================================= */
export const MarketplaceTemplate = ({ name, description, features, faqs }) => {
  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <Navbar />
      <Breadcrumb items={[{ name: `${name} Integration`, path: '' }]} />
      
      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight capitalize">
            {name} Seller Document OCR Automation
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {description || `Connect Escannora OCR tool to automatically pull, verify, and parse invoice PDF data from ${name}.`}
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/free-trial" className="btn-primary py-3 px-6 shadow-md shadow-blue-600/10">
              Integrate {name} Now
            </Link>
            <Link to="/contact-us" className="px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-sm font-bold shadow-sm">
              Talk to Specialist
            </Link>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features && features.map((feat, idx) => (
            <div key={idx} className="glass-card p-8 border border-slate-100 rounded-3xl">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          )) || (
            <>
              <div className="glass-card p-8 border border-slate-100 rounded-3xl">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Order Retrieval</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Direct connection imports customer invoices and shipping documents instantly as they are created.</p>
              </div>
              <div className="glass-card p-8 border border-slate-100 rounded-3xl">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">GST Invoice Extraction</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Accurately extract SKU totals, IGST/CGST breakdown, purchaser shipping details, and batch barcodes.</p>
              </div>
              <div className="glass-card p-8 border border-slate-100 rounded-3xl">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Shipping Sync</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Push verified dispatch updates back to your seller portal to update fulfillment state instantly.</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Integration Steps */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Easy 3-step {name} Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1</span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">Link Account</h3>
              <p className="text-[11px] text-slate-500">Go to Integration page in Escannora panel and authorize the credentials.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2</span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">Select Mapping</h3>
              <p className="text-[11px] text-slate-500">Map invoice schemas to matches within your own ERP or local database.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3</span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1">Verify Automation</h3>
              <p className="text-[11px] text-slate-500">Invoices will flow, parse, and verify automatically in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
};

/* =========================================================================
   FEATURE TEMPLATE
   ========================================================================= */
export const FeatureTemplate = ({ title, description, features, faqs }) => {
  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <Navbar />
      <Breadcrumb items={[{ name: title, path: '' }]} />

      <section className="py-20 text-center relative">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Settings className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {title} Software Solution
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
          <div className="pt-2">
            <Link to="/free-trial" className="btn-primary py-3.5 px-7 shadow-lg shadow-blue-600/10">
              Start Using {title}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features && features.map((feat, idx) => (
            <div key={idx} className="glass-card p-8 border border-slate-100 rounded-3xl">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
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
   INDUSTRY TEMPLATE
   ========================================================================= */
export const IndustryTemplate = ({ name, description, features }) => {
  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <Navbar />
      <Breadcrumb items={[{ name: `${name} Solutions`, path: '' }]} />

      <section className="py-20 text-center relative">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight capitalize">
            OCR & Data Extraction for {name}
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {description || `Tailored document parsing and barcode verification flows optimizing logistics for the ${name} industry.`}
          </p>
          <div className="pt-2">
            <Link to="/free-trial" className="btn-primary py-3.5 px-7 shadow-lg shadow-blue-600/10">
              Get {name} Integration
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features && features.map((feat, idx) => (
            <div key={idx} className="glass-card p-8 border border-slate-100 rounded-3xl">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
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
   BLOG TEMPLATE
   ========================================================================= */
export const BlogTemplate = ({ posts, loading }) => {
  const getBlogImageUrl = (featuredImage) => {
    if (!featuredImage) return null;
    if (featuredImage.startsWith('http://') || featuredImage.startsWith('https://')) {
      if (featuredImage.includes('/api/v1/uploads/')) {
        return featuredImage.replace('/api/v1/uploads/', '/uploads/');
      }
      return featuredImage;
    }
    let apiURL = import.meta.env.VITE_API_URL || '';
    if (!apiURL) {
      return featuredImage;
    }
    const base = apiURL.startsWith('http://') || apiURL.startsWith('https://') ? apiURL : `https://${apiURL}`;
    return `${base.replace(/\/$/, '')}${featuredImage}`;
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <Navbar />
      <Breadcrumb items={[{ name: 'Blog', path: '' }]} />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">The Escannora Blog</h1>
            <p className="text-slate-500 text-sm">Guides, resources, and expert tips on document automation, logistics pipelines, and OCR software features.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts && posts.map((post, idx) => (
                <Link
                  key={idx}
                  to={`/blog/${post.slug}`}
                  className="glass-card bg-white border border-slate-100 overflow-hidden rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:translate-y-[-4px] block text-left"
                >
                  {post.featuredImage ? (
                    <div className="h-48 bg-slate-50 border-b border-slate-100 overflow-hidden">
                      <img
                        src={getBlogImageUrl(post.featuredImage)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">{post.category}</span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
                      <span>{post.date}</span>
                      <span className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Read Article →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
};

/* =========================================================================================================
   RESOURCE TEMPLATE
   ========================================================================= */
export const ResourceTemplate = ({ title, content }) => {
  return (
    <div className="bg-slate-50/50 min-h-screen pt-24">
      <Navbar />
      <Breadcrumb items={[{ name: title, path: '' }]} />

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 space-y-8 text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight pb-4 border-b border-slate-200">
            {title}
          </h1>
          <div className="text-slate-600 text-sm leading-relaxed space-y-6">
            {content || (
              <>
                <p>Welcome to our {title}. This policy governs your use of the Escannora software platform and services.</p>
                <h3 className="text-base font-bold text-slate-900 mt-6 mb-2">1. Terms of Use</h3>
                <p>By using Escannora document extraction, you consent to our security protocols. We run layout-aware text recognition and index your invoices, shipping bills, and label metadata securely.</p>
                <h3 className="text-base font-bold text-slate-900 mt-6 mb-2">2. Data Privacy</h3>
                <p>All parsed OCR content resides in encrypted databases. We do not inspect invoice detail contents unless requested for custom template mapping debugging by certified enterprise admins.</p>
                <h3 className="text-base font-bold text-slate-900 mt-6 mb-2">3. Subscription billing</h3>
                <p>Payments are charged monthly or annually. Subscriptions are billed based on document parsing quotas, as detailed on our Pricing page.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
