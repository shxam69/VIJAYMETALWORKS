import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ onDone }) => {
  const C = useTheme();
  const [phase, setPhase] = useState(0);
  // phase 0=mount, 1=line-in, 2=letters reveal, 3=subtitle+bar, 4=exit
  const [pct, setPct] = useState(0);
  const [lettersDone, setLettersDone] = useState(false);

  const BRAND = 'VIJAY METAL WORKS';
  const letters = BRAND.split('');

  // On mobile, skip the full splash — show briefly and exit fast
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(()=>{
    if (isMobile) {
      // Mobile: fast splash — 2.5 seconds total
      const t1 = setTimeout(()=>setPhase(1), 100);
      const t2 = setTimeout(()=>setPhase(2), 400);
      const t3 = setTimeout(()=>setPhase(3), 1000);
      const t4 = setTimeout(()=>setPhase(4), 2200);
      const t5 = setTimeout(()=>onDone(), 2500);
      return()=>{ [t1,t2,t3,t4,t5].forEach(clearTimeout); };
    }
    // Desktop: 2.5 seconds total
    const t1 = setTimeout(()=>setPhase(1), 150);
    const t2 = setTimeout(()=>setPhase(2), 500);
    const t3 = setTimeout(()=>setPhase(3), 1100);
    const t4 = setTimeout(()=>setPhase(4), 2200);
    const t5 = setTimeout(()=>onDone(), 2500);
    return()=>{ [t1,t2,t3,t4,t5].forEach(clearTimeout); };
  },[onDone, isMobile]);

  // Percentage counter tied to phase 3
  useEffect(()=>{
    if(phase < 3) return;
    let start = null;
    const DURATION = 1100; // Duration adjusted to fit 2.5s total
    const tick = (ts) => {
      if(!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setPct(Math.round(eased * 100));
      if(progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  },[phase]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          key="luxury-loader"
          exit={{ opacity:0, filter:'blur(12px)' }}
          transition={{ duration:.52, ease:[.76,0,.24,1] }}
          style={{
            position:'fixed', inset:0, zIndex:500,
            background:C.loaderBg,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            overflow:'hidden',
          }}
        >
          {/* Deep radial ambient glow */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            background:'radial-gradient(ellipse 55% 40% at 50% 52%, rgba(255,215,0,0.055) 0%, transparent 68%)',
          }}/>

          {/* Noise grain overlay */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none', opacity:.018,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat:'repeat', backgroundSize:'200px 200px',
          }}/>

          {/* ── Top thin gold line sweep ── */}
          <motion.div
            initial={{ scaleX:0, opacity:0 }}
            animate={ phase>=1 ? { scaleX:1, opacity:1 } : { scaleX:0, opacity:0 } }
            transition={{ duration:.65, ease:[.16,1,.3,1] }}
            style={{
              position:'absolute', top:'38%', left:'50%',
              transform:'translateX(-50%)', transformOrigin:'left center',
              width:320, height:1,
              background:'linear-gradient(90deg, transparent, rgba(255,215,0,0.55), transparent)',
            }}
          />

          {/* ── Main brand letters ── */}
          <div style={{
            position:'relative', zIndex:2,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexWrap:'nowrap', gap:0,
            userSelect:'none',
          }}>
            {letters.map((letter, i) => {
              const isSpace = letter === ' ';
              return (
                <motion.span
                  key={i}
                  initial={{ opacity:0, y:18, filter:'blur(6px)' }}
                  animate={ phase>=2
                    ? { opacity:1, y:0, filter:'blur(0px)' }
                    : { opacity:0, y:18, filter:'blur(6px)' }
                  }
                  transition={{
                    duration:.52,
                    delay: isSpace ? 0 : (i * 0.038) + 0.04,
                    ease:[.16,1,.3,1],
                  }}
                  onAnimationComplete={()=>{ if(i===letters.length-1) setLettersDone(true); }}
                  style={{
                    fontFamily:"'Cinzel',Georgia,serif",
                    fontSize:'clamp(22px,4.5vw,46px)',
                    fontWeight:700,
                    letterSpacing:'.28em',
                    color:'transparent',
                    backgroundClip:'text',
                    WebkitBackgroundClip:'text',
                    backgroundImage:'linear-gradient(135deg,#CC9900 0%,#FFD700 38%,#FFE88A 58%,#FFD700 75%,#CC9900 100%)',
                    backgroundSize:'200% 100%',
                    animation: lettersDone ? 'loaderGoldShine 3.2s ease-in-out infinite' : 'none',
                    display:'inline-block',
                    width: isSpace ? '0.5em' : 'auto',
                    minWidth: isSpace ? '0.5em' : 'auto',
                    textShadow:'0 0 28px rgba(255,215,0,0.22)',
                  }}
                >
                  {isSpace ? '\u00A0' : letter}
                </motion.span>
              );
            })}
          </div>

          {/* ── Subtitle line ── */}
          <AnimatePresence>
            {phase>=3 && (
              <motion.div
                key="subtitle"
                initial={{ opacity:0, y:8, filter:'blur(4px)' }}
                animate={{ opacity:1, y:0, filter:'blur(0px)' }}
                exit={{ opacity:0 }}
                transition={{ duration:.48, delay:.08, ease:[.16,1,.3,1] }}
                style={{
                  marginTop:16, textAlign:'center',
                  fontFamily:"'Jost',sans-serif",
                  fontSize:9, letterSpacing:'.58em',
                  color:'rgba(255,215,0,0.52)',
                  fontWeight:600, textTransform:'uppercase',
                }}
              >
                SINCE 1915 · TEMPLE METALCRAFT
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Premium loading bar ── */}
          <AnimatePresence>
            {phase>=3 && (
              <motion.div
                key="loadbar"
                initial={{ opacity:0, scaleX:.6 }}
                animate={{ opacity:1, scaleX:1 }}
                exit={{ opacity:0 }}
                transition={{ duration:.4, delay:.14, ease:[.16,1,.3,1] }}
                style={{ marginTop:36, textAlign:'center', position:'relative' }}
              >
                {/* Track */}
                <div style={{
                  width:200, height:1,
                  background:'rgba(255,215,0,0.12)',
                  borderRadius:1, position:'relative', overflow:'hidden',
                }}>
                  {/* Fill */}
                  <div style={{
                    position:'absolute', top:0, left:0, height:'100%',
                    width:`${pct}%`,
                    background:'linear-gradient(90deg,#CC9900,#FFD700,#FFE88A)',
                    borderRadius:1,
                    transition:'width .018s linear',
                    boxShadow:'0 0 8px rgba(255,215,0,0.5)',
                  }}/>
                  {/* Shimmer glint */}
                  <motion.div
                    animate={{ x:[-40, 240] }}
                    transition={{ duration:1.4, repeat:Infinity, ease:'easeInOut', repeatDelay:.2 }}
                    style={{
                      position:'absolute', top:0, left:0,
                      width:32, height:'100%',
                      background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)',
                    }}
                  />
                </div>
                {/* Counter */}
                <div style={{
                  fontFamily:"'Jost',sans-serif",
                  fontSize:8, letterSpacing:'.32em',
                  color:C.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  marginTop:9, fontWeight:500,
                }}>
                  {pct}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom thin gold line sweep ── */}
          <motion.div
            initial={{ scaleX:0, opacity:0 }}
            animate={ phase>=1 ? { scaleX:1, opacity:1 } : { scaleX:0, opacity:0 } }
            transition={{ duration:.65, delay:.1, ease:[.16,1,.3,1] }}
            style={{
              position:'absolute', bottom:'38%', left:'50%',
              transform:'translateX(-50%)', transformOrigin:'right center',
              width:320, height:1,
              background:'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
            }}
          />

          {/* Inject keyframe for gold shine */}
          <style>{`
            @keyframes loaderGoldShine {
              0%   { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
