const fs = require('fs');

function replaceInFile(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  const normalized = content.replace(/\r\n/g, '\n');
  const searchNormalized = search.replace(/\r\n/g, '\n');
  if (!normalized.includes(searchNormalized)) {
    console.warn(`Pattern not found in ${file}:`, search);
    return;
  }
  const updated = normalized.replace(searchNormalized, replace.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, updated, 'utf8');
  console.log(`Updated ${file}`);
}

replaceInFile(
  'src/components/services/Showcase.jsx',
  `  useEffect(() => {\n    const t = setInterval(() => setActive(a => (a + 1) % PANEL_IMGS.length), 3200);\n    return () => clearInterval(t);\n  }, []);`,
  `  useEffect(() => {\n    const t = setInterval(() => setActive(a => (a + 1) % PANEL_IMGS.length), 3200);\n    return () => clearInterval(t);\n  }, [PANEL_IMGS.length]);`
);

replaceInFile(
  'src/hooks/useApp.js',
  `import React, { useContext, createContext } from 'react';`,
  `import { useContext, createContext } from 'react';`
);

replaceInFile(
  'src/hooks/useTheme.js',
  `import React, { useState, useEffect, useContext, createContext } from 'react';`,
  `import { useState, useEffect, useContext, createContext } from 'react';`
);
