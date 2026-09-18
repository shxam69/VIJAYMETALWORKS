import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';

const CRAFT_PANELS = [
  {
    id: 'gold-work',
    title: 'Temple Gold Work',
    subtitle: '24K Nagas & Sacred Repoussé',
    metal: '24K Gold',
    img: '/gallery/gold/crown.jpg',
    description: 'Ancestral Nagas repoussé and fine chiselling in pure 24K gold foil and European electro-plating.',
  },
  {
    id: 'panchaloha',
    title: 'Sacred Vigrahams',
    subtitle: 'Lost-Wax Panchaloha Cast',
    metal: '5-Metal Alloy',
    img: '/gallery/temple/god.jpg',
    description: 'Consecrated divine idols formulated according to Shilpa Shastras from sacred Gold, Silver, Copper, Brass & Iron.',
  },
  {
    id: 'kireedam',
    title: 'Kireedam & Crowns',
    subtitle: 'Royal Deity Headgear',
    metal: 'Gold & Gem Setting',
    img: '/gallery/gold/crown1.jpg',
    description: 'Architectural makuta headgear and deity crowns featuring traditional floral bands and lotus finials.',
  },
  {
    id: 'kavacha',
    title: 'Kavacha & Armor',
    subtitle: 'Embossed Body Coverings',
    metal: 'Gold & Sterling Silver',
    img: '/gallery/gold/sadarigold.jpg',
    description: 'Full body deity armor hand-hammered to exact sanctum dimensions for enduring protection and worship.',
  },
  {
    id: 'silver-work',
    title: 'Silver Nagas Pooja',
    subtitle: '92.5 Sterling Vessels',
    metal: 'Sterling Silver',
    img: '/gallery/silver/kandabaranam.jpg',
    description: 'Chased and antique-finished Britannia silver sanctum articles, lamps, kalasams, and prabhavali arches.',
  },
  {
    id: 'custom-commissions',
    title: 'Custom Commissions',
    subtitle: 'Bespoke Architectural Shrines',
    metal: 'Copper, Brass & Gold Plated',
    img: '/gallery/stone/stone2.jpg',
    description: 'Bespoke sanctum renovations, Vimana towers, and temple procession regalia tailored for worldwide temples.',
  },
];

