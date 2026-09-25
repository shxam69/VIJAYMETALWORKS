import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItemLeft, StaggerItemRight } from '../common/Animations';

const TrustedByTemples = () => {
  const C = useTheme();
  const temples = [
    { name:'Meenakshi Amman', loc:'Madurai', img:'/gallery/gold/sadarigold.jpg' },
    { name:'Brihadeeswarar', loc:'Thanjavur', img:'/gallery/gold/crown.jpg' },
    { name:'Srirangam Temple', loc:'Trichy', img:'/gallery/stone/stone1.jpg' },
    { name:'Tirumala Tirupati', loc:'Andhra Pradesh', img:'/gallery/silver/kandabaranam.jpg' },
    { name:'Murugan Temple', loc:'London, UK', img:'/gallery/gold/kanganam4.jpg' },
    { name:'Golden Temple', loc:'Vellore', img:'/gallery/gold/kandabaranam.jpg' },
    { name:'Nataraja Temple', loc:'Chidambaram', img:'/gallery/temple/god.jpg' },
    { name:'Kapaleeswarar', loc:'Chennai', img:'/gallery/temple/temple.jpg' },
  ];
  return (
    <section style={{position:'relative',zIndex:2,background:C.bg3,borderTop:`1px solid ${C.border}`}} className="section-pad vmw-temples-section">
      <div className="vmw-container">
        <Reveal>
          <div style={{textAlign:'center',marginBottom:56}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Our Sacred Clients</span>
            <h2 style={{...ff.display,fontSize:'clamp(28px,5vw,64px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              TRUSTED BY <span style={{color:C.gold}}>TEMPLES</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:16,maxWidth:500,margin:'16px auto 0'}}>
              Over 2000 sacred institutions across India and the world have entrusted their metal heritage to us.
            </p>
          </div>
        </Reveal>
        <StaggerContainer stagger={0.09} delay={0.1} style={{display:'grid',gap:2}} className="vmw-temples-grid">
          {temples.map((t,i)=>{
            const Item = i % 2 === 0 ? StaggerItemLeft : StaggerItemRight;
            return (
            <Item key={t.name}>
              <motion.div whileHover={{borderColor:C.borderHi, y:-6, boxShadow:`0 12px 40px rgba(0,0,0,0.22)`}}
                style={{border:`1px solid ${C.border}`,textAlign:'center',transition:'all .4s',cursor:'default',overflow:'hidden',background:C.bg2}}>
                <div style={{position:'relative',height:'clamp(160px, 22vw, 120px)',overflow:'hidden'}}>
                  <img src={t.img} alt={t.name} loading='lazy'
                    style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 35%',
                      filter:'brightness(1.05) saturate(1.1) contrast(1.15)',
                      transition:'transform .6s ease'}}
                    onMouseEnter={e=>e.target.style.transform='scale(1.08)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(8,6,4,0.8) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'}}/>
                  <div style={{position:'absolute',top:8,right:8,width:10,height:10,
                    border:`1px solid ${C.gold}`,opacity:.6,transform:'rotate(45deg)'}}/>
                </div>
                <div style={{padding:'clamp(12px, 2.5vw, 14px) clamp(12px, 3vw, 16px)'}}>
                  <div style={{...ff.display,fontSize:'clamp(11px, 2.8vw, 12px)',color:C.text,fontWeight:600,letterSpacing:'.04em',marginBottom:5,lineHeight:1.3}}>{t.name}</div>
                  <div style={{...ff.body,fontSize:'clamp(7px, 1.8vw, 7.5px)',letterSpacing:'.38em',color:C.gold,fontWeight:600,textTransform:'uppercase',opacity:.85}}>{t.loc}</div>
                </div>
              </motion.div>
            </Item>
            );
          })}
        </StaggerContainer>
        <Reveal delay={.2}>
          <div style={{marginTop:40,textAlign:'center',padding:'28px 0',borderTop:`1px solid ${C.border}`}}>
            <span style={{...ff.serif,fontSize:16,color:C.dim,fontStyle:'italic'}}>
              "From Madurai to London — our work adorns the most sacred shrines in the world."
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};


export default TrustedByTemples;
