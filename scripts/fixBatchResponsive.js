const fs = require('fs');

/* ── RealWorkPhotos.jsx ───────────────────────────────────────── */
{
  const path = 'src/components/services/RealWorkPhotos.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Replace inline maxWidth container with vmw-container
  src = src.replace(
    `<div style={{maxWidth:1240,margin:'0 auto'}}>`,
    `<div className="vmw-container">`
  );

  // Remove inline gridTemplateColumns — let .vmw-work-grid CSS handle it
  src = src.replace(
    `<StaggerContainer stagger={0.12} delay={0.08} style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}} className="vmw-work-grid">`,
    `<StaggerContainer stagger={0.12} delay={0.08} style={{display:'grid',gap:6}} className="vmw-work-grid">`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ RealWorkPhotos.jsx fixed');
}

/* ── ProcessSection.jsx ──────────────────────────────────────── */
{
  const path = 'src/components/process/ProcessSection.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Replace maxWidth:1200 container
  src = src.replace(
    `<div style={{ maxWidth: 1200, margin: '0 auto' }}>`,
    `<div className="vmw-container">`
  );

  // Replace hard-coded gridTemplateColumns per step — use process-step class
  // The alternating isEven/isOdd is implemented via CSS order (already set)
  // So we can collapse to 1-col on mobile by removing the inline cols
  src = src.replace(
    /display: 'grid',\s*gridTemplateColumns: isEven \? '1\.1fr 1fr' : '1fr 1\.1fr',/g,
    `display: 'grid', gridTemplateColumns: 'var(--process-cols, 1.05fr 1fr)',`
  );

  // Replace hard-coded height:280 with aspect-ratio on image column
  src = src.replace(
    `height: 280,
                    borderRadius: 4,`,
    `aspectRatio: '4/3',
                    borderRadius: 4,`
  );

  // Replace hard-coded card padding
  src = src.replace(
    `padding: '36px',`,
    `padding: 'clamp(20px,3vw,36px)',`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ ProcessSection.jsx fixed');
}

/* ── TrustedByTemples.jsx ────────────────────────────────────── */
{
  const path = 'src/components/heritage/TrustedByTemples.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Replace maxWidth container
  src = src.replace(
    `<div style={{maxWidth:1240,margin:'0 auto'}}>`,
    `<div className="vmw-container">`
  );

  // Remove inline gridTemplateColumns — let .vmw-temples-grid CSS handle it
  src = src.replace(
    `<StaggerContainer stagger={0.09} delay={0.1} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}} className="vmw-temples-grid">`,
    `<StaggerContainer stagger={0.09} delay={0.1} style={{display:'grid',gap:2}} className="vmw-temples-grid">`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ TrustedByTemples.jsx fixed');
}

/* ── Archive.jsx ─────────────────────────────────────────────── */
{
  const path = 'src/components/footer/Archive.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Replace maxWidth:1400 container
  src = src.replace(
    `<div style={{maxWidth:1400,margin:'0 auto'}}>`,
    `<div className="vmw-container">`
  );

  // Archive heading — lower clamp floor from 44px to 32px to fit mobile
  src = src.replace(
    `fontSize:'clamp(44px,8.5vw,104px)'`,
    `fontSize:'clamp(32px,8vw,104px)'`
  );

  // Add archive-large class to the large piece for CSS span override at small screens
  src = src.replace(
    `style={{gridColumn:p.large?'span 2':'span 1',gridRow:p.large?'span 2':'span 1',`,
    `className={p.large?'archive-large':''} style={{gridColumn:p.large?'span 2':'span 1',gridRow:p.large?'span 2':'span 1',`
  );

  // Remove inline gridTemplateColumns from archive-grid div — rely on CSS
  src = src.replace(
    `<div className="archive-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gridTemplateRows:'auto',gap:6}}>`,
    `<div className="archive-grid" style={{display:'grid',gap:6}}>`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ Archive.jsx fixed');
}

/* ── Testimonials.jsx ────────────────────────────────────────── */
{
  const path = 'src/components/footer/Testimonials.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Replace maxWidth:1240 container
  src = src.replace(
    `<div style={{maxWidth:1240,margin:'0 auto'}}>`,
    `<div className="vmw-container">`
  );

  // Featured testimonial padding — use CSS class vmw-featured-testimonial
  // Remove inline padding from the featured div
  src = src.replace(
    `style={{border:\`1px solid \${C.border}\`,padding:'52px 56px',background:C.surfaceWarm,position:'relative',backdropFilter:'blur(8px)'}}`,
    `style={{border:\`1px solid \${C.border}\`,background:C.surfaceWarm,position:'relative',backdropFilter:'blur(8px)'}}`
  );

  // Add vmw-featured-testimonial class to include the padding from CSS
  src = src.replace(
    `<div className="vmw-featured-testimonial" style={{border:`,
    `<div className="vmw-featured-testimonial" style={{border:`
  );
  // The class is already there from the original — just need to confirm padding removed
  // (class adds padding via CSS .vmw-featured-testimonial rule in globalStyles)

  // Featured quote font — clamp
  src = src.replace(
    `fontSize:21,lineHeight:1.88`,
    `fontSize:'clamp(15px,2vw,21px)',lineHeight:1.88`
  );

  // Remove inline gridTemplateColumns — let CSS handle vmw-testimonials-grid
  src = src.replace(
    `style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:36}} className="vmw-testimonials-grid"`,
    `style={{display:'grid',gap:6,marginBottom:36}} className="vmw-testimonials-grid"`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ Testimonials.jsx fixed');
}

/* ── GalleryPreview.jsx ─────────────────────────────────────── */
{
  const path = 'src/components/gallery/GalleryPreview.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Replace maxWidth:1240 container
  src = src.replace(
    `<div style={{maxWidth:1240,margin:'0 auto'}}>`,
    `<div className="vmw-container">`
  );

  // Add responsive media queries INSIDE the <style> block
  src = src.replace(
    `.preview-masonry { columns: 3; column-gap: 10px; margin-bottom: 48px; }`,
    `.preview-masonry { columns: 3; column-gap: 10px; margin-bottom: 48px; }
          @media(max-width:900px){ .preview-masonry{ columns:2 !important; } }
          @media(max-width:480px){ .preview-masonry{ columns:1 !important; } }`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ GalleryPreview.jsx fixed');
}

console.log('\nAll batch fixes complete.');
