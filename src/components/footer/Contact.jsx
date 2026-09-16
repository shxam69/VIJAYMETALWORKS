import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { SlideUp } from '../common/Animations';

const Contact = () => {
  const C = useTheme();
  const { setShowCommissionModal } = useAppCtx();

  return (
    <section
      id="contact"
      className="section-pad"
      style={{ position:'relative', zIndex:2, background:C.bg3, borderTop:`1px solid ${C.border}` }}
    >
      <div className="vmw-container">
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <SlideUp>
            <div style={{ fontSize:42, marginBottom:24, color:C.gold, opacity:0.8 }}>✧</div>
            <h2 style={{ ...ff.display, fontSize:'clamp(24px,4vw,42px)', color:C.text, marginBottom:16 }}>
              Start Your Sacred Project
            </h2>
            <p style={{
              ...ff.body, fontSize:'clamp(13px,1.3vw,15px)', color:C.dim,
              lineHeight:1.8, marginBottom:48, maxWidth:600, margin:'0 auto 48px',
            }}>
              We accept a limited number of commissions each year to ensure uncompromising quality.
              Connect with I. Vijay to discuss your vision, metal preferences, and custom requirements.
            </p>
            <motion.button
              onClick={() => setShowCommissionModal(true)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                padding:'16px 40px', background:C.gold, color:'#000', border:'none', borderRadius:4,
                fontFamily:"'Jost', sans-serif", fontSize:13, fontWeight:700,
                letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer',
                boxShadow:`0 10px 40px ${C.gold}33`,
              }}
            >
              Enquire Now
            </motion.button>

            <div className="vmw-contact-links" style={{
              marginTop:48, paddingTop:48, borderTop:`1px solid ${C.border}`,
              display:'flex', justifyContent:'center', gap:'clamp(16px,4vw,40px)', flexWrap:'wrap',
            }}>
              {[
                { icon:'☎', txt:BIZ.phone,    link:`tel:${BIZ.phoneTel}` },
                { icon:'✉', txt:BIZ.email,    link:`mailto:${BIZ.email}` },
                { icon:'💬', txt:`WhatsApp: ${BIZ.phone}`, link:BIZ.whatsapp },
                { icon:'📍', txt:BIZ.address,  link:BIZ.mapLink },
              ].map(c=>(
                <motion.a key={c.txt} href={c.link} target="_blank" rel="noopener noreferrer"
                  whileHover={{y:-2}}
                  style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
                  <span style={{ fontSize:16, color:C.gold }}>{c.icon}</span>
                  <span style={{ ...ff.body, fontSize:'clamp(10px,1vw,11px)', color:C.dim, letterSpacing:'.05em', textTransform:'uppercase' }}>
                    {c.txt}
                  </span>
                </motion.a>
              ))}
            </div>
          </SlideUp>
        </div>
      </div>
    </section>
  );
};

export default Contact;
