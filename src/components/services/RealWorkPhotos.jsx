import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { useSiteImages } from '../../hooks/useSiteImages';
import { BIZ } from '../../data/biz';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItemScale, StaggerItemLeft, StaggerItemRight } from '../common/Animations';
import { SectionCTA } from '../common/Button';
import WatermarkedImage from '../common/WatermarkedImage';

const RealWorkPhotos = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();
  const { getImage } = useSiteImages();
  const photos = [
    { id:'work_1', img:'/gallery/temple/god.jpg',          label:'Panchaloha Vigraham',      desc:'Traditional lost-wax casting' },
    { id:'work_2', img:'/gallery/gold/sadarigold.jpg',     label:'Naga Repoussé Work',       desc:'24K gold temple ornamentation' },
    { id:'work_3', img:'/gallery/gold/crown.jpg',          label:'Temple Regalia',           desc:'Handcrafted ceremonial metalwork' },
    { id:'work_4', img:'/gallery/silver/kandabaranam.jpg', label:'Silver Sanctum Articles',  desc:'Silver temple articles' },
    { id:'work_5', img:'/gallery/gold/crown1.jpg',         label:'Temple Regalia',           desc:'Handcrafted ceremonial metalwork' },
    { id:'work_6', img:encodeURI('/gallery/gold/crown back.jpg'), label:'Naga Repoussé Work', desc:'24K gold temple ornamentation' },
  ];
  return (
    <section style={{position:'relative',zIndex:2,background:C.bg2,borderTop:`1px solid ${C.border}`}} className="section-pad vmw-realwork-section">
      <div className="vmw-container">
        <Reveal>
          <div style={{textAlign:'center',marginBottom:60}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>AUTHENTIC WORKSHOP COMMISSIONS</span>
            <h2 style={{...ff.display,fontSize:'clamp(30px,5.5vw,70px)',lineHeight:.9,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              THE ART BEHIND <span style={{color:C.gold}}>THE METAL</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:18,maxWidth:520,margin:'18px auto 0'}}>
              A closer look at the hands, materials and craftsmanship behind our temple metalwork.
            </p>
          </div>
        </Reveal>
        <StaggerContainer stagger={0.12} delay={0.08} style={{display:'grid',gap:6}} className="vmw-work-grid">
          {photos.map((p,i)=>{
            const Item = i % 3 === 1 ? StaggerItemScale : (i % 2 === 0 ? StaggerItemLeft : StaggerItemRight);
            return (
            <Item key={p.id}>
              <WorkPhotoCard photo={{ ...p, img: getImage(p.id, p.img) }}/>
            </Item>
            );
          })}
        </StaggerContainer>
        <SectionCTA primary="Commission a Piece" secondary="Contact Us"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>window.open(BIZ.whatsapp)}/>
      </div>
    </section>
  );
};

const WorkPhotoCard = ({ photo }) => {
  const C = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <motion.div onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      whileHover={{borderColor:C.borderHi}}
      className="work-photo-card"
      style={{position:'relative',overflow:'hidden',aspectRatio:'4/3',border:`1px solid ${C.border}`,cursor:'default',transition:'border-color .3s',background:C.bg1}}>
      {!loaded && (
        <div className="skeleton" style={{position:'absolute',inset:0,zIndex:2}}/>
      )}
      <WatermarkedImage 
        src={photo.img} 
        alt={photo.label} 
        containerStyle={{
          width: '100%',
          height: '100%',
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'sepia(10%)',
          display: 'block',
          transform: hov ? 'scale(1.06)' : 'scale(1)',
          opacity: hov ? 0.95 : 0.85,
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onLoad={()=>setLoaded(true)}
      />
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(5,4,2,.96) 0%,rgba(5,4,2,.55) 45%,transparent 70%)',pointerEvents:'none'}}/>
      <motion.div className="work-card-text" animate={{y:hov?0:6,opacity:hov?1:.7}} transition={{duration:.32}}
        style={{position:'absolute',bottom:0,left:0,right:0,padding:'20px 22px'}}>
        <div className="work-card-label" style={{...ff.display,fontSize:15,color:'#ffffff',fontWeight:700,marginBottom:6,textShadow:'0 1px 8px rgba(0,0,0,0.9)'}}>{photo.label}</div>
        <div className="work-card-desc" style={{...ff.body,fontSize:9,color:'rgba(255,255,255,0.82)',letterSpacing:'.08em',lineHeight:1.6,textShadow:'0 1px 6px rgba(0,0,0,0.95)'}}>{photo.desc}</div>
      </motion.div>
      {/* Corner diamond */}
      <div style={{position:'absolute',top:12,right:12,width:12,height:12,border:`1px solid ${C.borderHi}`,opacity:hov?.5:.18,transition:'opacity .3s',transform:'rotate(45deg)'}}/>
    </motion.div>
  );
};


export default RealWorkPhotos;
