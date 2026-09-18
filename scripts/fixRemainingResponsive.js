const fs = require('fs');

/* ── Footer.jsx ─────────────────────────────────────────────── */
{
  const path = 'src/components/footer/Footer.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Wrap inside vmw-container
  src = src.replace(
    `<div style={{maxWidth:960,margin:'0 auto'}}>`,
    `<div className="vmw-container" style={{paddingTop:'clamp(40px,6vw,80px)',paddingBottom:'clamp(30px,5vw,60px)'}}>`
  );

  // Footer buttons — remove inline gridTemplateColumns & maxWidth override
  src = src.replace(
    `style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:40,maxWidth:720,margin:'0 auto 40px'}}`,
    `style={{display:'grid',gap:6,marginBottom:40,maxWidth:720,marginLeft:'auto',marginRight:'auto'}}`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ Footer.jsx fixed');
}

/* ── CommissionModal.jsx ─────────────────────────────────────── */
{
  const path = 'src/components/commission/CommissionModal.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Modal body padding and maxHeight responsive
  src = src.replace(
    `<div style={{ padding: '28px', maxHeight: '72vh', overflowY: 'auto' }}>`,
    `<div style={{ padding: 'clamp(16px, 3.5vw, 28px)', maxHeight: 'min(75vh, calc(100dvh - 140px))', overflowY: 'auto' }}>`
  );

  // Step 6 phone / whatsapp grid collapse on narrow mobile
  src = src.replace(
    `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>`,
    `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ CommissionModal.jsx fixed');
}

/* ── Gallery.jsx ─────────────────────────────────────────────── */
{
  const path = 'src/components/gallery/Gallery.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Section padding
  src = src.replace(
    `paddingTop:'140px',paddingBottom:'60px'`,
    `paddingTop:'clamp(80px, 10vw, 140px)',paddingBottom:'clamp(40px, 6vw, 60px)'`
  );

  // Content container padding
  src = src.replace(
    `<div style={{maxWidth:1240,margin:'0 auto',position:'relative',zIndex:1,padding:'0 56px'}}>`,
    `<div className="vmw-container" style={{position:'relative',zIndex:1}}>`
  );

  // Dock wrapper overflow handling
  src = src.replace(
    `<div style={{display:'flex',justifyContent:'center',marginBottom:32}}>`,
    `<div style={{display:'flex',justifyContent:'center',marginBottom:32,maxWidth:'100%',overflowX:'auto',WebkitOverflowScrolling:'touch',scrollbarWidth:'none',padding:'4px 0'}}>`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ Gallery.jsx fixed');
}

console.log('Batch 2 completed.');
