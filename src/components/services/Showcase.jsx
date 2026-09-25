import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { SlideLeft, SlideRight } from '../common/Animations';
import { GoldRule, CurvyButton, StarBorderButton } from '../common/Button';

const CraftworkPanel = () => {
  const C = useTheme();
  const PANEL_IMGS = [
    { src:'/gallery/gold/sadarigold.jpg',   label:'Sadari Gold — 24K Nagas Work' },
    { src:'/gallery/gold/crown.jpg',         label:'Crown Work — Gold Handcrafted' },
    { src:'/gallery/gold/kanganam4.jpg',     label:'Kanganam — Gold Stone Setting' },
    { src:'/gallery/gold/kandabaranam.jpg',  label:'Kandabaranam — Crown Work' },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % PANEL_IMGS.length), 3200);
    return () => clearInterval(t);
  }, [PANEL_IMGS.length]);

  return (
    /* height replaced with clamp() — no more fixed 540px */
    <div style={{
      position:'relative',
      height:'clamp(260px,42vw,540px)',
      overflow:'hidden',
      border:`1px solid ${C.border}`,
      background:C.bg2,
    }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={active}
          src={PANEL_IMGS[active].src}
          alt={PANEL_IMGS[active].label}
          initial={{ opacity:0, scale:1.06 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0, scale:.97 }}
          transition={{ duration:.9, ease:[.16,1,.3,1] }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'sepia(12%) brightness(.92)' }}
        />
      </AnimatePresence>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,6,4,.85) 0%, transparent 55%)' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${C.gold}66, transparent)` }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'22px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration:.4 }}>
            <div style={{ ...ff.display, fontSize:'clamp(12px,1.4vw,15px)', color:'#FFFFFF', fontWeight:600, marginBottom:4, textShadow:'0 2px 8px rgba(0,0,0,0.8)' }}>{PANEL_IMGS[active].label}</div>
            <div style={{ ...ff.body, fontSize:7.5, letterSpacing:'.4em', color:'#FFD700', fontWeight:600, textTransform:'uppercase', textShadow:'0 2px 6px rgba(0,0,0,0.8)' }}>Vijay Metal Works · Sowcarpet · Since 1915</div>
          </motion.div>
        </AnimatePresence>
        <div style={{ display:'flex', gap:6, marginTop:14 }}>
          {PANEL_IMGS.map((_,i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: i===active ? 20 : 6, height:6, borderRadius:3, border:'none', cursor:'pointer',
                background: i===active ? C.gold : 'rgba(255,255,255,0.22)', transition:'all .3s', padding:0 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Showcase = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  return (
  <section id="showcase" className="section-pad" style={{position:'relative',zIndex:2,background:C.bg3,borderTop:`1px solid ${C.border}`}}>
    <div className="vmw-container">
      {/* two-col handles responsive collapse at ≤900px via CSS */}
      <div className="two-col" style={{display:'grid',alignItems:'center'}}>
        <SlideLeft>
          <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:18}}>Masterpiece Gallery</span>
          <h2 style={{...ff.display,fontSize:'clamp(28px,5vw,62px)',lineHeight:.9,letterSpacing:'.04em',color:C.text,fontWeight:700,marginBottom:24}}>
            OUR SACRED<br/><span style={{color:'#FFD700'}}>CRAFT</span>
          </h2>
          <GoldRule w="56px" opacity={.5}/>
          <p style={{...ff.serif,fontSize:'clamp(15px,1.7vw,17px)',lineHeight:2.1,color:C.dim,fontWeight:300,fontStyle:'italic',marginTop:28,marginBottom:20}}>
            Each piece we craft is a living prayer — hand-beaten, stone-set, and finished by master artisans who carry four generations of devotion from our Sowcarpet workshop.
          </p>
          <p style={{...ff.body,fontSize:'clamp(10px,1vw,11px)',lineHeight:1.95,color:C.faint,fontWeight:300}}>
            Every piece that leaves Murugappa Street carries a century's devotion.
          </p>
          <div style={{marginTop:36,display:'flex',gap:14,flexWrap:'wrap'}}>
            <CurvyButton primary onClick={()=>navigate('/gallery')}>View Gallery</CurvyButton>
            <StarBorderButton onClick={()=>setShowCommissionModal(true)} speed={7}>Commission</StarBorderButton>
          </div>
        </SlideLeft>
        <SlideRight delay={.12}>
          <div style={{position:'relative'}}>
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h])=>(
              <div key={`${v}${h}`} style={{position:'absolute',[v]:-12,[h]:-12,width:26,height:26,zIndex:2,
                borderTop:v==='top'?`1px solid ${C.borderHi}`:'none',borderBottom:v==='bottom'?`1px solid ${C.borderHi}`:'none',
                borderLeft:h==='left'?`1px solid ${C.borderHi}`:'none',borderRight:h==='right'?`1px solid ${C.borderHi}`:'none',opacity:.5}}/>
            ))}
            <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at 50% 50%,rgba(255,255,255,.02) 0%,transparent 68%)`}}/>
            <div style={{position:'relative',zIndex:1}}>
              <CraftworkPanel/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:90,background:`linear-gradient(to top,${C.bg1},transparent)`,pointerEvents:'none'}}/>
            </div>
          </div>
        </SlideRight>
      </div>
    </div>
  </section>
  );
};

export default Showcase;
