import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { BIZ } from '../../data/biz';
import { ff } from '../../styles/fonts';

const WAFab = () => {
  const C = useTheme();
  const [show, setShow] = useState(false);
  const [tip, setTip] = useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),3200);},[]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0}}
          transition={{type:'spring',stiffness:280,damping:20}}
          className="wa-fab"
          style={{position:'fixed',bottom:30,right:30,zIndex:200}}>
          <AnimatePresence>
            {tip && (
              <motion.div initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:8}}
                style={{position:'absolute',right:'110%',top:'50%',transform:'translateY(-50%)',background:C.isDark?'rgba(24,22,20,0.96)':'rgba(240,235,225,0.96)',color:C.text,padding:'9px 16px',borderRadius:3,border:`1px solid rgba(255,255,255,0.1)`,...ff.body,fontSize:8,letterSpacing:'.28em',fontWeight:700,textTransform:'uppercase',whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.4)'}}>
                Chat with I. Vijay
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button onClick={()=>window.open(BIZ.whatsapp)}
            onHoverStart={()=>setTip(true)} onHoverEnd={()=>setTip(false)}
            whileHover={{scale:1.1}} whileTap={{scale:.93}}
            animate={{y:[0,-3,0]}} transition={{y:{duration:3.5,repeat:Infinity,ease:'easeInOut'}}}
            style={{width:58,height:58,borderRadius:'50%',background:'#25D366',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 16px rgba(0,0,0,.4)',position:'relative',fontSize:26}}>
            💬
            <motion.div animate={{scale:[1,1.6,1],opacity:[.28,0,.28]}} transition={{duration:3.5,repeat:Infinity}}
              style={{position:'absolute',inset:0,borderRadius:'50%',background:'#25D366',zIndex:-1}}/>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default WAFab;
