const fs = require('fs');

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes(search)) {
    console.warn(`Pattern not found in ${file}:`, search);
    return;
  }
  content = content.replace(search, replace);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}

// 1. Loader.jsx
replaceInFile(
  'src/components/common/Loader.jsx',
  `import { useTheme } from '../../hooks/useTheme';\nimport { ff } from '../../styles/fonts';\n`,
  ''
);

// 2. Archive.jsx
replaceInFile(
  'src/components/footer/Archive.jsx',
  `import { Reveal, SlideLeft, SlideRight } from '../common/Animations';\nimport { SectionCTA } from '../common/Button';`,
  `import { SlideLeft, SlideRight } from '../common/Animations';`
);

// 3. Footer.jsx
replaceInFile(
  'src/components/footer/Footer.jsx',
  `import { useNavigate } from 'react-router-dom';\nimport { useTheme } from '../../hooks/useTheme';\nimport { useAppCtx } from '../../hooks/useApp';`,
  `import { useTheme } from '../../hooks/useTheme';`
);

// 4. Legacy.jsx
replaceInFile(
  'src/components/heritage/Legacy.jsx',
  `import { Reveal, SlideLeft, SlideRight } from '../common/Animations';`,
  `import { Reveal } from '../common/Animations';`
);

// 5. Hero.jsx
replaceInFile(
  'src/components/hero/Hero.jsx',
  `import { BIZ } from '../../data/biz';\n`,
  ''
);

// 6. MobileContactBar.jsx
replaceInFile(
  'src/components/navigation/MobileContactBar.jsx',
  `import { useAppCtx } from '../../hooks/useApp';\n`,
  ''
);

// 7. ThemeToggle.jsx
replaceInFile(
  'src/components/navigation/ThemeToggle.jsx',
  `import { useTheme } from '../../hooks/useTheme';\n`,
  ''
);

// 8. ProcessSection.jsx
replaceInFile(
  'src/components/process/ProcessSection.jsx',
  `import React, { useRef } from 'react';\nimport { motion, useInView } from 'framer-motion';`,
  `import React from 'react';\nimport { motion } from 'framer-motion';`
);
replaceInFile(
  'src/components/process/ProcessSection.jsx',
  `import { Reveal, FadeIn, SlideUp } from '../common/Animations';`,
  `import { Reveal } from '../common/Animations';`
);

// 9. Showcase.jsx
replaceInFile(
  'src/components/services/Showcase.jsx',
  `import { Reveal, SlideLeft, SlideRight } from '../common/Animations';`,
  `import { SlideLeft, SlideRight } from '../common/Animations';`
);
replaceInFile(
  'src/components/services/Showcase.jsx',
  `  useEffect(() => {\n    const t = setInterval(() => setActive(a => (a + 1) % PANEL_IMGS.length), 3200);\n    return () => clearInterval(t);\n  }, []);`,
  `  useEffect(() => {\n    const t = setInterval(() => setActive(a => (a + 1) % PANEL_IMGS.length), 3200);\n    return () => clearInterval(t);\n  }, [PANEL_IMGS.length]);`
);

// 10. useApp.js
replaceInFile(
  'src/hooks/useApp.js',
  `import React, { createContext, useContext, useState, useEffect } from 'react';`,
  `import { createContext, useContext, useState, useEffect } from 'react';`
);

// 11. useTheme.js
replaceInFile(
  'src/hooks/useTheme.js',
  `import React, { createContext, useContext, useState, useEffect } from 'react';`,
  `import { createContext, useContext, useState, useEffect } from 'react';`
);

// 12. ImmersiveFeed.jsx
replaceInFile(
  'src/components/gallery/ImmersiveFeed.jsx',
  `import { ff } from '../../styles/fonts';\nimport { GALLERY_IDOLS } from '../../data/galleryData';\nimport { BIZ } from '../../data/biz';\nimport {\n  supabaseCall,\n  getUserState,\n  setUserState,\n  recordIdolView,\n  logViewEvent,\n  toggleLikeForIdol,\n  toggleSaveForIdol,\n  toggleIdolLike,\n  toggleIdolSave,\n  getCommentsForIdol,\n  postCommentForIdol,\n  getIdolComments,\n  getIdolLikesCount,\n  getIdolSavesCount,\n  addIdolComment,\n} from '../../lib/supabase';`,
  `import { GALLERY_IDOLS } from '../../data/galleryData';\nimport {\n  getUserState,\n  logViewEvent,\n  toggleIdolLike,\n  toggleIdolSave,\n  getIdolComments,\n  getIdolLikesCount,\n  getIdolSavesCount,\n  addIdolComment,\n} from '../../lib/supabase';`
);
replaceInFile(
  'src/components/gallery/ImmersiveFeed.jsx',
  `  const [detailPanelExpanded, setDetailPanelExpanded] = useState(false);\n`,
  ''
);
replaceInFile(
  'src/components/gallery/ImmersiveFeed.jsx',
  `  }, [liked, userId]); // stable deps — no filteredIdols reference`,
  `  }, [liked, userId, handleInteraction]); // stable deps`
);
replaceInFile(
  'src/components/gallery/ImmersiveFeed.jsx',
  `  }, [saved, userId]); // stable deps — no filteredIdols reference`,
  `  }, [saved, userId, handleInteraction]); // stable deps`
);

console.log('All warning cleanup complete!');
