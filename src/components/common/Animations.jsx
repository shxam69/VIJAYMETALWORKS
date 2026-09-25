import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Luxury easing curves
const EASE_OUT   = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.45, 0, 0.55, 1];

// Base Reveal — fades up, triggers once (smooth on mobile)
const Reveal = ({ children, delay=0, y=24, duration=0.8 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y }}
      animate={inView ? { opacity:1, y:0 } : { opacity:0, y }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Slide from left — triggers once
const SlideLeft = ({ children, delay=0, distance=60, duration=0.9 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, x: -distance }}
      animate={inView ? { opacity:1, x:0 } : { opacity:0, x: -distance }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Slide from right — triggers once
const SlideRight = ({ children, delay=0, distance=60, duration=0.9 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, x: distance }}
      animate={inView ? { opacity:1, x:0 } : { opacity:0, x: distance }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Stagger container helper — triggers once
const StaggerContainer = ({ children, stagger=0.12, delay=0, className='', style={} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref} className={className} style={style}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden:{}, visible:{ transition:{ staggerChildren: stagger, delayChildren: delay } } }}>
      {children}
    </motion.div>
  );
};

// Stagger child — fade + rise
const StaggerItem = ({ children, y=28, duration=0.8, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, y },
      visible: { opacity:1, y:0, transition:{ duration, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);

// Soft zoom in — triggers once
const ZoomIn = ({ children, delay=0, scale=0.88, duration=0.9, style={} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-40px' });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity:0, scale }}
      animate={inView ? { opacity:1, scale:1 } : { opacity:0, scale }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Fade in — triggers once
const FadeIn = ({ children, delay=0, duration=0.9, style={}, className='' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-30px' });
  return (
    <motion.div ref={ref} style={style} className={className}
      initial={{ opacity:0 }}
      animate={inView ? { opacity:1 } : { opacity:0 }}
      transition={{ duration, delay, ease: EASE_IN_OUT }}>
      {children}
    </motion.div>
  );
};

// Slide from bottom (used for cards, CTAs)
const SlideUp = ({ children, delay=0, distance=40, duration=0.85, style={} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-50px' });
  return (
    <motion.div ref={ref} style={style}
      initial={{ opacity:0, y: distance }}
      animate={inView ? { opacity:1, y:0 } : { opacity:0, y: distance }}
      transition={{ duration, delay, ease: EASE_OUT }}>
      {children}
    </motion.div>
  );
};

// Stagger child variants — extended with directional support
const StaggerItemLeft = ({ children, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, x:-36 },
      visible: { opacity:1, x:0, transition:{ duration:0.8, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);

const StaggerItemRight = ({ children, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, x:36 },
      visible: { opacity:1, x:0, transition:{ duration:0.8, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);

// Scale-up stagger child (for featured/hero cards)
const StaggerItemScale = ({ children, style={}, className='' }) => (
  <motion.div className={className} style={style}
    variants={{
      hidden:  { opacity:0, scale:0.88 },
      visible: { opacity:1, scale:1, transition:{ duration:0.75, ease: EASE_OUT } }
    }}>
    {children}
  </motion.div>
);


export {
  EASE_OUT,
  EASE_IN_OUT,
  Reveal,
  SlideLeft,
  SlideRight,
  SlideUp,
  ZoomIn,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  StaggerItemLeft,
  StaggerItemRight,
  StaggerItemScale,
};
