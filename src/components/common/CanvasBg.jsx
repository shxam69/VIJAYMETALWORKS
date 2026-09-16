import React, { useRef, useEffect } from 'react';

const CanvasBg = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    // Reduced from 28 to 14 particles for performance
    const particles = Array.from({ length: 14 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx:(Math.random()-.5)*.08, vy:(Math.random()-.5)*.08,
      r: Math.random()*.6+.2, o: Math.random()*.12+.03
    }));
    let raf;
    let frame = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame++;
      // Only redraw every 2 frames (30fps instead of 60fps)
      if (frame % 2 !== 0) return;
      ctx.clearRect(0,0,W,H);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,195,150,${p.o})`; ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      });
    };
    draw();
    const onResize = () => { W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; };
    window.addEventListener('resize',onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); };
  }, []);
  return <canvas ref={ref} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:.15 }}/>;
};

export default CanvasBg;
