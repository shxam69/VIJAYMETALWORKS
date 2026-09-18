const fs = require('fs');

/* ── 1. ImmersiveFeed.jsx ─────────────────────────────────────── */
{
  const path = 'src/components/gallery/ImmersiveFeed.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Outer container: background & color
  src = src.replace(
    `background: '#050402',
      // NO overflow:hidden — this traps scroll inside child containers
      color: '#fff',`,
    `background: C.bg1,
      // NO overflow:hidden — this traps scroll inside child containers
      color: C.text,`
  );

  // Search bar background gradient
  src = src.replace(
    `background: 'linear-gradient(to bottom, rgba(5,4,2,0.97) 60%, transparent 100%)',`,
    `background: \`linear-gradient(to bottom, \${C.bg1}f5 60%, transparent 100%)\`,`
  );

  // Search input & bar
  src = src.replace(
    `background: isSearchOpen ? 'rgba(22,18,14,0.96)' : 'rgba(22,18,14,0.7)',`,
    `background: isSearchOpen ? (C.isDark ? 'rgba(22,18,14,0.96)' : 'rgba(255,255,255,0.95)') : (C.isDark ? 'rgba(22,18,14,0.7)' : 'rgba(255,255,255,0.8)'),`
  );
  src = src.replace(
    `style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', flex: 1, fontFamily: "'Jost', sans-serif", fontSize: 14, letterSpacing: '0.04em', minWidth: 0 }}`,
    `style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', flex: 1, fontFamily: "'Jost', sans-serif", fontSize: 14, letterSpacing: '0.04em', minWidth: 0 }}`
  );

  // Masonry Card styling:
  src = src.replace(
    `background: rgba(14,11,8,0.8);`,
    `background: C.isDark ? 'rgba(14,11,8,0.8)' : 'rgba(255,255,255,0.8)';`
  );

  // Detail panel background:
  src = src.replace(
    `background: 'linear-gradient(180deg, rgba(22,18,14,0.98) 0%, rgba(12,9,6,1) 100%)',`,
    `background: C.isDark ? 'linear-gradient(180deg, rgba(22,18,14,0.98) 0%, rgba(12,9,6,1) 100%)' : 'linear-gradient(180deg, rgba(250,245,236,0.99) 0%, rgba(240,232,220,1) 100%)',`
  );
  src = src.replace(
    `boxShadow: '0 -24px 80px rgba(0,0,0,0.8)',`,
    `boxShadow: C.isDark ? '0 -24px 80px rgba(0,0,0,0.8)' : '0 -24px 80px rgba(100,70,20,0.2)',`
  );
  src = src.replace(
    `<div style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: '#FFF' }}>{d.v || '—'}</div>`,
    `<div style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: C.text }}>{d.v || '—'}</div>`
  );
  src = src.replace(
    `<p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{activeItem.artisanNotes}</p>`,
    `<p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: C.dim, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{activeItem.artisanNotes}</p>`
  );

  // Share menu card:
  src = src.replace(
    `style={{ width: '100%', maxWidth: 480, background: 'rgba(18,14,10,0.99)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '24px 24px 0 0', padding: '24px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', boxShadow: '0 -12px 48px rgba(0,0,0,0.8)' }}`,
    `style={{ width: '100%', maxWidth: 480, background: C.isDark ? 'rgba(18,14,10,0.99)' : 'rgba(250,245,236,0.99)', border: \`1px solid \${C.borderGold}\`, borderRadius: '24px 24px 0 0', padding: '24px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', boxShadow: C.shadow }}`
  );
  src = src.replace(
    `style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#FFF', touchAction: 'manipulation' }}`,
    `style={{ background: C.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: \`1px solid \${C.border}\`, borderRadius: 12, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', color: C.text, touchAction: 'manipulation' }}`
  );

  // Comments drawer:
  src = src.replace(
    `style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65vh', background: 'rgba(15, 12, 10, 0.85)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,215,0,0.15)', borderRadius: '32px 32px 0 0', zIndex: 150, display: 'flex', flexDirection: 'column', boxShadow: '0 -24px 80px rgba(0,0,0,0.8)' }}`,
    `style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65vh', background: C.isDark ? 'rgba(15, 12, 10, 0.95)' : 'rgba(248, 243, 235, 0.98)', backdropFilter: 'blur(40px)', borderTop: \`1px solid \${C.borderGold}\`, borderRadius: '32px 32px 0 0', zIndex: 150, display: 'flex', flexDirection: 'column', boxShadow: C.shadow }}`
  );
  src = src.replace(
    `style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}`,
    `style={{ padding: '24px 32px', borderBottom: \`1px solid \${C.border}\`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}`
  );
  src = src.replace(
    `style={{ marginBottom: 18, display: 'flex', gap: 12, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}`,
    `style={{ marginBottom: 18, display: 'flex', gap: 12, background: C.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)', padding: 14, borderRadius: 12, border: \`1px solid \${C.border}\` }}`
  );
  src = src.replace(
    `<div style={{ fontSize: 13, fontWeight: 600, color: '#FFF', fontFamily: "'Jost', sans-serif" }}>{c.user}</div>`,
    `<div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "'Jost', sans-serif" }}>{c.user}</div>`
  );
  src = src.replace(
    `<div style={{ fontSize: 14, fontFamily: "'Cormorant Garamond', serif", color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, fontStyle: 'italic' }}>{c.text || c.content}</div>`,
    `<div style={{ fontSize: 14, fontFamily: "'Cormorant Garamond', serif", color: C.dim, lineHeight: 1.5, fontStyle: 'italic' }}>{c.text || c.content}</div>`
  );
  src = src.replace(
    `style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.6)', display: 'flex', gap: 10, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}`,
    `style={{ padding: '12px 16px', background: C.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(235,228,215,0.9)', display: 'flex', gap: 10, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}`
  );
  src = src.replace(
    `style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 24, padding: '12px 16px', color: '#fff', outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: 14 }}`,
    `style={{ flex: 1, background: C.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)', border: \`1px solid \${C.borderGold}\`, borderRadius: 24, padding: '12px 16px', color: C.text, outline: 'none', fontFamily: "'Jost', sans-serif", fontSize: 14 }}`
  );

  // Bottom Navigation:
  src = src.replace(
    `background: 'linear-gradient(to top, rgba(4,3,2,0.99) 0%, rgba(8,6,4,0.92) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,215,0,0.1)',`,
    `background: C.isDark ? 'linear-gradient(to top, rgba(4,3,2,0.99) 0%, rgba(8,6,4,0.92) 100%)' : 'linear-gradient(to top, rgba(245,240,232,0.99) 0%, rgba(238,230,218,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: \`1px solid \${C.border}\`,`
  );
  src = src.replace(
    `color: 'rgba(255,255,255,0.55)',`,
    `color: C.dim,`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ ImmersiveFeed.jsx theme updated');
}

/* ── 2. AuthModal.jsx ─────────────────────────────────────────── */
{
  const path = 'src/components/auth/AuthModal.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Import and use useTheme
  if (!src.includes('useTheme')) {
    src = src.replace(
      `import { useAppCtx } from '../../hooks/useApp';`,
      `import { useAppCtx } from '../../hooks/useApp';\nimport { useTheme } from '../../hooks/useTheme';`
    );
    src = src.replace(
      `const AuthModal = ({ onClose, action }) => {`,
      `const AuthModal = ({ onClose, action }) => {\n  const C = useTheme();`
    );
  }

  // Backdrop & container
  src = src.replace(
    `background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(30px)',`,
    `background: C.isDark ? 'rgba(0,0,0,0.92)' : 'rgba(100,70,20,0.3)', backdropFilter: 'blur(30px)',`
  );
  src = src.replace(
    `style={{ width: 'min(400px, 100vw)', border: '1px solid rgba(255,215,0,0.2)', background: 'linear-gradient(180deg, rgba(20,16,10,0.98) 0%, rgba(10,8,6,0.98) 100%)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}`,
    `style={{ width: 'min(400px, 100vw)', border: \`1px solid \${C.borderGold}\`, background: C.isDark ? 'linear-gradient(180deg, rgba(20,16,10,0.98) 0%, rgba(10,8,6,0.98) 100%)' : 'linear-gradient(180deg, rgba(252,247,240,0.99) 0%, rgba(242,235,222,0.99) 100%)', borderRadius: 24, overflow: 'hidden', boxShadow: C.shadow }}`
  );

  // Close button
  src = src.replace(
    `background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)',`,
    `background: C.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: 'none', color: C.dim,`
  );

  // Subtitle
  src = src.replace(
    `style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}`,
    `style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, color: C.dim, margin: 0, lineHeight: 1.5 }}`
  );

  // Inputs
  src = src.replace(
    /background: 'rgba\(255,255,255,0\.05\)', border: '1px solid rgba\(255,255,255,0\.1\)', borderRadius: 12, color: '#fff'/g,
    `background: C.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)', border: \`1px solid \${C.border}\`, borderRadius: 12, color: C.text`
  );

  // Switch link & divider
  src = src.replace(
    `color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}`,
    `color: C.dim, cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}`
  );
  src = src.replace(
    `<div style={{ flex: 1, height: 1, background: '#FFF' }}></div>`,
    `<div style={{ flex: 1, height: 1, background: C.border }}></div>`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ AuthModal.jsx theme updated');
}

/* ── 3. Loader.jsx ────────────────────────────────────────────── */
{
  const path = 'src/components/common/Loader.jsx';
  let src = fs.readFileSync(path, 'utf8');

  // Import and use useTheme
  if (!src.includes('useTheme')) {
    src = src.replace(
      `import React, { useState, useEffect } from 'react';`,
      `import React, { useState, useEffect } from 'react';\nimport { useTheme } from '../../hooks/useTheme';`
    );
    src = src.replace(
      `const Loader = ({ onDone }) => {`,
      `const Loader = ({ onDone }) => {\n  const C = useTheme();`
    );
  }

  // Loader background
  src = src.replace(
    `background:'#050402',`,
    `background:C.loaderBg,`
  );

  fs.writeFileSync(path, src, 'utf8');
  console.log('✓ Loader.jsx theme updated');
}

console.log('Theme batch update complete.');
