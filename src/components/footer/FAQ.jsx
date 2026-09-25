import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItem } from '../common/Animations';
import { GoldRule, CurvyButton, StarBorderButton } from '../common/Button';
import { BIZ } from '../../data/biz';

const FAQ = () => {
  const C = useTheme();
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:'What metals do you work with?', a:'We specialise in five sacred metals: 24K Gold, Sterling Silver, Copper, Brass, and Panchaloha — the sacred five-metal alloy (gold, silver, copper, iron, and lead) prescribed in Agamic tradition. We also offer electro gold plating on existing idols.' },
    { q:'Can you ship temple metalwork internationally?', a:'Yes. We have shipped to temples across the United Kingdom, United Arab Emirates, Singapore, Malaysia, USA, and Australia. We handle all customs documentation, hallmark certificates, and secure packing for international shipments.' },
    { q:'How long does a custom Panchaloha idol take?', a:'Depending on size and complexity, a handcrafted Panchaloha idol typically takes 45–120 days from order confirmation. Simple pieces like Kalasam vessels may be ready in 2–3 weeks, while full Vimana towers or large Vigraham sets may take 4–6 months.' },
    { q:'Do you follow Agamic tradition in idol-making?', a:'Absolutely. Every idol is crafted strictly according to Agama Shastra — the classical texts governing proportions (tala mana), iconography (pratima lakshana), and metal purity. Our master craftsmen have been trained in this tradition for over four generations since 1915.' },
    { q:'Do you offer temple renovation services?', a:'Yes. We offer complete temple renovation — from restoring old idols and re-gold plating, to full Vimana tower construction, Prabhavali arches, Kireedam crowns, and sacred vessels. We have renovated over 2000 temples across India and worldwide.' },
    { q:'Can I upload a reference image for my commission?', a:'Yes — our inquiry form supports uploading a reference image (photo of existing idol, design sketch, or reference from another temple). This helps our craftsmen understand your exact requirement before quoting.' },
    { q:'How do I get a price quote?', a:'Simply fill our inquiry form or WhatsApp I. Vijay directly at +91 93828 77351. Share the type of work, dimensions, metal preference, and your timeline. We typically respond within a few hours with a detailed quotation.' },
    { q:'Is electro gold plating as durable as solid gold work?', a:'Our electro gold plating uses a minimum 3-micron 24K gold deposit over copper or brass. With proper care and periodic re-plating every 10–15 years, it is a cost-effective and visually identical alternative to solid gold for large surfaces like Vimana towers.' },
  ];

  return (
    <section id="faq" className="section-pad vmw-faq-section" style={{position:'relative',zIndex:2,background:C.bg2,borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:960,margin:'0 auto'}}>
        <Reveal>
          <div style={{textAlign:'center',marginBottom:56}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Questions & Answers</span>
            <h2 style={{...ff.display,fontSize:'clamp(28px,5vw,62px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              FREQUENTLY <span style={{color:C.gold}}>ASKED</span>
            </h2>
          </div>
        </Reveal>
        <StaggerContainer stagger={0.07} delay={0.05} style={{display:'flex',flexDirection:'column',gap:2}}>
          {faqs.map((item,i)=>(
            <StaggerItem key={i}>
              <div style={{border:`1px solid ${open===i?C.borderHi:C.border}`,background:open===i?C.surfaceGold:C.surfaceWarm,transition:'all .25s',borderRadius:2}}>
                <button onClick={()=>setOpen(open===i?null:i)}
                  style={{width:'100%',background:'none',border:'none',cursor:'pointer',padding:'22px 28px',
                    display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,textAlign:'left'}}>
                  <span style={{...ff.body,fontSize:12,fontWeight:600,letterSpacing:'.06em',color:open===i?C.text:C.dim,transition:'color .2s',lineHeight:1.4}}>
                    {item.q}
                  </span>
                  <span style={{flexShrink:0,width:24,height:24,border:`1px solid ${open===i?C.borderGold:C.border}`,
                    display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',
                    color:open===i?C.gold:C.dim,fontSize:14,fontWeight:300,transition:'all .25s',
                    transform:open===i?'rotate(45deg)':'rotate(0deg)'}}>+</span>
                </button>
                <AnimatePresence>
                  {open===i && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      transition={{duration:.28,ease:[.25,.46,.45,.94]}}
                      style={{overflow:'hidden'}}>
                      <div style={{padding:'0 28px 24px',paddingTop:0}}>
                        <GoldRule opacity={.08} my={0}/>
                        <p style={{...ff.serif,fontSize:14.5,lineHeight:1.95,color:C.dim,fontStyle:'italic',fontWeight:300,marginTop:16}}>
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <Reveal delay={.12}>
          <div style={{textAlign:'center',marginTop:52,paddingTop:44,borderTop:`1px solid ${C.border}`}}>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginBottom:22}}>Still have questions? I. Vijay personally answers every enquiry.</p>
            <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <CurvyButton primary onClick={()=>window.open(BIZ.whatsapp)}>WhatsApp Us Now</CurvyButton>
              <StarBorderButton onClick={()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})} speed={6}>Send an Inquiry</StarBorderButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};


export default FAQ;
