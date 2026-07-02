import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  motion, AnimatePresence,
  useScroll, useTransform, useInView
} from 'framer-motion';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════
   SEO META — injected into document head
═══════════════════════════════════════════════════════════════ */
const SITE_URL = 'https://vijaymetalworks.com'; // ← update to your actual domain

const SEOMeta = () => {
  useEffect(() => {
    document.title = 'Vijay Metal Works | Temple Metal Craftsmen Since 1915 — Chennai';

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
    setMeta('description', "Vijay Metal Works, Sowcarpet Chennai — India's premier temple metal craftsmen since 1915. Specialists in Panchaloha idols, gold & silver nagas work, electro plating, Vimana towers, and full temple renovations. Serving 2000+ temples worldwide.");
    setMeta('keywords', 'temple metal works Chennai, panchaloha idols, gold nagas work, temple renovation, vigraham, kireedam, prabhavali, vimana tower, Sowcarpet metalcraft');
    setMeta('robots', 'index, follow');
    setMeta('author', 'Vijay Metal Works, Chennai');

    /* ── Open Graph ── */
    setMeta('og:title',       'Vijay Metal Works | Sacred Temple Metalcraft Since 1915', true);
    setMeta('og:description', 'Handcrafted temple metalwork in Gold, Silver, Copper, Brass & Panchaloha. Serving 2000+ temples across India, UK, UAE & Southeast Asia.', true);
    setMeta('og:type',        'website', true);
    setMeta('og:url',         SITE_URL, true);
    setMeta('og:image',       `${SITE_URL}/og-image.jpg`, true); // drop og-image.jpg in /public
    setMeta('og:locale',      'en_IN', true);
    setMeta('og:site_name',   'Vijay Metal Works', true);

    /* ── Twitter / X Card ── */
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       'Vijay Metal Works | Sacred Temple Metalcraft Since 1915');
    setMeta('twitter:description', 'Handcrafted Panchaloha idols, gold & silver nagas work, Vimana towers. Chennai since 1915.');
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

/* ═══════════════════════════════════════════════════════════════
   REAL BUSINESS DATA
═══════════════════════════════════════════════════════════════ */
const BIZ = {
  name:     "Vijay Metal Works",
  since:    "Since 1915",
  owner:    "I. Vijay",
  tagline:  "All Kinds of Temple Metal Works — Importer & Exporter",
  phone:    "93828 77351",
  phoneTel: "+919382877351",
  email:    "vijaymetalworks4u@gmail.com",
  address:  "New No. 3, Old No. 19, Murugappa Street, Sowcarpet, Chennai – 600 079",
  whatsapp: "https://wa.me/919382877351",
  deity:    "Vaikunda Vasa Perumal",
  mapLink:  "https://maps.google.com/?q=Murugappa+Street+Sowcarpet+Chennai+600079",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.5!2d80.2707!3d13.0869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265b5abcdef01%3A0x1234567890abcdef!2sMurugappa%20St%2C%20Sowcarpet%2C%20Chennai!5e0!3m2!1sen!2sin!4v1234567890",
};

// 3D model disabled — using logo + real photos instead

/* ═══════════════════════════════════════════════════════════════
   REAL VMW PRODUCT IMAGES — wired to /public/gallery/
   Available: gold/ (13), silver/ (1 .jpg), stone/ (7), temple/ (2)
   NOTE: silver/*.heic files skipped — HEIC has no browser support.
═══════════════════════════════════════════════════════════════ */
const VMW = {
  // Hero & Featured
  hero1:     '/gallery/gold/crown.jpg',
  hero2:     '/gallery/gold/crown1.jpg',
  // Idols & Vigraham
  idol1:     '/gallery/temple/god.jpg',
  idol2:     '/gallery/temple/temple.jpg',
  idol3:     '/gallery/gold/crownn.jpg',
  idol4:     '/gallery/gold/crownnside.jpg',
  // Gold Work
  goldwork1: '/gallery/gold/kandabaranam.jpg',
  goldwork2: '/gallery/gold/sadarigold.jpg',
  goldwork3: '/gallery/gold/kanganam4.jpg',
  // Silver Work
  silver1:   '/gallery/silver/kandabaranam.jpg',
  silver2:   '/gallery/gold/SADARI 2.jpg',
  silver3:   '/gallery/stone/stone1.jpg',
  // Crown / Headgear
  crown1:    '/gallery/gold/crown.jpg',
  crown2:    '/gallery/gold/crown1.jpg',
  crown3:    '/gallery/gold/straight crown.jpg',
  // Landscape / Workshop
  workshop:  '/gallery/temple/temple.jpg',
  wide1:     '/gallery/stone/stone2.jpg',
  wide2:     '/gallery/stone/stone3.jpg',
  // More pieces
  prod05:    '/gallery/stone/stone4.jpg',
  prod06:    '/gallery/gold/hand1.jpg',
  prod08:    '/gallery/gold/crownn.jpg',
  prod17:    '/gallery/stone/kow pa.jpg',
  prod21:    '/gallery/gold/sur kad.png',
  prod23:    '/gallery/stone/kow pathakkam.png',
  prod25:    '/gallery/stone/thamarai poo3.jpg',
};

/* ═══════════════════════════════════════════════════════════════
   SUPABASE UTILITIES — Real Data Integration
═══════════════════════════════════════════════════════════════ */

const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL,
  key: process.env.REACT_APP_SUPABASE_ANON_KEY,
};

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
  console.warn('[VMW] Supabase env vars not set. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env to enable live data. Running in offline/mock mode.');
}

// Cache with TTL (5 minutes)
const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;
  return null;
};

const setCached = (key, data) => {
  CACHE.set(key, { data, time: Date.now() });
};

// localStorage persistence for user's personal state
const getUserState = () => {
  try {
    const stored = localStorage.getItem('vmw_user_state');
    return stored ? JSON.parse(stored) : { likes: {}, saves: {}, comments: {} };
  } catch (_) {
    localStorage.removeItem('vmw_user_state');
    return { likes: {}, saves: {}, comments: {} };
  }
};

const setUserState = (state) => {
  localStorage.setItem('vmw_user_state', JSON.stringify(state));
};

// ── Core fetch wrapper — always sends auth token if session exists ──────────
const supabaseCall = async (endpoint, method = 'GET', body = null, extraHeaders = {}) => {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) return null;

  // Attach live session bearer token when available
  let authHeader = `Bearer ${SUPABASE_CONFIG.key}`;
  try {
    const sess = localStorage.getItem('vmw_session');
    if (sess) {
      const parsed = JSON.parse(sess);
      if (parsed?.access_token) authHeader = `Bearer ${parsed.access_token}`;
    }
  } catch (_) {}

  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_CONFIG.key,
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  };

  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1${endpoint}`, opts);
    if (res.ok) {
      // HEAD requests and DELETE return empty body
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    }
    const errText = await res.text();
    console.warn('Supabase error', res.status, errText);
  } catch (e) {
    console.warn('Supabase call failed:', e);
  }
  return null;
};

// ── Count helper using PostgREST exact count ─────────────────────────────────
const getCount = async (table, filter) => {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) return 0;
  try {
    const res = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/${table}?${filter}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Prefer': 'count=exact',
          'Range': '0-0',
        },
      }
    );
    const cr = res.headers.get('content-range'); // "0-0/42"
    if (cr) return parseInt(cr.split('/')[1], 10) || 0;
  } catch (_) {}
  return 0;
};

// Get likes count for an idol — FIX: column is gallery_item_id not idol_id
const getIdolLikesCount = async (idolId) => {
  const cacheKey = `likes_count_${idolId}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;
  const count = await getCount('likes', `gallery_item_id=eq.${idolId}`);
  setCached(cacheKey, count);
  return count;
};

// Get saves count for an idol — FIX: column is gallery_item_id not idol_id
const getIdolSavesCount = async (idolId) => {
  const cacheKey = `saves_count_${idolId}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;
  const count = await getCount('saved_items', `gallery_item_id=eq.${idolId}`);
  setCached(cacheKey, count);
  return count;
};

// Get comments for an idol — FIX: column is gallery_item_id & content not text
const getIdolComments = async (idolId) => {
  const cacheKey = `comments_${idolId}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;
  const data = await supabaseCall(
    `/comments?gallery_item_id=eq.${idolId}&order=created_at.desc&limit=20&select=id,content,created_at,user_id`
  );
  const comments = data || [];
  setCached(cacheKey, comments);
  return comments;
};

// Toggle like (optimistic + server) — FIX: correct column names
const toggleIdolLike = async (idolId, userId, isCurrentlyLiked) => {
  const userState = getUserState();
  userState.likes[idolId] = !isCurrentlyLiked;
  setUserState(userState);

  if (!isCurrentlyLiked) {
    await supabaseCall('/likes', 'POST', { gallery_item_id: idolId, user_id: userId });
  } else {
    await supabaseCall(`/likes?gallery_item_id=eq.${idolId}&user_id=eq.${userId}`, 'DELETE');
  }
  CACHE.delete(`likes_count_${idolId}`);
};

// Toggle save (optimistic + server) — FIX: correct column names
const toggleIdolSave = async (idolId, userId, isCurrentlySaved) => {
  const userState = getUserState();
  userState.saves[idolId] = !isCurrentlySaved;
  setUserState(userState);

  if (!isCurrentlySaved) {
    await supabaseCall('/saved_items', 'POST', { gallery_item_id: idolId, user_id: userId });
  } else {
    await supabaseCall(`/saved_items?gallery_item_id=eq.${idolId}&user_id=eq.${userId}`, 'DELETE');
  }
  CACHE.delete(`saves_count_${idolId}`);
};

