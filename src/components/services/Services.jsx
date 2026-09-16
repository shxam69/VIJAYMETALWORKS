import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { Reveal } from '../common/Animations';
import { SectionCTA } from '../common/Button';
import AccordionGallery from './AccordionGallery';

const metals = [
  {
    name: 'Gold Work',
    accent: '#FFD700',
    img: '/gallery/gold/sadarigold.jpg',
    icon: '✦',
    badge: '24K · Nagas · Stone · Electro Plating',
    desc: 'The pinnacle of temple metalcraft — pure 24K gold worked by hand using century-old Chola techniques alongside modern European electro-plating technology.',
    services: [
      {
        t: 'Nagas Work',
        d: 'Traditional hand-beaten relief artistry — serpents, lotuses, and divine motifs struck individually on 24K gold by master craftsmen.',
      },
      {
        t: 'Stone Setting',
        d: 'Precision inlay of rubies, emeralds, and precious stones into gold idol adornments, Kireedams, and Prabhavali arches.',
      },
      {
        t: 'Europe Tech Electro Plating',
        d: 'Advanced European gold electroplating on copper bases. Guaranteed service life options: 5 years, 10 years, or 20+ years as per requirement.',
      },
    ],
  },
  {
    name: 'Silver Work',
    accent: '#B8C0CC',
    img: '/gallery/silver/kandabaranam.jpg',
    icon: '◈',
    badge: 'Pure Silver · Nagas · Stone',
    desc: 'Sterling silver temple metalcraft — hand-beaten and stone-set for idols, crowns, vessels, and architectural temple elements.',
    services: [
      {
        t: 'Nagas Work',
        d: 'Hand-hammered nagas relief work in sterling silver — serpent motifs, floral garlands, and deity iconography with ancestral precision.',
      },
      {
        t: 'Stone Setting',
        d: 'Precious and semi-precious stone inlay into silver idol adornments, Prabhavali arches, and Kalasam vessel work for temple use.',
      },
    ],
  },
  {
    name: 'Copper Work',
    accent: '#B87333',
    img: '/gallery/gold/hand1.jpg',
    icon: '❋',
    badge: 'Nagas · Electro · Gold Foil · Polishing',
    desc: 'Copper is the preferred base metal for large temple structures. We offer the full spectrum — from hand-beaten nagas work to European electro gold plating with decade-long guarantees.',
    services: [
      {
        t: 'Nagas Work',
        d: 'Detailed hand-beaten nagas craftsmanship on copper — the foundation metal of choice for Vimana towers and large idol structures due to durability.',
      },
      {
        t: 'Electro Gold Plating',
        d: 'Copper pieces gold-plated via European electroplating technology. Guaranteed life: 5 / 10 / 20+ years as per requirement.',
      },
      {
        t: 'Gold Foil — Thanga Thagadu',
        d: 'The ancient Thanga Thagadu method — pure gold leaf applied layer by layer over copper, creating a warm, rich, enduring sacred finish.',
      },
    ],
  },
  {
    name: 'Brass Work',
    accent: '#B09830',
    img: '/gallery/stone/stone2.jpg',
    icon: '◉',
    badge: 'Polish · Nagas · Lattice Work',
    desc: 'Brass temple pieces — lamps, bells, panels — restored to their original lustre through specialist polishing and traditional nagas lattice craftsmanship.',
    services: [
      {
        t: 'Brass Polishing',
        d: 'Deep cleaning and high-shine polishing of brass temple lamps, bells, vessels, and decorative panels.',
      },
      {
        t: 'Nagas Lattice Work',
        d: 'Intricate jaali (lattice) and nagas pattern relief work on brass — used for decorative panels, lamp bases, and architectural temple elements.',
      },
    ],
  },
  {
    name: 'Panchaloha',
    accent: '#C8B88A',
    img: '/gallery/temple/god.jpg',
    icon: '⬡',
    badge: '5-Metal Sacred Alloy · Divine Idols',
    desc: 'Panchaloha — the sacred five-metal alloy of Gold, Silver, Copper, Iron, and Lead — prescribed by the Agamas as the only appropriate material for consecrated divine idols.',
    services: [
      {
        t: 'Sacred Idol Casting',
        d: 'Full Panchaloha idol casting following Agamic prescriptions — the five metals alloyed in sacred proportions for Vigraham intended for consecration.',
      },
      {
        t: 'Nagas & Stone Work',
        d: 'Fine nagas relief work and precious stone setting on Panchaloha idols — each detail executed according to shilpa-shastra tradition.',
      },
      {
        t: 'Finishing & Consecration Prep',
        d: 'Mirror polishing and final finishing of Panchaloha pieces, prepared to the ritual purity standards required before temple consecration.',
      },
    ],
  },
];

