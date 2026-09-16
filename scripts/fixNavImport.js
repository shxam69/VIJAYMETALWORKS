const fs = require('fs');
let c = fs.readFileSync('src/components/navigation/Nav.jsx', 'utf8');
c = c.replace(
  "import { LOGO_B64 } from '../../data/vmwImages';",
  "import { LOGO_B64 } from '../../data/vmwImages';\nimport { GoldRule } from '../common/Button';"
);
fs.writeFileSync('src/components/navigation/Nav.jsx', c, 'utf8');
console.log('Added GoldRule import to Nav.jsx');
