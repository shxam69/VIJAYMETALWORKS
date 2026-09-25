import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ff } from '../../styles/fonts';

const ThemeToggle = ({ mode, setMode, C }) => {
  const options = [
    { key:'light', icon:'☀️', label:'Light' },
    { key:'dark',  icon:'🌙', label:'Dark'  },
    { key:'auto',  icon:'⚙️', label:'Auto'  },
  ];
  const [open, setOpen] = useState(false);
  const current = options.find(o=>o.key===mode);
  return (
    <div className="theme-toggle" style={{position:'fixed',top:20,right:20,zIndex:300}}>
      <motion.button onClick={()=>setOpen(o=>!o)}
        whileHover={{scale:1.05}} whileTap={{scale:.95}}
        style={{width:40,height:40,borderRadius:'50%',border:`1px solid ${C.borderGold}`,
          background:C.isDark?'rgba(20,18,16,.88)':'rgba(245,240,232,.9)',
          backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:16,boxShadow:'0 2px 12px rgba(0,0,0,.2)',cursor:'pointer'}}>
        {current.icon}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-8,scale:.92}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:.92}}
            transition={{duration:.2}}
            style={{position:'absolute',top:48,right:0,background:C.isDark?'rgba(20,18,16,.97)':'rgba(245,240,232,.97)',
              border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',
              backdropFilter:'blur(20px)',boxShadow:'0 8px 32px rgba(0,0,0,.3)',minWidth:110}}>
            {options.map(o=>(
              <button key={o.key} onClick={()=>{setMode(o.key);setOpen(false);}}
                style={{width:'100%',padding:'10px 14px',background:mode===o.key?`${C.gold}22`:'transparent',
                  border:'none',borderBottom:`1px solid ${C.border}`,
                  display:'flex',alignItems:'center',gap:10,...ff.body,
                  fontSize:9,letterSpacing:'.2em',fontWeight:600,textTransform:'uppercase',
                  color:mode===o.key?C.gold:C.dim,cursor:'pointer',transition:'all .2s',textAlign:'left'}}>
                <span style={{fontSize:13}}>{o.icon}</span>{o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default ThemeToggle;
