import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItemLeft, StaggerItemRight } from '../common/Animations';
import { GoldRule, SectionCTA } from '../common/Button';

const Testimonials = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const AUTO_MS = 6000;
  const testimonials = [
    { name:'Shri. Venkataraman Pillai', role:'Temple Trustee, Meenakshi Amman, Madurai', quote:'Vijay Metal Works has been crafting for our temple for over 40 years. The quality of their Panchaloha work is unmatched — every detail follows Agamic tradition perfectly. I. Vijay personally ensures every piece meets our standards.', rating:5, work:'Panchaloha Vigraham', year:'2023' },
    { name:'Swami Thiru Arunachalam', role:'Head Priest, Nataraja Temple, Chidambaram', quote:'We commissioned a full silver Prabhavali arch from Vijay Metal Works in 2022. The craftsmanship is extraordinary — precise nagas work that honours our 1000-year temple tradition. Delivered on time, within budget, and perfectly consecrated.', rating:5, work:'Silver Prabhavali Arch', year:'2022' },
    { name:'Sri. Krishnamurthy', role:'Secretary, London Murugan Temple', quote:'As the temple secretary in London, finding authentic Panchaloha craftsmen in Chennai was our challenge. Vijay Metal Works handled international shipping with full documentation. Our congregation is deeply moved by the quality of the idol.', rating:5, work:'International Commission', year:'2023' },
    { name:'Smt. Rajalakshmi Sundaram', role:'Trustee, Kapaleeswarar Temple, Chennai', quote:'I. Vijay himself oversees each project. For our Kireedam crown, he visited the temple to take precise measurements of the deity. That personal dedication is what sets Vijay Metal Works apart from any other craftsmen we have worked with.', rating:5, work:'24K Gold Kireedam', year:'2024' },
    { name:'Sri. Balakrishnan Iyer', role:'Head Priest, Brihadeeswarar Temple, Thanjavur', quote:'For a temple of our stature, only the finest metalwork is acceptable. Vijay Metal Works delivered copper electro gold plating with a 20-year guarantee — the finish is indistinguishable from solid gold. A masterwork of modern and traditional craft.', rating:5, work:'Electro Gold Plating', year:'2021' },
    { name:'Sri. Rajagopalan', role:'Managing Trustee, Srirangam Temple, Trichy', quote:'Three generations of our temple committee have worked with Vijay Metal Works. Their knowledge of Agamic specifications is encyclopaedic. When we needed a full Vimana tower restoration, there was only one call to make.', rating:5, work:'Vimana Tower Restoration', year:'2020' },
  ];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive(a => (a+1) % testimonials.length), AUTO_MS);
    return () => clearInterval(t);
  }, [paused, testimonials.length]);

  const t = testimonials[active];

  return (
    <section id="testimonials" className="section-pad vmw-testimonials-section" style={{position:'relative',zIndex:2,background:C.bg3,borderTop:`1px solid ${C.border}`}}>
      <div className="vmw-container">
        <Reveal>
          <div style={{textAlign:'center',marginBottom:64}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Words From the Sacred</span>
            <h2 style={{...ff.display,fontSize:'clamp(28px,5vw,64px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              CLIENT <span style={{color:C.gold}}>TESTIMONIALS</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:14,maxWidth:480,margin:'14px auto 0'}}>
              Voices from 2000+ temples across India and the world.
            </p>
          </div>
        </Reveal>

        {/* Featured testimonial */}
        <div onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
          style={{marginBottom:40,position:'relative'}}>
          {/* Auto-progress bar */}
          <div style={{height:1,background:'rgba(255,255,255,.07)',marginBottom:0,overflow:'hidden',borderRadius:1}}>
            <div key={`${active}-${paused}`} style={{height:'100%',background:C.goldGrad,borderRadius:1,
              animation:paused?'none':`progressBar ${AUTO_MS}ms linear forwards`}}/>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-22}} transition={{duration:.48,ease:[.16,1,.3,1]}}>
              <div className="vmw-featured-testimonial" style={{border:`1px solid ${C.border}`,background:C.surfaceWarm,position:'relative',backdropFilter:'blur(8px)'}}>
                {/* Giant quote mark */}
                <div style={{...ff.display,fontSize:140,color:'rgba(255,255,255,0.04)',opacity:1,position:'absolute',top:4,left:22,lineHeight:1,fontWeight:900,pointerEvents:'none',userSelect:'none'}}>"</div>
                {/* Stars */}
                <div style={{display:'flex',gap:5,marginBottom:22}}>
                  {Array.from({length:t.rating}).map((_,i)=>(
                    <motion.span key={i} initial={{opacity:0,scale:.4}} animate={{opacity:1,scale:1}} transition={{delay:i*.06,type:'spring',stiffness:400}}
                      style={{fontSize:14,color:'rgba(255,215,0,0.7)'}}>★</motion.span>
                  ))}
                </div>
                <p style={{...ff.serif,fontSize:'clamp(15px,2vw,21px)',lineHeight:1.88,color:C.text,fontStyle:'italic',fontWeight:300,marginBottom:36,position:'relative',zIndex:1,maxWidth:820}}>
                  "{t.quote}"
                </p>
                <GoldRule opacity={.13} my={0}/>
                <div style={{paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{...ff.display,fontSize:16,color:C.text,fontWeight:600,letterSpacing:'.04em',marginBottom:5}}>{t.name}</div>
                    <div style={{...ff.body,fontSize:9,color:C.gold,letterSpacing:'.28em',textTransform:'uppercase',fontWeight:500,opacity:.7}}>{t.role}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                    <div style={{...ff.body,fontSize:8,color:C.faint,letterSpacing:'.22em',textTransform:'uppercase'}}>{t.work}</div>
                    <div style={{...ff.body,fontSize:8,color:C.faint,letterSpacing:'.3em',textTransform:'uppercase'}}>{t.year} · Verified Commission</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation + mini cards grid */}
        <StaggerContainer stagger={0.12} delay={0.05} style={{display:'grid',gap:6,marginBottom:36}} className="vmw-testimonials-grid">
          {testimonials.map((tm,i)=>{
            const Item = i % 2 === 0 ? StaggerItemLeft : StaggerItemRight;
            return (
            <Item key={i}>
            <motion.div onClick={()=>{setActive(i);setPaused(true);setTimeout(()=>setPaused(false),8000);}}
              whileHover={{background:C.surfaceWarm,borderColor:C.borderHi,y:-3}}
              animate={{borderColor:active===i?C.borderHi:C.border,background:active===i?C.surfaceWarm:'transparent'}}
              transition={{duration:.3}}
              style={{padding:'16px 18px',border:`1px solid ${active===i?C.borderHi:C.border}`,cursor:'pointer',position:'relative',overflow:'hidden'}}>
              {active===i && (
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,rgba(255,215,0,0.5),transparent)`}}/>
              )}
              <div style={{display:'flex',gap:4,marginBottom:7}}>
                {Array.from({length:5}).map((_,si)=>(
                  <span key={si} style={{fontSize:9,color:active===i?'rgba(255,215,0,0.65)':'rgba(255,255,255,.15)'}}> ★</span>
                ))}
              </div>
              <div style={{...ff.serif,fontSize:11.5,color:C.text,fontStyle:'italic',lineHeight:1.65,marginBottom:10,fontWeight:300}}>
                "{tm.quote.substring(0,78)}…"
              </div>
              <div style={{...ff.display,fontSize:11,color:active===i?C.text:C.dim,fontWeight:600,marginBottom:2}}>{tm.name.split('.').pop().trim()}</div>
              <div style={{...ff.body,fontSize:7,color:active===i?C.gold:C.faint,letterSpacing:'.22em',textTransform:'uppercase',fontWeight:600}}>{tm.work}</div>
            </motion.div>
            </Item>
            );
          })}
        </StaggerContainer>

        <SectionCTA primary="Commission Your Own Legacy" secondary="View Our Work"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>navigate('/gallery')}/>
      </div>
    </section>
  );
};


export default Testimonials;
