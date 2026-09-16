const fs = require('fs');

// 1. ImmersiveFeed.jsx
let imm = fs.readFileSync('src/components/gallery/ImmersiveFeed.jsx', 'utf8');
imm = imm.replace('  const [detailPanelExpanded, setDetailPanelExpanded] = useState(false);\r\n', '')
         .replace('  const [detailPanelExpanded, setDetailPanelExpanded] = useState(false);\n', '');
fs.writeFileSync('src/components/gallery/ImmersiveFeed.jsx', imm, 'utf8');
console.log('Fixed ImmersiveFeed.jsx');

// 2. Nav.jsx
let nav = fs.readFileSync('src/components/navigation/Nav.jsx', 'utf8');
nav = nav.replace('if (cardOpen) setCardOpen(false);', 'setCardOpen(false);');
nav = nav.replace("  const cardBg = C.isDark ? 'rgba(10,8,5,0.98)' : 'rgba(248,243,235,0.98)';\r\n", '')
         .replace("  const cardBg = C.isDark ? 'rgba(10,8,5,0.98)' : 'rgba(248,243,235,0.98)';\n", '');
fs.writeFileSync('src/components/navigation/Nav.jsx', nav, 'utf8');
console.log('Fixed Nav.jsx');
