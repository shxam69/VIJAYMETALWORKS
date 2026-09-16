import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';

const PremiumFilterTabs = ({ filters, active, onChange, C }) => {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [underline, setUnderline] = useState({ left:0, width:0 });
  const [ripples, setRipples] = useState({});

  // Measure active tab for sliding underline
  useEffect(() => {
    const activeEl = tabRefs.current[active];
    const container = containerRef.current;
    if (!activeEl || !container) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    setUnderline({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [active]);

  const fireRipple = (filter, e) => {
    const btn = tabRefs.current[filter];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const id = Date.now();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples(r => ({ ...r, [filter]: [...(r[filter]||[]), { id, x, y }] }));
    setTimeout(() => {
      setRipples(r => ({ ...r, [filter]: (r[filter]||[]).filter(rp => rp.id !== id) }));
    }, 700);
  };

  return (
    <div ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2,
        padding: '6px 8px',
        background: C.isDark ? 'rgba(14,11,8,0.72)' : 'rgba(245,240,232,0.82)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1px solid ${C.isDark ? 'rgba(255,215,0,0.14)' : 'rgba(180,130,10,0.20)'}`,
        borderRadius: 14,
        boxShadow: C.isDark
          ? '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 4px 24px rgba(0,0,0,0.10)',
      }}
    >
      {/* Sliding gold underline */}
      <motion.div
        animate={{ left: underline.left, width: underline.width }}
        transition={{ type:'spring', stiffness:380, damping:30 }}
        style={{
          position: 'absolute',
          bottom: 5,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${C.gold} 30%, ${C.goldLt} 50%, ${C.gold} 70%, transparent 100%)`,
          borderRadius: 2,
          pointerEvents: 'none',
          zIndex: 3,
          boxShadow: `0 0 8px rgba(255,215,0,0.5)`,
        }}
      />

      {filters.map(f => {
        const isActive = f === active;
        return (
          <button
            key={f}
            ref={el => tabRefs.current[f] = el}
            onClick={e => { onChange(f); fireRipple(f, e); }}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '9px 18px',
              background: isActive
                ? (C.isDark ? 'rgba(255,215,0,0.13)' : 'rgba(180,130,10,0.11)')
                : 'transparent',
              border: `1px solid ${isActive
                ? (C.isDark ? 'rgba(255,215,0,0.35)' : 'rgba(180,130,10,0.32)')
                : 'transparent'}`,
              borderRadius: 9,
              ...ff.body,
              fontSize: 7.5,
              letterSpacing: '.28em',
              fontWeight: isActive ? 800 : 600,
              textTransform: 'uppercase',
              color: isActive ? C.gold : C.dim,
              cursor: 'pointer',
              transition: 'background .25s, border-color .25s, color .25s, box-shadow .25s',
              boxShadow: isActive
                ? `0 0 14px rgba(255,215,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)`
                : 'none',
              zIndex: 2,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = C.isDark ? 'rgba(255,215,0,0.07)' : 'rgba(180,130,10,0.06)';
                e.currentTarget.style.color = C.isDark ? 'rgba(255,215,0,0.75)' : C.text;
                e.currentTarget.style.boxShadow = `0 0 10px rgba(255,215,0,0.12)`;
                e.currentTarget.style.borderColor = C.isDark ? 'rgba(255,215,0,0.15)' : 'rgba(180,130,10,0.18)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = C.dim;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {/* Ripple layer */}
            {(ripples[f]||[]).map(rp => (
              <span key={rp.id} style={{
                position: 'absolute',
                left: rp.x, top: rp.y,
                width: 8, height: 8,
                background: isActive ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.18)',
                transform: 'translate(-50%,-50%) scale(0)',
                animation: 'rippleOut .7s ease-out forwards',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}/>
            ))}
            {f}
          </button>
        );
      })}
    </div>
  );
};


export default PremiumFilterTabs;
