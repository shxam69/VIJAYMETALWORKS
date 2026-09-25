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
    title: 'CONSULTATION',
    desc: 'Understand the temple, project requirements, dimensions and intended application.',
    img: '/gallery/stone/stone1.jpg',
  },
  {
    n: '02',
    title: 'DESIGN & PROPORTION',
    desc: 'Translate the requirement into detailed measurements, proportions and traditional forms.',
    img: '/gallery/gold/crown1.jpg',
  },
  {
    n: '03',
    title: 'MATERIAL & PREPARATION',
    desc: 'Prepare the selected metal and supporting materials according to the requirements of the work.',
    img: encodeURI('/gallery/gold/crown back.jpg'),
  },
  {
    n: '04',
    title: 'CRAFTSMANSHIP',
    desc: 'Shape, cast, emboss, repoussé and finish the work through careful manual craftsmanship.',
    img: '/gallery/gold/kandabaranam.jpg',
  },
  {
    n: '05',
    title: 'DETAILING',
    desc: 'Refine ornamental details, surface treatment and finishing elements.',
    img: '/gallery/gold/sadarigold.jpg',
  },
  {
    n: '06',
    title: 'COMPLETION',
    desc: 'Inspect the finished piece before it is prepared for delivery or installation.',
    img: '/gallery/gold/crown.jpg',
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
              CANONICAL PROCESS
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
              FROM TRADITION TO CRAFT
            </h2>
          </div>
        </Reveal>

        {/* 6-Step Process Cards */}
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
                <div style={{ order: isEven ? 1 : 2 }} className="vmw-process-content">
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
                      STEP {step.n}
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
                      marginBottom: 0,
                    }}
                  >
                    {step.desc}
                  </p>
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
