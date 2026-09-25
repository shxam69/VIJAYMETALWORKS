import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { Reveal } from '../common/Animations';

const VisitingCard = () => {
  const C = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const trackDownload = async (downloadType) => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    try {
      await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'visiting_card_download',
          metadata: {
            download_type: downloadType,
            timestamp: new Date().toISOString(),
            ua: navigator.userAgent ? navigator.userAgent.slice(0, 120) : '',
          },
        }),
      });
    } catch (_) {
      /* silent fallback */
    }
  };

  const handleDownloadCard = () => {
    trackDownload('visiting_card_image');
    const link = document.createElement('a');
    link.href = '/visiting_card.png';
    link.download = 'Vijay_Metal_Works_Visiting_Card.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveContact = () => {
    trackDownload('visiting_card_vcf');
    const vcfContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Vijay Metal Works',
      'ORG:Vijay Metal Works',
      'TITLE:I. Vijay (Proprietor)',
      'TEL;TYPE=WORK,VOICE:+919382877351',
      'TEL;TYPE=CELL,VOICE,WHATSAPP:+919382877351',
      'EMAIL;TYPE=WORK,INTERNET:vijaymetalworks4u@gmail.com',
      'ADR;TYPE=WORK:;;New No. 3, Old No. 19, Murugappa Street;Sowcarpet;Chennai;Tamil Nadu;600079;India',
      'URL:https://vijaymetalworks.com',
      'NOTE:Temple Metal Craftsmanship Since 1915. Sowcarpet, Chennai.',
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Vijay_Metal_Works.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMouseMove = (e) => {
    if (isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / 16);
    setRotateY(x / 16);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section
      id="visiting-card"
      className="section-pad"
      style={{
        position: 'relative',
        zIndex: 2,
        background: C.bg2,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div className="vmw-container">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
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
              DIGITAL VISITING CARD
            </span>
            <h2
              style={{
                ...ff.display,
                fontSize: 'clamp(28px, 4.5vw, 52px)',
                lineHeight: 1.1,
                letterSpacing: '.04em',
                color: C.text,
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              CARRY OUR WORKSHOP WITH YOU
            </h2>
            <p
              style={{
                ...ff.serif,
                fontSize: 'clamp(15px, 1.6vw, 19px)',
                color: C.dim,
                fontStyle: 'italic',
                maxWidth: 620,
                margin: '0 auto',
                lineHeight: 1.75,
              }}
            >
              Keep the official Vijay Metal Works contact card for easy reference and sharing.
            </p>
          </div>
        </Reveal>

        {/* 3D Flip Card Container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              perspective: 1200,
              width: '100%',
              maxWidth: 520,
              aspectRatio: '1.716 / 1',
              cursor: 'pointer',
              marginBottom: 28,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsFlipped((prev) => !prev)}
            title="Click to flip card"
          >
            <motion.div
              animate={{
                rotateY: isFlipped ? 180 : rotateY,
                rotateX: isFlipped ? 0 : rotateX,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                borderRadius: 8,
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.25)',
              }}
            >
              {/* FRONT: Official visiting_card.png */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#f4ede2',
                }}
              >
                <img
                  src="/visiting_card.png"
                  alt="Vijay Metal Works Official Visiting Card"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 12,
                    background: 'rgba(0,0,0,0.65)',
                    color: '#FFD700',
                    fontSize: 9,
                    letterSpacing: '.15em',
                    padding: '3px 8px',
                    borderRadius: 3,
                    textTransform: 'uppercase',
                    fontFamily: "'Jost', sans-serif",
                    pointerEvents: 'none',
                  }}
                >
                  ↻ Tap to Flip
                </div>
              </div>

              {/* BACK: Verified Workshop Information */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: 8,
                  background: C.bg1,
                  border: `1px solid ${C.borderGold}`,
                  padding: 'clamp(20px, 4vw, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <span
                        style={{
                          ...ff.body,
                          fontSize: 8,
                          letterSpacing: '.3em',
                          color: C.gold,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        ESTD. 1915 · CHENNAI
                      </span>
                      <h4 style={{ ...ff.display, fontSize: 18, color: C.text, fontWeight: 700, marginTop: 4 }}>
                        VIJAY METAL WORKS
                      </h4>
                    </div>
                    <span style={{ fontSize: 18, color: C.gold }}>✦</span>
                  </div>

                  <p style={{ ...ff.serif, fontSize: 12.5, color: C.dim, fontStyle: 'italic', marginBottom: 16 }}>
                    Temple Metal Craftsmanship Since 1915
                  </p>

                  <div style={{ ...ff.body, fontSize: 11, color: C.dim, lineHeight: 1.8 }}>
                    <div>
                      <strong style={{ color: C.text }}>Proprietor:</strong> {BIZ.owner}
                    </div>
                    <div>
                      <strong style={{ color: C.text }}>Phone:</strong> {BIZ.phone}
                    </div>
                    <div>
                      <strong style={{ color: C.text }}>Email:</strong> {BIZ.email}
                    </div>
                    <div>
                      <strong style={{ color: C.text }}>Address:</strong> {BIZ.address}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <span style={{ ...ff.body, fontSize: 8.5, color: C.faint, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                    SOWCARPET, CHENNAI – 600 079
                  </span>
                  <span style={{ ...ff.body, fontSize: 8.5, color: C.gold, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                    ↻ Tap to Flip Back
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* TWO ACTION BUTTONS */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 12,
            }}
          >
            <motion.button
              type="button"
              onClick={handleDownloadCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '13px 26px',
                background: C.gold,
                color: '#000',
                border: 'none',
                borderRadius: 4,
                fontFamily: "'Jost', sans-serif",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 8px 24px ${C.gold}28`,
              }}
            >
              <span>📥</span>
              DOWNLOAD VISITING CARD
            </motion.button>

            <motion.button
              type="button"
              onClick={handleSaveContact}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '13px 26px',
                background: 'transparent',
                color: C.text,
                border: `1px solid ${C.borderGold}`,
                borderRadius: 4,
                fontFamily: "'Jost', sans-serif",
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>📇</span>
              SAVE CONTACT
            </motion.button>
          </div>

          {/* Small text */}
          <span
            style={{
              ...ff.body,
              fontSize: 10,
              letterSpacing: '.18em',
              color: C.faint,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Official Vijay Metal Works contact information
          </span>
        </div>
      </div>
    </section>
  );
};

export default VisitingCard;
