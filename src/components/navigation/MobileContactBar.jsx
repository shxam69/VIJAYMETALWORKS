import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';

const MobileContactBar = () => {
  const C = useTheme();
  return (
  /*
   * Visibility is CSS-controlled:
   *   .mobile-sticky-bar { display:none !important }  — base (desktop)
   *   @media(max-width:900px) { display:flex !important } — mobile
   * Do NOT add display:'none' as inline style — it overrides CSS @media rules.
   */
  <div className="mobile-sticky-bar"
    style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:190,
      flexDirection:'column',
      background:C.isDark?'rgba(20,18,16,0.97)':'rgba(245,240,232,0.97)',
      borderTop:`1px solid ${C.border}`,
      backdropFilter:'blur(24px)',
      paddingBottom:'env(safe-area-inset-bottom,0px)',
    }}>
    <div style={{height:1, background:'linear-gradient(90deg,transparent,rgba(255,215,0,0.3),transparent)'}}/>
    <div style={{display:'flex', gap:0, padding:'10px 12px 10px'}}>
      {[
        { label:'📞 Call', sub:'Direct',    action:()=>window.open(`tel:${BIZ.phoneTel}`), primary:false },
        { label:'💬 WhatsApp', sub:'Chat Now', action:()=>window.open(BIZ.whatsapp),   primary:true },
        { label:'✉ Email', sub:'Get Quote', action:()=>window.open(`mailto:${BIZ.email}`), primary:false },
      ].map((btn,i)=>(
        <button key={btn.label} onClick={btn.action}
          style={{
            flex:1,
            /* min 44px touch target height */
            padding:'12px 8px 10px',
            ...ff.body,
            marginLeft:i===1?4:0, marginRight:i===1?4:0,
            background:btn.primary?C.gold:'transparent',
            border:`1px solid ${btn.primary?C.goldLt:C.border}`,
            borderRadius:btn.primary?3:2,
            cursor:'pointer', transition:'all .25s',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          }}>
          <span style={{fontSize:9,letterSpacing:'.18em',fontWeight:700,textTransform:'uppercase',
            color:btn.primary?'#000':C.dim}}>{btn.label}</span>
          <span style={{fontSize:7,letterSpacing:'.18em',
            color:btn.primary?'rgba(0,0,0,.55)':C.faint,
            textTransform:'uppercase'}}>{btn.sub}</span>
        </button>
      ))}
    </div>
  </div>
);
};

export default MobileContactBar;
