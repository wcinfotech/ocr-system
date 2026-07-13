import React, { useState } from 'react';
import {
  Navbar,
  Hero,
  FeatureGrid,
  Stats,
  Timeline,
  Testimonials,
  PricingCard,
  FAQ,
  CTA,
  Footer
} from './Templates';
import SEO from '../components/SEO';
import { X, Play, ShieldCheck, Sparkles, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  // SEO schemas for the landing page
  const homeSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Escannora',
      'url': window.location.origin,
      'logo': `${window.location.origin}/favicon.svg`,
      'sameAs': [
        'https://twitter.com/escannora',
        'https://linkedin.com/company/escannora'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'Escannora',
      'operatingSystem': 'All',
      'applicationCategory': 'BusinessApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <SEO
        title="Escannora — Advanced Invoice & Document OCR Scanner"
        description="Extract structured data from invoices, purchase orders, shipping labels, GST bills, and business documents in seconds using Escannora's advanced layout-aware OCR engine."
        canonicalUrl={window.location.origin}
        schemas={homeSchemas}
      />
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero onOpenVideo={() => setShowVideoModal(true)} />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* SaaS Stats */}
      <Stats />

      {/* Workflow Timeline */}
      <Timeline />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing Options */}
      <PricingCard />

      {/* Frequently Asked Questions */}
      <FAQ />

      {/* Bottom Call-To-Action */}
      <CTA />

      {/* Footer */}
      <Footer />

      {/* Video Demo Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-200 shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">Escannora — Interactive Demo</span>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mock Video Container */}
              <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center p-12 text-center text-white relative">
                {/* Visual interface layout simulation */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="max-w-md space-y-6 relative">
                  <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <Play className="w-6 h-6 fill-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">Watch Escannora OCR in action</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      See how our layout-aware document models read text, classify SKU item lines, check GST percentages, and synchronizes to your sales channels.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
                        14d
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Start a risk-free trial</h4>
                        <p className="text-[10px] text-slate-400">Scan 50 documents for free today.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowVideoModal(false);
                        window.location.href = '/free-trial';
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Try Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
