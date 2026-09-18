import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { FadeIn } from '../common/Animations';
import { GoldRule } from '../common/Button';

const Footer = () => {
  const C = useTheme();
  return (
  <footer className="vmw-footer" style={{position:'relative',zIndex:2,background:C.bg1,borderTop:`1px solid ${C.border}`,textAlign:'center'}}>
    <FadeIn duration={1.1}>
    <div className="vmw-container" style={{paddingTop:'clamp(40px,6vw,80px)',paddingBottom:'clamp(30px,5vw,60px)'}}>
      <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
        <svg width="60" height="60" viewBox="0 0 40 40">
          <rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke={C.gold} strokeWidth="1.2" transform="rotate(45 20 20)" style={{filter:`drop-shadow(0 0 8px ${C.gold}44)`}}/>
          <text x="20" y="27" textAnchor="middle" fontFamily="'Cinzel',serif" fontSize="14" fontWeight="700" fill={C.gold}>V</text>
        </svg>
      </div>
      <h3 style={{...ff.display,fontSize:17,letterSpacing:'.32em',color:C.text,fontWeight:700,textTransform:'uppercase',marginBottom:7}}>{BIZ.name}</h3>
      <p style={{...ff.serif,fontSize:13,color:C.dim,fontStyle:'italic',marginBottom:6}}>{BIZ.tagline}</p>
      <p style={{...ff.body,fontSize:7,letterSpacing:'.52em',color:C.faint,fontWeight:600,textTransform:'uppercase',marginBottom:8}}>{BIZ.since}</p>
      <GoldRule my={28}/>

      {/* Footer Quick Contact Buttons — enhanced */}
      <div className="vmw-footer-btns" style={{display:'grid',gap:6,marginBottom:40,maxWidth:720,marginLeft:'auto',marginRight:'auto'}}>
        {[
          { icon:'📞', label:'Call Now', sub:BIZ.phone, action:()=>window.open(`tel:${BIZ.phoneTel}`), highlight:false },
          { icon:'💬', label:'WhatsApp', sub:'Chat Instantly', action:()=>window.open(BIZ.whatsapp), highlight:true },
          { icon:'✉', label:'Email Us', sub:'Get a Quote', action:()=>window.open(`mailto:${BIZ.email}`), highlight:false },
          { icon:'📍', label:'Directions', sub:'Sowcarpet', action:()=>window.open(BIZ.mapLink), highlight:false },
        ].map(btn=>(
          <motion.button key={btn.label} onClick={btn.action}
            whileHover={{y:-3,borderColor:btn.highlight?C.goldLt:C.borderHi,background:btn.highlight?'rgba(255,228,77,.15)':'rgba(255,255,255,.03)'}}
            whileTap={{scale:.96}}
            style={{...ff.body,padding:'16px 10px',border:`1px solid ${btn.highlight?C.borderGold:C.border}`,
              background:btn.highlight?'rgba(255,228,77,.07)':'transparent',
              cursor:'pointer',transition:'all .3s',borderRadius:3,
              display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <span style={{fontSize:18,lineHeight:1}}>{btn.icon}</span>
            <span style={{fontSize:8,letterSpacing:'.26em',fontWeight:700,textTransform:'uppercase',color:btn.highlight?C.gold:C.dim}}>{btn.label}</span>
            <span style={{fontSize:7,letterSpacing:'.12em',color:C.faint,textTransform:'uppercase',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{btn.sub}</span>
          </motion.button>
        ))}
      </div>

      <div className="footer-cols" style={{display:'grid',gap:24,marginBottom:28,textAlign:'left'}}>
        {[
          { h:'Address', lines:[BIZ.address] },
          { h:'Contact', lines:[BIZ.phone, BIZ.email] },
          { h:'Presence', lines:['Sowcarpet, Chennai','London · Dubai · Singapore','All major temple cities'] },
        ].map(col=>(
          <div key={col.h}>
            <div style={{...ff.body,fontSize:7,letterSpacing:'.44em',color:C.dim,fontWeight:600,textTransform:'uppercase',marginBottom:10}}>{col.h}</div>
            {col.lines.map(l=>(
              <div key={l} style={{...ff.body,fontSize:10,color:C.dim,lineHeight:2,letterSpacing:'.05em'}}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      <GoldRule/>
      <div style={{paddingTop:20,...ff.body,fontSize:7,color:C.faint,letterSpacing:'.28em',fontWeight:600,textTransform:'uppercase'}}>
        © 2025 Vijay Metal Works · All Rights Reserved
      </div>
    </div>
    </FadeIn>
  </footer>
  );
};


export default Footer;
