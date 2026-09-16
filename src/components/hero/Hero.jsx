import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { CurvyButton, StarBorderButton } from '../common/Button';

const Hero = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const fade = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

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
        padding: '120px 24px 60px',
      }}
    >
      {/* Background authentic crown photography with cinematic luxury overlay */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          scale: bgScale,
          zIndex: 1,
          backgroundImage: `url('/gallery/gold/crown.jpg')`,
          backgroundPosition: 'center 38%',
          backgroundSize: 'cover',
          filter: 'brightness(0.32) contrast(1.15) saturate(0.85)',
        }}
      />

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
          y: textY,
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
          Temple Metal Craftsmen Since 1915
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
          Handcrafted sacred temple regalia, lost-wax Panchaloha vigrahams, 24K gold &amp; silver Nagas
          kireedams, and full sanctum architectural metallurgy preserved over generations in Murugappa Street.
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
        <span
          style={{
            ...ff.body,
            fontSize: 8,
            letterSpacing: '.35em',
            color: C.faint,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          SCROLL
        </span>
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
