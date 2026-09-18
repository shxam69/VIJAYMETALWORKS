import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { GALLERY_IDOLS } from '../../data/galleryData';
import { Reveal } from '../common/Animations';
import { CurvyButton, StarBorderButton } from '../common/Button';

const GalleryPreview = ({ onViewAll }) => {
  const C = useTheme();
  const navigate = useNavigate();
  const { setShowCommissionModal } = useAppCtx();
  // FIX: Fetch featured items from Supabase (admin uploads) and merge with static items
  const [liveItems, setLiveItems] = useState([]);
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    let cancelled = false;
    fetch(`${supabaseUrl}/rest/v1/gallery_items?is_featured=eq.true&select=*&order=created_at.desc`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      if (cancelled) return;
      const valid = (rows || []).filter(r => r.image_url && r.image_url.length > 0);
      setLiveItems(valid.map(r => ({
        id: r.id, gid: r.id,
        deity: r.title,
        metal: r.metal_type || '',
        cat: r.category || 'Gold Work',
        img: r.image_url,
        artisanNotes: r.artisan_notes || '',
        description: r.description || '',   // Caption set in admin panel
        isFeatured: r.is_featured || false,
        _isUploaded: true,
      })));
    })
    .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  // If there are featured uploaded items, show them first; otherwise use static seed
  const featured = liveItems.length > 0
    ? [...liveItems, ...GALLERY_IDOLS].slice(0, 6)
    : GALLERY_IDOLS.slice(0, 6);
  const [hov, setHov] = useState(null);

  return (
    <section id="gallery-preview" className="section-pad vmw-gallery-preview" style={{position:'relative',zIndex:2,background:C.bg2,borderTop:`1px solid ${C.border}`}}>
      <div className="vmw-container">
        <Reveal>
          <div style={{textAlign:'center',marginBottom:56}}>
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Featured Masterpieces</span>
            <h2 style={{...ff.display,fontSize:'clamp(34px,5.8vw,70px)',lineHeight:.88,letterSpacing:'.04em',color:C.text,fontWeight:700,marginBottom:16}}>
              OUR <span style={{color:C.gold}}>SACRED</span><br/>CRAFTSMANSHIP
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:14,maxWidth:540,margin:'14px auto'}}>
              Handcrafted temple metalwork from our Sowcarpet workshop — each piece a prayer in gold, silver, and sacred alloy.
            </p>
          </div>
        </Reveal>

        {/* Premium Masonry Showcase */}
        <style>{`
          .preview-masonry { columns: 3; column-gap: 10px; margin-bottom: 48px; }
          @media(max-width:900px){ .preview-masonry{ columns:2 !important; } }
          @media(max-width:480px){ .preview-masonry{ columns:1 !important; } }
          .preview-masonry-item { break-inside: avoid; -webkit-column-break-inside: avoid; margin-bottom: 10px; position: relative; overflow: hidden; border-radius: 8px; border: 1px solid rgba(255,215,0,0.15); cursor: pointer; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s; }
          .preview-masonry-item:hover { transform: translateY(-4px); border-color: rgba(255,215,0,0.4); }
          .preview-masonry-item img { width: 100%; display: block; filter: sepia(8%); transition: transform 0.8s ease; }
          .preview-masonry-item:hover img { transform: scale(1.08); }
        `}</style>
        <div className="preview-masonry">
          {featured.map((idol,idx)=>{
            return (
            <motion.div 
              key={idol.id}
              initial={{opacity:0, y:30}}
              whileInView={{opacity:1, y:0}}
              viewport={{once:true, margin:"-50px"}}
              transition={{duration:0.6, delay:idx*0.1}}
              className="preview-masonry-item"
              onClick={() => { window.scrollTo({top:0,behavior:'instant'}); navigate('/gallery', { state: { activeId: idol.id } }); }}
              onHoverStart={()=>setHov(idol.id)} onHoverEnd={()=>setHov(null)}
              style={{background:C.bg1}}
            >
              <img src={idol.img} alt={idol.deity} />
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.6) 35%,transparent 65%)',pointerEvents:'none'}}/>
              <motion.div animate={{y:hov===idol.id?0:8, opacity:hov===idol.id?1:0.8}} transition={{duration:0.3}} style={{position:'absolute',bottom:0,left:0,right:0,padding:'24px 20px', zIndex:2, pointerEvents:'none'}}>
                <div className="pm-label" style={{...ff.display,fontSize:18,color:'#FFFFFF',fontWeight:600,marginBottom:6,textShadow:'0 2px 10px rgba(0,0,0,0.8)'}}>{idol.deity}</div>
                <div className="pm-cat" style={{...ff.body,fontSize:10,color:'#FFD700',letterSpacing:'.2em',textTransform:'uppercase',fontWeight:700,textShadow:'0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)'}}>{idol.cat}</div>
              </motion.div>
              <div className="pm-badge" style={{position:'absolute',top:16,left:16,padding:'6px 12px',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)',border:`1px solid rgba(255,215,0,0.4)`,borderRadius:4,color:'#FFD700',...ff.body,fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',zIndex:2,fontWeight:600,textShadow:'0 2px 6px rgba(0,0,0,0.8)'}}>{idol.metal}</div>
            </motion.div>
            );
          })}
        </div>

        {/* Call to action — View Full Gallery */}
        <Reveal delay={.15}>
          <div className="section-cta-row" style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',marginTop:44,paddingTop:40,borderTop:`1px solid ${C.border}`}}>
            <CurvyButton primary onClick={() => { window.scrollTo({top:0,behavior:'instant'}); navigate('/gallery'); }}>
              View Full Gallery
            </CurvyButton>
            <StarBorderButton onClick={() => setShowCommissionModal(true)} speed={6}>
              Commission Now
            </StarBorderButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
};


export default GalleryPreview;
