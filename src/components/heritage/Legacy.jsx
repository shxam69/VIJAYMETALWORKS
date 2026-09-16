import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { Reveal } from '../common/Animations';
import { SectionCTA, GoldRule } from '../common/Button';

const MILESTONES = [
  {
    year: '1915',
    title: 'Founded in Sowcarpet',
    subtitle: 'The Inception of Sacred Metallurgy',
    description:
      'Established in the historic artisanal heart of Chennai on Murugappa Street, dedicated to creating sacred temple metalwork adhering strictly to Shilpa Shastras and Agama canons.',
    tag: 'Origin',
  },
  {
    year: 'Generations',
    title: 'Generations of Craftsmanship',
    subtitle: 'Unbroken Sthapathi Lineage',
    description:
      'Knowledge passed from father to son across generations. Master artisans maintaining authentic lost-wax Panchaloha casting and hand-beaten sheet metal expertise without industrial compromise.',
    tag: 'Heritage',
  },
  {
    year: 'Sanctum',
    title: 'Temple Metalwork & Regalia',
    subtitle: 'Adorning Revered Shrines',
    description:
      'Crafting magnificent Vimana Kalasams, Kireedams (sacred crowns), Kavachas (deity body armor), and temple procession vahana ornaments for celebrated South Indian and global temples.',
    tag: 'Dedication',
  },
  {
    year: 'Artistry',
    title: 'Traditional Nagas Techniques',
    subtitle: 'Sacred Repoussé & Chasing',
    description:
      'Mastery in the meticulous Nagas technique — filling metal forms with natural tree-resin pitch beds, using hand punches and micro-chisels to emboss three-dimensional divine motifs.',
    tag: 'Mastery',
  },
  {
    year: 'Precision',
    title: 'Longevity & Modern Purity',
    subtitle: 'Certified Metals & Plating',
    description:
      'Combining classical metallurgy with certified 24K gold and 92.5 sterling silver electro-plating, ensuring temple artworks withstand centuries of daily abhishekam and rituals.',
    tag: 'Craft',
  },
  {
    year: 'Today',
    title: 'Living Heritage Under I. Vijay',
    subtitle: 'Global Temple Shrines',
    description:
      'Serving sanctums across India, the United Kingdom, UAE, and Southeast Asia from our original Sowcarpet atelier, carrying the hundred-year legacy forward with quiet devotion.',
    tag: 'Present',
  },
];

const Legacy = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section id="legacy" className="section-pad" style={{ position: 'relative', zIndex: 2, background: C.bg2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <Reveal>
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
              HERITAGE &amp; LINEAGE
            </span>
            <h2
              style={{
                ...ff.display,
                fontSize: 'clamp(28px, 4.5vw, 54px)',
                lineHeight: 1.12,
                letterSpacing: '.04em',
                color: C.text,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              A Century of Sacred Metallurgy
            </h2>
            <p
              style={{
                ...ff.serif,
                fontSize: 'clamp(16px, 1.8vw, 22px)',
                lineHeight: 1.8,
                color: C.dim,
                fontStyle: 'italic',
                maxWidth: 720,
                margin: '0 auto',
              }}
            >
              Founded in 1915 in Chennai&apos;s historic Sowcarpet district — preserving four generations of devotional
              craftsmanship in 24K Gold, Silver, Brass, Copper &amp; Panchaloha.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <GoldRule w="80px" opacity={0.4} />
            </div>
          </Reveal>
        </div>

        {/* Editorial Timeline Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 64,
          }}
        >
          {MILESTONES.map((item, i) => {
            const isSelected = activeIdx === i;
            return (
              <motion.div
                key={item.year + i}
                onClick={() => setActiveIdx(i)}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'relative',
                  padding: '36px 32px',
                  background: isSelected ? C.bg3 : C.bg1,
                  border: `1px solid ${isSelected ? C.gold : C.border}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 12px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${C.gold}44` : 'none',
                  transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                }}
              >
                {/* Year / Marker & Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span
                    style={{
                      ...ff.display,
                      fontSize: 'clamp(20px, 2vw, 28px)',
                      color: isSelected ? C.gold : C.text,
                      fontWeight: 700,
                      letterSpacing: '.05em',
                    }}
                  >
                    {item.year}
                  </span>
                  <span
                    style={{
                      ...ff.body,
                      fontSize: 8,
                      letterSpacing: '.28em',
                      color: C.goldLt,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      border: `1px solid ${C.borderGold}`,
                      borderRadius: 999,
                      background: 'rgba(212, 175, 55, 0.05)',
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <h3
                  style={{
                    ...ff.display,
                    fontSize: 18,
                    color: C.text,
                    fontWeight: 600,
                    letterSpacing: '.03em',
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </h3>

                <div
                  style={{
                    ...ff.serif,
                    fontSize: 13,
                    color: C.gold,
                    fontStyle: 'italic',
                    letterSpacing: '.04em',
                    marginBottom: 14,
                  }}
                >
                  {item.subtitle}
                </div>

                <p
                  style={{
                    ...ff.body,
                    fontSize: 13,
                    color: C.dim,
                    lineHeight: 1.75,
                    letterSpacing: '.01em',
                  }}
                >
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Authenticity Assurance Callout */}
        <Reveal>
          <div
            style={{
              padding: '32px 40px',
              border: `1px solid ${C.borderGold}`,
              background: 'rgba(212, 175, 55, 0.03)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 700 }}>
              <div style={{ ...ff.display, fontSize: 16, color: C.text, fontWeight: 700, marginBottom: 6 }}>
                Atelier Location &amp; Verification
              </div>
              <div style={{ ...ff.body, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                Operating continuously from {BIZ.address}. We invite temple trustees, patrons, and architects to consult
                directly with proprietor {BIZ.owner} for sacred projects.
              </div>
            </div>
            <a
              href={BIZ.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...ff.body,
                fontSize: 10,
                letterSpacing: '.25em',
                color: C.goldLt,
                fontWeight: 700,
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '12px 24px',
                border: `1px solid ${C.gold}`,
                borderRadius: 999,
                whiteSpace: 'nowrap',
              }}
            >
              VIEW ATELIER ON MAP →
            </a>
          </div>
        </Reveal>

        <SectionCTA
          primary="Commission a Sacred Piece"
          secondary="Explore Our Gallery"
          onPrimary={() => setShowCommissionModal(true)}
        />
      </div>
    </section>
  );
};

export default Legacy;
