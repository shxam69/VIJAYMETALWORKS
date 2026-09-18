import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { Reveal } from '../common/Animations';
import { SectionCTA } from '../common/Button';

const PROCESS_STEPS = [
  {
    n: '01',
    stage: 'CONCEPT',
    title: 'Sacred Iconography & Measurement',
    desc: 'Every project begins with iconographic consultation adhering to the Shilpa Shastras and Agama canons. Deity attributes, sanctum dimensions, astrological orientations, and ritual postures (mudras) are precisely aligned.',
    img: '/gallery/stone/stone1.jpg',
    detail: 'Agama Canon Guidelines · Custom Dimensions · Vastu Harmony',
  },
  {
    n: '02',
    stage: 'DESIGN',
    title: 'Sthapathi Drawing & Proportions',
    desc: 'Master sthapathis create full-scale canonical schematics using traditional Tala measurements (Dasa Tala, Nava Tala). Every curve of the crown, prabhavali arch, or vigraham profile is calculated for structural balance.',
    img: '/gallery/gold/crown1.jpg',
    detail: 'Canonical Tala Scales · Proportion Schematics · Structural Framing',
  },
  {
    n: '03',
    stage: 'FORM',
    title: 'Wax Carving & Metal Sheet Forging',
    desc: 'For idols, a beeswax model is hand-sculpted in the ancient lost-wax technique (Madhuchishtavidhana). For crowns and kavachas, heavy copper or silver sheets are hand-hammered and forged over iron stakes to establish the initial contours.',
    img: '/gallery/gold/crown back.jpg',
    detail: 'Lost-Wax Sculpting · Hand Forging · Repoussé Base Formation',
  },
  {
    n: '04',
    stage: 'DETAIL',
    title: 'Nagas Chasing & Chisel Artistry',
    desc: 'The hollow form is embedded onto a bed of melted tree-resin pitch (arakku). Master craftsmen use specialised punches and chisels to emboss intricate Nagas motifs, feather filigree, floral garlands, and facial features.',
    img: '/gallery/gold/kandabaranam.jpg',
    detail: 'Pitch-Bed Embedding · Micro-Chisel Repoussé · Sacred Motifs',
  },
  {
    n: '05',
    stage: 'FINISH',
    title: '24K Gold Plating & Consecration Polish',
    desc: 'The piece undergoes multi-grade agate burnishing, ultrasonic cleaning, and pure 24K gold or sterling silver plating. The final divine piece emerges lustrous, durable for daily temple abhishekam, and ready for sanctification.',
    img: '/gallery/gold/sadarigold.jpg',
    detail: '24K Temple Gilding · Agate Burnishing · Sanctum Inspection',
  },
];

const ProcessSection = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();

  return (
    <section
      id="process"
      className="section-pad vmw-process-section"
      style={{
        position: 'relative',
        zIndex: 2,
        background: C.bg2,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div className="vmw-container">
        {/* Section Header */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <span
              style={{
                ...ff.body,
                fontSize: 9,
                letterSpacing: '.42em',
                color: C.gold,
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 14,
              }}
            >
              METALLURGICAL JOURNEY
            </span>
            <h2
              style={{
                ...ff.display,
                fontSize: 'clamp(28px, 4.5vw, 54px)',
                lineHeight: 1.1,
                letterSpacing: '.04em',
                color: C.text,
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              From Raw Element to Divine Form
            </h2>
            <p
              style={{
                ...ff.serif,
                fontSize: 'clamp(15px, 1.6vw, 20px)',
                color: C.dim,
                fontStyle: 'italic',
                maxWidth: 640,
                margin: '0 auto',
                lineHeight: 1.75,
              }}
            >
              The five sacred stages through which unrefined metal is transformed into consecrated temple artistry.
            </p>
          </div>
        </Reveal>

        {/* 5-Step Process Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {PROCESS_STEPS.map((step, i) => {
            const isEven = i % 2 === 0;

            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{
                  display: 'grid', gridTemplateColumns: 'var(--process-cols, 1.05fr 1fr)',
                  gap: 'clamp(24px, 4vw, 48px)',
                  alignItems: 'center',
                  padding: 'clamp(20px,3vw,36px)',
                  background: C.bg1,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
                className="vmw-process-grid"
              >
                {/* Text Content Column */}
                <div style={{ order: isEven ? 1 : 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span
                      style={{
                        ...ff.display,
                        fontSize: 28,
                        color: C.gold,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {step.n}
                    </span>
                    <span
                      style={{
                        ...ff.body,
                        fontSize: 8.5,
                        letterSpacing: '.3em',
                        color: C.goldLt,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        border: `1px solid ${C.borderGold}`,
                        borderRadius: 2,
                        background: 'rgba(212,175,55,0.06)',
                      }}
                    >
                      {step.stage}
                    </span>
                  </div>

                  <h3
                    style={{
                      ...ff.display,
                      fontSize: 'clamp(20px, 2.2vw, 28px)',
                      color: C.text,
                      fontWeight: 700,
                      letterSpacing: '.02em',
                      lineHeight: 1.2,
                      marginBottom: 14,
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      ...ff.body,
                      fontSize: 13.5,
                      color: C.dim,
                      lineHeight: 1.8,
                      marginBottom: 20,
                    }}
                  >
                    {step.desc}
                  </p>

                  <div
                    style={{
                      ...ff.body,
                      fontSize: 10,
                      color: C.goldLt,
                      letterSpacing: '.15em',
                      textTransform: 'uppercase',
                      borderTop: `1px solid ${C.border}`,
                      paddingTop: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ color: C.gold }}>✦</span>
                    {step.detail}
                  </div>
                </div>

                {/* Imagery Column */}
                <div
                  style={{
                    order: isEven ? 2 : 1,
                    position: 'relative',
                    aspectRatio: '4/3',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: `1px solid ${C.border}`,
                  }}
                  className="vmw-process-img"
                >
                  <img
                    src={step.img}
                    alt={step.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.85) contrast(1.08)',
                      transition: 'transform 0.7s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: C.isDark ? 'linear-gradient(to top, rgba(8,6,4,0.7) 0%, transparent 60%)' : 'linear-gradient(to top, rgba(80,60,30,0.35) 0%, transparent 60%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <SectionCTA
          primary="Consult Our Master Craftsmen"
          secondary="Explore Completed Works"
          onPrimary={() => setShowCommissionModal(true)}
        />
      </div>
    </section>
  );
};

export default ProcessSection;
