const fs = require("fs");

const raw = fs.readFileSync("src/App.jsx", "utf8");
const lines = raw.split("\n");

function getSlice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join("\n");
}

// 1. src/components/gallery/GalleryPreview.jsx
const previewCode = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { GALLERY_IDOLS } from '../../data/galleryData';
import { Reveal } from '../common/Animations';
import { CurvyButton, StarBorderButton } from '../common/Button';

${getSlice(4479, 4582)}

export default GalleryPreview;
`;
fs.writeFileSync("src/components/gallery/GalleryPreview.jsx", previewCode);
console.log("Created src/components/gallery/GalleryPreview.jsx");

// 2. src/components/gallery/Gallery.jsx
const galleryCode = `import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { GALLERY_IDOLS } from '../../data/galleryData';
import {
  supabaseCall,
  getCount,
  getUserState,
  setUserState,
  recordIdolView,
  toggleLikeForIdol,
  toggleSaveForIdol,
  getCommentsForIdol,
  postCommentForIdol,
} from '../../lib/supabase';
import PremiumFilterTabs from './PremiumFilterTabs';
import { CurvyButton, StarBorderButton } from '../common/Button';
import { Reveal } from '../common/Animations';

${getSlice(2772, 3780)}

export default Gallery;
`;
fs.writeFileSync("src/components/gallery/Gallery.jsx", galleryCode);
console.log("Created src/components/gallery/Gallery.jsx");

// 3. src/components/gallery/ImmersiveFeed.jsx
const feedCode = `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { GALLERY_IDOLS } from '../../data/galleryData';
import { BIZ } from '../../data/biz';
import {
  supabaseCall,
  getUserState,
  setUserState,
  recordIdolView,
  toggleLikeForIdol,
  toggleSaveForIdol,
  getCommentsForIdol,
  postCommentForIdol,
} from '../../lib/supabase';
import ProfileModal from '../auth/ProfileModal';

${getSlice(4616, 5675)}

export default ImmersiveFeed;
`;
fs.writeFileSync("src/components/gallery/ImmersiveFeed.jsx", feedCode);
console.log("Created src/components/gallery/ImmersiveFeed.jsx");

// 4. src/components/auth/ProfileModal.jsx
const profileCode = `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { GALLERY_IDOLS } from '../../data/galleryData';
import { getUserState } from '../../lib/supabase';

${getSlice(5693, 5798)}

export default ProfileModal;
`;
fs.writeFileSync("src/components/auth/ProfileModal.jsx", profileCode);
console.log("Created src/components/auth/ProfileModal.jsx");

// 5. src/components/commission/CommissionModal.jsx
const commCode = `import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';

${getSlice(5802, 5990)}

export default CommissionModal;
`;
fs.writeFileSync("src/components/commission/CommissionModal.jsx", commCode);
console.log("Created src/components/commission/CommissionModal.jsx");

// 6. src/components/auth/AuthModal.jsx
const authCode = `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';

${getSlice(5994, 6111)}

export default AuthModal;
`;
fs.writeFileSync("src/components/auth/AuthModal.jsx", authCode);
console.log("Created src/components/auth/AuthModal.jsx");

// 7. src/components/admin/AdminLogin.jsx
const adminLoginCode = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';

${getSlice(6112, 6180)}

export default AdminLogin;
`;
fs.writeFileSync("src/components/admin/AdminLogin.jsx", adminLoginCode);
console.log("Created src/components/admin/AdminLogin.jsx");

// 8. src/components/admin/AdminGalleryManager.jsx
const adminGalleryCode = `import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';

${getSlice(6189, 6527)}

export default AdminGalleryManager;
`;
fs.writeFileSync("src/components/admin/AdminGalleryManager.jsx", adminGalleryCode);
console.log("Created src/components/admin/AdminGalleryManager.jsx");

// 9. src/components/admin/AdminDashboard.jsx
const adminDashCode = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import AdminGalleryManager from './AdminGalleryManager';

${getSlice(6528, 6711)}

export default AdminDashboard;
`;
fs.writeFileSync("src/components/admin/AdminDashboard.jsx", adminDashCode);
console.log("Created src/components/admin/AdminDashboard.jsx");

// 10. src/pages/HomePage.jsx
const homeCode = `import React from 'react';
import Hero from '../components/hero/Hero';
import Legacy from '../components/heritage/Legacy';
import TrustedByTemples from '../components/heritage/TrustedByTemples';
import Services from '../components/services/Services';
import Showcase from '../components/services/Showcase';
import RealWorkPhotos from '../components/services/RealWorkPhotos';
import ProcessSection from '../components/process/ProcessSection';
import GalleryPreview from '../components/gallery/GalleryPreview';
import Testimonials from '../components/footer/Testimonials';
import FAQ from '../components/footer/FAQ';
import Archive from '../components/footer/Archive';
import Contact from '../components/footer/Contact';
import Footer from '../components/footer/Footer';
import Nav from '../components/navigation/Nav';
import MobileContactBar from '../components/navigation/MobileContactBar';
import WAFab from '../components/navigation/WAFab';

${getSlice(4586, 4612)}

export default HomePage;
`;
fs.writeFileSync("src/pages/HomePage.jsx", homeCode);
console.log("Created src/pages/HomePage.jsx");

// 11. src/pages/GalleryPage.jsx
const galleryPageCode = `import React from 'react';
import Gallery from '../components/gallery/Gallery';
import Footer from '../components/footer/Footer';
import Nav from '../components/navigation/Nav';
import MobileContactBar from '../components/navigation/MobileContactBar';
import WAFab from '../components/navigation/WAFab';

${getSlice(5676, 5689)}

export default GalleryPage;
`;
fs.writeFileSync("src/pages/GalleryPage.jsx", galleryPageCode);
console.log("Created src/pages/GalleryPage.jsx");

console.log("All components & pages extracted successfully.");
