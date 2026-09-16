const fs = require("fs");

const raw = fs.readFileSync("archive/src_App (13).jsx", "utf8");
const lines = raw.split("\n");

function getSlice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join("\n");
}

const contactCode = `import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppCtx } from '../../hooks/useApp';
import { ff } from '../../styles/fonts';
import { BIZ } from '../../data/biz';
import { SlideUp } from '../common/Animations';

${getSlice(3907, 4157)}

export default Contact;
`;

fs.writeFileSync("src/components/footer/Contact.jsx", contactCode);
console.log("Contact.jsx rewritten with 3907 start.");