// Add comment — FIX: column is gallery_item_id & content not text
const addIdolComment = async (idolId, userId, text) => {
  const userState = getUserState();
  if (!userState.comments[idolId]) userState.comments[idolId] = [];

  const tempComment = {
    id: 'temp_' + Date.now(),
    content: text,
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  userState.comments[idolId].unshift(tempComment);
  setUserState(userState);

  await supabaseCall('/comments', 'POST', { gallery_item_id: idolId, user_id: userId, content: text });
  CACHE.delete(`comments_${idolId}`);
};

// Log view event — FIX: analytics_events has no idol_id column; use metadata JSONB
const logViewEvent = async (idolId, userId) => {
  await supabaseCall('/analytics_events', 'POST', {
    event_type: 'view',
    user_id: userId || null,
    metadata: { gallery_item_id: idolId },
  });
};


/* ═══════════════════════════════════════════════════════════════
   THEME SYSTEM — light / dark / auto
═══════════════════════════════════════════════════════════════ */
const THEMES = {
  dark: {
    gold:"#FFD700",goldLt:"#FFE44D",goldDk:"#CC9900",
    goldGrad:"linear-gradient(135deg,#CC9900 0%,#FFD700 38%,#FFE44D 62%,#FFD700 100%)",
    bg1:"#080604",bg2:"#0E0B08",bg3:"#111008",
    border:"rgba(255,255,255,0.09)",borderHi:"rgba(255,255,255,0.18)",borderGold:"rgba(255,215,0,0.25)",
    text:"rgba(255,255,255,0.92)",dim:"rgba(255,255,255,0.65)",faint:"rgba(255,255,255,0.35)",
    surfaceGold:"rgba(255,215,0,0.06)",surfaceWarm:"rgba(255,220,160,0.04)",
    loaderBg:"#050402",navBg:"rgba(8,6,4,0.97)",isDark:true,
  },
  light: {
    gold:"#B8860B",goldLt:"#DAA520",goldDk:"#8B6508",
    goldGrad:"linear-gradient(135deg,#8B6508 0%,#B8860B 38%,#DAA520 62%,#B8860B 100%)",
    bg1:"#F5F0E8",bg2:"#EDE7D8",bg3:"#E5DEC8",
    border:"rgba(100,70,20,0.16)",borderHi:"rgba(100,70,20,0.30)",borderGold:"rgba(184,134,11,0.35)",
    text:"rgba(15,9,2,0.92)",dim:"rgba(15,9,2,0.68)",faint:"rgba(15,9,2,0.40)",
    surfaceGold:"rgba(184,134,11,0.08)",surfaceWarm:"rgba(180,140,60,0.06)",
    loaderBg:"#F0EAD8",navBg:"rgba(245,240,232,0.94)",isDark:false,
  },
};
const ThemeCtx = React.createContext(THEMES.dark);
const useTheme = () => React.useContext(ThemeCtx);
const AppCtx = React.createContext({});
export const useAppCtx = () => React.useContext(AppCtx);
const useThemeMode = () => {
  const [mode,setMode] = useState('auto');
  const [C,setC] = useState(THEMES.dark);
  useEffect(()=>{
    const apply = m => {
      if(m==='auto'){const d=window.matchMedia('(prefers-color-scheme: dark)').matches;setC(d?THEMES.dark:THEMES.light);}
      else setC(m==='dark'?THEMES.dark:THEMES.light);
    };
    apply(mode);
    if(mode==='auto'){const mq=window.matchMedia('(prefers-color-scheme: dark)');const h=()=>apply('auto');mq.addEventListener('change',h);return()=>mq.removeEventListener('change',h);}
  },[mode]);
  return {mode,setMode,C};
};
// Module-level C — updated dynamically in App via context
let C = THEMES.dark;

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS — theme-aware via data-theme attribute
═══════════════════════════════════════════════════════════════ */
const buildCSS = (C) => `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:${C.bg1};color:${C.text};font-family:'Jost',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;transition:background .35s,color .35s}
::selection{background:${C.gold};color:#fff}
::-webkit-scrollbar{width:2px}
::-webkit-scrollbar-track{background:${C.bg1}}
::-webkit-scrollbar-thumb{background:${C.gold}88}
input,textarea{font-family:'Jost',sans-serif;color:${C.text}}
input::placeholder,textarea::placeholder{color:${C.faint}}
button{font-family:'Jost',sans-serif;cursor:pointer}

@keyframes starBorderSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes goldShine{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes rippleOut{0%{transform:scale(0);opacity:0.5;border-radius:50%}100%{transform:scale(4);opacity:0;border-radius:50%}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}
@keyframes skeletonShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes progressBar{0%{width:0%}100%{width:100%}}
@keyframes logoRingExpand{0%{stroke-dashoffset:600;opacity:0}60%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}
@keyframes logoFadeUp{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
@keyframes logoRayPulse{0%,100%{opacity:0;transform:scale(.6)}50%{opacity:.7;transform:scale(1.1)}}
@keyframes logoGlow{0%,100%{opacity:.3}50%{opacity:.9}}
@keyframes flameFlicker{0%,100%{transform:scaleY(1) skewX(0deg);opacity:.9}30%{transform:scaleY(1.1) skewX(-2deg);opacity:1}60%{transform:scaleY(.95) skewX(1deg);opacity:.8}}

.will-transform{will-change:transform}
.skeleton{
  background:linear-gradient(90deg,${C.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)'} 25%,${C.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)'} 50%,${C.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.04)'} 75%);
  background-size:400px 100%;
  animation:skeletonShimmer 1.6s ease-in-out infinite;
}
/* ─── MOBILE BASE (≤768px) ─────────────────────────────────── */
/* ─── DESKTOP DEFAULTS (moved from inline to CSS) ──────────── */
.section-pad { padding: 120px 56px; }
.two-col { grid-template-columns: 1fr 1fr; }
.vmw-services-card { grid-template-columns: 1fr 1.5fr; }
.vmw-services-right { padding: 44px 48px; }
.footer-cols { grid-template-columns: repeat(3,1fr); }
.vmw-footer-btns { grid-template-columns: repeat(4,1fr); }
.vmw-footer { padding: 76px 56px 44px; }
.vmw-process-grid { grid-template-columns: 1fr 80px 1fr; }

@media(max-width:768px){
  /* Navigation */
  .nav-desktop{display:none!important}
  .mobile-sticky-bar{display:flex!important}
  /* Section padding — now works because inline padding is gone */
  .section-pad{padding:72px 20px!important}
  /* Layout helpers */
  .hero-3d{width:160px!important;height:160px!important}
  .two-col{grid-template-columns:1fr!important;gap:36px!important}
  .archive-grid{grid-template-columns:repeat(2,1fr)!important;grid-template-rows:auto!important}
  .gallery-grid{grid-template-columns:repeat(2,1fr)!important;gap:5px!important}
  .footer-cols{grid-template-columns:1fr!important;gap:20px!important}
  .vmw-footer-btns{grid-template-columns:repeat(2,1fr)!important;gap:5px!important;max-width:100%!important}
  .vmw-footer{padding:60px 20px 100px!important}
  .wa-fab{bottom:90px!important}
  /* Global masonry */
  .gallery-masonry{columns:2;column-gap:5px}
  .gallery-masonry>*{break-inside:avoid;margin-bottom:5px}

  /* ── Hero ── */
  #home{min-height:100svh!important}
  #home h1{letter-spacing:.02em!important}
  #home .vmw-hero-logo{width:160px!important;height:160px!important}

  /* ── Legacy stats grid: 2×2 on mobile ── */
  .vmw-stats-grid{grid-template-columns:1fr 1fr!important;gap:2px!important}
  .vmw-stats-grid .stat-card{padding:36px 18px 32px!important}
  .vmw-stats-grid .stat-number{font-size:clamp(38px,9vw,58px)!important}
  .vmw-stats-grid .stat-label{font-size:9px!important;letter-spacing:.14em!important}

  /* ── Trusted by Temples: 2×2 grid ── */
  .vmw-temples-grid{grid-template-columns:repeat(2,1fr)!important;gap:5px!important}

  /* ── Services: stack to single column ── */
  .vmw-services-card{grid-template-columns:1fr!important;min-height:auto!important}
  .vmw-services-card > div:first-child{min-height:220px!important}
  .vmw-services-right{padding:24px 20px!important}

  /* ── RealWorkPhotos grid ── */
  .vmw-work-grid{grid-template-columns:repeat(2,1fr)!important;gap:5px!important}

  /* ── Preview masonry (Our Sacred Craftsmanship) — 3 columns ── */
  .preview-masonry{columns:3!important;column-gap:4px!important}
  .preview-masonry-item{margin-bottom:4px!important;border-radius:5px!important}
  .preview-masonry-item:hover{transform:none!important}
  .preview-masonry-item:active{transform:scale(0.97)!important}
  .preview-masonry-item .pm-label{font-size:11px!important}
  .preview-masonry-item .pm-cat{font-size:7px!important}
  .preview-masonry-item .pm-badge{font-size:7px!important;padding:3px 6px!important;top:8px!important;left:8px!important}

  /* ── Testimonials ── */
  .vmw-testimonials-grid{grid-template-columns:repeat(2,1fr)!important;gap:5px!important}
  .vmw-featured-testimonial{padding:24px 16px!important}
  .vmw-featured-testimonial p[style]{font-size:15px!important}

  /* ── Process timeline: 2-col (node + content) ── */
  .vmw-process-grid{grid-template-columns:56px 1fr!important;gap:0!important}
  .vmw-process-img{display:none!important}
  .vmw-process-node{grid-column:1!important;grid-row:1!important}
  .vmw-process-content{grid-column:2!important;grid-row:1!important;padding:0 0 0 16px!important}
  .vmw-process-content > div{padding:20px 16px!important}
  /* disable GPU-heavy filters on mobile process section */
  .vmw-process-section *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;will-change:auto!important}
  /* reposition spine to sit inside the 56px node column, not at 50% of full width */
  .vmw-process-spine{left:28px!important;transform:none!important}
  .vmw-process-spine-animated{display:none!important}

  /* ── Archive ── */
  .archive-grid{grid-template-columns:repeat(2,1fr)!important;grid-template-rows:auto!important}

  /* ── SectionCTA buttons ── */
  .section-cta-row{flex-direction:column!important;align-items:stretch!important;gap:10px!important;width:100%!important}
  .section-cta-row > *{width:100%!important;justify-content:center!important;text-align:center!important}

  /* ── Contact form ── */
  .vmw-contact-grid{grid-template-columns:1fr!important;gap:32px!important}
}

/* ─── SMALL MOBILE (≤430px) ────────────────────────────────── */
@media(max-width:430px){
  .section-pad{padding:56px 14px!important}
  .preview-masonry{columns:3!important;column-gap:3px!important}
  .preview-masonry-item{margin-bottom:3px!important}
  .vmw-stats-grid .stat-number{font-size:clamp(32px,10vw,48px)!important}
  .vmw-temples-grid{gap:4px!important}
  .vmw-work-grid{gap:4px!important}
  .vmw-testimonials-grid{gap:4px!important}
  #home h1{font-size:clamp(36px,10vw,56px)!important}
  .vmw-footer-btns{grid-template-columns:repeat(2,1fr)!important}
}

/* ─── ANIMATIONS safe for mobile ────────────────────────────── */
@media(max-width:768px){
  .vmw-parallax{will-change:transform}
}

img{image-rendering:auto;-webkit-image-rendering:auto}
.vmw-img{background:#0a0806}
.theme-toggle{right:70px!important}

.gold-text, .text-gold {
  color:#FFD700 !important;
  text-shadow:0 1px 2px rgba(0,0,0,.8);
  mix-blend-mode:screen;
}

@media (prefers-color-scheme: dark) {
  .hero-title { filter: brightness(1.4); }
}
`;
const CSS = buildCSS(C);

const ff = {
  display: { fontFamily:"'Cinzel',Georgia,serif" },
  serif:   { fontFamily:"'Cormorant Garamond',Georgia,serif" },
  body:    { fontFamily:"'Jost',sans-serif" },
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY DATA — wired to real images in /public/gallery/
   Gold:   /gallery/gold/   (13 images — .jpg/.png)
   Silver: /gallery/silver/ (1 .jpg — .heic files skipped, no browser support)
   Stone:  /gallery/stone/  (7 images — .jpg/.png)
   Temple: /gallery/temple/ (2 images — .jpg)
═══════════════════════════════════════════════════════════════ */
// NOTE: gid = stable UUID used as gallery_item_id in Supabase likes/saves/comments
// These must match the UUIDs in your Supabase gallery_items table.
// Run the seed SQL (SUPABASE_SCHEMA.sql → gallery seed) to create matching rows.
const GALLERY_IDOLS = [
  // ── Gold Work ───────────────────────────────────────────────
  { id:0,  gid:'vmw-gold-00', deity:'Sadari Gold Crown',       metal:'24K Gold Nagas',         purity:'24 Karat',  dims:'22cm × 18cm', stone:'None',        duration:'45–60 days', origin:'Sowcarpet', img:'/gallery/gold/sadarigold.jpg',         cat:'Gold Work',   artisanNotes:'Hand-chiselled Sadari with traditional Nagas finish. Each naga scale individually pressed.' },
  { id:1,  gid:'vmw-gold-01', deity:'Crown — Front View',      metal:'Gold Nagas Handcrafted', purity:'22 Karat',  dims:'30cm × 26cm', stone:'None',        duration:'60–90 days', origin:'Sowcarpet', img:'/gallery/gold/crown.jpg',              cat:'Gold Work',   artisanNotes:'Kireedam crafted per Agama Shastra proportions with hand-beaten gold sheets.' },
  { id:2,  gid:'vmw-gold-02', deity:'Crown — Back Detail',     metal:'24K Gold Polish',        purity:'24 Karat',  dims:'30cm × 26cm', stone:'None',        duration:'60–90 days', origin:'Sowcarpet', img:encodeURIComponent('/gallery/gold/crown back.jpg').replace(/%2F/g,'/'), cat:'Gold Work',   artisanNotes:'Back detail showing intricate lotus petal work and gold filigree.' },
  { id:3,  gid:'vmw-gold-03', deity:'Crown — Side View',       metal:'Gold Nagas Finish',      purity:'22 Karat',  dims:'30cm × 26cm', stone:'None',        duration:'60–90 days', origin:'Sowcarpet', img:encodeURIComponent('/gallery/gold/crown side.jpg').replace(/%2F/g,'/'), cat:'Gold Work',   artisanNotes:'Side profile reveals layered construction — inner copper frame, outer gold sheet.' },
  { id:4,  gid:'vmw-gold-04', deity:'Crown Piece I',           metal:'Gold Handwork',          purity:'22 Karat',  dims:'28cm × 22cm', stone:'None',        duration:'45–60 days', origin:'Sowcarpet', img:'/gallery/gold/crown1.jpg',             cat:'Gold Work',   artisanNotes:'Classic crown form with embossed floral patterns across the Makuta band.' },
  { id:5,  gid:'vmw-gold-05', deity:'Crown — Tall Form',       metal:'Gold Alloy Polish',      purity:'18 Karat',  dims:'38cm × 24cm', stone:'None',        duration:'60–75 days', origin:'Sowcarpet', img:'/gallery/gold/crownn.jpg',             cat:'Gold Work',   artisanNotes:'Tall Makuta form for Vishnu pantheon deities, mirror-polished finish.' },
  { id:6,  gid:'vmw-gold-06', deity:'Crown — Side Tall',       metal:'24K Nagas Finish',       purity:'24 Karat',  dims:'38cm × 24cm', stone:'None',        duration:'60–75 days', origin:'Sowcarpet', img:'/gallery/gold/crownnside.jpg',         cat:'Gold Work',   artisanNotes:'Side view of tall Makuta — the spine rib structure ensures strength and symmetry.' },
  { id:7,  gid:'vmw-gold-07', deity:'Straight Crown',          metal:'Gold Beaten Work',       purity:'22 Karat',  dims:'25cm × 20cm', stone:'None',        duration:'30–45 days', origin:'Sowcarpet', img:encodeURIComponent('/gallery/gold/straight crown.jpg').replace(/%2F/g,'/'), cat:'Gold Work',   artisanNotes:'Cylindrical Kireedam with straight walls — traditional South Indian temple style.' },
  { id:8,  gid:'vmw-gold-08', deity:'Hand Ornament',           metal:'Gold Plated Copper',     purity:'Plated',    dims:'15cm × 8cm',  stone:'None',        duration:'20–30 days', origin:'Sowcarpet', img:'/gallery/gold/hand1.jpg',              cat:'Gold Work',   artisanNotes:'Hasta Abharana set for deity hand — electro-gold plated over solid copper base.' },
  { id:9,  gid:'vmw-gold-09', deity:'Kandabaranam',            metal:'Temple Gold Crown',      purity:'22 Karat',  dims:'35cm × 28cm', stone:'Ruby, Emerald',duration:'75–90 days', origin:'Sowcarpet', img:'/gallery/gold/kandabaranam.jpg',       cat:'Crown Work',  artisanNotes:'Kandabaranam with traditional stone-set Prabha frame — worn during festival processions.' },
  { id:10, gid:'vmw-gold-10', deity:'Kanganam Bangle',         metal:'Gold Stone Setting',     purity:'22 Karat',  dims:'8cm × 6cm',   stone:'Emerald, CZ', duration:'15–20 days', origin:'Sowcarpet', img:'/gallery/gold/kanganam4.jpg',          cat:'Gold Work',   artisanNotes:'Deity wrist bangle with micro-pavé stone setting — four units per commission standard.' },
  { id:11, gid:'vmw-gold-11', deity:'Sadari II',               metal:'24K Gold Nagas',         purity:'24 Karat',  dims:'20cm × 16cm', stone:'None',        duration:'45–60 days', origin:'Sowcarpet', img:encodeURIComponent('/gallery/gold/SADARI 2.jpg').replace(/%2F/g,'/'), cat:'Gold Work',   artisanNotes:'Second Sadari variant with wider Nagas flange — for Lakshmi and Saraswati forms.' },
  { id:12, gid:'vmw-gold-12', deity:'Sur Kad Ornament',        metal:'Gold Copper Alloy',      purity:'Alloy',     dims:'18cm × 12cm', stone:'None',        duration:'25–35 days', origin:'Sowcarpet', img:'/gallery/gold/sur kad.png',            cat:'Gold Work',   artisanNotes:'Ear ornament set in traditional Thiru Sur Kad pattern — repousse hammered.' },
  // ── Silver Work ─────────────────────────────────────────────
  { id:13, gid:'vmw-silv-13', deity:'Kandabaranam Silver',     metal:'Sterling Silver',        purity:'92.5%',     dims:'32cm × 26cm', stone:'None',        duration:'45–60 days', origin:'Sowcarpet', img:'/gallery/silver/kandabaranam.jpg',     cat:'Silver Work', artisanNotes:'Silver Kandabaranam — Britannia silver sheet hand-chased and antique-finished.' },
  // ── Stone Work ──────────────────────────────────────────────
  { id:14, gid:'vmw-ston-14', deity:'Stone Piece I',           metal:'Stone · Gold Inlay',     purity:'Certified', dims:'40cm × 30cm', stone:'Granite',     duration:'90–120 days',origin:'Sowcarpet', img:'/gallery/stone/stone1.jpg',            cat:'Stone Work',  artisanNotes:'Granite sculpture with gold-inlay highlights on crown and jewelry points.' },
  { id:15, gid:'vmw-ston-15', deity:'Stone Piece II',          metal:'Stone Setting',          purity:'Certified', dims:'38cm × 28cm', stone:'Granite',     duration:'90–120 days',origin:'Sowcarpet', img:'/gallery/stone/stone2.jpg',            cat:'Stone Work',  artisanNotes:'Full standing deity in Karnataka black granite — traditional Chola iconography.' },
  { id:16, gid:'vmw-ston-16', deity:'Stone Piece III',         metal:'Precious Stone Work',    purity:'Certified', dims:'45cm × 32cm', stone:'Granite',     duration:'90–120 days',origin:'Sowcarpet', img:'/gallery/stone/stone3.jpg',            cat:'Stone Work',  artisanNotes:'Larger panel with multi-figure composition — temple gopuram decorative work.' },
  { id:17, gid:'vmw-ston-17', deity:'Stone Piece IV',          metal:'Stone · Silver',         purity:'92.5% Silver', dims:'35cm × 25cm', stone:'Granite', duration:'75–90 days', origin:'Sowcarpet', img:'/gallery/stone/stone4.jpg',            cat:'Stone Work',  artisanNotes:'Deity with silver kavach overlay on stone base — combined stone-metal commission.' },
  { id:18, gid:'vmw-ston-18', deity:'Kow Pathakkam',           metal:'Stone · Temple Gold',    purity:'22 Karat',  dims:'22cm × 18cm', stone:'Coral, Ruby', duration:'45–60 days', origin:'Sowcarpet', img:encodeURIComponent('/gallery/stone/kow pathakkam.png').replace(/%2F/g,'/'), cat:'Stone Work',  artisanNotes:'Cow motif pendant in stone and gold — Kamadhenu iconography for temple altars.' },
  { id:19, gid:'vmw-ston-19', deity:'Kow Pa Ornament',         metal:'Stone Setting Deluxe',   purity:'Certified', dims:'14cm × 10cm', stone:'Coral, CZ',   duration:'30–40 days', origin:'Sowcarpet', img:encodeURIComponent('/gallery/stone/kow pa.jpg').replace(/%2F/g,'/'),       cat:'Stone Work',  artisanNotes:'Deluxe stone-set ornamental piece with 108 stones per traditional Agamic count.' },
  { id:20, gid:'vmw-ston-20', deity:'Thamarai Poo',            metal:'Lotus Flower Stone',     purity:'Certified', dims:'16cm × 16cm', stone:'Pink Quartz',  duration:'25–35 days', origin:'Sowcarpet', img:encodeURIComponent('/gallery/stone/thamarai poo3.jpg').replace(/%2F/g,'/'), cat:'Stone Work',  artisanNotes:'Thamarai (lotus) in carved stone with hand-painted petal details.' },
  // ── Temple Work ─────────────────────────────────────────────
  { id:21, gid:'vmw-temp-21', deity:'Temple Deity',            metal:'Panchaloha Cast',        purity:'5-Metal Alloy', dims:'60cm × 40cm', stone:'None',   duration:'120–180 days',origin:'Sowcarpet', img:'/gallery/temple/god.jpg',              cat:'Vigraham',    artisanNotes:'Lost-wax cast Panchaloha vigraham — 5-metal alloy (gold, silver, copper, lead, iron). Consecrated before delivery.' },
  { id:22, gid:'vmw-temp-22', deity:'Temple Ornament Set',     metal:'Full Temple Regalia',    purity:'Mixed',     dims:'Various',     stone:'Ruby, Emerald',duration:'90–150 days',origin:'Sowcarpet', img:'/gallery/temple/temple.jpg',           cat:'Vigraham',    artisanNotes:'Complete Alankara set — Kireedam, Kavach, Haram, Bangles, Padasara in matching design.' },
];

const IMG = {
  heroBg: '/gallery/gold/crown.jpg',
  gold:   '/gallery/gold/sadarigold.jpg',
  silver: '/gallery/silver/kandabaranam.jpg',
  copper: '/gallery/gold/hand1.jpg',
  brass:  '/gallery/stone/stone1.jpg',
  pancha: '/gallery/temple/god.jpg',
  idol:   '/gallery/temple/temple.jpg',
  vimana: '/gallery/gold/crownn.jpg',
  crown:  '/gallery/gold/crown.jpg',
  vessel: '/gallery/stone/stone2.jpg',
  temple: '/gallery/temple/temple.jpg',
  prabha: '/gallery/gold/crown1.jpg',
  work1:  '/gallery/gold/crown.jpg',
  work2:  '/gallery/gold/crown1.jpg',
  work3:  '/gallery/gold/kanganam4.jpg',
  work4:  '/gallery/silver/kandabaranam.jpg',
  work5:  '/gallery/gold/kandabaranam.jpg',
  work6:  '/gallery/temple/god.jpg',
};

/* ═══════════════════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
═══════════════════════════════════════════════════════════════ */
const Dot = () => {
  const C = useTheme();
  return (
    <svg width="5" height="5" viewBox="0 0 5 5" style={{ flexShrink:0 }}>
    <rect x="1" y="1" width="3" height="3" fill={C.gold} transform="rotate(45 2.5 2.5)" opacity=".8"/>
  </svg>
  );
};

const GoldRule = ({ w='100%', my=0, opacity=.14 }) => {
  const C = useTheme();
  return (
  <div style={{ width:w, height:1, background:`linear-gradient(90deg, transparent, ${C.gold}88, transparent)`, margin:`${my}px 0`, opacity }} />
  );
};

/* ═══════════════════════════════════════════════════════════════
   PREMIUM ANIMATION PRIMITIVES — luxury scroll-triggered motion
═══════════════════════════════════════════════════════════════ */

// Luxury easing curves
const EASE_OUT   = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.45, 0, 0.55, 1];

// Base Reveal — fades up, triggers once (smooth on mobile)
const Reveal = ({ children, delay=0, y=24, duration=0.8 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y }}
      animate={inView ? { opacity:1, y:0 } : { opacity:0, y }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Slide from left — triggers once
const SlideLeft = ({ children, delay=0, distance=60, duration=0.9 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, x: -distance }}
      animate={inView ? { opacity:1, x:0 } : { opacity:0, x: -distance }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Slide from right — triggers once
const SlideRight = ({ children, delay=0, distance=60, duration=0.9 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, x: distance }}
      animate={inView ? { opacity:1, x:0 } : { opacity:0, x: distance }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Stagger container helper — triggers once
const StaggerContainer = ({ children, stagger=0.12, delay=0, className='', style={} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref} className={className} style={style}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden:{}, visible:{ transition:{ staggerChildren: stagger, delayChildren: delay } } }}>
      {children}
    </motion.div>
  );
};

// Stagger child — fade + rise
const StaggerItem = ({ children, y=28, duration=0.8, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, y },
      visible: { opacity:1, y:0, transition:{ duration, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);

// Soft zoom in — triggers once
const ZoomIn = ({ children, delay=0, scale=0.88, duration=0.9, style={} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity:0, scale }}
      animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Fade in — triggers once
const FadeIn = ({ children, delay=0, duration=0.9, style={}, className='' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-30px' });
  return (
    <motion.div ref={ref} style={style} className={className}
      initial={{ opacity:0 }}
      animate={inView ? { opacity:1 } : { opacity:0 }}
      transition={{ duration, delay, ease: EASE_IN_OUT }}>
      {children}
    </motion.div>
  );
};

// Slide from bottom (used for cards, CTAs)
const SlideUp = ({ children, delay=0, distance=40, duration=0.85, style={} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-50px' });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity:0, y: distance }}
      animate={inView ? { opacity:1, y:0 } : { opacity:0, y: distance }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Stagger child variants — extended with directional support
const StaggerItemLeft = ({ children, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, x:-36 },
      visible: { opacity:1, x:0, transition:{ duration:0.8, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);

const StaggerItemRight = ({ children, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, x:36 },
      visible: { opacity:1, x:0, transition:{ duration:0.8, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);

// Scale-up stagger child (for featured/hero cards)
const StaggerItemScale = ({ children, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, scale:0.88 },
      visible: { opacity:1, scale:1, transition:{ duration:0.75, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);


/* ═══════════════════════════════════════════════════════════════
   STAR BORDER BUTTON
═══════════════════════════════════════════════════════════════ */
const StarBorderButton = ({ children, onClick, style={}, speed=6 }) => {
  const C = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ position:'relative', display:'inline-block', cursor:'pointer', ...style }}>
      <div style={{ position:'absolute', inset:-1, borderRadius:6, overflow:'hidden', pointerEvents:'none', opacity:hovered?.55:.28, transition:'opacity .3s' }}>
        <div style={{ position:'absolute', width:'200%', height:'200%', top:'-50%', left:'-50%',
          background:`conic-gradient(from 0deg,transparent 340deg,${C.goldLt} 355deg,rgba(255,255,255,0.6) 360deg,${C.goldLt} 5deg,transparent 20deg)`,
          animation:`starBorderSpin ${speed}s linear infinite` }}/>
        <div style={{ position:'absolute', inset:2, background:C.bg1, borderRadius:4 }}/>
      </div>
      <div style={{ position:'relative', padding:'12px 32px',
        background: hovered ? `rgba(255,215,0,0.1)` : 'transparent',
        border:`1px solid ${hovered ? C.goldLt : C.borderGold}`, borderRadius:4,
        color:hovered ? C.goldLt : C.gold,
        fontFamily:"'Jost',sans-serif", fontSize:9,
        letterSpacing:'.35em', fontWeight:700, textTransform:'uppercase',
        transition:'color .3s, background .3s, border-color .3s', whiteSpace:'nowrap' }}>
        {children}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   UNIFIED PREMIUM BUTTON SYSTEM
   Primary  = gold glassmorphism + shine sweep
   Secondary = dark glass outline
   Both: hover glow · lift · cursor proximity reaction
═══════════════════════════════════════════════════════════════ */

// Shared CSS injected once into document head
const PREMIUM_BTN_CSS = `@keyframes lineGlow {
  0% { opacity: 0.6; box-shadow: 0 0 6px rgba(255,215,0,0.4); }
  50% { opacity: 1; box-shadow: 0 0 16px rgba(255,215,0,0.8); }
  100% { opacity: 0.6; box-shadow: 0 0 6px rgba(255,215,0,0.4); }
}
@keyframes btnShine {
  0%   { transform: translateX(-130%) skewX(-18deg); }
  100% { transform: translateX(260%)  skewX(-18deg); }
}
.vmw-btn-primary {
  position: relative; overflow: hidden; display: inline-flex;
  align-items: center; justify-content: center;
  padding: 14px 40px;
  background: linear-gradient(135deg, rgba(180,130,0,0.55) 0%, rgba(255,215,0,0.72) 40%, rgba(255,232,80,0.80) 60%, rgba(255,215,0,0.72) 100%);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255,215,0,0.65);
  border-radius: 999px;
  color: #0a0600;
  font-family: 'Jost', sans-serif;
  font-size: 9px; letter-spacing: .35em; font-weight: 800;
  text-transform: uppercase; cursor: pointer;
  box-shadow:
    0 0 0 0 rgba(255,215,0,0),
    inset 0 1px 0 rgba(255,255,255,0.30),
    inset 0 -1px 0 rgba(0,0,0,0.12);
  transition:
    transform .32s cubic-bezier(.34,1.56,.64,1),
    box-shadow .32s ease,
    border-color .28s ease,
    background .28s ease;
  will-change: transform, box-shadow;
}
.vmw-btn-primary::before {
  content: '';
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 44%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.38) 50%, transparent 100%);
  transform: translateX(-130%) skewX(-18deg);
  pointer-events: none;
  border-radius: inherit;
}
.vmw-btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow:
    0 6px 32px rgba(255,215,0,0.52),
    0 2px 12px rgba(255,215,0,0.30),
    inset 0 1px 0 rgba(255,255,255,0.40);
  border-color: rgba(255,232,80,0.85);
  background: linear-gradient(135deg, rgba(200,150,0,0.65) 0%, rgba(255,225,0,0.85) 40%, rgba(255,244,100,0.90) 60%, rgba(255,225,0,0.85) 100%);
}
.vmw-btn-primary:hover::before {
  animation: btnShine 0.68s ease forwards;
}
.vmw-btn-primary:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 14px rgba(255,215,0,0.35);
}

.vmw-btn-secondary {
  position: relative; overflow: hidden; display: inline-flex;
  align-items: center; justify-content: center;
  padding: 14px 40px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 999px;
  color: rgba(255,255,255,0.72);
  font-family: 'Jost', sans-serif;
  font-size: 9px; letter-spacing: .35em; font-weight: 700;
  text-transform: uppercase; cursor: pointer;
  box-shadow: 0 0 0 0 rgba(255,215,0,0), inset 0 1px 0 rgba(255,255,255,0.08);
  transition:
    transform .32s cubic-bezier(.34,1.56,.64,1),
    box-shadow .32s ease,
    border-color .28s ease,
    color .22s ease,
    background .28s ease;
  will-change: transform, box-shadow;
}
.vmw-btn-secondary::before {
  content: '';
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 44%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.12) 50%, transparent 100%);
  transform: translateX(-130%) skewX(-18deg);
  pointer-events: none;
  border-radius: inherit;
}
.vmw-btn-secondary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow:
    0 6px 28px rgba(255,215,0,0.20),
    0 2px 10px rgba(255,215,0,0.12),
    inset 0 1px 0 rgba(255,255,255,0.14);
  border-color: rgba(255,215,0,0.52);
  color: rgba(255,215,0,0.92);
  background: rgba(255,215,0,0.07);
}
.vmw-btn-secondary:hover::before {
  animation: btnShine 0.72s ease forwards;
}
.vmw-btn-secondary:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 12px rgba(255,215,0,0.15);
}

/* Light-theme overrides */
.vmw-btn-secondary-light {
  border-color: rgba(100,70,20,0.30);
  color: rgba(40,20,0,0.70);
  background: rgba(180,130,0,0.04);
}
.vmw-btn-secondary-light:hover {
  border-color: rgba(184,134,11,0.70);
  color: rgba(140,90,0,0.95);
  background: rgba(184,134,11,0.09);
  box-shadow: 0 6px 28px rgba(180,130,0,0.18), 0 2px 10px rgba(180,130,0,0.10);
}
`;

// Inject button CSS once (moved to App useEffect for SSR safety)

const CurvyButton = ({ children, onClick, primary=false, style={} }) => {
  const C = useTheme();
  const btnRef = useRef(null);
  const rafRef = useRef(null);

  // Cursor proximity effect — magnetic repel/attract
  const handleMouseMove = useCallback((e) => {
    const btn = btnRef.current;
    if (!btn) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = 90;
      if (dist < maxDist) {
        const factor = (1 - dist / maxDist) * 5;
        btn.style.transform = `translate(${dx * factor * 0.06}px, ${dy * factor * 0.06}px)`;
        if (primary) {
          const glowOpacity = (1 - dist / maxDist) * 0.38;
          btn.style.boxShadow = `0 0 ${20 + factor*4}px rgba(255,215,0,${glowOpacity}), inset 0 1px 0 rgba(255,255,255,0.30)`;
        } else {
          const glowOpacity = (1 - dist / maxDist) * 0.18;
          btn.style.boxShadow = `0 0 ${14 + factor*3}px rgba(255,215,0,${glowOpacity})`;
        }
      }
    });
  }, [primary]);

  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    btn.style.transform = '';
    btn.style.boxShadow = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  const cls = primary
    ? 'vmw-btn-primary'
    : `vmw-btn-secondary${!C.isDark ? ' vmw-btn-secondary-light' : ''}`;

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={cls}
      style={style}
    >
      {children}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION CTA — reusable call-to-action after each section
═══════════════════════════════════════════════════════════════ */
const SectionCTA = ({ primary="Commission a Piece", secondary="View Gallery", onPrimary, onSecondary }) => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  return (
  <Reveal delay={.15}>
    <div className="section-cta-row" style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginTop:52, paddingTop:44, borderTop:`1px solid ${C.border}` }}>
      <CurvyButton primary onClick={onPrimary || (()=>setShowCommissionModal(true))}>
        {primary}
      </CurvyButton>
      <StarBorderButton onClick={onSecondary || (()=>navigate('/gallery'))} speed={6}>
        {secondary}
      </StarBorderButton>
    </div>
  </Reveal>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CANVAS BACKGROUND
═══════════════════════════════════════════════════════════════ */
const CanvasBg = () => {
  const C = useTheme();
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    // Reduced from 28 to 14 particles for performance
    const particles = Array.from({ length: 14 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx:(Math.random()-.5)*.08, vy:(Math.random()-.5)*.08,
      r: Math.random()*.6+.2, o: Math.random()*.12+.03
    }));
    let raf;
    let frame = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame++;
      // Only redraw every 2 frames (30fps instead of 60fps)
      if (frame % 2 !== 0) return;
      ctx.clearRect(0,0,W,H);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,195,150,${p.o})`; ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      });
    };
    draw();
    const onResize = () => { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; };
    window.addEventListener('resize',onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); };
  }, []);
  return <canvas ref={ref} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:.15 }}/>;
};

const Grain = () => (
  <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', opacity:.025,
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundRepeat:'repeat', backgroundSize:'256px 256px' }}/>
);

/* ═══════════════════════════════════════════════════════════════
   CRAFTWORK IMAGE PANEL — replaces 3D model (no external deps)
═══════════════════════════════════════════════════════════════ */
const CraftworkPanel = () => {
  const C = useTheme();
  const PANEL_IMGS = [
    { src:'/gallery/gold/sadarigold.jpg',   label:'Sadari Gold — 24K Nagas Work' },
    { src:'/gallery/gold/crown.jpg',         label:'Crown Work — Gold Handcrafted' },
    { src:'/gallery/gold/kanganam4.jpg',     label:'Kanganam — Gold Stone Setting' },
    { src:'/gallery/gold/kandabaranam.jpg',  label:'Kandabaranam — Crown Work' },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % PANEL_IMGS.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position:'relative', height:540, overflow:'hidden', border:`1px solid ${C.border}`, background:C.bg2 }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={active}
          src={PANEL_IMGS[active].src}
          alt={PANEL_IMGS[active].label}
          initial={{ opacity:0, scale:1.06 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0, scale:.97 }}
          transition={{ duration:.9, ease:[.16,1,.3,1] }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'sepia(12%) brightness(.92)' }}
        />
      </AnimatePresence>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,6,4,.85) 0%, transparent 55%)' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${C.gold}66, transparent)` }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'22px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration:.4 }}>
            <div style={{ ...ff.display, fontSize:15, color:C.text, fontWeight:600, marginBottom:4 }}>{PANEL_IMGS[active].label}</div>
            <div style={{ ...ff.body, fontSize:7.5, letterSpacing:'.4em', color:C.gold, fontWeight:600, textTransform:'uppercase' }}>Vijay Metal Works · Sowcarpet · Since 1915</div>
          </motion.div>
        </AnimatePresence>
        <div style={{ display:'flex', gap:6, marginTop:14 }}>
          {PANEL_IMGS.map((_,i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: i===active ? 20 : 6, height:6, borderRadius:3, border:'none', cursor:'pointer',
                background: i===active ? C.gold : 'rgba(255,255,255,0.22)', transition:'all .3s', padding:0 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LUXURY TEXT LOADER — cinematic brand reveal, no icons/circles
═══════════════════════════════════════════════════════════════ */
const Loader = ({ onDone }) => {
  const [phase, setPhase] = useState(0);
  // phase 0=mount, 1=line-in, 2=letters reveal, 3=subtitle+bar, 4=exit
  const [pct, setPct] = useState(0);
  const [lettersDone, setLettersDone] = useState(false);

  const BRAND = 'VIJAY METAL WORKS';
  const letters = BRAND.split('');

  // On mobile, skip the full splash — show briefly and exit fast
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(()=>{
    if (isMobile) {
      // Mobile: fast splash — phase straight to exit in ~800ms total
      const t1 = setTimeout(()=>setPhase(1), 80);
      const t2 = setTimeout(()=>setPhase(2), 220);
      const t3 = setTimeout(()=>setPhase(3), 520);
      const t4 = setTimeout(()=>setPhase(4), 900);
      const t5 = setTimeout(()=>onDone(), 1100);
      return()=>{ [t1,t2,t3,t4,t5].forEach(clearTimeout); };
    }
    const t1 = setTimeout(()=>setPhase(1), 180);
    const t2 = setTimeout(()=>setPhase(2), 520);
    const t3 = setTimeout(()=>setPhase(3), 1380);
    const t4 = setTimeout(()=>setPhase(4), 2600);
    const t5 = setTimeout(()=>onDone(), 3100);
    return()=>{ [t1,t2,t3,t4,t5].forEach(clearTimeout); };
  },[onDone, isMobile]);

  // Percentage counter tied to phase 3
  useEffect(()=>{
    if(phase < 3) return;
    let start = null;
    const DURATION = 1200;
    const tick = (ts) => {
      if(!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setPct(Math.round(eased * 100));
      if(progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  },[phase]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          key="luxury-loader"
          exit={{ opacity:0, filter:'blur(12px)' }}
          transition={{ duration:.52, ease:[.76,0,.24,1] }}
          style={{
            position:'fixed', inset:0, zIndex:500,
            background:'#050402',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            overflow:'hidden',
          }}
        >
          {/* Deep radial ambient glow */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            background:'radial-gradient(ellipse 55% 40% at 50% 52%, rgba(255,215,0,0.055) 0%, transparent 68%)',
          }}/>

          {/* Noise grain overlay */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none', opacity:.018,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat:'repeat', backgroundSize:'200px 200px',
          }}/>

          {/* ── Top thin gold line sweep ── */}
          <motion.div
            initial={{ scaleX:0, opacity:0 }}
            animate={ phase>=1 ? { scaleX:1, opacity:1 } : { scaleX:0, opacity:0 } }
            transition={{ duration:.65, ease:[.16,1,.3,1] }}
            style={{
              position:'absolute', top:'38%', left:'50%',
              transform:'translateX(-50%)', transformOrigin:'left center',
              width:320, height:1,
              background:'linear-gradient(90deg, transparent, rgba(255,215,0,0.55), transparent)',
            }}
          />

          {/* ── Main brand letters ── */}
          <div style={{
            position:'relative', zIndex:2,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexWrap:'nowrap', gap:0,
            userSelect:'none',
          }}>
            {letters.map((letter, i) => {
              const isSpace = letter === ' ';
              return (
                <motion.span
                  key={i}
                  initial={{ opacity:0, y:18, filter:'blur(6px)' }}
                  animate={ phase>=2
                    ? { opacity:1, y:0, filter:'blur(0px)' }
                    : { opacity:0, y:18, filter:'blur(6px)' }
                  }
                  transition={{
                    duration:.52,
                    delay: isSpace ? 0 : (i * 0.038) + 0.04,
                    ease:[.16,1,.3,1],
                  }}
                  onAnimationComplete={()=>{ if(i===letters.length-1) setLettersDone(true); }}
                  style={{
                    fontFamily:"'Cinzel',Georgia,serif",
                    fontSize:'clamp(22px,4.5vw,46px)',
                    fontWeight:700,
                    letterSpacing:'.28em',
                    color:'transparent',
                    backgroundClip:'text',
                    WebkitBackgroundClip:'text',
                    backgroundImage:'linear-gradient(135deg,#CC9900 0%,#FFD700 38%,#FFE88A 58%,#FFD700 75%,#CC9900 100%)',
                    backgroundSize:'200% 100%',
                    animation: lettersDone ? 'loaderGoldShine 3.2s ease-in-out infinite' : 'none',
                    display:'inline-block',
                    width: isSpace ? '0.5em' : 'auto',
                    minWidth: isSpace ? '0.5em' : 'auto',
                    textShadow:'0 0 28px rgba(255,215,0,0.22)',
                  }}
                >
                  {isSpace ? '\u00A0' : letter}
                </motion.span>
              );
            })}
          </div>

          {/* ── Subtitle line ── */}
          <AnimatePresence>
            {phase>=3 && (
              <motion.div
                key="subtitle"
                initial={{ opacity:0, y:8, filter:'blur(4px)' }}
                animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                exit={{ opacity:0 }}
                transition={{ duration:.48, delay:.08, ease:[.16,1,.3,1] }}
                style={{
                  marginTop:16, textAlign:'center',
                  fontFamily:"'Jost',sans-serif",
                  fontSize:9, letterSpacing:'.58em',
                  color:'rgba(255,215,0,0.52)',
                  fontWeight:600, textTransform:'uppercase',
                }}
              >
                SINCE 1915 · TEMPLE METALCRAFT
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Premium loading bar ── */}
          <AnimatePresence>
            {phase>=3 && (
              <motion.div
                key="loadbar"
                initial={{ opacity:0, scaleX:.6 }}
                animate={{ opacity:1, scaleX:1 }}
                exit={{ opacity:0 }}
                transition={{ duration:.4, delay:.14, ease:[.16,1,.3,1] }}
                style={{ marginTop:36, textAlign:'center', position:'relative' }}
              >
                {/* Track */}
                <div style={{
                  width:200, height:1,
                  background:'rgba(255,215,0,0.12)',
                  borderRadius:1, position:'relative', overflow:'hidden',
                }}>
                  {/* Fill */}
                  <div style={{
                    position:'absolute', top:0, left:0, height:'100%',
                    width:`${pct}%`,
                    background:'linear-gradient(90deg,#CC9900,#FFD700,#FFE88A)',
                    borderRadius:1,
                    transition:'width .018s linear',
                    boxShadow:'0 0 8px rgba(255,215,0,0.5)',
                  }}/>
                  {/* Shimmer glint */}
                  <motion.div
                    animate={{ x:[-40, 240] }}
                    transition={{ duration:1.4, repeat:Infinity, ease:'easeInOut', repeatDelay:.2 }}
                    style={{
                      position:'absolute', top:0, left:0,
                      width:32, height:'100%',
                      background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)',
                    }}
                  />
                </div>
                {/* Counter */}
                <div style={{
                  fontFamily:"'Jost',sans-serif",
                  fontSize:8, letterSpacing:'.32em',
                  color:'rgba(255,255,255,0.2)',
                  marginTop:9, fontWeight:500,
                }}>
                  {pct}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom thin gold line sweep ── */}
          <motion.div
            initial={{ scaleX:0, opacity:0 }}
            animate={ phase>=1 ? { scaleX:1, opacity:1 } : { scaleX:0, opacity:0 } }
            transition={{ duration:.65, delay:.1, ease:[.16,1,.3,1] }}
            style={{
              position:'absolute', bottom:'38%', left:'50%',
              transform:'translateX(-50%)', transformOrigin:'right center',
              width:320, height:1,
              background:'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
            }}
          />

          {/* Inject keyframe for gold shine */}
          <style>{`
            @keyframes loaderGoldShine {
              0%   { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TICKER
═══════════════════════════════════════════════════════════════ */
const Ticker = () => {
  const C = useTheme();
  const items = ["MEENAKSHI AMMAN","BRIHADEESWARAR","SRIRANGAM","TIRUMALA TIRUPATI","MURUGAN LONDON","GOLDEN TEMPLE VELLORE","NATARAJA CHIDAMBARAM","KAPALEESWARAR CHENNAI","VAIKUNDA VASA PERUMAL"];
  const all = [...items,...items,...items];
  return (
    <div style={{overflow:'hidden',borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:'12px 0',background:'rgba(20,18,16,0.8)',position:'relative',zIndex:2}}>
      <motion.div animate={{x:['0%','-33.33%']}} transition={{duration:70,ease:'linear',repeat:Infinity}}
        style={{display:'flex',whiteSpace:'nowrap'}}>
        {all.map((t,i)=>(
          <span key={i} style={{display:'inline-flex',alignItems:'center'}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.44em',color:C.faint,fontWeight:600,padding:'0 26px',textTransform:'uppercase'}}>{t}</span>
            <Dot/>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   LOGO — base64 encoded actual logo image
═══════════════════════════════════════════════════════════════ */
const LOGO_NAV = 'data:image/png;base64,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';
const LOGO_HERO = 'data:image/png;base64,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';
const LOGO_B64 = LOGO_NAV; // alias for navbar compatibility;

/* ═══════════════════════════════════════════════════════════════
   NAV — Premium CardNav with sticky glass, dual CTAs, mobile menu
═══════════════════════════════════════════════════════════════ */
const Nav = ({ scrolled }) => {
  const C = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close card when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setCardOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on scroll
  useEffect(() => {
    if (cardOpen) setCardOpen(false);
  }, [scrolled]);

  const navCards = [
    {
      label: 'Heritage',
      bg: C.isDark ? '#1C1208' : '#2A1A06',
      links: [
        { label: 'Legacy', id: 'legacy' },
        { label: 'Our Craft', id: 'services' },
        { label: 'Process', id: 'showcase' },
      ]
    },
    {
      label: 'Gallery',
      bg: C.isDark ? '#0A1A14' : '#0D2218',
      links: [
        { label: 'Full Gallery', path: '/gallery' },
        { label: 'Featured Works', id: 'gallery-preview' },
        { label: 'Archive', id: 'archive' },
      ]
    },
    {
      label: 'Connect',
      bg: C.isDark ? '#181218' : '#1E0E1E',
      links: [
        { label: 'Testimonials', id: 'testimonials' },
        { label: 'FAQ', id: 'faq' },
        { label: 'Contact', id: 'contact' },
      ]
    },
  ];

  const scrollTo = (id, path) => {
    if (path) {
      navigate(path);
      setCardOpen(false);
      setMenuOpen(false);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setCardOpen(false);
      setMenuOpen(false);
    }
  };

  // Deep luxury backgrounds
  const navBg = scrolled
    ? C.isDark ? 'rgba(5,5,5,0.92)' : 'rgba(245,240,232,0.92)'
    : 'transparent';

  const pillBg = C.isDark
    ? 'linear-gradient(160deg, rgba(17,14,10,0.98) 0%, rgba(8,6,4,0.99) 100%)'
    : 'linear-gradient(160deg, rgba(252,247,240,0.98) 0%, rgba(242,235,222,0.99) 100%)';
  const cardBg = C.isDark ? 'rgba(10,8,5,0.98)' : 'rgba(248,243,235,0.98)';

  const sepColor = C.isDark ? 'rgba(255,215,0,0.12)' : 'rgba(180,130,10,0.18)';

  return (
    <>
      {/* ── Sticky glass wrapper ── */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.4, delay: 2.8, ease: [.16,1,.3,1] }}
        className="nav-desktop"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 120,
          padding: scrolled ? '8px 32px' : '18px 32px',
          background: navBg,
          backdropFilter: scrolled ? 'blur(32px) saturate(200%)' : 'none',
          borderBottom: scrolled ? `1px solid ${C.isDark ? 'rgba(255,215,0,0.08)' : 'rgba(180,130,10,0.15)'}` : 'none',
          transition: 'all .55s cubic-bezier(.16,1,.3,1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>

        {/* ── Pill container ── */}
        <motion.div
          ref={menuRef}
          whileHover={{ y: -1, boxShadow: C.isDark
            ? '0 8px 48px rgba(0,0,0,.75), 0 0 0 1px rgba(255,215,0,0.28), 0 0 32px rgba(255,215,0,0.07)'
            : '0 8px 40px rgba(0,0,0,.18), 0 0 0 1px rgba(180,130,10,0.32)'
          }}
          transition={{ duration: .22 }}
          style={{
            width: '100%', maxWidth: 920,
            background: pillBg,
            border: `1px solid ${C.isDark ? 'rgba(255,215,0,0.22)' : 'rgba(180,130,10,0.28)'}`,
            borderRadius: 16,
            boxShadow: C.isDark
              ? '0 4px 40px rgba(0,0,0,.7), 0 0 0 1px rgba(255,215,0,0.10), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 4px 32px rgba(0,0,0,.14), 0 0 0 1px rgba(180,130,10,0.12)',
            overflow: 'hidden',
            position: 'relative',
            backdropFilter: 'blur(32px) saturate(180%)',
          }}>

          {/* ── Top bar (always visible) ── */}
          <div style={{
            height: 58,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 10px 0 14px',
            position: 'relative', zIndex: 2,
          }}>

            {/* Hamburger + left separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>

  <div style={{
    width: 1.2,
    height: 32,
    background: 'linear-gradient(to bottom, rgba(255,215,0,0.2), rgba(255,215,0,0.9), rgba(255,215,0,0.2))',
    boxShadow: '0 0 8px rgba(255,215,0,0.6), 0 0 16px rgba(255,215,0,0.3)',
    marginRight: 6,
    borderRadius: 2,
    alignSelf: 'center',
    animation: 'lineGlow 2s ease-in-out infinite'
  }} />

  {/* BUTTON STARTS HERE */}
              <button
                onClick={() => setCardOpen(o => !o)}
                aria-label={cardOpen ? 'Close menu' : 'Open menu'}
                style={{
                  position: 'relative',
                  background: cardOpen
                    ? (C.isDark ? 'rgba(255,215,0,0.12)' : 'rgba(241, 178, 29, 0.12)')
                    : 'none',
                  border: `1px solid ${cardOpen ? (C.isDark ? 'rgba(255,215,0,0.35)' : 'rgba(204, 175, 108, 0.35)') : 'transparent'}`,
                  cursor: 'pointer',
                  width: 40, height: 40, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 5,
                  borderRadius: 10, transition: 'background .22s, box-shadow .22s, border-color .22s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = C.isDark ? 'rgba(255,215,0,0.10)' : 'rgba(180,130,10,0.10)';
                  e.currentTarget.style.boxShadow = `0 0 14px rgba(255,215,0,0.20)`;
                  e.currentTarget.style.borderColor = C.isDark ? 'rgba(255,215,0,0.28)' : 'rgba(180,130,10,0.28)';
                }}
                onMouseLeave={e => {
                  if (!cardOpen) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >

                {/* Top bar */}
                <div style={{
                  width: 22, height: 2.5,
                  background: cardOpen
                    ? C.gold
                    : (C.isDark ? 'rgba(255,255,255,0.92)' : 'rgba(20,10,0,0.88)'),
                  borderRadius: 2,
                  transform: cardOpen
                    ? 'translateY(3.75px) rotate(45deg)'
                    : 'none',
                  transition: 'transform .30s cubic-bezier(.77,0,.18,1), background .22s, width .22s',
                  boxShadow: cardOpen ? `0 0 8px rgba(255,215,0,0.45)` : 'none',
                  transformOrigin: 'center'
                }}/>
                {/* Bottom bar — shorter for asymmetry */}
                <div style={{
                  width: cardOpen ? 22 : 16,
                  height: 2.5,
                  background: cardOpen
                    ? C.gold
                    : (C.isDark ? 'rgba(255,255,255,0.92)' : 'rgba(20,10,0,0.88)'),
                  borderRadius: 2,
                  transform: cardOpen
                    ? 'translateY(-3.75px) rotate(-45deg)'
                    : 'none',
                  transition: 'transform .30s cubic-bezier(.77,0,.18,1), background .22s, width .22s',
                  boxShadow: cardOpen ? `0 0 8px rgba(255,215,0,0.45)` : 'none',
                  alignSelf: 'flex-end', marginRight: cardOpen ? 0 : 3,
                  transformOrigin: 'center'
                }}/>
              </button>
              
            </div>

            {/* Logo — centred absolutely */}
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '5px 12px', borderRadius: 10,
                transition: 'all .25s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.isDark ? 'rgba(255,215,0,0.06)' : 'rgba(180,130,10,0.07)';
                e.currentTarget.style.boxShadow = `0 0 16px rgba(255,215,0,0.12)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img
                src={LOGO_B64}
                alt="Vijay Metal Works"
                style={{
                  width: 32, height: 32, borderRadius: 7,
                  objectFit: 'cover',
                  border: `1px solid ${C.isDark ? 'rgba(255,215,0,0.4)' : 'rgba(180,130,10,0.35)'}`,
                  boxShadow: `0 0 14px rgba(255,215,0,${C.isDark ? '.2' : '.12'})`,
                }}
              />
              <div>
                <div style={{ ...ff.display, fontSize: 11, letterSpacing: '.2em', color: C.text, fontWeight: 700, lineHeight: 1.2 }}>VIJAY METAL</div>
                <div style={{ ...ff.body, fontSize: 6.5, letterSpacing: '.38em', color: C.gold, fontWeight: 600, opacity: .9 }}>WORKS · {BIZ.since}</div>
              </div>
            </button>

            {/* Right separator + Dual CTA buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {/* Right vertical separator */}
              <div style={{ width: 1, height: 26, background: sepColor, marginRight: 10 }}/>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <button
                  onClick={() => scrollTo('contact')}
                  className="vmw-btn-secondary"
                  style={{
                    ...ff.body, fontSize: 8, letterSpacing: '.25em', fontWeight: 700,
                    padding: '8px 18px', borderRadius: 9, whiteSpace: 'nowrap',
                    ...(!C.isDark ? { borderColor:'rgba(100,70,20,0.28)', color: C.dim } : {}),
                  }}
                >
                  Enquire
                </button>
                <button
                  onClick={() => window.open(BIZ.whatsapp)}
                  className="vmw-btn-primary"
                  style={{
                    ...ff.body, fontSize: 8, letterSpacing: '.25em', fontWeight: 800,
                    padding: '8px 18px', borderRadius: 9, whiteSpace: 'nowrap',
                  }}
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* ── Card dropdown ── */}
          <AnimatePresence>
            {cardOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: .38, ease: [.16,1,.3,1] }}
                style={{ overflow: 'hidden' }}
              >
                {/* Gold rule */}
                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)`, margin: '0 18px' }}/>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8, padding: 12,
                }}>
                  {navCards.map((card, ci) => (
                    <motion.div
                      key={card.label}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: .35, delay: ci * 0.07, ease: [.16,1,.3,1] }}
                      style={{
                        background: card.bg,
                        borderRadius: 10,
                        padding: '16px 18px',
                        border: `1px solid ${C.isDark ? 'rgba(255,215,0,0.1)' : 'rgba(180,130,10,0.15)'}`,
                        display: 'flex', flexDirection: 'column', gap: 10,
                      }}
                    >
                      <div style={{ ...ff.display, fontSize: 14, color: C.text, fontWeight: 600, letterSpacing: '.06em', opacity: .85 }}>
                        {card.label}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {card.links.map(lnk => (
                          <button
                            key={lnk.label}
                            onClick={() => scrollTo(lnk.id, lnk.path)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              textAlign: 'left', padding: '6px 8px',
                              borderRadius: 6,
                              ...ff.body, fontSize: 10.5, letterSpacing: '.12em',
                              color: C.dim, fontWeight: 500,
                              display: 'flex', alignItems: 'center', gap: 8,
                              transition: 'all .18s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${C.gold}18`; e.currentTarget.style.color = C.gold; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.dim; }}
                          >
                            <span style={{ fontSize: 8, color: C.gold, opacity: .6 }}>↗</span>
                            {lnk.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom CTA strip */}
                <div style={{
                  display: 'flex', gap: 8, padding: '10px 12px 12px',
                  borderTop: `1px solid ${C.border}`,
                }}>
                  <button
                    onClick={() => { window.open(BIZ.whatsapp); setCardOpen(false); }}
                    className="vmw-btn-primary"
                    style={{
                      flex: 1, padding: '11px 16px', borderRadius: 8,
                      ...ff.body, fontSize: 8, letterSpacing: '.28em', fontWeight: 800,
                    }}
                  >
                    💬 WhatsApp I. Vijay
                  </button>
                  <button
                    onClick={() => scrollTo('contact')}
                    className="vmw-btn-secondary"
                    style={{
                      flex: 1, padding: '11px 16px', borderRadius: 8,
                      ...ff.body, fontSize: 8, letterSpacing: '.28em', fontWeight: 700,
                    }}
                  >
                    ✉ Commission a Piece
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ── Mobile fullscreen menu overlay ── */}
      <AnimatePresence>
        {menuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: .35, ease: [.16,1,.3,1] }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 119,
              background: C.isDark ? 'rgba(14,11,8,0.98)' : 'rgba(248,243,235,0.98)',
              backdropFilter: 'blur(24px)',
              overflowY: 'auto',
              paddingTop: 80, paddingBottom: 40, paddingLeft: 24, paddingRight: 24,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navCards.map((card, ci) => (
                <div key={card.label} style={{ marginBottom: 18 }}>
                  <div style={{ ...ff.display, fontSize: 11, color: C.dim, letterSpacing: '.4em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 8, opacity: .6 }}>
                    {card.label}
                  </div>
                  {card.links.map(lnk => (
                    <button
                      key={lnk.label}
                      onClick={() => { scrollTo(lnk.id, lnk.path); setMenuOpen(false); }}
                      style={{
                        width: '100%', background: 'none', border: 'none',
                        textAlign: 'left', padding: '14px 16px',
                        borderRadius: 10,
                        ...ff.serif, fontSize: 22, color: C.text, fontWeight: 400,
                        letterSpacing: '.04em', cursor: 'pointer',
                        transition: 'all .2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${C.gold}12`; e.currentTarget.style.color = C.gold; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.text; }}
                    >
                      {lnk.label}
                      <span style={{ fontSize: 14, color: C.gold, opacity: .5 }}>↗</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <GoldRule my={24}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { window.open(BIZ.whatsapp); setMenuOpen(false); }}
                className="vmw-btn-primary"
                style={{ width:'100%', padding: '16px', borderRadius: 10, ...ff.body, fontSize: 10, letterSpacing: '.3em', fontWeight: 800 }}>
                💬 WhatsApp I. Vijay — {BIZ.phone}
              </button>
              <button onClick={() => { scrollTo('contact'); setMenuOpen(false); }}
                className="vmw-btn-secondary"
                style={{ width:'100%', padding: '16px', borderRadius: 10, ...ff.body, fontSize: 10, letterSpacing: '.3em', fontWeight: 700 }}>
                Commission a Piece
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
const Hero = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:['start start','end start'] });
  // Reduced parallax range for performance
  const bgY = useTransform(scrollYProgress,[0,1],['0%','12%']);
  const textY = useTransform(scrollYProgress,[0,1],['0%','6%']);
  const fade = useTransform(scrollYProgress,[0,.7],[1,0]);
  return (
    <section id="home" ref={ref} style={{position:'relative',height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
      {/* Deep luxury black gradient background — no stock photo */}
      <div style={{position:'absolute',inset:0,zIndex:1,background:'radial-gradient(ellipse 90% 70% at 50% 30%, #1a1000 0%, #080604 55%, #050402 100%)'}}/>
      {/* Subtle warm gold vignette */}
      <div style={{position:'absolute',inset:0,zIndex:2,background:'radial-gradient(ellipse 65% 55% at 50% 44%,rgba(255,200,60,0.07) 0%,transparent 68%)'}}/>
      {/* Edge darkening */}
      <div style={{position:'absolute',inset:0,zIndex:2,background:'linear-gradient(to bottom,rgba(5,4,2,.55) 0%,transparent 22%,transparent 65%,rgba(5,4,2,.97) 100%)'}}/>
      {/* Decorative corner lines */}
      <svg style={{position:'absolute',inset:0,zIndex:2,width:'100%',height:'100%',pointerEvents:'none',opacity:.18}} preserveAspectRatio="none">
        <line x1="0" y1="0" x2="180" y2="0" stroke="#FFD700" strokeWidth=".5"/>
        <line x1="0" y1="0" x2="0" y2="180" stroke="#FFD700" strokeWidth=".5"/>
        <line x1="100%" y1="0" x2="calc(100% - 180px)" y2="0" stroke="#FFD700" strokeWidth=".5"/>
        <line x1="100%" y1="0" x2="100%" y2="180" stroke="#FFD700" strokeWidth=".5"/>
        <line x1="0" y1="100%" x2="180" y2="100%" stroke="#FFD700" strokeWidth=".5"/>
        <line x1="0" y1="100%" x2="0" y2="calc(100% - 180px)" stroke="#FFD700" strokeWidth=".5"/>
        <line x1="100%" y1="100%" x2="calc(100% - 180px)" y2="100%" stroke="#FFD700" strokeWidth=".5"/>
        <line x1="100%" y1="100%" x2="100%" y2="calc(100% - 180px)" stroke="#FFD700" strokeWidth=".5"/>
      </svg>

      <motion.div style={{y:textY,opacity:fade,position:'relative',zIndex:3,textAlign:'center',padding:'0 24px',maxWidth:1080,width:'100%'}}>
        <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:1.1,delay:2.1}}
          style={{display:'inline-flex',alignItems:'center',gap:10,marginBottom:32,border:`1px solid rgba(255,215,0,0.22)`,padding:'8px 22px',background:'rgba(255,215,0,0.04)',backdropFilter:'blur(8px)'}}>
          <Dot/>
          <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase'}}>{BIZ.deity} · {BIZ.since}</span>
          <Dot/>
        </motion.div>

        {/* Logo image replacing 3D model with subtle float and glow pulse */}
        <motion.div className="vmw-hero-logo" initial={{opacity:0,scale:.75}} animate={{opacity:1,scale:1, y:[-8, 8, -8]}} transition={{opacity:{duration:1.6,delay:2.2,ease:[.16,1,.3,1]}, scale:{duration:1.6,delay:2.2,ease:[.16,1,.3,1]}, y:{duration:6, repeat:Infinity, ease:"easeInOut"}}}
          style={{width:220,height:220,margin:'0 auto 40px',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <motion.div animate={{opacity:[0.16, 0.3, 0.16], scale:[1, 1.1, 1]}} transition={{duration:4, repeat:Infinity, ease:"easeInOut"}} style={{position:'absolute',inset:'-40%',background:`radial-gradient(circle,rgba(255,200,50,1) 0%,transparent 65%)`,pointerEvents:'none'}}/>
          <div style={{width:180,height:180,borderRadius:'50%',overflow:'hidden',position:'relative',
            border:`1px solid rgba(255,215,0,0.45)`,
            boxShadow:`0 0 50px rgba(255,215,0,0.25), 0 0 100px rgba(255,215,0,0.1), inset 0 0 40px rgba(0,0,0,0.6)`}}>
            <img src={LOGO_HERO} alt="Vijay Metal Works" loading="eager"
              style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(1.1) contrast(1.05)'}}/>
          </div>
          {/* Orbiting decorative ring */}
          <motion.div animate={{rotate:360}} transition={{duration:25,repeat:Infinity,ease:'linear'}}
            style={{position:'absolute',inset:-18,borderRadius:'50%',
              border:`1px dashed rgba(255,215,0,0.3)`,pointerEvents:'none'}}/>
          <motion.div animate={{rotate:-360}} transition={{duration:35,repeat:Infinity,ease:'linear'}}
            style={{position:'absolute',inset:-26,borderRadius:'50%',
              border:`1px solid rgba(255,215,0,0.1)`,pointerEvents:'none'}}/>
        </motion.div>

        <motion.div initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} transition={{duration:1.5,delay:2.55,ease:[.16,1,.3,1]}}>
          <h1 style={{...ff.display,fontSize:'clamp(40px,9.5vw,118px)',lineHeight:.87,letterSpacing:'.045em',fontWeight:900,color:C.text,marginBottom:0}}>SACRED</h1>
          <h1 style={{...ff.display,fontSize:'clamp(40px,9.5vw,118px)',lineHeight:.87,letterSpacing:'.045em',fontWeight:900,marginBottom:24,background:'linear-gradient(135deg,#CC9900 0%,#FFD700 40%,#FFE44D 58%,#FFD700 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>MASTERY</h1>
        </motion.div>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:2.9}}
          style={{...ff.serif,fontSize:'clamp(13px,2vw,20px)',color:C.dim,fontWeight:300,fontStyle:'italic',letterSpacing:'.07em',marginBottom:44,lineHeight:1.65}}>
          {BIZ.tagline}
        </motion.p>
        <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:1,delay:3.05}}
          className="section-cta-row" style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap',alignItems:'center',marginTop:24}}>
          <CurvyButton primary onClick={()=>navigate('/gallery')}>View Our Work</CurvyButton>
          <StarBorderButton onClick={()=>setShowCommissionModal(true)} speed={5}>Commission Now</StarBorderButton>
        </motion.div>
      </motion.div>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:4,duration:1}}
        style={{position:'absolute',bottom:36,left:'50%',transform:'translateX(-50%)',zIndex:3,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
        <span style={{...ff.body,fontSize:7,letterSpacing:'.5em',color:C.faint,fontWeight:600,textTransform:'uppercase'}}>Scroll</span>
        <motion.div animate={{y:[0,14,0],opacity:[.2,.65,.2]}} transition={{duration:2.3,repeat:Infinity,ease:'easeInOut'}}
          style={{width:1,height:50,background:`linear-gradient(to bottom,rgba(255,215,0,0.45),transparent)`}}/>
      </motion.div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LEGACY
═══════════════════════════════════════════════════════════════ */
const Legacy = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();
  const [hoveredStat, setHoveredStat] = useState(null);
  const stats = [
    { n:'110+', l:'Years of Legacy',     icon:'🏛' },
    { n:'2000+', l:'Temples Adorned',    icon:'⛩' },
    { n:'5',    l:'Metal Specialities',  icon:'⚜' },
    { n:'24K',  l:'Gold Certified',      icon:'✦' },
  ];
  return (
    <section id="legacy" className="section-pad" style={{position:'relative',zIndex:2,background:C.bg2}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <div className="two-col" style={{display:'grid',gap:96,alignItems:'center',marginBottom:88}}>
          <SlideLeft>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:18,opacity:.8}}>The Bloodline of Art</span>
            <h2 style={{...ff.display,fontSize:'clamp(34px,5.8vw,70px)',lineHeight:.88,letterSpacing:'.04em',color:C.text,fontWeight:700,marginBottom:28}}>OVER A<br/><span style={{color:C.gold}}>CENTURY</span><br/>OF DEVOTION</h2>
            <GoldRule w="56px" opacity={.5}/>
          </SlideLeft>
          <SlideRight delay={.1}>
            <p style={{...ff.serif,fontSize:20,lineHeight:2.0,color:C.dim,fontWeight:300,fontStyle:'italic',marginBottom:22}}>
              Founded in 1915 in Chennai's sacred Sowcarpet district — we have adorned the most revered shrines across India and the world for over a century.
            </p>
            <p style={{...ff.body,fontSize:13.5,lineHeight:2,color:C.dim,fontWeight:300,letterSpacing:'.02em'}}>
              Under the stewardship of <strong style={{color:C.text,fontWeight:600}}>I. Vijay</strong>, we carry an unbroken lineage of handcrafted devotion — working in Gold, Silver, Copper, Brass, and sacred <em>Panchaloha</em> (five-metal alloy) for temples across India, UK, UAE, and Southeast Asia.
            </p>
          </SlideRight>
        </div>

        {/* STATS — gold shine on hover */}
        <style>{`
          .stat-card { position:relative; overflow:hidden; transition:all 0.4s cubic-bezier(0.16,1,0.3,1); cursor:default; }
          .stat-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,215,0,0) 0%,rgba(255,215,0,0.06) 50%,rgba(255,215,0,0) 100%); opacity:0; transition:opacity 0.4s; }
          .stat-card:hover::before { opacity:1; }
          .stat-number { transition:all 0.35s cubic-bezier(0.16,1,0.3,1); }
          .stat-card:hover .stat-number {
            color:#FFD700 !important;
            text-shadow:0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3), 0 2px 8px rgba(0,0,0,0.8) !important;
            transform:scale(1.08);
          }
          .stat-label { transition:color 0.35s; }
          .stat-card:hover .stat-label { color:rgba(255,215,0,0.75) !important; }
        `}</style>

        <StaggerContainer stagger={0.13} delay={0.1} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}} className="vmw-stats-grid">
          {stats.map((s,i)=>{
            const Item = i % 2 === 0 ? StaggerItemLeft : StaggerItemRight;
            return (
              <Item key={s.l}>
                <div
                  className="stat-card"
                  onMouseEnter={()=>setHoveredStat(s.l)}
                  onMouseLeave={()=>setHoveredStat(null)}
                  style={{
                    padding:'52px 30px 48px',
                    border:`1px solid ${hoveredStat===s.l ? 'rgba(255,215,0,0.4)' : C.border}`,
                    textAlign:'center',
                    background: hoveredStat===s.l ? C.surfaceWarm : 'transparent',
                    boxShadow: hoveredStat===s.l ? '0 12px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,215,0,0.08)' : 'none',
                    transform: hoveredStat===s.l ? 'translateY(-6px)' : 'none',
                  }}
                >
                  <div style={{fontSize:22,marginBottom:14,opacity:hoveredStat===s.l?1:0.4,transition:'opacity 0.3s'}}>{s.icon}</div>
                  <div
                    className="stat-number"
                    style={{
                      ...ff.display,
                      fontSize:'clamp(52px,5.5vw,76px)',
                      color: hoveredStat===s.l ? '#FFD700' : C.text,
                      fontWeight:700,
                      lineHeight:1,
                      marginBottom:14,
                      display:'block',
                    }}
                  >{s.n}</div>
                  <div
                    className="stat-label"
                    style={{
                      ...ff.body,
                      fontSize:12,
                      letterSpacing:'.22em',
                      color: hoveredStat===s.l ? 'rgba(255,215,0,0.75)' : 'rgba(255,255,255,0.65)',
                      fontWeight:600,
                      textTransform:'uppercase',
                      lineHeight:1.4,
                    }}
                  >{s.l}</div>
                </div>
              </Item>
            );
          })}
        </StaggerContainer>

        <SectionCTA primary="Start Your Commission" secondary="Enquire on WhatsApp"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>window.open(BIZ.whatsapp)}/>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TRUSTED BY TEMPLES
═══════════════════════════════════════════════════════════════ */
const TrustedByTemples = () => {
  const C = useTheme();
  const temples = [
    { name:'Meenakshi Amman', loc:'Madurai', img:'/gallery/gold/sadarigold.jpg' },
    { name:'Brihadeeswarar', loc:'Thanjavur', img:'/gallery/gold/crown.jpg' },
    { name:'Srirangam Temple', loc:'Trichy', img:'/gallery/stone/stone1.jpg' },
    { name:'Tirumala Tirupati', loc:'Andhra Pradesh', img:'/gallery/silver/kandabaranam.jpg' },
    { name:'Murugan Temple', loc:'London, UK', img:'/gallery/gold/kanganam4.jpg' },
    { name:'Golden Temple', loc:'Vellore', img:'/gallery/gold/kandabaranam.jpg' },
    { name:'Nataraja Temple', loc:'Chidambaram', img:'/gallery/temple/god.jpg' },
    { name:'Kapaleeswarar', loc:'Chennai', img:'/gallery/temple/temple.jpg' },
  ];
  return (
    <section style={{position:'relative',zIndex:2,background:C.bg3,borderTop:`1px solid ${C.border}`}} className="section-pad vmw-temples-section">
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center',marginBottom:56}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Our Sacred Clients</span>
            <h2 style={{...ff.display,fontSize:'clamp(28px,5vw,64px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              TRUSTED BY <span style={{color:C.gold}}>TEMPLES</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:16,maxWidth:500,margin:'16px auto 0'}}>
              Over 2000 sacred institutions across India and the world have entrusted their metal heritage to us.
            </p>
          </div>
        </Reveal>
        <StaggerContainer stagger={0.09} delay={0.1} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}} className="vmw-temples-grid">
          {temples.map((t,i)=>{
            const Item = i % 2 === 0 ? StaggerItemLeft : StaggerItemRight;
            return (
            <Item key={t.name}>
              <motion.div whileHover={{borderColor:C.borderHi, y:-6, boxShadow:`0 12px 40px rgba(0,0,0,0.22)`}}
                style={{border:`1px solid ${C.border}`,textAlign:'center',transition:'all .4s',cursor:'default',overflow:'hidden',background:C.bg2}}>
                <div style={{position:'relative',height:100,overflow:'hidden'}}>
                  <img src={t.img} alt={t.name} loading='lazy'
                    style={{width:'100%',height:'100%',objectFit:'cover',
                      filter:C.isDark?'brightness(.75) saturate(0.85)':'brightness(.88) saturate(0.9)',
                      transition:'transform .6s ease'}}
                    onMouseEnter={e=>e.target.style.transform='scale(1.08)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                  <div style={{position:'absolute',inset:0,background:C.isDark
                    ?'linear-gradient(to top,rgba(24,22,20,.85) 0%,rgba(0,0,0,.2) 100%)'
                    :'linear-gradient(to top,rgba(237,231,216,.85) 0%,rgba(0,0,0,.1) 100%)'}}/>
                  <div style={{position:'absolute',top:8,right:8,width:10,height:10,
                    border:`1px solid ${C.gold}`,opacity:.6,transform:'rotate(45deg)'}}/>
                </div>
                <div style={{padding:'14px 16px'}}>
                  <div style={{...ff.display,fontSize:12,color:C.text,fontWeight:600,letterSpacing:'.04em',marginBottom:5,lineHeight:1.3}}>{t.name}</div>
                  <div style={{...ff.body,fontSize:7.5,letterSpacing:'.38em',color:C.gold,fontWeight:600,textTransform:'uppercase',opacity:.85}}>{t.loc}</div>
                </div>
              </motion.div>
            </Item>
            );
          })}
        </StaggerContainer>
        <Reveal delay={.2}>
          <div style={{marginTop:40,textAlign:'center',padding:'28px 0',borderTop:`1px solid ${C.border}`}}>
            <span style={{...ff.serif,fontSize:16,color:C.dim,fontStyle:'italic'}}>
              "From Madurai to London — our work adorns the most sacred shrines in the world."
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SERVICES (with icons)
═══════════════════════════════════════════════════════════════ */
const Services = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const metals = [
    {
      name:'Gold Work', accent:'#FFD700', img:'/gallery/gold/sadarigold.jpg', icon:'✦',
      badge:'24K · Nagas · Stone · Electro Plating',
      desc:'The pinnacle of temple metalcraft — pure 24K gold worked by hand using century-old Chola techniques alongside modern European electro-plating technology.',
      services:[
        { t:'Nagas Work', d:'Traditional hand-beaten relief artistry — serpents, lotuses, and divine motifs struck individually on 24K gold by master craftsmen.' },
        { t:'Stone Setting', d:'Precision inlay of rubies, emeralds, and precious stones into gold idol adornments, Kireeedams, and Prabhavali arches.' },
        { t:'Europe Tech Electro Plating', d:'Advanced European gold electroplating on copper bases. Guaranteed service life options: 5 years, 10 years, or 20+ years as per requirement.' },
      ],
    },
    {
      name:'Silver Work', accent:'#B8C0CC', img:'/gallery/silver/kandabaranam.jpg', icon:'◈',
      badge:'Pure Silver · Nagas · Stone',
      desc:'Sterling silver temple metalcraft — hand-beaten and stone-set for idols, crowns, vessels, and architectural temple elements.',
      services:[
        { t:'Nagas Work', d:'Hand-hammered nagas relief work in sterling silver — serpent motifs, floral garlands, and deity iconography with ancestral precision.' },
        { t:'Stone Setting', d:'Precious and semi-precious stone inlay into silver idol adornments, Prabhavali arches, and Kalasam vessel work for temple use.' },
      ],
    },
    {
      name:'Copper Work', accent:'#B87333', img:'/gallery/gold/hand1.jpg', icon:'❋',
      badge:'Nagas · Electro · Gold Foil · Polishing',
      desc:'Copper is the preferred base metal for large temple structures. We offer the full spectrum — from hand-beaten nagas work to European electro gold plating with decade-long guarantees.',
      services:[
        { t:'Nagas Work', d:'Detailed hand-beaten nagas craftsmanship on copper — the foundation metal of choice for Vimana towers and large idol structures due to durability.' },
        { t:'Electro Gold Plating', d:'Copper pieces gold-plated via European electroplating technology. Guaranteed life: 5 / 10 / 20+ years as per requirement.' },
        { t:'Gold Foil — Thanga Thagadu', d:'The ancient Thanga Thagadu method — pure gold leaf applied layer by layer over copper, creating a warm, rich, enduring sacred finish.' },
        { t:'Stone Work', d:'Gem inlay on copper-based idol ornaments, Vimana finials, and Kalasam ritual vessels.' },
        { t:'Gold Polishing', d:'Mirror-grade polishing of gold-finished copper — restoring and maintaining temple pieces to sacred brilliance.' },
      ],
    },
    {
      name:'Brass Work', accent:'#B09830', img:'/gallery/stone/stone2.jpg', icon:'◉',
      badge:'Polish · Nagas · Lattice Work',
      desc:'Brass temple pieces — lamps, bells, panels — restored to their original lustre through specialist polishing and traditional nagas lattice craftsmanship.',
      services:[
        { t:'Brass Polishing', d:'Deep cleaning and high-shine polishing of brass temple lamps, bells, vessels, and decorative panels.' },
        { t:'Nagas Lattice Work', d:'Intricate jaali (lattice) and nagas pattern relief work on brass — used for decorative panels, lamp bases, and architectural temple elements.' },
      ],
    },
    {
      name:'Panchaloha', accent:'#C8B88A', img:'/gallery/temple/god.jpg', icon:'⬡',
      badge:'5-Metal Sacred Alloy · Divine Idols',
      desc:'Panchaloha — the sacred five-metal alloy of Gold, Silver, Copper, Iron, and Lead — prescribed by the Agamas as the only appropriate material for consecrated divine idols.',
      services:[
        { t:'Sacred Idol Casting', d:'Full Panchaloha idol casting following Agamic prescriptions — the five metals alloyed in sacred proportions for Vigraham intended for consecration.' },
        { t:'Nagas & Stone Work', d:'Fine nagas relief work and precious stone setting on Panchaloha idols — each detail executed according to shilpa-shastra tradition.' },
        { t:'Finishing & Consecration Prep', d:'Mirror polishing and final finishing of Panchaloha pieces, prepared to the ritual purity standards required before temple consecration.' },
      ],
    },
  ];
  const m = metals[active];
  return (
    <section id="services" className="section-pad" style={{position:'relative',zIndex:2,background:C.bg1}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center',marginBottom:64}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Our Disciplines</span>
            <h2 style={{...ff.display,fontSize:'clamp(34px,6.5vw,82px)',lineHeight:.88,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              THE <span style={{color:C.gold}}>CRAFT</span>
            </h2>
          </div>
        </Reveal>
        {/* Metal tabs with icons */}
        <div style={{display:'flex',gap:2,marginBottom:2,justifyContent:'center',flexWrap:'wrap'}}>
          {metals.map((mt,i)=>(
            <motion.button key={mt.name} onClick={()=>setActive(i)} whileTap={{scale:.97}}
              style={{...ff.body,padding:'13px 28px',fontSize:8,letterSpacing:'.32em',fontWeight:700,
                textTransform:'uppercase',border:'none',cursor:'pointer',
                background:active===i?mt.accent:C.surfaceGold,
                color:active===i?C.isDark?'#000':'#fff':C.dim,transition:'all .4s ease',
                display:'flex',alignItems:'center',gap:8}}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 16px ${mt.accent}66`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
              <span style={{fontSize:14,lineHeight:1}}>{mt.icon}</span>
              {mt.name.split(' ')[0]}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-18}} transition={{duration:.55,ease:[.16,1,.3,1]}}
            className="two-col vmw-services-card" style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',border:`1px solid ${C.border}`,minHeight:500}}>
            <div style={{position:'relative',overflow:'hidden',minHeight:380}}>
              <img src={m.img} alt={m.name} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.5,filter:'sepia(18%)'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,transparent 40%,rgba(20,18,16,.92) 100%)'}}/>
              <div style={{position:'absolute',bottom:32,left:28}}>
                <div style={{fontSize:40,marginBottom:10}}>{m.icon}</div>
                <div style={{...ff.display,fontSize:34,color:C.text,fontWeight:700,lineHeight:1.1,marginBottom:8}}>{m.name}</div>
                <div style={{...ff.body,fontSize:7,letterSpacing:'.42em',color:m.accent,fontWeight:600,textTransform:'uppercase',opacity:.9,marginBottom:14}}>{m.badge}</div>
                <div style={{...ff.serif,fontSize:13,lineHeight:1.85,color:C.dim,fontStyle:'italic',maxWidth:220}}>{m.desc}</div>
              </div>
            </div>
            <div className="vmw-services-right" style={{padding:'44px 48px',display:'flex',flexDirection:'column'}}>
              {m.services.map((s,i)=>(
                <div key={s.t} style={{borderBottom:`1px solid ${C.border}`,padding:'22px 0',...(i===m.services.length-1?{borderBottom:'none'}:{})}}>
                  <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                    <span style={{...ff.body,fontSize:9,color:m.accent,fontWeight:700,opacity:.65,marginTop:3,minWidth:22}}>0{i+1}</span>
                    <div>
                      <div style={{...ff.serif,fontSize:19,color:C.text,fontWeight:600,marginBottom:7,letterSpacing:'.03em'}}>{s.t}</div>
                      <div style={{...ff.body,fontSize:11,lineHeight:1.9,color:C.dim,fontWeight:300}}>{s.d}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        <SectionCTA primary="Request a Quote" secondary="See Our Work"
          onPrimary={()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}
          onSecondary={()=>navigate('/gallery')}/>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHOWCASE (3D)
═══════════════════════════════════════════════════════════════ */
const Showcase = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  return (
  <section id="showcase" className="section-pad" style={{position:'relative',zIndex:2,background:C.bg3,borderTop:`1px solid ${C.border}`}}>
    <div style={{maxWidth:1240,margin:'0 auto'}}>
      <div className="two-col" style={{display:'grid',gap:80,alignItems:'center'}}>
        <SlideLeft>
          <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:18,opacity:.8}}>Masterpiece Gallery</span>
          <h2 style={{...ff.display,fontSize:'clamp(30px,5vw,62px)',lineHeight:.9,letterSpacing:'.04em',color:C.text,fontWeight:700,marginBottom:24}}>OUR SACRED<br/><span style={{color:C.gold}}>CRAFT</span></h2>
          <GoldRule w="56px" opacity={.5}/>
          <p style={{...ff.serif,fontSize:17,lineHeight:2.1,color:C.dim,fontWeight:300,fontStyle:'italic',marginTop:28,marginBottom:20}}>
            Each piece we craft is a living prayer — hand-beaten, stone-set, and finished by master artisans who carry four generations of devotion from our Sowcarpet workshop.
          </p>
          <p style={{...ff.body,fontSize:11,lineHeight:1.95,color:C.faint,fontWeight:300}}>
            Every piece that leaves Murugappa Street carries a century's devotion.
          </p>
          <div style={{marginTop:36,display:'flex',gap:14,flexWrap:'wrap'}}>
            <CurvyButton primary onClick={()=>navigate('/gallery')}>View Gallery</CurvyButton>
            <StarBorderButton onClick={()=>setShowCommissionModal(true)} speed={7}>Commission</StarBorderButton>
          </div>
        </SlideLeft>
        <SlideRight delay={.12}>
          <div style={{position:'relative'}}>
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h])=>(
              <div key={`${v}${h}`} style={{position:'absolute',[v]:-12,[h]:-12,width:26,height:26,zIndex:2,
                borderTop:v==='top'?`1px solid ${C.borderHi}`:'none',borderBottom:v==='bottom'?`1px solid ${C.borderHi}`:'none',
                borderLeft:h==='left'?`1px solid ${C.borderHi}`:'none',borderRight:h==='right'?`1px solid ${C.borderHi}`:'none',opacity:.5}}/>
            ))}
            <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.02) 0%,transparent 68%)`}}/>
            <div style={{height:540,border:`1px solid ${C.border}`,background:C.bg2,position:'relative',zIndex:1,overflow:'hidden'}}>
              <CraftworkPanel/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:90,background:`linear-gradient(to top,${C.bg1},transparent)`,pointerEvents:'none'}}/>
            </div>
          </div>
        </SlideRight>
      </div>
    </div>
  </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   REAL WORK PHOTOS (new section)
═══════════════════════════════════════════════════════════════ */
const RealWorkPhotos = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();
  const photos = [
    { img:'/gallery/gold/crown.jpg',         label:'Gold Crown Piece',    desc:'Handcrafted gold crown — traditional nagas craftsmanship, commissioned for a major Chennai temple, 2023.' },
    { img:'/gallery/gold/sadarigold.jpg',    label:'Sadari Gold Set',     desc:'Pure gold sadari crown — traditional nagas work, stone setting by our Sowcarpet master artisans, 2023.' },
    { img:'/gallery/gold/kanganam4.jpg',     label:'Kanganam Gold',       desc:'Gold stone-set kanganam bangle — lattice nagas work for a temple in London, 2023.' },
    { img:'/gallery/silver/kandabaranam.jpg',label:'Silver Kandabaranam', desc:'Sterling silver kandabaranam — hand-beaten nagas work, traditional Agamic specifications, 2022.' },
    { img:'/gallery/stone/stone1.jpg',       label:'Stone Inlay Piece',   desc:'Temple jewellery with precious stone setting — gold inlay and stone work from our Sowcarpet workshop, 2024.' },
    { img:'/gallery/temple/god.jpg',         label:'Panchaloha Vigraham', desc:'Authentic Panchaloha deity — cast and finished to full Agamic temple specifications, 2023.' },
  ];
  return (
    <section style={{position:'relative',zIndex:2,background:C.bg2,borderTop:`1px solid ${C.border}`}} className="section-pad vmw-realwork-section">
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center',marginBottom:60}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Direct From Our Workshop</span>
            <h2 style={{...ff.display,fontSize:'clamp(30px,5.5vw,70px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              REAL <span style={{color:C.gold}}>WORK PHOTOS</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:18,maxWidth:480,margin:'18px auto 0'}}>
              Actual commissions completed from our Sowcarpet workshop — every photograph is a real piece we crafted.
            </p>
          </div>
        </Reveal>
        <StaggerContainer stagger={0.12} delay={0.08} style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}} className="vmw-work-grid">
          {photos.map((p,i)=>{
            const Item = i % 3 === 1 ? StaggerItemScale : (i % 2 === 0 ? StaggerItemLeft : StaggerItemRight);
            return (
            <Item key={p.label}>
              <WorkPhotoCard photo={p}/>
            </Item>
            );
          })}
        </StaggerContainer>
        <SectionCTA primary="Commission Your Piece" secondary="Contact Us"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>window.open(BIZ.whatsapp)}/>
      </div>
    </section>
  );
};

const WorkPhotoCard = ({ photo }) => {
  const C = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <motion.div onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      whileHover={{borderColor:C.borderHi}}
      style={{position:'relative',overflow:'hidden',aspectRatio:'4/3',border:`1px solid ${C.border}`,cursor:'default',transition:'border-color .3s',background:C.bg1}}>
      {!loaded && (
        <div className="skeleton" style={{position:'absolute',inset:0,zIndex:2}}/>
      )}
      <motion.img src={photo.img} alt={photo.label} onLoad={()=>setLoaded(true)}
        animate={{scale:hov?1.06:1,opacity:hov?.95:.85}}
        transition={{duration:.8,ease:[.16,1,.3,1]}}
        style={{width:'100%',height:'100%',objectFit:'cover',filter:'sepia(10%)',display:'block'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(14,12,10,.88) 0%,transparent 55%)',pointerEvents:'none'}}/>
      <motion.div animate={{y:hov?0:6,opacity:hov?1:.7}} transition={{duration:.32}}
        style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px 22px'}}>
        <div style={{...ff.display,fontSize:15,color:C.text,fontWeight:600,marginBottom:6}}>{photo.label}</div>
        <div style={{...ff.body,fontSize:9,color:C.dim,letterSpacing:'.08em',lineHeight:1.6}}>{photo.desc}</div>
      </motion.div>
      {/* Corner diamond */}
      <div style={{position:'absolute',top:12,right:12,width:12,height:12,border:`1px solid ${C.borderHi}`,opacity:hov?.5:.18,transition:'opacity .3s',transform:'rotate(45deg)'}}/>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROCESS / WORKFLOW — Luxury Alternating Visual Timeline
═══════════════════════════════════════════════════════════════ */

// SVG icon components for the process steps (premium line-art style)
const ProcessIcon = ({ n, icon, gold, dim, border, surfaceGold }) => (
  <div style={{
    position:'relative',
    width:80, height:80, flexShrink:0,
    display:'flex',alignItems:'center',justifyContent:'center',
    background: surfaceGold,
    border:`1px solid ${border}`,
    borderRadius: '50%',
    boxShadow:`0 0 0 8px ${surfaceGold}, 0 0 0 9px ${border}`,
  }}>
    {/* Outer ring subtle glow */}
    <div style={{
      position:'absolute', inset:-12,
      borderRadius:'50%',
      border:`1px solid rgba(255,215,0,0.10)`,
      pointerEvents:'none',
    }}/>
    <span style={{ fontSize:26, lineHeight:1 }}>{icon}</span>
    {/* Step number badge */}
    <div style={{
      position:'absolute', bottom:-6, right:-6,
      width:24, height:24, borderRadius:'50%',
      background:`linear-gradient(135deg,rgba(180,130,0,0.9),rgba(255,215,0,0.95))`,
      display:'flex',alignItems:'center',justifyContent:'center',
      boxShadow:`0 2px 10px rgba(255,215,0,0.35)`,
    }}>
      <span style={{
        fontFamily:"'Jost',sans-serif", fontSize:8, fontWeight:800,
        letterSpacing:'.04em', color:'#0a0600',
      }}>{n}</span>
    </div>
  </div>
);

const ProcessSection = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();
  // Detect mobile to skip heavy animations
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const steps = [
    { n:'01', title:'Initial Inquiry',       icon:'💬', img:'/gallery/gold/crown.jpg',          desc:'Share your requirement via WhatsApp or our contact form — temple name, deity, dimensions, metal preference, and timeline.' },
    { n:'02', title:'Design Consultation',   icon:'✏️', img:'/gallery/gold/crown1.jpg',         desc:'Our master craftsmen discuss design specifications, iconographic details per Agamic tradition, and provide a detailed quotation.' },
    { n:'03', title:'Material Procurement',  icon:'⚱️', img:'/gallery/stone/stone3.jpg',        desc:'We source hallmarked metals — 24K gold, sterling silver, Panchaloha alloy — from certified suppliers as per your chosen specification.' },
    { n:'04', title:'Sacred Crafting',       icon:'🔨', img:'/gallery/gold/kanganam4.jpg',      desc:'Hand-crafted by our master artisans at our Sowcarpet workshop using ancestral techniques passed down through generations since 1915.' },
    { n:'05', title:'Quality Inspection',    icon:'🔍', img:'/gallery/gold/sadarigold.jpg',     desc:'Every piece undergoes rigorous quality inspection — dimensions, finish, stone setting, and metal purity verified against commissioned specifications.' },
    { n:'06', title:'Delivery & Blessing',   icon:'📦', img:'/gallery/temple/temple.jpg',       desc:'Safely packed and shipped or hand-delivered to your temple anywhere in India or internationally. Documentation provided for customs.' },
  ];

  return (
    <section className="section-pad vmw-process-section" style={{position:'relative',zIndex:2,background:C.bg1,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>

        {/* Header */}
        <Reveal>
          <div style={{textAlign:'center',marginBottom:80}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>How We Work</span>
            <h2 style={{...ff.display,fontSize:'clamp(28px,5.5vw,68px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              OUR <span style={{color:C.gold}}>PROCESS</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:18,maxWidth:480,margin:'18px auto 0'}}>
              Six steps, one purpose — a sacred piece crafted with devotion.
            </p>
          </div>
        </Reveal>

        {/* Timeline container */}
        <div style={{position:'relative'}}>

          {/* Central vertical spine */}
          <div className="vmw-process-spine" style={{
            position:'absolute', left:'50%', top:40, bottom:40,
            width:1,
            background:`linear-gradient(to bottom, transparent 0%, ${C.gold}40 12%, ${C.gold}28 88%, transparent 100%)`,
            transform:'translateX(-50%)',
            zIndex:0,
          }}/>
          
          <motion.div
            className="vmw-process-spine-animated"
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: isMobile ? 0.01 : 2.5, ease: 'easeInOut' }}
            style={{
              position:'absolute', left:'50%', top:40,
              width:2,
              background:C.goldGrad,
              transform:'translateX(-50%)',
              zIndex:0,
              boxShadow: `0 0 12px ${C.gold}66`
            }}
          />

          {steps.map((step, i) => {
            const isLeft = i % 2 === 0; // even = content left, image right
            return (
              <motion.div
                key={step.n}
                className="vmw-process-grid"
                initial={{ opacity:0, x: isMobile ? 0 : (isLeft ? -48 : 48) }}
                whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true, margin:'-60px' }}
                transition={{ duration: isMobile ? 0.4 : 0.78, delay: isMobile ? 0 : 0.06, ease:[0.16,1,0.3,1] }}
                style={{
                  display:'grid',
                  alignItems:'center',
                  gap:0,
                  marginBottom: i < steps.length - 1 ? 48 : 0,
                  position:'relative', zIndex:1,
                }}
              >
                {/* Left cell — content or image depending on index */}
                <div className={isLeft ? "vmw-process-content" : "vmw-process-img"} style={{
                  padding: isLeft ? '0 44px 0 0' : '0 44px 0 0',
                  gridColumn: 1,
                  gridRow: 1,
                  display: 'flex', justifyContent: 'flex-end', width: '100%'
                }}>
                  {isLeft ? (
                    /* Content block */
                    <motion.div
                      whileHover={isMobile ? undefined : { x:-4 }}
                      transition={{ duration:.28 }}
                      style={{
                        padding:'36px 40px',
                        background: C.surfaceWarm,
                        border:`1px solid ${C.border}`,
                        backdropFilter: isMobile ? 'none' : 'blur(8px)',
                        position:'relative',
                        overflow:'hidden',
                      }}
                    >
                      {/* Top gold accent line */}
                      <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,${C.gold}66,transparent)`}}/>
                      <div style={{...ff.body,fontSize:7.5,letterSpacing:'.48em',color:C.gold,fontWeight:700,textTransform:'uppercase',marginBottom:12,opacity:.8}}>Step {step.n}</div>
                      <div style={{...ff.display,fontSize:'clamp(18px,2vw,24px)',color:C.text,fontWeight:700,letterSpacing:'.04em',marginBottom:14,lineHeight:1.1}}>{step.title}</div>
                      <GoldRule w="40px" opacity={.45}/>
                      <div style={{...ff.body,fontSize:13,lineHeight:1.95,color:C.dim,fontWeight:300,marginTop:14}}>{step.desc}</div>
                    </motion.div>
                  ) : (
                    /* Image placeholder / real photo */
                    <ProcessTimelineImage src={step.img} alt={step.title} C={C}/>
                  )}
                </div>

                {/* Centre — step node */}
                <div className="vmw-process-node" style={{
                  gridColumn:2, gridRow:1,
                  display:'flex', justifyContent:'center', alignItems:'center',
                  zIndex:2, position:'relative',
                }}>
                  {/* Node glow */}
                  {isMobile ? (
                    <ProcessIcon
                      n={step.n} icon={step.icon}
                      gold={C.gold} dim={C.dim}
                      border={C.borderGold} surfaceGold={C.surfaceGold}
                    />
                  ) : (
                  <motion.div
                    animate={{ boxShadow:[
                      `0 0 0 0 rgba(255,215,0,0)`,
                      `0 0 18px 6px rgba(255,215,0,0.18)`,
                      `0 0 0 0 rgba(255,215,0,0)`,
                    ]}}
                    transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut', delay:i*0.5 }}
                    style={{borderRadius:'50%'}}
                  >
                    <ProcessIcon
                      n={step.n} icon={step.icon}
                      gold={C.gold} dim={C.dim}
                      border={C.borderGold} surfaceGold={C.surfaceGold}
                    />
                  </motion.div>
                  )}
                </div>

                {/* Right cell */}
                <div className={isLeft ? "vmw-process-img" : "vmw-process-content"} style={{
                  padding: isLeft ? '0 0 0 44px' : '0 0 0 44px',
                  gridColumn: 3,
                  gridRow: 1,
                  display: 'flex', justifyContent: 'flex-start', width: '100%'
                }}>
                  {isLeft ? (
                    /* Image side */
                    <ProcessTimelineImage src={step.img} alt={step.title} C={C}/>
                  ) : (
                    /* Content block */
                    <motion.div
                      whileHover={isMobile ? undefined : { x:4 }}
                      transition={{ duration:.28 }}
                      style={{
                        padding:'36px 40px',
                        background: C.surfaceWarm,
                        border:`1px solid ${C.border}`,
                        backdropFilter: isMobile ? 'none' : 'blur(8px)',
                        position:'relative',
                        overflow:'hidden',
                      }}
                    >
                      <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.gold}66)`}}/>
                      <div style={{...ff.body,fontSize:7.5,letterSpacing:'.48em',color:C.gold,fontWeight:700,textTransform:'uppercase',marginBottom:12,opacity:.8}}>Step {step.n}</div>
                      <div style={{...ff.display,fontSize:'clamp(18px,2vw,24px)',color:C.text,fontWeight:700,letterSpacing:'.04em',marginBottom:14,lineHeight:1.1}}>{step.title}</div>
                      <GoldRule w="40px" opacity={.45}/>
                      <div style={{...ff.body,fontSize:13,lineHeight:1.95,color:C.dim,fontWeight:300,marginTop:14}}>{step.desc}</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <SectionCTA primary="Begin Your Project" secondary="Ask a Question"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>window.open(BIZ.whatsapp)}/>
      </div>
    </section>
  );
};

/* Image with skeleton loader for Process timeline */
const ProcessTimelineImage = ({ src, alt, C }) => {
  const [loaded, setLoaded] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      whileHover={{ scale:1.01 }}
      transition={{ duration:.45, ease:[.16,1,.3,1] }}
      style={{
        position:'relative', width: '100%', aspectRatio:'4/3', overflow:'hidden',
        border:`1px solid ${hov ? C.borderHi : C.border}`,
        background: C.bg2,
        transition:'border-color .3s',
      }}
    >
      {/* Corner marks */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h])=>(
        <div key={`${v}${h}`} style={{
          position:'absolute',[v]:0,[h]:0,
          width:18, height:18, zIndex:4,
          borderTop:    v==='top'    ? `1px solid ${C.borderHi}` : 'none',
          borderBottom: v==='bottom' ? `1px solid ${C.borderHi}` : 'none',
          borderLeft:   h==='left'   ? `1px solid ${C.borderHi}` : 'none',
          borderRight:  h==='right'  ? `1px solid ${C.borderHi}` : 'none',
          opacity: hov ? .7 : .3, transition:'opacity .3s',
        }}/>
      ))}
      {!loaded && <div className="skeleton" style={{position:'absolute',inset:0,zIndex:2}}/>}
      <motion.img
        src={src} alt={alt}
        onLoad={()=>setLoaded(true)}
        animate={{ scale: hov ? 1.07 : 1, opacity: loaded ? (hov ? .95 : .85) : 0 }}
        transition={{ duration:.75, ease:[.16,1,.3,1] }}
        style={{ width:'100%', height:'100%', objectFit:'cover', filter:'sepia(10%)', display:'block' }}
      />
      {/* Gradient overlay */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(14,12,10,.55) 0%,transparent 55%)',pointerEvents:'none'}}/>
      {/* Image placeholder label */}
      {!loaded && (
        <div style={{
          position:'absolute',inset:0,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center',zIndex:3,
          gap:8, pointerEvents:'none',
        }}>
          <div style={{width:32,height:32,border:`1px solid ${C.borderGold}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',opacity:.35}}>
            <span style={{fontSize:16,opacity:.6}}>🏛</span>
          </div>
          <div style={{...ff.body,fontSize:7,letterSpacing:'.38em',color:C.faint,fontWeight:600,textTransform:'uppercase',opacity:.5}}>Workshop Photo</div>
        </div>
      )}
      {/* Caption */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0, y: hov ? 0 : 6 }}
        transition={{ duration:.28 }}
        style={{ position:'absolute',bottom:0,left:0,right:0,padding:'14px 18px',zIndex:3 }}
      >
        <div style={{...ff.display,fontSize:13,color:'rgba(255,255,255,0.9)',fontWeight:600}}>{alt}</div>
        <div style={{...ff.body,fontSize:7,letterSpacing:'.28em',color:C.gold,fontWeight:600,textTransform:'uppercase',opacity:.8,marginTop:3}}>Vijay Metal Works · Sowcarpet</div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PREMIUM FILTER TABS — Gallery category selector
   glassmorphism pill · sliding gold underline · ripple · glow
═══════════════════════════════════════════════════════════════ */
const PremiumFilterTabs = ({ filters, active, onChange, C }) => {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [underline, setUnderline] = useState({ left:0, width:0 });
  const [ripples, setRipples] = useState({});

  // Measure active tab for sliding underline
  useEffect(() => {
    const activeEl = tabRefs.current[active];
    const container = containerRef.current;
    if (!activeEl || !container) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    setUnderline({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [active]);

  const fireRipple = (filter, e) => {
    const btn = tabRefs.current[filter];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const id = Date.now();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples(r => ({ ...r, [filter]: [...(r[filter]||[]), { id, x, y }] }));
    setTimeout(() => {
      setRipples(r => ({ ...r, [filter]: (r[filter]||[]).filter(rp => rp.id !== id) }));
    }, 700);
  };

  return (
    <div ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        padding: '6px 8px',
        background: C.isDark ? 'rgba(14,11,8,0.72)' : 'rgba(245,240,232,0.82)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1px solid ${C.isDark ? 'rgba(255,215,0,0.14)' : 'rgba(180,130,10,0.20)'}`,
        borderRadius: 14,
        boxShadow: C.isDark
          ? '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 4px 24px rgba(0,0,0,0.10)',
      }}
    >
      {/* Sliding gold underline */}
      <motion.div
        animate={{ left: underline.left, width: underline.width }}
        transition={{ type:'spring', stiffness:380, damping:30 }}
        style={{
          position: 'absolute',
          bottom: 5,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${C.gold} 30%, ${C.goldLt} 50%, ${C.gold} 70%, transparent 100%)`,
          borderRadius: 2,
          pointerEvents: 'none',
          zIndex: 3,
          boxShadow: `0 0 8px rgba(255,215,0,0.5)`,
        }}
      />

      {filters.map(f => {
        const isActive = f === active;
        return (
          <button
            key={f}
            ref={el => tabRefs.current[f] = el}
            onClick={e => { onChange(f); fireRipple(f, e); }}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '9px 18px',
              background: isActive
                ? (C.isDark ? 'rgba(255,215,0,0.13)' : 'rgba(180,130,10,0.11)')
                : 'transparent',
              border: `1px solid ${isActive
                ? (C.isDark ? 'rgba(255,215,0,0.35)' : 'rgba(180,130,10,0.32)')
                : 'transparent'}`,
              borderRadius: 9,
              ...ff.body,
              fontSize: 7.5,
              letterSpacing: '.28em',
              fontWeight: isActive ? 800 : 600,
              textTransform: 'uppercase',
              color: isActive ? C.gold : C.dim,
              cursor: 'pointer',
              transition: 'background .25s, border-color .25s, color .25s, box-shadow .25s',
              boxShadow: isActive
                ? `0 0 14px rgba(255,215,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)`
                : 'none',
              zIndex: 2,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = C.isDark ? 'rgba(255,215,0,0.07)' : 'rgba(180,130,10,0.06)';
                e.currentTarget.style.color = C.isDark ? 'rgba(255,215,0,0.75)' : C.text;
                e.currentTarget.style.boxShadow = `0 0 10px rgba(255,215,0,0.12)`;
                e.currentTarget.style.borderColor = C.isDark ? 'rgba(255,215,0,0.15)' : 'rgba(180,130,10,0.18)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = C.dim;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {/* Ripple layer */}
            {(ripples[f]||[]).map(rp => (
              <span key={rp.id} style={{
                position: 'absolute',
                left: rp.x, top: rp.y,
                width: 8, height: 8,
                background: isActive ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.18)',
                transform: 'translate(-50%,-50%) scale(0)',
                animation: 'rippleOut .7s ease-out forwards',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}/>
            ))}
            {f}
          </button>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY (with skeleton loading + metal filter)
═══════════════════════════════════════════════════════════════ */
const Gallery = ({ isFullPage = false, onSelect, initialSelected = null }) => {
  const C = useTheme();
  const [selected, setSelected] = useState(initialSelected);
  const userState = getUserState();
  const [liked, setLiked] = useState(userState.likes);
  const [saved, setSaved] = useState(userState.saves);
  const [hovered, setHovered] = useState(null);
  const [likeAnim, setLikeAnim] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');
  const [comments, setComments] = useState(userState.comments);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [liveItems, setLiveItems] = useState([]);
  const { isLoggedIn, user, setShowAuthModal, setAuthAction: setGlobalAuthAction, setShowCommissionModal } = useAppCtx();
  const userId = user?.id || 'guest';
  const dockRef = useRef(null);
  const [mouseX, setMouseX] = useState(null);
  const DOCK_ITEM_W = 68;

  // FIX: Fetch admin-uploaded items from Supabase with proper cancellation
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    let cancelled = false;
    fetch(`${supabaseUrl}/rest/v1/gallery_items?select=*&order=created_at.desc`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      if (cancelled) return;
      const valid = (rows || []).filter(r => r.image_url && r.image_url.length > 0);
      // Map all admin-editable fields so changes in admin panel reflect immediately
      const mapped = valid.map(r => ({
        id: r.id, gid: r.id,
        deity: r.title,                          // Caption / Title set in admin
        metal: r.metal_type || '',
        purity: r.purity || '',
        dims: r.dimensions || '',
        stone: r.stone_type || '',
        duration: r.crafting_duration || '',
        origin: 'Sowcarpet',
        img: r.image_url,
        cat: r.category || 'Gold Work',
        artisanNotes: r.artisan_notes || '',
        description: r.description || '',        // Caption/description edited in admin
        isFeatured: r.is_featured || false,
        _isUploaded: true,
      }));
      setLiveItems(mapped);
    })
    .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Merge: DB rows override static ones (deduplicate by normalized URL)
  const normalizeUrl = (u) => decodeURIComponent(u || '').replace(/\s+/g,' ').trim();
  const allIdols = useMemo(() => {
    const uploadedUrls = new Set(liveItems.map(i => normalizeUrl(i.img)));
    const staticOnly = GALLERY_IDOLS.filter(i => !uploadedUrls.has(normalizeUrl(i.img)));
    return [...staticOnly, ...liveItems];
  }, [liveItems]);

  const FILTERS = ['All','Gold Work','Crown Work','Silver Work','Stone Work','Vigraham'];

  // FIX: useMemo — prevents new array ref every render which caused infinite loops downstream
  const filteredIdols = useMemo(() =>
    activeFilter === 'All'
      ? allIdols
      : allIdols.filter(i => i.cat === activeFilter || i.metal.toLowerCase().includes(activeFilter.toLowerCase().split(' ')[0])),
  [allIdols, activeFilter]);

  const getDockScale = idx => {
    if (mouseX===null) return 1;
    const itemCenter = idx*(DOCK_ITEM_W+8)+DOCK_ITEM_W/2;
    const dist = Math.abs(mouseX-itemCenter);
    const maxDist = 120;
    if (dist>maxDist) return 1;
    return 1+(1-dist/maxDist)*0.65;
  };

  const handleLike = (idol, e) => {
    e.stopPropagation();
    const gid = idol.gid;
    const wasLiked = liked[gid];
    setLiked(prev=>({...prev,[gid]:!prev[gid]}));
    setLikeAnim(prev=>({...prev,[idol.id]:true}));
    setTimeout(()=>setLikeAnim(prev=>({...prev,[idol.id]:false})),600);
    // Persist to localStorage + Supabase
    const state = getUserState();
    state.likes[gid] = !wasLiked;
    setUserState(state);
    if (userId !== 'guest') toggleIdolLike(gid, userId, wasLiked);
  };

  const handleSave = (idol, e) => {
    e.stopPropagation();
    if (!isLoggedIn) { setGlobalAuthAction('save'); setShowAuthModal(true); return; }
    const gid = idol.gid;
    const wasSaved = saved[gid];
    setSaved(prev => ({...prev,[gid]:!prev[gid]}));
    const state = getUserState();
    state.saves[gid] = !wasSaved;
    setUserState(state);
    toggleIdolSave(gid, userId, wasSaved);
  };

  const handleAddComment = (idol, e) => {
    e.stopPropagation();
    if (!isLoggedIn) { setGlobalAuthAction('comment'); setShowAuthModal(true); return; }
    if (!commentInput.trim()) return;
    const id = idol.id;
    const gid = idol.gid;
    const text = commentInput.trim();
    setComments(prev => ({
      ...prev,
      [id]: [...(prev[id]||[]), { text, time: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}) }]
    }));
    // Persist to Supabase
    addIdolComment(gid, userId, text);
    CACHE.delete(`comments_${gid}`);
    setCommentInput('');
  };

  const sel = selected!==null ? GALLERY_IDOLS.find(i=>i.id===selected) : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handler = (e) => {
      if (selected === null) return;
      if (e.key === 'Escape') { setSelected(null); setShowComments(false); setCommentInput(''); }
      if (e.key === 'ArrowLeft')  handlePrev({ stopPropagation: ()=>{} });
      if (e.key === 'ArrowRight') handleNext({ stopPropagation: ()=>{} });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // FIX: Use filteredIdols.length as dep instead of the array itself
  // The effect only cares about whether `selected` still exists in the list
  }, [selected, filteredIdols.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (selected === null) return;
    const currentIndex = filteredIdols.findIndex(i => i.id === selected);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredIdols.length) % filteredIdols.length;
    setSelected(filteredIdols[prevIndex].id);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    if (selected === null) return;
    const currentIndex = filteredIdols.findIndex(i => i.id === selected);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredIdols.length;
    setSelected(filteredIdols[nextIndex].id);
  };

  // Swipe gesture detection for mobile
  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    // Swipe left = next, Swipe right = prev
    if (Math.abs(diff) > 60) {
      if (diff > 0) handleNext({ stopPropagation: () => {} });
      else handlePrev({ stopPropagation: () => {} });
    }
    setTouchStart(null);
  };

  // Calculate current image index
  const currentImageIndex = selected !== null ? filteredIdols.findIndex(i => i.id === selected) : -1;
  const totalImages = filteredIdols.length;

  return (
    <section id="gallery" style={{position:'relative',zIndex:2,paddingTop:'140px',paddingBottom:'60px',background:C.bg2,borderTop:`1px solid ${C.border}`,overflow:'hidden'}}>
      {/* Parallax Background Glow */}
      <motion.div 
        style={{
          position:'absolute',
          top:0,
          left:'50%',
          transform:'translateX(-50%)',
          width:'140%',
          height:'100%',
          background:'radial-gradient(ellipse 120% 80% at 50% 20%, rgba(255,215,0,0.06) 0%, transparent 60%)',
          zIndex:-1,
          pointerEvents:'none'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '-200px' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      
      <AnimatePresence>
        {selected!==null && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,background:'radial-gradient(ellipse 80% 60% at 50% 40%,rgba(255,215,0,0.04) 0%,transparent 70%)'}}/>
        )}
      </AnimatePresence>
      
      <div style={{maxWidth:1240,margin:'0 auto',position:'relative',zIndex:1,padding:'0 56px'}}>
        <Reveal>
          <motion.div 
            style={{textAlign:'center',marginBottom:64}}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Sacred Collection</span>
            <h2 style={{...ff.display,fontSize:'clamp(34px,6.5vw,82px)',lineHeight:.88,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              THE <span style={{color:C.gold}}>GALLERY</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:16}}>Tap any idol to explore · Like your favourites</p>
          </motion.div>
        </Reveal>

        {/* ── Premium Gallery Filter Tabs ── */}
        <Reveal delay={.08}>
          <motion.div 
            style={{display:'flex',justifyContent:'center',marginBottom:40}}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <PremiumFilterTabs
              filters={FILTERS}
              active={activeFilter}
              onChange={f=>{setActiveFilter(f);setSelected(null);}}
              C={C}
            />
          </motion.div>
        </Reveal>
        {/* ── PREMIUM MASONRY GALLERY — Cinematic Edition ── */}
        <style>{`
          /* ═══════════════════════════════════════════════════════════
             PREMIUM CINEMA MASONRY LAYOUT
             - Varied heights like Pinterest/Awwwards luxury portfolios
             - Cinematic spacing and composition
             - Blur-to-sharp image transitions
             - Floating glow effects
             - Parallax-ready structure
             ═══════════════════════════════════════════════════════════ */

          /* ─── Container ─────────────────────────────── */
          .vmw-masonry {
            columns: 4;
            column-gap: 16px;
            orphans: 1;
            widows: 1;
          }

          /* ─── Each card ──────────────────────────────── */
          .vmw-masonry-item {
            display: inline-block;
            width: 100%;
            break-inside: avoid;
            -webkit-column-break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            cursor: pointer;
            vertical-align: top;
            background: linear-gradient(135deg, #1a1208 0%, #0e0b06 100%);
            /* Cinematic lift + glow on hover */
            transition:
              transform .48s cubic-bezier(.16,1,.3,1),
              box-shadow .48s cubic-bezier(.16,1,.3,1),
              border-color .32s ease;
            will-change: transform, box-shadow, filter;
            border: 1px solid rgba(255,215,0,0.08);
          }

          /* Premium hover state with glow */
          .vmw-masonry-item:hover {
            transform: translateY(-12px) scale(1.018);
            box-shadow:
              0 32px 72px rgba(0,0,0,0.65),
              0 8px 24px rgba(0,0,0,0.40),
              0 0 40px rgba(255,215,0,0.12),
              0 0 20px rgba(255,215,0,0.08);
            border-color: rgba(255,215,0,0.28);
          }

          /* Floating glow animation on hover */
          @keyframes vmwFloatingGlow {
            0%, 100% { box-shadow: 
              0 32px 72px rgba(0,0,0,0.65),
              0 8px 24px rgba(0,0,0,0.40),
              0 0 40px rgba(255,215,0,0.12),
              0 0 20px rgba(255,215,0,0.08);
            }
            50% { box-shadow: 
              0 32px 72px rgba(0,0,0,0.65),
              0 8px 24px rgba(0,0,0,0.40),
              0 0 48px rgba(255,215,0,0.18),
              0 0 28px rgba(255,215,0,0.12);
            }
          }
          .vmw-masonry-item:hover {
            animation: vmwFloatingGlow 3s ease-in-out infinite;
          }

          /* Cinematic shine sweep pseudo-element */
          .vmw-masonry-item::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(
              125deg,
              transparent 0%,
              rgba(255,215,0,0.04) 15%,
              rgba(255,215,0,0.12) 50%,
              rgba(255,215,0,0.04) 85%,
              transparent 100%
            );
            transform: translateX(-100%) skewX(-12deg);
            transition: none;
            pointer-events: none;
            z-index: 5;
            border-radius: inherit;
          }
          .vmw-masonry-item:hover::after {
            transform: translateX(200%) skewX(-12deg);
            transition: transform .72s cubic-bezier(.16,1,.3,1);
          }

          /* ─── Image wrapper — intrinsic heights ── */
          .vmw-masonry-item .vmw-img-wrap {
            position: relative;
            width: 100%;
            overflow: hidden;
            will-change: transform;
          }

          /* PREMIUM VARIED HEIGHTS — Pinterest-style composition */
          .vmw-masonry-item:nth-child(5n+1) .vmw-img-wrap { aspect-ratio: 3/4; }
          .vmw-masonry-item:nth-child(5n+2) .vmw-img-wrap { aspect-ratio: 2/3; }
          .vmw-masonry-item:nth-child(5n+3) .vmw-img-wrap { aspect-ratio: 4/5; }
          .vmw-masonry-item:nth-child(5n+4) .vmw-img-wrap { aspect-ratio: 3/5; }
          .vmw-masonry-item:nth-child(5n)   .vmw-img-wrap { aspect-ratio: 5/7; }

          /* ─── Image — Blur-to-Sharp Cinematic Transition ── */
          .vmw-masonry-item .vmw-img-wrap img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            display: block;
            will-change: transform, opacity, filter;
            opacity: 0;
            transform: scale(1.08) translateZ(0);
            filter: blur(24px) brightness(0.95);
            transition:
              transform .78s cubic-bezier(.16,1,.3,1),
              opacity .42s ease,
              filter .85s cubic-bezier(.22,.8,.65,1);
            transform-origin: center center;
          }

          /* BLUR-TO-SHARP when loaded */
          .vmw-masonry-item .vmw-img-wrap img.vmw-img-loaded {
            opacity: 1;
            transform: scale(1) translateZ(0);
            filter: blur(0px) brightness(1);
          }

          /* Premium hover zoom with sharp focus */
          .vmw-masonry-item:hover .vmw-img-wrap img {
            transform: scale(1.12) translateZ(0);
            filter: brightness(1.08) saturate(1.12) contrast(1.05);
          }

          /* Elegant loading placeholder */
          .vmw-masonry-item .vmw-img-wrap::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #1c1408 0%, #2a1f0c 50%, #0e0b06 100%);
            z-index: 0;
          }

          /* Premium gold shimmer on loading */
          .vmw-masonry-item .vmw-img-wrap::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,215,0,0.08) 50%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: vmwPremiumShimmer 2.4s cubic-bezier(.25,.46,.45,.94) infinite;
            z-index: 1;
          }

          @keyframes vmwPremiumShimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }

          .vmw-masonry-item .vmw-img-wrap.vmw-wrap-loaded::after {
            display: none;
          }

          /* ─── Premium Cinematic Overlay ── */
          .vmw-masonry-item .vmw-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to top,
              rgba(0,0,0,0.94) 0%,
              rgba(0,0,0,0.52) 40%,
              rgba(0,0,0,0.08) 70%,
              transparent 100%
            );
            opacity: 0;
            transition: opacity .42s cubic-bezier(.16,1,.3,1);
            z-index: 3;
            pointer-events: none;
          }
          .vmw-masonry-item:hover .vmw-overlay { opacity: 1; }

          /* ─── Caption — Smooth Reveal ── */
          .vmw-masonry-item .vmw-caption {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 24px 18px 18px;
            transform: translateY(14px);
            opacity: 0;
            transition:
              opacity .38s cubic-bezier(.16,1,.3,1),
              transform .42s cubic-bezier(.16,1,.3,1);
            z-index: 4;
          }
          .vmw-masonry-item:hover .vmw-caption {
            opacity: 1;
            transform: translateY(0);
          }

          /* ─── Category Badge — Premium ── */
          .vmw-masonry-item .vmw-cat-badge {
            position: absolute;
            top: 12px; left: 12px;
            background: rgba(0,0,0,0.58);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            padding: 5px 10px;
            border-radius: 4px;
            border: 1px solid rgba(255,215,0,0.18);
            opacity: 0;
            transform: translateY(-6px) scale(0.95);
            transition: opacity .32s ease, transform .36s cubic-bezier(.16,1,.3,1);
            z-index: 4;
          }
          .vmw-masonry-item:hover .vmw-cat-badge { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }

          /* ─── Selected State ── */
          .vmw-masonry-item.vmw-selected {
            outline: 2px solid rgba(255,215,0,0.52);
            outline-offset: -2px;
          }
          .vmw-masonry-item.vmw-selected .vmw-img-wrap img {
            filter: brightness(1.12) saturate(1.18) contrast(1.08);
          }

          /* ─── Like Button ── */
          .vmw-like-btn { opacity: 0 !important; }
          .vmw-masonry-item:hover .vmw-like-btn,
          .vmw-like-btn-liked { opacity: 1 !important; }

          @keyframes vmwLikePop {
            0%   { transform: scale(1); }
            35%  { transform: scale(1.5); }
            70%  { transform: scale(0.88); }
            100% { transform: scale(1); }
          }
          .vmw-like-pop { animation: vmwLikePop .48s cubic-bezier(.34,1.56,.64,1); }

          /* ═══════════════════════════════════════════════════════════
             RESPONSIVE — PREMIUM MOBILE OPTIMIZATION
             ═══════════════════════════════════════════════════════════ */

          /* ─── TABLET 769–1100 ── */
          @media (max-width: 1100px) {
            .vmw-masonry { columns: 3; column-gap: 12px; }
            .vmw-masonry-item { margin-bottom: 12px; border-radius: 10px; }
          }

          /* ─── MOBILE ≤768px — Stacked Beauty ── */
          @media (max-width: 768px) {
            .vmw-masonry { columns: 2; column-gap: 10px; }
            .vmw-masonry-item { 
              margin-bottom: 10px; 
              border-radius: 8px;
              /* Always show on mobile for UX */
              transform: none !important;
            }
            
            /* Touch-friendly: persistent overlay & caption */
            .vmw-masonry-item .vmw-overlay { opacity: 0.48 !important; }
            .vmw-masonry-item .vmw-caption { 
              opacity: 1 !important; 
              transform: translateY(0) !important; 
            }
            .vmw-masonry-item .vmw-cat-badge { 
              opacity: 1 !important; 
              transform: translateY(0) scale(1) !important; 
            }
            
            /* Disable hover zoom on touch */
            .vmw-masonry-item:hover .vmw-img-wrap img { 
              transform: scale(1) !important; 
            }
            .vmw-masonry-item:hover { 
              transform: none !important; 
              box-shadow: none !important;
            }
            .vmw-masonry-item:hover::after { 
              transform: none !important; 
            }
            
            /* Tighter spacing on mobile */
            .vmw-masonry-item .vmw-caption { 
              padding: 12px 10px 10px !important; 
            }
          }

          /* ─── SMALL MOBILE ≤420px ── */
          @media (max-width: 420px) {
            .vmw-masonry { column-gap: 8px; }
            .vmw-masonry-item { margin-bottom: 8px; border-radius: 6px; }
            .vmw-masonry-item .vmw-cat-badge { top: 8px; left: 8px; padding: 4px 8px; }
          }
        `}</style>

        {/* Parallax Scroll Container */}
        <motion.div 
          style={{position:'relative',zIndex:2}}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="vmw-masonry" style={{marginBottom:48}}>
          {filteredIdols.map((idol, idx) => {
            const isSelected = selected === idol.id;
            const isLiked = liked[idol.gid];
            const isLoaded = loadedImages[idol.id];
            const staggerDelay = (idx % 8) * 0.06;
            const columnDelay = Math.floor(idx / 8) * 0.08;
            const totalDelay = staggerDelay + columnDelay;

            return (
              <motion.div
                key={idol.id}
                className={`vmw-masonry-item${isSelected ? ' vmw-selected' : ''}`}
                onClick={() => onSelect ? onSelect(idol.id) : setSelected(isSelected ? null : idol.id)}
                style={{ border: `1px solid ${isSelected ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.07)'}` }}
                initial={{ opacity:0, y: 48, scale: 0.92 }}
                whileInView={{ opacity:1, y: 0, scale: 1 }}
                viewport={{ once:true, margin:'-60px' }}
                transition={{ 
                  duration:0.85, 
                  delay: totalDelay,
                  ease:[0.16,1,0.3,1]
                }}
              >
                {/* Image wrapper — has intrinsic aspect-ratio so height exists before image loads */}
                <div className={`vmw-img-wrap${isLoaded ? ' vmw-wrap-loaded' : ''}`}>
                  <img
                    src={idol.img}
                    alt={idol.deity}
                    loading={idx < 8 ? 'eager' : 'lazy'}
                    className={isLoaded ? 'vmw-img-loaded' : ''}
                    decoding="async"
                    onLoad={() => setLoadedImages(prev => ({...prev, [idol.id]: true}))}
                    onError={e => {
                      // Fallback: show a gold-tinted placeholder gradient instead of broken img
                      e.currentTarget.style.display = 'none';
                      const wrap = e.currentTarget.parentElement;
                      if (wrap) {
                        wrap.style.background = 'linear-gradient(135deg,#1c1408 0%,#2a1e0a 50%,#1c1408 100%)';
                        // Add a subtle V monogram fallback
                        const fb = document.createElement('div');
                        fb.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:42px;color:rgba(255,215,0,0.15);user-select:none;z-index:2;font-weight:700';
                        fb.textContent = 'V';
                        wrap.appendChild(fb);
                      }
                    }}
                  />
                </div>

                {/* Hover overlay */}
                <div className="vmw-overlay"/>

                {/* Category badge */}
                <div className="vmw-cat-badge" style={{
                  fontFamily:"'Jost',sans-serif", fontSize:7,
                  letterSpacing:'.28em', fontWeight:700,
                  textTransform:'uppercase', color:'rgba(255,255,255,0.82)',
                }}>
                  {idol.cat}
                </div>

                {/* Like button */}
                <button
                  onClick={e => handleLike(idol, e)}
                  className={`vmw-like-btn${isLiked ? ' vmw-like-btn-liked' : ''}${likeAnim[idol.id] ? ' vmw-like-pop' : ''}`}
                  style={{
                    position:'absolute', top:9, right:9, zIndex:5,
                    background: isLiked ? 'rgba(255,50,80,0.9)' : 'rgba(0,0,0,0.58)',
                    border: `1px solid ${isLiked ? 'rgba(255,50,80,0.8)' : 'rgba(255,255,255,0.18)'}`,
                    borderRadius:'50%', width:28, height:28,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, cursor:'pointer',
                    transition:'opacity .3s, background .2s',
                  }}
                >
                  {isLiked ? '❤️' : '🤍'}
                </button>

                {/* Caption */}
                <div className="vmw-caption">
                  <div style={{
                    fontFamily:"'Cinzel',Georgia,serif", fontSize:11,
                    color:'rgba(255,255,255,0.95)', fontWeight:700, marginBottom:2,
                    textShadow:'0 1px 4px rgba(0,0,0,0.8)',
                  }}>{idol.deity}</div>
                  <div style={{
                    fontFamily:"'Jost',sans-serif", fontSize:7,
                    color:'rgba(255,215,0,0.78)', letterSpacing:'.2em',
                    textTransform:'uppercase', fontWeight:500,
                  }}>{idol.metal}</div>
                </div>

                {/* Selected ring */}
                {isSelected && (
                  <div style={{
                    position:'absolute', inset:0,
                    border:'1px solid rgba(255,215,0,0.4)',
                    borderRadius:4, pointerEvents:'none', zIndex:6,
                  }}/>
                )}
              </motion.div>
            );
          })}
          </div>
        </motion.div>
        {/* Dock */}
        <Reveal delay={.1}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:32}}>
            <div ref={dockRef}
              onMouseMove={e=>{const rect=dockRef.current.getBoundingClientRect();setMouseX(e.clientX-rect.left);}}
              onMouseLeave={()=>setMouseX(null)}
              style={{display:'flex',alignItems:'flex-end',gap:8,padding:'12px 20px',background:C.isDark?'rgba(22,20,18,0.92)':'rgba(245,240,232,0.92)',backdropFilter:'blur(20px)',borderRadius:24,border:`1px solid ${C.border}`,boxShadow:`0 8px 40px rgba(0,0,0,0.5)`}}>
              {allIdols.map((idol,idx)=>{
                const scale=getDockScale(idx);
                const isSelected=selected===idol.id;
                const isLiked=liked[idol.gid];
                return (
                  <div key={idol.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
                    <motion.div animate={{opacity:hovered===idol.id?1:0,y:hovered===idol.id?0:4}}
                      style={{...ff.body,fontSize:7,letterSpacing:'.2em',color:C.text,whiteSpace:'nowrap',background:'rgba(0,0,0,0.8)',padding:'3px 8px',borderRadius:4,border:`1px solid ${C.border}`,pointerEvents:'none',marginBottom:2}}>
                      {idol.deity}
                    </motion.div>
                    <motion.div onClick={()=>setSelected(isSelected?null:idol.id)}
                      onHoverStart={()=>setHovered(idol.id)} onHoverEnd={()=>setHovered(null)}
                      animate={{scale,y:scale>1?-(scale-1)*20:0}} transition={{type:'spring',stiffness:400,damping:28}}
                      style={{width:DOCK_ITEM_W,height:DOCK_ITEM_W,borderRadius:16,overflow:'hidden',cursor:'pointer',
                        border:isSelected?`2px solid ${C.borderHi}`:`2px solid ${isLiked?'rgba(255,80,100,0.5)':'rgba(255,255,255,0.1)'}`,
                        boxShadow:isSelected?`0 0 12px rgba(255,215,0,0.2)`:isLiked?'0 0 10px rgba(255,80,100,0.2)':'none',
                        position:'relative',flexShrink:0}}>
                      <img src={idol.img} alt={idol.deity} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      {isLiked&&<div style={{position:'absolute',bottom:3,right:3,fontSize:9,lineHeight:1}}>❤️</div>}
                    </motion.div>
                    <div style={{width:isSelected?5:3,height:isSelected?5:3,borderRadius:'50%',background:isSelected?C.gold:'rgba(255,255,255,0.2)',transition:'all .3s'}}/>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
        {/* ── PREMIUM FULLSCREEN CINEMATIC LIGHTBOX ── */}
        <style>{`
          /* Mobile lightbox optimization */
          @media (max-width: 768px) {
            /* Fullscreen on mobile */
            [role="dialog"] {
              padding: 0 !important;
            }
            
            /* Larger navigation buttons for touch */
            [style*="width: 56px"] {
              width: 48px !important;
              height: 48px !important;
              font-size: 28px !important;
            }
            
            /* Close button easier to tap */
            [style*="width: 44px"] {
              width: 48px !important;
              height: 48px !important;
            }
            
            /* Image counter repositioned for mobile */
            @supports (position: fixed) {
              .lightbox-counter {
                bottom: 12px !important;
                left: 12px !important;
                padding: 8px 12px !important;
                font-size: 11px !important;
              }
            }
          }
          
          /* iPhone X+ notch safety */
          @supports (padding: max(0px)) {
            @media (max-width: 768px) {
              [style*="position: fixed"] {
                padding-left: max(12px, env(safe-area-inset-left));
                padding-right: max(12px, env(safe-area-inset-right));
              }
            }
          }
        `}</style>
        <AnimatePresence>
          {sel && (
            <>
              {/* Premium Backdrop with Depth Animation */}
              <motion.div
                initial={{opacity:0,backdropFilter:'blur(0px)'}} 
                animate={{opacity:1,backdropFilter:'blur(18px)'}} 
                exit={{opacity:0,backdropFilter:'blur(0px)'}}
                transition={{duration:0.5,ease:[0.16,1,0.3,1]}}
                style={{
                  position:'fixed',inset:0,zIndex:999,
                  background:'linear-gradient(135deg,rgba(0,0,0,0.92) 0%,rgba(8,6,4,0.95) 50%,rgba(0,0,0,0.92) 100%)',
                  backdropFilter:'blur(18px)',
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  overflowY:'auto',padding:'20px 0'
                }}
                onClick={() => { setSelected(null); setShowComments(false); setCommentInput(''); }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Close Button - Floating Animation */}
                <motion.button 
                  onClick={e=>{e.stopPropagation();setSelected(null);setShowComments(false);setCommentInput('');}}
                  animate={{y:[0,-3,0]}}
                  transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}
                  whileHover={{scale:1.12,background:'rgba(255,255,255,0.22)'}}
                  whileTap={{scale:0.92}}
                  style={{position:'fixed',top:24,right:28,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',fontSize:22,cursor:'pointer',zIndex:1001,width:44,height:44,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',transition:'background .2s',boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}
                >×</motion.button>

                {/* Prev Button - Floating with Direction */}
                <motion.button 
                  onClick={handlePrev}
                  animate={{x:[-2,0,-2],y:[0,-2,0]}}
                  transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                  whileHover={{scale:1.14,x:0,background:'rgba(255,215,0,0.18)'}}
                  whileTap={{scale:0.88}}
                  style={{position:'fixed',left:16,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',color:'#fff',fontSize:36,cursor:'pointer',borderRadius:'50%',width:56,height:56,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',zIndex:1001,transition:'background .2s, box-shadow .2s',boxShadow:'0 12px 32px rgba(0,0,0,0.5)'}}
                >‹</motion.button>

                {/* Next Button - Floating with Direction */}
                <motion.button 
                  onClick={handleNext}
                  animate={{x:[2,0,2],y:[0,-2,0]}}
                  transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                  whileHover={{scale:1.14,x:0,background:'rgba(255,215,0,0.18)'}}
                  whileTap={{scale:0.88}}
                  style={{position:'fixed',right:16,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',color:'#fff',fontSize:36,cursor:'pointer',borderRadius:'50%',width:56,height:56,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',zIndex:1001,transition:'background .2s, box-shadow .2s',boxShadow:'0 12px 32px rgba(0,0,0,0.5)'}}
                >›</motion.button>

              {/* Image with Motion Blur Transition */}
              <motion.div
                key={sel.id}
                style={{position:'relative', display:'flex', justifyContent:'center', alignItems:'center', maxWidth:'90vw', maxHeight:'80vh'}}
                initial={{opacity:0,scale:0.92,filter:'blur(12px)'}}
                animate={{opacity:1,scale:1,filter:'blur(0px)'}}
                exit={{opacity:0,scale:0.95,filter:'blur(8px)'}}
                transition={{duration:0.6,ease:[0.16,1,0.3,1]}}
              >
                <motion.img
                  src={sel.img}
                  alt={sel.deity}
                  style={{maxHeight:'80vh',maxWidth:'100%',objectFit:'contain',borderRadius:12,boxShadow:'0 32px 96px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.08)',display:'block',width:'auto',height:'auto'}}
                  onClick={e=>e.stopPropagation()}
                  animate={{scale:1}}
                  whileHover={{scale:1.02}}
                  transition={{duration:0.3,ease:[0.16,1,0.3,1]}}
                />
                
                {/* Image Counter Badge - Floating */}
                <motion.div
                  animate={{y:[0,-4,0]}}
                  transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}
                  style={{
                    position:'absolute',bottom:16,left:16,
                    background:'rgba(0,0,0,0.68)',backdropFilter:'blur(12px)',
                    border:'1px solid rgba(255,215,0,0.35)',
                    borderRadius:10,padding:'10px 16px',
                    fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:700,
                    color:'rgba(255,215,0,0.9)',
                    boxShadow:'0 8px 24px rgba(0,0,0,0.6)',
                    letterSpacing:'.12em'
                  }}
                >
                  {currentImageIndex + 1} / {totalImages}
                </motion.div>

                {/* Progress Bar - Circular Indicator */}
                <svg
                  style={{position:'absolute',bottom:20,right:20,width:48,height:48}}
                  viewBox="0 0 48 48"
                >
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="rgba(255,215,0,0.8)"
                    strokeWidth="2"
                    strokeDasharray={`${(currentImageIndex + 1) / totalImages * 125.6} 125.6`}
                    strokeLinecap="round"
                    style={{transformOrigin:'24px 24px',transform:'rotate(-90deg)'}}
                  />
                </svg>
              </motion.div>

              {/* Info Panel - Floating with Staggered Children */}
              <motion.div 
                initial={{opacity:0,y:32}} 
                animate={{opacity:1,y:0}} 
                exit={{opacity:0,y:20}}
                transition={{delay:0.2,duration:0.6,ease:[0.16,1,0.3,1]}}
                style={{marginTop:28,width:'min(680px,92vw)',flexShrink:0}}
                onClick={e=>e.stopPropagation()}
              >
                {/* Top row — title + action buttons */}
                <motion.div 
                  initial={{opacity:0}} 
                  animate={{opacity:1}} 
                  transition={{delay:0.3,duration:0.5}}
                  style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,padding:'24px 28px',border:`1px solid ${C.borderHi}`,borderBottom:'none',background:'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,215,0,0.02) 100%)',backdropFilter:'blur(16px)',borderRadius:'14px 14px 0 0',flexWrap:'wrap',boxShadow:'0 16px 48px rgba(0,0,0,0.4)'}}
                >
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{...ff.body,fontSize:8,letterSpacing:'.44em',color:'rgba(255,215,0,0.85)',fontWeight:600,textTransform:'uppercase',marginBottom:6}}>{sel.cat}</div>
                    <div style={{...ff.display,fontSize:26,color:'rgba(255,255,255,0.94)',fontWeight:700,marginBottom:3,lineHeight:1.1}}>{sel.deity}</div>
                    <div style={{...ff.serif,fontSize:13,color:'rgba(255,255,255,0.5)',fontStyle:'italic'}}>{sel.metal} · Handcrafted in Sowcarpet</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                    {/* Like Button - with Animation */}
                    <motion.button
                      onClick={e=>handleLike(sel,e)}
                      title="Like this piece"
                      animate={{y:[0,-2,0]}}
                      transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}
                      whileHover={{scale:1.1,background: liked[sel.gid] ? 'rgba(255,50,80,0.28)' : 'rgba(255,255,255,0.15)'}}
                      whileTap={{scale:0.92}}
                      style={{
                        background: liked[sel.gid] ? 'rgba(255,50,80,0.18)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${liked[sel.gid] ? 'rgba(255,80,100,0.5)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius:10, padding:'11px 16px', cursor:'pointer',
                        display:'flex', alignItems:'center', gap:6,
                        color: liked[sel.gid] ? '#ff6080' : 'rgba(255,255,255,0.7)',
                        fontSize:13, fontFamily:"'Jost',sans-serif", fontWeight:600,
                        transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >{liked[sel.gid] ? '❤️' : '🤍'} <span style={{fontSize:10,letterSpacing:'.08em'}}>{liked[sel.gid]?'Liked':'Like'}</span></motion.button>

                    {/* Save Button - with Animation */}
                    <motion.button
                      onClick={e=>handleSave(sel,e)}
                      title={isLoggedIn ? 'Save to collection' : 'Sign in to save'}
                      animate={{y:[0,-2,0]}}
                      transition={{duration:2.5,repeat:Infinity,ease:'easeInOut',delay:0.1}}
                      whileHover={{scale:1.1,background: saved[sel.gid] ? 'rgba(255,215,0,0.24)' : 'rgba(255,255,255,0.15)'}}
                      whileTap={{scale:0.92}}
                      style={{
                        background: saved[sel.gid] ? 'rgba(255,215,0,0.14)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${saved[sel.gid] ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius:10, padding:'11px 16px', cursor:'pointer',
                        display:'flex', alignItems:'center', gap:6,
                        color: saved[sel.gid] ? '#FFD700' : 'rgba(255,255,255,0.7)',
                        fontSize:13, fontFamily:"'Jost',sans-serif", fontWeight:600,
                        transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >{saved[sel.gid] ? '🔖' : '📌'} <span style={{fontSize:10,letterSpacing:'.08em'}}>{saved[sel.gid]?'Saved':'Save'}</span></motion.button>

                    {/* Comment Button - with Animation */}
                    <motion.button
                      onClick={e=>{e.stopPropagation();setShowComments(v=>!v);}}
                      title="View & add comments"
                      animate={{y:[0,-2,0]}}
                      transition={{duration:2.5,repeat:Infinity,ease:'easeInOut',delay:0.2}}
                      whileHover={{scale:1.1,background: showComments ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.15)'}}
                      whileTap={{scale:0.92}}
                      style={{
                        background: showComments ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${showComments ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius:10, padding:'11px 16px', cursor:'pointer',
                        display:'flex', alignItems:'center', gap:6,
                        color:'rgba(255,255,255,0.7)', fontSize:13,
                        fontFamily:"'Jost',sans-serif", fontWeight:600, transition:'all .2s',
                        boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >💬 <span style={{fontSize:10,letterSpacing:'.08em'}}>{(comments[sel.id]||[]).length || ''} {showComments ? 'Hide' : 'Comments'}</span></motion.button>
                  </div>
                </motion.div>

                {/* Commission CTA row - Floating */}
                <motion.div 
                  initial={{opacity:0}} 
                  animate={{opacity:1}} 
                  transition={{delay:0.35,duration:0.5}}
                  style={{padding:'18px 28px',border:`1px solid ${C.borderHi}`,borderTop:`1px solid rgba(255,255,255,0.06)`,background:'linear-gradient(135deg,rgba(255,215,0,0.05) 0%,rgba(0,0,0,0.4) 100%)',backdropFilter:'blur(16px)',display:'flex',justifyContent:'flex-end'}}
                >
                  <CurvyButton primary onClick={e=>{e.stopPropagation();window.open(`https://wa.me/919382877351?text=${encodeURIComponent(`Namaskaram, I am interested in commissioning a ${sel.deity} (${sel.metal}). Please share details.`)}`);}} >
                    Commission This →
                  </CurvyButton>
                </motion.div>

                {/* Comments panel - Floating with Smooth Expand */}
                <AnimatePresence>
                  {showComments && (
                    <motion.div
                      initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      transition={{duration:0.4,ease:[.16,1,.3,1]}}
                      style={{overflow:'hidden',border:`1px solid ${C.borderHi}`,borderTop:'none',background:'linear-gradient(135deg,rgba(0,0,0,0.6) 0%,rgba(255,215,0,0.02) 100%)',backdropFilter:'blur(16px)',borderRadius:'0 0 14px 14px',boxShadow:'0 16px 48px rgba(0,0,0,0.4)'}}
                      onClick={e=>e.stopPropagation()}
                    >
                      <div style={{padding:'16px 24px 8px',maxHeight:220,overflowY:'auto'}}>
                        {(comments[sel.id]||[]).length === 0 ? (
                          <p style={{...ff.serif,fontSize:13,color:'rgba(255,255,255,0.35)',fontStyle:'italic',textAlign:'center',padding:'8px 0'}}>No comments yet — be the first.</p>
                        ) : (comments[sel.id]||[]).map((c,i) => (
                          <div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
                            <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,215,0,0.15)',border:'1px solid rgba(255,215,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11}}>✦</div>
                            <div>
                              <div style={{...ff.body,fontSize:10,color:'rgba(255,255,255,0.8)',lineHeight:1.5}}>{c.text}</div>
                              <div style={{...ff.body,fontSize:8,color:'rgba(255,255,255,0.3)',marginTop:2,letterSpacing:'.1em'}}>{c.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Add comment input */}
                      <div style={{padding:'14px 20px 18px',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',gap:8,alignItems:'center'}}>
                        <input
                          value={commentInput}
                          onChange={e=>setCommentInput(e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&handleAddComment(sel,e)}
                          onClick={e=>e.stopPropagation()}
                          placeholder={isLoggedIn ? 'Add a comment…' : 'Sign in to comment…'}
                          readOnly={!isLoggedIn}
                          style={{
                            flex:1, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.16)',
                            borderRadius:10, padding:'11px 16px', color:'rgba(255,255,255,0.85)',
                            fontFamily:"'Jost',sans-serif", fontSize:13, outline:'none',
                            cursor: isLoggedIn ? 'text' : 'pointer',
                            transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
                          }}
                          onFocus={e=>{if(!isLoggedIn){setGlobalAuthAction('comment');setShowAuthModal(true);}}}
                        />
                        <motion.button
                          onClick={e=>handleAddComment(sel,e)}
                          whileHover={{scale:1.08}}
                          whileTap={{scale:0.92}}
                          style={{background:'rgba(255,215,0,0.18)',border:'1px solid rgba(255,215,0,0.4)',borderRadius:10,padding:'11px 18px',color:'#FFD700',cursor:'pointer',fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:700,letterSpacing:'.15em',transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}
                        >Post</motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Auth modal moved to AppContent */}

        <SectionCTA primary="Commission a Piece" secondary="Contact Us"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>window.open(BIZ.whatsapp)}/>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CLIENT TESTIMONIALS (enhanced — auto-rotate, progress bar, extra cards)
═══════════════════════════════════════════════════════════════ */
const Testimonials = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const AUTO_MS = 6000;
  const testimonials = [
    { name:'Shri. Venkataraman Pillai', role:'Temple Trustee, Meenakshi Amman, Madurai', quote:'Vijay Metal Works has been crafting for our temple for over 40 years. The quality of their Panchaloha work is unmatched — every detail follows Agamic tradition perfectly. I. Vijay personally ensures every piece meets our standards.', rating:5, work:'Panchaloha Vigraham', year:'2023' },
    { name:'Swami Thiru Arunachalam', role:'Head Priest, Nataraja Temple, Chidambaram', quote:'We commissioned a full silver Prabhavali arch from Vijay Metal Works in 2022. The craftsmanship is extraordinary — precise nagas work that honours our 1000-year temple tradition. Delivered on time, within budget, and perfectly consecrated.', rating:5, work:'Silver Prabhavali Arch', year:'2022' },
    { name:'Sri. Krishnamurthy', role:'Secretary, London Murugan Temple', quote:'As the temple secretary in London, finding authentic Panchaloha craftsmen in Chennai was our challenge. Vijay Metal Works handled international shipping with full documentation. Our congregation is deeply moved by the quality of the idol.', rating:5, work:'International Commission', year:'2023' },
    { name:'Smt. Rajalakshmi Sundaram', role:'Trustee, Kapaleeswarar Temple, Chennai', quote:'I. Vijay himself oversees each project. For our Kireedam crown, he visited the temple to take precise measurements of the deity. That personal dedication is what sets Vijay Metal Works apart from any other craftsmen we have worked with.', rating:5, work:'24K Gold Kireedam', year:'2024' },
    { name:'Sri. Balakrishnan Iyer', role:'Head Priest, Brihadeeswarar Temple, Thanjavur', quote:'For a temple of our stature, only the finest metalwork is acceptable. Vijay Metal Works delivered copper electro gold plating with a 20-year guarantee — the finish is indistinguishable from solid gold. A masterwork of modern and traditional craft.', rating:5, work:'Electro Gold Plating', year:'2021' },
    { name:'Sri. Rajagopalan', role:'Managing Trustee, Srirangam Temple, Trichy', quote:'Three generations of our temple committee have worked with Vijay Metal Works. Their knowledge of Agamic specifications is encyclopaedic. When we needed a full Vimana tower restoration, there was only one call to make.', rating:5, work:'Vimana Tower Restoration', year:'2020' },
  ];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive(a => (a+1) % testimonials.length), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, testimonials.length]);

  const t = testimonials[active];

  return (
    <section id="testimonials" className="section-pad vmw-testimonials-section" style={{position:'relative',zIndex:2,background:C.bg3,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center',marginBottom:64}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Words From the Sacred</span>
            <h2 style={{...ff.display,fontSize:'clamp(28px,5vw,64px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              CLIENT <span style={{color:C.gold}}>TESTIMONIALS</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:14,maxWidth:480,margin:'14px auto 0'}}>
              Voices from 2000+ temples across India and the world.
            </p>
          </div>
        </Reveal>

        {/* Featured testimonial */}
        <div onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
          style={{marginBottom:40,position:'relative'}}>
          {/* Auto-progress bar */}
          <div style={{height:1,background:'rgba(255,255,255,.07)',marginBottom:0,overflow:'hidden',borderRadius:1}}>
            <div key={`${active}-${paused}`} style={{height:'100%',background:C.goldGrad,borderRadius:1,
              animation:paused?'none':`progressBar ${AUTO_MS}ms linear forwards`}}/>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-22}} transition={{duration:.48,ease:[.16,1,.3,1]}}>
              <div className="vmw-featured-testimonial" style={{border:`1px solid ${C.border}`,padding:'52px 56px',background:C.surfaceWarm,position:'relative',backdropFilter:'blur(8px)'}}>
                {/* Giant quote mark */}
                <div style={{...ff.display,fontSize:140,color:'rgba(255,255,255,0.04)',opacity:1,position:'absolute',top:4,left:22,lineHeight:1,fontWeight:900,pointerEvents:'none',userSelect:'none'}}>"</div>
                {/* Stars */}
                <div style={{display:'flex',gap:5,marginBottom:22}}>
                  {Array.from({length:t.rating}).map((_,i)=>(
                    <motion.span key={i} initial={{opacity:0,scale:.4}} animate={{opacity:1,scale:1}} transition={{delay:i*.06,type:'spring',stiffness:400}}
                      style={{fontSize:14,color:'rgba(255,215,0,0.7)'}}>★</motion.span>
                  ))}
                </div>
                <p style={{...ff.serif,fontSize:21,lineHeight:1.88,color:C.text,fontStyle:'italic',fontWeight:300,marginBottom:36,position:'relative',zIndex:1,maxWidth:820}}>
                  "{t.quote}"
                </p>
                <GoldRule opacity={.13} my={0}/>
                <div style={{paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{...ff.display,fontSize:16,color:C.text,fontWeight:600,letterSpacing:'.04em',marginBottom:5}}>{t.name}</div>
                    <div style={{...ff.body,fontSize:9,color:C.gold,letterSpacing:'.28em',textTransform:'uppercase',fontWeight:500,opacity:.7}}>{t.role}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                    <div style={{...ff.body,fontSize:8,color:C.faint,letterSpacing:'.22em',textTransform:'uppercase'}}>{t.work}</div>
                    <div style={{...ff.body,fontSize:8,color:C.faint,letterSpacing:'.3em',textTransform:'uppercase'}}>{t.year} · Verified Commission</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation + mini cards grid */}
        <StaggerContainer stagger={0.12} delay={0.05} style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:36}} className="vmw-testimonials-grid">
          {testimonials.map((tm,i)=>{
            const Item = i % 2 === 0 ? StaggerItemLeft : StaggerItemRight;
            return (
            <Item key={i}>
            <motion.div onClick={()=>{setActive(i);setPaused(true);setTimeout(()=>setPaused(false),8000);}}
              whileHover={{background:C.surfaceWarm,borderColor:C.borderHi,y:-3}}
              animate={{borderColor:active===i?C.borderHi:C.border,background:active===i?C.surfaceWarm:'transparent'}}
              transition={{duration:.3}}
              style={{padding:'16px 18px',border:`1px solid ${active===i?C.borderHi:C.border}`,cursor:'pointer',position:'relative',overflow:'hidden'}}>
              {active===i && (
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent)`}}/>
              )}
              <div style={{display:'flex',gap:4,marginBottom:7}}>
                {Array.from({length:5}).map((_,si)=>(
                  <span key={si} style={{fontSize:9,color:active===i?'rgba(255,215,0,0.65)':'rgba(255,255,255,.15)'}}> ★</span>
                ))}
              </div>
              <div style={{...ff.serif,fontSize:11.5,color:C.text,fontStyle:'italic',lineHeight:1.65,marginBottom:10,fontWeight:300}}>
                "{tm.quote.substring(0,78)}…"
              </div>
              <div style={{...ff.display,fontSize:11,color:active===i?C.text:C.dim,fontWeight:600,marginBottom:2}}>{tm.name.split('.').pop().trim()}</div>
              <div style={{...ff.body,fontSize:7,color:active===i?C.gold:C.faint,letterSpacing:'.22em',textTransform:'uppercase',fontWeight:600}}>{tm.work}</div>
            </motion.div>
            </Item>
            );
          })}
        </StaggerContainer>

        <SectionCTA primary="Commission Your Own Legacy" secondary="View Our Work"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>navigate('/gallery')}/>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FAQ SECTION (SEO)
═══════════════════════════════════════════════════════════════ */
const FAQ = () => {
  const C = useTheme();
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:'What metals do you work with?', a:'We specialise in five sacred metals: 24K Gold, Sterling Silver, Copper, Brass, and Panchaloha — the sacred five-metal alloy (gold, silver, copper, iron, and lead) prescribed in Agamic tradition. We also offer electro gold plating on existing idols.' },
    { q:'Can you ship temple metalwork internationally?', a:'Yes. We have shipped to temples across the United Kingdom, United Arab Emirates, Singapore, Malaysia, USA, and Australia. We handle all customs documentation, hallmark certificates, and secure packing for international shipments.' },
    { q:'How long does a custom Panchaloha idol take?', a:'Depending on size and complexity, a handcrafted Panchaloha idol typically takes 45–120 days from order confirmation. Simple pieces like Kalasam vessels may be ready in 2–3 weeks, while full Vimana towers or large Vigraham sets may take 4–6 months.' },
    { q:'Do you follow Agamic tradition in idol-making?', a:'Absolutely. Every idol is crafted strictly according to Agama Shastra — the classical texts governing proportions (tala mana), iconography (pratima lakshana), and metal purity. Our master craftsmen have been trained in this tradition for over four generations since 1915.' },
    { q:'Do you offer temple renovation services?', a:'Yes. We offer complete temple renovation — from restoring old idols and re-gold plating, to full Vimana tower construction, Prabhavali arches, Kireedam crowns, and sacred vessels. We have renovated over 2000 temples across India and worldwide.' },
    { q:'Can I upload a reference image for my commission?', a:'Yes — our inquiry form supports uploading a reference image (photo of existing idol, design sketch, or reference from another temple). This helps our craftsmen understand your exact requirement before quoting.' },
    { q:'How do I get a price quote?', a:'Simply fill our inquiry form or WhatsApp I. Vijay directly at +91 93828 77351. Share the type of work, dimensions, metal preference, and your timeline. We typically respond within a few hours with a detailed quotation.' },
    { q:'Is electro gold plating as durable as solid gold work?', a:'Our electro gold plating uses a minimum 3-micron 24K gold deposit over copper or brass. With proper care and periodic re-plating every 10–15 years, it is a cost-effective and visually identical alternative to solid gold for large surfaces like Vimana towers.' },
  ];

  return (
    <section id="faq" className="section-pad vmw-faq-section" style={{position:'relative',zIndex:2,background:C.bg2,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:960,margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center',marginBottom:56}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Questions & Answers</span>
            <h2 style={{...ff.display,fontSize:'clamp(28px,5vw,62px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              FREQUENTLY <span style={{color:C.gold}}>ASKED</span>
            </h2>
          </div>
        </Reveal>
        <StaggerContainer stagger={0.07} delay={0.05} style={{display:'flex',flexDirection:'column',gap:2}}>
          {faqs.map((item,i)=>(
            <StaggerItem key={i}>
              <div style={{border:`1px solid ${open===i?C.borderHi:C.border}`,background:open===i?C.surfaceGold:C.surfaceWarm,transition:'all .25s',borderRadius:2}}>
                <button onClick={()=>setOpen(open===i?null:i)}
                  style={{width:'100%',background:'none',border:'none',cursor:'pointer',padding:'22px 28px',
                    display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,textAlign:'left'}}>
                  <span style={{...ff.body,fontSize:12,fontWeight:600,letterSpacing:'.06em',color:open===i?C.text:C.dim,transition:'color .2s',lineHeight:1.4}}>
                    {item.q}
                  </span>
                  <span style={{flexShrink:0,width:24,height:24,border:`1px solid ${open===i?C.borderGold:C.border}`,
                    display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',
                    color:open===i?C.gold:C.dim,fontSize:14,fontWeight:300,transition:'all .25s',
                    transform:open===i?'rotate(45deg)':'rotate(0deg)'}}>+</span>
                </button>
                <AnimatePresence>
                  {open===i && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      transition={{duration:.28,ease:[.25,.46,.45,.94]}}
                      style={{overflow:'hidden'}}>
                      <div style={{padding:'0 28px 24px',paddingTop:0}}>
                        <GoldRule opacity={.08} my={0}/>
                        <p style={{...ff.serif,fontSize:14.5,lineHeight:1.95,color:C.dim,fontStyle:'italic',fontWeight:300,marginTop:16}}>
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <Reveal delay={.12}>
          <div style={{textAlign:'center',marginTop:52,paddingTop:44,borderTop:`1px solid ${C.border}`}}>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginBottom:22}}>Still have questions? I. Vijay personally answers every enquiry.</p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <CurvyButton primary onClick={()=>window.open(BIZ.whatsapp)}>WhatsApp Us Now</CurvyButton>
              <StarBorderButton onClick={()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})} speed={6}>Send an Inquiry</StarBorderButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ARCHIVE
═══════════════════════════════════════════════════════════════ */
const Archive = () => {
  const C = useTheme();
  const [hov, setHov] = useState(null);
  const pieces = [
    { id:0, t:'Sadari Crown Set', s:'24K Gold · Nagas Work', img:'/gallery/gold/sadarigold.jpg', tag:'Gold Work', large:true },
    { id:1, t:'Kandabaranam Silver', s:'Silver · Stone Setting', img:'/gallery/silver/kandabaranam.jpg', tag:'Silver Work' },
    { id:2, t:'Temple Crown Gold', s:'Gold Handcrafted', img:'/gallery/gold/crown.jpg', tag:'Crown Work' },
    { id:3, t:'Kanganam Bangle', s:'Gold Stone Setting', img:'/gallery/gold/kanganam4.jpg', tag:'Gold Work' },
    { id:4, t:'Stone Piece', s:'Precious Stone Work', img:'/gallery/stone/stone1.jpg', tag:'Stone Work' },
    { id:5, t:'Temple Vigraham', s:'All Metals · All Crafts', img:'/gallery/temple/god.jpg', tag:'Vigraham' },
  ];
  return (
    <section id="archive" className="section-pad" style={{position:'relative',zIndex:2,background:C.bg1}}>
      <div style={{maxWidth:1400,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:52,flexWrap:'wrap',gap:20}}>
          <SlideLeft>
            <h2 style={{...ff.display,fontSize:'clamp(44px,8.5vw,104px)',lineHeight:.87,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              THE<br/><span style={{color:C.gold}}>ARCHIVE</span>
            </h2>
          </SlideLeft>
          <SlideRight delay={.12}>
            <p style={{...ff.body,fontSize:9,letterSpacing:'.5em',color:C.faint,fontWeight:600,textTransform:'uppercase',maxWidth:200,lineHeight:2.2,textAlign:'right'}}>
              Each piece — a dialogue with the divine.
            </p>
          </SlideRight>
        </div>
        <div className="archive-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gridTemplateRows:'auto',gap:6}}>
          {pieces.map((p,pidx)=>(
            <motion.div key={p.id} onHoverStart={()=>setHov(p.id)} onHoverEnd={()=>setHov(null)}
              initial={{ opacity:0, y:36 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-50px' }}
              transition={{ duration:0.8, delay:pidx*0.1, ease:[0.16,1,0.3,1] }}
              style={{gridColumn:p.large?'span 2':'span 1',gridRow:p.large?'span 2':'span 1',position:'relative',overflow:'hidden',cursor:'default',background:C.bg2,border:`1px solid ${C.border}`,aspectRatio:p.large?'1/1':'4/3',minHeight:p.large?240:160}}
              whileHover={{borderColor:C.borderHi}}>
              <motion.img src={p.img} alt={p.t}
                animate={{scale:hov===p.id?1.06:1,opacity:hov===p.id?.95:.82}} transition={{duration:.8,ease:[.16,1,.3,1]}}
                style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'sepia(15%)'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(16,14,12,.90) 0%,transparent 55%)'}}/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,padding:p.large?30:18}}>
                <motion.div animate={{y:hov===p.id?0:8,opacity:hov===p.id?1:0}} transition={{duration:.32}}
                  style={{...ff.body,fontSize:7,letterSpacing:'.42em',color:C.dim,fontWeight:600,textTransform:'uppercase',marginBottom:5}}>
                  {p.tag}
                </motion.div>
                <div style={{...ff.serif,fontSize:p.large?26:16,color:C.text,fontWeight:600,letterSpacing:'.02em',lineHeight:1.2}}>{p.t}</div>
                <div style={{...ff.body,fontSize:8,color:C.dim,letterSpacing:'.25em',textTransform:'uppercase',fontWeight:600,marginTop:4}}>{p.s}</div>
              </div>
              <div style={{position:'absolute',top:13,right:13,width:14,height:14,border:`1px solid ${C.borderHi}`,opacity:hov===p.id?.4:.12,transition:'opacity .3s',transform:'rotate(45deg)'}}/>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CONTACT (with Google Maps + Image Upload)
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   FORM SUBMISSION — backend API + WhatsApp fallback
   ─────────────────────────────────────────────────────────────
   Primary path : POST /api/inquiry  (Next.js API route)
   Fallback path: WhatsApp deep-link  (always opens if API fails)

   Backend expects multipart/form-data with fields:
     name, phone, type, note, refImage (file, optional)

   Next.js API route: create  /app/api/inquiry/route.ts
   or Pages router:   create  /pages/api/inquiry.ts
   Then set in Vercel dashboard → Settings → Environment Variables:
     NEXT_PUBLIC_INQUIRY_ENDPOINT = /api/inquiry
   ─────────────────────────────────────────────────────────────
   If env var is not set → WhatsApp-only mode (safe default).
═══════════════════════════════════════════════════════════════ */

// Next.js replaces NEXT_PUBLIC_* at build time — no import.meta, no dynamic process.env
const INQUIRY_ENDPOINT = null; // Set your API endpoint here if needed

/* Field validation rules */
const VALIDATORS = {
  name:  v => v.trim().length >= 2   ? null : 'Please enter your full name (min 2 characters)',
  phone: v => /^[+\d][\d\s\-]{7,14}$/.test(v.trim()) ? null : 'Enter a valid phone / WhatsApp number',
  note:  v => v.trim().length > 0    ? null : 'Please briefly describe your requirement',
};

const Contact = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();
  const [type,       setType]       = useState('Idol / Vigraham');
  const [name,       setName]       = useState('');
  const [phone,      setPhone]      = useState('');
  const [note,       setNote]       = useState('');
  const [refFile,    setRefFile]    = useState(null);
  const [refPreview, setRefPreview] = useState(null);
  const [dragOver,   setDragOver]   = useState(false);

  /* submission states */
  const [submitted,  setSubmitted]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState(null);   // string | null
  const [touched,    setTouched]    = useState({});      // which fields were blurred
  const [errors,     setErrors]     = useState({});      // field-level errors

  const workTypes = ['Idol / Vigraham','Kireedam (Crown)','Prabhavali (Arch)','Kalasam / Vessel','Vimana Tower','Full Renovation','Panchaloha Casting'];
  const fileRef = useRef(null);

  /* ── validation helpers ── */
  const validate = (field, val) => VALIDATORS[field]?.(val) ?? null;

  const touchField = field => {
    setTouched(t => ({ ...t, [field]: true }));
    const vals = { name, phone, note };
    const err = validate(field, vals[field]);
    setErrors(e => ({ ...e, [field]: err }));
  };

  const validateAll = () => {
    const vals = { name, phone, note };
    const errs = {};
    let ok = true;
    Object.keys(VALIDATORS).forEach(f => {
      const e = validate(f, vals[f]);
      errs[f] = e;
      if (e) ok = false;
    });
    setErrors(errs);
    setTouched({ name:true, phone:true, note:true });
    return ok;
  };

  /* ── file helpers ── */
  const handleFile = e => { const f = e.target.files[0]; if (f) processFile(f); };
  const processFile = f => {
    if (!f.type.startsWith('image/')) { setApiError('Only image files are accepted (JPG, PNG, WEBP).'); return; }
    if (f.size > 10 * 1024 * 1024)    { setApiError('Image must be under 10 MB.'); return; }
    setRefFile(f);
    const reader = new FileReader();
    reader.onload = ev => setRefPreview(ev.target.result);
    reader.readAsDataURL(f);
  };
  const handleDrop = e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); };

  /* ── WhatsApp fallback (always available) ── */
  const openWhatsApp = () => {
    const txt = encodeURIComponent(
      `Namaskaram I. Vijay sir,\n\nCommission Enquiry:\n\nName: ${name}\nPhone: ${phone}\nWork Type: ${type}\nNotes: ${note||'—'}\n${refFile?`Reference Image: ${refFile.name} (please share image separately)`:''}\n\nThank you.`
    );
    window.open(`https://wa.me/919382877351?text=${txt}`, '_blank');
  };

  /* ── primary submission ── */
  const submit = async () => {
    if (!validateAll()) return;
    setApiError(null);
    setLoading(true);

    /* Try backend API if configured */
    if (INQUIRY_ENDPOINT) {
      try {
        const body = new FormData();
        body.append('name',  name.trim());
        body.append('phone', phone.trim());
        body.append('type',  type);
        body.append('note',  note.trim());
        body.append('to',    BIZ.email);
        if (refFile) body.append('refImage', refFile);

        const res = await fetch(INQUIRY_ENDPOINT, { method: 'POST', body });

        if (!res.ok) {
          // Parse error message from API if available
          let msg = `Server error (${res.status}). `;
          try { const j = await res.json(); msg += j.message || ''; } catch {}
          throw new Error(msg.trim() || 'Submission failed. Please try WhatsApp below.');
        }

        /* API success */
        setLoading(false);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 8000);
        setName(''); setPhone(''); setNote(''); setRefFile(null); setRefPreview(null);
        setTouched({}); setErrors({});
        return;

      } catch (err) {
        setLoading(false);
        setApiError(err.message || 'Could not reach server. Opening WhatsApp instead…');
        openWhatsApp(); // always fall back
        return;
      }
    }

    /* No API configured — WhatsApp only */
    setLoading(false);
    openWhatsApp();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 8000);
    setName(''); setPhone(''); setNote(''); setRefFile(null); setRefPreview(null);
    setTouched({}); setErrors({});
  };

  /* ── field change handlers (clear error on change) ── */
  const change = (field, setter) => e => {
    setter(e.target.value);
    if (touched[field]) {
      const err = validate(field, e.target.value);
      setErrors(ev => ({ ...ev, [field]: err }));
    }
  };


  return (
    <section id="contact" className="section-pad" style={{position:'relative',zIndex:2,background:C.bg3,borderTop:`1px solid ${C.border}`}}>

      {/* ── Success Popup ── */}
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{opacity:0,y:-28,scale:.92}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-28,scale:.92}}
            transition={{type:'spring',stiffness:320,damping:26}}
            style={{position:'fixed',top:88,left:'50%',transform:'translateX(-50%)',zIndex:400,
              background:C.bg1,border:`1px solid ${C.borderHi}`,minWidth:340,maxWidth:440,
              backdropFilter:'blur(28px)',boxShadow:`0 4px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.06)`}}>
            <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent)'}}/>
            <div style={{height:2,background:C.border,overflow:'hidden'}}>
              <div style={{height:'100%',background:`rgba(255,215,0,0.45)`,animation:'progressBar 8s linear forwards'}}/>
            </div>
            <div style={{padding:'22px 28px 24px',display:'flex',gap:18,alignItems:'flex-start'}}>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:.15,type:'spring',stiffness:380}}
                style={{width:44,height:44,borderRadius:'50%',background:C.surfaceGold,border:`1px solid ${C.borderGold}`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                ✅
              </motion.div>
              <div style={{flex:1}}>
                <div style={{...ff.display,fontSize:14,color:C.text,fontWeight:700,letterSpacing:'.1em',marginBottom:6}}>
                  {INQUIRY_ENDPOINT ? 'Inquiry Received!' : 'Inquiry Sent via WhatsApp'}
                </div>
                <div style={{...ff.body,fontSize:10,color:C.dim,letterSpacing:'.1em',lineHeight:1.75,marginBottom:10}}>
                  {INQUIRY_ENDPOINT
                    ? `Your inquiry has been emailed to I. Vijay. He typically responds within a few hours on ${BIZ.phone}.`
                    : `WhatsApp has opened with your inquiry pre-filled. I. Vijay responds within a few hours.`}
                </div>
                <div style={{...ff.body,fontSize:8,color:C.dim,letterSpacing:'.22em',fontWeight:600,textTransform:'uppercase',display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'rgba(255,215,0,0.7)',display:'inline-block',animation:'pulse 1.4s ease-in-out infinite'}}/>
                  {BIZ.phone}
                </div>
              </div>
              <button onClick={()=>setSubmitted(false)}
                style={{background:'none',border:'none',color:C.faint,fontSize:18,cursor:'pointer',padding:'0 2px',lineHeight:1,flexShrink:0,marginTop:-2}}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── API Error Toast ── */}
      <AnimatePresence>
        {apiError && (
          <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            transition={{duration:.3}}
            style={{position:'fixed',top:88,left:'50%',transform:'translateX(-50%)',zIndex:401,
              background:C.bg1,border:'1px solid rgba(255,80,60,0.35)',minWidth:320,maxWidth:480,
              backdropFilter:'blur(24px)',boxShadow:'0 4px 24px rgba(0,0,0,.5)',padding:'16px 22px',
              display:'flex',gap:14,alignItems:'flex-start'}}>
            <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
            <div style={{flex:1,...ff.body,fontSize:10,color:C.text,letterSpacing:'.08em',lineHeight:1.7}}>{apiError}</div>
            <button onClick={()=>setApiError(null)}
              style={{background:'none',border:'none',color:C.faint,fontSize:18,cursor:'pointer',flexShrink:0,lineHeight:1}}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{maxWidth:900,margin:'0 auto',padding:'0 24px',textAlign:'center'}}>
        <SlideUp>
          <div style={{fontSize:42,marginBottom:24,color:C.gold,opacity:0.8}}>✧</div>
          <h2 style={{...ff.display,fontSize:42,color:C.text,marginBottom:16}}>Start Your Sacred Project</h2>
          <p style={{...ff.body,fontSize:14,color:C.dim,lineHeight:1.8,marginBottom:48,maxWidth:600,margin:'0 auto 48px'}}>
            We accept a limited number of commissions each year to ensure uncompromising quality. 
            Connect with I. Vijay to discuss your vision, metal preferences, and custom requirements.
          </p>
          <motion.button 
            onClick={() => setShowCommissionModal(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              padding:'18px 48px',background:C.gold,color:'#000',border:'none',borderRadius:4,
              fontFamily:"'Jost', sans-serif",fontSize:13,fontWeight:700,letterSpacing:'0.15em',
              textTransform:'uppercase',cursor:'pointer',boxShadow:`0 10px 40px ${C.gold}33`
            }}
          >
            Enquire Now
          </motion.button>
          
          <div style={{marginTop:48,paddingTop:48,borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'center',gap:40,flexWrap:'wrap'}}>
            {[
              { icon:'☎', txt:BIZ.phone, link:`tel:${BIZ.phoneTel}` },
              { icon:'✉', txt:BIZ.email, link:`mailto:${BIZ.email}` },
              { icon:'💬', txt:`WhatsApp: ${BIZ.phone}`, link:BIZ.whatsapp },
              { icon:'📍', txt:BIZ.address, link:BIZ.mapLink },
            ].map(c=>(
              <motion.a key={c.txt} href={c.link} target="_blank" rel="noopener noreferrer" whileHover={{y:-2}}
                style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
                <span style={{fontSize:16,color:C.gold}}>{c.icon}</span>
                <span style={{...ff.body,fontSize:11,color:C.dim,letterSpacing:'.05em',textTransform:'uppercase'}}>{c.txt}</span>
              </motion.a>
            ))}
          </div>
        </SlideUp>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FOOTER (with quick contact buttons)
═══════════════════════════════════════════════════════════════ */
const Footer = () => {
  const C = useTheme();
  return (
  <footer className="vmw-footer" style={{position:'relative',zIndex:2,background:C.bg1,borderTop:`1px solid ${C.border}`,textAlign:'center'}}>
    <FadeIn duration={1.1}>
    <div style={{maxWidth:960,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
        <svg width="60" height="60" viewBox="0 0 40 40">
          <rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke={C.gold} strokeWidth="1.2" transform="rotate(45 20 20)" style={{filter:`drop-shadow(0 0 8px ${C.gold}44)`}}/>
          <text x="20" y="27" textAnchor="middle" fontFamily="'Cinzel',serif" fontSize="14" fontWeight="700" fill={C.gold}>V</text>
        </svg>
      </div>
      <h3 style={{...ff.display,fontSize:17,letterSpacing:'.32em',color:C.text,fontWeight:700,textTransform:'uppercase',marginBottom:7}}>{BIZ.name}</h3>
      <p style={{...ff.serif,fontSize:13,color:C.dim,fontStyle:'italic',marginBottom:6}}>{BIZ.tagline}</p>
      <p style={{...ff.body,fontSize:7,letterSpacing:'.52em',color:C.faint,fontWeight:600,textTransform:'uppercase',marginBottom:8}}>{BIZ.since}</p>
      <GoldRule my={28}/>

      {/* Footer Quick Contact Buttons — enhanced */}
      <div className="vmw-footer-btns" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:40,maxWidth:720,margin:'0 auto 40px'}}>
        {[
          { icon:'📞', label:'Call Now', sub:BIZ.phone, action:()=>window.open(`tel:${BIZ.phoneTel}`), highlight:false },
          { icon:'💬', label:'WhatsApp', sub:'Chat Instantly', action:()=>window.open(BIZ.whatsapp), highlight:true },
          { icon:'✉', label:'Email Us', sub:'Get a Quote', action:()=>window.open(`mailto:${BIZ.email}`), highlight:false },
          { icon:'📍', label:'Directions', sub:'Sowcarpet', action:()=>window.open(BIZ.mapLink), highlight:false },
        ].map(btn=>(
          <motion.button key={btn.label} onClick={btn.action}
            whileHover={{y:-3,borderColor:btn.highlight?C.goldLt:C.borderHi,background:btn.highlight?'rgba(255,228,77,.15)':'rgba(255,255,255,.03)'}}
            whileTap={{scale:.96}}
            style={{...ff.body,padding:'16px 10px',border:`1px solid ${btn.highlight?C.borderGold:C.border}`,
              background:btn.highlight?'rgba(255,228,77,.07)':'transparent',
              cursor:'pointer',transition:'all .3s',borderRadius:3,
              display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <span style={{fontSize:18,lineHeight:1}}>{btn.icon}</span>
            <span style={{fontSize:8,letterSpacing:'.26em',fontWeight:700,textTransform:'uppercase',color:btn.highlight?C.gold:C.dim}}>{btn.label}</span>
            <span style={{fontSize:7,letterSpacing:'.12em',color:C.faint,textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{btn.sub}</span>
          </motion.button>
        ))}
      </div>

      <div className="footer-cols" style={{display:'grid',gap:24,marginBottom:28,textAlign:'left'}}>
        {[
          { h:'Address', lines:[BIZ.address] },
          { h:'Contact', lines:[BIZ.phone, BIZ.email] },
          { h:'Presence', lines:['Sowcarpet, Chennai','London · Dubai · Singapore','All major temple cities'] },
        ].map(col=>(
          <div key={col.h}>
            <div style={{...ff.body,fontSize:7,letterSpacing:'.44em',color:C.dim,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>{col.h}</div>
            {col.lines.map(l=>(
              <div key={l} style={{...ff.body,fontSize:10,color:C.dim,lineHeight:2,letterSpacing:'.05em'}}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      <GoldRule/>
      <div style={{paddingTop:20,...ff.body,fontSize:7,color:C.faint,letterSpacing:'.28em',fontWeight:600,textTransform:'uppercase'}}>
        © 2025 Vijay Metal Works · All Rights Reserved
      </div>
    </div>
    </FadeIn>
  </footer>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FLOATING WHATSAPP CTA (enhanced)
═══════════════════════════════════════════════════════════════ */
const WAFab = () => {
  const C = useTheme();
  const [show, setShow] = useState(false);
  const [tip, setTip] = useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),3200);},[]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0}}
          transition={{type:'spring',stiffness:280,damping:20}}
          className="wa-fab"
          style={{position:'fixed',bottom:30,right:30,zIndex:200}}>
          <AnimatePresence>
            {tip && (
              <motion.div initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:8}}
                style={{position:'absolute',right:'110%',top:'50%',transform:'translateY(-50%)',background:C.isDark?'rgba(24,22,20,0.96)':'rgba(240,235,225,0.96)',color:C.text,padding:'9px 16px',borderRadius:3,border:`1px solid rgba(255,255,255,0.1)`,...ff.body,fontSize:8,letterSpacing:'.28em',fontWeight:700,textTransform:'uppercase',whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.4)'}}>
                Chat with I. Vijay
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button onClick={()=>window.open(BIZ.whatsapp)}
            onHoverStart={()=>setTip(true)} onHoverEnd={()=>setTip(false)}
            whileHover={{scale:1.1}} whileTap={{scale:.93}}
            animate={{y:[0,-3,0]}} transition={{y:{duration:3.5,repeat:Infinity,ease:'easeInOut'}}}
            style={{width:58,height:58,borderRadius:'50%',background:'#25D366',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 16px rgba(0,0,0,.4)',position:'relative',fontSize:26}}>
            💬
            <motion.div animate={{scale:[1,1.6,1],opacity:[.28,0,.28]}} transition={{duration:3.5,repeat:Infinity}}
              style={{position:'absolute',inset:0,borderRadius:'50%',background:'#25D366',zIndex:-1}}/>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STICKY MOBILE CONTACT BAR (enhanced)
═══════════════════════════════════════════════════════════════ */
const MobileContactBar = () => {
  const C = useTheme();
  return (
  <div className="mobile-sticky-bar"
    style={{display:'none',position:'fixed',bottom:0,left:0,right:0,zIndex:190,
      flexDirection:'column',
      background:C.isDark?'rgba(20,18,16,0.97)':'rgba(245,240,232,0.97)',borderTop:`1px solid ${C.border}`,
      backdropFilter:'blur(24px)',paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
    <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(255,215,0,0.3),transparent)'}}/>
    <div style={{display:'flex',gap:0,padding:'10px 12px 10px'}}>
      {[
        { label:'📞 Call', sub:'Direct', action:()=>window.open(`tel:${BIZ.phoneTel}`), primary:false },
        { label:'💬 WhatsApp', sub:'Chat Now', action:()=>window.open(BIZ.whatsapp), primary:true },
        { label:'✉ Email', sub:'Get Quote', action:()=>window.open(`mailto:${BIZ.email}`), primary:false },
      ].map((btn,i)=>(
        <button key={btn.label} onClick={btn.action}
          style={{flex:1,padding:'11px 4px 9px',...ff.body,
            marginLeft:i===1?4:0, marginRight:i===1?4:0,
            background:btn.primary?C.gold:'transparent',
            border:`1px solid ${btn.primary?C.goldLt:C.border}`,
            borderRadius:btn.primary?3:2,
            cursor:'pointer',transition:'all .25s',
            display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
          <span style={{fontSize:8,letterSpacing:'.18em',fontWeight:700,textTransform:'uppercase',
            color:btn.primary?'#fff':C.dim}}>{btn.label}</span>
          <span style={{fontSize:6.5,letterSpacing:'.18em',color:btn.primary?'rgba(255,255,255,.55)':C.faint,
            textTransform:'uppercase'}}>{btn.sub}</span>
        </button>
      ))}
    </div>
  </div>
);
};

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE BUTTON
═══════════════════════════════════════════════════════════════ */
const ThemeToggle = ({ mode, setMode, C }) => {
  const options = [
    { key:'light', icon:'☀️', label:'Light' },
    { key:'dark',  icon:'🌙', label:'Dark'  },
    { key:'auto',  icon:'⚙️', label:'Auto'  },
  ];
  const [open, setOpen] = useState(false);
  const current = options.find(o=>o.key===mode);
  return (
    <div className="theme-toggle" style={{position:'fixed',top:20,right:20,zIndex:300}}>
      <motion.button onClick={()=>setOpen(o=>!o)}
        whileHover={{scale:1.05}} whileTap={{scale:.95}}
        style={{width:40,height:40,borderRadius:'50%',border:`1px solid ${C.borderGold}`,
          background:C.isDark?'rgba(20,18,16,.88)':'rgba(245,240,232,.9)',
          backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:16,boxShadow:'0 2px 12px rgba(0,0,0,.2)',cursor:'pointer'}}>
        {current.icon}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-8,scale:.92}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:.92}}
            transition={{duration:.2}}
            style={{position:'absolute',top:48,right:0,background:C.isDark?'rgba(20,18,16,.97)':'rgba(245,240,232,.97)',
              border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',
              backdropFilter:'blur(20px)',boxShadow:'0 8px 32px rgba(0,0,0,.3)',minWidth:110}}>
            {options.map(o=>(
              <button key={o.key} onClick={()=>{setMode(o.key);setOpen(false);}}
                style={{width:'100%',padding:'10px 14px',background:mode===o.key?`${C.gold}22`:'transparent',
                  border:'none',borderBottom:`1px solid ${C.border}`,
                  display:'flex',alignItems:'center',gap:10,...ff.body,
                  fontSize:9,letterSpacing:'.2em',fontWeight:600,textTransform:'uppercase',
                  color:mode===o.key?C.gold:C.dim,cursor:'pointer',transition:'all .2s',textAlign:'left'}}>
                <span style={{fontSize:13}}>{o.icon}</span>{o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY PREVIEW (4-6 featured items for homepage)
═══════════════════════════════════════════════════════════════ */
const GalleryPreview = ({ onViewAll }) => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  // FIX: Fetch featured items from Supabase (admin uploads) and merge with static items
  const [liveItems, setLiveItems] = useState([]);
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    let cancelled = false;
    fetch(`${supabaseUrl}/rest/v1/gallery_items?is_featured=eq.true&select=*&order=created_at.desc`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      if (cancelled) return;
      const valid = (rows || []).filter(r => r.image_url && r.image_url.length > 0);
      setLiveItems(valid.map(r => ({
        id: r.id, gid: r.id,
        deity: r.title,
        metal: r.metal_type || '',
        cat: r.category || 'Gold Work',
        img: r.image_url,
        artisanNotes: r.artisan_notes || '',
        description: r.description || '',   // Caption set in admin panel
        isFeatured: r.is_featured || false,
        _isUploaded: true,
      })));
    })
    .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  // If there are featured uploaded items, show them first; otherwise use static seed
  const featured = liveItems.length > 0
    ? [...liveItems, ...GALLERY_IDOLS].slice(0, 6)
    : GALLERY_IDOLS.slice(0, 6);
  const [hov, setHov] = useState(null);

  return (
    <section id="gallery-preview" className="section-pad vmw-gallery-preview" style={{position:'relative',zIndex:2,background:C.bg2,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center',marginBottom:56}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Featured Masterpieces</span>
            <h2 style={{...ff.display,fontSize:'clamp(34px,5.8vw,70px)',lineHeight:.88,letterSpacing:'.04em',color:C.text,fontWeight:700,marginBottom:16}}>
              OUR <span style={{color:C.gold}}>SACRED</span><br/>CRAFTSMANSHIP
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:14,maxWidth:540,margin:'14px auto'}}>
              Handcrafted temple metalwork from our Sowcarpet workshop — each piece a prayer in gold, silver, and sacred alloy.
            </p>
          </div>
        </Reveal>

        {/* Premium Masonry Showcase */}
        <style>{`
          .preview-masonry { columns: 3; column-gap: 10px; margin-bottom: 48px; }
          .preview-masonry-item { break-inside: avoid; -webkit-column-break-inside: avoid; margin-bottom: 10px; position: relative; overflow: hidden; border-radius: 8px; border: 1px solid rgba(255,215,0,0.15); cursor: pointer; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s; }
          .preview-masonry-item:hover { transform: translateY(-4px); border-color: rgba(255,215,0,0.4); }
          .preview-masonry-item img { width: 100%; display: block; filter: sepia(8%); transition: transform 0.8s ease; }
          .preview-masonry-item:hover img { transform: scale(1.08); }
        `}</style>
        <div className="preview-masonry">
          {featured.map((idol,idx)=>{
            return (
            <motion.div 
              key={idol.id}
              initial={{opacity:0, y:30}}
              whileInView={{opacity:1, y:0}}
              viewport={{once:true, margin:"-50px"}}
              transition={{duration:0.6, delay:idx*0.1}}
              className="preview-masonry-item"
              onClick={() => { window.scrollTo({top:0,behavior:'instant'}); navigate('/gallery', { state: { activeId: idol.id } }); }}
              onHoverStart={()=>setHov(idol.id)} onHoverEnd={()=>setHov(null)}
              style={{background:C.bg1}}
            >
              <img src={idol.img} alt={idol.deity} />
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(14,11,8,0.9) 0%,transparent 60%)',pointerEvents:'none'}}/>
              <motion.div animate={{y:hov===idol.id?0:8, opacity:hov===idol.id?1:0.8}} transition={{duration:0.3}} style={{position:'absolute',bottom:0,left:0,right:0,padding:'24px 20px', zIndex:2, pointerEvents:'none'}}>
                <div className="pm-label" style={{...ff.display,fontSize:18,color:C.text,fontWeight:600,marginBottom:6,textShadow:'0 2px 10px rgba(0,0,0,0.8)'}}>{idol.deity}</div>
                <div className="pm-cat" style={{...ff.body,fontSize:10,color:C.gold,letterSpacing:'.2em',textTransform:'uppercase',fontWeight:700}}>{idol.cat}</div>
              </motion.div>
              <div className="pm-badge" style={{position:'absolute',top:16,left:16,padding:'6px 12px',background:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)',border:`1px solid rgba(255,215,0,0.3)`,borderRadius:4,color:C.gold,...ff.body,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',zIndex:2}}>{idol.metal}</div>
            </motion.div>
            );
          })}
        </div>

        {/* Call to action — View Full Gallery */}
        <Reveal delay={.15}>
          <div className="section-cta-row" style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',marginTop:44,paddingTop:40,borderTop:`1px solid ${C.border}`}}>
            <CurvyButton primary onClick={() => { window.scrollTo({top:0,behavior:'instant'}); navigate('/gallery'); }}>
              View Full Gallery
            </CurvyButton>
            <StarBorderButton onClick={() => setShowCommissionModal(true)} speed={6}>
              Commission Now
            </StarBorderButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE — lightweight landing with featured content
═══════════════════════════════════════════════════════════════ */
const HomePage = ({ scrolled }) => {
  const navigate = useNavigate();

  return (
    <>
      <Nav scrolled={scrolled}/>
      <Hero/>
      <Ticker/>
      <Legacy/>
      <TrustedByTemples/>
      <Services/>
      <Showcase/>
      <RealWorkPhotos/>
      <ProcessSection/>
      {/* Featured gallery preview instead of full gallery */}
      <GalleryPreview onViewAll={() => navigate('/gallery')}/>
      <Testimonials/>
      <FAQ/>
      <Archive/>
      <Contact/>
      <Footer/>
      <WAFab/>
      <MobileContactBar/>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   IMMERSIVE FEED — Instagram/TikTok Style Premium Gallery
═══════════════════════════════════════════════════════════════ */
const ImmersiveFeed = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const initialId = location.state?.activeId;
  
  // If we arrived with an activeId (from home/gallery card click), go straight to fullscreen
  const [immersiveMode, setImmersiveMode] = useState(initialId !== undefined && initialId !== null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // FIX: Fetch admin-uploaded items from Supabase and merge with static GALLERY_IDOLS
  // This ensures uploads from the admin dashboard appear in the gallery immediately
  const [liveItems, setLiveItems] = useState([]);
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    let cancelled = false;
    fetch(`${supabaseUrl}/rest/v1/gallery_items?select=*&order=created_at.desc`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      if (cancelled) return;
      const valid = (rows || []).filter(r => r.image_url && r.image_url.length > 0);
      const mapped = valid.map(r => ({
        id: r.id, gid: r.id,
        deity: r.title,                       // Title/caption set in admin
        metal: r.metal_type || '',
        purity: r.purity || '',
        dims: r.dimensions || '',
        stone: r.stone_type || '',
        duration: r.crafting_duration || '',
        origin: 'Sowcarpet',
        img: r.image_url,
        cat: r.category || 'Gold Work',
        artisanNotes: r.artisan_notes || '',
        description: r.description || '',     // Public caption editable in admin
        isFeatured: r.is_featured || false,
        _isUploaded: true,
      }));
      setLiveItems(mapped);
    })
    .catch(() => {});
    return () => { cancelled = true; };
  }, []); // runs once on mount; admin panel changes are picked up on next page load

  // Merge static + live items; deduplicate by image URL so seeded items never show twice
  const allIdols = useMemo(() => {
    const uploadedUrls = new Set(liveItems.map(i => i.img));
    const staticOnly = GALLERY_IDOLS.filter(i => !uploadedUrls.has(i.img));
    return [...staticOnly, ...liveItems];
  }, [liveItems]);

  // FIX: useMemo prevents a new array reference on every render, which was causing
  // the useEffect(,[activeIdx, filteredIdols]) to fire infinitely → screen freeze
  const filteredIdols = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    if (!q) return allIdols;
    return allIdols.filter(i =>
      i.deity.toLowerCase().includes(q) ||
      i.cat.toLowerCase().includes(q) ||
      i.metal.toLowerCase().includes(q)
    );
  }, [allIdols, searchQuery]);
  
  const initialIdx = initialId !== undefined ? filteredIdols.findIndex(i => i.id === initialId) : 0;
  const [activeIdx, setActiveIdx] = useState(Math.max(0, initialIdx));
  const containerRef = useRef(null);
  const didScrollRef = useRef(false);

  // Scroll to the correct photo immediately on mount — use requestAnimationFrame to ensure DOM is ready
  const activeIdxRef = useRef(activeIdx);
  useEffect(() => {
    if (!immersiveMode || didScrollRef.current) return;
    const scrollToIdx = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = activeIdxRef.current * window.innerHeight;
        didScrollRef.current = true;
      } else {
        requestAnimationFrame(scrollToIdx);
      }
    };
    requestAnimationFrame(scrollToIdx);
  }, [immersiveMode]); // intentionally runs only when immersiveMode changes

  // Load user state from localStorage + initialize with real counts
  const userState = getUserState();
  const [liked, setLiked] = useState(userState.likes);
  const [saved, setSaved] = useState(userState.saves);
  const [comments, setComments] = useState(userState.comments);
  const [likesCounts, setLikesCounts] = useState({});
  const [savesCounts, setSavesCounts] = useState({});
  const [realComments, setRealComments] = useState({});
  
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [detailPanelExpanded, setDetailPanelExpanded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [doubleTapGlow, setDoubleTapGlow] = useState(false);
  const [saveAnimMsg, setSaveAnimMsg] = useState(false);

  const { isLoggedIn, user, setShowAuthModal, setAuthAction, setShowCommissionModal } = useAppCtx();
  const userId = user?.id || 'guest';

  // Load real counts for active item
  // FIX: Depend on idol.id (primitive) not filteredIdols (new array ref each render)
  // and extract isLoggedIn/userId as stable refs to avoid re-firing on auth changes
  const activeIdolId = filteredIdols[activeIdx]?.id ?? null;
  const isLoggedInRef = useRef(isLoggedIn);
  const userIdRef = useRef(userId);
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  useEffect(() => {
    if (!activeIdolId) return;
    let cancelled = false;

    (async () => {
      const count = await getIdolLikesCount(activeIdolId);
      if (!cancelled) setLikesCounts(p => ({...p, [activeIdolId]: count}));
    })();

    (async () => {
      const count = await getIdolSavesCount(activeIdolId);
      if (!cancelled) setSavesCounts(p => ({...p, [activeIdolId]: count}));
    })();

    (async () => {
      const data = await getIdolComments(activeIdolId);
      if (!cancelled) setRealComments(p => ({...p, [activeIdolId]: data}));
    })();

    if (isLoggedInRef.current) {
      logViewEvent(activeIdolId, userIdRef.current);
    }

    return () => { cancelled = true; };
  }, [activeIdolId]); // only re-fire when the active item actually changes

  // FIX: Memoize scroll handler — prevents new function ref on every render
  const filteredIdolsLengthRef = useRef(filteredIdols.length);
  useEffect(() => { filteredIdolsLengthRef.current = filteredIdols.length; }, [filteredIdols.length]);

  const handleScroll = useCallback((e) => {
    const container = e.target;
    const itemHeight = window.innerHeight;
    const index = Math.round(container.scrollTop / itemHeight);
    if (index !== activeIdx && index >= 0 && index < filteredIdolsLengthRef.current) {
      setActiveIdx(index);
      setShowComments(false);
      setShowDetailPanel(false);
      setShowShareMenu(false);
    }
  }, [activeIdx]); // only activeIdx is read from closure

  // FIX: Stable reference for handleInteraction — reads isLoggedIn from ref
  const handleInteraction = useCallback((actionType) => {
    if (!isLoggedInRef.current) {
      setAuthAction(actionType);
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [setAuthAction, setShowAuthModal]); // context setters are stable

  const toggleLike = useCallback((id) => {
    if (handleInteraction('like')) {
      const isCurrentlyLiked = liked[id];
      // FIX: Update React state optimistically
      setLiked(p => ({...p, [id]: !isCurrentlyLiked}));
      // FIX: Update display count optimistically
      setLikesCounts(p => ({
        ...p,
        [id]: Math.max(0, (p[id] || 0) + (isCurrentlyLiked ? -1 : 1))
      }));
      // FIX: toggleIdolLike already handles localStorage + Supabase — don't double-write
      toggleIdolLike(id, userId, isCurrentlyLiked);
    }
  }, [liked, userId]); // stable deps — no filteredIdols reference

  const toggleSave = useCallback((id) => {
    if (handleInteraction('save')) {
      const isCurrentlySaved = saved[id];
      // FIX: Update React state optimistically
      setSaved(p => ({...p, [id]: !isCurrentlySaved}));
      // FIX: Update display count optimistically
      setSavesCounts(p => ({
        ...p,
        [id]: Math.max(0, (p[id] || 0) + (isCurrentlySaved ? -1 : 1))
      }));
      if (!isCurrentlySaved) {
        setSaveAnimMsg(true);
        setTimeout(() => setSaveAnimMsg(false), 2000);
      }
      // FIX: toggleIdolSave already handles localStorage + Supabase — don't double-write
      toggleIdolSave(id, userId, isCurrentlySaved);
    }
  }, [saved, userId]); // stable deps — no filteredIdols reference

  const postComment = useCallback((id) => {
    if (!handleInteraction('comment')) return;
    if (!commentInput.trim()) return;
    const text = commentInput.trim();
    const username = userIdRef.current !== 'guest' ? (userIdRef.current?.split?.('@')[0] || 'Guest') : 'Guest';
    // FIX: Optimistic UI update only — addIdolComment handles localStorage + Supabase
    setComments(p => ({
      ...p,
      [id]: [...(p[id] || []), {
        text, user: username, time: 'Just now', id: 'temp_' + Date.now()
      }]
    }));
    addIdolComment(id, userIdRef.current, text);
    setCommentInput('');
  }, [commentInput, handleInteraction]); // stable refs used for userId

  // FIX: Use a ref for liked so double-tap callback is always stable (no stale closure)
  const likedRef = useRef(liked);
  useEffect(() => { likedRef.current = liked; }, [liked]);

  const handleDoubleTap = useCallback((id) => {
    // Show glow animation regardless of login state
    setDoubleTapGlow(true);
    setTimeout(() => setDoubleTapGlow(false), 800);
    // Only like if logged in AND not already liked (prevent double-fire)
    if (isLoggedInRef.current && !likedRef.current[id]) {
      setLiked(p => ({...p, [id]: true}));
      setLikesCounts(p => ({...p, [id]: (p[id] || 0) + 1}));
      // toggleIdolLike handles localStorage + Supabase
      toggleIdolLike(id, userIdRef.current, false);
    }
  }, []); // empty deps — reads from refs, never stale

  const activeItem = filteredIdols[activeIdx];

  // Icons
  const IconHeart = ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#FFD700' : 'none'} stroke={filled ? '#FFD700' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
  const IconComment = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );
  const IconBookmark = ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#FFD700' : 'none'} stroke={filled ? '#FFD700' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );
  const IconShare = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050402',
      // NO overflow:hidden — this traps scroll inside child containers
      color: '#fff',
      zIndex: 2000,
    }}>
      {/* Floating Search Bar — solid background on mobile avoids GPU-intensive backdrop-filter on scroll */}
      <motion.div
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0.1 }}
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 0px)',
          left: 0, right: 0,
          zIndex: 160,
          display: 'flex',
          justifyContent: 'center',
          padding: '10px 16px 6px',
          // Solid background is faster on mobile than blur — same visual result
          background: 'linear-gradient(to bottom, rgba(5,4,2,0.97) 60%, transparent 100%)',
          pointerEvents: isSearchOpen || !immersiveMode ? 'auto' : 'none',
        }}
      >
        <div style={{
          background: isSearchOpen ? 'rgba(22,18,14,0.96)' : 'rgba(22,18,14,0.7)',
          border: `1px solid ${isSearchOpen ? 'rgba(255,215,0,0.4)' : 'rgba(255,215,0,0.15)'}`,
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          padding: '9px 16px',
          width: isSearchOpen ? '100%' : 'auto',
          maxWidth: 520,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.7)" strokeWidth="2" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => setIsSearchOpen(true)}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {isSearchOpen ? (
            <>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search deity, metal, category…"
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', flex: 1, fontFamily: "'Jost', sans-serif", fontSize: 14, letterSpacing: '0.04em', minWidth: 0 }}
                onBlur={() => !searchQuery && setIsSearchOpen(false)}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0, touchAction: 'manipulation' }}>×</button>
              )}
            </>
          ) : (
            <span onClick={() => setIsSearchOpen(true)} style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(255,215,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>Search</span>
          )}
        </div>
      </motion.div>

      {!immersiveMode ? (
        /* ═══════════════════════════════════════════════════════
           PREMIUM MASONRY GALLERY
           Mobile-first: 2 col on phones, 3 col on tablets/desktop
           Pinterest + Luxury Portfolio aesthetic on ALL devices
        ═══════════════════════════════════════════════════════ */
        <div style={{
          height: '100vh',
          width: '100vw',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // iOS momentum scroll
          overscrollBehavior: 'contain',
          paddingTop: 80, // space for floating search bar
          paddingBottom: 100, // space for bottom nav
          boxSizing: 'border-box',
        }}>
          <style>{`
            /* ── Masonry grid ── */
            .vmw-masonry {
              column-count: 2;
              column-gap: 8px;
              padding: 0 10px 16px;
              margin: 0 auto;
            }
            @media (min-width: 600px) {
              .vmw-masonry {
                column-count: 3;
                column-gap: 12px;
                padding: 0 16px 24px;
                max-width: 900px;
              }
            }
            @media (min-width: 1024px) {
              .vmw-masonry {
                column-count: 3;
                column-gap: 20px;
                padding: 0 32px 40px;
                max-width: 1400px;
              }
            }
            @media (min-width: 1400px) {
              .vmw-masonry {
                column-count: 4;
                column-gap: 24px;
                max-width: 1600px;
              }
            }

            /* ── Masonry card ── */
            .vmw-card {
              break-inside: avoid;
              -webkit-column-break-inside: avoid;
              margin-bottom: 8px;
              position: relative;
              border-radius: 10px;
              overflow: hidden;
              cursor: pointer;
              border: 1px solid rgba(255,215,0,0.12);
              background: rgba(14,11,8,0.8);
              display: block;
              /* GPU compositing layer — prevents paint thrashing on scroll */
              will-change: transform;
              transform: translateZ(0);
            }
            @media (min-width: 600px) {
              .vmw-card { margin-bottom: 12px; border-radius: 12px; }
            }
            @media (min-width: 1024px) {
              .vmw-card { margin-bottom: 20px; border-radius: 16px; }
            }

            /* ── Card image ── */
            .vmw-card img {
              width: 100%;
              display: block;
              /* Natural aspect ratio — no crop, no stretch */
              height: auto;
              object-fit: cover;
              /* Slight warmth filter matching the luxury aesthetic */
              filter: sepia(5%) brightness(0.96);
              transition: transform 0.6s ease, filter 0.4s ease;
            }
            /* Hover only on pointer devices — no ghost hover on mobile */
            @media (hover: hover) {
              .vmw-card:hover { border-color: rgba(255,215,0,0.4); }
              .vmw-card:hover img { transform: scale(1.06); filter: sepia(8%) brightness(1.02); }
            }
            /* Touch active state for mobile */
            .vmw-card:active { opacity: 0.88; }

            /* ── Card overlay text ── */
            .vmw-card-overlay {
              position: absolute;
              bottom: 0; left: 0; right: 0;
              background: linear-gradient(to top, rgba(5,3,1,0.96) 0%, rgba(0,0,0,0.5) 55%, transparent 100%);
              padding: 28px 12px 12px;
              pointer-events: none;
            }
            @media (min-width: 600px) {
              .vmw-card-overlay { padding: 36px 16px 14px; }
            }
            @media (min-width: 1024px) {
              .vmw-card-overlay { padding: 44px 20px 18px; }
            }

            /* ── Card title ── */
            .vmw-card-title {
              font-family: 'Cinzel', serif;
              font-size: 12px;
              font-weight: 600;
              color: #FFD700;
              margin: 0 0 3px;
              text-shadow: 0 1px 6px rgba(0,0,0,0.9);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            @media (min-width: 600px) { .vmw-card-title { font-size: 14px; } }
            @media (min-width: 1024px) { .vmw-card-title { font-size: 17px; margin-bottom: 5px; } }

            /* ── Card subtitle ── */
            .vmw-card-sub {
              font-family: 'Jost', sans-serif;
              font-size: 8px;
              font-weight: 600;
              color: rgba(255,255,255,0.6);
              text-transform: uppercase;
              letter-spacing: 0.12em;
              margin: 0;
            }
            @media (min-width: 600px) { .vmw-card-sub { font-size: 9px; } }
            @media (min-width: 1024px) { .vmw-card-sub { font-size: 11px; } }

            /* ── Metal badge ── */
            .vmw-card-badge {
              position: absolute;
              top: 10px; left: 10px;
              padding: 3px 7px;
              background: rgba(0,0,0,0.55);
              backdrop-filter: blur(6px);
              -webkit-backdrop-filter: blur(6px);
              border: 1px solid rgba(255,215,0,0.3);
              border-radius: 4px;
              color: #FFD700;
              font-family: 'Jost', sans-serif;
              font-size: 7px;
              font-weight: 700;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              pointer-events: none;
              /* Limit badge length on narrow cards */
              max-width: calc(100% - 20px);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            @media (min-width: 600px) { .vmw-card-badge { font-size: 8px; padding: 4px 8px; top: 12px; left: 12px; } }
            @media (min-width: 1024px) { .vmw-card-badge { font-size: 9px; padding: 5px 10px; top: 14px; left: 14px; } }

            /* ── Empty state ── */
            .vmw-empty {
              grid-column: 1 / -1;
              text-align: center;
              padding: 80px 24px;
              color: rgba(255,255,255,0.3);
              font-family: 'Cormorant Garamond', serif;
              font-size: 20px;
              font-style: italic;
            }

            /* ── Masonry section heading ── */
            .vmw-gallery-heading {
              text-align: center;
              padding: 8px 16px 24px;
            }
            .vmw-gallery-heading h1 {
              font-family: 'Cinzel', serif;
              font-size: clamp(22px, 6vw, 48px);
              color: #FFD700;
              margin: 0 0 6px;
              font-weight: 700;
              letter-spacing: 0.04em;
            }
            .vmw-gallery-heading p {
              font-family: 'Cormorant Garamond', serif;
              font-size: clamp(13px, 3vw, 16px);
              color: rgba(255,255,255,0.55);
              font-style: italic;
              margin: 0;
            }
          `}</style>

          {/* Gallery heading */}
          <div className="vmw-gallery-heading">
            <h1>Sacred Craftsmanship</h1>
            <p>Handcrafted temple metalwork · Sowcarpet, Chennai · Est. 1915</p>
          </div>

          {/* Masonry grid */}
          <div className="vmw-masonry" style={{ margin: '0 auto' }}>
            {filteredIdols.length === 0 ? (
              <div className="vmw-empty">No masterpieces found for "{searchQuery}"</div>
            ) : (
              filteredIdols.map((idol, i) => (
                <div
                  key={idol.gid || idol.id}
                  className="vmw-card"
                  onClick={() => {
                    setActiveIdx(i);
                    didScrollRef.current = false;
                    setImmersiveMode(true);
                  }}
                >
                  {/* Lazy-loaded image preserving natural aspect ratio */}
                  <img
                    src={idol.img}
                    alt={idol.deity}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Gradient overlay + text */}
                  <div className="vmw-card-overlay">
                    <div className="vmw-card-title">{idol.deity}</div>
                    <p className="vmw-card-sub">{idol.cat}</p>
                  </div>

                  {/* Metal badge */}
                  <div className="vmw-card-badge">{idol.metal}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════
           IMMERSIVE FULLSCREEN VIEWER
           Instagram/TikTok style — fires ONLY when card clicked
        ═══════════════════════════════════════════════════════ */
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            position: 'fixed', // fixed on mobile prevents body scroll interference
            inset: 0,
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollSnapType: 'y mandatory',
            // NO scrollBehavior:'smooth' — it conflicts with scroll snapping on iOS
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y', // iOS needs explicit touch-action for snap scroll
            overscrollBehavior: 'none',
          }}
        >
          {/* Back button — mobile safe area aware */}
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            onClick={() => {
              setImmersiveMode(false);
              setShowDetailPanel(false);
              setShowComments(false);
              setShowShareMenu(false);
            }}
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 16px) + 16px)',
              left: 16,
              zIndex: 200,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '50%',
              width: 44, height: 44,
              color: '#FFD700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'manipulation',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </motion.button>

          {filteredIdols.map((idol, idx) => (
            <div
              key={idol.gid || idol.id}
              onDoubleClick={() => handleDoubleTap(idol.gid)}
              style={{
                height: '100dvh', // dynamic viewport height — fixes iOS Safari chrome offset
                width: '100vw',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always', // forces one-at-a-time snap
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Background blur — pointerEvents:none prevents gesture steal */}
              <img
                src={idol.img}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(50px) brightness(0.22)', transform: 'scale(1.15)', pointerEvents: 'none' }}
                alt=""
                loading={Math.abs(idx - activeIdx) > 2 ? 'lazy' : 'eager'}
              />

              {/* Main cinema image — contained, never cropped */}
              <motion.img
                src={idol.img}
                alt={idol.deity}
                loading={Math.abs(idx - activeIdx) > 2 ? 'lazy' : 'eager'}
                initial={{ scale: 1.04 }}
                animate={{ scale: idx === activeIdx ? 1 : 1.04 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'relative',
                  maxWidth: 'min(88vw, 540px)',
                  maxHeight: 'min(72vh, 640px)',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  zIndex: 1,
                  filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.92))',
                  borderRadius: 10,
                  pointerEvents: 'none',
                }}
              />

              {/* Double-tap glow — pointerEvents:none */}
              <AnimatePresence>
                {doubleTapGlow && idx === activeIdx && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    style={{ position: 'absolute', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}
                  >
                    <IconHeart filled />
                    <div style={{ position: 'absolute', inset: -24, background: 'radial-gradient(circle, rgba(255,215,0,0.55) 0%, transparent 70%)', filter: 'blur(12px)', pointerEvents: 'none' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved toast — pointerEvents:none */}
              <AnimatePresence>
                {saveAnimMsg && idx === activeIdx && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    style={{ position: 'absolute', top: '18%', background: 'rgba(255,215,0,0.14)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,215,0,0.5)', color: '#FFD700', padding: '10px 20px', borderRadius: 28, zIndex: 50, fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}
                  >
                    <IconBookmark filled /> Saved to Collection
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom gradient — pointerEvents:none */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />

              {/* LEFT: Title + subtitle + View More */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
                left: 16,
                right: 80, // leave room for right-side action buttons
                zIndex: 3,
                pointerEvents: 'auto', // buttons need to be tappable
              }}>
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: idx === activeIdx ? 1 : 0, x: idx === activeIdx ? 0 : -24 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.28)', padding: '4px 8px', borderRadius: 5, fontSize: 8, textTransform: 'uppercase', color: '#FFD700', letterSpacing: '0.14em', fontWeight: 700, backdropFilter: 'blur(6px)' }}>{idol.cat}</span>
                    <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', padding: '4px 8px', borderRadius: 5, fontSize: 8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.14em', fontWeight: 600, backdropFilter: 'blur(6px)' }}>{idol.metal}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(20px, 5.5vw, 38px)', margin: '0 0 6px', color: '#FFD700', textShadow: '0 3px 10px rgba(0,0,0,0.95)', fontWeight: 600, lineHeight: 1.1 }}>{idol.deity}</h2>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(13px, 3.5vw, 16px)', color: 'rgba(255,255,255,0.8)', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.9)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {idol.artisanNotes ? idol.artisanNotes.slice(0, 72) + '…' : 'Sacred craftsmanship · Sowcarpet workshop'}
                  </p>
                  <button
                    onClick={() => setShowDetailPanel(true)}
                    style={{ background: 'none', border: 'none', color: '#FFD700', fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: 0.85, touchAction: 'manipulation' }}
                  >
                    View More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </motion.div>
              </div>

              {/* RIGHT: Action buttons — gid-keyed, safe-area aware */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
                right: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                alignItems: 'center',
                zIndex: 3,
              }}>
                {[
                  { key: 'like',    icon: <IconHeart filled={!!liked[idol.gid]}/>,    count: likesCounts[idol.gid] ?? '0', action: () => toggleLike(idol.gid),    active: !!liked[idol.gid] },
                  { key: 'comment', icon: <IconComment/>,                              count: (realComments[idol.gid]?.length ?? 0) || '0', action: () => setShowComments(true), active: false },
                  { key: 'save',    icon: <IconBookmark filled={!!saved[idol.gid]}/>, count: savesCounts[idol.gid] ?? '0', action: () => toggleSave(idol.gid),    active: !!saved[idol.gid] },
                  { key: 'share',   icon: <IconShare/>,                               count: 'Share',                      action: () => setShowShareMenu(true),  active: false },
                ].map((btn, i) => (
                  <motion.div
                    key={btn.key}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: idx === activeIdx ? 1 : 0, x: idx === activeIdx ? 0 : 24 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={btn.action}
                      style={{
                        background: 'none', border: 'none',
                        color: btn.active ? '#FFD700' : 'rgba(255,255,255,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 8,
                        touchAction: 'manipulation',
                        // Minimum 44×44 touch target per Apple HIG
                        minWidth: 44, minHeight: 44,
                        filter: btn.active ? 'drop-shadow(0 0 6px rgba(255,215,0,0.7))' : 'none',
                        transition: 'color 0.25s, filter 0.25s',
                      }}
                    >
                      {btn.icon}
                    </motion.button>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', userSelect: 'none' }}>{btn.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL PANEL — Bottom sheet on mobile, side panel on desktop */}
      <AnimatePresence>
        {showDetailPanel && activeItem && (
          <>
            {/* Backdrop for mobile bottom-sheet dismiss */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDetailPanel(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 148, background: 'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                maxHeight: '80vh',
                background: 'linear-gradient(180deg, rgba(22,18,14,0.98) 0%, rgba(12,9,6,1) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(255,215,0,0.2)',
                borderRadius: '28px 28px 0 0',
                zIndex: 149,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
                boxShadow: '0 -24px 80px rgba(0,0,0,0.8)',
              }}
            >
              {/* Drag handle */}
              <div style={{ width: 40, height: 4, background: 'rgba(255,215,0,0.3)', borderRadius: 2, margin: '16px auto 0', flexShrink: 0 }} />

              <div style={{ padding: '20px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(18px, 5vw, 26px)', color: '#FFD700', margin: '0 0 6px' }}>{activeItem.deity}</h2>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', margin: 0 }}>Sacred craftsmanship · Sowcarpet</p>
                </div>
                <button
                  onClick={() => setShowDetailPanel(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 28, cursor: 'pointer', lineHeight: 1, flexShrink: 0, padding: 4, touchAction: 'manipulation' }}
                >×</button>
              </div>

              {/* Metadata grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 24px', borderTop: '1px solid rgba(255,215,0,0.1)' }}>
                {[
                  { l: 'Material', v: activeItem.metal },
                  { l: 'Category', v: activeItem.cat },
                  { l: 'Crafting Time', v: '45–60 Days' },
                  { l: 'Origin', v: 'Sowcarpet, Chennai' },
                  { l: 'Technique', v: 'Lost Wax Casting' },
                  { l: 'Purity', v: 'Certified' },
                ].map(d => (
                  <div key={d.l} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,215,0,0.08)' }}>
                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(255,215,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 3, fontWeight: 700 }}>{d.l}</div>
                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: '#FFF' }}>{d.v || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Artisan notes */}
              {activeItem.artisanNotes && (
                <div style={{ padding: '0 24px 16px', borderTop: '1px solid rgba(255,215,0,0.1)', paddingTop: 16 }}>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(255,215,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, fontWeight: 700 }}>Artisan Notes</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{activeItem.artisanNotes}</p>
                </div>
              )}

              {/* Commission CTA */}
              <div style={{ padding: '16px 24px' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowDetailPanel(false); setShowCommissionModal(true); }}
                  style={{ width: '100%', padding: '16px 24px', background: 'linear-gradient(135deg, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.08) 100%)', border: '1px solid rgba(255,215,0,0.45)', borderRadius: 12, color: '#FFD700', fontFamily: "'Jost', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, touchAction: 'manipulation' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Commission This Piece
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SHARE MENU — position:fixed works on all mobile contexts */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 480, background: 'rgba(18,14,10,0.99)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '24px 24px 0 0', padding: '24px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', boxShadow: '0 -12px 48px rgba(0,0,0,0.8)' }}
            >
              <div style={{ width: 36, height: 4, background: 'rgba(255,215,0,0.25)', borderRadius: 2, margin: '0 auto 20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,215,0,0.85)', fontWeight: 700 }}>Share This Piece</span>
                <button onClick={() => setShowShareMenu(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 24, cursor: 'pointer', touchAction: 'manipulation' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Copy Link', icon: '🔗', action: () => { navigator.clipboard?.writeText(window.location.href); setShowShareMenu(false); } },
                  { label: 'WhatsApp', icon: '💬', action: () => window.open(`https://wa.me/?text=${encodeURIComponent((activeItem?.deity || '') + ' — ' + window.location.href)}`) },
                  { label: 'Instagram', icon: '📸', action: () => {} },
                  { label: 'Pinterest', icon: '📌', action: () => {} },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={p.action}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#FFF', touchAction: 'manipulation' }}
                  >
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURY COMMENT DRAWER */}
      <AnimatePresence>
        {showComments && activeItem && (
          <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65vh', background: 'rgba(15, 12, 10, 0.85)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,215,0,0.15)', borderRadius: '32px 32px 0 0', zIndex: 150, display: 'flex', flexDirection: 'column', boxShadow: '0 -24px 80px rgba(0,0,0,0.8)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><IconComment/><h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Jost', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FFD700' }}>Admirations</h3></div>
              <button onClick={() => setShowComments(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 28, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              {((realComments[activeItem.gid] || []).concat(comments[activeItem.gid] || [])).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 60, fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic' }}>A silent admiration.<br/>Be the first to share your thoughts.</div>
              ) : (
                ((realComments[activeItem.gid] || []).concat(comments[activeItem.gid] || [])).map((c, i) => (
                  <div key={c.id || i} style={{ marginBottom: 18, display: 'flex', gap: 12, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: 15, flexShrink: 0 }}>{(c.user || 'A')[0]}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF', fontFamily: "'Jost', sans-serif" }}>{c.user}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Jost', sans-serif" }}>{c.time || (c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '')}</div>
                      </div>
                      <div style={{ fontSize: 14, fontFamily: "'Cormorant Garamond', serif", color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontStyle: 'italic' }}>{c.text || c.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.6)', display: 'flex', gap: 10, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && postComment(activeItem.gid)}
                placeholder="Share your admiration..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 24, padding: '12px 16px', color: '#fff', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: 14 }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => postComment(activeItem.gid)}
                style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 24, padding: '0 18px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0, touchAction: 'manipulation' }}
              >Post</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION — position:fixed, always visible on masonry + immersive */}
      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0.15 }}
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 150,
          background: 'linear-gradient(to top, rgba(4,3,2,0.99) 0%, rgba(8,6,4,0.92) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,215,0,0.1)',
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          // Dynamic height: nav content + safe area
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingTop: 8,
          paddingLeft: 4,
          paddingRight: 4,
          minHeight: 64,
        }}
      >
        {[
          {
            l: 'Home',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
            action: () => navigate('/'),
          },
          {
            l: 'Search',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
            action: () => setIsSearchOpen(true),
          },
          null, // centre slot = Enquire pill
          {
            l: 'Saved',
            icon: <IconBookmark filled={false}/>,
            action: () => setShowProfile(true),
          },
          {
            l: 'Profile',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            action: () => setShowProfile(true),
          },
        ].map((btn, i) => {
          if (btn === null) {
            // Central Enquire pill — lifted above nav bar
            return (
              <motion.button
                key="enquire"
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowCommissionModal(true)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.95) 0%, rgba(195,148,0,1) 100%)',
                  border: 'none',
                  borderRadius: 32,
                  height: 46,
                  padding: '0 18px',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontFamily: "'Jost', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: 11,
                  boxShadow: '0 4px 20px rgba(255,215,0,0.35), 0 2px 8px rgba(0,0,0,0.6)',
                  transform: 'translateY(-12px)',
                  touchAction: 'manipulation',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>Enquire</span>
              </motion.button>
            );
          }
          return (
            <motion.button
              key={btn.l}
              whileTap={{ scale: 0.88 }}
              onClick={btn.action}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                cursor: 'pointer',
                padding: '6px 8px',
                minWidth: 44,
                minHeight: 44,
                touchAction: 'manipulation',
                transition: 'color 0.2s',
              }}
              onTouchStart={e => e.currentTarget.style.color = '#FFD700'}
              onTouchEnd={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            >
              {btn.icon}
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{btn.l}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} C={C} />}
      </AnimatePresence>
    </div>
  );
};

const GalleryPage = ({ scrolled }) => {
  const location = useLocation();
  const initialId = location.state?.activeId;

  // Scroll to top only when entering masonry view (no specific image selected)
  useEffect(() => {
    if (!initialId) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [initialId]);

  // ImmersiveFeed is self-contained: shows masonry or immersive viewer
  // based on location.state.activeId — no Nav/Footer needed
  return <ImmersiveFeed />;
};

/* ═══════════════════════════════════════════════════════════════
   PROFILE MODAL - INSTAGRAM / LUXURY PORTFOLIO STYLE
═══════════════════════════════════════════════════════════════ */
const ProfileModal = ({ onClose, C }) => {
  const { user, setIsLoggedIn, setUser, setShowAuthModal } = useAppCtx();
  const [activeTab, setActiveTab] = useState('Saved');
  const tabs = ['Saved', 'Liked', 'Collections'];
  
  const isGuest = !user;
  const username = user?.email?.split('@')[0] || 'Guest Collector';
  const avatar = user?.user_metadata?.avatar_url || (isGuest ? '/gallery/gold/crown.jpg' : `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:'fixed',inset:0,zIndex:3000,background:'rgba(0,0,0,0.92)',backdropFilter:'blur(24px)',display:'flex',justifyContent:'center',alignItems:'center',padding:20}}
      onClick={onClose}>
      <motion.div initial={{scale:0.97,y:20,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:0.97,y:10,opacity:0}}
        onClick={e=>e.stopPropagation()}
        style={{width:'100%',maxWidth:800,maxHeight:'90vh',display:'flex',flexDirection:'column',background:C.bg1,border:`1px solid ${C.border}`,borderRadius:24,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.8)'}}>
        
        {/* Profile Header */}
        <div style={{padding:'40px 48px',display:'flex',alignItems:'center',gap:32,borderBottom:`1px solid ${C.border}`,position:'relative', flexWrap:'wrap'}}>
          <button onClick={onClose} style={{position:'absolute',top:24,right:24,background:'none',border:'none',color:C.dim,fontSize:24,cursor:'pointer'}}>×</button>
          
          <div style={{position:'relative',width:110,height:110,flexShrink:0}}>
            <div style={{position:'absolute',inset:-4,borderRadius:'50%',background:C.goldGrad,animation:'starBorderSpin 8s linear infinite'}}/>
            <div style={{position:'absolute',inset:0,borderRadius:'50%',background:C.bg1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,border:`4px solid ${C.bg1}`}}>
              <img src={avatar} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} alt="Avatar" />
            </div>
          </div>
          
          <div style={{flex:1, minWidth:200}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:12, flexWrap:'wrap'}}>
              <h2 style={{...ff.display,fontSize:28,color:C.text,margin:0}}>{username}</h2>
              <button style={{padding:'6px 16px',background:'transparent',border:`1px solid ${C.borderHi}`,color:C.text,borderRadius:4,...ff.body,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={() => { if(isGuest) { setShowAuthModal(true); onClose(); } }}>{isGuest ? 'Sign In' : 'Edit Profile'}</button>
              {!isGuest && <button style={{padding:'6px 16px',background:'transparent',border:'1px solid rgba(255,80,80,0.4)',color:'rgba(255,100,100,0.9)',borderRadius:4,...ff.body,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={() => { localStorage.removeItem('vmw_session'); setIsLoggedIn(false); setUser(null); onClose(); }}>Sign Out</button>}
            </div>
            
            <div style={{display:'flex',gap:24,marginBottom:16,...ff.body,fontSize:14}}>
              {(() => {
                const us = getUserState();
                const likedCount = Object.values(us.likes).filter(Boolean).length;
                const savedCount = Object.values(us.saves).filter(Boolean).length;
                return (<>
                  <div><strong style={{color:C.text}}>0</strong> <span style={{color:C.dim}}>posts</span></div>
                  <div><strong style={{color:C.text}}>{savedCount}</strong> <span style={{color:C.dim}}>saved</span></div>
                  <div><strong style={{color:C.text}}>{likedCount}</strong> <span style={{color:C.dim}}>liked</span></div>
                </>);
              })()}
            </div>
            
            <div style={{...ff.body,fontSize:14,color:C.text}}>
              <div style={{fontWeight:600,marginBottom:2}}>Sacred Art Enthusiast</div>
              <div style={{color:C.dim,maxWidth:300}}>Curating fine handcrafted temple metalworks. Chennai, India.</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',justifyContent:'center',borderBottom:`1px solid ${C.border}`,gap:48}}>
          {tabs.map((tab)=>(
            <div key={tab} onClick={() => setActiveTab(tab)}
              style={{padding:'16px 0',...ff.body,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:activeTab===tab?700:500,color:activeTab===tab?C.gold:C.dim,borderTop:activeTab===tab?`1px solid ${C.gold}`:'1px solid transparent',cursor:'pointer',position:'relative',top:-1}}>
              {tab}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div style={{flex:1,overflowY:'auto',padding:24,background:C.bg2,minHeight:300}}>
          {(() => {
            const userState = getUserState();
            const likedGids = Object.entries(userState.likes).filter(([,v])=>v).map(([k])=>k);
            const savedGids = Object.entries(userState.saves).filter(([,v])=>v).map(([k])=>k);
            
            let displayItems = [];
            if (activeTab === 'Liked') {
              displayItems = GALLERY_IDOLS.filter(i => likedGids.includes(i.gid));
            } else if (activeTab === 'Saved') {
              displayItems = GALLERY_IDOLS.filter(i => savedGids.includes(i.gid));
            }

            if (displayItems.length === 0) {
              return (
                <div style={{textAlign:'center',padding:'60px 0',color:C.faint,...ff.serif,fontSize:18,fontStyle:'italic'}}>
                  {activeTab === 'Liked' ? 'No liked pieces yet. Tap ❤️ on any gallery item.' : activeTab === 'Saved' ? 'No saved pieces yet. Sign in and tap 📌 to save.' : 'Collections coming soon.'}
                </div>
              );
            }

            return (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8}}>
                {displayItems.map(idol => (
                  <div key={idol.gid} style={{aspectRatio:'1/1',overflow:'hidden',borderRadius:8,border:`1px solid ${C.border}`,position:'relative',cursor:'pointer'}}>
                    <img src={idol.img} alt={idol.deity} style={{width:'100%',height:'100%',objectFit:'cover',filter:'sepia(8%)'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)',display:'flex',alignItems:'flex-end',padding:'10px 12px'}}>
                      <div style={{...ff.body,fontSize:11,color:'#fff',fontWeight:600,lineHeight:1.3}}>{idol.deity}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMMISSION MODAL
═══════════════════════════════════════════════════════════════ */
const CommissionModal = ({ onClose, C }) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      const files = e.target.querySelector('input[type="file"]').files;
      
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      let imageUrls = [];
      
      // If we have Supabase configured, do the real upload
      if (supabaseUrl && supabaseKey) {
        // Upload images to inquiry_references bucket
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${i}.${fileExt}`;
          const res = await fetch(`${supabaseUrl}/storage/v1/object/inquiry_references/${fileName}`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': file.type
            },
            body: file
          });
          if (res.ok) {
            imageUrls.push(fileName);
          }
        }
        
        // Insert record into inquiries
        const payload = {
          full_name: data.fullName || '',
          phone: data.phone || '',
          email: data.email || '',
          whatsapp: data.whatsapp || data.phone || '',
        };

        // Safely add extra fields as a JSON note if the columns don't exist
        // (safe fallback: store extras in a note/description column if present)
        const extraInfo = [
          data.artworkType ? `Type: ${data.artworkType}` : '',
          data.metal ? `Metal: ${data.metal}` : '',
          data.budget ? `Budget: ${data.budget}` : '',
          data.timeline ? `Timeline: ${data.timeline}` : '',
          data.description || '',
        ].filter(Boolean).join('\n');

        // Try inserting with all fields first, fall back to minimal if it fails
        let insertPayload = { ...payload };
        // Add optional columns only if your schema has them:
        if (data.artworkType) insertPayload.artwork_type = data.artworkType;
        if (data.metal) insertPayload.preferred_metal = data.metal;
        if (data.budget) insertPayload.budget = data.budget;
        if (data.timeline) insertPayload.timeline = data.timeline;
        if (data.description) insertPayload.description = data.description;
        if (imageUrls.length > 0) insertPayload.reference_images = imageUrls;
        insertPayload.status = 'pending';
        insertPayload.notes = extraInfo;

        const insertRes = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(insertPayload)
        });
        if (!insertRes.ok) {
          // Try minimal payload if extended failed (column mismatch)
          const errText = await insertRes.text();
          console.warn('Full insert failed, trying minimal payload:', errText);
          const minimalRes = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
          });
          if (!minimalRes.ok) {
            const minErrText = await minimalRes.text();
            throw new Error(`Submission failed: ${minErrText}`);
          }
        }
      } else {
        // Simulate network request if env vars not set yet
        await new Promise(r => setTimeout(r, 1500));
        console.log("Mock Supabase Submit", data, files);
      }
      
      setSubmitting(false);
      setDone(true);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:'fixed',inset:0,zIndex:3000,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(20px)',display:'flex',justifyContent:'center',alignItems:'center',padding:20}}
      onClick={onClose}>
      <motion.div initial={{scale:0.95,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,y:20}}
        onClick={e=>e.stopPropagation()}
        style={{width:'100%',maxWidth:650,maxHeight:'90vh',overflowY:'auto',background:C.bg1,border:`1px solid ${C.border}`,borderRadius:24,boxShadow:'0 24px 60px rgba(0,0,0,0.8)'}}>
        
        {!done ? (
          <>
            <div style={{padding:'32px 32px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h2 style={{...ff.display,fontSize:24,color:C.gold,margin:0}}>Commission Request</h2>
                <p style={{...ff.body,fontSize:14,color:C.dim,margin:'4px 0 0'}}>Begin your sacred project with us.</p>
              </div>
              <button onClick={onClose} style={{background:'none',border:'none',color:C.dim,fontSize:24,cursor:'pointer'}}>×</button>
            </div>
            <form onSubmit={submit} style={{padding:32,display:'flex',flexDirection:'column',gap:20}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                <input name="fullName" required placeholder="Full Name" style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14}}/>
                <input name="phone" required placeholder="Phone Number" style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                <input name="email" required type="email" placeholder="Email Address" style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14}}/>
                <input name="whatsapp" placeholder="WhatsApp Number (Optional)" style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <select name="artworkType" required style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14,appearance:'none'}}>
                  <option value="" disabled selected>Artwork Type</option>
                  <option value="idol">Idol / Vigraham</option>
                  <option value="crown">Crown / Kireedam</option>
                  <option value="prabhavali">Prabhavali</option>
                  <option value="other">Other</option>
                </select>
                <select name="metal" required style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14,appearance:'none'}}>
                  <option value="" disabled selected>Preferred Metal</option>
                  <option value="gold">24K Gold</option>
                  <option value="silver">Silver</option>
                  <option value="panchaloha">Panchaloha</option>
                  <option value="brass">Brass</option>
                </select>
                <input name="budget" placeholder="Budget Estimate" style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14}}/>
                <input name="timeline" placeholder="Expected Timeline (e.g., 3 months)" style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14}}/>
              </div>
              <textarea name="description" required placeholder="Project Description & Temple Details (Dimensions, specifications, history)..." rows={4} style={{width:'100%',padding:'14px 16px',background:C.surfaceWarm,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,...ff.body,fontSize:14,resize:'vertical'}}/>
              
              <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:C.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)', border:`1px dashed ${C.border}`, borderRadius:8}}>
                <div style={{fontSize:20}}>📎</div>
                <div style={{flex:1}}>
                  <div style={{...ff.body, fontSize:13, color:C.text, fontWeight:600}}>Attach Reference Images</div>
                  <div style={{...ff.body, fontSize:11, color:C.dim}}>Upload sketches or existing idols (Max 3 files)</div>
                </div>
                <input type="file" multiple accept="image/*" style={{width:100, fontSize:11, color:C.dim}}/>
              </div>
              
              <button type="submit" disabled={submitting}
                style={{marginTop:10,padding:'16px',background:C.goldGrad,color:'#000',border:'none',borderRadius:8,...ff.body,fontSize:14,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:submitting?'not-allowed':'pointer'}}>
                {submitting ? 'Connecting to Supabase...' : 'Submit Commission Request'}
              </button>
            </form>
          </>
        ) : (
          <div style={{padding:60,textAlign:'center'}}>
            <motion.div initial={{scale:0}} animate={{scale:1, rotate:360}} transition={{type:'spring', stiffness:200, damping:20}} style={{fontSize:60,marginBottom:20}}>✨</motion.div>
            <h2 style={{...ff.display,fontSize:28,color:C.gold,margin:'0 0 16px 0'}}>Commission Received</h2>
            <p style={{...ff.body,fontSize:16,color:C.dim,lineHeight:1.6}}>Our master craftsmen will review your sacred project and contact you shortly.</p>
            <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:32}}>
              <button onClick={onClose} style={{padding:'14px 32px',background:C.goldGrad,border:'none',color:'#000',borderRadius:30,...ff.body,fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer'}}>Close Window</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════════ */
const AuthModal = ({ onClose, action }) => {
  const { setIsLoggedIn, setUser } = useAppCtx();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!email || !password) return;
    
    setLoading(true);
    setError('');
    
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if(supabaseUrl && supabaseKey) {
      try {
        const endpoint = isLogin ? '/auth/v1/token?grant_type=password' : '/auth/v1/signup';
        const res = await fetch(`${supabaseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if(!res.ok) throw new Error(data.error_description || data.msg || 'Authentication failed');
        
        localStorage.setItem('vmw_session', JSON.stringify(data));
        setIsLoggedIn(true);
        if(setUser) setUser(data.user);
        onClose();
      } catch(err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Mock fallback
      setTimeout(() => {
        setIsLoggedIn(true);
        onClose();
      }, 1000);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(30px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(400px, 100vw)', border: '1px solid rgba(255,215,0,0.2)', background: 'linear-gradient(180deg, rgba(20,16,10,0.98) 0%, rgba(10,8,6,0.98) 100%)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}
      >
        <div style={{ padding: '40px 32px 20px', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <div style={{ fontSize: 42, marginBottom: 16, filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.4))' }}>✨</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: 'rgba(255,215,0,0.95)', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </h3>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
            {isLogin ? 'Welcome back to the archive.' : 'Join to curate your personal collection.'}
          </p>
        </div>
        <div style={{ padding: '0 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && <div style={{ color: '#ff4444', fontSize: 13, textAlign: 'center' }}>{error}</div>}
            <input type="email" required placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontFamily: "'Jost', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <input type="password" required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontFamily: "'Jost', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <motion.button disabled={loading} whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.98 }} type="submit" style={{ width: '100%', padding: '16px 24px', background: loading ? 'rgba(255,215,0,0.5)' : 'linear-gradient(135deg, rgba(255,215,0,0.9) 0%, rgba(200,150,0,1) 100%)', color: '#000', border: 'none', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>
          
          <div style={{ textAlign: 'center', fontSize: 12, fontFamily: "'Jost', sans-serif", color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', opacity: 0.3 }}>
            <div style={{ flex: 1, height: 1, background: '#FFF' }}></div>
            <div style={{ padding: '0 16px', fontSize: 12, fontFamily: "'Jost', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</div>
            <div style={{ flex: 1, height: 1, background: '#FFF' }}></div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.9)' }} whileTap={{ scale: 0.98 }}
            onClick={() => { alert('Google sign-in is coming soon. Please use email/password for now.'); }}
            style={{ width: '100%', padding: '14px 24px', background: 'rgba(255,255,255,0.85)', color: '#555', border: 'none', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', opacity: 0.7 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google (Coming Soon)
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setIsLoggedIn(false); onClose(); }}
            style={{ width: '100%', padding: '14px 24px', background: 'transparent', color: 'rgba(255,215,0,0.8)', border: '1px dashed rgba(255,215,0,0.3)', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
          >
            Continue as Guest
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   ADMIN LOGIN
═══════════════════════════════════════════════════════════════ */
const AdminLogin = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError('Authentication service is not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env.local file.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || 'Authentication failed');

      // Check role via profiles table
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${data.user.id}&select=role`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${data.access_token}` }
      });
      const profiles = await profileRes.json();
      const role = profiles?.[0]?.role;
      if (role !== 'admin') throw new Error('You do not have admin access. Ask the owner to grant your account the admin role.');

      localStorage.setItem('vmw_session', JSON.stringify(data));
      localStorage.setItem('vmw_admin_auth', 'true');
      navigate('/admin');
    } catch(err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg1 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400, background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 24, padding: 40, boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontFamily: "'Cinzel', serif", color: C.gold, fontSize: 24, margin: '0 0 8px 0' }}>Admin Gateway</h1>
          <p style={{ fontFamily: "'Jost', sans-serif", color: C.dim, fontSize: 14, margin: 0 }}>Secure access for authorized personnel only.</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ color: '#ff4444', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          <input type="email" required placeholder="Admin Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontFamily: "'Jost', sans-serif" }}/>
          <input type="password" required placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, fontFamily: "'Jost', sans-serif" }}/>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ padding: '16px', background: loading ? 'rgba(255,215,0,0.5)' : C.gold, color: '#000', border: 'none', borderRadius: 12, fontFamily: "'Jost', sans-serif", fontWeight: 700, marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {loading ? 'Authenticating...' : 'Authenticate'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   ADMIN GALLERY MANAGER — Upload, manage, delete gallery items
   Images uploaded to Supabase Storage → public URL → inserted
   into gallery_items table → live on website instantly.
═══════════════════════════════════════════════════════════════ */
const GALLERY_CATS = ['Gold Work', 'Silver Work', 'Stone Work', 'Vigraham', 'Crown Work'];
const METAL_OPTIONS = ['24K Gold Nagas', 'Gold Nagas Handcrafted', '24K Gold Polish', 'Gold Beaten Work', 'Gold Plated Copper', 'Sterling Silver', 'Stone · Gold Inlay', 'Stone Setting', 'Panchaloha Cast', 'Custom'];

const AdminGalleryManager = ({ C, supabaseUrl, supabaseKey, onRefreshStats }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: '', category: 'Gold Work', metal_type: '24K Gold Nagas',
    is_featured: false, file: null, preview: null,
  });
  const fileRef = React.useRef();

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const getAuthHeaders = () => {
    let token = supabaseKey;
    try { const s = localStorage.getItem('vmw_session'); if(s){const p=JSON.parse(s);if(p?.access_token)token=p.access_token;} } catch(_){}
    return { 'apikey': supabaseKey, 'Authorization': `Bearer ${token}` };
  };

  const fetchItems = useCallback(async () => {
    if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(`${supabaseUrl}/rest/v1/gallery_items?select=*&order=created_at.desc`, {
        headers: getAuthHeaders()
      });
      const data = res.ok ? await res.json() : [];
      setItems(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Revoke previous preview URL to prevent memory leak
    setForm(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
      return { ...f, file, preview: URL.createObjectURL(file) };
    });
  };

  const handleUpload = async () => {
    if (!form.file || !form.title.trim()) { showToast('Please fill title and select an image.', false); return; }
    if (!supabaseUrl || !supabaseKey) { showToast('Supabase not configured.', false); return; }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Step 1: Insert metadata — DO NOT send `id`, let Postgres auto-generate UUID
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/gallery_items`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          metal_type: form.metal_type,
          is_featured: form.is_featured,
          image_url: '', // placeholder — updated after upload
        }),
      });
      if (!insertRes.ok) throw new Error(`DB insert failed: ${await insertRes.text()}`);
      const [newRow] = await insertRes.json();
      const uuid = newRow.id; // real UUID from gen_random_uuid()
      setUploadProgress(35);

      // Step 2: Upload image using real UUID as path (no collision risk)
      const ext = form.file.name.split('.').pop().toLowerCase();
      const storagePath = `gallery/${uuid}.${ext}`;
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/gallery-images/${storagePath}`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': form.file.type, 'x-upsert': 'true' },
        body: form.file,
      });
      if (!uploadRes.ok) {
        // Roll back DB row if storage fails
        await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${uuid}`, { method: 'DELETE', headers: getAuthHeaders() });
        throw new Error(`Image upload failed: ${await uploadRes.text()}`);
      }
      setUploadProgress(75);

      // Step 3: Update row with real public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/gallery-images/${storagePath}`;
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${uuid}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ image_url: publicUrl }),
      });
      if (!updateRes.ok) throw new Error(`URL update failed: ${await updateRes.text()}`);

      setUploadProgress(100);
      showToast(`"${form.title}" uploaded and live on website! ✓`);

      if (form.preview) URL.revokeObjectURL(form.preview);
      setForm({ title: '', category: 'Gold Work', metal_type: '24K Gold Nagas', is_featured: false, file: null, preview: null });
      if (fileRef.current) fileRef.current.value = '';
      setShowUploadForm(false);
      await fetchItems();
      if (onRefreshStats) onRefreshStats();
    } catch(err) {
      showToast(err.message, false);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !item.is_featured }),
      });
      if (!res.ok) throw new Error('Failed to update');
      showToast(`${item.title} ${!item.is_featured ? 'featured' : 'unfeatured'}`);
      await fetchItems();
    } catch(e) { showToast(e.message, false); }
  };

  const handleDelete = async (item) => {
    try {
      // Delete from DB
      const res = await fetch(`${supabaseUrl}/rest/v1/gallery_items?id=eq.${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('DB delete failed');

      // Try delete from storage if it's an upload (not seeded)
      if (item.image_url && item.image_url.includes('/storage/v1/object/public/gallery-images/')) {
        const path = item.image_url.split('/storage/v1/object/public/gallery-images/')[1];
        await fetch(`${supabaseUrl}/storage/v1/object/gallery-images/${path}`, {
          method: 'DELETE', headers: getAuthHeaders(),
        });
      }
      showToast(`"${item.title}" deleted.`);
      setDeleteConfirm(null);
      await fetchItems();
      if (onRefreshStats) onRefreshStats();
    } catch(e) { showToast(e.message, false); }
  };

  const inp = (label, value, onChange, type='text', placeholder='') => (
    <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>{label}</span>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, outline:'none', fontFamily:"'Jost',sans-serif" }} />
    </label>
  );

  return (
    <div style={{ position:'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:9999, padding:'14px 22px', background: toast.ok ? 'rgba(0,200,100,0.95)' : 'rgba(220,50,50,0.95)', color:'#fff', borderRadius:12, fontFamily:"'Jost',sans-serif", fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,0.4)', maxWidth:360 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:24, margin:0, color:C.text }}>Gallery Management</h3>
          <p style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.dim, margin:'4px 0 0' }}>{items.length} items in gallery · Uploads reflect instantly on the website</p>
        </div>
        <button onClick={() => setShowUploadForm(v => !v)}
          style={{ background: showUploadForm ? 'rgba(255,215,0,0.15)' : C.gold, color: showUploadForm ? C.gold : '#000', border: showUploadForm ? `1px solid ${C.gold}` : 'none', padding:'12px 24px', borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer', letterSpacing:'.04em' }}>
          {showUploadForm ? '✕ Cancel' : '+ Upload New Artwork'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div style={{ background:C.surfaceWarm, border:`1px solid ${C.gold}44`, borderRadius:16, padding:32, marginBottom:32 }}>
          <h4 style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:C.gold, margin:'0 0 24px' }}>Upload New Gallery Item</h4>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
            {inp('Artwork Title *', form.title, v => setForm(f=>({...f,title:v})), 'text', 'e.g. Sadari Gold Crown')}
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>Category</span>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                style={{ padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, fontFamily:"'Jost',sans-serif", outline:'none' }}>
                {GALLERY_CATS.map(c=><option key={c} value={c} style={{background:'#111'}}>{c}</option>)}
              </select>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>Metal Type</span>
              <select value={form.metal_type} onChange={e=>setForm(f=>({...f,metal_type:e.target.value}))}
                style={{ padding:'12px 14px', background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, fontFamily:"'Jost',sans-serif", outline:'none' }}>
                {METAL_OPTIONS.map(m=><option key={m} value={m} style={{background:'#111'}}>{m}</option>)}
              </select>
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', color:C.dim, fontFamily:"'Jost',sans-serif" }}>Featured on Home Page?</span>
              <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:8 }}>
                <input type="checkbox" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))}
                  style={{ width:18, height:18, accentColor:C.gold, cursor:'pointer' }} />
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:14, color:C.text }}>Show in Featured section</span>
              </div>
            </label>
          </div>

          {/* File Drop Zone */}
          <label style={{ display:'block', cursor:'pointer' }}>
            <div style={{
              border: `2px dashed ${form.preview ? C.gold : C.border}`,
              borderRadius:14, padding: form.preview ? 0 : '48px 24px',
              textAlign:'center', background:'rgba(255,255,255,0.02)',
              transition:'border-color .2s', overflow:'hidden',
              minHeight: form.preview ? 280 : 'auto',
              position:'relative',
            }}>
              {form.preview ? (
                <>
                  <img src={form.preview} alt="Preview" style={{ width:'100%', maxHeight:320, objectFit:'contain', display:'block' }} />
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                    <span style={{ color:'#fff', fontFamily:"'Jost',sans-serif", fontSize:14 }}>Click to change image</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:40, marginBottom:12 }}>📷</div>
                  <div style={{ fontFamily:"'Jost',sans-serif", fontSize:15, color:C.text, fontWeight:600, marginBottom:6 }}>Click to select image</div>
                  <div style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.dim }}>JPG, PNG, WEBP · Max 10MB</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display:'none' }} />
          </label>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.dim }}>Uploading to Supabase Storage…</span>
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:C.gold }}>{uploadProgress}%</span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.1)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${uploadProgress}%`, background:C.gold, borderRadius:99, transition:'width .4s ease' }} />
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:12, marginTop:24 }}>
            <button onClick={handleUpload} disabled={uploading || !form.file || !form.title.trim()}
              style={{ flex:1, padding:'14px', background: (uploading || !form.file || !form.title.trim()) ? 'rgba(255,215,0,0.3)' : C.gold, color:'#000', border:'none', borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:14, cursor: (uploading || !form.file || !form.title.trim()) ? 'not-allowed' : 'pointer', letterSpacing:'.06em', textTransform:'uppercase' }}>
              {uploading ? `Uploading… ${uploadProgress}%` : '⬆ Upload & Publish to Website'}
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
          {[1,2,3,4,5,6].map(i=>(
            <div key={i} style={{ aspectRatio:'1/1', borderRadius:12, background:'rgba(255,255,255,0.04)' }} className="skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ background:C.surfaceWarm, border:`1px solid ${C.border}`, borderRadius:16, padding:60, textAlign:'center', color:C.dim, fontFamily:"'Jost',sans-serif" }}>
          No gallery items yet. Upload your first artwork above.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
          {items.map(item => (
            <div key={item.id} style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${item.is_featured ? C.gold+'66' : C.border}`, background:C.surfaceWarm, position:'relative', display:'flex', flexDirection:'column' }}>
              {/* Image */}
              <div style={{ aspectRatio:'1/1', overflow:'hidden', position:'relative' }}>
                <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e=>{ e.target.style.background='#1a1208'; e.target.src=''; }} />
                {item.is_featured && (
                  <div style={{ position:'absolute', top:8, left:8, background:C.gold, color:'#000', padding:'2px 8px', borderRadius:99, fontSize:10, fontFamily:"'Jost',sans-serif", fontWeight:700, letterSpacing:'.06em' }}>FEATURED</div>
                )}
                {/* Overlay actions */}
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0)', transition:'background .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:0 }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(0,0,0,0.6)'; e.currentTarget.style.opacity=1; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(0,0,0,0)'; e.currentTarget.style.opacity=0; }}>
                  <button onClick={()=>handleToggleFeatured(item)} title={item.is_featured?'Unfeature':'Feature on home'}
                    style={{ background:'rgba(255,215,0,0.9)', color:'#000', border:'none', borderRadius:8, padding:'8px 12px', fontSize:12, fontFamily:"'Jost',sans-serif", fontWeight:700, cursor:'pointer' }}>
                    {item.is_featured ? '★ Unfeature' : '☆ Feature'}
                  </button>
                  <button onClick={()=>setDeleteConfirm(item)} title="Delete artwork"
                    style={{ background:'rgba(220,50,50,0.9)', color:'#fff', border:'none', borderRadius:8, padding:'8px 12px', fontSize:12, fontFamily:"'Jost',sans-serif", fontWeight:700, cursor:'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding:'12px 14px' }}>
                <div style={{ fontFamily:"'Jost',sans-serif", fontSize:13, fontWeight:600, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                <div style={{ fontFamily:"'Jost',sans-serif", fontSize:11, color:C.dim, marginTop:3 }}>{item.category} · {item.metal_type}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={()=>setDeleteConfirm(null)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.surfaceWarm, border:`1px solid ${C.border}`, borderRadius:20, padding:36, maxWidth:400, width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🗑️</div>
            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:20, color:C.text, margin:'0 0 10px' }}>Delete Artwork?</h3>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:14, color:C.dim, margin:'0 0 28px', lineHeight:1.6 }}>
              "{deleteConfirm.title}" will be permanently removed from the gallery and website. This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={()=>setDeleteConfirm(null)}
                style={{ flex:1, padding:'12px', background:'transparent', border:`1px solid ${C.border}`, color:C.text, borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:600, fontSize:14, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={()=>handleDelete(deleteConfirm)}
                style={{ flex:1, padding:'12px', background:'rgba(220,50,50,0.9)', border:'none', color:'#fff', borderRadius:10, fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAuth, setIsAuth] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ artworks: 0, inquiries: 0, users: 0, views: 0 });
  const [loading, setLoading] = useState(false);
  
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  const fetchAdminData = useCallback(async () => {
    if(!supabaseUrl || !supabaseKey) return;
    try {
      setLoading(true);
      // Use session token if available for admin-level access
      let authToken = supabaseKey;
      try {
        const sess = localStorage.getItem('vmw_session');
        if (sess) { const p = JSON.parse(sess); if (p?.access_token) authToken = p.access_token; }
      } catch(_) {}
      const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${authToken}`, 'Prefer': 'count=exact', 'Range': '0-0' };
      const headersNoCount = { 'apikey': supabaseKey, 'Authorization': `Bearer ${authToken}` };
      const [inqRes, artRes, userRes, viewRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/inquiries?select=*&order=created_at.desc`, { headers: headersNoCount }),
        fetch(`${supabaseUrl}/rest/v1/gallery_items?select=id`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/profiles?select=id`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/analytics_events?event_type=eq.view&select=id`, { headers }),
      ]);
      const inqData = inqRes.ok ? await inqRes.json() : [];
      const artCount = parseInt((artRes.headers.get('content-range') || '0/0').split('/')[1], 10) || 0;
      const userCount = parseInt((userRes.headers.get('content-range') || '0/0').split('/')[1], 10) || 0;
      const viewCount = parseInt((viewRes.headers.get('content-range') || '0/0').split('/')[1], 10) || 0;
      setInquiries(inqData);
      setStats({
        artworks: artCount,
        inquiries: inqData.filter(i => ['pending','new'].includes(i.status)).length || 0,
        users: userCount,
        views: viewCount,
      });
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabaseUrl, supabaseKey]);

  const updateInquiryStatus = async (id, newStatus) => {
    if(!supabaseUrl || !supabaseKey) return;
    try {
      let authToken = supabaseKey;
      try { const sess = localStorage.getItem('vmw_session'); if(sess){const p=JSON.parse(sess);if(p?.access_token)authToken=p.access_token;} } catch(_){}
      const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' };
      await fetch(`${supabaseUrl}/rest/v1/inquiries?id=eq.${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }) });
      fetchAdminData();
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('vmw_admin_auth');
    if(!auth) {
      navigate('/admin/login');
    } else {
      setIsAuth(true);
      fetchAdminData();
    }
  }, [navigate, fetchAdminData]);

  if(!isAuth) return null;

  const tabs = ['Dashboard', 'Gallery', 'Inquiries', 'Users', 'Collections', 'Comments', 'Analytics', 'Settings'];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Dashboard':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { label: 'Total Artworks', value: loading ? '-' : stats.artworks, icon: '🖼️' },
              { label: 'Pending Inquiries', value: loading ? '-' : stats.inquiries, icon: '💬' },
              { label: 'Total Users', value: loading ? '-' : stats.users, icon: '👥' },
              { label: 'Total Views', value: loading ? '-' : stats.views, icon: '👁️' }
            ].map(stat => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{stat.icon}</div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 36, color: C.text, marginTop: 8 }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
        );
      case 'Inquiries':
        return (
          <div style={{ background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Client</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Artwork</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Budget</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: C.dim, fontFamily: "'Jost', sans-serif", fontSize: 13, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: C.dim }}>Loading inquiries...</td></tr>
                ) : inquiries.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: C.dim }}>No inquiries found.</td></tr>
                ) : inquiries.map((iq) => (
                  <tr key={iq.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '20px 24px', color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: 500 }}>
                      {iq.full_name}<br/>
                      <span style={{ fontSize: 12, color: C.dim, fontWeight: 400 }}>{iq.phone}</span>
                    </td>
                    <td style={{ padding: '20px 24px', color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 14 }}>
                      {iq.artwork_type}<br/>
                      <span style={{ fontSize: 12, color: C.dim }}>{iq.preferred_metal}</span>
                    </td>
                    <td style={{ padding: '20px 24px', color: C.text, fontFamily: "'Jost', sans-serif", fontSize: 14 }}>{iq.budget || 'Unspecified'}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <select 
                        value={iq.status} 
                        onChange={(e) => updateInquiryStatus(iq.id, e.target.value)}
                        style={{ padding: '4px 8px', background: iq.status === 'pending' ? 'rgba(255,215,0,0.1)' : 'rgba(0,255,100,0.1)', border: `1px solid ${iq.status === 'pending' ? C.gold : '#00ff64'}`, color: iq.status === 'pending' ? C.gold : '#00ff64', borderRadius: 4, fontSize: 12, outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="pending" style={{background:'#000',color:'#fff'}}>Pending (New)</option>
                        <option value="new" style={{background:'#000',color:'#fff'}}>New</option>
                        <option value="contacted" style={{background:'#000',color:'#fff'}}>Contacted</option>
                        <option value="in_progress" style={{background:'#000',color:'#fff'}}>In Progress</option>
                        <option value="completed" style={{background:'#000',color:'#fff'}}>Completed</option>
                        <option value="rejected" style={{background:'#000',color:'#fff'}}>Rejected</option>
                      </select>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <button onClick={() => window.open(`https://wa.me/${iq.whatsapp || iq.phone.replace(/[^0-9]/g, '')}`, '_blank')} style={{ background: 'transparent', border: `1px solid ${C.gold}`, color: C.gold, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: 12 }}>WhatsApp</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'Gallery':
        return <AdminGalleryManager C={C} supabaseUrl={supabaseUrl} supabaseKey={supabaseKey} onRefreshStats={fetchAdminData} />;
      default:
        return <div style={{ color: C.dim }}>{activeTab} module under development.</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg1 }}>
      <div style={{ width: 280, borderRight: `1px solid ${C.border}`, background: C.surfaceWarm, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", color: C.gold, margin: 0, fontSize: 20 }}>Studio Admin</h2>
          <div style={{ fontSize: 12, color: C.dim, fontFamily: "'Jost', sans-serif", marginTop: 4 }}>Vijay Metal Works</div>
        </div>
        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: activeTab === tab ? 'rgba(255,215,0,0.1)' : 'transparent', border: 'none', borderRadius: 8, color: activeTab === tab ? C.gold : C.text, fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ padding: 24, borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => { localStorage.removeItem('vmw_admin_auth'); localStorage.removeItem('vmw_session'); navigate('/admin/login'); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#ff4444', fontFamily: "'Jost', sans-serif", fontSize: 15, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 32, color: C.text, margin: '0 0 32px 0' }}>{activeTab}</h1>
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ROOT APP — Router wrapper
═══════════════════════════════════════════════════════════════ */
function AppContent() {
  const {mode, setMode, C: themeC} = useThemeMode();
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // ── Visitor Tracking — logs each visit to Supabase analytics_events with location ──
  useEffect(() => {
    const trackVisit = async () => {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) return;
      // Throttle: only track once per session
      if (sessionStorage.getItem('vmw_visit_tracked')) return;
      sessionStorage.setItem('vmw_visit_tracked', '1');
      try {
        // Get visitor approximate location via free IP API
        const geoRes = await fetch('https://ipapi.co/json/');
        const geo = geoRes.ok ? await geoRes.json() : {};
        await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'page_view',
            metadata: {
              country: geo.country_name || 'Unknown',
              city: geo.city || 'Unknown',
              region: geo.region || '',
              ip: geo.ip || '',
              page: window.location.pathname,
              referrer: document.referrer || 'direct',
              ua: navigator.userAgent ? navigator.userAgent.slice(0, 120) : '',
            }
          })
        });
      } catch (_) { /* silent — never block the user */ }
    };
    trackVisit();
  }, []);

  useEffect(() => {
    const sessionStr = localStorage.getItem('vmw_session');
    if(sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if(session && session.user && session.access_token) {
          // Check token expiry if available
          const expiresAt = session.expires_at; // Unix timestamp
          if (!expiresAt || Date.now() / 1000 < expiresAt) {
            setIsLoggedIn(true);
            setUser(session.user);
          } else {
            // Token expired — clear session
            localStorage.removeItem('vmw_session');
          }
        }
      } catch(err) {
        console.error('Session restore failed', err);
        localStorage.removeItem('vmw_session');
      }
    }
  }, []);
  
  const done = useCallback(()=>setLoading(false),[]);

  // Inject dynamic CSS on theme change
  useEffect(()=>{
    let el = document.getElementById('vmw-theme-css');
    if(!el){el=document.createElement('style');el.id='vmw-theme-css';document.head.appendChild(el);}
    el.textContent = buildCSS(themeC);
    // Inject premium button CSS once
    if (!document.getElementById('vmw-btn-css')) {
      const btnEl = document.createElement('style');
      btnEl.id = 'vmw-btn-css';
      btnEl.textContent = PREMIUM_BTN_CSS;
      document.head.appendChild(btnEl);
    }
  },[themeC]);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>65);
    window.addEventListener('scroll',h,{passive:true});
    return ()=>window.removeEventListener('scroll',h);
  },[]);

  return (
    <ThemeCtx.Provider value={themeC}>
      <AppCtx.Provider value={{ showCommissionModal, setShowCommissionModal, showAuthModal, setShowAuthModal, authAction, setAuthAction, isLoggedIn, setIsLoggedIn, user, setUser }}>
        <SEOMeta/>
        <div style={{background:themeC.bg1,color:themeC.text,overflowX:'hidden',minHeight:'100vh',transition:'background .35s,color .35s'}}>
          <ThemeToggle mode={mode} setMode={setMode} C={themeC}/>
          <AnimatePresence mode="wait">
            {loading && <Loader key="loader" onDone={done}/>}
          </AnimatePresence>
          {!loading && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.5}}>
              <CanvasBg/>
              <Grain/>
              <Routes>
                <Route path="/" element={<HomePage scrolled={scrolled}/>}/>
                <Route path="/gallery" element={<GalleryPage scrolled={scrolled}/>}/>
                <Route path="/gallery/immersive" element={<ImmersiveFeed />}/>
                <Route path="/admin" element={<AdminDashboard />}/>
                <Route path="/admin/login" element={<AdminLogin />}/>
              </Routes>
            </motion.div>
          )}
          <AnimatePresence>
            {showCommissionModal && <CommissionModal onClose={() => setShowCommissionModal(false)} C={themeC} />}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} action={authAction} />}
          </AnimatePresence>
        </div>
      </AppCtx.Provider>
    </ThemeCtx.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ERROR BOUNDARY — prevents full app crash on component errors
═══════════════════════════════════════════════════════════════ */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('VMW App Error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:'100vh', background:'#080604', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center', fontFamily:'Jost,sans-serif', color:'rgba(255,255,255,0.8)' }}>
          <div style={{ fontSize:48, marginBottom:24 }}>⚠️</div>
          <h2 style={{ fontFamily:'Cinzel,serif', color:'#FFD700', fontSize:28, marginBottom:12 }}>Something went wrong</h2>
          <p style={{ color:'rgba(255,255,255,0.5)', maxWidth:480, lineHeight:1.6, marginBottom:28 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={() => { this.setState({ hasError:false, error:null }); window.location.reload(); }}
            style={{ background:'#FFD700', color:'#000', border:'none', padding:'14px 32px', borderRadius:999, fontFamily:'Jost,sans-serif', fontWeight:700, fontSize:13, letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent/>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
