import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { LOGO_B64 } from '../../data/vmwImages';
import { GoldRule } from '../common/Button';

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
    setCardOpen(false);
  }, [scrolled]);

  const navCards = [
    {
      label: 'Heritage',
      bg: C.isDark ? '#1C1208' : '#F5EDD8',
      links: [
        { label: 'Legacy', id: 'legacy' },
        { label: 'Our Craft', id: 'services' },
        { label: 'Process', id: 'process' },
      ]
    },
    {
      label: 'Gallery',
      bg: C.isDark ? '#0A1A14' : '#E8F0E8',
      links: [
        { label: 'Full Gallery', path: '/gallery' },
        { label: 'Featured Works', id: 'gallery-preview' },
        { label: 'Archive', id: 'archive' },
      ]
    },
    {
      label: 'Connect',
      bg: C.isDark ? '#181218' : '#F0E8F0',
      links: [
        { label: 'Testimonials', id: 'testimonials' },
        { label: 'FAQ', id: 'faq' },
        { label: 'Contact', id: 'contact' },
      ]
    },
  ];

  const scrollTo = (id, path) => {
    if (path) {
      // Navigate to a different page
      navigate(path);
      setCardOpen(false);
      setMenuOpen(false);
    } else if (id) {
      // Close menus first
      setCardOpen(false);
      setMenuOpen(false);
      
      // Small delay to let menus close, then scroll
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          // Navigate to home with scroll target
          navigate('/', { state: { scrollTo: id } });
        } else {
          // Already on home, just scroll
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    }
  };

  // Consistent glassy backgrounds for both themes
  const navBg = scrolled
    ? C.isDark 
      ? 'rgba(8,6,4,0.75)' 
      : 'rgba(255,255,255,0.25)'
    : 'transparent';

  const pillBg = C.isDark
    ? 'rgba(17,14,10,0.70)'
    : 'rgba(255,255,255,0.35)';

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
          backdropFilter: scrolled ? 'blur(40px) saturate(200%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(40px) saturate(200%)' : 'none',
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
              : '0 4px 32px rgba(0,0,0,.14), 0 0 0 1px rgba(180,130,10,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
            overflow: 'hidden',
            position: 'relative',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
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
                onClick={() => { if (isMobile) { setMenuOpen(o => !o); } else { setCardOpen(o => !o); } }}
                aria-label={isMobile ? (menuOpen ? 'Close menu' : 'Open menu') : (cardOpen ? 'Close menu' : 'Open menu')}
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

export default Nav;
