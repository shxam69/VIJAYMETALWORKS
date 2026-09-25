import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { SlideLeft, SlideRight } from '../common/Animations';

const Archive = () => {
  const C = useTheme();
  const [hov, setHov] = useState(null);
  const pieces = [
    { id:0, t:'Sadari Crown Set', s:'24K Gold · Nagas Work', img:'/gallery/gold/sadarigold.jpg', tag:'Gold Work', large:true },
    { id:1, t:'Kandabaranam Silver', s:'Silver · Stone Setting', img:'/gallery/silver/kandabaranam.jpg', tag:'Silver Work' },
    { id:2, t:'Temple Crown Gold', s:'Gold Handcrafted', img:'/gallery/gold/crown.jpg', tag:'Crown Work' },
    { id:3, t:'Kanganam Bangle', s:'Gold Stone Setting', img:'/gallery/gold/kanganam4.jpg', tag:'Gold Work' },
    { id:4, t:'Stone Piece', s:'Precious Stone Work', img:'/gallery/stone/stone1.jpg', tag:'Stone Work' },
    { id:5, t:'Temple Vigraham', s:'All Metals · All Crafts', img:'/gallery/temple/god.jpg', tag:'Vigraham' },
  ];
  return (
    <section id="archive" className="section-pad" style={{position:'relative',zIndex:2,background:C.bg1}}>
      <div className="vmw-container">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:52,flexWrap:'wrap',gap:20}}>
          <SlideLeft>
            <h2 style={{...ff.display,fontSize:'clamp(32px,8vw,104px)',lineHeight:.87,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              THE<br/><span style={{color:C.gold}}>ARCHIVE</span>
            </h2>
          </SlideLeft>
          <SlideRight delay={.12}>
            <p style={{...ff.body,fontSize:9,letterSpacing:'.5em',color:C.faint,fontWeight:600,textTransform:'uppercase',maxWidth:200,lineHeight:2.2,textAlign:'right'}}>
              Each piece — a dialogue with the divine.
            </p>
          </SlideRight>
        </div>
        <div className="archive-grid" style={{display:'grid',gap:6}}>
          {pieces.map((p,pidx)=>(
            <motion.div key={p.id} onHoverStart={()=>setHov(p.id)} onHoverEnd={()=>setHov(null)}
              initial={{ opacity:0, y:36 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-50px' }}
              transition={{ duration:0.8, delay:pidx*0.1, ease:[0.16,1,0.3,1] }}
              className={p.large?'archive-large':''} style={{gridColumn:p.large?'span 2':'span 1',gridRow:p.large?'span 2':'span 1',position:'relative',overflow:'hidden',cursor:'default',background:C.bg2,border:`1px solid ${C.border}`,aspectRatio:p.large?'1/1':'4/3',minHeight:p.large?240:160}}
              whileHover={{borderColor:C.borderHi}}>
              <motion.img src={p.img} alt={p.t}
                animate={{scale:hov===p.id?1.06:1,opacity:hov===p.id?.95:.82}} transition={{duration:.8,ease:[.16,1,.3,1]}}
                style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'sepia(15%)'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(16,14,12,.90) 0%,transparent 55%)'}}/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,padding:p.large?30:18}}>
                <motion.div animate={{y:hov===p.id?0:8,opacity:hov===p.id?1:0}} transition={{duration:.32}}
                  style={{...ff.body,fontSize:7,letterSpacing:'.42em',color:'rgba(255,255,255,0.65)',fontWeight:600,textTransform:'uppercase',marginBottom:5}}>
                  {p.tag}
                </motion.div>
                <div style={{...ff.serif,fontSize:p.large?26:16,color:'rgba(255,255,255,0.92)',fontWeight:600,letterSpacing:'.02em',lineHeight:1.2}}>{p.t}</div>
                <div style={{...ff.body,fontSize:8,color:'rgba(255,255,255,0.65)',letterSpacing:'.25em',textTransform:'uppercase',fontWeight:600,marginTop:4}}>{p.s}</div>
              </div>
              <div style={{position:'absolute',top:13,right:13,width:14,height:14,border:`1px solid ${C.borderHi}`,opacity:hov===p.id?.4:.12,transition:'opacity .3s',transform:'rotate(45deg)'}}/>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default Archive;
