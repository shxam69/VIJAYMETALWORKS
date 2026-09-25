import { useEffect } from 'react';
import { SITE_URL } from '../../data/biz';

const SEOMeta = () => {
  useEffect(() => {
    document.title = 'Vijay Metal Works | Temple Metal Craftsmanship Since 1915 — Chennai';

    /* ── helpers ── */
    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel, href, extra = {}) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
      el.setAttribute('href', href);
      Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
    };

    /* ── canonical ── */
    setLink('canonical', SITE_URL + (window.location.pathname === '/' ? '' : window.location.pathname));

    /* ── favicon (SVG inline — golden V on dark circle, no file needed) ── */
    const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23141210"/><text x="16" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="700" fill="%23FFD700">V</text></svg>`;
    setLink('icon', `data:image/svg+xml,${faviconSVG}`, { type: 'image/svg+xml' });
    setLink('apple-touch-icon', `data:image/svg+xml,${faviconSVG}`);

    /* ── basic meta ── */
    setMeta('description', "Vijay Metal Works, established in 1915 in Sowcarpet, Chennai, specialises in traditional temple metalwork including Panchaloha casting, Naga work, kireedams, sanctum articles and architectural metalwork.");
    setMeta('keywords', 'temple metal works Chennai, panchaloha casting, gold naga work, vigraham, kireedam, sanctum articles, architectural metalwork, Sowcarpet');
    setMeta('robots', 'index, follow');
    setMeta('author', 'Vijay Metal Works, Chennai');

    /* ── Open Graph ── */
    setMeta('og:title',       'Vijay Metal Works | Temple Metal Craftsmanship Since 1915 — Chennai', true);
    setMeta('og:description', 'Vijay Metal Works, established in 1915 in Sowcarpet, Chennai, specialises in traditional temple metalwork including Panchaloha casting, Naga work, kireedams, sanctum articles and architectural metalwork.', true);
    setMeta('og:type',        'website', true);
    setMeta('og:url',         SITE_URL, true);
    setMeta('og:image',       `${SITE_URL}/og-image.jpg`, true); // drop og-image.jpg in /public
    setMeta('og:locale',      'en_IN', true);
    setMeta('og:site_name',   'Vijay Metal Works', true);

    /* ── Twitter / X Card ── */
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       'Vijay Metal Works | Temple Metal Craftsmanship Since 1915 — Chennai');
    setMeta('twitter:description', 'Vijay Metal Works, established in 1915 in Sowcarpet, Chennai, specialises in traditional temple metalwork including Panchaloha casting, Naga work, kireedams, sanctum articles and architectural metalwork.');
    setMeta('twitter:image',       `${SITE_URL}/og-image.jpg`);

    /* ── JSON-LD structured data (LocalBusiness) ── */
    const schemaId = 'vmw-schema';
    let schema = document.getElementById(schemaId);
    if (!schema) { schema = document.createElement('script'); schema.id = schemaId; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'Store'],
      name: 'Vijay Metal Works',
      description: "India's premier temple metal craftsmen since 1915. Panchaloha idols, gold & silver nagas work, Vimana towers, temple renovation.",
      url: SITE_URL,
      telephone: '+919382877351',
      email: 'vijaymetalworks4u@gmail.com',
      foundingDate: '1915',
      address: { '@type': 'PostalAddress', streetAddress: 'New No. 3, Old No. 19, Murugappa Street, Sowcarpet', addressLocality: 'Chennai', postalCode: '600079', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
      geo: { '@type': 'GeoCoordinates', latitude: 13.08694, longitude: 80.27069 },
      openingHours: 'Mo-Sa 09:00-19:00',
      priceRange: '₹₹₹',
      areaServed: ['India', 'United Kingdom', 'UAE', 'Singapore', 'Malaysia', 'USA', 'Australia'],
      sameAs: [`https://wa.me/919382877351`],
    });
  }, []);
  return null;
};

export default SEOMeta;
