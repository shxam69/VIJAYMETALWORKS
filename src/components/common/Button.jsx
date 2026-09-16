import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { Reveal } from './Animations';

const Dot = () => {
  const C = useTheme();
  return (
    <svg width="5" height="5" viewBox="0 0 5 5" style={{ flexShrink:0 }}>
      <rect x="1" y="1" width="3" height="3" fill={C.gold} transform="rotate(45 2.5 2.5)" opacity=".8"/>
    </svg>
  );
};

const GoldRule = ({ w='100%', my=0, opacity=.14 }) => {
  const C = useTheme();
  return (
    <div style={{ width:w, height:1, background:`linear-gradient(90deg, transparent, ${C.gold}88, transparent)`, margin:`${my}px 0`, opacity }} />
  );
};

const StarBorderButton = ({ children, onClick, style={}, speed=6 }) => {
  const C = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ position:'relative', display:'inline-block', cursor:'pointer', ...style }}>
      <div style={{ position:'absolute', inset:-1, borderRadius:6, overflow:'hidden', pointerEvents:'none', opacity:hovered?.55:.28, transition:'opacity .3s' }}>
        <div style={{ position:'absolute', width:'200%', height:'200%', top:'-50%', left:'-50%',
          background:`conic-gradient(from 0deg,transparent 340deg,${C.goldLt} 355deg,rgba(255,255,255,0.6) 360deg,${C.goldLt} 5deg,transparent 20deg)`,
          animation:`starBorderSpin ${speed}s linear infinite` }}/>
        <div style={{ position:'absolute', inset:2, background:C.bg1, borderRadius:4 }}/>
      </div>
      <div style={{ position:'relative', padding:'12px 32px',
        background: hovered ? `rgba(255,215,0,0.1)` : 'transparent',
        border:`1px solid ${hovered ? C.goldLt : C.borderGold}`, borderRadius:4,
        color:hovered ? C.goldLt : C.gold,
        fontFamily:"'Jost',sans-serif", fontSize:9,
        letterSpacing:'.35em', fontWeight:700, textTransform:'uppercase',
        transition:'color .3s, background .3s, border-color .3s', whiteSpace:'nowrap' }}>
        {children}
      </div>
    </div>
  );
};

const CurvyButton = ({ children, onClick, primary=false, style={} }) => {
  const C = useTheme();
  const btnRef = useRef(null);
  const rafRef = useRef(null);

  // Cursor proximity effect — magnetic repel/attract
  const handleMouseMove = useCallback((e) => {
    const btn = btnRef.current;
    if (!btn) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const maxDist = 90;
      if (dist < maxDist) {
        const factor = (1 - dist / maxDist) * 5;
        btn.style.transform = `translate(${dx * factor * 0.06}px, ${dy * factor * 0.06}px)`;
        if (primary) {
          const glowOpacity = (1 - dist / maxDist) * 0.38;
          btn.style.boxShadow = `0 0 ${20 + factor*4}px rgba(255,215,0,${glowOpacity}), inset 0 1px 0 rgba(255,255,255,0.30)`;
        } else {
          const glowOpacity = (1 - dist / maxDist) * 0.18;
          btn.style.boxShadow = `0 0 ${14 + factor*3}px rgba(255,215,0,${glowOpacity})`;
        }
      }
    });
  }, [primary]);

  const handleMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    btn.style.transform = '';
    btn.style.boxShadow = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  const cls = primary
    ? 'vmw-btn-primary'
    : `vmw-btn-secondary${!C.isDark ? ' vmw-btn-secondary-light' : ''}`;

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseLeave={handleMouseLeave}
      className={cls}
      style={style}
    >
      {children}
    </button>
  );
};

const SectionCTA = ({ primary="Commission a Piece", secondary="View Gallery", onPrimary, onSecondary }) => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  return (
    <Reveal delay={.15}>
      <div className="section-cta-row" style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginTop:52, paddingTop:44, borderTop:`1px solid ${C.border}` }}>
        <CurvyButton primary onClick={onPrimary || (()=>setShowCommissionModal(true))}>
          {primary}
        </CurvyButton>
        <StarBorderButton onClick={onSecondary || (()=>navigate('/gallery'))} speed={6}>
          {secondary}
        </StarBorderButton>
      </div>
    </Reveal>
  );
};

export { Dot, GoldRule, StarBorderButton, CurvyButton, SectionCTA };
