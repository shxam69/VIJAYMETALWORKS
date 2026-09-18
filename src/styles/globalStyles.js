/* ---------------------------------------------------------------
   GLOBAL STYLES & DYNAMIC THEME BUILDER
   4-breakpoint responsive system:
     BASE      >1024px  Desktop
     1024px    ≤1024px  Tablet landscape / small desktop
     768px     ≤768px   Tablet portrait / large mobile
     480px     ≤480px   Mobile portrait / narrow phone
--------------------------------------------------------------- */
const buildCSS = (C) => `
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
img{image-rendering:auto;-webkit-image-rendering:auto}

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
.vmw-img{background:${C.bg1}}
.theme-toggle{right:70px!important}
.gold-text,.text-gold{color:${C.gold}!important;text-shadow:0 1px 2px rgba(0,0,0,.8);${C.isDark?'mix-blend-mode:screen':''}}

/* ── CONTAINER SYSTEM ─────────────────────────────────────────── */
/* Shared centred wrapper with responsive gutters */
.vmw-container{
  width:100%;
  max-width:1280px;
  margin:0 auto;
  padding-left:clamp(16px,5vw,64px);
  padding-right:clamp(16px,5vw,64px);
}

/* ── SECTION RHYTHM ───────────────────────────────────────────── */
/* Vertical padding using clamp — no more fixed 140px */
.section-pad{
  padding-top:clamp(60px,9vw,130px);
  padding-bottom:clamp(60px,9vw,130px);
}

/* ── DESKTOP GRID DECLARATIONS (BASE) ────────────────────────── */
/* These are the default (desktop) column settings.
   Media queries below collapse them. */

/* 2-column alternating layout (Showcase, Services intro, etc.) */
.two-col{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:clamp(32px,5vw,80px);
  align-items:center;
}

/* 3-column work photo grid */
.vmw-work-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px;
}

/* 4-column temple trust grid */
.vmw-temples-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:2px;
}

/* 4-column archive masonry grid */
.archive-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  grid-auto-rows:auto;
  gap:6px;
}

/* 3-column testimonials mini-cards */
.vmw-testimonials-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px;
}

/* 3-column gallery preview masonry (controlled via inline <style> in component) */

/* Services 2-col card (image + specs) */
.vmw-services-card{
  display:grid;
  grid-template-columns:1fr 1.5fr;
  gap:0;
}

/* Process step 2-col alternating */
.vmw-process-step{
  display:grid;
  gap:clamp(24px,4vw,48px);
  align-items:center;
}

/* Footer 4-col contact buttons */
.vmw-footer-btns{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:6px;
}

/* Footer 3-col info columns */
.footer-cols{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:24px;
  text-align:left;
}

/* Gallery 2-col masonry */
.gallery-grid{grid-template-columns:repeat(3,1fr);gap:6px}
.gallery-masonry{columns:3;column-gap:6px}
.gallery-masonry>*{break-inside:avoid;margin-bottom:6px}

/* Featured testimonial box */
.vmw-featured-testimonial{
  padding:clamp(24px,4vw,52px) clamp(16px,4.5vw,56px);
}

/* Nav desktop — visible above 900px */
.nav-desktop{display:flex!important}
/* Mobile sticky bar — hidden above 900px */
.mobile-sticky-bar{display:none!important}

/* WhatsApp FAB default position */
.wa-fab{bottom:24px!important}

/* ── 1024px — Tablet Landscape ───────────────────────────────── */
@media(max-width:1024px){
  .vmw-work-grid{grid-template-columns:repeat(2,1fr)!important}
  .vmw-temples-grid{grid-template-columns:repeat(4,1fr)!important}
  .archive-grid{grid-template-columns:repeat(4,1fr)!important}
  .vmw-testimonials-grid{grid-template-columns:repeat(3,1fr)!important}
  .gallery-masonry{columns:2;column-gap:6px}
}

/* ── 900px — Tablet Portrait / Large Mobile ──────────────────── */
@media(max-width:900px){
  /* Nav switch */
  .nav-desktop{display:none!important}
  .mobile-sticky-bar{display:flex!important}
  .wa-fab{bottom:90px!important}

  /* Major grid collapses */
  .two-col{grid-template-columns:1fr!important}
  .vmw-services-card{grid-template-columns:1fr!important}
  .vmw-work-grid{grid-template-columns:repeat(2,1fr)!important;gap:6px!important}
  .vmw-temples-grid{grid-template-columns:repeat(4,1fr)!important;gap:2px!important}
  .archive-grid{grid-template-columns:repeat(2,1fr)!important}
  /* Cancel span-2 for archive large item at ≤900px */
  .archive-grid .archive-large{grid-column:span 1!important;grid-row:span 1!important}
  .vmw-testimonials-grid{grid-template-columns:repeat(2,1fr)!important}
  .gallery-grid{grid-template-columns:repeat(2,1fr)!important;gap:6px!important}
  .gallery-masonry{columns:2;column-gap:6px}
  .footer-cols{grid-template-columns:1fr!important;gap:20px!important}
  .vmw-footer-btns{grid-template-columns:repeat(2,1fr)!important}

  /* Process mobile override */
  .vmw-process-grid{grid-template-columns:40px 1fr!important;gap:0!important}
  .vmw-process-img{display:none!important}
  .vmw-process-node{grid-column:1!important}
  .vmw-process-content{grid-column:2!important;padding-left:16px!important;padding-right:0!important}

  /* Hero 3D */
  .hero-3d{width:180px!important;height:180px!important}

  /* Section CTA row — wrap buttons */
  .section-cta-row{flex-wrap:wrap!important;justify-content:center!important}
}

/* ── 768px — Mobile Portrait ─────────────────────────────────── */
@media(max-width:768px){
  .vmw-temples-grid{grid-template-columns:repeat(2,1fr)!important;gap:2px!important}
  .vmw-testimonials-grid{grid-template-columns:1fr!important}
  .archive-grid{grid-template-columns:repeat(2,1fr)!important}
}

/* ── 480px — Narrow Phone ────────────────────────────────────── */
@media(max-width:480px){
  .vmw-work-grid{grid-template-columns:1fr!important}
  .vmw-temples-grid{grid-template-columns:repeat(2,1fr)!important}
  .archive-grid{grid-template-columns:1fr!important}
  .vmw-footer-btns{grid-template-columns:repeat(2,1fr)!important}
  .section-cta-row{flex-direction:column!important;align-items:stretch!important}

  /* Contact info links — stack */
  .vmw-contact-links{flex-direction:column!important;gap:16px!important;align-items:center!important}
}

@media(prefers-color-scheme:dark){
  .hero-title{filter:brightness(1.4)}
}
`;