const Services = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  const [activeMetal, setActiveMetal] = useState(0);

  const handleAccordionSelect = (title) => {
    navigate('/gallery');
  };

  const m = metals[activeMetal];

  return (
    <section id="services" className="section-pad" style={{ position: 'relative', zIndex: 2, background: C.bg1 }}>
      <div className="vmw-container">
        {/* Section Header */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                ...ff.body,
                fontSize: 9,
                letterSpacing: '.45em',
                color: C.gold,
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 14,
              }}
            >
              SACRED DISCIPLINES &amp; CRAFTSMANSHIP
            </span>
            <h2
              style={{
                ...ff.display,
                fontSize: 'clamp(28px, 4.5vw, 56px)',
                lineHeight: 1.12,
                letterSpacing: '.04em',
                color: C.text,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              The Master Craft Catalogue
            </h2>
            <p
              style={{
                ...ff.serif,
                fontSize: 'clamp(15px, 1.6vw, 20px)',
                color: C.dim,
                fontStyle: 'italic',
                maxWidth: 680,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Expand each sacred discipline to explore our traditional lost-wax metallurgy, hand-beaten Nagas artistry,
              and temple regalia.
            </p>
          </div>
        </Reveal>

        {/* React Bits AccordionGallery with GSAP, Parallax & 3D Tilt */}
        <AccordionGallery onSelectCategory={handleAccordionSelect} />

        {/* Detailed Metallurgy Specification Tabs */}
        <div style={{ marginTop: 64, paddingTop: 48, borderTop: `1px solid ${C.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span
              style={{
                ...ff.body,
                fontSize: 8,
                letterSpacing: '.35em',
                color: C.dim,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              METALLURGICAL SPECIFICATIONS &amp; TECHNIQUES
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {metals.map((mt, i) => (
              <motion.button
                key={mt.name}
                onClick={() => setActiveMetal(i)}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...ff.body,
                  padding: '12px 24px',
                  fontSize: 8,
                  letterSpacing: '.28em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: `1px solid ${activeMetal === i ? mt.accent : C.border}`,
                  cursor: 'pointer',
                  background: activeMetal === i ? mt.accent : C.surfaceGold,
                  color: activeMetal === i ? (C.isDark ? '#000' : '#fff') : C.dim,
                  transition: 'all .3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 2,
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>{mt.icon}</span>
                {mt.name}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMetal}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="vmw-services-card"
              style={{
                display: 'grid',
                border: `1px solid ${C.border}`,
                background: C.bg2,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(200px,30vw,340px)' }}>
                <img
                  src={m.img}
                  alt={m.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.55,
                    filter: 'sepia(14%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(8,6,4,0.3) 0%, rgba(8,6,4,0.95) 100%)',
                  }}
                />
                <div style={{ position: 'absolute', bottom: 32, left: 28, right: 28 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{m.icon}</div>
                  <div
                    style={{
                      ...ff.display,
                      fontSize: 28,
                      color: C.text,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      marginBottom: 8,
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{
                      ...ff.body,
                      fontSize: 8,
                      letterSpacing: '.38em',
                      color: m.accent,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    {m.badge}
                  </div>
                  <div
                    style={{
                      ...ff.serif,
                      fontSize: 14,
                      lineHeight: 1.8,
                      color: C.dim,
                      fontStyle: 'italic',
                    }}
                  >
                    {m.desc}
                  </div>
                </div>
              </div>

              <div className="vmw-services-right" style={{ padding: 'clamp(20px,3.5vw,40px)', display: 'flex', flexDirection: 'column' }}>
                {m.services.map((s, i) => (
                  <div
                    key={s.t}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      padding: '18px 0',
                      ...(i === m.services.length - 1 ? { borderBottom: 'none' } : {}),
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <span
                        style={{
                          ...ff.body,
                          fontSize: 9,
                          color: m.accent,
                          fontWeight: 700,
                          opacity: 0.7,
                          marginTop: 3,
                          minWidth: 24,
                        }}
                      >
                        0{i + 1}
                      </span>
                      <div>
                        <div
                          style={{
                            ...ff.serif,
                            fontSize: 18,
                            color: C.text,
                            fontWeight: 600,
                            marginBottom: 6,
                            letterSpacing: '.02em',
                          }}
                        >
                          {s.t}
                        </div>
                        <div style={{ ...ff.body, fontSize: 12, lineHeight: 1.8, color: C.dim, fontWeight: 300 }}>
                          {s.d}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <SectionCTA
          primary="Commission a Custom Piece"
          secondary="View Artwork Catalogue"
          onPrimary={() => setShowCommissionModal(true)}
          onSecondary={() => navigate('/gallery')}
        />
      </div>
    </section>
  );
};

export default Services;
