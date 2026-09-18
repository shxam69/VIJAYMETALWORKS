const fs = require('fs');
const cp = require('child_process');

const raw = cp.execSync('git show HEAD:src/App.jsx', { maxBuffer: 50 * 1024 * 1024 }).toString();
const start = raw.indexOf('const Nav =');
const end = raw.indexOf('const Hero =', start);
const navCode = raw.slice(start, end).trim();

const header = `import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { LOGO_B64 } from '../../data/vmwImages';

`;

const footer = '\n\nexport default Nav;\n';

fs.writeFileSync('src/components/navigation/Nav.jsx', header + navCode + footer, 'utf8');
console.log('Nav.jsx written successfully! Size:', fs.statSync('src/components/navigation/Nav.jsx').size);
