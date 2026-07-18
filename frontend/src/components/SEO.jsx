import { useEffect } from 'react';

const SEO = ({ title, description, canonicalUrl, schemas = [] }) => {
  useEffect(() => {
    // Update Document Title
    if (title) {
      if (title.toLowerCase().includes('escannora')) {
        document.title = title;
      } else {
        document.title = `${title} | Escannora`;
      }
    } else {
      document.title = 'Escannora — Advanced Invoice & Document Processing';
    }

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      description || 'Extract structured data from invoices, purchase orders, shipping labels, GST bills, and business documents in seconds using Escannora.'
    );

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl || window.location.href);

    // Inject JSON-LD Schema
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());

    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      // Cleanup schemas on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach((script) => script.remove());
    };
  }, [title, description, canonicalUrl, schemas]);

  return null;
};

export default SEO;
