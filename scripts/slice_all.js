const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync("src/App.jsx", "utf8");
const lines = raw.split("\n");

function getSlice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join("\n");
}

// 1. src/data/biz.js
const bizCode = `/* ---------------------------------------------------------------
   REAL BUSINESS DATA — Verified Source of Truth
--------------------------------------------------------------- */
${getSlice(92, 105)}

export const SITE_URL = 'https://vijaymetalworks.com';
export default BIZ;
`;
fs.writeFileSync("src/data/biz.js", bizCode);
console.log("Created src/data/biz.js");

// 2. src/data/vmwImages.js
const vmwCode = `/* ---------------------------------------------------------------
   REAL VMW PRODUCT IMAGES — wired to /public/gallery/
--------------------------------------------------------------- */
${getSlice(114, 147)}

${getSlice(594, 613)}

export { VMW, IMG };
export default VMW;
`;
fs.writeFileSync("src/data/vmwImages.js", vmwCode);
console.log("Created src/data/vmwImages.js");

// 3. src/data/galleryData.js
const galleryDataCode = `/* ---------------------------------------------------------------
   GALLERY DATA — 23 Curated Masterpieces
--------------------------------------------------------------- */
${getSlice(564, 592)}

export { GALLERY_IDOLS };
export default GALLERY_IDOLS;
`;
fs.writeFileSync("src/data/galleryData.js", galleryDataCode);
console.log("Created src/data/galleryData.js");

// 4. src/styles/theme.js
const themeCode = `/* ---------------------------------------------------------------
   THEME SYSTEM — Light & Dark Luxury Palettes
--------------------------------------------------------------- */
${getSlice(345, 364)}

export { THEMES };
export default THEMES;
`;
fs.writeFileSync("src/styles/theme.js", themeCode);
console.log("Created src/styles/theme.js");

// 5. src/styles/fonts.js
const fontsCode = `/* ---------------------------------------------------------------
   TYPOGRAPHY SYSTEM — Font Families
--------------------------------------------------------------- */
export const ff = {
  display: { fontFamily: "'Cinzel', Georgia, serif" },
  serif:   { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  body:    { fontFamily: "'Jost', sans-serif" },
};

export default ff;
`;
fs.writeFileSync("src/styles/fonts.js", fontsCode);
console.log("Created src/styles/fonts.js");

// 6. src/hooks/useTheme.js
const useThemeCode = `import React, { useState, useEffect, useContext, createContext } from 'react';
import { THEMES } from '../styles/theme';

export const ThemeCtx = createContext(THEMES.dark);
export const useTheme = () => useContext(ThemeCtx);

export const useThemeMode = () => {
  const [mode, setMode] = useState('auto');
  const [C, setC] = useState(THEMES.dark);

  useEffect(() => {
    const apply = (m) => {
      if (m === 'auto') {
        const d = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setC(d ? THEMES.dark : THEMES.light);
      } else {
        setC(m === 'dark' ? THEMES.dark : THEMES.light);
      }
    };
    apply(mode);

    if (mode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const h = () => apply('auto');
      mq.addEventListener('change', h);
      return () => mq.removeEventListener('change', h);
    }
  }, [mode]);

  return { mode, setMode, C };
};

export default useTheme;
`;
fs.writeFileSync("src/hooks/useTheme.js", useThemeCode);
console.log("Created src/hooks/useTheme.js");

// 7. src/hooks/useApp.js
const useAppCode = `import React, { useContext, createContext } from 'react';

export const AppCtx = createContext({});
export const useAppCtx = () => useContext(AppCtx);

export default useAppCtx;
`;
fs.writeFileSync("src/hooks/useApp.js", useAppCode);
console.log("Created src/hooks/useApp.js");

// 8. src/lib/supabase.js
const supabaseCode = `/* ---------------------------------------------------------------
   SUPABASE CLIENT & UTILITIES
--------------------------------------------------------------- */
${getSlice(153, 341)}

export {
  SUPABASE_CONFIG,
  supabaseCall,
  getCount,
  getUserState,
  setUserState,
  getCached,
  setCached,
  getCommentsForIdol,
  postCommentForIdol,
  toggleLikeForIdol,
  toggleSaveForIdol,
  recordIdolView,
};
`;
fs.writeFileSync("src/lib/supabase.js", supabaseCode);
console.log("Created src/lib/supabase.js");

// 9. src/components/common/SEOMeta.jsx
const seoCode = `import { useEffect } from 'react';
import { SITE_URL } from '../../data/biz';

${getSlice(13, 87)}

export default SEOMeta;
`;
fs.writeFileSync("src/components/common/SEOMeta.jsx", seoCode);
console.log("Created src/components/common/SEOMeta.jsx");

// 10. src/components/common/Animations.jsx
const animCode = `import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

${getSlice(638, 782)}

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
`;
fs.writeFileSync("src/components/common/Animations.jsx", animCode);
console.log("Created src/components/common/Animations.jsx");

// 11. src/components/common/Button.jsx
const btnCode = `import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { Reveal } from './Animations';

${getSlice(618, 632)}

${getSlice(787, 810)}

${getSlice(944, 1006)}

${getSlice(1011, 1027)}

export { Dot, GoldRule, StarBorderButton, CurvyButton, SectionCTA };
`;
fs.writeFileSync("src/components/common/Button.jsx", btnCode);
console.log("Created src/components/common/Button.jsx");

// 12. src/components/common/CanvasBg.jsx
const canvasCode = `import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

${getSlice(1032, 1068)}

export default CanvasBg;
`;
fs.writeFileSync("src/components/common/CanvasBg.jsx", canvasCode);
console.log("Created src/components/common/CanvasBg.jsx");

// 13. src/components/common/Grain.jsx
const grainCode = `import React from 'react';

${getSlice(1070, 1074)}

export default Grain;
`;
fs.writeFileSync("src/components/common/Grain.jsx", grainCode);
console.log("Created src/components/common/Grain.jsx");

// 14. src/components/common/ErrorBoundary.jsx
const errCode = `import React from 'react';

${getSlice(6843, 6865)}

export default ErrorBoundary;
`;
fs.writeFileSync("src/components/common/ErrorBoundary.jsx", errCode);
console.log("Created src/components/common/ErrorBoundary.jsx");

// 15. src/components/common/Loader.jsx
const loaderCode = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';

${getSlice(1134, 1398)}

export default Loader;
`;
fs.writeFileSync("src/components/common/Loader.jsx", loaderCode);
console.log("Created src/components/common/Loader.jsx");

// 16. src/components/navigation/ThemeToggle.jsx
const toggleCode = `import React from 'react';
import { useTheme } from '../../hooks/useTheme';

${getSlice(4434, 4475)}

export default ThemeToggle;
`;
fs.writeFileSync("src/components/navigation/ThemeToggle.jsx", toggleCode);
console.log("Created src/components/navigation/ThemeToggle.jsx");

// 17. src/components/navigation/WAFab.jsx
const waCode = `import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { BIZ } from '../../data/biz';

${getSlice(4359, 4393)}

export default WAFab;
`;
fs.writeFileSync("src/components/navigation/WAFab.jsx", waCode);
console.log("Created src/components/navigation/WAFab.jsx");

// 18. src/components/navigation/MobileContactBar.jsx
const mobileBarCode = `import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { BIZ } from '../../data/biz';

${getSlice(4397, 4430)}

export default MobileContactBar;
`;
fs.writeFileSync("src/components/navigation/MobileContactBar.jsx", mobileBarCode);
console.log("Created src/components/navigation/MobileContactBar.jsx");

console.log("Base common, hooks, styles, data extracted successfully.");
