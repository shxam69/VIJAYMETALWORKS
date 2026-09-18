const fs = require('fs');

/* ── AdminDashboard.jsx ───────────────────────────────────────── */
{
  const path = 'src/components/admin/AdminDashboard.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Table header background
  src = src.replace(
    `<tr style={{ background: 'rgba(0,0,0,0.2)' }}>`,
    `<tr style={{ background: C.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(100,70,20,0.05)' }}>`
  );

  // Status select options background
  src = src.replace(
    /style=\{\{background:'#000',color:'#fff'\}\}/g,
    `style={{background: C.bg2, color: C.text}}`
  );

  // Sidebar link active style
  src = src.replace(
    `background: activeTab === tab ? 'rgba(255,215,0,0.1)' : 'transparent',`,
    `background: activeTab === tab ? (C.isDark ? 'rgba(255,215,0,0.1)' : 'rgba(184,134,11,0.12)') : 'transparent',`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ AdminDashboard.jsx updated');
}

/* ── AdminGalleryManager.jsx ──────────────────────────────────── */
{
  const path = 'src/components/admin/AdminGalleryManager.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Metal options select styling
  src = src.replace(
    `{METAL_OPTIONS.map(m=><option key={m} value={m} style={{background:'#111'}}>{m}</option>)}`,
    `{METAL_OPTIONS.map(m=><option key={m} value={m} style={{background: C.bg2, color: C.text}}>{m}</option>)}`
  );

  // Form inputs background
  src = src.replace(
    /background:'rgba\(255,255,255,0\.06\)'/g,
    `background: C.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)'`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ AdminGalleryManager.jsx updated');
}

/* ── AdminLogin.jsx ───────────────────────────────────────────── */
{
  const path = 'src/components/admin/AdminLogin.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Input background
  src = src.replace(
    /background: 'rgba\(255,255,255,0\.05\)'/g,
    `background: C.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ AdminLogin.jsx updated');
}

console.log('Admin updates complete.');
