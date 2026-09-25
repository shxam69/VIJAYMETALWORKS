import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { GALLERY_IDOLS } from '../../data/galleryData';
import {
  getUserState,
  logViewEvent,
  toggleIdolLike,
  toggleIdolSave,
  getIdolComments,
  getIdolLikesCount,
  getIdolSavesCount,
  addIdolComment,
} from '../../lib/supabase';
import ProfileModal from '../auth/ProfileModal';
import WatermarkedImage from '../common/WatermarkedImage';

const ImmersiveFeed = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const initialId = location.state?.activeId;
  
  // If we arrived with an activeId (from home/gallery card click), go straight to fullscreen
  const [immersiveMode, setImmersiveMode] = useState(initialId !== undefined && initialId !== null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // FIX: Fetch admin-uploaded items from Supabase and merge with static GALLERY_IDOLS
  // This ensures uploads from the admin dashboard appear in the gallery immediately
  const [liveItems, setLiveItems] = useState([]);
  useEffect(() => {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    let cancelled = false;
    fetch(`${supabaseUrl}/rest/v1/gallery_items?select=*&order=created_at.desc`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    })
    .then(r => r.ok ? r.json() : [])
    .then(rows => {
      if (cancelled) return;
      const valid = (rows || []).filter(r => r.image_url && r.image_url.length > 0);
      const mapped = valid.map(r => ({
        id: r.id, gid: r.id,
        deity: r.title,                       // Title/caption set in admin
        metal: r.metal_type || '',
        purity: r.purity || '',
        dims: r.dimensions || '',
        stone: r.stone_type || '',
        duration: r.crafting_duration || '',
        origin: 'Sowcarpet',
        img: r.image_url,
        cat: r.category || 'Gold Work',
        artisanNotes: r.artisan_notes || '',
        description: r.description || '',     // Public caption editable in admin
        isFeatured: r.is_featured || false,
        _isUploaded: true,
      }));
      setLiveItems(mapped);
    })
    .catch(() => {});
    return () => { cancelled = true; };
  }, []); // runs once on mount; admin panel changes are picked up on next page load

  // Merge static + live items; deduplicate by image URL so seeded items never show twice
  const allIdols = useMemo(() => {
    const uploadedUrls = new Set(liveItems.map(i => i.img));
    const staticOnly = GALLERY_IDOLS.filter(i => !uploadedUrls.has(i.img));
    return [...staticOnly, ...liveItems];
  }, [liveItems]);

  // FIX: useMemo prevents a new array reference on every render, which was causing
  // the useEffect(,[activeIdx, filteredIdols]) to fire infinitely → screen freeze
  const filteredIdols = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    if (!q) return allIdols;
    return allIdols.filter(i =>
      i.deity.toLowerCase().includes(q) ||
      i.cat.toLowerCase().includes(q) ||
      i.metal.toLowerCase().includes(q)
    );
  }, [allIdols, searchQuery]);
  
  const initialIdx = initialId !== undefined ? filteredIdols.findIndex(i => i.id === initialId) : 0;
  const [activeIdx, setActiveIdx] = useState(Math.max(0, initialIdx));
  const containerRef = useRef(null);
  const didScrollRef = useRef(false);

  // Scroll to the correct photo immediately on mount — use requestAnimationFrame to ensure DOM is ready
  const activeIdxRef = useRef(activeIdx);
  useEffect(() => {
    if (!immersiveMode || didScrollRef.current) return;
    const scrollToIdx = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = activeIdxRef.current * window.innerHeight;
        didScrollRef.current = true;
      } else {
        requestAnimationFrame(scrollToIdx);
      }
    };
    requestAnimationFrame(scrollToIdx);
  }, [immersiveMode]); // intentionally runs only when immersiveMode changes

  // Load user state from localStorage + initialize with real counts
  const userState = getUserState();
  const [liked, setLiked] = useState(userState.likes);
  const [saved, setSaved] = useState(userState.saves);
  const [comments, setComments] = useState(userState.comments);
  const [likesCounts, setLikesCounts] = useState({});
  const [savesCounts, setSavesCounts] = useState({});
  const [realComments, setRealComments] = useState({});
  
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [doubleTapGlow, setDoubleTapGlow] = useState(false);
  const [saveAnimMsg, setSaveAnimMsg] = useState(false);

  const { isLoggedIn, user, setShowAuthModal, setAuthAction, setShowCommissionModal } = useAppCtx();
  const userId = user?.id || 'guest';

  // Load real counts for active item
  // FIX: Depend on idol.id (primitive) not filteredIdols (new array ref each render)
  // and extract isLoggedIn/userId as stable refs to avoid re-firing on auth changes
  const activeIdolId = filteredIdols[activeIdx]?.id ?? null;
  const isLoggedInRef = useRef(isLoggedIn);
  const userIdRef = useRef(userId);
  useEffect(() => { isLoggedInRef.current = isLoggedIn; }, [isLoggedIn]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  useEffect(() => {
    if (!activeIdolId) return;
    let cancelled = false;

    (async () => {
      const count = await getIdolLikesCount(activeIdolId);
      if (!cancelled) setLikesCounts(p => ({...p, [activeIdolId]: count}));
    })();

    (async () => {
      const count = await getIdolSavesCount(activeIdolId);
      if (!cancelled) setSavesCounts(p => ({...p, [activeIdolId]: count}));
    })();

    (async () => {
      const data = await getIdolComments(activeIdolId);
      if (!cancelled) setRealComments(p => ({...p, [activeIdolId]: data}));
    })();

    if (isLoggedInRef.current) {
      logViewEvent(activeIdolId, userIdRef.current);
    }

    return () => { cancelled = true; };
  }, [activeIdolId]); // only re-fire when the active item actually changes

  // FIX: Memoize scroll handler — prevents new function ref on every render
  const filteredIdolsLengthRef = useRef(filteredIdols.length);
  useEffect(() => { filteredIdolsLengthRef.current = filteredIdols.length; }, [filteredIdols.length]);

  const handleScroll = useCallback((e) => {
    const container = e.target;
    const itemHeight = window.innerHeight;
    const index = Math.round(container.scrollTop / itemHeight);
    if (index !== activeIdx && index >= 0 && index < filteredIdolsLengthRef.current) {
      setActiveIdx(index);
      setShowComments(false);
      setShowDetailPanel(false);
      setShowShareMenu(false);
    }
  }, [activeIdx]); // only activeIdx is read from closure

  // FIX: Stable reference for handleInteraction — reads isLoggedIn from ref
  const handleInteraction = useCallback((actionType) => {
    if (!isLoggedInRef.current) {
      setAuthAction(actionType);
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [setAuthAction, setShowAuthModal]); // context setters are stable

  const toggleLike = useCallback((id) => {
    if (handleInteraction('like')) {
      const isCurrentlyLiked = liked[id];
      // FIX: Update React state optimistically
      setLiked(p => ({...p, [id]: !isCurrentlyLiked}));
      // FIX: Update display count optimistically
      setLikesCounts(p => ({
        ...p,
        [id]: Math.max(0, (p[id] || 0) + (isCurrentlyLiked ? -1 : 1))
      }));
      // FIX: toggleIdolLike already handles localStorage + Supabase — don't double-write
      toggleIdolLike(id, userId, isCurrentlyLiked);
    }
  }, [liked, userId, handleInteraction]); // stable deps

  const toggleSave = useCallback((id) => {
    if (handleInteraction('save')) {
      const isCurrentlySaved = saved[id];
      // FIX: Update React state optimistically
      setSaved(p => ({...p, [id]: !isCurrentlySaved}));
      // FIX: Update display count optimistically
      setSavesCounts(p => ({
        ...p,
        [id]: Math.max(0, (p[id] || 0) + (isCurrentlySaved ? -1 : 1))
      }));
      if (!isCurrentlySaved) {
        setSaveAnimMsg(true);
        setTimeout(() => setSaveAnimMsg(false), 2000);
      }
      // FIX: toggleIdolSave already handles localStorage + Supabase — don't double-write
      toggleIdolSave(id, userId, isCurrentlySaved);
    }
  }, [saved, userId, handleInteraction]); // stable deps

  const postComment = useCallback((id) => {
    if (!handleInteraction('comment')) return;
    if (!commentInput.trim()) return;
    const text = commentInput.trim();
    const username = userIdRef.current !== 'guest' ? (userIdRef.current?.split?.('@')[0] || 'Guest') : 'Guest';
    // FIX: Optimistic UI update only — addIdolComment handles localStorage + Supabase
    setComments(p => ({
      ...p,
      [id]: [...(p[id] || []), {
        text, user: username, time: 'Just now', id: 'temp_' + Date.now()
      }]
    }));
    addIdolComment(id, userIdRef.current, text);
    setCommentInput('');
  }, [commentInput, handleInteraction]); // stable refs used for userId

  // FIX: Use a ref for liked so double-tap callback is always stable (no stale closure)
  const likedRef = useRef(liked);
  useEffect(() => { likedRef.current = liked; }, [liked]);

  const handleDoubleTap = useCallback((id) => {
    // Show glow animation regardless of login state
    setDoubleTapGlow(true);
    setTimeout(() => setDoubleTapGlow(false), 800);
    // Only like if logged in AND not already liked (prevent double-fire)
    if (isLoggedInRef.current && !likedRef.current[id]) {
      setLiked(p => ({...p, [id]: true}));
      setLikesCounts(p => ({...p, [id]: (p[id] || 0) + 1}));
      // toggleIdolLike handles localStorage + Supabase
      toggleIdolLike(id, userIdRef.current, false);
    }
  }, []); // empty deps — reads from refs, never stale

  const activeItem = filteredIdols[activeIdx];

  // Icons
  const IconHeart = ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#FFD700' : 'none'} stroke={filled ? '#FFD700' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
  const IconComment = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );
  const IconBookmark = ({ filled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#FFD700' : 'none'} stroke={filled ? '#FFD700' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );
  const IconShare = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: C.bg1,
      // NO overflow:hidden — this traps scroll inside child containers
      color: C.text,
      zIndex: 2000,
    }}>
      {/* Floating Search Bar — solid background on mobile avoids GPU-intensive backdrop-filter on scroll */}
      <motion.div
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0.1 }}
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 0px)',
          left: 0, right: 0,
          zIndex: 160,
          display: 'flex',
          justifyContent: 'center',
          padding: '10px 16px 6px',
          // Solid background is faster on mobile than blur — same visual result
          background: `linear-gradient(to bottom, ${C.bg1}f5 60%, transparent 100%)`,
          pointerEvents: isSearchOpen || !immersiveMode ? 'auto' : 'none',
        }}
      >
        <div style={{
          background: isSearchOpen ? (C.isDark ? 'rgba(22,18,14,0.96)' : 'rgba(255,255,255,0.95)') : (C.isDark ? 'rgba(22,18,14,0.7)' : 'rgba(255,255,255,0.8)'),
          border: `1px solid ${isSearchOpen ? 'rgba(255,215,0,0.4)' : 'rgba(255,215,0,0.15)'}`,
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          padding: '9px 16px',
          width: isSearchOpen ? '100%' : 'auto',
          maxWidth: 520,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,215,0,0.7)" strokeWidth="2" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => setIsSearchOpen(true)}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {isSearchOpen ? (
            <>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search deity, metal, category…"
                style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', flex: 1, fontFamily: "'Jost', sans-serif", fontSize: 14, letterSpacing: '0.04em', minWidth: 0 }}
                onBlur={() => !searchQuery && setIsSearchOpen(false)}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0, touchAction: 'manipulation' }}>×</button>
              )}
            </>
          ) : (
            <span onClick={() => setIsSearchOpen(true)} style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(255,215,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>Search</span>
          )}
        </div>
      </motion.div>

      {!immersiveMode ? (
        /* ═══════════════════════════════════════════════════════
           PREMIUM MASONRY GALLERY
           Mobile-first: 2 col on phones, 3 col on tablets/desktop
           Pinterest + Luxury Portfolio aesthetic on ALL devices
        ═══════════════════════════════════════════════════════ */
        <div style={{
          height: '100vh',
          width: '100vw',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // iOS momentum scroll
          overscrollBehavior: 'contain',
          paddingTop: 80, // space for floating search bar
          paddingBottom: 100, // space for bottom nav
          boxSizing: 'border-box',
        }}>
          <style>{`
            /* ── Masonry grid ── */
            .vmw-masonry {
              column-count: 2;
              column-gap: 8px;
              padding: 0 10px 16px;
              margin: 0 auto;
            }
            @media (min-width: 600px) {
              .vmw-masonry {
                column-count: 3;
                column-gap: 12px;
                padding: 0 16px 24px;
                max-width: 900px;
              }
            }
            @media (min-width: 1024px) {
              .vmw-masonry {
                column-count: 3;
                column-gap: 20px;
                padding: 0 32px 40px;
                max-width: 1400px;
              }
            }
            @media (min-width: 1400px) {
              .vmw-masonry {
                column-count: 4;
                column-gap: 24px;
                max-width: 1600px;
              }
            }

            /* ── Masonry card ── */
            .vmw-card {
              break-inside: avoid;
              -webkit-column-break-inside: avoid;
              margin-bottom: 8px;
              position: relative;
              border-radius: 10px;
              overflow: hidden;
              cursor: pointer;
              border: 1px solid rgba(255,215,0,0.12);
              background: C.isDark ? 'rgba(14,11,8,0.8)' : 'rgba(255,255,255,0.8)';
              display: block;
              /* GPU compositing layer — prevents paint thrashing on scroll */
              will-change: transform;
              transform: translateZ(0);
            }
            @media (min-width: 600px) {
              .vmw-card { margin-bottom: 12px; border-radius: 12px; }
            }
            @media (min-width: 1024px) {
              .vmw-card { margin-bottom: 20px; border-radius: 16px; }
            }

            /* ── Card image ── */
            .vmw-card img {
              width: 100%;
              display: block;
              /* Natural aspect ratio — no crop, no stretch */
              height: auto;
              object-fit: cover;
              /* Slight warmth filter matching the luxury aesthetic */
              filter: sepia(5%) brightness(0.96);
              transition: transform 0.6s ease, filter 0.4s ease;
            }
            /* Hover only on pointer devices — no ghost hover on mobile */
            @media (hover: hover) {
              .vmw-card:hover { border-color: rgba(255,215,0,0.4); }
              .vmw-card:hover img { transform: scale(1.06); filter: sepia(8%) brightness(1.02); }
            }
            /* Touch active state for mobile */
            .vmw-card:active { opacity: 0.88; }

            /* ── Card overlay text ── */
            .vmw-card-overlay {
              position: absolute;
              bottom: 0; left: 0; right: 0;
              background: linear-gradient(to top, rgba(5,3,1,0.96) 0%, rgba(0,0,0,0.5) 55%, transparent 100%);
              padding: 28px 12px 12px;
              pointer-events: none;
            }
            @media (min-width: 600px) {
              .vmw-card-overlay { padding: 36px 16px 14px; }
            }
            @media (min-width: 1024px) {
              .vmw-card-overlay { padding: 44px 20px 18px; }
            }

            /* ── Card title ── */
            .vmw-card-title {
              font-family: 'Cinzel', serif;
              font-size: 12px;
              font-weight: 600;
              color: #FFD700;
              margin: 0 0 3px;
              text-shadow: 0 1px 6px rgba(0,0,0,0.9);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            @media (min-width: 600px) { .vmw-card-title { font-size: 14px; } }
            @media (min-width: 1024px) { .vmw-card-title { font-size: 17px; margin-bottom: 5px; } }

            /* ── Card subtitle ── */
            .vmw-card-sub {
              font-family: 'Jost', sans-serif;
              font-size: 8px;
              font-weight: 600;
              color: rgba(255,255,255,0.6);
              text-transform: uppercase;
              letter-spacing: 0.12em;
              margin: 0;
            }
            @media (min-width: 600px) { .vmw-card-sub { font-size: 9px; } }
            @media (min-width: 1024px) { .vmw-card-sub { font-size: 11px; } }

            /* ── Metal badge ── */
            .vmw-card-badge {
              position: absolute;
              top: 10px; left: 10px;
              padding: 3px 7px;
              background: rgba(0,0,0,0.55);
              backdrop-filter: blur(6px);
              -webkit-backdrop-filter: blur(6px);
              border: 1px solid rgba(255,215,0,0.3);
              border-radius: 4px;
              color: #FFD700;
              font-family: 'Jost', sans-serif;
              font-size: 7px;
              font-weight: 700;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              pointer-events: none;
              /* Limit badge length on narrow cards */
              max-width: calc(100% - 20px);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            @media (min-width: 600px) { .vmw-card-badge { font-size: 8px; padding: 4px 8px; top: 12px; left: 12px; } }
            @media (min-width: 1024px) { .vmw-card-badge { font-size: 9px; padding: 5px 10px; top: 14px; left: 14px; } }

            /* ── Empty state ── */
            .vmw-empty {
              grid-column: 1 / -1;
              text-align: center;
              padding: 80px 24px;
              color: rgba(255,255,255,0.3);
              font-family: 'Cormorant Garamond', serif;
              font-size: 20px;
              font-style: italic;
            }

            /* ── Masonry section heading ── */
            .vmw-gallery-heading {
              text-align: center;
              padding: 8px 16px 24px;
            }
            .vmw-gallery-heading h1 {
              font-family: 'Cinzel', serif;
              font-size: clamp(22px, 6vw, 48px);
              color: #FFD700;
              margin: 0 0 6px;
              font-weight: 700;
              letter-spacing: 0.04em;
            }
            .vmw-gallery-heading p {
              font-family: 'Cormorant Garamond', serif;
              font-size: clamp(13px, 3vw, 16px);
              color: rgba(255,255,255,0.55);
              font-style: italic;
              margin: 0;
            }
          `}</style>

          {/* Gallery heading */}
          <div className="vmw-gallery-heading">
            <h1>Sacred Craftsmanship</h1>
            <p>Handcrafted temple metalwork · Sowcarpet, Chennai · Est. 1915</p>
          </div>

          {/* Masonry grid */}
          <div className="vmw-masonry" style={{ margin: '0 auto' }}>
            {filteredIdols.length === 0 ? (
              <div className="vmw-empty">No masterpieces found for "{searchQuery}"</div>
            ) : (
              filteredIdols.map((idol, i) => (
                <div
                  key={idol.gid || idol.id}
                  className="vmw-card"
                  onClick={() => {
                    setActiveIdx(i);
                    didScrollRef.current = false;
                    setImmersiveMode(true);
                  }}
                >
                  {/* Lazy-loaded image with watermark preserving natural aspect ratio */}
                  <WatermarkedImage
                    src={idol.img}
                    alt={idol.deity}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Gradient overlay + text */}
                  <div className="vmw-card-overlay">
                    <div className="vmw-card-title">{idol.deity}</div>
                    <p className="vmw-card-sub">{idol.cat}</p>
                  </div>

                  {/* Metal badge */}
                  <div className="vmw-card-badge">{idol.metal}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════
           IMMERSIVE FULLSCREEN VIEWER
           Instagram/TikTok style — fires ONLY when card clicked
        ═══════════════════════════════════════════════════════ */
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            position: 'fixed', // fixed on mobile prevents body scroll interference
            inset: 0,
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollSnapType: 'y mandatory',
            // NO scrollBehavior:'smooth' — it conflicts with scroll snapping on iOS
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y', // iOS needs explicit touch-action for snap scroll
            overscrollBehavior: 'none',
          }}
        >
          {/* Back button — mobile safe area aware */}
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            onClick={() => {
              setImmersiveMode(false);
              setShowDetailPanel(false);
              setShowComments(false);
              setShowShareMenu(false);
            }}
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 16px) + 16px)',
              left: 16,
              zIndex: 200,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: '50%',
              width: 44, height: 44,
              color: '#FFD700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'manipulation',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </motion.button>

          {filteredIdols.map((idol, idx) => (
            <div
              key={idol.gid || idol.id}
              onDoubleClick={() => handleDoubleTap(idol.gid)}
              style={{
                height: '100dvh', // dynamic viewport height — fixes iOS Safari chrome offset
                width: '100vw',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always', // forces one-at-a-time snap
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Background blur — pointerEvents:none prevents gesture steal */}
              <img
                src={idol.img}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(50px) brightness(0.22)', transform: 'scale(1.15)', pointerEvents: 'none' }}
                alt=""
                loading={Math.abs(idx - activeIdx) > 2 ? 'lazy' : 'eager'}
              />

              {/* Main cinema image — contained, never cropped */}
              <WatermarkedImage
                src={idol.img}
                alt={idol.deity}
                containerStyle={{
                  position: 'relative',
                  maxWidth: 'min(88vw, 540px)',
                  maxHeight: 'min(72vh, 640px)',
                  width: 'auto',
                  height: 'auto',
                  zIndex: 1,
                  filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.92))',
                  borderRadius: 10,
                  pointerEvents: 'none',
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                loading={Math.abs(idx - activeIdx) > 2 ? 'lazy' : 'eager'}
              />
                }}
              />

              {/* Double-tap glow — pointerEvents:none */}
              <AnimatePresence>
                {doubleTapGlow && idx === activeIdx && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    style={{ position: 'absolute', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}
                  >
                    <IconHeart filled />
                    <div style={{ position: 'absolute', inset: -24, background: 'radial-gradient(circle, rgba(255,215,0,0.55) 0%, transparent 70%)', filter: 'blur(12px)', pointerEvents: 'none' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved toast — pointerEvents:none */}
              <AnimatePresence>
                {saveAnimMsg && idx === activeIdx && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    style={{ position: 'absolute', top: '18%', background: 'rgba(255,215,0,0.14)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,215,0,0.5)', color: '#FFD700', padding: '10px 20px', borderRadius: 28, zIndex: 50, fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}
                  >
                    <IconBookmark filled /> Saved to Collection
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom gradient — pointerEvents:none */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.25) 45%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />

              {/* LEFT: Title + subtitle + View More */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
                left: 16,
                right: 80, // leave room for right-side action buttons
                zIndex: 3,
                pointerEvents: 'auto', // buttons need to be tappable
              }}>
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: idx === activeIdx ? 1 : 0, x: idx === activeIdx ? 0 : -24 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.28)', padding: '4px 8px', borderRadius: 5, fontSize: 8, textTransform: 'uppercase', color: '#FFD700', letterSpacing: '0.14em', fontWeight: 700, backdropFilter: 'blur(6px)' }}>{idol.cat}</span>
                    <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', padding: '4px 8px', borderRadius: 5, fontSize: 8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.14em', fontWeight: 600, backdropFilter: 'blur(6px)' }}>{idol.metal}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(20px, 5.5vw, 38px)', margin: '0 0 6px', color: '#FFD700', textShadow: '0 3px 10px rgba(0,0,0,0.95)', fontWeight: 600, lineHeight: 1.1 }}>{idol.deity}</h2>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(13px, 3.5vw, 16px)', color: 'rgba(255,255,255,0.8)', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.9)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {idol.artisanNotes ? idol.artisanNotes.slice(0, 72) + '…' : 'Sacred craftsmanship · Sowcarpet workshop'}
                  </p>
                  <button
                    onClick={() => setShowDetailPanel(true)}
                    style={{ background: 'none', border: 'none', color: '#FFD700', fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 0 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: 0.85, touchAction: 'manipulation' }}
                  >
                    View More <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </motion.div>
              </div>

              {/* RIGHT: Action buttons — gid-keyed, safe-area aware */}
              <div style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
                right: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                alignItems: 'center',
                zIndex: 3,
              }}>
                {[
                  { key: 'like',    icon: <IconHeart filled={!!liked[idol.gid]}/>,    count: likesCounts[idol.gid] ?? '0', action: () => toggleLike(idol.gid),    active: !!liked[idol.gid] },
                  { key: 'comment', icon: <IconComment/>,                              count: (realComments[idol.gid]?.length ?? 0) || '0', action: () => setShowComments(true), active: false },
                  { key: 'save',    icon: <IconBookmark filled={!!saved[idol.gid]}/>, count: savesCounts[idol.gid] ?? '0', action: () => toggleSave(idol.gid),    active: !!saved[idol.gid] },
                  { key: 'share',   icon: <IconShare/>,                               count: 'Share',                      action: () => setShowShareMenu(true),  active: false },
                ].map((btn, i) => (
                  <motion.div
                    key={btn.key}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: idx === activeIdx ? 1 : 0, x: idx === activeIdx ? 0 : 24 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={btn.action}
                      style={{
                        background: 'none', border: 'none',
                        color: btn.active ? '#FFD700' : 'rgba(255,255,255,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 8,
                        touchAction: 'manipulation',
                        // Minimum 44×44 touch target per Apple HIG
                        minWidth: 44, minHeight: 44,
                        filter: btn.active ? 'drop-shadow(0 0 6px rgba(255,215,0,0.7))' : 'none',
                        transition: 'color 0.25s, filter 0.25s',
                      }}
                    >
                      {btn.icon}
                    </motion.button>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', userSelect: 'none' }}>{btn.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL PANEL — Bottom sheet on mobile, side panel on desktop */}
      <AnimatePresence>
        {showDetailPanel && activeItem && (
          <>
            {/* Backdrop for mobile bottom-sheet dismiss */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDetailPanel(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 148, background: 'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                maxHeight: '80vh',
                background: C.isDark ? 'linear-gradient(180deg, rgba(22,18,14,0.98) 0%, rgba(12,9,6,1) 100%)' : 'linear-gradient(180deg, rgba(250,245,236,0.99) 0%, rgba(240,232,220,1) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(255,215,0,0.2)',
                borderRadius: '28px 28px 0 0',
                zIndex: 149,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
                boxShadow: C.isDark ? '0 -24px 80px rgba(0,0,0,0.8)' : '0 -24px 80px rgba(100,70,20,0.2)',
              }}
            >
              {/* Drag handle */}
              <div style={{ width: 40, height: 4, background: 'rgba(255,215,0,0.3)', borderRadius: 2, margin: '16px auto 0', flexShrink: 0 }} />

              <div style={{ padding: '20px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(18px, 5vw, 26px)', color: '#FFD700', margin: '0 0 6px' }}>{activeItem.deity}</h2>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', margin: 0 }}>Sacred craftsmanship · Sowcarpet</p>
                </div>
                <button
                  onClick={() => setShowDetailPanel(false)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 28, cursor: 'pointer', lineHeight: 1, flexShrink: 0, padding: 4, touchAction: 'manipulation' }}
                >×</button>
              </div>

              {/* Metadata grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 24px', borderTop: '1px solid rgba(255,215,0,0.1)' }}>
                {[
                  { l: 'Material', v: activeItem.metal },
                  { l: 'Category', v: activeItem.cat },
                  { l: 'Crafting Time', v: '45–60 Days' },
                  { l: 'Origin', v: 'Sowcarpet, Chennai' },
                  { l: 'Technique', v: 'Lost Wax Casting' },
                  { l: 'Purity', v: 'Certified' },
                ].map(d => (
                  <div key={d.l} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,215,0,0.08)' }}>
                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(255,215,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 3, fontWeight: 700 }}>{d.l}</div>
                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: C.text }}>{d.v || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Artisan notes */}
              {activeItem.artisanNotes && (
                <div style={{ padding: '0 24px 16px', borderTop: '1px solid rgba(255,215,0,0.1)', paddingTop: 16 }}>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(255,215,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, fontWeight: 700 }}>Artisan Notes</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.dim, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{activeItem.artisanNotes}</p>
                </div>
              )}

              {/* Commission CTA */}
              <div style={{ padding: '16px 24px' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowDetailPanel(false); setShowCommissionModal(true); }}
                  style={{ width: '100%', padding: '16px 24px', background: 'linear-gradient(135deg, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.08) 100%)', border: '1px solid rgba(255,215,0,0.45)', borderRadius: 12, color: '#FFD700', fontFamily: "'Jost', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, touchAction: 'manipulation' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Commission This Piece
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SHARE MENU — position:fixed works on all mobile contexts */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 480, background: C.isDark ? 'rgba(18,14,10,0.99)' : 'rgba(250,245,236,0.99)', border: `1px solid ${C.borderGold}`, borderRadius: '24px 24px 0 0', padding: '24px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', boxShadow: C.shadow }}
            >
              <div style={{ width: 36, height: 4, background: 'rgba(255,215,0,0.25)', borderRadius: 2, margin: '0 auto 20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,215,0,0.85)', fontWeight: 700 }}>Share This Piece</span>
                <button onClick={() => setShowShareMenu(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 24, cursor: 'pointer', touchAction: 'manipulation' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Copy Link', icon: '🔗', action: () => { navigator.clipboard?.writeText(window.location.href); setShowShareMenu(false); } },
                  { label: 'WhatsApp', icon: '💬', action: () => window.open(`https://wa.me/?text=${encodeURIComponent((activeItem?.deity || '') + ' — ' + window.location.href)}`) },
                  { label: 'Instagram', icon: '📸', action: () => {} },
                  { label: 'Pinterest', icon: '📌', action: () => {} },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={p.action}
                    style={{ background: C.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: C.text, touchAction: 'manipulation' }}
                  >
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURY COMMENT DRAWER */}
      <AnimatePresence>
        {showComments && activeItem && (
          <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65vh', background: C.isDark ? 'rgba(15, 12, 10, 0.95)' : 'rgba(248, 243, 235, 0.98)', backdropFilter: 'blur(40px)', borderTop: `1px solid ${C.borderGold}`, borderRadius: '32px 32px 0 0', zIndex: 150, display: 'flex', flexDirection: 'column', boxShadow: C.shadow }}>
            <div style={{ padding: '24px 32px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><IconComment/><h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Jost', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FFD700' }}>Admirations</h3></div>
              <button onClick={() => setShowComments(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 28, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              {((realComments[activeItem.gid] || []).concat(comments[activeItem.gid] || [])).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 60, fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic' }}>A silent admiration.<br/>Be the first to share your thoughts.</div>
              ) : (
                ((realComments[activeItem.gid] || []).concat(comments[activeItem.gid] || [])).map((c, i) => (
                  <div key={c.id || i} style={{ marginBottom: 18, display: 'flex', gap: 12, background: C.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', padding: 14, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: 15, flexShrink: 0 }}>{(c.user || 'A')[0]}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "'Jost', sans-serif" }}>{c.user}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Jost', sans-serif" }}>{c.time || (c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '')}</div>
                      </div>
                      <div style={{ fontSize: 14, fontFamily: "'Cormorant Garamond', serif", color: C.dim, lineHeight: 1.5, fontStyle: 'italic' }}>{c.text || c.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '12px 16px', background: C.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(235,228,215,0.9)', display: 'flex', gap: 10, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
              <input
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && postComment(activeItem.gid)}
                placeholder="Share your admiration..."
                style={{ flex: 1, background: C.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)', border: `1px solid ${C.borderGold}`, borderRadius: 24, padding: '12px 16px', color: C.text, outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: 14 }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => postComment(activeItem.gid)}
                style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 24, padding: '0 18px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0, touchAction: 'manipulation' }}
              >Post</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION — position:fixed, always visible on masonry + immersive */}
      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0.15 }}
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 150,
          background: 'linear-gradient(to top, rgba(4,3,2,0.99) 0%, rgba(8,6,4,0.92) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,215,0,0.1)',
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          // Dynamic height: nav content + safe area
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingTop: 8,
          paddingLeft: 4,
          paddingRight: 4,
          minHeight: 64,
        }}
      >
        {[
          {
            l: 'Home',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
            action: () => navigate('/'),
          },
          {
            l: 'Search',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
            action: () => setIsSearchOpen(true),
          },
          null, // centre slot = Enquire pill
          {
            l: 'Saved',
            icon: <IconBookmark filled={false}/>,
            action: () => setShowProfile(true),
          },
          {
            l: 'Profile',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            action: () => setShowProfile(true),
          },
        ].map((btn, i) => {
          if (btn === null) {
            // Central Enquire pill — lifted above nav bar
            return (
              <motion.button
                key="enquire"
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowCommissionModal(true)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.95) 0%, rgba(195,148,0,1) 100%)',
                  border: 'none',
                  borderRadius: 32,
                  height: 46,
                  padding: '0 18px',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontFamily: "'Jost', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: 11,
                  boxShadow: '0 4px 20px rgba(255,215,0,0.35), 0 2px 8px rgba(0,0,0,0.6)',
                  transform: 'translateY(-12px)',
                  touchAction: 'manipulation',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>Enquire</span>
              </motion.button>
            );
          }
          return (
            <motion.button
              key={btn.l}
              whileTap={{ scale: 0.88 }}
              onClick={btn.action}
              style={{
                background: 'none',
                border: 'none',
                color: C.dim,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                cursor: 'pointer',
                padding: '6px 8px',
                minWidth: 44,
                minHeight: 44,
                touchAction: 'manipulation',
                transition: 'color 0.2s',
              }}
              onTouchStart={e => e.currentTarget.style.color = '#FFD700'}
              onTouchEnd={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            >
              {btn.icon}
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{btn.l}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} C={C} />}
      </AnimatePresence>
    </div>
  );
};


export default ImmersiveFeed;