const PREMIUM_BTN_CSS = (C) => `@keyframes lineGlow {
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
  background: ${C.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(180,130,0,0.04)'};
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid ${C.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(100,70,20,0.30)'};
  border-radius: 999px;
  color: ${C.isDark ? 'rgba(255,255,255,0.72)' : 'rgba(40,20,0,0.70)'};
  font-family: 'Jost', sans-serif;
  font-size: 9px; letter-spacing: .35em; font-weight: 700;
  text-transform: uppercase; cursor: pointer;
  box-shadow: 0 0 0 0 rgba(255,215,0,0), inset 0 1px 0 ${C.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.3)'};
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
  border-color: ${C.isDark ? 'rgba(255,215,0,0.52)' : 'rgba(184,134,11,0.70)'};
  color: ${C.isDark ? 'rgba(255,215,0,0.92)' : 'rgba(140,90,0,0.95)'};
  background: ${C.isDark ? 'rgba(255,215,0,0.07)' : 'rgba(184,134,11,0.09)'};
}
.vmw-btn-secondary:hover::before {
  animation: btnShine 0.72s ease forwards;
}
.vmw-btn-secondary:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 12px rgba(255,215,0,0.15);
}
`;

const CSS = buildCSS;

export { buildCSS, PREMIUM_BTN_CSS, CSS };
export default buildCSS;
