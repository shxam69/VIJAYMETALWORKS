const fs = require('fs');
const src = fs.readFileSync('src/components/services/Services.jsx', 'utf8');

let fixed = src;

// 1. Replace hard-coded maxWidth container with vmw-container
fixed = fixed.replace(
  `<div style={{ maxWidth: 1240, margin: '0 auto' }}>`,
  `<div className="vmw-container">`
);

// 2. Add className to the services card grid so CSS can collapse it
fixed = fixed.replace(
  `className="two-col vmw-services-card"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr',`,
  `className="vmw-services-card"
              style={{
                display: 'grid',`
).replace(
  // Remove the inline gridTemplateColumns since the class handles it
  `                gridTemplateColumns: '1fr 1.5fr',`,
  ``
);

// 3. Replace hard-coded minHeight:340 in image column with clamp
fixed = fixed.replace(
  `overflow: 'hidden', minHeight: 340 }}`,
  `overflow: 'hidden', minHeight: 'clamp(200px,30vw,340px)' }}`
);

// 4. Fix services right panel padding from 36px 40px to clamp
fixed = fixed.replace(
  `<div className="vmw-services-right" style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>`,
  `<div className="vmw-services-right" style={{ padding: 'clamp(20px,3.5vw,40px)', display: 'flex', flexDirection: 'column' }}>`
);

fs.writeFileSync('src/components/services/Services.jsx', fixed, 'utf8');
console.log('Services.jsx responsive fixes applied');
console.log('Lines with vmw-services-card:', (fixed.match(/vmw-services-card/g)||[]).length);
