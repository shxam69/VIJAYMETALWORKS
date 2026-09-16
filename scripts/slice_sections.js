const fs = require("fs");

const raw = fs.readFileSync("src/App.jsx", "utf8");
const lines = raw.split("\n");

function getSlice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join("\n");
}

// 1. src/components/navigation/Nav.jsx
const navCode = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import ThemeToggle from './ThemeToggle';

${getSlice(1402, 1835)}

export default Nav;
`;
fs.writeFileSync("src/components/navigation/Nav.jsx", navCode);
console.log("Created src/components/navigation/Nav.jsx");

// 2. src/components/hero/Hero.jsx
const heroCode = `import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { CurvyButton, StarBorderButton } from '../common/Button';
import { Reveal, FadeIn, SlideUp } from '../common/Animations';

${getSlice(1839, 1920)}

export default Hero;
`;
fs.writeFileSync("src/components/hero/Hero.jsx", heroCode);
console.log("Created src/components/hero/Hero.jsx");

// 3. src/components/heritage/Legacy.jsx
const legacyCode = `import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItemLeft, StaggerItemRight } from '../common/Animations';
import { SectionCTA } from '../common/Button';

${getSlice(1923, 2023)}

export default Legacy;
`;
fs.writeFileSync("src/components/heritage/Legacy.jsx", legacyCode);
console.log("Created src/components/heritage/Legacy.jsx");

// 4. src/components/heritage/TrustedByTemples.jsx
const trustedCode = `import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItemLeft, StaggerItemRight } from '../common/Animations';

${getSlice(2027, 2093)}

export default TrustedByTemples;
`;
fs.writeFileSync("src/components/heritage/TrustedByTemples.jsx", trustedCode);
console.log("Created src/components/heritage/TrustedByTemples.jsx");

// 5. src/components/services/Showcase.jsx (includes CraftworkPanel)
const showcaseCode = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal } from '../common/Animations';

${getSlice(1079, 1129)}

${getSlice(2221, 2263)}

export default Showcase;
`;
fs.writeFileSync("src/components/services/Showcase.jsx", showcaseCode);
console.log("Created src/components/services/Showcase.jsx");

// 6. src/components/services/RealWorkPhotos.jsx
const realWorkCode = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItemScale, StaggerItemLeft, StaggerItemRight } from '../common/Animations';
import { SectionCTA } from '../common/Button';

${getSlice(2267, 2337)}

export default RealWorkPhotos;
`;
fs.writeFileSync("src/components/services/RealWorkPhotos.jsx", realWorkCode);
console.log("Created src/components/services/RealWorkPhotos.jsx");

// 7. src/components/services/Services.jsx
const servicesCode = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { Reveal, FadeIn, SlideUp } from '../common/Animations';
import { SectionCTA } from '../common/Button';

${getSlice(2097, 2217)}

export default Services;
`;
fs.writeFileSync("src/components/services/Services.jsx", servicesCode);
console.log("Created src/components/services/Services.jsx");

// 8. src/components/process/ProcessSection.jsx
const processCode = `import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { Reveal, FadeIn, SlideUp } from '../common/Animations';
import { SectionCTA } from '../common/Button';

${getSlice(2342, 2628)}

export default ProcessSection;
`;
fs.writeFileSync("src/components/process/ProcessSection.jsx", processCode);
console.log("Created src/components/process/ProcessSection.jsx");

// 9. src/components/gallery/PremiumFilterTabs.jsx
const filterTabsCode = `import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';

${getSlice(2633, 2768)}

export default PremiumFilterTabs;
`;
fs.writeFileSync("src/components/gallery/PremiumFilterTabs.jsx", filterTabsCode);
console.log("Created src/components/gallery/PremiumFilterTabs.jsx");

// 10. src/components/footer/Testimonials.jsx
const testCode = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal, StaggerContainer, StaggerItemLeft, StaggerItemRight } from '../common/Animations';

${getSlice(3784, 3900)}

export default Testimonials;
`;
fs.writeFileSync("src/components/footer/Testimonials.jsx", testCode);
console.log("Created src/components/footer/Testimonials.jsx");

// 11. src/components/footer/FAQ.jsx
const faqCode = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal } from '../common/Animations';

${getSlice(3904, 3975)}

export default FAQ;
`;
fs.writeFileSync("src/components/footer/FAQ.jsx", faqCode);
console.log("Created src/components/footer/FAQ.jsx");

// 12. src/components/footer/Archive.jsx
const archiveCode = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { Reveal } from '../common/Animations';
import { SectionCTA } from '../common/Button';

${getSlice(3979, 4034)}

export default Archive;
`;
fs.writeFileSync("src/components/footer/Archive.jsx", archiveCode);
console.log("Created src/components/footer/Archive.jsx");

// 13. src/components/footer/Contact.jsx
const contactCode = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { Reveal, SlideLeft, SlideRight } from '../common/Animations';
import { CurvyButton } from '../common/Button';

${getSlice(4041, 4290)}

export default Contact;
`;
fs.writeFileSync("src/components/footer/Contact.jsx", contactCode);
console.log("Created src/components/footer/Contact.jsx");

// 14. src/components/footer/Footer.jsx
const footerCode = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';

${getSlice(4293, 4355)}

export default Footer;
`;
fs.writeFileSync("src/components/footer/Footer.jsx", footerCode);
console.log("Created src/components/footer/Footer.jsx");

console.log("Sections 1-14 created.");
