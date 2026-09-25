import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { useSiteImage } from '../../hooks/useSiteImages';
import { ff } from '../../styles/fonts';
import { CurvyButton, StarBorderButton } from '../common/Button';

const isVideoSource = (src) => {
  if (!src || typeof src !== 'string') return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src) || src.includes('video/');
};

const Hero = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  const heroBackground = useSiteImage('hero_bg', '/gallery/gold/crown.jpg');
  const heroVideo = useSiteImage('hero_video', '');

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const mqlMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotion = (e) => setPrefersReducedMotion(e.matches);

    window.addEventListener('resize', handleResize);
    if (mqlMotion.addEventListener) {
      mqlMotion.addEventListener('change', handleMotion);
    } else {
      mqlMotion.addListener(handleMotion);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mqlMotion.removeEventListener) {
        mqlMotion.removeEventListener('change', handleMotion);
      } else {
        mqlMotion.removeListener(handleMotion);
      }
    };
  }, []);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const fade = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Lock scale and motion strictly on mobile and reduced-motion viewports
  const effectiveBgScale = isMobile || prefersReducedMotion ? 1 : bgScale;
  const effectiveTextY = isMobile || prefersReducedMotion ? 0 : textY;

  const activeVideo = isVideoSource(heroVideo) ? heroVideo : (isVideoSource(heroBackground) ? heroBackground : null);
  const posterImg = isVideoSource(heroBackground) ? '/gallery/gold/crown.jpg' : heroBackground;

  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/gallery');
    }
  };

  return (
    <section
      id="home"
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 'clamp(100px, 15vh, 120px) clamp(16px, 4vw, 24px) clamp(40px, 8vh, 60px)',
      }}
    >
      {/* LOCKED CINEMATIC VIDEO / IMAGE BACKGROUND */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          scale: effectiveBgScale,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {activeVideo && !prefersReducedMotion ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={posterImg}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 38%',
              filter: 'brightness(0.32) contrast(1.15) saturate(0.85)',
              pointerEvents: 'none',
              transform: 'none',
            }}
          >
            <source src={activeVideo} type="video/mp4" />
          </video>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url('${posterImg}')`,
              backgroundPosition: 'center 38%',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(0.32) contrast(1.15) saturate(0.85)',
              pointerEvents: 'none',
              transform: 'none',
            }}
          />
        )}
      </motion.div>

      {/* Atmospheric dark gradient overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(10,8,6,0.3) 0%, rgba(8,6,4,0.85) 75%, #080604 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(8,6,4,0.6) 0%, transparent 25%, rgba(8,6,4,0.8) 80%, #080604 100%)',
        }}
      />

      {/* Subtle corner ornamental hairlines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.22,
        }}
        preserveAspectRatio="none"
      >
        <line x1="28" y1="28" x2="140" y2="28" stroke={C.gold} strokeWidth="1" />
        <line x1="28" y1="28" x2="28" y2="140" stroke={C.gold} strokeWidth="1" />
        <line x1="calc(100% - 28px)" y1="28" x2="calc(100% - 140px)" y2="28" stroke={C.gold} strokeWidth="1" />
        <line x1="calc(100% - 28px)" y1="28" x2="calc(100% - 28px)" y2="140" stroke={C.gold} strokeWidth="1" />
      </svg>

      {/* Content Container */}
      <motion.div
        style={{
          y: effectiveTextY,
          opacity: fade,
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          maxWidth: 960,
          width: '100%',
        }}
      >
        {/* Heritage Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
            border: `1px solid ${C.borderGold}`,
            padding: '7px 22px',
            borderRadius: 999,
            background: 'rgba(212, 175, 55, 0.07)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
          <span
            style={{
              ...ff.body,
              fontSize: 'clamp(9px, 1.1vw, 11px)',
              letterSpacing: '.32em',
              color: C.goldLt,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            SOWCARPET, CHENNAI · ESTD 1915
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
        </motion.div>

        {/* Brand Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            ...ff.display,
            fontSize: 'clamp(36px, 7.5vw, 76px)',
            lineHeight: 1.05,
            letterSpacing: '.06em',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: 16,
            textShadow: '0 4px 24px rgba(0,0,0,0.85)',
          }}
        >
          VIJAY METAL WORKS
        </motion.h1>

        {/* Heritage Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            ...ff.serif,
            fontSize: 'clamp(18px, 2.8vw, 30px)',
            color: C.goldLt,
            fontStyle: 'italic',
            letterSpacing: '.04em',
            fontWeight: 400,
            marginBottom: 20,
            textShadow: '0 2px 16px rgba(0,0,0,0.8)',
          }}
        >
          Temple Metal Craftsmanship Since 1915
        </motion.div>

        {/* Authentic Descriptive Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65 }}
          style={{
            ...ff.body,
            fontSize: 'clamp(13px, 1.4vw, 16px)',
            color: 'rgba(247, 243, 235, 0.78)',
            lineHeight: 1.75,
            letterSpacing: '.03em',
            maxWidth: 680,
            margin: '0 auto 36px',
          }}
        >
          Handcrafted temple metalwork, Panchaloha vigrahams, 24K gold and silver Naga work, kireedams, sanctum articles, and architectural metalwork — crafted with precision and preserved through generations.
        </motion.p>

        {/* Primary and Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="section-cta-row"
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <CurvyButton primary onClick={scrollToServices}>
            EXPLORE OUR CRAFT
          </CurvyButton>
          <StarBorderButton onClick={() => setShowCommissionModal(true)} speed={5}>
            COMMISSION A PIECE
          </StarBorderButton>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 1 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'clamp(16px, 4vw, 36px)',
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.gold, fontSize: 13 }}>✦</span>
            <span style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Hand-Hammered Nagas Work
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.gold, fontSize: 13 }}>✦</span>
            <span style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Agama Shastra Proportions
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.gold, fontSize: 13 }}>✦</span>
            <span style={{ ...ff.body, fontSize: 11, color: C.dim, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Pure 24K Gold &amp; Silver Plating
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Subtle Scroll Down Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
        }}
        onClick={scrollToServices}
      >
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.75, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 32,
            background: `linear-gradient(to bottom, ${C.gold}, transparent)`,
          }}
        />
      </motion.div>
    </section>
  );
};

export default Hero;
