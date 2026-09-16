import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Dot } from './Button';

const Ticker = () => {
  const C = useTheme();
  const items = [
    "MEENAKSHI AMMAN",
    "BRIHADEESWARAR",
    "SRIRANGAM",
    "TIRUMALA TIRUPATI",
    "MURUGAN LONDON",
    "GOLDEN TEMPLE VELLORE",
    "NATARAJA CHIDAMBARAM",
    "KAPALEESWARAR CHENNAI",
    "VAIKUNDA VASA PERUMAL"
  ];
  const all = [...items, ...items, ...items];
  return (
    <div style={{
      overflow: 'hidden',
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      padding: '12px 0',
      background: 'rgba(20,18,16,0.8)',
      position: 'relative',
      zIndex: 2
    }}>
      <motion.div
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 70, ease: 'linear', repeat: Infinity }}
        style={{ display: 'flex', whiteSpace: 'nowrap' }}
      >
        {all.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{
              ...ff.body,
              fontSize: 8,
              letterSpacing: '.44em',
              color: C.faint,
              fontWeight: 600,
              padding: '0 26px',
              textTransform: 'uppercase'
            }}>
              {t}
            </span>
            <Dot />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Ticker;
