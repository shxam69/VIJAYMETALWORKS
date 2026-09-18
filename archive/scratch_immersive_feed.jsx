const ImmersiveFeed = () => {
  const C = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const initialId = location.state?.activeId;
  
  const [immersiveMode, setImmersiveMode] = useState(!!initialId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const filteredIdols = GALLERY_IDOLS.filter(i => 
    i.deity.toLowerCase().includes(searchQuery?.toLowerCase() || '') || 
    i.cat.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    i.metal.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );
  
  const initialIdx = initialId ? filteredIdols.findIndex(i => i.id === initialId) : 0;
  const [activeIdx, setActiveIdx] = useState(initialIdx >= 0 ? initialIdx : 0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (immersiveMode && containerRef.current && activeIdx >= 0) {
      containerRef.current.scrollTop = activeIdx * window.innerHeight;
    }
  }, [immersiveMode, activeIdx]);

  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [doubleTapGlow, setDoubleTapGlow] = useState(false);
  const [saveAnimMsg, setSaveAnimMsg] = useState(false);

  const { isLoggedIn, setShowAuthModal, setAuthAction } = useAppCtx();

  const handleScroll = (e) => {
    const container = e.target;
    const itemHeight = window.innerHeight;
    const index = Math.round(container.scrollTop / itemHeight);
    if (index !== activeIdx && index >= 0 && index < filteredIdols.length) {
      setActiveIdx(index);
      setShowComments(false); 
      setShowDetailPanel(false);
      setShowShareMenu(false);
    }
  };

  const handleInteraction = (actionType) => {
    if (!isLoggedIn) {
      setAuthAction(actionType);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const toggleLike = (id) => {
    if (handleInteraction('like')) {
      setLiked(p => ({...p, [id]: !p[id]}));
    }
  };

  const toggleSave = (id) => {
    if (handleInteraction('save')) {
      const isSaved = !saved[id];
      setSaved(p => ({...p, [id]: isSaved}));
      if (isSaved) {
        setSaveAnimMsg(true);
        setTimeout(() => setSaveAnimMsg(false), 2000);
      }
    }
  };

  const postComment = (id) => {
    if (!handleInteraction('comment')) return;
    if (!commentInput.trim()) return;
    setComments(p => ({
      ...p,
      [id]: [...(p[id]||[]), { text: commentInput.trim(), user: 'Guest User', time: 'Just now' }]
    }));
    setCommentInput('');
  };

  const handleDoubleTap = (id) => {
    if (handleInteraction('like')) {
      if (!liked[id]) setLiked(p => ({...p, [id]: true}));
      setDoubleTapGlow(true);
      setTimeout(() => setDoubleTapGlow(false), 800);
    }
  };

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
    <div style={{ position: 'fixed', inset: 0, background: '#050402', overflow: 'hidden', color: '#fff', zIndex: 2000 }}>
      {/* Floating Search UI */}
      <motion.div 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        style={{ position: 'absolute', top: 24, left: 20, right: 20, zIndex: 50, display: 'flex', justifyContent: 'center' }}
      >
        <div style={{ 
          background: 'rgba(20, 18, 16, 0.45)', backdropFilter: 'blur(24px)', 
          border: '1px solid rgba(255,215,0,0.15)', borderRadius: 30,
          display: 'flex', alignItems: 'center', padding: '10px 20px', width: isSearchOpen ? '100%' : 'auto',
          maxWidth: 480, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>
          <span style={{ fontSize: 18, marginRight: 10, cursor: 'pointer', opacity: 0.8 }} onClick={() => setIsSearchOpen(true)}>🔍</span>
          {isSearchOpen && (
            <motion.input 
              initial={{ width: 0, opacity: 0 }} animate={{ width: '100%', opacity: 1 }}
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search deity, metal, category..."
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontFamily: "'Jost', sans-serif", fontSize: 14, letterSpacing: '0.05em' }}
              onBlur={() => !searchQuery && setIsSearchOpen(false)}
            />
          )}
        </div>
      </motion.div>

      {!immersiveMode ? (
        /* PART 1: PREMIUM MASONRY GALLERY */
        <div style={{ height: '100vh', width: '100vw', overflowY: 'auto', padding: '100px 24px 120px 24px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', columns: '3 300px', columnGap: 24 }}>
            {filteredIdols.map((idol, i) => (
              <motion.div 
                key={idol.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: (i % 6) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { setActiveIdx(filteredIdols.indexOf(idol)); setImmersiveMode(true); }}
                style={{ 
                  breakInside: 'avoid', marginBottom: 24, position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)'
                }}
                className="masonry-item-hover"
              >
                <motion.img 
                  src={idol.img} alt={idol.deity} 
                  style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, pointerEvents: 'none' }}>
                  <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, margin: '0 0 4px 0', color: '#FFD700' }}>{idol.deity}</h3>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, margin: 0, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{idol.metal} • {idol.cat}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredIdols.length === 0 && (
            <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'Jost', sans-serif", fontSize: 16 }}>
              No masterpieces found matching "{searchQuery}"
            </div>
          )}
        </div>
      ) : (
        /* PART 2: IMMERSIVE FULLSCREEN VIEWER */
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          style={{ height: '100vh', width: '100vw', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {/* Back button to Masonry */}
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setImmersiveMode(false)}
            style={{ position: 'fixed', top: 32, left: 24, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '50%', width: 44, height: 44, color: '#FFD700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </motion.button>

          {filteredIdols.map((idol, idx) => (
            <div key={idol.id} onDoubleClick={() => handleDoubleTap(idol.id)} style={{ height: '100vh', width: '100vw', scrollSnapAlign: 'start', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Background Blurred Depth Image */}
              <img src={idol.img} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(50px) brightness(0.25)', transform: 'scale(1.2)' }} alt="" />
              
              {/* Main Cinema Image Constrained */}
              <motion.img 
                src={idol.img} alt={idol.deity} 
                initial={{ scale: 1.05 }}
                animate={{ scale: idx === activeIdx ? 1 : 1.05 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', zIndex: 1, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))', borderRadius: 8 }} 
              />
              
              {/* Double Tap Animation Overlay */}
              <AnimatePresence>
                {doubleTapGlow && idx === activeIdx && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ position: 'absolute', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}
                  >
                    <IconHeart filled={true} />
                    <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)', filter: 'blur(10px)' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved Animation Overlay */}
              <AnimatePresence>
                {saveAnimMsg && idx === activeIdx && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} style={{ position: 'absolute', top: '20%', background: 'rgba(255,215,0,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,215,0,0.5)', color: '#FFD700', padding: '12px 24px', borderRadius: 30, zIndex: 50, fontFamily: "'Jost', sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconBookmark filled={true}/> Saved to Collection
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cinematic Gradients */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />
              
              {/* PART 3: LEFT SIDE DESCRIPTION PANEL */}
              <div style={{ position: 'absolute', bottom: 100, left: 24, maxWidth: 'calc(100% - 90px)', zIndex: 3 }}>
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} 
                  animate={{ opacity: idx === activeIdx ? 1 : 0, x: idx === activeIdx ? 0 : -30 }} 
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <span style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.25)', padding: '5px 10px', borderRadius: 6, fontSize: 9, textTransform: 'uppercase', color: '#FFD700', letterSpacing: '0.15em', fontWeight: 600, backdropFilter: 'blur(8px)' }}>{idol.cat}</span>
                    <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: 6, fontSize: 9, textTransform: 'uppercase', color: '#FFF', letterSpacing: '0.15em', fontWeight: 600, backdropFilter: 'blur(8px)' }}>{idol.metal}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(28px, 6vw, 42px)', margin: '0 0 8px 0', color: '#FFD700', textShadow: '0 4px 12px rgba(0,0,0,0.9)', fontWeight: 600, lineHeight: 1.1 }}>{idol.deity}</h2>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: 'rgba(255,255,255,0.85)', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.9)', fontStyle: 'italic', maxWidth: 400 }}>
                    Sacred craftsmanship from our Sowcarpet workshop. 
                  </p>
                  
                  <button onClick={() => setShowDetailPanel(true)} style={{ background: 'none', border: 'none', color: '#FFD700', fontFamily: "'Jost', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0, marginTop: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.8 }}>
                    View More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </motion.div>
              </div>

              {/* PART 4: RIGHT SIDE ACTIONS (INSTAGRAM STYLE) */}
              <div style={{ position: 'absolute', bottom: 100, right: 16, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', zIndex: 3 }}>
                {[
                  { id: 'like', icon: <IconHeart filled={liked[idol.id]}/>, count: liked[idol.id] ? '1.2k' : '1.1k', action: () => toggleLike(idol.id), active: liked[idol.id] },
                  { id: 'comment', icon: <IconComment/>, count: (comments[idol.id] || []).length || '0', action: () => setShowComments(true), active: false },
                  { id: 'save', icon: <IconBookmark filled={saved[idol.id]}/>, count: 'Save', action: () => toggleSave(idol.id), active: saved[idol.id] },
                  { id: 'share', icon: <IconShare/>, count: 'Share', action: () => setShowShareMenu(true), active: false }
                ].map((btn, i) => (
                  <motion.div key={btn.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: idx === activeIdx ? 1 : 0, x: idx === activeIdx ? 0 : 30 }} transition={{ duration: 0.6, delay: 0.3 + i*0.1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <motion.button 
                      whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.5))' }} whileTap={{ scale: 0.9 }}
                      onClick={btn.action}
                      style={{ background: 'none', border: 'none', color: btn.active ? '#FFD700' : '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'color 0.3s', padding: 0 }}
                    >
                      {btn.icon}
                    </motion.button>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.8)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{btn.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXTENDED DETAIL PANEL */}
      <AnimatePresence>
        {showDetailPanel && activeItem && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,6,0.95)', backdropFilter: 'blur(24px)', zIndex: 150, padding: '60px 40px', overflowY: 'auto' }}>
            <button onClick={() => setShowDetailPanel(false)} style={{ position: 'absolute', top: 32, right: 32, background: 'none', border: 'none', color: '#FFF', fontSize: 32, cursor: 'pointer' }}>×</button>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 42, color: '#FFD700', marginBottom: 16 }}>{activeItem.deity}</h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', maxWidth: 600, marginBottom: 40, lineHeight: 1.6 }}>An exquisite masterpiece crafted following strict Agamic guidelines, bringing divine presence through sacred geometry.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, maxWidth: 800 }}>
              {[
                { l: 'Material', v: activeItem.metal },
                { l: 'Category', v: activeItem.cat },
                { l: 'Crafting Duration', v: '45 - 60 Days' },
                { l: 'Origin', v: 'Sowcarpet Workshop' },
                { l: 'Technique', v: 'Traditional Nagas / Lost Wax' },
                { l: 'Purity', v: 'Certified' }
              ].map(d => (
                <div key={d.l} style={{ borderBottom: '1px solid rgba(255,215,0,0.2)', paddingBottom: 16 }}>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>{d.l}</div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 16, color: '#FFF' }}>{d.v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 60, maxWidth: 800 }}>
              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>Artisan Notes</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>Every detail from the intricate Kireedam (crown) to the Padmam (lotus base) is painstakingly hand-chiselled. Our artisans chant sacred mantras during the casting process, ensuring not just visual beauty, but spiritual authenticity.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURY SHARE MENU */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShareMenu(false)}>
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} onClick={e => e.stopPropagation()} style={{ background: 'rgba(20,18,16,0.95)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 24, padding: 40, display: 'flex', gap: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
              {['Copy Link', 'WhatsApp', 'Instagram', 'Pinterest'].map((platform, i) => (
                <motion.button key={platform} whileHover={{ y: -5, color: '#FFD700', borderColor: '#FFD700' }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#FFF', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ fontSize: 24 }}>{platform[0]}</div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUXURY COMMENT DRAWER */}
      <AnimatePresence>
        {showComments && activeItem && (
          <motion.div initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65vh', background: 'rgba(15, 12, 10, 0.85)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,215,0,0.15)', borderRadius: '32px 32px 0 0', zIndex: 150, display: 'flex', flexDirection: 'column', boxShadow: '0 -24px 80px rgba(0,0,0,0.8)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><IconComment/><h3 style={{ margin: 0, fontSize: 14, fontFamily: "'Jost', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FFD700' }}>Admirations</h3></div>
              <button onClick={() => setShowComments(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 28, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              {(comments[activeItem.id] || []).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 60, fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: 'italic' }}>A silent admiration.<br/>Be the first to share your thoughts.</div>
              ) : (
                (comments[activeItem.id] || []).map((c, i) => (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }} key={i} style={{ marginBottom: 24, display: 'flex', gap: 16, background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontFamily: "'Cinzel', serif", fontSize: 18, flexShrink: 0 }}>{c.user[0]}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFF', fontFamily: "'Jost', sans-serif", letterSpacing: '0.05em' }}>{c.user}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Jost', sans-serif" }}>{c.time}</div>
                      </div>
                      <div style={{ fontSize: 16, fontFamily: "'Cormorant Garamond', serif", color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontStyle: 'italic' }}>"{c.text}"</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div style={{ padding: '24px 32px', background: 'rgba(0,0,0,0.5)', display: 'flex', gap: 16, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
              <input value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && postComment(activeItem.id)} placeholder="Share your admiration..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 30, padding: '16px 24px', color: '#fff', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: 14, transition: 'border-color 0.3s' }} onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,215,0,0.2)'} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => postComment(activeItem.id)} style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 30, padding: '0 32px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>Post</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to top, rgba(5,4,2,0.98) 0%, rgba(10,8,6,0.8) 100%)', backdropFilter: 'blur(30px)', borderTop: '1px solid rgba(255,215,0,0.1)', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {[
          { l: 'Home', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>, a: () => navigate('/') },
          { l: 'Search', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>, a: () => setIsSearchOpen(true) },
          { l: 'Saved', icon: <IconBookmark filled={false}/>, a: () => { /* open saved */ setShowProfile(true); } },
          { l: 'Profile', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>, a: () => setShowProfile(true) },
        ].map((btn, i) => (
          <React.Fragment key={btn.l}>
            {i === 2 && (
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => window.open(`https://wa.me/919382877351?text=${encodeURIComponent(`Namaskaram, I am interested in commissioning ${activeItem ? activeItem.deity : 'an artwork'}. Please share details.`)}`)}
                style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.9) 0%, rgba(200,150,0,1) 100%)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 40, height: 50, padding: '0 24px', color: '#000', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontFamily: "'Jost', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 8px 24px rgba(255,215,0,0.3)', transform: 'translateY(-15px)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Enquire</span>
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.9 }} onClick={btn.a} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: 0.6, transition: 'all 0.3s' }} onMouseEnter={e=>{e.currentTarget.style.opacity=1; e.currentTarget.style.color='#FFD700';}} onMouseLeave={e=>{e.currentTarget.style.opacity=0.6; e.currentTarget.style.color='#fff';}}>
              {btn.icon}
            </motion.button>
          </React.Fragment>
        ))}
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} C={C} />}
      </AnimatePresence>
    </div>
  );
};