const AccordionGallery = ({
  items = CRAFT_PANELS,
  defaultIndex = 0,
  grow = 3.5,
  trigger = 'hover',
  duration = 0.65,
  ease = 'power3.out',
  tilt = 4,
  height = 520,
  onSelectCategory,
}) => {
  const C = useTheme();
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const containerRef = useRef(null);
  const panelsRef = useRef([]);
  const isFirstRender = useRef(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Hover entry handler — HOVER-FIRST ACTIVATION
  const handleEnter = (index) => {
    if (trigger === 'hover' && !isMobile) {
      setActiveIndex(index);
    }
  };

  // Click handler
  const handleClick = (index, e) => {
    if (index !== activeIndex) {
      if (e) e.preventDefault();
      setActiveIndex(index);
    }
  };

  // Pure GSAP Animation Engine:
  // React does NOT set dynamic inline styles on flexGrow / transform / filter during re-renders.
  // This guarantees GSAP smoothly interpolates from the current visual state with ZERO snapping,
  // making Left -> Right and Right -> Left transitions identical in quality.
  useEffect(() => {
    if (isMobile) return;

    panelsRef.current.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === activeIndex;
      const img = panel.querySelector('.accordion-panel-img');
      const overlay = panel.querySelector('.accordion-panel-overlay');
      const goldBar = panel.querySelector('.accordion-panel-goldbar');
      const spine = panel.querySelector('.accordion-panel-spine');
      const details = panel.querySelector('.accordion-panel-details');

      const rot = prefersReducedMotion ? 0 : isActive ? 0 : i < activeIndex ? tilt : -tilt;
      const flexTarget = isActive ? grow : 1;

      // On initial page mount, set targets immediately without duration
      if (isFirstRender.current || prefersReducedMotion) {
        gsap.set(panel, { flexGrow: flexTarget, rotateY: rot, transformPerspective: 1200 });
        if (img) {
          gsap.set(img, {
            scale: isActive ? 1.045 : 1.0,
            filter: isActive
              ? 'brightness(1) contrast(1) saturate(1)'
              : 'brightness(0.65) contrast(0.96) saturate(0.90)',
          });
        }
        if (overlay) gsap.set(overlay, { opacity: isActive ? 0.88 : 0.55 });
        if (goldBar) gsap.set(goldBar, { opacity: isActive ? 1 : 0 });
        if (spine) gsap.set(spine, { opacity: isActive ? 0 : 1, y: isActive ? 4 : 0 });
        if (details) gsap.set(details, { opacity: isActive ? 1 : 0, y: isActive ? 0 : 8 });
        return;
      }

      // Smooth bidirectional continuous interpolation from current visual values
      // 1. Panel flexGrow & 3D perspective rotation
      gsap.to(panel, {
        flexGrow: flexTarget,
        rotateY: rot,
        transformPerspective: 1200,
        duration,
        ease,
        overwrite: 'auto',
      });

      // 2. Continuous Image Scale & Color Transition
      if (img) {
        gsap.to(img, {
          scale: isActive ? 1.045 : 1.00,
          filter: isActive
            ? 'brightness(1) contrast(1) saturate(1)'
            : 'brightness(0.65) contrast(0.96) saturate(0.90)',
          duration,
          ease,
          overwrite: 'auto',
        });
      }

      // 3. Vignette overlay transition
      if (overlay) {
        gsap.to(overlay, {
          opacity: isActive ? 0.88 : 0.55,
          duration,
          ease,
          overwrite: 'auto',
        });
      }

      // 4. Gold top accent bar
      if (goldBar) {
        gsap.to(goldBar, {
          opacity: isActive ? 1 : 0,
          duration: duration * 0.7,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      // 5. Vertical spine title
      if (spine) {
        gsap.to(spine, {
          opacity: isActive ? 0 : 1,
          y: isActive ? 4 : 0,
          duration: isActive ? duration * 0.45 : duration * 0.8,
          delay: isActive ? 0 : 0.08,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }

      // 6. Active details content
      if (details) {
        gsap.to(details, {
          opacity: isActive ? 1 : 0,
          y: isActive ? 0 : 8,
          duration: isActive ? duration * 0.85 : duration * 0.35,
          delay: isActive ? 0.08 : 0,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });

    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [activeIndex, isMobile, grow, duration, ease, tilt, prefersReducedMotion]);

  // Subtle interactive 3D micro-tilt on mouse movement within the active panel
  const handleMouseMove = useCallback(
    (e, index) => {
      if (isMobile || prefersReducedMotion || index !== activeIndex) return;

      const panel = panelsRef.current[index];
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = (y / rect.height) * -2;
      const tiltY = (x / rect.width) * 2;

      gsap.to(panel, {
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1200,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [activeIndex, isMobile, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(
    (index) => {
      if (isMobile || prefersReducedMotion) return;
      const panel = panelsRef.current[index];
      if (!panel) return;

      gsap.to(panel, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [isMobile, prefersReducedMotion]
  );

  // Keyboard navigation for accessibility
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % items.length;
      setActiveIndex(next);
      panelsRef.current[next]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + items.length) % items.length;
      setActiveIndex(prev);
      panelsRef.current[prev]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <div style={{ width: '100%', margin: '48px 0 24px' }}>
      {/* Desktop & Tablet: Horizontal GSAP Accordion */}
      {!isMobile ? (
        <div
          ref={containerRef}
          role="region"
          aria-label="Sacred Craft Disciplines Gallery"
          style={{
            display: 'flex',
            height: typeof height === 'number' ? height : 520,
            gap: 8,
            overflow: 'hidden',
            borderRadius: 6,
            background: C.bg2,
            padding: 8,
            border: `1px solid ${C.border}`,
          }}
        >
          {items.map((panel, i) => {
            const isActive = i === activeIndex;

            return (
              <div
                key={panel.id}
                ref={(el) => (panelsRef.current[i] = el)}
                tabIndex={0}
                role="button"
                aria-expanded={isActive}
                aria-label={panel.title}
                onMouseEnter={() => handleEnter(i)}
                onFocus={() => setActiveIndex(i)}
                onClick={(e) => handleClick(i, e)}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => handleMouseLeave(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: '0%',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 4,
                  cursor: 'pointer',
                  outline: 'none',
                  background: C.bg1,
                  border: `1px solid ${isActive ? C.borderGold : C.border}`,
                  transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                  boxShadow: isActive ? '0 8px 32px rgba(0,0,0,0.45)' : 'none',
                  transformStyle: 'preserve-3d',
                  willChange: 'flex-grow, transform',
                }}
              >
                {/* Fixed-Scale Image Canvas (Zero Crop Jump) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    width: 'max(100%, 680px)',
                    height: '100%',
                    transform: 'translateX(-50%)',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src={panel.img}
                    alt={panel.title}
                    className="accordion-panel-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 30%',
                      display: 'block',
                      transformOrigin: 'center center',
                      willChange: 'transform, filter',
                    }}
                  />
                </div>

                {/* Dark Vignette Overlay */}
                <div
                  className="accordion-panel-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(8,6,4,0.94) 0%, rgba(8,6,4,0.42) 50%, rgba(8,6,4,0.18) 100%)',
                    pointerEvents: 'none',
                    willChange: 'opacity',
                  }}
                />

                {/* Gold Top Accent Bar */}
                <div
                  className="accordion-panel-goldbar"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${C.goldLt}, ${C.gold})`,
                    pointerEvents: 'none',
                    willChange: 'opacity',
                  }}
                />

                {/* Vertical Spine Title (Shown when inactive) */}
                <div
                  className="accordion-panel-spine"
                  style={{
                    position: 'absolute',
                    bottom: 28,
                    left: '50%',
                    transform: 'translateX(-50%) rotate(-90deg)',
                    transformOrigin: 'center center',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    willChange: 'opacity, transform',
                  }}
                >
                  <span
                    style={{
                      ...ff.display,
                      fontSize: 13,
                      color: C.dim,
                      letterSpacing: '.22em',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {panel.title}
                  </span>
                </div>

                {/* Expanded Caption & Details (Shown when active) */}
                <div
                  className="accordion-panel-details"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '32px 28px',
                    zIndex: 3,
                    pointerEvents: isActive ? 'auto' : 'none',
                    willChange: 'opacity, transform',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span
                      style={{
                        ...ff.body,
                        fontSize: 8,
                        letterSpacing: '.32em',
                        color: C.goldLt,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        border: `1px solid ${C.borderGold}`,
                        background: 'rgba(212,175,55,0.08)',
                        borderRadius: 2,
                      }}
                    >
                      {panel.metal}
                    </span>
                  </div>

                  <h3
                    style={{
                      ...ff.display,
                      fontSize: 'clamp(20px, 2.2vw, 26px)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      letterSpacing: '.03em',
                      lineHeight: 1.15,
                      marginBottom: 6,
                    }}
                  >
                    {panel.title}
                  </h3>

                  <div
                    style={{
                      ...ff.serif,
                      fontSize: 14,
                      color: C.goldLt,
                      fontStyle: 'italic',
                      marginBottom: 10,
                    }}
                  >
                    {panel.subtitle}
                  </div>

                  <p
                    style={{
                      ...ff.body,
                      fontSize: 12.5,
                      color: 'rgba(247,243,235,0.85)',
                      lineHeight: 1.6,
                      maxWidth: 420,
                      marginBottom: 16,
                    }}
                  >
                    {panel.description}
                  </p>

                  {onSelectCategory && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(panel.title);
                      }}
                      style={{
                        ...ff.body,
                        background: 'none',
                        border: 'none',
                        color: C.goldLt,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '.24em',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      VIEW IN GALLERY →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mobile Presentation: Clean, Touch-Friendly Stacked Editorial Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((panel, i) => {
            const isSelected = activeIndex === i;

            return (
              <div
                key={panel.id}
                onClick={() => setActiveIndex(isSelected ? -1 : i)}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 6,
                  border: `1px solid ${isSelected ? C.gold : C.border}`,
                  background: C.bg2,
                  transition: 'all 0.35s ease',
                }}
              >
                {/* Header Banner with Thumbnail */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 16px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 4,
                      backgroundImage: `url('${panel.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      border: `1px solid ${C.border}`,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        ...ff.display,
                        fontSize: 15,
                        color: C.text,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {panel.title}
                    </div>
                    <div style={{ ...ff.serif, fontSize: 12, color: C.goldLt, fontStyle: 'italic' }}>
                      {panel.subtitle}
                    </div>
                  </div>
                  <span
                    style={{
                      color: C.gold,
                      fontSize: 16,
                      transform: isSelected ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.3s',
                    }}
                  >
                    ›
                  </span>
                </div>

                {/* Expanded Details on Tap */}
                {isSelected && (
                  <div style={{ padding: '0 16px 18px', borderTop: `1px solid ${C.borderHi}`, paddingTop: 14 }}>
                    <p style={{ ...ff.body, fontSize: 12, color: C.dim, lineHeight: 1.6, marginBottom: 12 }}>
                      {panel.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ ...ff.body, fontSize: 9, color: C.goldLt, letterSpacing: '.18em', textTransform: 'uppercase' }}>
                        Metal: {panel.metal}
                      </span>
                      {onSelectCategory && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCategory(panel.title);
                          }}
                          style={{
                            ...ff.body,
                            background: 'none',
                            border: 'none',
                            color: C.gold,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '.15em',
                            cursor: 'pointer',
                          }}
                        >
                          EXPLORE →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccordionGallery;
