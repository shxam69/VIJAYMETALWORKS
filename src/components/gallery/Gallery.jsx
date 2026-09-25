import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { GALLERY_IDOLS } from '../../data/galleryData';
import { BIZ } from '../../data/biz';
import {
  supabaseCall,
  getCount,
  getUserState,
  setUserState,
  recordIdolView,
  toggleIdolLike,
  toggleIdolSave,
  addIdolComment,
  getCommentsForIdol,
  postCommentForIdol,
} from '../../lib/supabase';
import PremiumFilterTabs from './PremiumFilterTabs';
import { CurvyButton, StarBorderButton, SectionCTA } from '../common/Button';
import { Reveal } from '../common/Animations';
import WatermarkedImage from '../common/WatermarkedImage';

const Gallery = ({ isFullPage = false, onSelect, initialSelected = null }) => {
  const C = useTheme();
  const [selected, setSelected] = useState(initialSelected);
  const userState = getUserState();
  const [liked, setLiked] = useState(userState.likes);
  const [saved, setSaved] = useState(userState.saves);
  const [hovered, setHovered] = useState(null);
  const [likeAnim, setLikeAnim] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [authAction, setAuthAction] = useState('');
  const [comments, setComments] = useState(userState.comments);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [liveItems, setLiveItems] = useState([]);
  const { isLoggedIn, user, setShowAuthModal, setAuthAction: setGlobalAuthAction, setShowCommissionModal } = useAppCtx();
  const userId = user?.id || 'guest';
  const dockRef = useRef(null);
  const [mouseX, setMouseX] = useState(null);
  const DOCK_ITEM_W = 68;

  // Fetch any admin-uploaded items from Supabase and merge with seeded GALLERY_IDOLS
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    fetch(`${supabaseUrl}/rest/v1/gallery_items?select=*&order=created_at.desc`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      // Only include uploaded items (gid starts with 'vmw-upload-') as live additions
      const uploadedOnly = rows.filter(r => r.id.startsWith('vmw-upload-'));
      const mapped = uploadedOnly.map((r, idx) => ({
        id: 10000 + idx,  // unique numeric id outside GALLERY_IDOLS range
        gid: r.id,
        deity: r.title,
        metal: r.metal_type,
        purity: '',
        dims: '',
        stone: '',
        duration: '',
        origin: 'Sowcarpet',
        img: r.image_url,
        cat: r.category,
        artisanNotes: '',
        _isUploaded: true,
      }));
      setLiveItems(mapped);
    })
    .catch(() => {});
  }, []);

  // Merged idol list: seeded + uploaded
  const allIdols = [...GALLERY_IDOLS, ...liveItems];

  const FILTERS = ['All','Gold Work','Crown Work','Silver Work','Stone Work','Vigraham'];

  const filteredIdols = activeFilter === 'All'
    ? allIdols
    : allIdols.filter(i => i.cat === activeFilter || i.metal.toLowerCase().includes(activeFilter.toLowerCase().split(' ')[0]));

  const getDockScale = idx => {
    if (mouseX===null) return 1;
    const itemCenter = idx*(DOCK_ITEM_W+8)+DOCK_ITEM_W/2;
    const dist = Math.abs(mouseX-itemCenter);
    const maxDist = 120;
    if (dist>maxDist) return 1;
    return 1+(1-dist/maxDist)*0.65;
  };

  const handleLike = (idol, e) => {
    e.stopPropagation();
    const gid = idol.gid;
    const wasLiked = liked[gid];
    setLiked(prev=>({...prev,[gid]:!prev[gid]}));
    setLikeAnim(prev=>({...prev,[idol.id]:true}));
    setTimeout(()=>setLikeAnim(prev=>({...prev,[idol.id]:false})),600);
    // Persist to localStorage + Supabase
    const state = getUserState();
    state.likes[gid] = !wasLiked;
    setUserState(state);
    if (userId !== 'guest') toggleIdolLike(gid, userId, wasLiked);
  };

  const handleSave = (idol, e) => {
    e.stopPropagation();
    if (!isLoggedIn) { setGlobalAuthAction('save'); setShowAuthModal(true); return; }
    const gid = idol.gid;
    const wasSaved = saved[gid];
    setSaved(prev => ({...prev,[gid]:!prev[gid]}));
    const state = getUserState();
    state.saves[gid] = !wasSaved;
    setUserState(state);
    toggleIdolSave(gid, userId, wasSaved);
  };

  const handleAddComment = (idol, e) => {
    e.stopPropagation();
    if (!isLoggedIn) { setGlobalAuthAction('comment'); setShowAuthModal(true); return; }
    if (!commentInput.trim()) return;
    const id = idol.id;
    const gid = idol.gid;
    const text = commentInput.trim();
    setComments(prev => ({
      ...prev,
      [id]: [...(prev[id]||[]), { text, time: new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'}) }]
    }));
    // Persist to Supabase
    addIdolComment(gid, userId, text);
    setCommentInput('');
  };

  const sel = selected!==null ? allIdols.find(i=>i.id===selected) : null;

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handler = (e) => {
      if (selected === null) return;
      if (e.key === 'Escape') { setSelected(null); setShowComments(false); setCommentInput(''); }
      if (e.key === 'ArrowLeft')  handlePrev({ stopPropagation: ()=>{} });
      if (e.key === 'ArrowRight') handleNext({ stopPropagation: ()=>{} });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, filteredIdols]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (selected === null) return;
    const currentIndex = filteredIdols.findIndex(i => i.id === selected);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredIdols.length) % filteredIdols.length;
    setSelected(filteredIdols[prevIndex].id);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    if (selected === null) return;
    const currentIndex = filteredIdols.findIndex(i => i.id === selected);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredIdols.length;
    setSelected(filteredIdols[nextIndex].id);
  };

  // Swipe gesture detection for mobile
  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    // Swipe left = next, Swipe right = prev
    if (Math.abs(diff) > 60) {
      if (diff > 0) handleNext({ stopPropagation: () => {} });
      else handlePrev({ stopPropagation: () => {} });
    }
    setTouchStart(null);
  };

  // Calculate current image index
  const currentImageIndex = selected !== null ? filteredIdols.findIndex(i => i.id === selected) : -1;
  const totalImages = filteredIdols.length;

  return (
    <section id="gallery" style={{position:'relative',zIndex:2,paddingTop:'clamp(80px, 10vw, 140px)',paddingBottom:'clamp(40px, 6vw, 60px)',background:C.bg2,borderTop:`1px solid ${C.border}`,overflow:'hidden'}}>
      {/* Parallax Background Glow */}
      <motion.div 
        style={{
          position:'absolute',
          top:0,
          left:'50%',
          transform:'translateX(-50%)',
          width:'140%',
          height:'100%',
          background:'radial-gradient(ellipse 120% 80% at 50% 20%, rgba(255,215,0,0.06) 0%, transparent 60%)',
          zIndex:-1,
          pointerEvents:'none'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '-200px' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      
      <AnimatePresence>
        {selected!==null && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,background:'radial-gradient(ellipse 80% 60% at 50% 40%,rgba(255,215,0,0.04) 0%,transparent 70%)'}}/>
        )}
      </AnimatePresence>
      
      <div className="vmw-container" style={{position:'relative',zIndex:1}}>
        <Reveal>
          <motion.div 
            style={{textAlign:'center',marginBottom:64}}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{...ff.body,fontSize:8,letterSpacing:'.52em',color:C.dim,fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:16,opacity:.8}}>Sacred Collection</span>
            <h2 style={{...ff.display,fontSize:'clamp(34px,6.5vw,82px)',lineHeight:.88,letterSpacing:'.045em',color:C.text,fontWeight:700}}>
              THE <span style={{color:C.gold}}>GALLERY</span>
            </h2>
            <p style={{...ff.serif,fontSize:15,color:C.dim,fontStyle:'italic',marginTop:16}}>Tap any idol to explore · Like your favourites</p>
          </motion.div>
        </Reveal>

        {/* ── Premium Gallery Filter Tabs ── */}
        <Reveal delay={.08}>
          <motion.div 
            style={{display:'flex',justifyContent:'center',marginBottom:40}}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <PremiumFilterTabs
              filters={FILTERS}
              active={activeFilter}
              onChange={f=>{setActiveFilter(f);setSelected(null);}}
              C={C}
            />
          </motion.div>
        </Reveal>
        {/* ── PREMIUM MASONRY GALLERY — Cinematic Edition ── */}
        <style>{`
          /* ═══════════════════════════════════════════════════════════
             PREMIUM CINEMA MASONRY LAYOUT
             - Varied heights like Pinterest/Awwwards luxury portfolios
             - Cinematic spacing and composition
             - Blur-to-sharp image transitions
             - Floating glow effects
             - Parallax-ready structure
             ═══════════════════════════════════════════════════════════ */

          /* ─── Container ─────────────────────────────── */
          .vmw-masonry {
            columns: 4;
            column-gap: 16px;
            orphans: 1;
            widows: 1;
          }

          /* ─── Each card ──────────────────────────────── */
          .vmw-masonry-item {
            display: inline-block;
            width: 100%;
            break-inside: avoid;
            -webkit-column-break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            cursor: pointer;
            vertical-align: top;
            background: linear-gradient(135deg, #1a1208 0%, #0e0b06 100%);
            /* Cinematic lift + glow on hover */
            transition:
              transform .48s cubic-bezier(.16,1,.3,1),
              box-shadow .48s cubic-bezier(.16,1,.3,1),
              border-color .32s ease;
            will-change: transform, box-shadow, filter;
            border: 1px solid rgba(255,215,0,0.08);
          }

          /* Premium hover state with glow */
          .vmw-masonry-item:hover {
            transform: translateY(-12px) scale(1.018);
            box-shadow:
              0 32px 72px rgba(0,0,0,0.65),
              0 8px 24px rgba(0,0,0,0.40),
              0 0 40px rgba(255,215,0,0.12),
              0 0 20px rgba(255,215,0,0.08);
            border-color: rgba(255,215,0,0.28);
          }

          /* Floating glow animation on hover */
          @keyframes vmwFloatingGlow {
            0%, 100% { box-shadow: 
              0 32px 72px rgba(0,0,0,0.65),
              0 8px 24px rgba(0,0,0,0.40),
              0 0 40px rgba(255,215,0,0.12),
              0 0 20px rgba(255,215,0,0.08);
            }
            50% { box-shadow: 
              0 32px 72px rgba(0,0,0,0.65),
              0 8px 24px rgba(0,0,0,0.40),
              0 0 48px rgba(255,215,0,0.18),
              0 0 28px rgba(255,215,0,0.12);
            }
          }
          .vmw-masonry-item:hover {
            animation: vmwFloatingGlow 3s ease-in-out infinite;
          }

          /* Cinematic shine sweep pseudo-element */
          .vmw-masonry-item::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(
              125deg,
              transparent 0%,
              rgba(255,215,0,0.04) 15%,
              rgba(255,215,0,0.12) 50%,
              rgba(255,215,0,0.04) 85%,
              transparent 100%
            );
            transform: translateX(-100%) skewX(-12deg);
            transition: none;
            pointer-events: none;
            z-index: 5;
            border-radius: inherit;
          }
          .vmw-masonry-item:hover::after {
            transform: translateX(200%) skewX(-12deg);
            transition: transform .72s cubic-bezier(.16,1,.3,1);
          }

          /* ─── Image wrapper — intrinsic heights ── */
          .vmw-masonry-item .vmw-img-wrap {
            position: relative;
            width: 100%;
            overflow: hidden;
            will-change: transform;
          }

          /* PREMIUM VARIED HEIGHTS — Pinterest-style composition */
          .vmw-masonry-item:nth-child(5n+1) .vmw-img-wrap { aspect-ratio: 3/4; }
          .vmw-masonry-item:nth-child(5n+2) .vmw-img-wrap { aspect-ratio: 2/3; }
          .vmw-masonry-item:nth-child(5n+3) .vmw-img-wrap { aspect-ratio: 4/5; }
          .vmw-masonry-item:nth-child(5n+4) .vmw-img-wrap { aspect-ratio: 3/5; }
          .vmw-masonry-item:nth-child(5n)   .vmw-img-wrap { aspect-ratio: 5/7; }

          /* ─── Image — Blur-to-Sharp Cinematic Transition ── */
          .vmw-masonry-item .vmw-img-wrap img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
            display: block;
            will-change: transform, opacity, filter;
            opacity: 0;
            transform: scale(1.08) translateZ(0);
            filter: blur(24px) brightness(0.95);
            transition:
              transform .78s cubic-bezier(.16,1,.3,1),
              opacity .42s ease,
              filter .85s cubic-bezier(.22,.8,.65,1);
            transform-origin: center center;
          }

          /* BLUR-TO-SHARP when loaded */
          .vmw-masonry-item .vmw-img-wrap img.vmw-img-loaded {
            opacity: 1;
            transform: scale(1) translateZ(0);
            filter: blur(0px) brightness(1);
          }

          /* Premium hover zoom with sharp focus */
          .vmw-masonry-item:hover .vmw-img-wrap img {
            transform: scale(1.12) translateZ(0);
            filter: brightness(1.08) saturate(1.12) contrast(1.05);
          }

          /* Elegant loading placeholder */
          .vmw-masonry-item .vmw-img-wrap::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #1c1408 0%, #2a1f0c 50%, #0e0b06 100%);
            z-index: 0;
          }

          /* Premium gold shimmer on loading */
          .vmw-masonry-item .vmw-img-wrap::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255,215,0,0.08) 50%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: vmwPremiumShimmer 2.4s cubic-bezier(.25,.46,.45,.94) infinite;
            z-index: 1;
          }

          @keyframes vmwPremiumShimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }

          .vmw-masonry-item .vmw-img-wrap.vmw-wrap-loaded::after {
            display: none;
          }

          /* ─── Premium Cinematic Overlay ── */
          .vmw-masonry-item .vmw-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to top,
              rgba(0,0,0,0.94) 0%,
              rgba(0,0,0,0.52) 40%,
              rgba(0,0,0,0.08) 70%,
              transparent 100%
            );
            opacity: 0;
            transition: opacity .42s cubic-bezier(.16,1,.3,1);
            z-index: 3;
            pointer-events: none;
          }
          .vmw-masonry-item:hover .vmw-overlay { opacity: 1; }

          /* ─── Caption — Smooth Reveal ── */
          .vmw-masonry-item .vmw-caption {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 24px 18px 18px;
            transform: translateY(14px);
            opacity: 0;
            transition:
              opacity .38s cubic-bezier(.16,1,.3,1),
              transform .42s cubic-bezier(.16,1,.3,1);
            z-index: 4;
          }
          .vmw-masonry-item:hover .vmw-caption {
            opacity: 1;
            transform: translateY(0);
          }

          /* ─── Category Badge — Premium ── */
          .vmw-masonry-item .vmw-cat-badge {
            position: absolute;
            top: 12px; left: 12px;
            background: rgba(0,0,0,0.58);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            padding: 5px 10px;
            border-radius: 4px;
            border: 1px solid rgba(255,215,0,0.18);
            opacity: 0;
            transform: translateY(-6px) scale(0.95);
            transition: opacity .32s ease, transform .36s cubic-bezier(.16,1,.3,1);
            z-index: 4;
          }
          .vmw-masonry-item:hover .vmw-cat-badge { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }

          /* ─── Selected State ── */
          .vmw-masonry-item.vmw-selected {
            outline: 2px solid rgba(255,215,0,0.52);
            outline-offset: -2px;
          }
          .vmw-masonry-item.vmw-selected .vmw-img-wrap img {
            filter: brightness(1.12) saturate(1.18) contrast(1.08);
          }

          /* ─── Like Button ── */
          .vmw-like-btn { opacity: 0 !important; }
          .vmw-masonry-item:hover .vmw-like-btn,
          .vmw-like-btn-liked { opacity: 1 !important; }

          @keyframes vmwLikePop {
            0%   { transform: scale(1); }
            35%  { transform: scale(1.5); }
            70%  { transform: scale(0.88); }
            100% { transform: scale(1); }
          }
          .vmw-like-pop { animation: vmwLikePop .48s cubic-bezier(.34,1.56,.64,1); }

          /* ═══════════════════════════════════════════════════════════
             RESPONSIVE — PREMIUM MOBILE OPTIMIZATION
             ═══════════════════════════════════════════════════════════ */

          /* ─── TABLET 769–1100 ── */
          @media (max-width: 1100px) {
            .vmw-masonry { columns: 3; column-gap: 12px; }
            .vmw-masonry-item { margin-bottom: 12px; border-radius: 10px; }
          }

          /* ─── MOBILE ≤768px — Stacked Beauty ── */
          @media (max-width: 768px) {
            .vmw-masonry { columns: 2; column-gap: 10px; }
            .vmw-masonry-item { 
              margin-bottom: 10px; 
              border-radius: 8px;
              /* Always show on mobile for UX */
              transform: none !important;
            }
            
            /* Touch-friendly: persistent overlay & caption */
            .vmw-masonry-item .vmw-overlay { opacity: 0.48 !important; }
            .vmw-masonry-item .vmw-caption { 
              opacity: 1 !important; 
              transform: translateY(0) !important; 
            }
            .vmw-masonry-item .vmw-cat-badge { 
              opacity: 1 !important; 
              transform: translateY(0) scale(1) !important; 
            }
            
            /* Disable hover zoom on touch */
            .vmw-masonry-item:hover .vmw-img-wrap img { 
              transform: scale(1) !important; 
            }
            .vmw-masonry-item:hover { 
              transform: none !important; 
              box-shadow: none !important;
            }
            .vmw-masonry-item:hover::after { 
              transform: none !important; 
            }
            
            /* Tighter spacing on mobile */
            .vmw-masonry-item .vmw-caption { 
              padding: 12px 10px 10px !important; 
            }
          }

          /* ─── SMALL MOBILE ≤420px ── */
          @media (max-width: 420px) {
            .vmw-masonry { column-gap: 8px; }
            .vmw-masonry-item { margin-bottom: 8px; border-radius: 6px; }
            .vmw-masonry-item .vmw-cat-badge { top: 8px; left: 8px; padding: 4px 8px; }
          }
        `}</style>

        {/* Parallax Scroll Container */}
        <motion.div 
          style={{position:'relative',zIndex:2}}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="vmw-masonry" style={{marginBottom:48}}>
          {filteredIdols.map((idol, idx) => {
            const isSelected = selected === idol.id;
            const isLiked = liked[idol.gid];
            const isLoaded = loadedImages[idol.id];
            const staggerDelay = (idx % 8) * 0.06;
            const columnDelay = Math.floor(idx / 8) * 0.08;
            const totalDelay = staggerDelay + columnDelay;

            return (
              <motion.div
                key={idol.id}
                className={`vmw-masonry-item${isSelected ? ' vmw-selected' : ''}`}
                onClick={() => onSelect ? onSelect(idol.id) : setSelected(isSelected ? null : idol.id)}
                style={{ border: `1px solid ${isSelected ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.07)'}` }}
                initial={{ opacity:0, y: 48, scale: 0.92 }}
                whileInView={{ opacity:1, y: 0, scale: 1 }}
                viewport={{ once:false, margin:'-60px' }}
                transition={{ 
                  duration:0.85, 
                  delay: totalDelay,
                  ease:[0.16,1,0.3,1]
                }}
              >
                {/* Image wrapper — has intrinsic aspect-ratio so height exists before image loads */}
                <div className={`vmw-img-wrap${isLoaded ? ' vmw-wrap-loaded' : ''}`}>
                  <WatermarkedImage
                    src={idol.img}
                    alt={idol.deity}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    className={isLoaded ? 'vmw-img-loaded' : ''}
                    loading={idx < 8 ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={() => setLoadedImages(prev => ({...prev, [idol.id]: true}))}
                    onError={e => {
                      // Fallback: show a gold-tinted placeholder gradient instead of broken img
                      e.currentTarget.style.display = 'none';
                      const wrap = e.currentTarget.parentElement;
                      if (wrap) {
                        wrap.style.background = 'linear-gradient(135deg,#1c1408 0%,#2a1e0a 50%,#1c1408 100%)';
                        // Add a subtle V monogram fallback
                        const fb = document.createElement('div');
                        fb.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:42px;color:rgba(255,215,0,0.15);user-select:none;z-index:2;font-weight:700';
                        fb.textContent = 'V';
                        wrap.appendChild(fb);
                      }
                    }}
                  />
                </div>

                {/* Hover overlay */}
                <div className="vmw-overlay"/>

                {/* Category badge */}
                <div className="vmw-cat-badge" style={{
                  fontFamily:"'Jost',sans-serif", fontSize:7,
                  letterSpacing:'.28em', fontWeight:700,
                  textTransform:'uppercase', color:'rgba(255,255,255,0.82)',
                }}>
                  {idol.cat}
                </div>

                {/* Like button */}
                <button
                  onClick={e => handleLike(idol, e)}
                  className={`vmw-like-btn${isLiked ? ' vmw-like-btn-liked' : ''}${likeAnim[idol.id] ? ' vmw-like-pop' : ''}`}
                  style={{
                    position:'absolute', top:9, right:9, zIndex:5,
                    background: isLiked ? 'rgba(255,50,80,0.9)' : 'rgba(0,0,0,0.58)',
                    border: `1px solid ${isLiked ? 'rgba(255,50,80,0.8)' : 'rgba(255,255,255,0.18)'}`,
                    borderRadius:'50%', width:28, height:28,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, cursor:'pointer',
                    transition:'opacity .3s, background .2s',
                  }}
                >
                  {isLiked ? '❤️' : '🤍'}
                </button>

                {/* Caption */}
                <div className="vmw-caption">
                  <div style={{
                    fontFamily:"'Cinzel',Georgia,serif", fontSize:11,
                    color:'rgba(255,255,255,0.95)', fontWeight:700, marginBottom:2,
                    textShadow:'0 1px 4px rgba(0,0,0,0.8)',
                  }}>{idol.deity}</div>
                  <div style={{
                    fontFamily:"'Jost',sans-serif", fontSize:7,
                    color:'rgba(255,215,0,0.78)', letterSpacing:'.2em',
                    textTransform:'uppercase', fontWeight:500,
                  }}>{idol.metal}</div>
                </div>

                {/* Selected ring */}
                {isSelected && (
                  <div style={{
                    position:'absolute', inset:0,
                    border:'1px solid rgba(255,215,0,0.4)',
                    borderRadius:4, pointerEvents:'none', zIndex:6,
                  }}/>
                )}
              </motion.div>
            );
          })}
          </div>
        </motion.div>
        {/* Dock */}
        <Reveal delay={.1}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:32,maxWidth:'100%',overflowX:'auto',WebkitOverflowScrolling:'touch',scrollbarWidth:'none',padding:'4px 0'}}>
            <div ref={dockRef}
              onMouseMove={e=>{const rect=dockRef.current.getBoundingClientRect();setMouseX(e.clientX-rect.left);}}
              onMouseLeave={()=>setMouseX(null)}
              style={{display:'flex',alignItems:'flex-end',gap:8,padding:'12px 20px',background:C.isDark?'rgba(22,20,18,0.92)':'rgba(245,240,232,0.92)',backdropFilter:'blur(20px)',borderRadius:24,border:`1px solid ${C.border}`,boxShadow:`0 8px 40px rgba(0,0,0,0.5)`}}>
              {allIdols.map((idol,idx)=>{
                const scale=getDockScale(idx);
                const isSelected=selected===idol.id;
                const isLiked=liked[idol.gid];
                return (
                  <div key={idol.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
                    <motion.div animate={{opacity:hovered===idol.id?1:0,y:hovered===idol.id?0:4}}
                      style={{...ff.body,fontSize:7,letterSpacing:'.2em',color:C.text,whiteSpace:'nowrap',background:'rgba(0,0,0,0.8)',padding:'3px 8px',borderRadius:4,border:`1px solid ${C.border}`,pointerEvents:'none',marginBottom:2}}>
                      {idol.deity}
                    </motion.div>
                    <motion.div onClick={()=>setSelected(isSelected?null:idol.id)}
                      onHoverStart={()=>setHovered(idol.id)} onHoverEnd={()=>setHovered(null)}
                      animate={{scale,y:scale>1?-(scale-1)*20:0}} transition={{type:'spring',stiffness:400,damping:28}}
                      style={{width:DOCK_ITEM_W,height:DOCK_ITEM_W,borderRadius:16,overflow:'hidden',cursor:'pointer',
                        border:isSelected?`2px solid ${C.borderHi}`:`2px solid ${isLiked?'rgba(255,80,100,0.5)':'rgba(255,255,255,0.1)'}`,
                        boxShadow:isSelected?`0 0 12px rgba(255,215,0,0.2)`:isLiked?'0 0 10px rgba(255,80,100,0.2)':'none',
                        position:'relative',flexShrink:0}}>
                      <WatermarkedImage 
                        src={idol.img} 
                        alt={idol.deity} 
                        style={{width:'100%',height:'100%',objectFit:'cover'}}
                      />
                      {isLiked&&<div style={{position:'absolute',bottom:3,right:3,fontSize:9,lineHeight:1}}>❤️</div>}
                    </motion.div>
                    <div style={{width:isSelected?5:3,height:isSelected?5:3,borderRadius:'50%',background:isSelected?C.gold:'rgba(255,255,255,0.2)',transition:'all .3s'}}/>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
        {/* ── PREMIUM FULLSCREEN CINEMATIC LIGHTBOX ── */}
        <style>{`
          /* Mobile lightbox optimization */
          @media (max-width: 768px) {
            /* Fullscreen on mobile */
            [role="dialog"] {
              padding: 0 !important;
            }
            
            /* Larger navigation buttons for touch */
            [style*="width: 56px"] {
              width: 48px !important;
              height: 48px !important;
              font-size: 28px !important;
            }
            
            /* Close button easier to tap */
            [style*="width: 44px"] {
              width: 48px !important;
              height: 48px !important;
            }
            
            /* Image counter repositioned for mobile */
            @supports (position: fixed) {
              .lightbox-counter {
                bottom: 12px !important;
                left: 12px !important;
                padding: 8px 12px !important;
                font-size: 11px !important;
              }
            }
          }
          
          /* iPhone X+ notch safety */
          @supports (padding: max(0px)) {
            @media (max-width: 768px) {
              [style*="position: fixed"] {
                padding-left: max(12px, env(safe-area-inset-left));
                padding-right: max(12px, env(safe-area-inset-right));
              }
            }
          }
        `}</style>
        <AnimatePresence>
          {sel && (
            <>
              {/* Premium Backdrop with Depth Animation */}
              <motion.div
                initial={{opacity:0,backdropFilter:'blur(0px)'}} 
                animate={{opacity:1,backdropFilter:'blur(18px)'}} 
                exit={{opacity:0,backdropFilter:'blur(0px)'}}
                transition={{duration:0.5,ease:[0.16,1,0.3,1]}}
                style={{
                  position:'fixed',inset:0,zIndex:999,
                  background:'linear-gradient(135deg,rgba(0,0,0,0.92) 0%,rgba(8,6,4,0.95) 50%,rgba(0,0,0,0.92) 100%)',
                  backdropFilter:'blur(18px)',
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  overflowY:'auto',padding:'20px 0'
                }}
                onClick={() => { setSelected(null); setShowComments(false); setCommentInput(''); }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Close Button - Floating Animation */}
                <motion.button 
                  onClick={e=>{e.stopPropagation();setSelected(null);setShowComments(false);setCommentInput('');}}
                  animate={{y:[0,-3,0]}}
                  transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}
                  whileHover={{scale:1.12,background:'rgba(255,255,255,0.22)'}}
                  whileTap={{scale:0.92}}
                  style={{position:'fixed',top:24,right:28,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',fontSize:22,cursor:'pointer',zIndex:1001,width:44,height:44,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',transition:'background .2s',boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}
                >×</motion.button>

                {/* Prev Button - Floating with Direction */}
                <motion.button 
                  onClick={handlePrev}
                  animate={{x:[-2,0,-2],y:[0,-2,0]}}
                  transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                  whileHover={{scale:1.14,x:0,background:'rgba(255,215,0,0.18)'}}
                  whileTap={{scale:0.88}}
                  style={{position:'fixed',left:16,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',color:'#fff',fontSize:36,cursor:'pointer',borderRadius:'50%',width:56,height:56,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',zIndex:1001,transition:'background .2s, box-shadow .2s',boxShadow:'0 12px 32px rgba(0,0,0,0.5)'}}
                >‹</motion.button>

                {/* Next Button - Floating with Direction */}
                <motion.button 
                  onClick={handleNext}
                  animate={{x:[2,0,2],y:[0,-2,0]}}
                  transition={{duration:3,repeat:Infinity,ease:'easeInOut'}}
                  whileHover={{scale:1.14,x:0,background:'rgba(255,215,0,0.18)'}}
                  whileTap={{scale:0.88}}
                  style={{position:'fixed',right:16,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',color:'#fff',fontSize:36,cursor:'pointer',borderRadius:'50%',width:56,height:56,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',zIndex:1001,transition:'background .2s, box-shadow .2s',boxShadow:'0 12px 32px rgba(0,0,0,0.5)'}}
                >›</motion.button>

              {/* Image with Motion Blur Transition */}
              <motion.div
                key={sel.id}
                style={{position:'relative', display:'flex', justifyContent:'center', alignItems:'center', maxWidth:'90vw', maxHeight:'80vh'}}
                initial={{opacity:0,scale:0.92,filter:'blur(12px)'}}
                animate={{opacity:1,scale:1,filter:'blur(0px)'}}
                exit={{opacity:0,scale:0.95,filter:'blur(8px)'}}
                transition={{duration:0.6,ease:[0.16,1,0.3,1]}}
              >
                <motion.img
                  src={sel.img}
                  alt={sel.deity}
                  style={{maxHeight:'80vh',maxWidth:'100%',objectFit:'contain',borderRadius:12,boxShadow:'0 32px 96px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.08)',display:'block',width:'auto',height:'auto'}}
                  onClick={e=>e.stopPropagation()}
                  animate={{scale:1}}
                  whileHover={{scale:1.02}}
                  transition={{duration:0.3,ease:[0.16,1,0.3,1]}}
                />
                
                {/* Image Counter Badge - Floating */}
                <motion.div
                  animate={{y:[0,-4,0]}}
                  transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}
                  style={{
                    position:'absolute',bottom:16,left:16,
                    background:'rgba(0,0,0,0.68)',backdropFilter:'blur(12px)',
                    border:'1px solid rgba(255,215,0,0.35)',
                    borderRadius:10,padding:'10px 16px',
                    fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:700,
                    color:'rgba(255,215,0,0.9)',
                    boxShadow:'0 8px 24px rgba(0,0,0,0.6)',
                    letterSpacing:'.12em'
                  }}
                >
                  {currentImageIndex + 1} / {totalImages}
                </motion.div>

                {/* Progress Bar - Circular Indicator */}
                <svg
                  style={{position:'absolute',bottom:20,right:20,width:48,height:48}}
                  viewBox="0 0 48 48"
                >
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="rgba(255,215,0,0.8)"
                    strokeWidth="2"
                    strokeDasharray={`${(currentImageIndex + 1) / totalImages * 125.6} 125.6`}
                    strokeLinecap="round"
                    style={{transformOrigin:'24px 24px',transform:'rotate(-90deg)'}}
                  />
                </svg>
              </motion.div>

              {/* Info Panel - Floating with Staggered Children */}
              <motion.div 
                initial={{opacity:0,y:32}} 
                animate={{opacity:1,y:0}} 
                exit={{opacity:0,y:20}}
                transition={{delay:0.2,duration:0.6,ease:[0.16,1,0.3,1]}}
                style={{marginTop:28,width:'min(680px,92vw)',flexShrink:0}}
                onClick={e=>e.stopPropagation()}
              >
                {/* Top row — title + action buttons */}
                <motion.div 
                  initial={{opacity:0}} 
                  animate={{opacity:1}} 
                  transition={{delay:0.3,duration:0.5}}
                  style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,padding:'24px 28px',border:`1px solid ${C.borderHi}`,borderBottom:'none',background:'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,215,0,0.02) 100%)',backdropFilter:'blur(16px)',borderRadius:'14px 14px 0 0',flexWrap:'wrap',boxShadow:'0 16px 48px rgba(0,0,0,0.4)'}}
                >
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{...ff.body,fontSize:8,letterSpacing:'.44em',color:'rgba(255,215,0,0.85)',fontWeight:600,textTransform:'uppercase',marginBottom:6}}>{sel.cat}</div>
                    <div style={{...ff.display,fontSize:26,color:'rgba(255,255,255,0.94)',fontWeight:700,marginBottom:3,lineHeight:1.1}}>{sel.deity}</div>
                    <div style={{...ff.serif,fontSize:13,color:'rgba(255,255,255,0.5)',fontStyle:'italic'}}>{sel.metal} · Handcrafted in Sowcarpet</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                    {/* Like Button - with Animation */}
                    <motion.button
                      onClick={e=>handleLike(sel,e)}
                      title="Like this piece"
                      animate={{y:[0,-2,0]}}
                      transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}
                      whileHover={{scale:1.1,background: liked[sel.gid] ? 'rgba(255,50,80,0.28)' : 'rgba(255,255,255,0.15)'}}
                      whileTap={{scale:0.92}}
                      style={{
                        background: liked[sel.gid] ? 'rgba(255,50,80,0.18)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${liked[sel.gid] ? 'rgba(255,80,100,0.5)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius:10, padding:'11px 16px', cursor:'pointer',
                        display:'flex', alignItems:'center', gap:6,
                        color: liked[sel.gid] ? '#ff6080' : 'rgba(255,255,255,0.7)',
                        fontSize:13, fontFamily:"'Jost',sans-serif", fontWeight:600,
                        transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >{liked[sel.gid] ? '❤️' : '🤍'} <span style={{fontSize:10,letterSpacing:'.08em'}}>{liked[sel.gid]?'Liked':'Like'}</span></motion.button>

                    {/* Save Button - with Animation */}
                    <motion.button
                      onClick={e=>handleSave(sel,e)}
                      title={isLoggedIn ? 'Save to collection' : 'Sign in to save'}
                      animate={{y:[0,-2,0]}}
                      transition={{duration:2.5,repeat:Infinity,ease:'easeInOut',delay:0.1}}
                      whileHover={{scale:1.1,background: saved[sel.gid] ? 'rgba(255,215,0,0.24)' : 'rgba(255,255,255,0.15)'}}
                      whileTap={{scale:0.92}}
                      style={{
                        background: saved[sel.gid] ? 'rgba(255,215,0,0.14)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${saved[sel.gid] ? 'rgba(255,215,0,0.45)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius:10, padding:'11px 16px', cursor:'pointer',
                        display:'flex', alignItems:'center', gap:6,
                        color: saved[sel.gid] ? '#FFD700' : 'rgba(255,255,255,0.7)',
                        fontSize:13, fontFamily:"'Jost',sans-serif", fontWeight:600,
                        transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >{saved[sel.gid] ? '🔖' : '📌'} <span style={{fontSize:10,letterSpacing:'.08em'}}>{saved[sel.gid]?'Saved':'Save'}</span></motion.button>

                    {/* Comment Button - with Animation */}
                    <motion.button
                      onClick={e=>{e.stopPropagation();setShowComments(v=>!v);}}
                      title="View & add comments"
                      animate={{y:[0,-2,0]}}
                      transition={{duration:2.5,repeat:Infinity,ease:'easeInOut',delay:0.2}}
                      whileHover={{scale:1.1,background: showComments ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.15)'}}
                      whileTap={{scale:0.92}}
                      style={{
                        background: showComments ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${showComments ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius:10, padding:'11px 16px', cursor:'pointer',
                        display:'flex', alignItems:'center', gap:6,
                        color:'rgba(255,255,255,0.7)', fontSize:13,
                        fontFamily:"'Jost',sans-serif", fontWeight:600, transition:'all .2s',
                        boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >💬 <span style={{fontSize:10,letterSpacing:'.08em'}}>{(comments[sel.id]||[]).length || ''} {showComments ? 'Hide' : 'Comments'}</span></motion.button>
                  </div>
                </motion.div>

                {/* Commission CTA row - Floating */}
                <motion.div 
                  initial={{opacity:0}} 
                  animate={{opacity:1}} 
                  transition={{delay:0.35,duration:0.5}}
                  style={{padding:'18px 28px',border:`1px solid ${C.borderHi}`,borderTop:`1px solid rgba(255,255,255,0.06)`,background:'linear-gradient(135deg,rgba(255,215,0,0.05) 0%,rgba(0,0,0,0.4) 100%)',backdropFilter:'blur(16px)',display:'flex',justifyContent:'flex-end'}}
                >
                  <CurvyButton primary onClick={e=>{e.stopPropagation();window.open(`https://wa.me/919382877351?text=${encodeURIComponent(`Namaskaram, I am interested in commissioning a ${sel.deity} (${sel.metal}). Please share details.`)}`);}} >
                    Commission This →
                  </CurvyButton>
                </motion.div>

                {/* Comments panel - Floating with Smooth Expand */}
                <AnimatePresence>
                  {showComments && (
                    <motion.div
                      initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      transition={{duration:0.4,ease:[.16,1,.3,1]}}
                      style={{overflow:'hidden',border:`1px solid ${C.borderHi}`,borderTop:'none',background:'linear-gradient(135deg,rgba(0,0,0,0.6) 0%,rgba(255,215,0,0.02) 100%)',backdropFilter:'blur(16px)',borderRadius:'0 0 14px 14px',boxShadow:'0 16px 48px rgba(0,0,0,0.4)'}}
                      onClick={e=>e.stopPropagation()}
                    >
                      <div style={{padding:'16px 24px 8px',maxHeight:220,overflowY:'auto'}}>
                        {(comments[sel.id]||[]).length === 0 ? (
                          <p style={{...ff.serif,fontSize:13,color:'rgba(255,255,255,0.35)',fontStyle:'italic',textAlign:'center',padding:'8px 0'}}>No comments yet — be the first.</p>
                        ) : (comments[sel.id]||[]).map((c,i) => (
                          <div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
                            <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,215,0,0.15)',border:'1px solid rgba(255,215,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11}}>✦</div>
                            <div>
                              <div style={{...ff.body,fontSize:10,color:'rgba(255,255,255,0.8)',lineHeight:1.5}}>{c.text}</div>
                              <div style={{...ff.body,fontSize:8,color:'rgba(255,255,255,0.3)',marginTop:2,letterSpacing:'.1em'}}>{c.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Add comment input */}
                      <div style={{padding:'14px 20px 18px',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',gap:8,alignItems:'center'}}>
                        <input
                          value={commentInput}
                          onChange={e=>setCommentInput(e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&handleAddComment(sel,e)}
                          onClick={e=>e.stopPropagation()}
                          placeholder={isLoggedIn ? 'Add a comment…' : 'Sign in to comment…'}
                          readOnly={!isLoggedIn}
                          style={{
                            flex:1, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.16)',
                            borderRadius:10, padding:'11px 16px', color:'rgba(255,255,255,0.85)',
                            fontFamily:"'Jost',sans-serif", fontSize:13, outline:'none',
                            cursor: isLoggedIn ? 'text' : 'pointer',
                            transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
                          }}
                          onFocus={e=>{if(!isLoggedIn){setGlobalAuthAction('comment');setShowAuthModal(true);}}}
                        />
                        <motion.button
                          onClick={e=>handleAddComment(sel,e)}
                          whileHover={{scale:1.08}}
                          whileTap={{scale:0.92}}
                          style={{background:'rgba(255,215,0,0.18)',border:'1px solid rgba(255,215,0,0.4)',borderRadius:10,padding:'11px 18px',color:'#FFD700',cursor:'pointer',fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:700,letterSpacing:'.15em',transition:'all .2s',boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}
                        >Post</motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Auth modal moved to AppContent */}

        <SectionCTA primary="Commission a Piece" secondary="Contact Us"
          onPrimary={()=>setShowCommissionModal(true)}
          onSecondary={()=>window.open(BIZ.whatsapp)}/>
      </div>
    </section>
  );
};

export default Gallery;
