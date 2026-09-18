const fs = require('fs');

// Read current Nav.jsx
const src = fs.readFileSync('src/components/navigation/Nav.jsx', 'utf8');

// The nav pill hamburger button currently toggles cardOpen (desktop dropdown).
// On mobile the pill is display:none, so this button is never accessible.
// We need the hamburger to also toggle menuOpen (the fullscreen mobile overlay).
// Fix: change onClick to toggle both states based on isMobile, or simply toggle menuOpen on mobile.
// Cleanest fix: make the hamburger button toggle menuOpen when isMobile, and cardOpen otherwise.

const fixed = src.replace(
  `onClick={() => setCardOpen(o => !o)}`,
  `onClick={() => { if (isMobile) { setMenuOpen(o => !o); } else { setCardOpen(o => !o); } }}`
).replace(
  `aria-label={cardOpen ? 'Close menu' : 'Open menu'}`,
  `aria-label={isMobile ? (menuOpen ? 'Close menu' : 'Open menu') : (cardOpen ? 'Close menu' : 'Open menu')}`
);

fs.writeFileSync('src/components/navigation/Nav.jsx', fixed, 'utf8');
console.log('Nav.jsx hamburger wired to mobile menu overlay');
