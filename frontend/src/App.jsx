import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { logAnalyticsEvent } from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { DataProvider } from './context/DataContext';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import BillDetailPage from './pages/BillDetailPage';
import BillHistoryPage from './pages/BillHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import ReturnsPage from './pages/ReturnsPage';
import Home from './marketing/Home';
import { AboutUs, PricingPage, FeaturesPage, ContactUs, BlogPage, BlogDetailPage, BookDemo, FreeTrial } from './marketing/Pages';
import SmoothScroll from './components/SmoothScroll';
import SitemapPage from './marketing/SitemapPage';

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (appLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950">
        <div className="relative flex flex-col items-center space-y-8 animate-fade-in">
          {/* Pulsing card displaying logo.png */}
          <div className="w-64 h-28 bg-white p-5 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="Escannora Logo" className="max-h-full max-w-full object-contain" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initializing Escannora</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <SmoothScroll />
        <ScrollToTop />
        <AnalyticsTracker />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
        <Routes>
          {/* Public Marketing Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/book-demo" element={<BookDemo />} />
          <Route path="/free-trial" element={<FreeTrial />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Customer Dashboard App Routes */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="upload" element={<UploadPage />} />
                      <Route path="history" element={<BillHistoryPage />} />
                      <Route path="returns" element={<ReturnsPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                      <Route path="support" element={<SupportPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="bill/:id" element={<BillDetailPage />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </DataProvider>
              </ProtectedRoute>
            }
          />

          {/* Dynamic Sitemap Pages */}
          <Route path="/:slug" element={<SitemapPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname;
    logAnalyticsEvent('page_view', {
      path: pageName,
      title: document.title || 'Escannora App',
      search: location.search || '',
    });
  }, [location]);

  return null;
}

export default App;
